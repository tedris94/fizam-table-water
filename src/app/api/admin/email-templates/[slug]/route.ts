import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  canEditEmailTemplate,
  canViewEmailTemplates,
  EMAIL_TEMPLATE_DEFAULTS,
  isEmailTemplateSlug,
  type EmailTemplateSlug,
} from '@/lib/emailTemplateCatalog'
import {
  ensureEmailTemplatesSeeded,
  getEmailTemplateBySlug,
  toEmailTemplateResponse,
} from '@/lib/emailTemplateEngine'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ slug: string }> }

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

export async function GET(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  if (!canViewEmailTemplates(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  if (!isEmailTemplateSlug(slug)) {
    return NextResponse.json({ error: 'Unknown template.' }, { status: 404 })
  }

  try {
    const template = await getEmailTemplateBySlug(slug)
    return NextResponse.json(template)
  } catch (e) {
    console.error('[admin/email-templates GET slug]', e)
    return NextResponse.json({ error: 'Failed to load template' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  const { slug } = await params

  if (!isEmailTemplateSlug(slug)) {
    return NextResponse.json({ error: 'Unknown template.' }, { status: 404 })
  }

  try {
    await ensureEmailTemplatesSeeded()
    const existing = await getEmailTemplateBySlug(slug)

    if (!canViewEmailTemplates(user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!canEditEmailTemplate(user?.role, existing.category)) {
      return NextResponse.json({ error: 'You cannot edit this template.' }, { status: 403 })
    }

    const body = (await request.json()) as {
      subject?: string
      textBody?: string
      htmlBody?: string
      enabled?: boolean
    }

    const subject = body.subject?.trim()
    const textBody = body.textBody?.trim()
    const htmlBody = body.htmlBody?.trim()

    if (!subject || !textBody || !htmlBody) {
      return NextResponse.json(
        { error: 'Subject, plain text body, and HTML body are required.' },
        { status: 400 },
      )
    }

    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'email-templates',
      id: parseId(String(existing.id)),
      data: {
        subject,
        textBody,
        htmlBody,
        ...(typeof body.enabled === 'boolean' ? { enabled: body.enabled } : {}),
      },
      overrideAccess: true,
    })

    return NextResponse.json(
      toEmailTemplateResponse(updated as Parameters<typeof toEmailTemplateResponse>[0]),
    )
  } catch (e) {
    console.error('[admin/email-templates PUT]', e)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser(request)
  const { slug } = await params

  if (!isEmailTemplateSlug(slug)) {
    return NextResponse.json({ error: 'Unknown template.' }, { status: 404 })
  }

  const url = new URL(request.url)
  if (url.searchParams.get('action') !== 'reset') {
    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 })
  }

  try {
    await ensureEmailTemplatesSeeded()
    const existing = await getEmailTemplateBySlug(slug)

    if (!canViewEmailTemplates(user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!canEditEmailTemplate(user?.role, existing.category)) {
      return NextResponse.json({ error: 'You cannot reset this template.' }, { status: 403 })
    }

    const defaults = EMAIL_TEMPLATE_DEFAULTS[slug as EmailTemplateSlug]
    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'email-templates',
      id: parseId(String(existing.id)),
      data: {
        subject: defaults.subject,
        textBody: defaults.textBody,
        htmlBody: defaults.htmlBody,
        enabled: true,
      },
      overrideAccess: true,
    })

    return NextResponse.json(
      toEmailTemplateResponse(updated as Parameters<typeof toEmailTemplateResponse>[0]),
    )
  } catch (e) {
    console.error('[admin/email-templates POST reset]', e)
    return NextResponse.json({ error: 'Failed to reset template' }, { status: 500 })
  }
}
