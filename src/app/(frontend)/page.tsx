import type { Metadata } from 'next'
import { getPayloadSingleton } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/mediaUrl'
import { buildPageMetadata } from '@/lib/seo'
import { getSiteSeoSettings } from '@/lib/site-settings-seo'
import { getHeaderData } from '@/lib/site-chrome'
import { SiteHeader } from '@/components/frontend/SiteHeader'
import { RenderBlocks } from '@/components/frontend/blocks/RenderBlocks'
import { ImageTextSection } from '@/components/frontend/blocks/sections'
import { Hero } from '@/components/frontend/Hero'
import { Products } from '@/components/frontend/Products'
import { Quality } from '@/components/frontend/Quality'
import { SalesChannels } from '@/components/frontend/SalesChannels'
import { Contact } from '@/components/frontend/Contact'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'
import { HashHighlighter } from '@/components/frontend/HashHighlighter'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSeoSettings()
  return buildPageMetadata({
    title: 'Fizam — Official fizam.ng | Fizam Table Water Nigeria',
    description:
      'Official Fizam Table Water (fizam.ng). NAFDAC-certified sachet & bottled water by Alfurat Nigeria Limited. Order online in FCT and Nigeria.',
    path: '/',
    keywords: ['Fizam', 'fizam', 'fizam.ng', 'Fizam official', 'Fizam Table Water', ...settings.defaultKeywords],
  })
}

export default async function HomePage() {
  let home: Record<string, unknown> | null = null

  try {
    const payload = await getPayloadSingleton()
    home = (await payload.findGlobal({ slug: 'home-page', depth: 2 })) as unknown as Record<string, unknown>
  } catch (error) {
    console.error('Payload home-page fetch failed:', error)
  }

  const headerData = await getHeaderData()
  const header = (
    <SiteHeader
      variant="transparent"
      brandName={headerData?.brandName}
      navLinks={headerData?.navLinks}
      ctaLabel={headerData?.ctaLabel}
      ctaHref={headerData?.ctaHref}
      showLogin={headerData?.showLogin ?? true}
    />
  )

  const layout = (home?.layout as { blockType?: string }[] | undefined) ?? []

  return (
    <>
      {layout.length > 0 ? (
        <RenderBlocks blocks={layout} heroHeader={header} heroShowSearch />
      ) : (
        <LegacyHome home={home} header={header} />
      )}
      <Footer />
      <BackToTop />
      <HashHighlighter />
    </>
  )
}

/** Fallback rendering that reproduces the original hardcoded home page until the Home layout is seeded. */
function LegacyHome({ home, header }: { home: Record<string, unknown> | null; header: React.ReactNode }) {
  const heroTitle = (home?.heroTitle as string) || 'Welcome to Fizam Table Water'
  const heroSubtitle =
    (home?.heroSubtitle as string) ||
    'Order sachet, bottle, and dispenser water online with fast delivery across Nigeria.'
  const heroImageRaw = home?.heroImage as { url?: string | null } | null
  const heroImage = resolveMediaUrl(heroImageRaw && typeof heroImageRaw === 'object' ? heroImageRaw.url : null)

  return (
    <>
      <Hero heroTitle={heroTitle} heroSubtitle={heroSubtitle} heroImageUrl={heroImage} header={header} showSearch />
      <ImageTextSection
        heading="About FIZAM"
        body="NAFDAC-certified table water for Nigerian homes—our mission, facility, and how we serve you."
        cta={{ label: 'About us — full story', href: '/about' }}
      />
      <Products />
      <Quality />
      <SalesChannels />
      <Contact />
    </>
  )
}
