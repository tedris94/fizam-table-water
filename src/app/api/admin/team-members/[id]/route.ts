import { NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/auth'
import { getPayloadSingleton } from '@/lib/payload'
import { photoIdForPayload, toTeamMemberResponse } from '@/lib/teamMemberApi'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type TeamMemberPayload = {
  name?: string
  position?: string
  department?: string
  bio?: string
  email?: string
  linkedin?: string
  twitter?: string
  sortOrder?: number
  photoId?: number | string | null
}

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (!isAdminRole(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = (await request.json()) as TeamMemberPayload
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
      data.name = name
    }
    if (body.position !== undefined) {
      const position = String(body.position).trim()
      if (!position) return NextResponse.json({ error: 'Position is required.' }, { status: 400 })
      data.position = position
    }
    if (body.department !== undefined) data.department = String(body.department).trim()
    if (body.bio !== undefined) data.bio = String(body.bio).trim()
    if (body.email !== undefined) data.email = String(body.email).trim() || null
    if (body.linkedin !== undefined) data.linkedin = String(body.linkedin).trim() || null
    if (body.twitter !== undefined) data.twitter = String(body.twitter).trim() || null
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0
    if (body.photoId !== undefined) {
      data.photo = photoIdForPayload(body.photoId) ?? null
    }

    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'team-members',
      id: parseId(id),
      data,
      overrideAccess: true,
    })
    const withPhoto = await payload.findByID({
      collection: 'team-members',
      id: updated.id,
      depth: 1,
      overrideAccess: true,
    })
    return NextResponse.json(toTeamMemberResponse(withPhoto))
  } catch (e) {
    console.error('[admin/team-members PUT]', e)
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (user?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can delete team members.' }, { status: 403 })
  }
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    await payload.delete({
      collection: 'team-members',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/team-members DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}
