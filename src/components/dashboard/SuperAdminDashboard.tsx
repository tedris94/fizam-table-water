'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from './DashboardLayout'
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Briefcase,
  FileText,
} from 'lucide-react'

export function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    activeJobs: 0,
    pendingApplications: 0,
    teamMembers: 0,
    monthlyGrowth: 0,
  })
  const [recentOrders, setRecentOrders] = useState<
    {
      id: string
      customer_name: string
      total: number
      created_at: string
      status?: string
    }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentOrders(data.recentOrders || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    void fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
    },
    {
      title: 'Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      change: '+8%',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      change: '0%',
    },
    {
      title: 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      change: '+2',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Briefcase,
      color: 'from-pink-500 to-pink-600',
      change: `${stats.pendingApplications} pending`,
    },
    {
      title: 'Applications',
      value: stats.pendingApplications,
      icon: FileText,
      color: 'from-cyan-500 to-cyan-600',
      change: 'This month',
    },
  ]

  return (
    <DashboardLayout title="Super Admin Dashboard" role="super_admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl text-[#1a1f71]">{stat.value}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-gray-500">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-xl text-[#1a1f71]">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </h3>
            {loading ? (
              <p className="py-8 text-center text-gray-500">Loading...</p>
            ) : recentOrders.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                  >
                    <div>
                      <div className="text-[#1a1f71]">Order #{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-gray-500">{order.customer_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#2563eb]">₦{order.total.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl text-[#1a1f71]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard/products"
                className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center transition-all hover:shadow-lg"
              >
                <Package className="mx-auto mb-2 h-8 w-8 text-[#2563eb]" />
                <div className="text-sm text-[#1a1f71]">Manage Products</div>
              </Link>
              <Link
                href="/dashboard/orders"
                className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 text-center transition-all hover:shadow-lg"
              >
                <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <div className="text-sm text-[#1a1f71]">View Orders</div>
              </Link>
              <Link
                href="/dashboard/team"
                className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center transition-all hover:shadow-lg"
              >
                <Users className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                <div className="text-sm text-[#1a1f71]">Manage Team</div>
              </Link>
              <Link
                href="/dashboard/careers"
                className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 text-center transition-all hover:shadow-lg"
              >
                <Briefcase className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                <div className="text-sm text-[#1a1f71]">Job Postings</div>
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#1a1f71] to-[#2563eb] p-8 text-white shadow-lg">
          <h3 className="mb-6 text-2xl">System Overview</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="mb-1 text-sm text-blue-200">Total Users</div>
              <div className="text-3xl">{stats.totalUsers}</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-blue-200">Monthly Growth</div>
              <div className="text-3xl">+{stats.monthlyGrowth}%</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-blue-200">Active Products</div>
              <div className="text-3xl">{stats.totalProducts}</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-blue-200">This Month</div>
              <div className="text-3xl">
                {new Date().toLocaleString('default', { month: 'short' })}
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-white/20 pt-6">
            <Link href="/admin" className="text-blue-100 underline hover:text-white">
              Open Payload Admin →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
