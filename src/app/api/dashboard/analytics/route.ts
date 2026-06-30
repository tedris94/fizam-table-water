import { NextResponse } from 'next/server'
import { fetchAnalyticsAggregation } from '@/lib/analytics-aggregation'
import { getCurrentUser, isAdminRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const months = Math.min(Math.max(Number(searchParams.get('months')) || 6, 1), 12)

  const { getPayloadSingleton } = await import('@/lib/payload')
  const payload = await getPayloadSingleton()
  const data = await fetchAnalyticsAggregation(payload, months)
  return NextResponse.json(data)
}
