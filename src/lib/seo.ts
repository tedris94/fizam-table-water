import type { Metadata } from 'next'

export const SITE_NAME = 'Fizam Table Water'
export const SITE_SHORT_NAME = 'Fizam'
export const SITE_DOMAIN = 'fizam.ng'
export const DEFAULT_TITLE =
  'Fizam — Official fizam.ng | Fizam Table Water Nigeria'
export const DEFAULT_DESCRIPTION =
  'Fizam (fizam.ng) is the official Fizam Table Water website — premium bottled and sachet drinking water by Alfurat Nigeria Limited. NAFDAC-certified purification for homes and businesses across Nigeria.'

/** Default share image for WhatsApp, Facebook, Twitter/X, and LinkedIn. */
export const DEFAULT_OG_IMAGE = '/images/og-image.png'
export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630
export const DEFAULT_OG_IMAGE_ALT =
  'Fizam Table Water — official fizam.ng brand, bottled and sachet water Nigeria'

/** Primary keywords for brand + category search in Nigeria. */
export const DEFAULT_KEYWORDS = [
  'Fizam',
  'fizam',
  'fizam.ng',
  'Fizam Table Water',
  'Fizam water',
  'Fizam Nigeria',
  'Fizam official website',
  'Alfurat Nigeria Limited',
  'table water Nigeria',
  'sachet water Nigeria',
  'pure water Nigeria',
  'NAFDAC certified water',
  'bottled water FCT',
  'bottled water Abuja',
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

export function resolveOgImage(image?: string | null): string {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE)
  return image.startsWith('http') ? image : absoluteUrl(image)
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
  const ogImage = resolveOgImage(image)
  const ogImageAlt = image ? `${SITE_NAME} — ${metaTitle}` : DEFAULT_OG_IMAGE_ALT

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
    authors: [{ name: SITE_NAME, url: absoluteUrl('/') }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
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
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: ogImageAlt,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: {
        url: ogImage,
        alt: ogImageAlt,
      },
    },
    other: {
      'geo.region': 'NG',
      'geo.placename': 'Nigeria',
      // Explicit OG tags for WhatsApp, Facebook, LinkedIn crawlers
      'og:image': ogImage,
      'og:image:secure_url': ogImage,
      'og:image:url': ogImage,
      'og:image:width': String(DEFAULT_OG_IMAGE_WIDTH),
      'og:image:height': String(DEFAULT_OG_IMAGE_HEIGHT),
      'og:image:alt': ogImageAlt,
      'og:image:type': 'image/png',
      'og:site_name': SITE_NAME,
      'og:locale': 'en_NG',
    },
  }
}

export function titleWithBrand(pageTitle: string): string {
  if (/fizam/i.test(pageTitle)) return pageTitle
  return `${pageTitle} | ${SITE_NAME}`
}
