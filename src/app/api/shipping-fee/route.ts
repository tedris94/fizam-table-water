import { NextResponse } from 'next/server'
import { calculateShippingFee } from '@/lib/shipping'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Calculate the delivery fee from state, optional city/area, and optional LGA. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      state?: string
      city?: string
      lga?: string
    }
    const state = body.state?.trim() || ''
    const city = body.city?.trim() || ''
    const lga = body.lga?.trim() || ''
    const result = await calculateShippingFee(state, city, lga)
    return NextResponse.json(result)
  } catch (e) {
    console.error('[shipping-fee]', e)
    return NextResponse.json({ error: 'Could not calculate shipping fee.' }, { status: 500 })
  }
}
