'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from './DashboardLayout'
import {
  ShoppingCart,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

interface OrdersViewProps {
  role: string
}

export function OrdersView({ role }: OrdersViewProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=500&sort=-createdAt&depth=2', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        const docs = (data.docs ?? []).map((o: Record<string, unknown>) => ({
          ...o,
          id: String(o.id),
          customer_name:
            o.customerName ?? (o.shipping as { fullName?: string } | undefined)?.fullName,
          created_at: o.createdAt,
        }))
        setOrders(docs)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'paid':
        return <Package className="w-5 h-5 text-emerald-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-emerald-100 text-emerald-700',
      processing: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout title="Orders Management" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">All Orders</h2>
            <p className="text-gray-600">Track and manage customer orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Total Orders</div>
            <div className="text-3xl text-[#1a1f71]">{orders.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Pending</div>
            <div className="text-3xl text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Processing</div>
            <div className="text-3xl text-blue-600">
              {orders.filter(o => o.status === 'processing').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">Delivered</div>
            <div className="text-3xl text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">No orders found</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Order ID</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Customer</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Items</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Total</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-600 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="text-[#1a1f71] font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[#1a1f71]">{order.customer_name || order.shipping?.fullName}</div>
                        <div className="text-sm text-gray-500">{order.shipping?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[#1a1f71]">{order.items?.length || 0} items</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[#2563eb] font-semibold">
                          ₦{order.total?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-[#2563eb] hover:underline text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
