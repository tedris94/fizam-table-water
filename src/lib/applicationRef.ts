/** Human-readable reference shown to applicants (e.g. FZ-APP-2026-00042). */
export function formatApplicationRef(id: number | string): string {
  const year = new Date().getFullYear()
  const num = String(id).padStart(5, '0')
  return `FZ-APP-${year}-${num}`
}

export function careersContactEmail(): string {
  return (
    process.env.CAREERS_REPLY_EMAIL?.trim() ||
    process.env.HR_NOTIFY_EMAIL?.trim()?.split(/[,;]/)[0]?.trim() ||
    'hr@fizam.ng'
  )
}

export function siteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim() ||
    'https://fizam.ng'
  ).replace(/\/$/, '')
}

export type ApplicationStatus = 'pending' | 'shortlisted' | 'approved' | 'rejected'

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Under review',
  shortlisted: 'Shortlisted',
  approved: 'Approved',
  rejected: 'Not successful',
}
