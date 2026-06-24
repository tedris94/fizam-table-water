import {
  ALL_CAPABILITIES,
  ALL_CAPABILITY_KEYS,
  capabilitiesForRoleSlug,
  type CapabilityDef,
  DEFAULT_ROLE_CAPABILITIES,
  toCapabilityPayload,
} from '@/lib/capabilities'
import { getPayloadSingleton } from '@/lib/payload'

export type DashboardRoleRecord = {
  id: number | string
  slug: string
  name: string
  description: string
  capabilities: string[]
  isSystem: boolean
}

const ROLE_SLUGS = Object.keys(DEFAULT_ROLE_CAPABILITIES)

function toRoleRecord(doc: {
  id: number | string
  slug: string
  name: string
  description?: string | null
  capabilities?: { key?: string | null }[] | null
  isSystem?: boolean | null
}): DashboardRoleRecord {
  const caps =
    doc.capabilities
      ?.map((c) => c.key?.trim())
      .filter((k): k is string => Boolean(k)) ?? []

  return {
    id: doc.id,
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? '',
    capabilities: caps.length > 0 ? caps : capabilitiesForRoleSlug(doc.slug),
    isSystem: doc.isSystem !== false,
  }
}

export async function ensureDashboardRolesSeeded() {
  const payload = await getPayloadSingleton()

  for (const slug of ROLE_SLUGS) {
    const existing = await payload.find({
      collection: 'dashboard-roles',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) continue

    const defaults = DEFAULT_ROLE_CAPABILITIES[slug] ?? ['dashboard.home']
    const name =
      slug === 'super_admin'
        ? 'Super Admin'
        : slug === 'hr'
          ? 'HR'
          : slug.charAt(0).toUpperCase() + slug.slice(1).replace('_', ' ')

    await payload.create({
      collection: 'dashboard-roles',
      data: {
        slug,
        name,
        description: `Default ${name} role`,
        capabilities: toCapabilityPayload(defaults),
        isSystem: true,
      },
      overrideAccess: true,
    })
  }
}

export async function getDashboardRoleBySlug(slug: string): Promise<DashboardRoleRecord | null> {
  await ensureDashboardRolesSeeded()
  const payload = await getPayloadSingleton()
  const result = await payload.find({
    collection: 'dashboard-roles',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  if (!doc) return null
  return toRoleRecord(doc as Parameters<typeof toRoleRecord>[0])
}

export async function getCapabilitiesForRoleSlug(roleSlug: string | undefined | null): Promise<string[]> {
  if (!roleSlug) return []
  if (roleSlug === 'super_admin') return [...ALL_CAPABILITY_KEYS]

  const role = await getDashboardRoleBySlug(roleSlug)
  if (role) return role.capabilities

  return capabilitiesForRoleSlug(roleSlug)
}

export async function getCapabilitiesForUser(user: {
  role?: string | null
} | null): Promise<string[]> {
  if (!user?.role) return []
  return getCapabilitiesForRoleSlug(user.role)
}

export function groupCapabilitiesByGroup() {
  const groups = new Map<string, CapabilityDef[]>()
  for (const def of ALL_CAPABILITIES) {
    const list = groups.get(def.group) ?? []
    list.push(def)
    groups.set(def.group, list)
  }
  return groups
}

export { toRoleRecord }
