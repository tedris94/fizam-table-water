'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from './DashboardLayout'
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    teamMembers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalOrders: data.stats.totalOrders,
            pendingOrders: data.stats.pendingOrders,
            completedOrders: data.stats.completedOrders,
            totalProducts: data.stats.totalProducts,
            lowStockProducts: data.stats.lowStockProducts,
            teamMembers: data.stats.teamMembers,
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    void fetchDashboardData()
  }, [])

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl text-[#1a1f71]">{stats.totalOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">All time orders</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl text-[#1a1f71]">{stats.pendingOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">Needs attention</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Products</p>
                <p className="text-3xl text-[#1a1f71]">{stats.totalProducts}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">{stats.lowStockProducts} low stock</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-xl text-[#1a1f71]">
              <Package className="h-5 w-5" />
              Product Management
            </h3>
            <div className="space-y-3">
              <a
                href="/dashboard/products"
                className="block rounded-xl bg-blue-50 p-4 transition-colors hover:bg-blue-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#1a1f71]">View All Products</span>
                  <span className="text-[#2563eb]">{stats.totalProducts} items</span>
                </div>
              </a>
              {stats.lowStockProducts > 0 && (
                <div className="rounded-xl bg-orange-50 p-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{stats.lowStockProducts} products need restocking</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-xl text-[#1a1f71]">
              <ShoppingCart className="h-5 w-5" />
              Order Management
            </h3>
            <div className="space-y-3">
              <a
                href="/dashboard/orders"
                className="block rounded-xl bg-green-50 p-4 transition-colors hover:bg-green-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#1a1f71]">Pending Orders</span>
                  <span className="text-green-600">{stats.pendingOrders} orders</span>
                </div>
              </a>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Completed Orders</span>
                  <span className="text-gray-600">{stats.completedOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#1a1f71] to-[#2563eb] p-8 text-white shadow-lg">
          <h3 className="mb-4 text-2xl">Team Overview</h3>
          <div className="flex items-center gap-4">
            <Users className="h-12 w-12" />
            <div>
              <div className="mb-1 text-3xl">{stats.teamMembers}</div>
              <div className="text-blue-200">Active Team Members</div>
            </div>
          </div>
          <a
            href="/dashboard/team"
            className="mt-6 inline-block rounded-full bg-white/20 px-6 py-2 transition-colors hover:bg-white/30"
          >
            Manage Team →
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
