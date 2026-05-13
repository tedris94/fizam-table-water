import { NextResponse } from 'next/server'
import { randomUUID, randomBytes } from 'crypto'
import { getPayloadSingleton } from '@/lib/payload'
import { paystackInitialize } from '@/lib/paystack'
import { PICKUP_ORDER_ADDRESS } from '@/lib/deliveryMode'
import { calculateShippingFee } from '@/lib/shipping'

type CartLine = { productId: string | number; quantity: number }

type ShippingInfo = {
  fullName: string
  email: string
  phone: string
  address: string
  state?: string
  lga?: string
  city?: string
  postalCode?: string
}

/**
 * Find an existing user by email or create a `customer` user with a random
 * password. The customer can request a password reset later to access the
 * dashboard.
 */
async function ensureCustomer(
  payload: Awaited<ReturnType<typeof getPayloadSingleton>>,
  shipping: ShippingInfo,
): Promise<number | null> {
  try {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: shipping.email.toLowerCase() } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      return Number(existing.docs[0].id)
    }
    const created = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: shipping.email.toLowerCase(),
        fullName: shipping.fullName,
        role: 'customer',
        password: randomBytes(24).toString('hex'),
      },
    })
    return Number(created.id)
  } catch (e) {
    console.error('[paystack/initialize] ensureCustomer failed:', e)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: CartLine[]
      shipping?: ShippingInfo
      deliveryMode?: 'delivery' | 'pickup'
    }

    const items = body.items?.filter((i) => i.quantity > 0) ?? []
    const shipping = body.shipping
    const deliveryMode = body.deliveryMode === 'pickup' ? 'pickup' : 'delivery'

    if (!items.length || !shipping?.fullName || !shipping.email || !shipping.phone) {
      return NextResponse.json({ error: 'Invalid cart or shipping details' }, { status: 400 })
    }

    if (deliveryMode === 'delivery' && !shipping.address?.trim()) {
      return NextResponse.json({ error: 'Invalid cart or shipping details' }, { status: 400 })
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payments are not configured on this server.' },
        { status: 503 },
      )
    }

    const payload = await getPayloadSingleton()
    const reference = `fz_${randomUUID()}`

    let subtotal = 0
    const normalizedItems: { product: number; quantity: number }[] = []

    for (const line of items) {
      const productId =
        typeof line.productId === 'number' ? line.productId : Number(line.productId)
      if (!Number.isFinite(productId)) {
        return NextResponse.json(
          { error: `Invalid product id ${line.productId}` },
          { status: 400 },
        )
      }
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
        overrideAccess: true,
      })
      if (!product) {
        return NextResponse.json(
          { error: `Product ${line.productId} not found` },
          { status: 400 },
        )
      }
      if (product.stock < line.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name} (${product.size}). Available: ${product.stock}`,
          },
          { status: 400 },
        )
      }
      subtotal += product.price * line.quantity
      normalizedItems.push({ product: productId, quantity: line.quantity })
    }

    const shippingResult =
      deliveryMode === 'pickup'
        ? { fee: 0, zone: 'Pickup', zoneId: null as number | null }
        : await calculateShippingFee(
            shipping.state || '',
            shipping.city || '',
            shipping.lga || '',
          )
    const total = subtotal + shippingResult.fee

    const orderAddress =
      deliveryMode === 'pickup' ? PICKUP_ORDER_ADDRESS : shipping.address.trim()

    const customerId = await ensureCustomer(payload, shipping)

    const order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        items: normalizedItems,
        deliveryMode,
        shipping: {
          fullName: shipping.fullName,
          email: shipping.email,
          phone: shipping.phone,
          address: orderAddress,
          state: deliveryMode === 'pickup' ? '' : shipping.state || '',
          lga: deliveryMode === 'pickup' ? '' : shipping.lga || '',
          city: deliveryMode === 'pickup' ? '' : shipping.city || '',
          postalCode: deliveryMode === 'pickup' ? '' : shipping.postalCode || '',
        },
        shippingFee: shippingResult.fee,
        shippingZone:
          deliveryMode === 'delivery' &&
          shippingResult.zoneId &&
          typeof shippingResult.zoneId === 'number'
            ? shippingResult.zoneId
            : undefined,
        customer: customerId ?? undefined,
        total,
        status: 'pending',
        paystackReference: reference,
      },
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const callbackUrl = `${siteUrl.replace(/\/$/, '')}/order/success`

    const amountKobo = Math.round(total * 100)
    const init = await paystackInitialize({
      email: shipping.email,
      amountKobo,
      reference,
      metadata: {
        orderId: String(order.id),
        shippingZone: shippingResult.zone,
        deliveryMode,
      },
      callbackUrl,
    })

    await payload.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: {
        paystackAccessCode: init.access_code ?? '',
      },
    })

    return NextResponse.json({
      authorizationUrl: init.authorization_url,
      reference: init.reference,
      accessCode: init.access_code,
      orderId: order.id,
      shipping: { fee: shippingResult.fee, zone: shippingResult.zone },
    })
  } catch (e) {
    console.error('[paystack/initialize]', e)
    const message = e instanceof Error ? e.message : 'Payment initialization failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
