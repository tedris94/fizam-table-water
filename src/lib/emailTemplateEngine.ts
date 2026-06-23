import {
  EMAIL_TEMPLATE_DEFAULTS,
  EMAIL_TEMPLATE_SLUGS,
  type EmailTemplateDefinition,
  type EmailTemplateLayout,
  type EmailTemplateSlug,
} from '@/lib/emailTemplateCatalog'
import {
  renderEmailTemplateContent,
  type EmailTemplateRecord,
} from '@/lib/emailTemplateRender'
import { getPayloadSingleton } from '@/lib/payload'

export type { EmailTemplateRecord } from '@/lib/emailTemplateRender'
export { previewEmailTemplate, renderEmailTemplateContent } from '@/lib/emailTemplateRender'

function toRecord(doc: {
  id: number | string
  slug: string
  name: string
  description?: string | null
  category: EmailTemplateDefinition['category']
  layout: EmailTemplateLayout
  subject: string
  textBody: string
  htmlBody: string
  enabled?: boolean | null
  variablesHelp?: string | null
}): EmailTemplateRecord {
  return {
    id: doc.id,
    slug: doc.slug as EmailTemplateSlug,
    name: doc.name,
    description: doc.description ?? '',
    category: doc.category,
    layout: doc.layout,
    subject: doc.subject,
    textBody: doc.textBody,
    htmlBody: doc.htmlBody,
    enabled: doc.enabled !== false,
    variablesHelp: doc.variablesHelp ?? '',
  }
}

export function toEmailTemplateResponse(doc: {
  id: number | string
  slug: string
  name: string
  description?: string | null
  category: EmailTemplateDefinition['category']
  layout: EmailTemplateLayout
  subject: string
  textBody: string
  htmlBody: string
  enabled?: boolean | null
  variablesHelp?: string | null
}) {
  return toRecord(doc)
}

export async function ensureEmailTemplatesSeeded() {
  const payload = await getPayloadSingleton()

  for (const slug of EMAIL_TEMPLATE_SLUGS) {
    const existing = await payload.find({
      collection: 'email-templates',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) continue

    const defaults = EMAIL_TEMPLATE_DEFAULTS[slug]
    await payload.create({
      collection: 'email-templates',
      data: {
        slug: defaults.slug,
        name: defaults.name,
        description: defaults.description,
        category: defaults.category,
        layout: defaults.layout,
        subject: defaults.subject,
        textBody: defaults.textBody,
        htmlBody: defaults.htmlBody,
        variablesHelp: defaults.variablesHelp,
        enabled: true,
      },
      overrideAccess: true,
    })
  }
}

export async function getEmailTemplateBySlug(slug: EmailTemplateSlug): Promise<EmailTemplateRecord> {
  await ensureEmailTemplatesSeeded()
  const payload = await getPayloadSingleton()
  const result = await payload.find({
    collection: 'email-templates',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  const doc = result.docs[0]
  if (doc) return toRecord(doc as Parameters<typeof toRecord>[0])

  const defaults = EMAIL_TEMPLATE_DEFAULTS[slug]
  return {
    id: slug,
    slug,
    name: defaults.name,
    description: defaults.description,
    category: defaults.category,
    layout: defaults.layout,
    subject: defaults.subject,
    textBody: defaults.textBody,
    htmlBody: defaults.htmlBody,
    enabled: true,
    variablesHelp: defaults.variablesHelp,
  }
}

export async function renderEmailTemplate(
  slug: EmailTemplateSlug,
  vars: Record<string, string | number | null | undefined>,
) {
  const template = await getEmailTemplateBySlug(slug)
  if (!template.enabled) {
    return { ...renderEmailTemplateContent(template, vars), enabled: false as const }
  }

  return { ...renderEmailTemplateContent(template, vars), enabled: true as const }
}
