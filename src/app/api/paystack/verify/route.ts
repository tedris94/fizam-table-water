import { NextResponse } from 'next/server'
import { getPayloadSingleton } from '@/lib/payload'
import { paystackVerify } from '@/lib/paystack'
import { fulfillPaidOrder } from '@/lib/orders'

async function handleVerify(reference: string) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 })
  }

  const data = await paystackVerify(reference)

  if (data.status !== 'success') {
    return NextResponse.json({ ok: false, message: 'Payment not successful' }, { status: 400 })
  }

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
  const resolvedId = doc?.id ?? data.metadata?.orderId

  if (!resolvedId) {
    return NextResponse.json({ error: 'Order not found for reference' }, { status: 404 })
  }

  await fulfillPaidOrder(payload, resolvedId)

  return NextResponse.json({ ok: true, orderId: resolvedId })
}

export async function POST(request: Request) {
  try {
    const { reference } = (await request.json()) as { reference?: string }
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }
    return await handleVerify(reference)
  } catch (e) {
    console.error('[paystack/verify]', e)
    const message = e instanceof Error ? e.message : 'Verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get('reference')
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }
    return await handleVerify(reference)
  } catch (e) {
    console.error('[paystack/verify GET]', e)
    const message = e instanceof Error ? e.message : 'Verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
