import { matchesSearchQuery } from '@/lib/lexicalPlainText'

export type SiteContentHit = {
  id: string
  title: string
  href: string
  excerpt?: string
  type: 'page' | 'section' | 'career' | 'team'
}

/** Built-in site routes and searchable copy (most pages are not in the CMS pages collection). */
const STATIC_SITE_PAGES: Array<{
  id: string
  title: string
  href: string
  excerpt: string
  text: string
  type: 'page'
}> = [
  {
    id: 'static-home',
    title: 'Home',
    href: '/',
    excerpt: 'Premium quality Fizam table water — order online or learn about our products.',
    text:
      'home fizam table water premium quality hydration products order now quality sales channels contact',
    type: 'page',
  },
  {
    id: 'static-about',
    title: 'About Fizam',
    href: '/about',
    excerpt: 'Alfurat Nigeria Limited — purification, quality, and service across Nigeria.',
    text:
      'about alfurat nigeria limited fizam table water reverse osmosis ozonization purification quality safety bottled sachet dispenser federal capital territory fct factory production',
    type: 'page',
  },
  {
    id: 'static-team',
    title: 'Our Team',
    href: '/team',
    excerpt: 'Meet the people behind Fizam Table Water.',
    text: 'team leadership staff members management fizam employees',
    type: 'page',
  },
  {
    id: 'static-careers',
    title: 'Careers',
    href: '/careers',
    excerpt: 'Open roles in production, quality, sales, and operations.',
    text: 'careers jobs employment hiring vacancies production quality sales operations apply',
    type: 'page',
  },
  {
    id: 'static-quality',
    title: 'Quality & Certifications',
    href: '/quality-certifications',
    excerpt: 'NAFDAC registration, lab testing, and quality assurance.',
    text:
      'quality certifications nafdac iso lab tested purity standards compliance drinking water safety',
    type: 'page',
  },
  {
    id: 'static-order',
    title: 'Order Water Online',
    href: '/order',
    excerpt: 'Order table water, sachet water, and dispenser bottles with delivery.',
    text: 'order buy shop checkout delivery pickup paystack cart table water sachet dispenser',
    type: 'page',
  },
  {
    id: 'static-privacy',
    title: 'Privacy Policy',
    href: '/privacy-policy',
    excerpt: 'How Fizam collects, uses, and protects your personal information.',
    text:
      'privacy policy personal data information cookies email phone contact order account security',
    type: 'page',
  },
  {
    id: 'static-terms',
    title: 'Terms of Service',
    href: '/terms-of-service',
    excerpt: 'Terms for ordering and using Fizam Table Water services.',
    text:
      'terms of service order delivery payment refund cancellation liability products sachet table water dispenser wholesale retail factory',
    type: 'page',
  },
]

/** Homepage anchor sections (grouped separately from full pages in search). */
const STATIC_SITE_SECTIONS: Array<{
  id: string
  title: string
  href: string
  excerpt: string
  text: string
}> = [
  {
    id: 'section-about',
    title: 'About FIZAM',
    href: '/#about',
    excerpt: 'NAFDAC-certified table water — our mission, facility, and how we serve you.',
    text: 'about fizam mission nafdac certified homes facility story alfurat',
  },
  {
    id: 'section-products',
    title: 'Our Products',
    href: '/#products',
    excerpt: 'Table water, sachet water, and dispenser sizes for every need.',
    text: 'products table water sachet dispenser 35cl 50cl 75cl 19l hydration sizes order',
  },
  {
    id: 'section-quality',
    title: 'Quality Assurance',
    href: '/#quality',
    excerpt: 'Laboratory tested, certified, and purified for purity and great taste.',
    text:
      'quality assurance purity taste laboratory tested certified filtration purification standards safe',
  },
  {
    id: 'section-sales',
    title: 'How to Buy',
    href: '/#sales',
    excerpt: 'Retail, wholesale, factory pickup, and home delivery options.',
    text: 'sales channels retail wholesale factory direct home delivery buy order distribution',
  },
  {
    id: 'section-contact',
    title: 'Contact Us',
    href: '/#contact',
    excerpt: 'Questions, orders, and enquiries — reach the Fizam team.',
    text: 'contact get in touch phone email message order enquiry support',
  },
]

export function searchStaticSitePages(query: string): SiteContentHit[] {
  return STATIC_SITE_PAGES.filter((page) =>
    matchesSearchQuery([page.title, page.excerpt, page.text, page.href].join(' '), query),
  ).map((page) => ({
    id: page.id,
    title: page.title,
    href: page.href,
    excerpt: page.excerpt,
    type: page.type,
  }))
}

export function searchStaticSiteSections(query: string): SiteContentHit[] {
  return STATIC_SITE_SECTIONS.filter((section) =>
    matchesSearchQuery([section.title, section.excerpt, section.text, section.href].join(' '), query),
  ).map((section) => ({
    id: section.id,
    title: section.title,
    href: section.href,
    excerpt: section.excerpt,
    type: 'section' as const,
  }))
}

export function dedupeContentHits(hits: SiteContentHit[]): SiteContentHit[] {
  const seen = new Set<string>()
  const result: SiteContentHit[] = []
  for (const hit of hits) {
    const key = `${hit.type}:${hit.href}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(hit)
  }
  return result
}
