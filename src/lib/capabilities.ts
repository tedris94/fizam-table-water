export type CapabilityDef = {
  key: string
  label: string
  group: string
  description?: string
}

/** Every permission the dashboard understands. Super admin can assign these per role. */
export const ALL_CAPABILITIES: CapabilityDef[] = [
  { key: 'dashboard.home', label: 'Dashboard home', group: 'General' },
  { key: 'analytics.view', label: 'Analytics', group: 'General' },
  { key: 'products.catalog', label: 'Product catalog', group: 'Products' },
  { key: 'products.categories', label: 'Product categories', group: 'Products' },
  { key: 'products.sizes', label: 'Product sizes', group: 'Products' },
  { key: 'products.tags', label: 'Product tags', group: 'Products' },
  { key: 'products.delete', label: 'Delete products', group: 'Products' },
  { key: 'orders.view', label: 'Orders', group: 'Commerce' },
  { key: 'shipping.view', label: 'Delivery locations', group: 'Commerce' },
  { key: 'team.view', label: 'Team members', group: 'People' },
  { key: 'team.delete', label: 'Delete team members', group: 'People' },
  { key: 'careers.manage', label: 'Careers / jobs', group: 'People' },
  { key: 'applications.manage', label: 'Job applications', group: 'People' },
  { key: 'applications.delete', label: 'Delete applications', group: 'People' },
  { key: 'organogram.view', label: 'Organogram', group: 'People' },
  { key: 'cms.view', label: 'CMS', group: 'Content' },
  { key: 'settings.view', label: 'Account settings', group: 'Settings' },
  { key: 'email.templates', label: 'Email templates', group: 'Settings' },
  { key: 'email.templates.all', label: 'Edit all email templates', group: 'Settings' },
  { key: 'diagnostics.view', label: 'System diagnostics', group: 'System' },
  { key: 'users.manage', label: 'Manage users', group: 'System' },
  { key: 'roles.manage', label: 'Manage roles & capabilities', group: 'System' },
]

export const ALL_CAPABILITY_KEYS = ALL_CAPABILITIES.map((c) => c.key)

export type CapabilityKey = (typeof ALL_CAPABILITIES)[number]['key']

export function toCapabilityPayload(keys: string[]): { key: CapabilityKey }[] {
  const allowed = new Set(ALL_CAPABILITY_KEYS)
  return keys.filter((k): k is CapabilityKey => allowed.has(k as CapabilityKey)).map((key) => ({ key }))
}

export type DashboardMenuChild = {
  label: string
  path: string
  capability: string
}

export type DashboardMenuItem = {
  id: string
  label: string
  path: string
  /** User needs at least one of these capabilities (or parent capability). */
  capabilities: string[]
  children?: DashboardMenuChild[]
}

/** Sidebar menu definition — visibility driven by capabilities, not hardcoded roles. */
export const DASHBOARD_MENU: DashboardMenuItem[] = [
  { id: 'home', label: 'Dashboard', path: '/dashboard', capabilities: ['dashboard.home'] },
  { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics', capabilities: ['analytics.view'] },
  {
    id: 'products',
    label: 'Products',
    path: '/dashboard/products',
    capabilities: ['products.catalog', 'products.categories', 'products.sizes', 'products.tags'],
    children: [
      { label: 'Catalog', path: '/dashboard/products', capability: 'products.catalog' },
      { label: 'Categories', path: '/dashboard/products/categories', capability: 'products.categories' },
      { label: 'Sizes', path: '/dashboard/products/sizes', capability: 'products.sizes' },
      { label: 'Tags', path: '/dashboard/products/tags', capability: 'products.tags' },
    ],
  },
  { id: 'orders', label: 'Orders', path: '/dashboard/orders', capabilities: ['orders.view'] },
  {
    id: 'shipping',
    label: 'Delivery locations',
    path: '/dashboard/shipping-zones',
    capabilities: ['shipping.view'],
  },
  { id: 'team', label: 'Team', path: '/dashboard/team', capabilities: ['team.view'] },
  { id: 'careers', label: 'Careers', path: '/dashboard/careers', capabilities: ['careers.manage'] },
  {
    id: 'applications',
    label: 'Applications',
    path: '/dashboard/applications',
    capabilities: ['applications.manage'],
  },
  { id: 'organogram', label: 'Organogram', path: '/dashboard/organogram', capabilities: ['organogram.view'] },
  { id: 'cms', label: 'CMS', path: '/dashboard/cms', capabilities: ['cms.view'] },
  { id: 'settings', label: 'Settings', path: '/dashboard/settings', capabilities: ['settings.view'] },
  {
    id: 'email-templates',
    label: 'Email templates',
    path: '/dashboard/settings/email-templates',
    capabilities: ['email.templates'],
  },
  { id: 'users', label: 'Users', path: '/dashboard/users', capabilities: ['users.manage'] },
  { id: 'roles', label: 'Roles', path: '/dashboard/roles', capabilities: ['roles.manage'] },
  { id: 'diagnostics', label: 'Diagnostics', path: '/dashboard/diagnostics', capabilities: ['diagnostics.view'] },
]

/** Route → required capability for page access guards. */
export const ROUTE_CAPABILITIES: Record<string, string | string[]> = {
  '/dashboard': 'dashboard.home',
  '/dashboard/analytics': 'analytics.view',
  '/dashboard/products': 'products.catalog',
  '/dashboard/products/categories': 'products.categories',
  '/dashboard/products/sizes': 'products.sizes',
  '/dashboard/products/tags': 'products.tags',
  '/dashboard/orders': 'orders.view',
  '/dashboard/shipping-zones': 'shipping.view',
  '/dashboard/team': 'team.view',
  '/dashboard/careers': 'careers.manage',
  '/dashboard/applications': 'applications.manage',
  '/dashboard/organogram': 'organogram.view',
  '/dashboard/cms': 'cms.view',
  '/dashboard/cms/pages': 'cms.view',
  '/dashboard/cms/seo': 'cms.view',
  '/dashboard/settings': 'settings.view',
  '/dashboard/settings/email-templates': 'email.templates',
  '/dashboard/users': 'users.manage',
  '/dashboard/roles': 'roles.manage',
  '/dashboard/diagnostics': 'diagnostics.view',
}

/** Built-in defaults when no DB role record exists (matches previous hardcoded behaviour). */
export const DEFAULT_ROLE_CAPABILITIES: Record<string, string[]> = {
  super_admin: [...ALL_CAPABILITY_KEYS],
  admin: ALL_CAPABILITY_KEYS.filter(
    (k) => !['diagnostics.view', 'users.manage', 'roles.manage'].includes(k),
  ),
  hr: [
    'dashboard.home',
    'team.view',
    'careers.manage',
    'applications.manage',
    'organogram.view',
    'settings.view',
    'email.templates',
  ],
  user: ['dashboard.home', 'settings.view'],
  customer: ['dashboard.home', 'settings.view'],
}

export function hasCapability(capabilities: string[], required: string): boolean {
  if (capabilities.includes('*')) return true
  if (capabilities.includes(required)) return true
  const wildcard = `${required.split('.')[0]}.*`
  if (capabilities.includes(wildcard)) return true
  return false
}

export function hasAnyCapability(capabilities: string[], required: string[]): boolean {
  return required.some((cap) => hasCapability(capabilities, cap))
}

export function capabilitiesForRoleSlug(roleSlug: string | undefined | null): string[] {
  if (!roleSlug) return []
  return DEFAULT_ROLE_CAPABILITIES[roleSlug] ?? ['dashboard.home']
}

export function getRequiredCapabilityForPath(pathname: string): string | string[] | null {
  if (ROUTE_CAPABILITIES[pathname]) return ROUTE_CAPABILITIES[pathname]
  const sorted = Object.keys(ROUTE_CAPABILITIES).sort((a, b) => b.length - a.length)
  for (const route of sorted) {
    if (pathname.startsWith(route + '/') || pathname === route) {
      return ROUTE_CAPABILITIES[route]
    }
  }
  return null
}

export function canAccessPath(capabilities: string[], pathname: string): boolean {
  const required = getRequiredCapabilityForPath(pathname)
  if (!required) return true
  if (Array.isArray(required)) return hasAnyCapability(capabilities, required)
  return hasCapability(capabilities, required)
}

export function canViewEmailTemplateCategory(
  capabilities: string[],
  category: 'careers' | 'orders' | 'contact' | 'internal',
): boolean {
  if (hasCapability(capabilities, 'email.templates.all')) return true
  if (
    (category === 'careers' || category === 'orders') &&
    hasCapability(capabilities, 'email.templates')
  ) {
    return true
  }
  return false
}

export function canEditEmailTemplateCategory(
  capabilities: string[],
  category: 'careers' | 'orders' | 'contact' | 'internal',
): boolean {
  if (hasCapability(capabilities, 'email.templates.all')) return true
  if (
    (category === 'careers' || category === 'orders') &&
    hasCapability(capabilities, 'email.templates')
  ) {
    return true
  }
  return false
}
