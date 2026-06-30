'use client'

import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart, Activity,
  Eye, Users, MousePointerClick, Gauge,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsViewProps {
  role: string;
}

type AnalyticsData = {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
    revenueChangePct: number;
    ordersChangePct: number;
    aovChangePct: number;
    conversionChangePct: number;
  };
  visits: {
    totalPageviews: number;
    uniqueVisitors: number;
    totalClicks: number;
    clickRate: number;
  };
  salesTrend: { month: string; revenue: number; orders: number }[];
  visitsTrend: { date: string; visits: number; visitors: number }[];
  productDistribution: { name: string; value: number; color: string }[];
  monthlyPerformance: { month: string; revenue: number; orders: number; growth: number }[];
  topResourcesClicked: { target: string; count: number }[];
  topPagesServed: { path: string; count: number }[];
  topResourcesServed: { target: string; count: number }[];
  webVitals: { name: string; value: number; unit: string; rating: string; samples: number }[];
};

const EMPTY: AnalyticsData = {
  overview: {
    totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, conversionRate: 0,
    revenueChangePct: 0, ordersChangePct: 0, aovChangePct: 0, conversionChangePct: 0,
  },
  visits: { totalPageviews: 0, uniqueVisitors: 0, totalClicks: 0, clickRate: 0 },
  salesTrend: [], visitsTrend: [], productDistribution: [], monthlyPerformance: [],
  topResourcesClicked: [], topPagesServed: [], topResourcesServed: [], webVitals: [],
};

const COLORS = ['#2563eb', '#0ea5e9', '#06b6d4', '#1a1f71'];

function ChangeBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <div className={`text-sm flex items-center gap-1 ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      {up ? '+' : ''}{value}% from last month
    </div>
  );
}

const ratingColor: Record<string, string> = {
  good: 'text-green-600 bg-green-50',
  'needs-improvement': 'text-amber-600 bg-amber-50',
  poor: 'text-red-600 bg-red-50',
};

export function AnalyticsView({ role }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/dashboard/analytics?months=6', { credentials: 'include' });
        if (res.ok) {
          const json = (await res.json()) as AnalyticsData;
          if (!cancelled) setData({ ...EMPTY, ...json });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { overview, visits } = data;

  return (
    <DashboardLayout title="Analytics" role={role}>
      <div className="space-y-6">
        {loading && (
          <div className="text-sm text-gray-500">Loading live analytics…</div>
        )}

        {/* Sales Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Total Revenue</div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">₦{overview.totalRevenue.toLocaleString()}</div>
            <ChangeBadge value={overview.revenueChangePct} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Orders</div>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">{overview.totalOrders.toLocaleString()}</div>
            <ChangeBadge value={overview.ordersChangePct} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Avg. Order Value</div>
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">₦{Math.round(overview.avgOrderValue).toLocaleString()}</div>
            <ChangeBadge value={overview.aovChangePct} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Conversion Rate</div>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl text-[#1a1f71] mb-2">{overview.conversionRate}%</div>
            <ChangeBadge value={overview.conversionChangePct} />
          </div>
        </div>

        {/* Traffic Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Page Views</div>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl text-[#1a1f71]">{visits.totalPageviews.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">Last 6 months</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Unique Visitors</div>
              <Users className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="text-3xl text-[#1a1f71]">{visits.uniqueVisitors.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">Distinct sessions</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Total Clicks</div>
              <MousePointerClick className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl text-[#1a1f71]">{visits.totalClicks.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">Tracked interactions</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Click Rate</div>
              <Gauge className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl text-[#1a1f71]">{visits.clickRate}%</div>
            <div className="text-sm text-gray-500 mt-2">Clicks per page view</div>
          </div>
        </div>

        {/* Sales + Visits trend */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-6">Sales Trend (Revenue)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(v) => `₦${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5 }} activeDot={{ r: 7 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-6">Site Visits (last 14 days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.visitsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="visits" stroke="#2563eb" fill="#bfdbfe" name="Page views" />
                <Area type="monotone" dataKey="visitors" stroke="#0ea5e9" fill="#cffafe" name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product distribution + Monthly orders */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-6">Product Distribution (% by units sold)</h3>
            {data.productDistribution.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No order data yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie data={data.productDistribution} cx="50%" cy="50%" labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {data.productDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {data.productDistribution.map((product, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }} />
                      <span className="text-xs text-gray-600">{product.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-6">Monthly Orders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Orders']}
                />
                <Legend />
                <Bar dataKey="orders" fill="#2563eb" radius={[8, 8, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Web Vitals (performance) */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl text-[#1a1f71] mb-4">Performance (Core Web Vitals)</h3>
          {data.webVitals.length === 0 ? (
            <p className="text-sm text-gray-500">No performance samples collected yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {data.webVitals.map((v) => (
                <div key={v.name} className="rounded-xl border border-gray-100 p-4">
                  <div className="text-sm text-gray-500">{v.name}</div>
                  <div className="text-2xl text-[#1a1f71] mt-1">
                    {v.value}{v.unit === 'ms' ? 'ms' : ''}
                  </div>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${ratingColor[v.rating] ?? 'text-gray-600 bg-gray-50'}`}>
                    {v.rating}
                  </span>
                  <div className="text-[11px] text-gray-400 mt-1">{v.samples} samples</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top clicked + served resources */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-4">Top Clicked Resources</h3>
            {data.topResourcesClicked.length === 0 ? (
              <p className="text-sm text-gray-500">No clicks tracked yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.topResourcesClicked.map((r, i) => (
                  <li key={i} className="flex items-center justify-between text-sm border-b border-gray-100 py-2">
                    <span className="text-gray-700 truncate pr-4">{r.target}</span>
                    <span className="font-semibold text-[#1a1f71]">{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl text-[#1a1f71] mb-4">Top Served Pages</h3>
            {data.topPagesServed.length === 0 ? (
              <p className="text-sm text-gray-500">No page views tracked yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.topPagesServed.map((r, i) => (
                  <li key={i} className="flex items-center justify-between text-sm border-b border-gray-100 py-2">
                    <span className="text-gray-700 truncate pr-4">{r.path}</span>
                    <span className="font-semibold text-[#1a1f71]">{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                {data.monthlyPerformance.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-[#1a1f71]">{row.month}</td>
                    <td className="py-3 px-4 text-right">₦{row.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{row.orders}</td>
                    <td className={`py-3 px-4 text-right ${row.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.growth >= 0 ? '+' : ''}{row.growth}%
                    </td>
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
