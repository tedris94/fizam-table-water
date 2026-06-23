import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { hasCapability } from '@/lib/capabilities'
import { getCapabilitiesForUser } from '@/lib/resolveCapabilities'
import type { User } from '@/payload-types'

export async function authorizeCapability(
  request: Request,
  capability: string,
): Promise<
  | { ok: true; user: User; capabilities: string[] }
  | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser(request)
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const capabilities = await getCapabilitiesForUser(user)
  if (!hasCapability(capabilities, capability)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user, capabilities }
}

export async function authorizeAnyCapability(
  request: Request,
  capabilityList: string[],
): Promise<
  | { ok: true; user: User; capabilities: string[] }
  | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser(request)
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const capabilities = await getCapabilitiesForUser(user)
  const allowed = capabilityList.some((cap) => hasCapability(capabilities, cap))
  if (!allowed) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user, capabilities }
}
