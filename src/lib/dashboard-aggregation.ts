import type { Payload } from 'payload'

export async function fetchDashboardAggregation(payload: Payload) {
  const [ordersRes, productsRes, teamRes, jobsRes, applicationsRes, usersRes] =
    await Promise.all([
      payload.find({ collection: 'orders', limit: 10000, depth: 0 }),
      payload.find({ collection: 'products', limit: 10000, depth: 0 }),
      payload.find({ collection: 'team-members', limit: 10000, depth: 0 }),
      payload.find({ collection: 'jobs', limit: 10000, depth: 0 }),
      payload.find({ collection: 'applications', limit: 10000, depth: 0 }),
      payload.find({ collection: 'users', limit: 10000, depth: 0 }),
    ])

  const orders = ordersRes.docs
  const products = productsRes.docs
  const team = teamRes.docs
  const jobs = jobsRes.docs
  const applications = applicationsRes.docs
  const users = usersRes.docs

  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const completedOrders = orders.filter((o) => o.status === 'delivered').length
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  // Real month-over-month revenue growth (current calendar month vs previous).
  const now = new Date()
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`
  const currentKey = monthKey(now)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevKey = monthKey(prevDate)
  let currentMonthRevenue = 0
  let prevMonthRevenue = 0
  for (const o of orders) {
    const key = monthKey(new Date(String(o.createdAt)))
    if (key === currentKey) currentMonthRevenue += Number(o.total) || 0
    else if (key === prevKey) prevMonthRevenue += Number(o.total) || 0
  }
  const monthlyGrowth =
    prevMonthRevenue > 0
      ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 1000) / 10
      : currentMonthRevenue > 0
        ? 100
        : 0
  const lowStockProducts = products.filter((p) => Number(p.stock) < 100).length
  const activeJobs = jobs.filter((j) => j.status === 'active').length
  const pendingApplications = applications.filter((a) => a.status === 'pending').length

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(String(b.createdAt)).getTime() -
        new Date(String(a.createdAt)).getTime(),
    )
    .slice(0, 10)
    .map((o) => ({
      id: String(o.id),
      customer_name: o.customerName ?? o.shipping?.fullName ?? '',
      total: Number(o.total) || 0,
      created_at: o.createdAt,
      status: o.status,
    }))

  return {
    stats: {
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalProducts: products.length,
      lowStockProducts,
      totalUsers: users.length,
      teamMembers: team.length,
      activeJobs,
      pendingApplications,
      monthlyGrowth,
    },
    recentOrders,
  }
}
