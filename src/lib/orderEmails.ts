import { sendMail } from '@/lib/email'
import type { EmailTemplateSlug } from '@/lib/emailTemplateCatalog'
import { renderEmailTemplate } from '@/lib/emailTemplateEngine'
import { buildOrderInvoiceVars } from '@/lib/orderInvoice'
import type { Order, Product } from '@/payload-types'
import {
  formatOrderRef,
  ORDER_STATUS_LABELS,
  ordersContactEmail,
  ordersNotifyEmail,
  siteBaseUrl,
  type OrderStatus,
} from '@/lib/orderRef'

type OrderDoc = Order & {
  items?: {
    product?: number | Product | null
    quantity?: number | null
  }[]
}

function ordersFromAddress(): string | undefined {
  return (
    process.env.SMTP_FROM_ORDERS?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    undefined
  )
}

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`
}

function buildDeliveryInfo(order: OrderDoc) {
  const shipping = order.shipping
  const mode =
    order.deliveryMode === 'pickup'
      ? 'Pickup from Fizam'
      : 'Home delivery'

  const addressParts = [
    shipping?.address,
    shipping?.city,
    shipping?.lga,
    shipping?.state,
    shipping?.postalCode,
  ]
    .map((p) => p?.trim())
    .filter(Boolean)

  const deliveryInfoText = [mode, ...addressParts].filter(Boolean).join('\n')
  const deliveryInfoHtml = `<p style="margin:0;font-size:14px;line-height:1.6;color:#374151;"><strong>${mode}</strong>${
    addressParts.length
      ? `<br>${addressParts.join(', ')}`
      : order.deliveryMode === 'pickup'
        ? '<br>Customer will collect from our location.'
        : ''
  }</p>`

  return { deliveryInfoText, deliveryInfoHtml }
}

export function buildOrderEmailVars(order: OrderDoc, status?: OrderStatus) {
  const effectiveStatus = status ?? (order.status as OrderStatus)
  const orderRef = formatOrderRef(order.id)
  const reference = order.paystackReference?.trim() || ''
  const { deliveryInfoText, deliveryInfoHtml } = buildDeliveryInfo(order)
  const invoice = buildOrderInvoiceVars(order, effectiveStatus)

  return {
    customerName: order.shipping?.fullName || order.customerName || 'Customer',
    customerEmail: order.shipping?.email || '',
    customerPhone: order.shipping?.phone || '',
    orderRef,
    orderId: String(order.id),
    totalFormatted: formatNaira(order.total ?? 0),
    subtotalFormatted: invoice.subtotalFormatted,
    shippingFeeFormatted: invoice.shippingFeeFormatted,
    paymentMethodLabel: invoice.paymentMethodLabel,
    paymentReference: reference,
    paymentReferenceLine: reference ? `Payment reference: ${reference}` : '',
    paymentReferenceHtml: reference
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#374151;">Payment reference</td><td align="right" style="padding:6px 0;font-size:14px;color:#374151;">${reference}</td></tr>`
      : '',
    statusLabel: ORDER_STATUS_LABELS[effectiveStatus] ?? effectiveStatus,
    itemsSummaryText: invoice.invoiceTableText,
    itemsSummaryHtml: invoice.invoiceTableHtml,
    invoiceTableHtml: invoice.invoiceTableHtml,
    invoiceTableText: invoice.invoiceTableText,
    invoiceTotalsHtml: invoice.invoiceTotalsHtml,
    invoiceTotalsText: invoice.invoiceTotalsText,
    orderProgressHtml: invoice.orderProgressHtml,
    deliveryInfoText,
    deliveryInfoHtml,
    ordersEmail: ordersContactEmail(),
    siteUrl: siteBaseUrl(),
    dashboardUrl: `${siteBaseUrl()}/dashboard/orders`,
  }
}

const STATUS_TEMPLATE_SLUG: Record<
  Exclude<OrderStatus, 'pending'>,
  EmailTemplateSlug
> = {
  paid: 'order-confirmation',
  processing: 'order-processing',
  delivered: 'order-delivered',
  cancelled: 'order-cancelled',
}

async function sendTemplatedOrderEmail(
  slug: EmailTemplateSlug,
  to: string,
  vars: Record<string, string | number | null | undefined>,
) {
  const rendered = await renderEmailTemplate(slug, vars)
  if (!rendered.enabled) {
    console.warn('[email] template disabled, skipped:', slug)
    return { skipped: true as const }
  }

  await sendMail({
    from: ordersFromAddress(),
    replyTo: ordersContactEmail(),
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  })
  return { skipped: false as const }
}

export async function sendOrderConfirmationEmail(order: OrderDoc) {
  const email = order.shipping?.email?.trim()
  if (!email) return { skipped: true as const }

  return sendTemplatedOrderEmail(
    'order-confirmation',
    email,
    buildOrderEmailVars({ ...order, status: 'paid' }, 'paid'),
  )
}

export async function notifyCustomerOfOrderStatus(
  order: OrderDoc,
  status: OrderStatus,
) {
  if (status === 'pending') return { skipped: true as const }

  const email = order.shipping?.email?.trim()
  if (!email) return { skipped: true as const }

  const slug = STATUS_TEMPLATE_SLUG[status]
  return sendTemplatedOrderEmail(slug, email, buildOrderEmailVars(order, status))
}

export async function notifyStaffNewOrder(order: OrderDoc) {
  const staffEmail = ordersNotifyEmail()
  if (!staffEmail) return { skipped: true as const }

  const internalFrom =
    process.env.SMTP_FROM_INTERNAL?.trim() || process.env.SMTP_FROM?.trim() || undefined

  const vars = buildOrderEmailVars({ ...order, status: 'paid' }, 'paid')
  const rendered = await renderEmailTemplate('order-staff-new-order', vars)
  if (!rendered.enabled) {
    console.warn('[email] template disabled, skipped: order-staff-new-order')
    return { skipped: true as const }
  }

  await sendMail({
    from: internalFrom,
    to: staffEmail,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  })
  return { skipped: false as const }
}
