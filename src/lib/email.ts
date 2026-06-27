import nodemailer from 'nodemailer'
import { renderEmailTemplate } from '@/lib/emailTemplateEngine'

/**
 * Values shipped in `.env.example` that should be treated as "no real SMTP
 * configured yet" — keeps placeholder envs from causing connection errors.
 */
const PLACEHOLDER_VALUES = new Set([
  'mail.example.com',
  'smtp.example.com',
  'app-or-mailbox-password',
  'your-smtp-password',
  'changeme',
])

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true
  return PLACEHOLDER_VALUES.has(value.trim().toLowerCase())
}

export function getMailer() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()

  if (!host || isPlaceholder(host) || isPlaceholder(pass)) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: user && pass ? { user, pass } : undefined,
  })
}

/** Default “From” for SMTP when a send does not pass an override. */
export const defaultFromAddress = () =>
  process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || 'noreply@fizam.ng'

function parseEmailAddress(raw: string): { name?: string; address: string } {
  let trimmed = raw.trim()
  // Tolerate a value wrapped in surrounding quotes. This happens when a
  // `.env`-style value like `"Name <a@b.com>"` is pasted into a Vercel env
  // var, where (unlike dotenv) the quotes are kept literally.
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    trimmed = trimmed.slice(1, -1).trim()
  }
  const bracket = trimmed.match(/^(.+?)\s*<([^>]+)>$/)
  if (bracket) {
    const name = bracket[1].trim().replace(/^["']|["']$/g, '')
    return { name: name || undefined, address: bracket[2].trim() }
  }
  return { address: trimmed }
}

function formatEmailAddress({ name, address }: { name?: string; address: string }): string {
  return name ? `"${name}" <${address}>` : address
}

/**
 * Shared hosting often requires the SMTP-authenticated mailbox as the envelope
 * sender. Keep a branded display name but align the address with SMTP_USER.
 */
export function resolveOutboundFrom(displayFrom?: string): { from: string; replyTo?: string } {
  const smtpUser = process.env.SMTP_USER?.trim()
  const parsed = parseEmailAddress(displayFrom?.trim() || defaultFromAddress())

  if (!smtpUser) {
    return { from: formatEmailAddress(parsed) }
  }

  const auth = parseEmailAddress(smtpUser)
  if (parsed.address.toLowerCase() === auth.address.toLowerCase()) {
    return { from: formatEmailAddress(parsed) }
  }

  return {
    from: formatEmailAddress({ name: parsed.name ?? auth.name, address: auth.address }),
    replyTo: parsed.address,
  }
}

/**
 * Split `CONTACT_NOTIFY_EMAIL` / `HR_NOTIFY_EMAIL` on commas or semicolons.
 * Nodemailer accepts a comma-separated string for multiple recipients.
 */
function normalizeRecipients(raw: string | undefined): string | null {
  if (!raw?.trim()) return null
  const parts = raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

export async function sendMail(opts: {
  to: string
  subject: string
  text: string
  html?: string
  /** Optional From header (e.g. sales@ for orders). Falls back to `defaultFromAddress()`. */
  from?: string
  /** Reply-To header (e.g. hr@ for careers). */
  replyTo?: string
}) {
  const transporter = getMailer()
  if (!transporter) {
    console.warn('[email] SMTP not configured — message skipped:', opts.subject)
    return { skipped: true as const, messageId: undefined as string | undefined }
  }

  const { from: fromOverride, replyTo: replyToOverride, ...rest } = opts
  const resolved = resolveOutboundFrom(fromOverride)
  const smtpUser = process.env.SMTP_USER?.trim()
  const envelopeFrom = smtpUser ? parseEmailAddress(smtpUser).address : parseEmailAddress(resolved.from).address

  const info = await transporter.sendMail({
    from: resolved.from,
    envelope: {
      from: envelopeFrom,
      to: opts.to,
    },
    ...(replyToOverride?.trim()
      ? { replyTo: replyToOverride.trim() }
      : resolved.replyTo
        ? { replyTo: resolved.replyTo }
        : {}),
    ...rest,
  })

  console.info('[email] sent', {
    to: opts.to,
    subject: opts.subject,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  })

  return { skipped: false as const, messageId: info.messageId }
}

export async function notifyContactLead(payload: {
  name: string
  email: string
  phone: string
  orderType: string
  message: string
}) {
  const adminEmail =
    normalizeRecipients(process.env.CONTACT_NOTIFY_EMAIL) || normalizeRecipients(process.env.SMTP_USER)
  if (!adminEmail) return { skipped: true as const }

  const internalFrom =
    process.env.SMTP_FROM_INTERNAL?.trim() || process.env.SMTP_FROM?.trim() || undefined

  const rendered = await renderEmailTemplate('contact-lead-notification', {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    orderType: payload.orderType,
    message: payload.message,
  })

  if (!rendered.enabled) {
    console.warn('[email] template disabled, skipped: contact-lead-notification')
    return { skipped: true as const }
  }

  await sendMail({
    from: internalFrom,
    to: adminEmail,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  })
  return { skipped: false as const }
}

export async function notifyNewApplication(payload: {
  applicantName: string
  jobTitle: string
  email: string
  applicationRef?: string
}) {
  const { notifyHrNewApplication } = await import('@/lib/applicationEmails')
  await notifyHrNewApplication({
    applicantName: payload.applicantName,
    jobTitle: payload.jobTitle,
    email: payload.email,
    applicationRef: payload.applicationRef ?? 'N/A',
  })
}

/** @deprecated Use sendOrderConfirmationEmail from orderEmails */
export async function sendOrderConfirmation(payload: {
  to: string
  customerName: string
  orderId: string | number
  total: number
  reference?: string | null
}) {
  const { sendOrderConfirmationEmail } = await import('@/lib/orderEmails')
  return sendOrderConfirmationEmail({
    id: typeof payload.orderId === 'number' ? payload.orderId : Number(payload.orderId),
    shipping: {
      fullName: payload.customerName,
      email: payload.to,
      phone: '',
      address: '',
    },
    total: payload.total,
    paystackReference: payload.reference ?? null,
    status: 'paid',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as import('@/payload-types').Order)
}
