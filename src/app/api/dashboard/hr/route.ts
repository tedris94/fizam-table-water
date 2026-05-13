import { NextResponse } from 'next/server'
import { getPayloadSingleton } from '@/lib/payload'
import type { User } from '@/payload-types'

export async function GET(request: Request) {
  const payload = await getPayloadSingleton()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = (user as User).role
  if (!['super_admin', 'admin', 'hr'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const team = await payload.find({ collection: 'team-members', limit: 10000 })
  const jobs = await payload.find({ collection: 'jobs', limit: 10000 })
  const applications = await payload.find({
    collection: 'applications',
    limit: 10000,
    sort: '-createdAt',
  })

  const apps = applications.docs
  const today = new Date().toISOString().split('T')[0]
  const newApplicationsToday = apps.filter((a) =>
    String(a.createdAt).startsWith(today),
  ).length

  const stats = {
    totalTeam: team.docs.length,
    activeJobs: jobs.docs.filter((j) => j.status === 'active').length,
    totalApplications: apps.length,
    pendingApplications: apps.filter((a) => a.status === 'pending').length,
    approvedApplications: apps.filter((a) => a.status === 'approved').length,
    rejectedApplications: apps.filter((a) => a.status === 'rejected').length,
    newApplicationsToday,
  }

  const recentApplications = apps.slice(0, 10).map((a) => ({
    id: a.id,
    full_name: a.fullName,
    job_title: a.jobTitle,
    created_at: a.createdAt,
    status: a.status,
  }))

  return NextResponse.json({ stats, recentApplications })
}
