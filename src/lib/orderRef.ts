import { siteBaseUrl } from '@/lib/applicationRef'

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'delivered' | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Payment received',
  processing: 'Being prepared',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** Human-readable reference shown to customers (e.g. FZ-ORD-2026-00104). */
export function formatOrderRef(id: number | string): string {
  const year = new Date().getFullYear()
  const num = String(id).padStart(5, '0')
  return `FZ-ORD-${year}-${num}`
}

export function ordersContactEmail(): string {
  return (
    process.env.ORDERS_REPLY_EMAIL?.trim() ||
    process.env.ORDERS_NOTIFY_EMAIL?.trim()?.split(/[,;]/)[0]?.trim() ||
    process.env.CONTACT_NOTIFY_EMAIL?.trim()?.split(/[,;]/)[0]?.trim() ||
    'sales@fizam.ng'
  )
}

export function ordersNotifyEmail(): string | null {
  const raw =
    process.env.ORDERS_NOTIFY_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim()
  if (!raw) return null
  return raw
}

export { siteBaseUrl }
