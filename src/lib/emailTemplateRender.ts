import { siteBaseUrl } from '@/lib/applicationRef'
import {
  emailBrandedFooterHtml,
  emailBrandedHeaderHtml,
  emailCareersFooterHtml,
  emailPlainHeaderHtml,
} from '@/lib/emailBranding'
import type { EmailTemplateDefinition, EmailTemplateLayout, EmailTemplateSlug } from '@/lib/emailTemplateCatalog'

/** Shared shape for API + dashboard (client-safe). */
export type EmailTemplateRecord = {
  id: number | string
  slug: EmailTemplateSlug
  name: string
  description: string
  category: EmailTemplateDefinition['category']
  layout: EmailTemplateLayout
  subject: string
  textBody: string
  htmlBody: string
  enabled: boolean
  variablesHelp: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Replace `{{key}}` placeholders. HTML bodies may include trusted markup from the template editor. */
export function interpolateTemplate(
  template: string,
  vars: Record<string, string | number | null | undefined>,
  options?: { escapeHtml?: boolean },
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const raw = vars[key]
    if (raw === null || raw === undefined || raw === '') return ''
    const value = String(raw)
    return options?.escapeHtml ? escapeHtml(value) : value
  })
}

function wrapCareersHtml(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1a1f71;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,31,113,0.08);">
        ${emailBrandedHeaderHtml({ subtitle: 'Careers' })}
        <tr><td style="padding:32px;">${body}</td></tr>
        ${emailCareersFooterHtml()}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function wrapBrandedHtml(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1a1f71;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,31,113,0.08);">
        ${emailBrandedHeaderHtml()}
        <tr><td style="padding:32px;">${body}</td></tr>
        ${emailBrandedFooterHtml()}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function wrapPlainHtml(body: string) {
  const siteUrl = siteBaseUrl()
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#374151;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(26,31,113,0.06);">
        ${emailPlainHeaderHtml()}
        <tr><td style="padding:24px 32px 32px;">${body}</td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">
            <a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">fizam.ng</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function wrapEmailHtml(layout: EmailTemplateLayout, innerHtml: string): string {
  switch (layout) {
    case 'careers':
      return wrapCareersHtml(innerHtml)
    case 'branded':
      return wrapBrandedHtml(innerHtml)
    default:
      return wrapPlainHtml(innerHtml)
  }
}

export function renderEmailTemplateContent(
  template: Pick<EmailTemplateRecord, 'subject' | 'textBody' | 'htmlBody' | 'layout'>,
  vars: Record<string, string | number | null | undefined>,
) {
  const subject = interpolateTemplate(template.subject, vars, { escapeHtml: true })
  const text = interpolateTemplate(template.textBody, vars)
  const innerHtml = interpolateTemplate(template.htmlBody, vars)
  const html = wrapEmailHtml(template.layout, innerHtml)

  return { subject, text, html }
}

/** Client-safe preview without database access. */
export function previewEmailTemplate(
  _slug: EmailTemplateSlug,
  draft: Pick<EmailTemplateRecord, 'subject' | 'textBody' | 'htmlBody' | 'layout'>,
  vars: Record<string, string>,
) {
  return renderEmailTemplateContent(draft, vars)
}
