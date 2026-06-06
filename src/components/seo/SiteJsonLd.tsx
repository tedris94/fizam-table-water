import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  SITE_DOMAIN,
  SITE_NAME,
  SITE_SHORT_NAME,
} from '@/lib/seo'
import { getSiteSeoSettings } from '@/lib/site-settings-seo'

/**
 * Organization + WebSite + Brand JSON-LD for brand queries ("Fizam", "fizam.ng").
 */
export async function SiteJsonLd() {
  const settings = await getSiteSeoSettings()
  const sameAs = [settings.facebook, settings.instagram, settings.twitter, settings.linkedin].filter(
    Boolean,
  ) as string[]
  const siteUrl = absoluteUrl('/')
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE)

  const brand = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': `${siteUrl}#brand`,
    name: SITE_SHORT_NAME,
    alternateName: ['Fizam', 'FIZAM', 'Fizam Water', SITE_DOMAIN],
    url: siteUrl,
    logo: absoluteUrl('/images/logo.png'),
    slogan: 'Purity, Refreshment, and Quality You Can Trust',
    description: settings.defaultMetaDescription,
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: SITE_NAME,
    legalName: 'Alfurat Nigeria Limited',
    alternateName: ['Fizam', 'FIZAM', 'Fizam Water', SITE_DOMAIN, 'fizam.ng'],
    url: siteUrl,
    logo: absoluteUrl('/images/logo.png'),
    image: ogImage,
    description: settings.defaultMetaDescription,
    email: settings.contactEmail || undefined,
    telephone: settings.contactPhone || undefined,
    brand: { '@id': `${siteUrl}#brand` },
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          addressCountry: 'NG',
          addressLocality: settings.address,
        }
      : undefined,
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Federal Capital Territory' },
      { '@type': 'Country', name: 'Nigeria' },
    ],
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    name: SITE_SHORT_NAME,
    alternateName: ['Fizam', 'Fizam Table Water', SITE_DOMAIN, 'fizam.ng'],
    url: siteUrl,
    inLanguage: 'en-NG',
    publisher: { '@id': `${siteUrl}#organization` },
    about: { '@id': `${siteUrl}#brand` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/order')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#localbusiness`,
    name: SITE_NAME,
    alternateName: ['Fizam', 'Fizam Table Water', SITE_DOMAIN],
    url: siteUrl,
    image: ogImage,
    description: settings.defaultMetaDescription,
    telephone: settings.contactPhone || undefined,
    email: settings.contactEmail || undefined,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
      addressLocality: settings.address || 'Federal Capital Territory',
    },
    priceRange: '₦₦',
    knowsAbout: [
      'Fizam Table Water',
      'Bottled water',
      'Sachet water',
      'Table water',
      'Water delivery Nigeria',
    ],
  }

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}#webpage`,
    url: siteUrl,
    name: `Fizam — Official ${SITE_DOMAIN}`,
    description: settings.defaultMetaDescription,
    isPartOf: { '@id': `${siteUrl}#website` },
    about: { '@id': `${siteUrl}#brand` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImage,
      name: DEFAULT_OG_IMAGE_ALT,
    },
    inLanguage: 'en-NG',
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [brand, organization, website, localBusiness, webPage],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
