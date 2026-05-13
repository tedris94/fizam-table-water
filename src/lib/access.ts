import type { Access, CollectionConfig } from 'payload'

const staffRoles = ['super_admin', 'admin', 'hr'] as const

export const isAuthenticated: Access = ({ req }) => Boolean(req.user)

export const isStaff: Access = ({ req }) => {
  const role = (req.user as { role?: string } | undefined)?.role
  return Boolean(role && staffRoles.includes(role as (typeof staffRoles)[number]))
}

export const isSuperAdminOrAdmin: Access = ({ req }) => {
  const role = (req.user as { role?: string } | undefined)?.role
  return role === 'super_admin' || role === 'admin'
}

export const isSuperAdmin: Access = ({ req }) =>
  (req.user as { role?: string } | undefined)?.role === 'super_admin'

export const isHR: Access = ({ req }) => {
  const role = (req.user as { role?: string } | undefined)?.role
  return role === 'super_admin' || role === 'admin' || role === 'hr'
}
