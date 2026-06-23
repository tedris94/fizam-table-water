import type { ApplicationStatus } from '@/lib/applicationRef'
import { formatApplicationRef } from '@/lib/applicationRef'

export type EducationEntry = {
  qualification: string
  institution: string
  fieldOfStudy?: string
  startYear?: string
  endYear?: string
  grade?: string
}

export type WorkEntry = {
  jobTitle: string
  company: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  description?: string
}

import { hasCapability, capabilitiesForRoleSlug } from '@/lib/capabilities'

export function canManageApplications(
  role: string | undefined,
  capabilities?: string[],
): boolean {
  if (capabilities) return hasCapability(capabilities, 'applications.manage')
  return hasCapability(capabilitiesForRoleSlug(role), 'applications.manage')
}

export function parseJsonArray<T>(raw: string | null | undefined): T[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function formatEducationText(entries: EducationEntry[]): string {
  return entries
    .filter((e) => e.qualification?.trim() || e.institution?.trim())
    .map((e) => {
      const years = [e.startYear, e.endYear].filter(Boolean).join(' – ')
      const parts = [
        e.qualification?.trim(),
        e.institution?.trim(),
        e.fieldOfStudy?.trim(),
        years ? `(${years})` : '',
        e.grade?.trim() ? `Grade: ${e.grade.trim()}` : '',
      ].filter(Boolean)
      return `• ${parts.join(', ')}`
    })
    .join('\n')
}

export function formatExperienceText(entries: WorkEntry[]): string {
  return entries
    .filter((e) => e.jobTitle?.trim() || e.company?.trim())
    .map((e) => {
      const period = e.current
        ? `${e.startDate || ''} – Present`.replace(/^ – Present$/, 'Present')
        : [e.startDate, e.endDate].filter(Boolean).join(' – ')
      const header = [e.jobTitle?.trim(), e.company?.trim(), e.location?.trim()]
        .filter(Boolean)
        .join(' — ')
      const lines = [`• ${header}${period ? ` (${period})` : ''}`]
      if (e.description?.trim()) lines.push(`  ${e.description.trim()}`)
      return lines.join('\n')
    })
    .join('\n')
}

export function formatCoverLetterText(summary: string, motivation: string): string {
  const parts = []
  if (summary.trim()) parts.push(`PROFESSIONAL SUMMARY\n${summary.trim()}`)
  if (motivation.trim()) parts.push(`WHY THIS ROLE\n${motivation.trim()}`)
  return parts.join('\n\n')
}

export function toApplicationResponse(doc: {
  id: number | string
  job?: { id?: number | string; title?: string } | number | null
  jobTitle?: string | null
  fullName: string
  email: string
  phone: string
  address?: string | null
  education?: string | null
  experience?: string | null
  coverLetter?: string | null
  professionalSummary?: string | null
  motivationStatement?: string | null
  educationHistory?: EducationEntry[] | null
  workHistory?: WorkEntry[] | null
  resume?: { url?: string | null; filename?: string | null } | number | null
  applicationRef?: string | null
  status: ApplicationStatus
  createdAt: string
  updatedAt?: string
}, resumeUrl: string | null) {
  return {
    id: doc.id,
    applicationRef: doc.applicationRef ?? formatApplicationRef(doc.id),
    jobTitle:
      doc.jobTitle ??
      (doc.job && typeof doc.job === 'object' ? doc.job.title : undefined) ??
      '',
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    address: doc.address ?? '',
    education: doc.education ?? '',
    experience: doc.experience ?? '',
    coverLetter: doc.coverLetter ?? '',
    professionalSummary: doc.professionalSummary ?? '',
    motivationStatement: doc.motivationStatement ?? '',
    educationHistory: doc.educationHistory ?? [],
    workHistory: doc.workHistory ?? [],
    resumeUrl,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt ?? doc.createdAt,
  }
}
