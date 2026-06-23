import { sendMail } from '@/lib/email'
import {
  APPLICATION_STATUS_LABELS,
  careersContactEmail,
  siteBaseUrl,
  type ApplicationStatus,
} from '@/lib/applicationRef'
import type { EmailTemplateSlug } from '@/lib/emailTemplateCatalog'
import { renderEmailTemplate } from '@/lib/emailTemplateEngine'

type ApplicationEmailPayload = {
  to: string
  applicantName: string
  jobTitle: string
  applicationRef: string
}

function careersFromAddress(): string | undefined {
  return (
    process.env.SMTP_FROM_CAREERS?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    undefined
  )
}

function firstNameFrom(fullName: string) {
  return fullName.split(/\s+/)[0] || fullName
}

const STATUS_TEMPLATE_SLUG: Record<Exclude<ApplicationStatus, 'pending'>, EmailTemplateSlug> = {
  shortlisted: 'careers-application-shortlisted',
  approved: 'careers-application-approved',
  rejected: 'careers-application-rejected',
}

async function sendTemplatedEmail(
  slug: EmailTemplateSlug,
  to: string,
  vars: Record<string, string | number | null | undefined>,
  options?: { from?: string; replyTo?: string },
) {
  const rendered = await renderEmailTemplate(slug, vars)
  if (!rendered.enabled) {
    console.warn('[email] template disabled, skipped:', slug)
    return { skipped: true as const }
  }

  await sendMail({
    from: options?.from,
    replyTo: options?.replyTo,
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  })
  return { skipped: false as const }
}

/** Sent immediately after submit — receipt + pending status. */
export async function sendApplicationReceivedEmail(payload: ApplicationEmailPayload) {
  const firstName = firstNameFrom(payload.applicantName)
  return sendTemplatedEmail(
    'careers-application-received',
    payload.to,
    {
      firstName,
      applicantName: payload.applicantName,
      jobTitle: payload.jobTitle,
      applicationRef: payload.applicationRef,
      statusLabel: APPLICATION_STATUS_LABELS.pending,
      careersEmail: careersContactEmail(),
      siteUrl: siteBaseUrl(),
    },
    { from: careersFromAddress(), replyTo: careersContactEmail() },
  )
}

export async function sendApplicationStatusEmail(
  payload: ApplicationEmailPayload & { status: Exclude<ApplicationStatus, 'pending'> },
) {
  const firstName = firstNameFrom(payload.applicantName)

  return sendTemplatedEmail(
    STATUS_TEMPLATE_SLUG[payload.status],
    payload.to,
    {
      firstName,
      applicantName: payload.applicantName,
      jobTitle: payload.jobTitle,
      applicationRef: payload.applicationRef,
      statusLabel: APPLICATION_STATUS_LABELS[payload.status],
      careersEmail: careersContactEmail(),
      siteUrl: siteBaseUrl(),
    },
    { from: careersFromAddress(), replyTo: careersContactEmail() },
  )
}

/** Notify applicant of their current status (used on status change and manual resend). */
export async function notifyApplicantOfApplicationStatus(
  payload: ApplicationEmailPayload & { status: ApplicationStatus },
) {
  if (payload.status === 'pending') {
    await sendApplicationReceivedEmail(payload)
    return
  }

  await sendApplicationStatusEmail({
    ...payload,
    status: payload.status,
  })
}

export async function notifyHrNewApplication(payload: {
  applicantName: string
  jobTitle: string
  email: string
  applicationRef: string
}) {
  const hrEmail =
    process.env.HR_NOTIFY_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim()
  if (!hrEmail) return

  const internalFrom =
    process.env.SMTP_FROM_INTERNAL?.trim() || process.env.SMTP_FROM?.trim() || undefined

  const rendered = await renderEmailTemplate('careers-hr-new-application', {
    applicantName: payload.applicantName,
    applicantEmail: payload.email,
    jobTitle: payload.jobTitle,
    applicationRef: payload.applicationRef,
    dashboardUrl: `${siteBaseUrl()}/dashboard/applications`,
    siteUrl: siteBaseUrl(),
  })

  if (!rendered.enabled) {
    console.warn('[email] template disabled, skipped: careers-hr-new-application')
    return
  }

  await sendMail({
    from: internalFrom,
    to: hrEmail,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  })
}
