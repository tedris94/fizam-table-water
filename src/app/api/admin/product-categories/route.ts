import { NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/auth'
import { slugify } from '@/lib/slugify'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const isAdmin = isAdminRole

type CategoryPayload = {
  slug?: string
  label?: string
  sortOrder?: number
  isActive?: boolean
}

function toCategory(doc: {
  id: number | string
  slug: string
  label: string
  sortOrder?: number | null
  isActive?: boolean | null
}) {
  return {
    id: doc.id,
    slug: doc.slug,
    label: doc.label,
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
      collection: 'product-categories',
      limit: 200,
      sort: 'sortOrder',
      overrideAccess: true,
    })
    return NextResponse.json(result.docs.map(toCategory), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (e) {
    console.error('[admin/product-categories GET]', e)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request)
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await request.json()) as CategoryPayload
    const label = body.label?.trim()
    if (!label) {
      return NextResponse.json({ error: 'Label is required.' }, { status: 400 })
    }
    const slug = (body.slug?.trim() || slugify(label)).toLowerCase()
    const payload = await getPayloadSingleton()
    const created = await payload.create({
      collection: 'product-categories',
      data: {
        slug,
        label,
        sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 100,
        isActive: body.isActive !== false,
      },
      overrideAccess: true,
    })
    return NextResponse.json(toCategory(created), { status: 201 })
  } catch (e) {
    console.error('[admin/product-categories POST]', e)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
