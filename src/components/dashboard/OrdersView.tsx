'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import {
  ShoppingCart,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  RefreshCw,
} from 'lucide-react'
import type { OrderStatus } from '@/lib/orderRef'
import type { OrderResponse } from '@/lib/orderApi'

interface OrdersViewProps {
  role: string
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function OrdersView({ role }: OrdersViewProps) {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [draftStatus, setDraftStatus] = useState<Record<string, OrderStatus>>({})
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load orders')
      const data = (await res.json()) as OrderResponse[]
      setOrders(data)
      setDraftStatus(
        Object.fromEntries(data.map((o) => [o.id, o.status])) as Record<string, OrderStatus>,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function updateOrder(
    orderId: string,
    status: OrderStatus,
    options?: { resendNotification?: boolean },
  ) {
    setUpdatingId(orderId)
    setNotice(null)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...(options?.resendNotification ? { resendNotification: true } : {}),
        }),
      })
      const data = (await res.json()) as OrderResponse & {
        error?: string
        emailSent?: boolean
        emailError?: string
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to update order')

      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)))
      setDraftStatus((prev) => ({ ...prev, [orderId]: data.status }))

      if (data.emailSent) {
        setNotice(`Order ${data.orderRef} updated — customer notified by email.`)
      } else if (options?.resendNotification && data.emailError) {
        setError(`Order updated but email failed: ${data.emailError}`)
      } else if (options?.resendNotification) {
        setNotice(`Notification resent for ${data.orderRef}.`)
      } else {
        setNotice(`Order ${data.orderRef} marked as ${data.status}.`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'paid':
        return <Package className="h-5 w-5 text-emerald-600" />
      case 'processing':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-emerald-100 text-emerald-700',
      processing: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <DashboardLayout title="Orders Management" role={role}>
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl text-[#1a1f71]">All Orders</h2>
          <p className="text-gray-600">
            Track orders and update status — customers receive automated emails when you mark an
            order as processing, delivered, or cancelled.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 text-sm text-gray-600">Total Orders</div>
            <div className="text-3xl text-[#1a1f71]">{orders.length}</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 text-sm text-gray-600">Pending payment</div>
            <div className="text-3xl text-yellow-600">
              {orders.filter((o) => o.status === 'pending').length}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 text-sm text-gray-600">Processing</div>
            <div className="text-3xl text-blue-600">
              {orders.filter((o) => o.status === 'processing').length}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 text-sm text-gray-600">Delivered</div>
            <div className="text-3xl text-green-600">
              {orders.filter((o) => o.status === 'delivered').length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <div className="text-gray-500">No orders found</div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const draft = draftStatus[order.id] ?? order.status
                    const isUpdating = updatingId === order.id
                    const statusChanged = draft !== order.status
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm text-[#1a1f71]">{order.orderRef}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#1a1f71]">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.shipping?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {order.items.map((item) => (
                              <div key={`${order.id}-${item.productId}`}>
                                {item.quantity} × {item.productName}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#2563eb]">
                            ₦{order.total.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={draft}
                              disabled={isUpdating}
                              onChange={(e) =>
                                setDraftStatus((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value as OrderStatus,
                                }))
                              }
                              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={isUpdating || !statusChanged}
                              onClick={() => void updateOrder(order.id, draft)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#1a1f71] px-3 py-1.5 text-xs text-white hover:bg-[#0f1545] disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                              Update
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating || order.status === 'pending'}
                              title="Resend status email"
                              onClick={() =>
                                void updateOrder(order.id, order.status, {
                                  resendNotification: true,
                                })
                              }
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
