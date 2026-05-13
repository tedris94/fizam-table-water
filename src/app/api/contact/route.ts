import { NextResponse } from 'next/server'
import { notifyContactLead } from '@/lib/email'

type ContactBody = {
  name?: string
  email?: string
  phone?: string
  orderType?: string
  message?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: ContactBody
  try {
    body = (await request.json()) as ContactBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const name = body.name?.trim() || ''
  const email = body.email?.trim() || ''
  const phone = body.phone?.trim() || ''
  const orderType = body.orderType?.trim() || 'general'
  const message = body.message?.trim() || ''

  if (!name) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (!message) {
    return NextResponse.json({ error: 'Please include a message.' }, { status: 400 })
  }

  // Always log the lead — useful in development and as a fallback if SMTP fails.
  console.info('[contact] lead', { name, email, phone, orderType, message })

  // Email is best-effort: SMTP misconfig should not cause the user-facing form to fail.
  let emailSent = false
  let emailError: string | null = null
  try {
    const result = await notifyContactLead({ name, email, phone, orderType, message })
    emailSent = !result.skipped
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'Unknown email error'
    console.error('[contact] email send failed:', emailError)
  }

  return NextResponse.json({ ok: true, emailSent, emailError })
}
