'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  Truck,
  Store,
  CreditCard,
  CheckCircle,
  Search,
  X,
} from 'lucide-react'
import type { Product } from '@/payload-types'
import { productSlug } from '@/lib/productSlug'
import { PICKUP_ORDER_ADDRESS } from '@/lib/deliveryMode'
import { NIGERIAN_STATES, postcodeForState } from '@/lib/nigeria'
import { getLgasForState } from '@/lib/nigeria-lgas'
import type { ProductTaxonomy } from '@/lib/productTaxonomy'

type CartItem = {
  id: number
  name: string
  size: string
  price: number
  stock: number
  quantity: number
  description?: string
}

type Step = 'cart' | 'shipping' | 'payment' | 'confirmation'

type DeliveryMode = 'delivery' | 'pickup'

const DEFAULT_FEE = 1500
const DEFAULT_ZONE = 'Standard'

function productTagIds(product: Product): (number | string)[] {
  if (!product.tags?.length) return []
  return product.tags.map((tag) => (typeof tag === 'object' && tag ? tag.id : tag))
}

export function OrderCheckout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q')?.trim() ?? ''
  const initialCategory = searchParams.get('category')?.trim() || 'all'
  const initialSize = searchParams.get('size')?.trim() || 'all'
  const initialTag = searchParams.get('tag')?.trim() || 'all'

  const [products, setProducts] = useState<Product[]>([])
  const [productQuery, setProductQuery] = useState(initialQuery)
  const [categoryFilter, setCategoryFilter] = useState(initialCategory)
  const [sizeFilter, setSizeFilter] = useState(initialSize)
  const [tagFilter, setTagFilter] = useState(initialTag)
  const [taxonomy, setTaxonomy] = useState<ProductTaxonomy>({
    categories: [],
    sizes: [],
    tags: [],
  })
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<Step>('cart')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery')
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    state: '',
    lga: '',
    city: '',
    postalCode: '',
  })
  const [shippingFee, setShippingFee] = useState<number>(DEFAULT_FEE)
  const [shippingZone, setShippingZone] = useState<string>(DEFAULT_ZONE)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/products?limit=200&depth=1')
      .then((r) => r.json())
      .then((data: { docs?: Product[] }) => setProducts(data.docs ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))

    void fetch('/api/product-taxonomy')
      .then((r) => r.json())
      .then((data: ProductTaxonomy) => {
        setTaxonomy({
          categories: data.categories ?? [],
          sizes: data.sizes ?? [],
          tags: data.tags ?? [],
        })
        const map: Record<string, string> = {}
        for (const cat of data.categories ?? []) map[cat.slug] = cat.label
        setCategoryLabels(map)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    setProductQuery(initialQuery)
    setCategoryFilter(initialCategory)
    setSizeFilter(initialSize)
    setTagFilter(initialTag)
  }, [initialQuery, initialCategory, initialSize, initialTag])

  const sizeOptions = useMemo(() => {
    const sizes =
      categoryFilter === 'all'
        ? taxonomy.sizes
        : taxonomy.sizes.filter((s) => s.categorySlug === categoryFilter)
    return ['all', ...Array.from(new Set(sizes.map((s) => s.label)))]
  }, [taxonomy.sizes, categoryFilter])

  const activeTagOptions = useMemo(() => taxonomy.tags, [taxonomy.tags])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    return products.filter((product) => {
      if (categoryFilter !== 'all' && product.category !== categoryFilter) return false
      if (sizeFilter !== 'all' && product.size !== sizeFilter) return false
      if (tagFilter !== 'all') {
        const ids = productTagIds(product).map(String)
        const tag = taxonomy.tags.find((t) => t.slug === tagFilter || String(t.id) === tagFilter)
        if (!tag || !ids.includes(String(tag.id))) return false
      }
      if (!q) return true
      const categoryLabel = categoryLabels[product.category ?? ''] ?? product.category ?? ''
      const tagLabels = productTagIds(product)
        .map((id) => taxonomy.tags.find((t) => String(t.id) === String(id))?.label)
        .filter(Boolean)
      const haystack = [
        product.name,
        product.size,
        product.description,
        product.category,
        categoryLabel,
        ...tagLabels,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [products, productQuery, categoryLabels, categoryFilter, sizeFilter, tagFilter, taxonomy.tags])

  const groupedProducts = useMemo(() => {
    const groups = taxonomy.categories.length
      ? taxonomy.categories.map((cat) => ({
          slug: cat.slug,
          label: cat.label,
          items: filteredProducts.filter((p) => p.category === cat.slug),
        }))
      : Object.entries(
          filteredProducts.reduce<Record<string, Product[]>>((acc, product) => {
            const slug = product.category ?? 'other'
            if (!acc[slug]) acc[slug] = []
            acc[slug].push(product)
            return acc
          }, {}),
        ).map(([slug, items]) => ({
          slug,
          label: categoryLabels[slug] ?? slug,
          items,
        }))

    if (categoryFilter !== 'all') {
      return groups.filter((g) => g.slug === categoryFilter)
    }
    return groups.filter((g) => g.items.length > 0)
  }, [filteredProducts, taxonomy.categories, categoryFilter, categoryLabels])

  const hasActiveFilters =
    categoryFilter !== 'all' || sizeFilter !== 'all' || tagFilter !== 'all' || productQuery.trim() !== ''

  function updateOrderFilters(next: {
    q?: string
    category?: string
    size?: string
    tag?: string
  }) {
    const params = new URLSearchParams(searchParams.toString())
    const setOrDelete = (key: string, value: string | undefined, defaultValue = 'all') => {
      if (!value || value === defaultValue) params.delete(key)
      else params.set(key, value)
    }
    if (next.q !== undefined) setOrDelete('q', next.q.trim() || undefined, '')
    if (next.category !== undefined) setOrDelete('category', next.category)
    if (next.size !== undefined) setOrDelete('size', next.size)
    if (next.tag !== undefined) setOrDelete('tag', next.tag)
    const qs = params.toString()
    router.replace(qs ? `/order?${qs}` : '/order', { scroll: false })
  }

  function clearFilters() {
    setProductQuery('')
    setCategoryFilter('all')
    setSizeFilter('all')
    setTagFilter('all')
    router.replace('/order', { scroll: false })
  }

  function handleCategoryChange(slug: string) {
    setCategoryFilter(slug)
    if (slug !== 'all' && sizeFilter !== 'all') {
      const valid = taxonomy.sizes.some(
        (s) => s.categorySlug === slug && s.label === sizeFilter,
      )
      if (!valid) {
        setSizeFilter('all')
        updateOrderFilters({ category: slug, size: 'all' })
        return
      }
    }
    updateOrderFilters({ category: slug })
  }

  const shippingDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lgaOptions = useMemo(() => getLgasForState(shippingInfo.state), [shippingInfo.state])

  useEffect(() => {
    if (deliveryMode === 'pickup') {
      setShippingFee(0)
      setShippingZone('Pickup')
      setCalculatingShipping(false)
      if (shippingDebounce.current) {
        clearTimeout(shippingDebounce.current)
        shippingDebounce.current = null
      }
      return
    }
    void requestShippingQuote(shippingInfo.state, shippingInfo.city, shippingInfo.lga)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-quote when switching back to delivery
  }, [deliveryMode])

  async function requestShippingQuote(state: string, city: string, lga: string) {
    if (!state && !city && !lga) return
    setCalculatingShipping(true)
    try {
      const res = await fetch('/api/shipping-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, city, lga }),
      })
      if (res.ok) {
        const data = (await res.json()) as { fee?: number; zone?: string }
        if (typeof data.fee === 'number') setShippingFee(data.fee)
        if (data.zone) setShippingZone(data.zone)
      }
    } catch {
      // keep previous values on network error
    } finally {
      setCalculatingShipping(false)
    }
  }

  function updateShipping(field: keyof typeof shippingInfo, value: string) {
    setShippingInfo((prev) => {
      const next = { ...prev, [field]: value }

      // When the state changes, auto-fill the postal code from the NIPOST table.
      // We only overwrite if the existing postal code was empty OR matches the
      // previous state's default — so manual edits aren't blown away.
      if (field === 'state') {
        const newDefault = postcodeForState(value) ?? ''
        const oldDefault = postcodeForState(prev.state) ?? ''
        if (!prev.postalCode || prev.postalCode === oldDefault) {
          next.postalCode = newDefault
        }
        next.lga = ''
      }

      if (field === 'state' || field === 'city' || field === 'lga') {
        if (shippingDebounce.current) clearTimeout(shippingDebounce.current)
        shippingDebounce.current = setTimeout(() => {
          void requestShippingQuote(next.state, next.city, next.lga)
        }, 350)
      }
      return next
    })
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )
  const total = subtotal + (subtotal > 0 ? shippingFee : 0)

  function addToCart(p: Product) {
    setError('')
    const numericId = Number(p.id)
    setCart((prev) => {
      const existing = prev.find((c) => c.id === numericId)
      if (existing) {
        return prev.map((c) =>
          c.id === numericId
            ? { ...c, quantity: Math.min(c.quantity + 1, c.stock || c.quantity + 1) }
            : c,
        )
      }
      return [
        ...prev,
        {
          id: numericId,
          name: p.name,
          size: p.size || '',
          price: p.price ?? 0,
          stock: p.stock ?? 9999,
          quantity: 1,
          description: p.description || '',
        },
      ]
    })
  }

  function adjustQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item
          const next = Math.max(0, Math.min(item.quantity + delta, item.stock || item.quantity + delta))
          return { ...item, quantity: next }
        })
        .filter((item) => item.quantity > 0),
    )
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleNext() {
    setError('')
    if (step === 'cart') {
      if (cart.length === 0) {
        setError('Add at least one product to your cart.')
        return
      }
      setStep('shipping')
      return
    }
    if (step === 'shipping') {
      const contact: Array<keyof typeof shippingInfo> = ['fullName', 'phone', 'email']
      for (const k of contact) {
        if (!shippingInfo[k].trim()) {
          setError('Please enter your name, phone, and email.')
          return
        }
      }
      if (deliveryMode === 'delivery') {
        const required: Array<keyof typeof shippingInfo> = [
          'address',
          'state',
          'lga',
          'city',
        ]
        for (const k of required) {
          if (!shippingInfo[k].trim()) {
            setError('Please complete all delivery address fields.')
            return
          }
        }
      }
      setStep('payment')
      return
    }
    if (step === 'payment') {
      setPaying(true)
      try {
        const items = cart.map((c) => ({ productId: c.id, quantity: c.quantity }))
        const res = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            deliveryMode,
            shipping: {
              fullName: shippingInfo.fullName,
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address:
                deliveryMode === 'pickup' ? PICKUP_ORDER_ADDRESS : shippingInfo.address,
              state: deliveryMode === 'pickup' ? '' : shippingInfo.state,
              lga: deliveryMode === 'pickup' ? '' : shippingInfo.lga,
              city: deliveryMode === 'pickup' ? '' : shippingInfo.city,
              postalCode: deliveryMode === 'pickup' ? '' : shippingInfo.postalCode,
            },
          }),
        })
        const data = (await res.json()) as { authorizationUrl?: string; error?: string }
        if (!res.ok) throw new Error(data.error || 'Could not start checkout.')
        if (!data.authorizationUrl) throw new Error('Missing Paystack URL.')
        window.location.href = data.authorizationUrl
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Checkout failed.')
      } finally {
        setPaying(false)
      }
    }
  }

  function handleBack() {
    if (step === 'shipping') setStep('cart')
    else if (step === 'payment') setStep('shipping')
  }

  if (step === 'confirmation') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl text-[#1a1f71] mb-4">Order Confirmed!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your order. We&apos;ll deliver your water soon!
          </p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {step === 'cart' && (
          <>
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl text-[#1a1f71]">Available Products</h2>
                <div className="relative w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={productQuery}
                    onChange={(e) => {
                      setProductQuery(e.target.value)
                      updateOrderFilters({ q: e.target.value })
                    }}
                    placeholder="Search products…"
                    className="w-full rounded-full border-2 border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#2563eb] focus:outline-none"
                    aria-label="Search products"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-700">Filter products</p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 text-sm text-[#2563eb] hover:underline"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear filters
                    </button>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('all')}
                      className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                        categoryFilter === 'all'
                          ? 'bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white'
                          : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#2563eb]'
                      }`}
                    >
                      All
                    </button>
                    {taxonomy.categories.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                          categoryFilter === cat.slug
                            ? 'bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white'
                            : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#2563eb]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {sizeOptions.length > 1 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSizeFilter(size)
                            updateOrderFilters({ size })
                          }}
                          className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                            sizeFilter === size
                              ? 'bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white'
                              : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#2563eb]'
                          }`}
                        >
                          {size === 'all' ? 'All sizes' : size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTagOptions.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTagFilter('all')
                          updateOrderFilters({ tag: 'all' })
                        }}
                        className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                          tagFilter === 'all'
                            ? 'bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white'
                            : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#2563eb]'
                        }`}
                      >
                        All tags
                      </button>
                      {activeTagOptions.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setTagFilter(tag.slug)
                            updateOrderFilters({ tag: tag.slug })
                          }}
                          className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                            tagFilter === tag.slug
                              ? 'bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white'
                              : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#2563eb]'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {loadingProducts ? (
              <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
                Loading products…
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
                {hasActiveFilters
                  ? 'No products match your filters. Try adjusting category, size, tags, or search.'
                  : 'No products available right now. Please check back later.'}
              </div>
            ) : (
              <div className="space-y-10">
                {groupedProducts.map((group) => (
                  <section key={group.slug}>
                    {categoryFilter === 'all' && (
                      <h3 className="mb-4 text-lg font-semibold text-[#1a1f71]">{group.label}</h3>
                    )}
                    <div className="grid sm:grid-cols-2 gap-6">
                      {group.items.map((product) => (
                        <div
                          key={product.id}
                          id={productSlug(product.name, product.size)}
                          className="scroll-mt-32 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                          <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                            <Package className="w-20 h-20 text-[#2563eb]" />
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl text-[#1a1f71] mb-2">{product.name}</h3>
                            <div className="text-lg text-[#2563eb] mb-2">{product.size}</div>
                            {product.description && (
                              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-2xl text-[#1a1f71]">
                                ₦{(product.price ?? 0).toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                className="bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white px-6 py-2 rounded-full hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add
                              </button>
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
                              Stock: {(product.stock ?? 0).toLocaleString()} units
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        {step === 'shipping' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl text-[#1a1f71] mb-2">How would you like your order?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Choose home delivery or free factory pickup—then add your contact details below.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 mb-8">
              <button
                type="button"
                onClick={() => setDeliveryMode('delivery')}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                  deliveryMode === 'delivery'
                    ? 'border-[#2563eb] bg-blue-50/80 shadow-md'
                    : 'border-gray-200 hover:border-blue-200 bg-white'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    deliveryMode === 'delivery'
                      ? 'bg-gradient-to-br from-[#1a1f71] to-[#2563eb] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Truck className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <div className="font-semibold text-[#1a1f71]">Deliver to me</div>
                  <p className="mt-1 text-xs text-gray-600 leading-snug">
                    We ship to your address. Fee depends on your state and area.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('pickup')}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                  deliveryMode === 'pickup'
                    ? 'border-[#2563eb] bg-blue-50/80 shadow-md'
                    : 'border-gray-200 hover:border-blue-200 bg-white'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    deliveryMode === 'pickup'
                      ? 'bg-gradient-to-br from-[#1a1f71] to-[#2563eb] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Store className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <div className="font-semibold text-[#1a1f71]">Pickup</div>
                  <p className="mt-1 text-xs text-gray-600 leading-snug">
                    Collect at our facility—no delivery fee. Pickup details are sent after payment.
                  </p>
                </div>
              </button>
            </div>

            {deliveryMode === 'pickup' && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
                <span className="font-semibold">₦0 delivery.</span>{' '}
                Bring a valid ID and your order reference when you collect. Our team will confirm
                your slot by phone or email.
              </div>
            )}

            <h3 className="text-lg font-semibold text-[#1a1f71] mb-4">Your details</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={shippingInfo.fullName}
                onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                />
              </div>
              {deliveryMode === 'delivery' && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
                      <select
                        aria-label="State"
                        value={shippingInfo.state}
                        onChange={(e) => updateShipping('state', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none bg-white ${
                          shippingInfo.state ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="">Select state</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s.name} value={s.name} className="text-gray-900">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Local Government Area (LGA) *
                      </label>
                      {shippingInfo.state && lgaOptions.length === 0 ? (
                        <input
                          type="text"
                          aria-label="LGA"
                          placeholder="Type your LGA"
                          value={shippingInfo.lga}
                          onChange={(e) => updateShipping('lga', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                        />
                      ) : (
                        <select
                          aria-label="LGA"
                          value={shippingInfo.lga}
                          onChange={(e) => updateShipping('lga', e.target.value)}
                          disabled={!shippingInfo.state}
                          className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 ${
                            shippingInfo.lga ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          <option value="">Select LGA</option>
                          {lgaOptions.map((lga) => (
                            <option key={lga} value={lga} className="text-gray-900">
                              {lga}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      City / area / landmark *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wuse 2, Garki, Lekki Phase 1"
                      value={shippingInfo.city}
                      onChange={(e) => updateShipping('city', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Street address *
                    </label>
                    <textarea
                      placeholder="House or flat number, street name, estate or building name"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, address: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Postal code (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-filled from state when empty"
                      value={shippingInfo.postalCode}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                      }
                      className="w-full max-w-xs px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] focus:outline-none"
                    />
                  </div>
                  {calculatingShipping && (
                    <div className="text-sm text-[#2563eb] flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
                      Calculating shipping fee…
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl text-[#1a1f71] mb-6">Payment Method</h2>
            <div className="border-2 border-[#2563eb] rounded-xl p-6 bg-blue-50">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-[#2563eb]" />
                <h3 className="text-xl text-[#1a1f71]">Pay securely with Paystack</h3>
              </div>
              <p className="text-gray-600">
                You will be redirected to Paystack to complete your payment with card, bank
                transfer, or USSD. Once confirmed, your order will be processed
                {deliveryMode === 'pickup'
                  ? ' and you will receive pickup instructions.'
                  : ' and delivered to your address.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-[#2563eb]" />
            <h2 className="text-2xl text-[#1a1f71]">Your Cart</h2>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-[#1a1f71]">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustQty(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => adjustQty(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[#1a1f71]">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div>
                    <div>{deliveryMode === 'pickup' ? 'Pickup' : 'Shipping'}</div>
                    <div className="text-xs text-gray-500">
                      {deliveryMode === 'pickup'
                        ? 'Factory pickup — no fee'
                        : `${shippingZone} delivery`}
                    </div>
                  </div>
                  <span>₦{(subtotal > 0 ? shippingFee : 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl text-[#1a1f71] pt-2 border-t-2">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={paying}
                className="w-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white py-3 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {step === 'cart' && (
                  <>
                    <Truck className="w-5 h-5" />
                    Continue to details
                  </>
                )}
                {step === 'shipping' && (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </>
                )}
                {step === 'payment' && (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {paying ? 'Redirecting…' : 'Pay with Paystack'}
                  </>
                )}
              </button>

              {step !== 'cart' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full mt-3 border-2 border-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
