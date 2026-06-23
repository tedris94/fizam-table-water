'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Package, Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { DashboardLayout } from './DashboardLayout'
import type { ProductTaxonomy } from '@/lib/productTaxonomy'
import { PRODUCT_CATEGORIES, categoryLabel, sizesForCategory } from '@/lib/productCategories'
import { useAuth } from '@/contexts/AuthContext'

type Product = {
  id: number | string
  category: string
  name: string
  size: string
  price: number
  description?: string
  stock: number
  tagIds?: (number | string)[]
}

type FormState = {
  category: string
  name: string
  size: string
  price: number
  description: string
  stock: number
  tagIds: (number | string)[]
}

const FALLBACK_TAXONOMY: ProductTaxonomy = {
  categories: PRODUCT_CATEGORIES.map((c, i) => ({
    id: c.value,
    slug: c.value,
    label: c.label,
    sortOrder: (i + 1) * 10,
    isActive: true,
  })),
  sizes: PRODUCT_CATEGORIES.flatMap((c, ci) =>
    c.sizes.map((label, si) => ({
      id: `${c.value}-${label}`,
      label,
      categorySlug: c.value,
      sortOrder: ci * 10 + si,
      isActive: true,
    })),
  ),
  tags: [],
}

interface ProductsViewProps {
  role: string
}

export function ProductsView({ role }: ProductsViewProps) {
  const { hasCap } = useAuth()
  const [taxonomy, setTaxonomy] = useState<ProductTaxonomy>(FALLBACK_TAXONOMY)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<FormState>({
    category: 'table_water',
    name: categoryLabel('table_water'),
    size: '35cl',
    price: 0,
    description: '',
    stock: 0,
    tagIds: [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  const canDelete = hasCap('products.delete')

  function labelForCategory(slug: string) {
    return taxonomy.categories.find((c) => c.slug === slug)?.label ?? categoryLabel(slug as never) ?? slug
  }

  function sizesFor(slug: string) {
    const fromTaxonomy = taxonomy.sizes
      .filter((s) => s.categorySlug === slug)
      .map((s) => s.label)
    if (fromTaxonomy.length > 0) return fromTaxonomy
    return [...sizesForCategory(slug as never)]
  }

  function emptyForm(category = taxonomy.categories[0]?.slug ?? 'table_water'): FormState {
    const sizes = sizesFor(category)
    return {
      category,
      name: labelForCategory(category),
      size: sizes[0] ?? '',
      price: 0,
      description: '',
      stock: 0,
      tagIds: [],
    }
  }

  function normalizeProduct(raw: Product): Product {
    return {
      ...raw,
      price: Number(raw.price) || 0,
      stock: Number(raw.stock) || 0,
      tagIds: raw.tagIds ?? [],
    }
  }

  useEffect(() => {
    void Promise.all([fetchTaxonomy(), fetchProducts()])
  }, [])

  async function fetchTaxonomy() {
    try {
      const res = await fetch('/api/product-taxonomy', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as ProductTaxonomy
      if (data.categories?.length) setTaxonomy(data)
    } catch {
      // keep fallback
    }
  }

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Could not load products.')
      const data = (await res.json()) as Product[]
      setProducts(data.map(normalizeProduct))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  function handleCategoryChange(category: string) {
    const sizes = sizesFor(category)
    setFormData((prev) => ({
      ...prev,
      category,
      name: labelForCategory(category),
      size: sizes.includes(prev.size) ? prev.size : sizes[0] ?? '',
    }))
  }

  function toggleTag(tagId: number | string) {
    setFormData((prev) => {
      const exists = prev.tagIds.some((id) => String(id) === String(tagId))
      return {
        ...prev,
        tagIds: exists
          ? prev.tagIds.filter((id) => String(id) !== String(tagId))
          : [...prev.tagIds, tagId],
      }
    })
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setModalError(null)
    setFormData({
      category: product.category ?? taxonomy.categories[0]?.slug ?? 'table_water',
      name: product.name,
      size: product.size,
      price: product.price,
      description: product.description ?? '',
      stock: product.stock,
      tagIds: product.tagIds ?? [],
    })
    setShowModal(true)
  }

  function handleAddNew() {
    setEditingProduct(null)
    setModalError(null)
    setFormData(emptyForm())
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    setModalError(null)
    try {
      const payload = {
        category: formData.category,
        name: formData.name.trim() || labelForCategory(formData.category),
        size: formData.size,
        price: Number(formData.price) || 0,
        description: formData.description,
        stock: Number(formData.stock) || 0,
        tagIds: formData.tagIds,
      }
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to save product.')
      }
      const saved = normalizeProduct((await res.json()) as Product)
      setProducts((prev) =>
        editingProduct
          ? prev.map((p) => (String(p.id) === String(saved.id) ? saved : p))
          : [...prev, saved],
      )
      setShowModal(false)
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete ${product.name} (${product.size})?`)) return
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Failed to delete product.')
      }
      await fetchProducts()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete product.')
    }
  }

  const grouped = taxonomy.categories.map((cat) => ({
    ...cat,
    items: products.filter((p) => p.category === cat.slug),
  }))

  return (
    <DashboardLayout title="Products Management" role={role}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Product Catalog</h2>
            <p className="text-gray-600">
              Manage products, categories, sizes, and tags from the Products menu.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link href="/dashboard/products/categories" className="text-[#2563eb] hover:underline">
                Categories
              </Link>
              <span className="text-gray-300">·</span>
              <Link href="/dashboard/products/sizes" className="text-[#2563eb] hover:underline">
                Sizes
              </Link>
              <span className="text-gray-300">·</span>
              <Link href="/dashboard/products/tags" className="text-[#2563eb] hover:underline">
                Tags
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">
            No products yet. Click <span className="font-semibold">Add Product</span> to create one.
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(
              (group) =>
                group.items.length > 0 && (
                  <section key={group.slug}>
                    <h3 className="text-lg font-semibold text-[#1a1f71] mb-4">{group.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.items.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                          <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <Package className="w-16 h-16 text-[#2563eb]" />
                          </div>
                          <div className="p-6">
                            <h4 className="text-xl text-[#1a1f71] mb-1">{product.name}</h4>
                            <div className="text-sm text-gray-600 mb-2">{product.size}</div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-2xl text-[#2563eb]">
                                ₦{Number(product.price).toLocaleString()}
                              </div>
                              <div
                                className={`text-sm px-3 py-1 rounded-full ${
                                  product.stock > 100
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {product.stock} in stock
                              </div>
                            </div>
                            {product.description && (
                              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(product)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(product)}
                                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  aria-label={`Delete ${product.name} ${product.size}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ),
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-6 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl text-[#1a1f71]">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {modalError && (
                <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm text-gray-700">Category *</label>
                  <Link
                    href="/dashboard/products/categories"
                    className="text-xs text-[#2563eb] hover:underline"
                  >
                    Manage categories
                  </Link>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                >
                  {taxonomy.categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm text-gray-700">Size *</label>
                  <Link
                    href="/dashboard/products/sizes"
                    className="text-xs text-[#2563eb] hover:underline"
                  >
                    Manage sizes
                  </Link>
                </div>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                >
                  {sizesFor(formData.category).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {taxonomy.tags.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm text-gray-700">Tags</label>
                    <Link
                      href="/dashboard/products/tags"
                      className="text-xs text-[#2563eb] hover:underline"
                    >
                      Manage tags
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {taxonomy.tags.map((tag) => {
                      const selected = formData.tagIds.some(
                        (id) => String(id) === String(tag.id),
                      )
                      return (
                        <button
                          key={String(tag.id)}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full px-3 py-1 text-sm transition-colors ${
                            selected
                              ? 'bg-[#2563eb] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 mb-2">Display name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Price (₦) *</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-4 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || formData.price < 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
