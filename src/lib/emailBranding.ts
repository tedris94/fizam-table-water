import { siteBaseUrl } from '@/lib/applicationRef'

/** Absolute URL for email `<img src>` (must be publicly reachable). */
export function absoluteSiteUrl(path: string): string {
  const base = siteBaseUrl().replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

/** White logo on dark headers; colour logo on light backgrounds. */
export function emailLogoUrl(variant: 'light' | 'dark' = 'light'): string {
  const fromEnv = process.env.EMAIL_LOGO_URL?.trim()
  if (fromEnv) return fromEnv

  return absoluteSiteUrl(variant === 'light' ? '/images/logo-white.png' : '/images/logo.png')
}

function logoImgHtml(url: string, alt: string, maxWidth = 112) {
  return `<img src="${url}" alt="${alt}" width="${maxWidth}" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;max-width:${maxWidth}px;width:100%;height:auto;" />`
}

/** Header used on careers + order emails (gradient background). */
export function emailBrandedHeaderHtml(options?: { subtitle?: string }) {
  const siteUrl = siteBaseUrl()
  const logoUrl = emailLogoUrl('light')
  const subtitle = options?.subtitle
    ? `<p style="margin:12px 0 0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#bfdbfe;">${options.subtitle}</p>`
    : ''

  return `<tr>
  <td align="center" style="background:linear-gradient(135deg,#1a1f71,#2563eb);padding:28px 32px 24px;">
    <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
      ${logoImgHtml(logoUrl, 'Fizam Table Water')}
    </a>
    ${subtitle}
  </td>
</tr>`
}

/** Footer used on careers emails. */
export function emailCareersFooterHtml() {
  const siteUrl = siteBaseUrl()
  const careersEmail =
    process.env.CAREERS_REPLY_EMAIL?.trim() ||
    process.env.HR_NOTIFY_EMAIL?.trim()?.split(/[,;]/)[0]?.trim() ||
    'hr@fizam.ng'

  return `<tr>
  <td style="padding:20px 32px 28px;border-top:1px solid #e5e7eb;background:#f9fafb;">
    <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;text-align:center;">
      Alfurat Nigeria Limited · Fizam Table Water<br>
      <a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">fizam.ng</a>
      · Questions? <a href="mailto:${careersEmail}" style="color:#2563eb;text-decoration:none;">${careersEmail}</a>
    </p>
  </td>
</tr>`
}

/** Footer for general branded emails (orders). */
export function emailBrandedFooterHtml() {
  const siteUrl = siteBaseUrl()
  return `<tr>
  <td style="padding:20px 32px 28px;border-top:1px solid #e5e7eb;background:#f9fafb;">
    <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;text-align:center;">
      <a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">fizam.ng</a>
    </p>
  </td>
</tr>`
}

/** Compact header for plain/internal emails. */
export function emailPlainHeaderHtml() {
  const siteUrl = siteBaseUrl()
  const logoUrl = emailLogoUrl('dark')
  return `<tr>
  <td align="center" style="padding:24px 24px 16px;border-bottom:1px solid #e5e7eb;background:#ffffff;">
    <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
      ${logoImgHtml(logoUrl, 'Fizam Table Water', 96)}
    </a>
  </td>
</tr>`
}
