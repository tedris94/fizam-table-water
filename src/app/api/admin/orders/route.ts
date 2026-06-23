import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { toOrderResponse } from '@/lib/orderApi'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'orders.view')
  if (!auth.ok) return auth.response

  try {
    const url = new URL(request.url)
    const limit = Math.min(Number(url.searchParams.get('limit') || 500), 500)

    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'orders',
      limit,
      sort: '-createdAt',
      depth: 3,
      overrideAccess: true,
    })

    return NextResponse.json(
      result.docs.map((doc) => toOrderResponse(doc as Parameters<typeof toOrderResponse>[0])),
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[admin/orders GET]', e)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}
