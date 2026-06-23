import { NextResponse } from 'next/server'
import type { Product } from '@/payload-types'
import { getCurrentUser, isAdminRole } from '@/lib/auth'
import {
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
  const category =
    input.category && (await isValidCategorySlug(input.category))
      ? input.category.trim()
      : undefined

  return {
    ...(category !== undefined ? { category } : {}),
    ...(input.name !== undefined ? { name: String(input.name).trim() } : {}),
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

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = (await request.json()) as ProductPayload
    if (body.category && !(await isValidCategorySlug(body.category))) {
      return NextResponse.json({ error: 'Invalid product category.' }, { status: 400 })
    }
    if (
      body.category &&
      body.size &&
      !(await isValidSizeForCategory(body.category, body.size.trim()))
    ) {
      return NextResponse.json(
        { error: 'Size is not valid for the selected category.' },
        { status: 400 },
      )
    }

    const payload = await getPayloadSingleton()
    const data = (await normalize(body)) as Partial<ProductData>

    const updated = await payload.update({
      collection: 'products',
      id: parseId(id),
      data,
      overrideAccess: true,
    })
    return NextResponse.json(toAdminProduct(updated), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (e) {
    console.error('[admin/products PUT]', e)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (user?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can delete products.' }, { status: 403 })
  }
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    await payload.delete({
      collection: 'products',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/products DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
