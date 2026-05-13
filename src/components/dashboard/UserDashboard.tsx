'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingCart, Package, User, Calendar } from 'lucide-react'

export function UserDashboard() {
  const [orders, setOrders] = useState<
    {
      id: string
      items?: unknown[]
      total?: number
      status?: string
      created_at: string
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await fetch('/api/my/orders', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setOrders(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching user orders:', error)
      } finally {
        setLoading(false)
      }
    }
    void fetchUserOrders()
  }, [])

  return (
    <DashboardLayout title="My Dashboard" role={user?.role ?? 'user'}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#1a1f71] to-[#2563eb] p-8 text-white shadow-lg">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl">Welcome back!</h2>
              <p className="text-blue-200">{user?.fullName ?? user?.email}</p>
              <p className="text-blue-200">Manage your orders and profile</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl text-[#1a1f71]">{orders.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">All time</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Pending</p>
                <p className="text-3xl text-[#1a1f71]">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">In progress</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Delivered</p>
                <p className="text-3xl text-[#1a1f71]">
                  {orders.filter((o) => o.status === 'delivered').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-xl text-[#1a1f71]">
            <ShoppingCart className="h-5 w-5" />
            My Orders
          </h3>
          {loading ? (
            <div className="py-12 text-center">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="mb-4 text-gray-500">No orders yet</p>
              <a
                href="/order"
                className="inline-block rounded-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-6 py-3 text-white transition-all hover:shadow-lg"
              >
                Place Your First Order
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <div className="text-[#1a1f71]">Order #{order.id.slice(0, 8)}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      {order.items?.length || 0} items • ₦{order.total?.toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      order.status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center">
          <h3 className="mb-4 text-xl text-[#1a1f71]">Need More Water?</h3>
          <a
            href="/order"
            className="inline-block rounded-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-8 py-3 text-white transition-all hover:shadow-lg"
          >
            Order Now
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
