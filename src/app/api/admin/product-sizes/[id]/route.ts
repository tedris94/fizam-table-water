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
    const body = (await request.json()) as SizePayload
    const data: Record<string, unknown> = {}
    if (body.label !== undefined) data.label = String(body.label).trim()
    if (body.categorySlug !== undefined) data.categorySlug = String(body.categorySlug).trim()
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 100
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'product-sizes',
      id: parseId(id),
      data,
      overrideAccess: true,
    })
    return NextResponse.json({
      id: updated.id,
      label: updated.label,
      categorySlug: updated.categorySlug,
      sortOrder: updated.sortOrder ?? 100,
      isActive: updated.isActive !== false,
    })
  } catch (e) {
    console.error('[admin/product-sizes PUT]', e)
    return NextResponse.json({ error: 'Failed to update size' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (user?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can delete sizes.' }, { status: 403 })
  }
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    await payload.delete({
      collection: 'product-sizes',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/product-sizes DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete size' }, { status: 500 })
  }
}
