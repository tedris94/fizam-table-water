import { NextResponse } from 'next/server'
import type { ShippingZone } from '@/payload-types'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadSingleton } from '@/lib/payload'

type ShippingZoneData = Omit<ShippingZone, 'id' | 'createdAt' | 'updatedAt'>

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const isAdmin = (role: string | undefined) => role === 'super_admin' || role === 'admin'

type ZonePayload = {
  name?: string
  fee?: number
  description?: string
  isActive?: boolean
  priority?: number
  states?: string[]
  cities?: string[]
  lgas?: string[]
}

function normalize(input: ZonePayload) {
  return {
    ...(input.name !== undefined ? { name: String(input.name).trim() } : {}),
    ...(input.fee !== undefined ? { fee: Math.max(0, Number(input.fee) || 0) } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.isActive !== undefined ? { isActive: Boolean(input.isActive) } : {}),
    ...(input.priority !== undefined
      ? { priority: Number.isFinite(input.priority) ? Number(input.priority) : 100 }
      : {}),
    ...(input.states !== undefined
      ? { states: (input.states || []).filter(Boolean).map((value) => ({ value })) }
      : {}),
    ...(input.cities !== undefined
      ? { cities: (input.cities || []).filter(Boolean).map((value) => ({ value })) }
      : {}),
    ...(input.lgas !== undefined
      ? { lgas: (input.lgas || []).filter(Boolean).map((value) => ({ value })) }
      : {}),
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
    const body = (await request.json()) as ZonePayload
    const payload = await getPayloadSingleton()
    const data = normalize(body) as Partial<ShippingZoneData>
    const updated = await payload.update({
      collection: 'shipping-zones',
      id: parseId(id),
      data,
      overrideAccess: true,
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[admin/shipping-zones PUT]', e)
    return NextResponse.json({ error: 'Failed to update zone' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    await payload.delete({
      collection: 'shipping-zones',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/shipping-zones DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 })
  }
}
