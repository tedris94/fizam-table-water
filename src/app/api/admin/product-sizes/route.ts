import { NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/auth'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const isAdmin = isAdminRole

type SizePayload = {
  label?: string
  categorySlug?: string
  sortOrder?: number
  isActive?: boolean
}

function toSize(doc: {
  id: number | string
  label: string
  categorySlug: string
  sortOrder?: number | null
  isActive?: boolean | null
}) {
  return {
    id: doc.id,
    label: doc.label,
    categorySlug: doc.categorySlug,
    sortOrder: doc.sortOrder ?? 100,
    isActive: doc.isActive !== false,
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
      collection: 'product-sizes',
      limit: 500,
      sort: 'sortOrder',
      overrideAccess: true,
    })
    return NextResponse.json(result.docs.map(toSize), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (e) {
    console.error('[admin/product-sizes GET]', e)
    return NextResponse.json({ error: 'Failed to load sizes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request)
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await request.json()) as SizePayload
    const label = body.label?.trim()
    const categorySlug = body.categorySlug?.trim()
    if (!label || !categorySlug) {
      return NextResponse.json({ error: 'Label and category are required.' }, { status: 400 })
    }
    const payload = await getPayloadSingleton()
    const created = await payload.create({
      collection: 'product-sizes',
      data: {
        label,
        categorySlug,
        sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 100,
        isActive: body.isActive !== false,
      },
      overrideAccess: true,
    })
    return NextResponse.json(toSize(created), { status: 201 })
  } catch (e) {
    console.error('[admin/product-sizes POST]', e)
    return NextResponse.json({ error: 'Failed to create size' }, { status: 500 })
  }
}
