import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  canManageCareers,
  requirementsToPayload,
  slugFromJobTitle,
  toJobResponse,
} from '@/lib/jobApi'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type JobPayload = {
  title?: string
  slug?: string
  department?: string
  location?: string
  type?: string
  salaryRange?: string
  description?: string
  requirements?: string[]
  postedDate?: string | null
  status?: 'active' | 'closed'
}

export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!canManageCareers(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'jobs',
      limit: 500,
      sort: '-postedDate',
      overrideAccess: true,
    })
    return NextResponse.json(result.docs.map(toJobResponse), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (e) {
    console.error('[admin/jobs GET]', e)
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request)
  if (!canManageCareers(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await request.json()) as JobPayload
    const title = body.title?.trim()
    const department = body.department?.trim()
    const location = body.location?.trim()
    const type = body.type?.trim()
    const description = body.description?.trim()

    if (!title || !department || !location || !type || !description) {
      return NextResponse.json(
        { error: 'Title, department, location, type, and description are required.' },
        { status: 400 },
      )
    }

    const slug = (body.slug?.trim() || slugFromJobTitle(title)).toLowerCase()
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    const created = await payload.create({
      collection: 'jobs',
      data: {
        title,
        slug,
        department,
        location,
        type,
        salaryRange: body.salaryRange?.trim() || undefined,
        description,
        requirements: requirementsToPayload(body.requirements ?? []),
        postedDate: body.postedDate || new Date().toISOString(),
        status: body.status === 'closed' ? 'closed' : 'active',
      },
      overrideAccess: true,
    })
    return NextResponse.json(toJobResponse(created), { status: 201 })
  } catch (e) {
    console.error('[admin/jobs POST]', e)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
