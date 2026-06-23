import { absoluteSiteUrl } from '@/lib/emailBranding'
import { resolveMediaFromDoc } from '@/lib/mediaUrl'
import type { Order, Product } from '@/payload-types'
import type { OrderStatus } from '@/lib/orderRef'

type OrderDoc = Order & {
  items?: {
    product?: number | Product | null
    quantity?: number | null
  }[]
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`
}

type LineItem = {
  name: string
  size: string
  quantity: number
  unitPrice: number
  lineTotal: number
  imageUrl: string | null
}

function parseLineItems(order: OrderDoc): LineItem[] {
  return (order.items ?? []).map((row) => {
    const product = row.product
    const quantity = row.quantity ?? 1
    let name = 'Product'
    let size = ''
    let unitPrice = 0
    let imageUrl: string | null = null

    if (product && typeof product === 'object') {
      name = product.name || `Product #${product.id}`
      size = product.size || ''
      unitPrice = product.price ?? 0
      imageUrl = resolveMediaFromDoc(product.image)
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = absoluteSiteUrl(imageUrl)
      }
    }

    return {
      name,
      size,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      imageUrl,
    }
  })
}

function computeSubtotal(items: LineItem[]) {
  return items.reduce((sum, item) => sum + item.lineTotal, 0)
}

function progressStepIndex(status: OrderStatus, isPickup: boolean): number {
  if (status === 'cancelled') return -1
  if (status === 'pending') return 0
  if (status === 'paid') return 1
  if (status === 'processing') return 2
  if (status === 'delivered') return 3
  return 0
}

export function buildOrderProgressHtml(order: OrderDoc, status: OrderStatus) {
  if (status === 'cancelled') {
    return `<p style="margin:0 0 20px;padding:12px 16px;background:#fef2f2;border-radius:8px;font-size:14px;color:#991b1b;">This order was cancelled.</p>`
  }

  const isPickup = order.deliveryMode === 'pickup'
  const steps = isPickup
    ? ['Order placed', 'Confirmed', 'Ready', 'Picked up']
    : ['Order placed', 'Confirmed', 'On the way', 'Delivered']

  const active = progressStepIndex(status, isPickup)

  const cells = steps
    .map((label, index) => {
      const done = index < active
      const current = index === active
      const color = done || current ? '#1a1f71' : '#9ca3af'
      const bg = current ? '#1a1f71' : done ? '#2563eb' : '#e5e7eb'
      const icon = done ? '✓' : String(index + 1)
      const textWeight = current ? 'font-weight:600;color:#1a1f71;' : `color:${color};`

      return `<td align="center" style="padding:8px 4px;width:25%;vertical-align:top;">
        <div style="width:28px;height:28px;line-height:28px;border-radius:50%;background:${bg};color:#fff;font-size:12px;font-weight:700;margin:0 auto 6px;">${icon}</div>
        <div style="font-size:11px;line-height:1.3;${textWeight}">${label}</div>
      </td>`
    })
    .join('')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse;">
  <tr>${cells}</tr>
</table>`
}

export function buildInvoiceTableHtml(order: OrderDoc) {
  const items = parseLineItems(order)
  if (items.length === 0) {
    return `<p style="margin:0;font-size:14px;color:#64748b;">No items on this order.</p>`
  }

  const rows = items
    .map((item) => {
      const title = [item.name, item.size].filter(Boolean).join(' — ')
      const thumb = item.imageUrl
        ? `<img src="${item.imageUrl}" alt="" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:contain;border-radius:8px;border:1px solid #e5e7eb;background:#fff;" />`
        : `<div style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;border:1px solid #e5e7eb;"></div>`

      return `<tr>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;vertical-align:top;">${thumb}</td>
            <td style="vertical-align:top;font-size:14px;line-height:1.5;color:#374151;"><strong style="color:#111827;">${title}</strong></td>
          </tr></table>
        </td>
        <td align="center" style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;white-space:nowrap;">${item.quantity}</td>
        <td align="right" style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;white-space:nowrap;font-weight:600;">${formatNaira(item.lineTotal)}</td>
      </tr>`
    })
    .join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 8px;">
  <thead>
    <tr style="background:#f9fafb;">
      <th align="left" style="padding:10px 8px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Item</th>
      <th align="center" style="padding:10px 8px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Qty</th>
      <th align="right" style="padding:10px 8px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Price</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`
}

export function buildInvoiceTableText(order: OrderDoc) {
  const items = parseLineItems(order)
  if (items.length === 0) return '—'
  return items
    .map((item) => {
      const title = [item.name, item.size].filter(Boolean).join(' — ')
      return `${item.quantity} × ${title} — ${formatNaira(item.lineTotal)}`
    })
    .join('\n')
}

export function buildInvoiceTotalsHtml(order: OrderDoc) {
  const items = parseLineItems(order)
  const subtotal = computeSubtotal(items)
  const shippingFee = order.shippingFee ?? 0
  const total = order.total ?? subtotal + shippingFee
  const paymentMethod =
    order.status === 'pending' ? 'Payment pending' : 'Prepaid (Paystack)'

  const feeRow =
    shippingFee > 0
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#374151;">Delivery fee</td><td align="right" style="padding:6px 0;font-size:14px;color:#374151;">${formatNaira(shippingFee)}</td></tr>`
      : order.deliveryMode === 'pickup'
        ? `<tr><td style="padding:6px 0;font-size:14px;color:#374151;">Delivery fee</td><td align="right" style="padding:6px 0;font-size:14px;color:#6b7280;">Pickup — ₦0</td></tr>`
        : ''

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0 0;">
  <tr><td style="padding:6px 0;font-size:14px;color:#374151;">Subtotal</td><td align="right" style="padding:6px 0;font-size:14px;color:#374151;">${formatNaira(subtotal)}</td></tr>
  ${feeRow}
  <tr><td colspan="2" style="padding:8px 0;border-top:1px solid #e5e7eb;"></td></tr>
  <tr><td style="padding:6px 0;font-size:16px;font-weight:700;color:#111827;">Total</td><td align="right" style="padding:6px 0;font-size:16px;font-weight:700;color:#15803d;">${formatNaira(total)}</td></tr>
  <tr><td colspan="2" style="padding:8px 0 0;font-size:12px;color:#6b7280;">Payment: ${paymentMethod}</td></tr>
</table>`
}

export function buildInvoiceTotalsText(order: OrderDoc) {
  const items = parseLineItems(order)
  const subtotal = computeSubtotal(items)
  const shippingFee = order.shippingFee ?? 0
  const total = order.total ?? subtotal + shippingFee
  const lines = [`Subtotal: ${formatNaira(subtotal)}`]
  if (shippingFee > 0) lines.push(`Delivery fee: ${formatNaira(shippingFee)}`)
  lines.push(`TOTAL: ${formatNaira(total)}`)
  lines.push(`Payment: ${order.status === 'pending' ? 'Pending' : 'Prepaid (Paystack)'}`)
  return lines.join('\n')
}

export function buildOrderInvoiceVars(order: OrderDoc, status: OrderStatus) {
  const items = parseLineItems(order)
  const subtotal = computeSubtotal(items)
  const shippingFee = order.shippingFee ?? 0

  return {
    invoiceTableHtml: buildInvoiceTableHtml(order),
    invoiceTableText: buildInvoiceTableText(order),
    invoiceTotalsHtml: buildInvoiceTotalsHtml(order),
    invoiceTotalsText: buildInvoiceTotalsText(order),
    orderProgressHtml: buildOrderProgressHtml(order, status),
    subtotalFormatted: formatNaira(subtotal),
    shippingFeeFormatted: formatNaira(shippingFee),
    paymentMethodLabel: order.status === 'pending' ? 'Payment pending' : 'Prepaid (Paystack)',
  }
}

export function sampleOrderInvoiceVars(status: OrderStatus = 'paid') {
  const sampleOrder: OrderDoc = {
    id: 104,
    status,
    total: 45750,
    shippingFee: 750,
    deliveryMode: 'delivery',
    shipping: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+234 800 000 0000',
      address: '12 Admiralty Way',
      city: 'Lekki',
      lga: 'Eti-Osa',
      state: 'Lagos',
      postalCode: '',
    },
    items: [
      {
        quantity: 2,
        product: {
          id: 1,
          name: 'Fizam Table Water',
          size: '75cl',
          price: 22500,
          category: 'table_water',
          stock: 100,
          createdAt: '',
          updatedAt: '',
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return buildOrderInvoiceVars(sampleOrder, status)
}
