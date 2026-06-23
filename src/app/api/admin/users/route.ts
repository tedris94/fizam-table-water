import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { canAssignRole, filterAssignableRoles } from '@/lib/roleAssignments'
import { ensureDashboardRolesSeeded, getDashboardRoleBySlug, toRoleRecord } from '@/lib/resolveCapabilities'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function toUserResponse(doc: {
  id: number | string
  email: string
  fullName: string
  role: string
  createdAt?: string
  updatedAt?: string
}) {
  return {
    id: doc.id,
    email: doc.email,
    fullName: doc.fullName,
    role: doc.role,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  }
}

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'users.manage')
  if (!auth.ok) return auth.response

  try {
    const payload = await getPayloadSingleton()
    await ensureDashboardRolesSeeded()
    const [result, rolesResult] = await Promise.all([
      payload.find({
        collection: 'users',
        limit: 500,
        sort: 'fullName',
        overrideAccess: true,
      }),
      payload.find({
        collection: 'dashboard-roles',
        limit: 50,
        sort: 'name',
        overrideAccess: true,
      }),
    ])
    return NextResponse.json(
      {
        users: result.docs.map((doc) =>
          toUserResponse(doc as { id: number | string; email: string; fullName: string; role: string }),
        ),
        roleOptions: filterAssignableRoles(
          rolesResult.docs.map((doc) => {
            const role = toRoleRecord(doc as Parameters<typeof toRoleRecord>[0])
            return { slug: role.slug, name: role.name }
          }),
          auth.user.role,
        ),
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[admin/users GET]', e)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await authorizeCapability(request, 'users.manage')
  if (!auth.ok) return auth.response

  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      fullName?: string
      role?: string
    }

    const email = body.email?.trim().toLowerCase()
    const password = body.password?.trim()
    const fullName = body.fullName?.trim()
    const role = body.role?.trim() || 'user'

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required.' },
        { status: 400 },
      )
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    await ensureDashboardRolesSeeded()
    if (!canAssignRole(auth.user.role, role)) {
      return NextResponse.json({ error: 'You cannot assign the super admin role.' }, { status: 403 })
    }
    const roleDoc = await getDashboardRoleBySlug(role)
    if (!roleDoc) {
      return NextResponse.json({ error: 'Unknown role selected.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    const created = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        fullName,
        role,
      },
      overrideAccess: true,
    })

    return NextResponse.json(
      toUserResponse(created as { id: number | string; email: string; fullName: string; role: string }),
      { status: 201 },
    )
  } catch (e) {
    console.error('[admin/users POST]', e)
    const message = e instanceof Error && e.message.includes('unique') ? 'Email already in use.' : 'Failed to create user.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
