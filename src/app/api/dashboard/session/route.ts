import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ALL_CAPABILITIES } from '@/lib/capabilities'
import {
  getCapabilitiesForUser,
  getDashboardRoleBySlug,
} from '@/lib/resolveCapabilities'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ user: null, capabilities: [], roleName: null })
  }

  const capabilities = await getCapabilitiesForUser(user)
  const roleDoc = user.role ? await getDashboardRoleBySlug(user.role) : null

  return NextResponse.json(
    {
      user,
      capabilities,
      roleName: roleDoc?.name ?? user.role,
      capabilityCatalog: ALL_CAPABILITIES,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
