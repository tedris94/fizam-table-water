import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { getMailer, sendMail, defaultFromAddress } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Constant-time comparison so we don't leak timing info about the secret.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Lightweight SMTP self-test. Visit /api/diagnostics/email to confirm the
 * mailbox credentials and host/port combo work without going through the
 * contact form. Add `?send=1` to also send a test message to
 * CONTACT_NOTIFY_EMAIL (or SMTP_USER as a fallback).
 *
 * Requires a `DIAGNOSTICS_KEY` env var. Pass it via either:
 *   - Header:        `x-diagnostics-key: <value>`
 *   - Query string:  `?key=<value>`
 */
export async function GET(request: Request) {
  const expected = process.env.DIAGNOSTICS_KEY?.trim()
  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Diagnostics are disabled. Set DIAGNOSTICS_KEY in .env (and pass it as ?key=… or x-diagnostics-key header).',
      },
      { status: 503 },
    )
  }

  const url = new URL(request.url)
  const provided =
    request.headers.get('x-diagnostics-key')?.trim() || url.searchParams.get('key')?.trim() || ''

  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
  }

  const shouldSend = url.searchParams.get('send') === '1'

  const config = {
    host: process.env.SMTP_HOST ?? null,
    port: process.env.SMTP_PORT ?? null,
    secure: process.env.SMTP_SECURE ?? null,
    user: process.env.SMTP_USER ?? null,
    hasPassword: Boolean(process.env.SMTP_PASS?.trim()),
    from: process.env.SMTP_FROM ?? null,
    fromDefaultResolved: defaultFromAddress(),
    fromOrders: process.env.SMTP_FROM_ORDERS ?? null,
    fromInternal: process.env.SMTP_FROM_INTERNAL ?? null,
    contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL ?? null,
  }

  const transporter = getMailer()
  if (!transporter) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          'SMTP is not configured (missing or placeholder SMTP_HOST / SMTP_PASS). Update .env and restart `pnpm dev`.',
        config,
      },
      { status: 503 },
    )
  }

  try {
    await transporter.verify()
  } catch (e) {
    const error = e instanceof Error ? { name: e.name, message: e.message } : { message: String(e) }
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        verified: false,
        message: 'SMTP credentials were rejected or the server is unreachable.',
        error,
        config,
      },
      { status: 502 },
    )
  }

  if (!shouldSend) {
    return NextResponse.json({
      ok: true,
      configured: true,
      verified: true,
      message: 'SMTP connection succeeded. Append ?send=1 to send a real test email.',
      config,
    })
  }

  const recipient =
    process.env.CONTACT_NOTIFY_EMAIL?.split(/[,;]/)[0]?.trim() || process.env.SMTP_USER?.trim()
  if (!recipient) {
    return NextResponse.json(
      { ok: false, message: 'No recipient available (set CONTACT_NOTIFY_EMAIL or SMTP_USER).' },
      { status: 400 },
    )
  }

  try {
    const result = await sendMail({
      to: recipient,
      subject: '[Fizam] SMTP diagnostics test',
      text: `If you're reading this, SMTP from ${process.env.SMTP_HOST} is working.\nSent at ${new Date().toISOString()}.`,
    })
    return NextResponse.json({
      ok: true,
      configured: true,
      verified: true,
      sent: !result.skipped,
      recipient,
      message: result.skipped
        ? 'Mailer reported as not configured at send time.'
        : `Test email queued for ${recipient}.`,
      config,
    })
  } catch (e) {
    const error = e instanceof Error ? { name: e.name, message: e.message } : { message: String(e) }
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        verified: true,
        sent: false,
        recipient,
        message: 'Connection verified but sending the test email failed.',
        error,
        config,
      },
      { status: 502 },
    )
  }
}
