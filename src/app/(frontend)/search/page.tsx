'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Briefcase, FileText, Layers, Package, Users } from 'lucide-react'
import { SiteSearch } from '@/components/frontend/SiteSearch'
import { productSlug } from '@/lib/productSlug'

type SearchProduct = {
  id: number | string
  name: string
  size: string
  price: number
  description?: string
  categoryLabel?: string
}

type SearchContent = {
  id: string
  title: string
  href: string
  excerpt?: string
  type: 'page' | 'section' | 'career' | 'team'
}

const CONTENT_ICONS = {
  page: FileText,
  section: Layers,
  career: Briefcase,
  team: Users,
} as const

const CONTENT_LABELS = {
  page: 'Pages',
  section: 'Sections',
  career: 'Careers',
  team: 'Team',
} as const

function SearchResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')?.trim() ?? ''
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [content, setContent] = useState<SearchContent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q || q.length < 2) {
      setProducts([])
      setContent([])
      return
    }
    setLoading(true)
    void fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data: { products?: SearchProduct[]; content?: SearchContent[] }) => {
        setProducts(data.products ?? [])
        setContent(data.content ?? [])
      })
      .catch(() => {
        setProducts([])
        setContent([])
      })
      .finally(() => setLoading(false))
  }, [q])

  if (!q) {
    return (
      <p className="text-gray-600">
        Enter at least 2 characters to search products, pages, sections, careers, and team profiles.
      </p>
    )
  }

  if (loading) {
    return <p className="text-gray-500">Searching…</p>
  }

  if (products.length === 0 && content.length === 0) {
    return (
      <p className="text-gray-600">
        No results for <span className="font-semibold">&ldquo;{q}&rdquo;</span>. Try a different
        term or{' '}
        <Link href="/order" className="text-[#2563eb] hover:underline">
          browse all products
        </Link>
        .
      </p>
    )
  }

  const contentByType = (['page', 'section', 'career', 'team'] as const).map((type) => ({
    type,
    items: content.filter((item) => item.type === type),
  }))

  return (
    <div className="space-y-10">
      {products.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1f71]">Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/order#${productSlug(product.name, product.size)}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <Package className="h-5 w-5 text-[#2563eb]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1a1f71]">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.size}</div>
                  </div>
                </div>
                {product.categoryLabel && (
                  <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">
                    {product.categoryLabel}
                  </div>
                )}
                <div className="text-lg font-semibold text-[#2563eb]">
                  ₦{Number(product.price).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {contentByType.map(
        ({ type, items }) =>
          items.length > 0 && (
            <section key={type}>
              <h2 className="mb-4 text-xl font-semibold text-[#1a1f71]">
                {CONTENT_LABELS[type]}
              </h2>
              <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
                {items.map((item) => {
                  const Icon = CONTENT_ICONS[type]
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50"
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />
                        <span>
                          <span className="block font-medium text-[#1a1f71]">{item.title}</span>
                          {item.excerpt && (
                            <span className="mt-1 block text-sm text-gray-500">{item.excerpt}</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ),
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] px-4 py-12 text-white">
        <div className="container mx-auto max-w-3xl">
          <h1 className="mb-2 text-3xl font-semibold">Search Fizam</h1>
          <p className="mb-6 text-blue-100">
            Find products, pages, homepage sections, careers, and team information across the site.
          </p>
          <SiteSearch
            action="/search"
            inputClassName="!bg-white !text-[#1a1f71] !placeholder:text-gray-400 !border-gray-200"
            buttonClassName="!bg-[#1a1f71] !text-white hover:!bg-[#0f1545]"
          />
        </div>
      </div>
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Suspense fallback={<p className="text-gray-500">Loading results…</p>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  )
}
