import type { Payload } from 'payload'
import {
  notifyCustomerOfOrderStatus,
  notifyStaffNewOrder,
  sendOrderConfirmationEmail,
} from '@/lib/orderEmails'

export async function fulfillPaidOrder(payload: Payload, orderId: string | number) {
  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 3,
    overrideAccess: true,
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status === 'paid') {
    return { alreadyPaid: true as const, emailSent: false, emailError: undefined as string | undefined }
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

  const updated = await payload.update({
    collection: 'orders',
    id: orderId,
    overrideAccess: true,
    data: { status: 'paid' },
    depth: 3,
  })

  let emailSent = false
  let emailError: string | undefined

  try {
    await sendOrderConfirmationEmail(updated)
    await notifyStaffNewOrder(updated)
    emailSent = true
    console.info(`[orders] payment emails sent for order ${orderId}`)
  } catch (err) {
    emailError = err instanceof Error ? err.message : 'Could not send order emails.'
    console.error('[orders] payment emails', err)
  }

  return { alreadyPaid: false as const, emailSent, emailError }
}
