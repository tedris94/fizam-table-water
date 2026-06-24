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

export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!isAdminRole(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'team-members',
      limit: 500,
      sort: 'sortOrder',
      depth: 1,
      overrideAccess: true,
    })
    return NextResponse.json(result.docs.map(toTeamMemberResponse), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (e) {
    console.error('[admin/team-members GET]', e)
    return NextResponse.json({ error: 'Failed to load team members' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request)
  if (!isAdminRole(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await request.json()) as TeamMemberPayload
    const name = body.name?.trim()
    const position = body.position?.trim()
    if (!name || !position) {
      return NextResponse.json({ error: 'Name and position are required.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    const photo = photoIdForPayload(body.photoId)
    const created = await payload.create({
      collection: 'team-members',
      data: {
        name,
        position,
        department: body.department?.trim() || undefined,
        bio: body.bio?.trim() || undefined,
        email: body.email?.trim() || undefined,
        linkedin: body.linkedin?.trim() || undefined,
        twitter: body.twitter?.trim() || undefined,
        sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0,
        ...(photo !== undefined ? { photo } : {}),
      },
      overrideAccess: true,
    })
    const withPhoto = await payload.findByID({
      collection: 'team-members',
      id: created.id,
      depth: 1,
      overrideAccess: true,
    })
    return NextResponse.json(toTeamMemberResponse(withPhoto), { status: 201 })
  } catch (e) {
    console.error('[admin/team-members POST]', e)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
