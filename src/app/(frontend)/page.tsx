import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadSingleton } from '@/lib/payload'
import { buildPageMetadata, titleWithBrand } from '@/lib/seo'
import { getSiteSeoSettings } from '@/lib/site-settings-seo'
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
    title: titleWithBrand('Fizam — Official Site | Table Water Nigeria'),
    description:
      'Welcome to Fizam (fizam.ng) — the official Fizam Table Water website. NAFDAC-certified sachet, bottle & dispenser water. Order online for delivery across Nigeria.',
    path: '/',
    keywords: ['Fizam', 'fizam.ng', 'Fizam Table Water', ...settings.defaultKeywords],
    image: settings.logoUrl,
  })
}

export default async function HomePage() {
  let home = null

  try {
    const payload = await getPayloadSingleton()
    home = await payload.findGlobal({ slug: 'home-page', depth: 1 })
  } catch (error) {
    console.error('Payload home-page fetch failed:', error)
  }

  const heroTitle = home?.heroTitle || 'Welcome to Fizam Table Water'
  const heroSubtitle =
    home?.heroSubtitle ||
    'Order sachet, bottle, and dispenser water online with fast delivery across Nigeria.'
  const heroImage =
    home?.heroImage && typeof home.heroImage === 'object' && 'url' in home.heroImage
      ? String(home.heroImage.url)
      : null

  return (
    <>
      <Hero heroTitle={heroTitle} heroSubtitle={heroSubtitle} heroImageUrl={heroImage} />
      <section
        id="about"
        className="border-b border-blue-100 bg-gradient-to-b from-white to-slate-50 py-12 md:py-16"
      >
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 px-4 md:flex-row md:items-center">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#1a1f71] md:text-3xl">About FIZAM</h2>
            <p className="mt-3 max-w-xl text-gray-600">
              NAFDAC-certified table water for Nigerian homes—our mission, facility, and how we
              serve you.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#1a1f71] to-[#2563eb] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            About us — full story
          </Link>
        </div>
      </section>
      <Products />
      <Quality />
      <SalesChannels />
      <Contact />
      <Footer />
      <BackToTop />
      <HashHighlighter />
    </>
  )
}
