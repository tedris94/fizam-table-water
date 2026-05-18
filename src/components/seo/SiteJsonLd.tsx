import { absoluteUrl, SITE_NAME } from '@/lib/seo'
import { getSiteSeoSettings } from '@/lib/site-settings-seo'

/**
 * Organization + WebSite JSON-LD for brand queries ("Fizam", "Fizam Table Water").
 */
export async function SiteJsonLd() {
  const settings = await getSiteSeoSettings()
  const sameAs = [settings.facebook, settings.instagram, settings.twitter, settings.linkedin].filter(
    Boolean,
  ) as string[]

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${absoluteUrl('/')}#organization`,
    name: SITE_NAME,
    alternateName: ['Fizam', 'FIZAM', 'Fizam Water', 'fizam.ng'],
    url: absoluteUrl('/'),
    logo: settings.logoUrl ? absoluteUrl(settings.logoUrl) : absoluteUrl('/icon.svg'),
    description: settings.defaultMetaDescription,
    email: settings.contactEmail || undefined,
    telephone: settings.contactPhone || undefined,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          addressCountry: 'NG',
          addressLocality: settings.address,
        }
      : undefined,
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/')}#website`,
    name: SITE_NAME,
    alternateName: ['Fizam', 'fizam.ng'],
    url: absoluteUrl('/'),
    publisher: { '@id': `${absoluteUrl('/')}#organization` },
    inLanguage: 'en-NG',
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
    '@id': `${absoluteUrl('/')}#localbusiness`,
    name: SITE_NAME,
    alternateName: ['Fizam', 'Fizam Table Water'],
    url: absoluteUrl('/'),
    image: absoluteUrl('/icon.svg'),
    description: settings.defaultMetaDescription,
    telephone: settings.contactPhone || undefined,
    email: settings.contactEmail || undefined,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
      addressLocality: settings.address || 'Lagos',
    },
    priceRange: '₦₦',
    servesCuisine: undefined,
    knowsAbout: ['Bottled water', 'Table water', 'Sachet water', 'Water delivery'],
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, website, localBusiness],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
