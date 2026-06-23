import { NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/auth'
import { slugify } from '@/lib/slugify'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const isAdmin = isAdminRole

type TagPayload = {
  slug?: string
  label?: string
  sortOrder?: number
  isActive?: boolean
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
    const body = (await request.json()) as TagPayload
    const data: Record<string, unknown> = {}
    if (body.label !== undefined) data.label = String(body.label).trim()
    if (body.slug !== undefined) data.slug = slugify(body.slug)
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 100
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'product-tags',
      id: parseId(id),
      data,
      overrideAccess: true,
    })
    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      label: updated.label,
      sortOrder: updated.sortOrder ?? 100,
      isActive: updated.isActive !== false,
    })
  } catch (e) {
    console.error('[admin/product-tags PUT]', e)
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (user?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can delete tags.' }, { status: 403 })
  }
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    await payload.delete({
      collection: 'product-tags',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/product-tags DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}
