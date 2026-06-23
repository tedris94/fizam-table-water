import { NextResponse } from 'next/server'
import { ALL_CAPABILITY_KEYS, toCapabilityPayload } from '@/lib/capabilities'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { canDeleteRole } from '@/lib/roleAssignments'
import { getDashboardRoleBySlug } from '@/lib/resolveCapabilities'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ slug: string }> }

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'roles.manage')
  if (!auth.ok) return auth.response

  const { slug } = await params
  const role = await getDashboardRoleBySlug(slug)
  if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
  return NextResponse.json(role)
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'roles.manage')
  if (!auth.ok) return auth.response

  const { slug } = await params
  const existing = await getDashboardRoleBySlug(slug)
  if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

  if (slug === 'super_admin' && auth.user.id !== existing.id) {
    // always allow editing super_admin role capabilities except stripping users.manage from self - handled below
  }

  try {
    const body = (await request.json()) as {
      name?: string
      description?: string
      capabilities?: string[]
    }

    const capabilities = (body.capabilities ?? []).filter((k) => ALL_CAPABILITY_KEYS.includes(k))

    if (slug === 'super_admin') {
      for (const required of ['users.manage', 'roles.manage', 'diagnostics.view']) {
        if (!capabilities.includes(required)) capabilities.push(required)
      }
    }

    if (capabilities.length === 0) {
      return NextResponse.json({ error: 'Select at least one capability.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    await payload.update({
      collection: 'dashboard-roles',
      id: parseId(String(existing.id)),
      data: {
        ...(body.name?.trim() ? { name: body.name.trim() } : {}),
        description: body.description?.trim() ?? existing.description,
        capabilities: toCapabilityPayload(capabilities),
      },
      overrideAccess: true,
    })

    const role = await getDashboardRoleBySlug(slug)
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    return NextResponse.json(role)
  } catch (e) {
    console.error('[admin/dashboard-roles PUT]', e)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'roles.manage')
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can delete roles.' }, { status: 403 })
  }

  const { slug } = await params
  const existing = await getDashboardRoleBySlug(slug)
  if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
  if (!canDeleteRole(existing)) {
    return NextResponse.json({ error: 'This role cannot be deleted.' }, { status: 400 })
  }

  try {
    const payload = await getPayloadSingleton()
    const usersWithRole = await payload.find({
      collection: 'users',
      where: { role: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (usersWithRole.docs.length > 0) {
      return NextResponse.json(
        { error: 'Reassign or remove users with this role before deleting it.' },
        { status: 400 },
      )
    }

    await payload.delete({
      collection: 'dashboard-roles',
      id: parseId(String(existing.id)),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/dashboard-roles DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
