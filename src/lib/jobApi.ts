function requirementTexts(
  requirements: Array<{ item?: string | null; id?: string | null } | string> | null | undefined,
): string[] {
  if (!Array.isArray(requirements)) return []
  return requirements
    .map((req) => (typeof req === 'string' ? req : req.item ?? ''))
    .filter(Boolean)
}

export function slugFromJobTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function requirementsToPayload(items: string[]) {
  return items.map((item) => ({ item: item.trim() })).filter((r) => r.item)
}

export function toJobResponse(doc: {
  id: number | string
  title: string
  slug: string
  department: string
  location: string
  type: string
  salaryRange?: string | null
  description: string
  requirements?: Array<{ item?: string | null; id?: string | null } | string> | null
  postedDate?: string | null
  status: 'active' | 'closed'
}) {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    department: doc.department,
    location: doc.location,
    type: doc.type,
    salaryRange: doc.salaryRange ?? '',
    description: doc.description,
    requirements: requirementTexts(doc.requirements),
    postedDate: doc.postedDate ?? null,
    status: doc.status,
  }
}

import { hasCapability, capabilitiesForRoleSlug } from '@/lib/capabilities'

export function canManageCareers(role: string | undefined, capabilities?: string[]): boolean {
  if (capabilities) return hasCapability(capabilities, 'careers.manage')
  return hasCapability(capabilitiesForRoleSlug(role), 'careers.manage')
}
