import type { Payload } from 'payload'

const CHART_COLORS = ['#2563eb', '#0ea5e9', '#06b6d4', '#1a1f71', '#38bdf8', '#7c3aed', '#f59e0b']

// Standard Web Vitals thresholds (good upper-bounds). CLS is unitless; others are ms.
const VITAL_THRESHOLDS: Record<string, { good: number; poor: number; unit: 'ms' | '' }> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short' })
}

function fullMonthLabel(d: Date): string {
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function pct(curr: number, prev: number): number {
  if (prev <= 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

type AnalyticsEventDoc = {
  type: string
  path?: string | null
  sessionId?: string | null
  visitorId?: string | null
  target?: string | null
  resourceType?: string | null
  metricName?: string | null
  metricValue?: number | null
  rating?: string | null
  createdAt: string
}

type OrderDoc = {
  total?: number | null
  status?: string | null
  createdAt: string
  items?: { product?: number | string | { id: number | string } | null; quantity?: number | null }[]
}

export async function fetchAnalyticsAggregation(payload: Payload, months = 6) {
  const now = new Date()
  const since = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const sinceVisits = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // last 14 days

  const [ordersRes, productsRes, eventsRes] = await Promise.all([
    payload.find({ collection: 'orders', limit: 100000, depth: 0 }),
    payload.find({ collection: 'products', limit: 10000, depth: 0 }),
    payload.find({
      collection: 'analytics-events',
      limit: 100000,
      depth: 0,
      where: { createdAt: { greater_than: since.toISOString() } },
    }),
  ])

  const orders = ordersRes.docs as unknown as OrderDoc[]
  const products = productsRes.docs as unknown as { id: number | string; name?: string; size?: string }[]
  const events = eventsRes.docs as unknown as AnalyticsEventDoc[]

  const productName = new Map<string, string>()
  for (const p of products) {
    productName.set(String(p.id), `${p.name ?? 'Product'}${p.size ? ` (${p.size})` : ''}`)
  }

  // ---- Build month buckets (oldest -> newest) ----
  const buckets: { key: string; label: string; full: string; date: Date }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: monthKey(d), label: monthLabel(d), full: fullMonthLabel(d), date: d })
  }

  const revenueByMonth = new Map<string, number>()
  const ordersByMonth = new Map<string, number>()
  for (const o of orders) {
    const key = monthKey(new Date(o.createdAt))
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + (Number(o.total) || 0))
    ordersByMonth.set(key, (ordersByMonth.get(key) ?? 0) + 1)
  }

  const salesTrend = buckets.map((b) => ({
    month: b.label,
    revenue: revenueByMonth.get(b.key) ?? 0,
    orders: ordersByMonth.get(b.key) ?? 0,
  }))

  // Monthly performance table (newest first), growth vs previous month.
  const monthlyPerformance = [...buckets]
    .map((b, idx) => {
      const revenue = revenueByMonth.get(b.key) ?? 0
      const prev = idx > 0 ? revenueByMonth.get(buckets[idx - 1].key) ?? 0 : 0
      return {
        month: b.full,
        revenue,
        orders: ordersByMonth.get(b.key) ?? 0,
        growth: pct(revenue, prev),
      }
    })
    .reverse()

  // ---- Visits / clicks (whole window) ----
  const pageviews = events.filter((e) => e.type === 'pageview')
  const clicks = events.filter((e) => e.type === 'click')
  const served = events.filter((e) => e.type === 'resource_served')
  const vitals = events.filter((e) => e.type === 'web_vital')

  const uniqueVisitorIds = new Set(pageviews.map((e) => e.visitorId || e.sessionId).filter(Boolean))
  const totalPageviews = pageviews.length
  const totalClicks = clicks.length
  const uniqueVisitors = uniqueVisitorIds.size
  const clickRate = totalPageviews > 0 ? Math.round((totalClicks / totalPageviews) * 1000) / 10 : 0

  // Visits trend (last 14 days, by day).
  const dayKeys: { key: string; label: string }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(sinceVisits.getFullYear(), sinceVisits.getMonth(), sinceVisits.getDate() + (13 - i))
    const key = d.toISOString().slice(0, 10)
    dayKeys.push({ key, label: d.toLocaleString('en-US', { month: 'short', day: 'numeric' }) })
  }
  const visitsByDay = new Map<string, number>()
  const visitorsByDay = new Map<string, Set<string>>()
  for (const e of pageviews) {
    const key = new Date(e.createdAt).toISOString().slice(0, 10)
    visitsByDay.set(key, (visitsByDay.get(key) ?? 0) + 1)
    const set = visitorsByDay.get(key) ?? new Set<string>()
    if (e.visitorId || e.sessionId) set.add(e.visitorId || e.sessionId!)
    visitorsByDay.set(key, set)
  }
  const visitsTrend = dayKeys.map((d) => ({
    date: d.label,
    visits: visitsByDay.get(d.key) ?? 0,
    visitors: visitorsByDay.get(d.key)?.size ?? 0,
  }))

  // Top clicked resources.
  const clickCounts = new Map<string, number>()
  for (const c of clicks) {
    const label = (c.target || '(unknown)').slice(0, 80)
    clickCounts.set(label, (clickCounts.get(label) ?? 0) + 1)
  }
  const topResourcesClicked = [...clickCounts.entries()]
    .map(([target, count]) => ({ target, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Top served pages (by pageview path).
  const pageCounts = new Map<string, number>()
  for (const p of pageviews) {
    const path = (p.path || '/').slice(0, 80)
    pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1)
  }
  const topPagesServed = [...pageCounts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Top served resources (data-resource impressions).
  const resourceCounts = new Map<string, number>()
  for (const r of served) {
    const label = (r.target || '(unknown)').slice(0, 80)
    resourceCounts.set(label, (resourceCounts.get(label) ?? 0) + 1)
  }
  const topResourcesServed = [...resourceCounts.entries()]
    .map(([target, count]) => ({ target, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // ---- Product distribution (from order items) ----
  const qtyByProduct = new Map<string, number>()
  let totalQty = 0
  for (const o of orders) {
    for (const item of o.items ?? []) {
      const raw = item.product
      const id =
        raw && typeof raw === 'object' ? String((raw as { id: number | string }).id) : String(raw)
      const qty = Number(item.quantity) || 0
      if (!id || id === 'null' || id === 'undefined' || qty <= 0) continue
      qtyByProduct.set(id, (qtyByProduct.get(id) ?? 0) + qty)
      totalQty += qty
    }
  }
  const productDistribution = [...qtyByProduct.entries()]
    .map(([id, qty]) => ({
      name: productName.get(id) ?? `Product #${id}`,
      qty,
      value: totalQty > 0 ? Math.round((qty / totalQty) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 7)
    .map((row, idx) => ({ name: row.name, value: row.value, color: CHART_COLORS[idx % CHART_COLORS.length] }))

  // ---- Web Vitals (averages + rating) ----
  const vitalGroups = new Map<string, number[]>()
  for (const v of vitals) {
    if (!v.metricName || typeof v.metricValue !== 'number') continue
    const arr = vitalGroups.get(v.metricName) ?? []
    arr.push(v.metricValue)
    vitalGroups.set(v.metricName, arr)
  }
  const webVitals = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']
    .filter((name) => vitalGroups.has(name))
    .map((name) => {
      const arr = vitalGroups.get(name)!
      const avg = arr.reduce((s, n) => s + n, 0) / arr.length
      const t = VITAL_THRESHOLDS[name]
      let rating = 'good'
      if (t) rating = avg <= t.good ? 'good' : avg <= t.poor ? 'needs-improvement' : 'poor'
      return {
        name,
        value: t?.unit === 'ms' ? Math.round(avg) : Math.round(avg * 1000) / 1000,
        unit: t?.unit ?? 'ms',
        rating,
        samples: arr.length,
      }
    })

  // ---- Overview + period-over-period changes ----
  const currKey = buckets[buckets.length - 1].key
  const prevKey = buckets.length > 1 ? buckets[buckets.length - 2].key : currKey
  const currRevenue = revenueByMonth.get(currKey) ?? 0
  const prevRevenue = revenueByMonth.get(prevKey) ?? 0
  const currOrders = ordersByMonth.get(currKey) ?? 0
  const prevOrders = ordersByMonth.get(prevKey) ?? 0
  const currAov = currOrders > 0 ? currRevenue / currOrders : 0
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0

  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const conversionRate = uniqueVisitors > 0 ? Math.round((totalOrders / uniqueVisitors) * 1000) / 10 : 0

  // Conversion comparison needs visitors per month; approximate with current-window visitors.
  const currVisitors = visitorsForMonth(pageviews, currKey)
  const prevVisitors = visitorsForMonth(pageviews, prevKey)
  const currConv = currVisitors > 0 ? (currOrders / currVisitors) * 100 : 0
  const prevConv = prevVisitors > 0 ? (prevOrders / prevVisitors) * 100 : 0

  return {
    overview: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      conversionRate,
      revenueChangePct: pct(currRevenue, prevRevenue),
      ordersChangePct: pct(currOrders, prevOrders),
      aovChangePct: pct(currAov, prevAov),
      conversionChangePct: pct(currConv, prevConv),
    },
    visits: {
      totalPageviews,
      uniqueVisitors,
      totalClicks,
      clickRate,
    },
    salesTrend,
    visitsTrend,
    productDistribution,
    monthlyPerformance,
    topResourcesClicked,
    topPagesServed,
    topResourcesServed,
    webVitals,
  }
}

function visitorsForMonth(pageviews: AnalyticsEventDoc[], key: string): number {
  const set = new Set<string>()
  for (const e of pageviews) {
    if (monthKey(new Date(e.createdAt)) !== key) continue
    if (e.visitorId || e.sessionId) set.add(e.visitorId || e.sessionId!)
  }
  return set.size
}
