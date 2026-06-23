'use client'

import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsViewProps {
  role: string;
}

export function AnalyticsView({ role }: AnalyticsViewProps) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    conversionRate: 3.24
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        const tr = data.stats.totalRevenue || 0
        const to = data.stats.totalOrders || 0
        setStats({
          totalRevenue: tr,
          totalOrders: to,
          avgOrderValue: tr / (to || 1),
          conversionRate: 3.24,
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Sales trend data
  const salesData = [
    { month: 'Jan', revenue: 850000, orders: 420 },
    { month: 'Feb', revenue: 920000, orders: 460 },
    { month: 'Mar', revenue: 780000, orders: 390 },
    { month: 'Apr', revenue: 1050000, orders: 525 },
    { month: 'May', revenue: 1200000, orders: 600 },
  ];

  // Product distribution data
  const productData = [
    { name: 'Sachet Water (50cl)', value: 40, color: '#2563eb' },
    { name: 'Table Water (35cl)', value: 15, color: '#38bdf8' },
    { name: 'Table Water (50cl)', value: 25, color: '#0ea5e9' },
    { name: 'Table Water (75cl)', value: 13, color: '#06b6d4' },
    { name: 'Dispenser (19L)', value: 7, color: '#1a1f71' },
  ];

  // Monthly performance data
  const monthlyPerformance = [
    { month: 'January', revenue: 850000, orders: 420, growth: 12 },
    { month: 'December', revenue: 780000, orders: 390, growth: 8 },
    { month: 'November', revenue: 720000, orders: 360, growth: 5 },
    { month: 'October', revenue: 680000, orders: 340, growth: 7 },
    { month: 'September', revenue: 640000, orders: 320, growth: 10 },
  ];

  const COLORS = ['#2563eb', '#0ea5e9', '#06b6d4', '#1a1f71'];

  return (
    <DashboardLayout title="Analytics" role={role}>
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Total Revenue</div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">
              ₦{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">+15% from last month</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Orders</div>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">
              {stats.totalOrders.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">+8% from last month</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Avg. Order Value</div>
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">
              ₦{Math.round(stats.avgOrderValue).toLocaleString()}
            </div>
            <div className="text-sm text-purple-600">+3% from last month</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Conversion Rate</div>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">{stats.conversionRate}%</div>
            <div className="text-sm text-orange-600">+0.5% from last month</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-6">Sales Trend (Revenue)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₦${(value / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Product Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-6">Product Distribution (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value}%`} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {productData.map((product, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="text-xs text-gray-600">{product.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders by Month Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl text-[#1a1f71] mb-6">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [value.toLocaleString(), 'Orders']}
              />
              <Legend />
              <Bar
                dataKey="orders"
                fill="#2563eb"
                radius={[8, 8, 0, 0]}
                name="Orders"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Performance Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl text-[#1a1f71] mb-4">Monthly Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Month</th>
                  <th className="text-right py-3 px-4 text-gray-600 text-sm">Revenue</th>
                  <th className="text-right py-3 px-4 text-gray-600 text-sm">Orders</th>
                  <th className="text-right py-3 px-4 text-gray-600 text-sm">Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyPerformance.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-[#1a1f71]">{row.month}</td>
                    <td className="py-3 px-4 text-right">₦{row.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{row.orders}</td>
                    <td className="py-3 px-4 text-right text-green-600">+{row.growth}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
