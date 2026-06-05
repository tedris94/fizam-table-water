import type { Metadata } from 'next'

export const SITE_NAME = 'Fizam Table Water'
export const SITE_SHORT_NAME = 'Fizam'
export const DEFAULT_TITLE =
  'Fizam | Fizam Table Water — NAFDAC Certified Drinking Water in Nigeria'
export const DEFAULT_DESCRIPTION =
  'Fizam (Fizam Table Water) delivers NAFDAC-certified sachet, bottle, and dispenser water across Nigeria. Order online at fizam.ng — pure hydration for every Nigerian home.'

/** Primary keywords for brand + category search in Nigeria. */
export const DEFAULT_KEYWORDS = [
  'Fizam',
  'Fizam Table Water',
  'Fizam water',
  'Fizam Nigeria',
  'fizam.ng',
  'table water Nigeria',
  'sachet water Nigeria',
  'pure water Nigeria',
  'NAFDAC certified water',
  'bottled water Lagos',
  'dispenser water Nigeria',
  'order table water online',
]

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fizam.ng').trim()
  if (!raw) return 'https://fizam.ng'

  const withProtocol =
    /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`

  return withProtocol.replace(/\/$/, '')
}

export function absoluteUrl(path = ''): string {
  const base = getSiteUrl()
  if (!path || path === '/') return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export type PageSeoInput = {
  title?: string
  description?: string
  /** Path without domain, e.g. `/about` */
  path?: string
  noIndex?: boolean
  /** Absolute or site-relative image URL */
  image?: string | null
  keywords?: string[]
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
  image,
  keywords,
}: PageSeoInput): Metadata {
  const siteUrl = getSiteUrl()
  const canonical = absoluteUrl(path)
  const metaTitle = title ?? DEFAULT_TITLE
  const metaDescription = description ?? DEFAULT_DESCRIPTION
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : absoluteUrl(image)
    : absoluteUrl('/icon.svg')

  let metadataBase: URL
  try {
    metadataBase = new URL(siteUrl)
  } catch {
    metadataBase = new URL('https://fizam.ng')
  }

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    metadataBase,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      url: canonical,
      siteName: SITE_NAME,
      title: metaTitle,
      description: metaDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
    other: {
      'geo.region': 'NG',
      'geo.placename': 'Nigeria',
    },
  }
}

export function titleWithBrand(pageTitle: string): string {
  if (/fizam/i.test(pageTitle)) return pageTitle
  return `${pageTitle} | ${SITE_NAME}`
}
