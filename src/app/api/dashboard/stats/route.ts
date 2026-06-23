import { NextResponse } from 'next/server'
import { fetchDashboardAggregation } from '@/lib/dashboard-aggregation'
import { getCurrentUser, isAdminRole } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { getPayloadSingleton } = await import('@/lib/payload')
  const payload = await getPayloadSingleton()
  const data = await fetchDashboardAggregation(payload)
  return NextResponse.json(data)
}
