import { getPayloadSingleton } from '@/lib/payload'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_NAME,
} from '@/lib/seo'

export type SiteSeoSettings = {
  siteName: string
  defaultMetaTitle: string
  defaultMetaDescription: string
  defaultKeywords: string[]
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
  facebook?: string | null
  instagram?: string | null
  twitter?: string | null
  linkedin?: string | null
  googleSiteVerification?: string | null
  logoUrl?: string | null
}

const FALLBACK: SiteSeoSettings = {
  siteName: SITE_NAME,
  defaultMetaTitle: DEFAULT_TITLE,
  defaultMetaDescription: DEFAULT_DESCRIPTION,
  defaultKeywords: DEFAULT_KEYWORDS,
  logoUrl: '/images/og-image.png',
  contactEmail: 'hello@fizam.ng',
  contactPhone: '+234 800 000 0000',
  address: 'Lagos, Nigeria',
}

let cache: SiteSeoSettings | null = null

export async function getSiteSeoSettings(): Promise<SiteSeoSettings> {
  if (cache) return cache
  try {
    const payload = await getPayloadSingleton()
    const doc = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
    const logo =
      doc.logo && typeof doc.logo === 'object' && 'url' in doc.logo
        ? String(doc.logo.url)
        : null

    cache = {
      siteName: doc.siteName || FALLBACK.siteName,
      defaultMetaTitle: doc.defaultMetaTitle || FALLBACK.defaultMetaTitle,
      defaultMetaDescription: doc.defaultMetaDescription || FALLBACK.defaultMetaDescription,
      defaultKeywords:
        typeof doc.defaultKeywords === 'string' && doc.defaultKeywords.trim()
          ? doc.defaultKeywords.split(',').map((k) => k.trim()).filter(Boolean)
          : FALLBACK.defaultKeywords,
      contactEmail: doc.contactEmail ?? FALLBACK.contactEmail,
      contactPhone: doc.contactPhone ?? FALLBACK.contactPhone,
      address: doc.address ?? FALLBACK.address,
      facebook: doc.facebook ?? null,
      instagram: doc.instagram ?? null,
      twitter: doc.twitter ?? null,
      linkedin: doc.linkedin ?? null,
      googleSiteVerification: doc.googleSiteVerification ?? null,
      logoUrl: logo,
    }
    return cache
  } catch {
    return FALLBACK
  }
}
