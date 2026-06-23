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

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (!canManageCareers(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = (await request.json()) as JobPayload
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) {
      const title = String(body.title).trim()
      if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
      data.title = title
    }
    if (body.slug !== undefined) {
      const slug = String(body.slug).trim() || slugFromJobTitle(String(body.title ?? ''))
      if (!slug) return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })
      data.slug = slug.toLowerCase()
    }
    if (body.department !== undefined) data.department = String(body.department).trim()
    if (body.location !== undefined) data.location = String(body.location).trim()
    if (body.type !== undefined) data.type = String(body.type).trim()
    if (body.salaryRange !== undefined) data.salaryRange = String(body.salaryRange).trim()
    if (body.description !== undefined) data.description = String(body.description).trim()
    if (body.requirements !== undefined) {
      data.requirements = requirementsToPayload(body.requirements)
    }
    if (body.postedDate !== undefined) data.postedDate = body.postedDate || null
    if (body.status !== undefined) data.status = body.status === 'closed' ? 'closed' : 'active'

    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'jobs',
      id: parseId(id),
      data,
      overrideAccess: true,
    })
    return NextResponse.json(toJobResponse(updated))
  } catch (e) {
    console.error('[admin/jobs PUT]', e)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (!canManageCareers(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    await payload.delete({
      collection: 'jobs',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/jobs DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
