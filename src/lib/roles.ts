import type { User } from '@/payload-types'

export type Role = 'super_admin' | 'admin' | 'hr' | 'user'

export function getRole(user: User | null): Role | null {
  if (!user) return null
  const r = (user as User & { role?: Role }).role
  return r ?? null
}
