import type { Metadata } from 'next'

export const SITE_NAME = 'Fizam Table Water'
export const SITE_SHORT_NAME = 'Fizam'
export const SITE_DOMAIN = 'fizam.ng'
export const DEFAULT_TITLE = 'Fizam — Official fizam.ng | Table Water Nigeria'
export const DEFAULT_DESCRIPTION =
  'Official Fizam Table Water (fizam.ng). NAFDAC-certified sachet & bottled water by Alfurat Nigeria Limited. Order online in FCT and Nigeria.'

/** JPEG 1200×630, optimized for WhatsApp (< 600 KB). */
export const DEFAULT_OG_IMAGE = '/images/og-image.jpg'
export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630
export const DEFAULT_OG_IMAGE_TYPE = 'image/jpeg'
export const DEFAULT_OG_IMAGE_ALT =
  'Fizam Table Water — official fizam.ng, bottled and sachet water Nigeria'

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

const OG_DESCRIPTION_MAX = 155

/** Keep share previews within WhatsApp / Facebook recommended length. */
export function trimShareDescription(text: string, max = OG_DESCRIPTION_MAX): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  const cut = normalized.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fizam.ng').trim()
  if (!raw) return 'https://www.fizam.ng'

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
  if (!image || image === '/images/og-image.png') return absoluteUrl(DEFAULT_OG_IMAGE)
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
  const metaDescription = trimShareDescription(description ?? DEFAULT_DESCRIPTION)
  const ogImage = resolveOgImage(image)
  const ogImageAlt = image ? `${SITE_NAME} — ${metaTitle}` : DEFAULT_OG_IMAGE_ALT
  const ogImageType = ogImage.endsWith('.png') ? 'image/png' : DEFAULT_OG_IMAGE_TYPE

  let metadataBase: URL
  try {
    metadataBase = new URL(siteUrl)
  } catch {
    metadataBase = new URL('https://www.fizam.ng')
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
    icons: {
      icon: [
        { url: '/images/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/images/favicon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      shortcut: '/images/favicon-32.png',
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
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: ogImageAlt,
          type: ogImageType,
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
    },
  }
}

export function titleWithBrand(pageTitle: string): string {
  if (/fizam/i.test(pageTitle)) return pageTitle
  return `${pageTitle} | ${SITE_NAME}`
}
