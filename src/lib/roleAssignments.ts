import type { DashboardRoleRecord } from '@/lib/resolveCapabilities'

const PROTECTED_ROLE_SLUG = 'super_admin'

/** Roles a user may assign to others based on their own role. */
export function filterAssignableRoles<T extends { slug: string }>(
  roles: T[],
  actorRole: string | undefined | null,
): T[] {
  if (actorRole === PROTECTED_ROLE_SLUG) return roles
  return roles.filter((role) => role.slug !== PROTECTED_ROLE_SLUG)
}

export function canAssignRole(actorRole: string | undefined | null, targetRoleSlug: string) {
  if (targetRoleSlug === PROTECTED_ROLE_SLUG) {
    return actorRole === PROTECTED_ROLE_SLUG
  }
  return true
}

export function slugifyRoleName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48)
}

export function isProtectedRoleSlug(slug: string) {
  return slug === PROTECTED_ROLE_SLUG
}

export function canDeleteRole(role: Pick<DashboardRoleRecord, 'slug' | 'isSystem'>) {
  if (isProtectedRoleSlug(role.slug)) return false
  return role.isSystem === false
}
