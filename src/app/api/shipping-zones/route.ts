import { NextResponse } from 'next/server'
import { loadShippingZones } from '@/lib/shipping'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Public list of active delivery locations (shipping rules) for the order page. */
export async function GET() {
  try {
    const zones = await loadShippingZones()
    return NextResponse.json(zones)
  } catch (e) {
    console.error('[shipping-zones]', e)
    return NextResponse.json({ error: 'Could not load delivery locations.' }, { status: 500 })
  }
}
