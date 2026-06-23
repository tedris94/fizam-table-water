import type { Order } from '@/payload-types'
import { formatOrderRef, type OrderStatus } from '@/lib/orderRef'

export type OrderResponse = {
  id: string
  orderRef: string
  customerName: string
  status: OrderStatus
  total: number
  shippingFee: number
  deliveryMode: 'delivery' | 'pickup'
  shipping: Order['shipping']
  items: {
    productId: string | number
    productName: string
    quantity: number
  }[]
  paystackReference: string | null
  createdAt: string
  updatedAt: string
}

export function toOrderResponse(doc: Order): OrderResponse {
  const items = (doc.items ?? []).map((row) => {
    const product = row.product
    let productName = 'Product'
    let productId: string | number = ''
    if (product && typeof product === 'object') {
      productName = [product.name, product.size].filter(Boolean).join(' ') || `Product #${product.id}`
      productId = product.id
    } else if (product) {
      productId = product
      productName = `Product #${product}`
    }
    return {
      productId,
      productName,
      quantity: row.quantity ?? 1,
    }
  })

  return {
    id: String(doc.id),
    orderRef: formatOrderRef(doc.id),
    customerName: doc.customerName || doc.shipping?.fullName || 'Customer',
    status: doc.status,
    total: doc.total ?? 0,
    shippingFee: doc.shippingFee ?? 0,
    deliveryMode: doc.deliveryMode === 'pickup' ? 'pickup' : 'delivery',
    shipping: doc.shipping,
    items,
    paystackReference: doc.paystackReference ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}
