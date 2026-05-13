import nodemailer from 'nodemailer'

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

const fromAddress = () => process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@fizam.ng'

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

export async function sendMail(opts: { to: string; subject: string; text: string; html?: string }) {
  const transporter = getMailer()
  if (!transporter) {
    console.warn('[email] SMTP not configured — message skipped:', opts.subject)
    return { skipped: true as const }
  }

  await transporter.sendMail({
    from: fromAddress(),
    ...opts,
  })
  return { skipped: false as const }
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

  await sendMail({
    to: adminEmail,
    subject: `[Fizam Website] Message from ${payload.name}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Order type: ${payload.orderType}`,
      '',
      payload.message,
    ].join('\n'),
  })
  return { skipped: false as const }
}

export async function notifyNewApplication(payload: {
  applicantName: string
  jobTitle: string
  email: string
}) {
  const hrEmail =
    normalizeRecipients(process.env.HR_NOTIFY_EMAIL) ||
    normalizeRecipients(process.env.CONTACT_NOTIFY_EMAIL) ||
    normalizeRecipients(process.env.SMTP_USER)
  if (!hrEmail) return

  await sendMail({
    to: hrEmail,
    subject: `[Fizam Careers] Application — ${payload.jobTitle}`,
    text: `${payload.applicantName} applied for "${payload.jobTitle}" (${payload.email}).`,
  })
}

export async function sendOrderConfirmation(payload: {
  to: string
  customerName: string
  orderId: string | number
  total: number
  reference?: string | null
}) {
  await sendMail({
    to: payload.to,
    subject: `Fizam — Order confirmation #${payload.orderId}`,
    text: [
      `Hi ${payload.customerName},`,
      '',
      'Thank you for your order with Fizam Table Water.',
      `Order ID: ${payload.orderId}`,
      `Total: ₦${payload.total.toLocaleString('en-NG')}`,
      payload.reference ? `Payment reference: ${payload.reference}` : '',
      '',
      'We will contact you about delivery.',
      '',
      '— Fizam Table Water',
    ]
      .filter(Boolean)
      .join('\n'),
  })
}
