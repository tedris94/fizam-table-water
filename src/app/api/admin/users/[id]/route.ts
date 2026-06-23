import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { canAssignRole } from '@/lib/roleAssignments'
import { ensureDashboardRolesSeeded, getDashboardRoleBySlug } from '@/lib/resolveCapabilities'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

function toUserResponse(doc: {
  id: number | string
  email: string
  fullName: string
  role: string
}) {
  return {
    id: doc.id,
    email: doc.email,
    fullName: doc.fullName,
    role: doc.role,
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'users.manage')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const body = (await request.json()) as {
      email?: string
      fullName?: string
      role?: string
      password?: string
    }

    const data: Record<string, string> = {}
    if (body.fullName?.trim()) data.fullName = body.fullName.trim()
    if (body.email?.trim()) data.email = body.email.trim().toLowerCase()
    if (body.role?.trim()) data.role = body.role.trim()
    if (body.password?.trim()) {
      if (body.password.trim().length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
      }
      data.password = body.password.trim()
    }

    if (String(auth.user.id) === String(parseId(id)) && body.role && body.role !== auth.user.role) {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 })
    }

    if (body.role?.trim()) {
      await ensureDashboardRolesSeeded()
      const nextRole = body.role.trim()
      if (!canAssignRole(auth.user.role, nextRole)) {
        return NextResponse.json({ error: 'You cannot assign the super admin role.' }, { status: 403 })
      }
      const roleDoc = await getDashboardRoleBySlug(nextRole)
      if (!roleDoc) {
        return NextResponse.json({ error: 'Unknown role selected.' }, { status: 400 })
      }
    }

    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'users',
      id: parseId(id),
      data,
      overrideAccess: true,
    })

    return NextResponse.json(
      toUserResponse(updated as { id: number | string; email: string; fullName: string; role: string }),
    )
  } catch (e) {
    console.error('[admin/users PUT]', e)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'users.manage')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    if (String(auth.user.id) === String(parseId(id))) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    const target = await payload.findByID({
      collection: 'users',
      id: parseId(id),
      overrideAccess: true,
    })
    if ((target as { role?: string }).role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete a super admin account.' }, { status: 400 })
    }

    await payload.delete({
      collection: 'users',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/users DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
