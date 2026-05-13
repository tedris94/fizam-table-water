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

export async function GET() {
  const user = await getCurrentUser()
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'shipping-zones',
      limit: 200,
      sort: 'priority',
      overrideAccess: true,
    })
    const zones = result.docs.map((z) => ({
      id: z.id,
      name: z.name,
      fee: z.fee,
      description: z.description,
      isActive: z.isActive !== false,
      priority: z.priority ?? 100,
      states: (z.states ?? []).map((s) => s.value),
      cities: (z.cities ?? []).map((c) => c.value),
      lgas: (z.lgas ?? []).map((l) => l.value),
    }))
    return NextResponse.json(zones)
  } catch (e) {
    console.error('[admin/shipping-zones GET]', e)
    return NextResponse.json({ error: 'Failed to load zones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!isAdmin(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await request.json()) as ZonePayload
    if (!body.name || body.fee === undefined) {
      return NextResponse.json({ error: 'Name and fee are required.' }, { status: 400 })
    }
    const payload = await getPayloadSingleton()
    const data = normalize(body) as Partial<ShippingZoneData>
    const created = await payload.create({
      collection: 'shipping-zones',
      data: data as ShippingZoneData,
      overrideAccess: true,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('[admin/shipping-zones POST]', e)
    return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 })
  }
}
