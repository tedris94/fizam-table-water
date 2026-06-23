import { NextResponse } from 'next/server'
import { ALL_CAPABILITY_KEYS, toCapabilityPayload } from '@/lib/capabilities'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { slugifyRoleName } from '@/lib/roleAssignments'
import {
  ensureDashboardRolesSeeded,
  getDashboardRoleBySlug,
  toRoleRecord,
} from '@/lib/resolveCapabilities'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'roles.manage')
  if (!auth.ok) return auth.response

  try {
    await ensureDashboardRolesSeeded()
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'dashboard-roles',
      limit: 50,
      sort: 'name',
      overrideAccess: true,
    })
    return NextResponse.json(
      result.docs.map((doc) => toRoleRecord(doc as Parameters<typeof toRoleRecord>[0])),
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[admin/dashboard-roles GET]', e)
    return NextResponse.json({ error: 'Failed to load roles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await authorizeCapability(request, 'roles.manage')
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can create roles.' }, { status: 403 })
  }

  try {
    const body = (await request.json()) as {
      name?: string
      slug?: string
      description?: string
      capabilities?: string[]
    }

    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json({ error: 'Role name is required.' }, { status: 400 })
    }

    const slug = (body.slug?.trim() || slugifyRoleName(name)).toLowerCase()
    if (!slug || !/^[a-z][a-z0-9_]*$/.test(slug)) {
      return NextResponse.json(
        { error: 'Role slug must start with a letter and use only letters, numbers, and underscores.' },
        { status: 400 },
      )
    }

    await ensureDashboardRolesSeeded()
    const existing = await getDashboardRoleBySlug(slug)
    if (existing) {
      return NextResponse.json({ error: 'A role with this slug already exists.' }, { status: 400 })
    }

    const capabilities = (body.capabilities?.length
      ? body.capabilities
      : ['dashboard.home', 'settings.view']
    ).filter((k) => ALL_CAPABILITY_KEYS.includes(k))

    const payload = await getPayloadSingleton()
    const created = await payload.create({
      collection: 'dashboard-roles',
      data: {
        slug,
        name,
        description: body.description?.trim() || `Custom ${name} role`,
        capabilities: toCapabilityPayload(capabilities),
        isSystem: false,
      },
      overrideAccess: true,
    })

    return NextResponse.json(
      toRoleRecord(created as Parameters<typeof toRoleRecord>[0]),
      { status: 201 },
    )
  } catch (e) {
    console.error('[admin/dashboard-roles POST]', e)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
