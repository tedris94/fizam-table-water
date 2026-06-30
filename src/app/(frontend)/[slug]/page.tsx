import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadSingleton } from '@/lib/payload'
import { buildPageMetadata, titleWithBrand } from '@/lib/seo'
import { getHeaderData } from '@/lib/site-chrome'
import { SiteHeader } from '@/components/frontend/SiteHeader'
import { RenderBlocks } from '@/components/frontend/blocks/RenderBlocks'
import { RichTextSection } from '@/components/frontend/blocks/sections'
import { Footer } from '@/components/frontend/Footer'
import { BackToTop } from '@/components/frontend/BackToTop'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

async function loadPage(slug: string) {
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      depth: 2,
      limit: 1,
    })
    return result.docs[0] ?? null
  } catch (error) {
    console.error('Payload page fetch failed:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await loadPage(slug)
  if (!page) {
    return buildPageMetadata({ title: titleWithBrand('Page not found'), path: `/${slug}`, noIndex: true })
  }
  const keywords = (page as { keywords?: string | null }).keywords
    ?.split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  return buildPageMetadata({
    title: page.metaTitle || titleWithBrand(page.title),
    description: page.metaDescription || undefined,
    path: `/${slug}`,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
  })
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await loadPage(slug)
  if (!page) notFound()

  const headerData = await getHeaderData()
  const layout = (page.layout as { blockType?: string }[] | undefined) ?? []

  return (
    <>
      <SiteHeader
        variant="solid"
        brandName={headerData?.brandName}
        navLinks={headerData?.navLinks}
        ctaLabel={headerData?.ctaLabel}
        ctaHref={headerData?.ctaHref}
        showLogin={headerData?.showLogin ?? true}
      />
      <main className="pt-[72px]">
        {layout.length > 0 ? (
          <RenderBlocks blocks={layout} />
        ) : page.body ? (
          <RichTextSection content={page.body as never} />
        ) : (
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-3xl">
              <h1 className="text-4xl text-[#1a1f71]">{page.title}</h1>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
