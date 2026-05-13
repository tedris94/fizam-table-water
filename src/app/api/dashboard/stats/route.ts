import { NextResponse } from 'next/server'
import { getPayloadSingleton } from '@/lib/payload'
import { fetchDashboardAggregation } from '@/lib/dashboard-aggregation'
import type { User } from '@/payload-types'

export async function GET(request: Request) {
  const payload = await getPayloadSingleton()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = (user as User).role
  if (!['super_admin', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await fetchDashboardAggregation(payload)
  return NextResponse.json(data)
}
