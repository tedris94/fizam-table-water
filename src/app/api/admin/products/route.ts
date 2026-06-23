import { NextResponse } from 'next/server'
import type { Product } from '@/payload-types'
import { getCurrentUser, isAdminRole } from '@/lib/auth'
import {
  categoryLabelFromTaxonomy,
  fetchProductTaxonomy,
  isValidCategorySlug,
  isValidSizeForCategory,
} from '@/lib/productTaxonomy'
import { getPayloadSingleton } from '@/lib/payload'

type ProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const isAdmin = isAdminRole

type ProductPayload = {
  category?: string
  name?: string
  size?: string
  price?: number
  description?: string
  stock?: number
  tagIds?: (number | string)[]
}

async function normalize(input: ProductPayload) {
  const taxonomy = await fetchProductTaxonomy(false)
  const category =
    input.category && (await isValidCategorySlug(input.category))
      ? input.category.trim()
      : undefined
  const name =
    input.name !== undefined
      ? String(input.name).trim()
      : category
        ? categoryLabelFromTaxonomy(taxonomy, category)
        : undefined

  return {
    ...(category !== undefined ? { category } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(input.size !== undefined ? { size: String(input.size).trim() } : {}),
    ...(input.price !== undefined ? { price: Math.max(0, Number(input.price) || 0) } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.stock !== undefined ? { stock: Math.max(0, Number(input.stock) || 0) } : {}),
    ...(input.tagIds !== undefined ? { tags: input.tagIds } : {}),
  }
}

function toAdminProduct(product: Product) {
  const tags = Array.isArray(product.tags)
    ? product.tags.map((t) =>
        typeof t === 'object' && t !== null
          ? { id: t.id, slug: (t as { slug?: string }).slug, label: (t as { label?: string }).label }
          : { id: t },
      )
    : []

  return {
    id: product.id,
    category: product.category,
    name: product.name,
    size: product.size,
    price: product.price,
    description: product.description,
    stock: product.stock,
    image: product.image,
    tags,
    tagIds: tags.map((t) => t.id),
  }
}

export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'products',
      limit: 500,
      depth: 1,
      sort: 'category',
      overrideAccess: true,
    })
    return NextResponse.json(result.docs.map(toAdminProduct), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (e) {
    console.error('[admin/products GET]', e)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request)
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await request.json()) as ProductPayload
    if (!body.category || !(await isValidCategorySlug(body.category))) {
      return NextResponse.json({ error: 'A valid product category is required.' }, { status: 400 })
    }
    if (!body.size?.trim()) {
      return NextResponse.json({ error: 'Size is required.' }, { status: 400 })
    }
    if (!(await isValidSizeForCategory(body.category, body.size.trim()))) {
      return NextResponse.json(
        { error: 'Size is not valid for the selected category.' },
        { status: 400 },
      )
    }
    if (body.price === undefined) {
      return NextResponse.json({ error: 'Price is required.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    const taxonomy = await fetchProductTaxonomy(false)
    const data = (await normalize(body)) as Partial<ProductData>
    if (!data.name) {
      data.name = categoryLabelFromTaxonomy(taxonomy, body.category)
    }

    const created = await payload.create({
      collection: 'products',
      data: data as ProductData,
      overrideAccess: true,
    })
    return NextResponse.json(toAdminProduct(created), { status: 201 })
  } catch (e) {
    console.error('[admin/products POST]', e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
