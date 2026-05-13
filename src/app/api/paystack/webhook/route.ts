import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { getPayloadSingleton } from '@/lib/payload'
import { fulfillPaidOrder } from '@/lib/orders'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ error: 'Payments not configured' }, { status: 503 })
    }

    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    const hash = createHmac('sha512', secret).update(rawBody).digest('hex')
    const ok =
      signature &&
      hash.length === signature.length &&
      timingSafeEqual(Buffer.from(hash), Buffer.from(signature))

    if (!ok) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as {
      event?: string
      data?: { reference?: string; metadata?: { orderId?: string | number } }
    }

    if (event.event !== 'charge.success' || !event.data?.reference) {
      return NextResponse.json({ ignored: true })
    }

    const reference = event.data.reference
    const payload = await getPayloadSingleton()

    const orders = await payload.find({
      collection: 'orders',
      overrideAccess: true,
      limit: 1,
      where: {
        paystackReference: { equals: reference },
      },
    })

    const doc = orders.docs[0]
    const resolvedId = doc?.id ?? event.data.metadata?.orderId

    if (!resolvedId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await fulfillPaidOrder(payload, resolvedId)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[paystack/webhook]', e)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
