import type { Payload } from 'payload'
import { sendOrderConfirmation } from '@/lib/email'

export async function fulfillPaidOrder(payload: Payload, orderId: string | number) {
  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 2,
    overrideAccess: true,
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status === 'paid') {
    return { alreadyPaid: true as const }
  }

  for (const row of order.items || []) {
    const pid =
      row.product && typeof row.product === 'object' && 'id' in row.product
        ? row.product.id
        : row.product
    if (!pid) continue
    const product = await payload.findByID({
      collection: 'products',
      id: pid,
      overrideAccess: true,
    })
    const qty = row.quantity ?? 0
    const newStock = Math.max(0, (product.stock ?? 0) - qty)
    await payload.update({
      collection: 'products',
      id: pid,
      overrideAccess: true,
      data: { stock: newStock },
    })
  }

  await payload.update({
    collection: 'orders',
    id: orderId,
    overrideAccess: true,
    data: { status: 'paid' },
  })

  const email = order.shipping?.email
  if (email) {
    await sendOrderConfirmation({
      to: email,
      customerName: order.shipping?.fullName || order.customerName || 'Customer',
      orderId,
      total: order.total,
      reference: order.paystackReference,
    }).catch(() => {})
  }

  return { alreadyPaid: false as const }
}
