import { NextResponse } from 'next/server'
import { lexicalToPlainText, matchesSearchQuery } from '@/lib/lexicalPlainText'
import { fetchProductTaxonomy } from '@/lib/productTaxonomy'
import {
  dedupeContentHits,
  searchStaticSitePages,
  searchStaticSiteSections,
  type SiteContentHit,
} from '@/lib/siteSearchIndex'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function mapCmsPage(page: {
  id: number | string
  title: string
  slug: string
  metaDescription?: string | null
  metaTitle?: string | null
  body?: unknown
}): SiteContentHit | null {
  const href = page.slug === 'home' ? '/' : `/${page.slug}`
  return {
    id: `cms-page-${page.id}`,
    title: page.title,
    href,
    excerpt: page.metaDescription ?? page.metaTitle ?? undefined,
    type: 'page',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], content: [], query: q ?? '' })
  }

  try {
    const payload = await getPayloadSingleton()
    const taxonomy = await fetchProductTaxonomy(true)
    const categoryLabels = Object.fromEntries(
      taxonomy.categories.map((c) => [c.slug, c.label]),
    )

    const [productsResult, pagesResult, jobsResult, teamResult, homePage] = await Promise.all([
      payload.find({
        collection: 'products',
        limit: 24,
        depth: 1,
        where: {
          or: [
            { name: { contains: q } },
            { size: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
          ],
        },
        overrideAccess: true,
      }),
      payload.find({
        collection: 'pages',
        limit: 100,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'jobs',
        limit: 50,
        where: { status: { equals: 'active' } },
        overrideAccess: true,
      }),
      payload.find({
        collection: 'team-members',
        limit: 100,
        overrideAccess: true,
      }),
      payload.findGlobal({ slug: 'home-page', depth: 0 }).catch(() => null),
    ])

    const products = productsResult.docs.map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
      price: p.price,
      description: p.description,
      category: p.category,
      categoryLabel: categoryLabels[p.category ?? ''] ?? p.category,
      stock: p.stock,
    }))

    const staticHits = searchStaticSitePages(q)
    const sectionHits = searchStaticSiteSections(q)

    const cmsPageHits = pagesResult.docs
      .filter((page) => {
        const bodyText = lexicalToPlainText(page.body)
        return matchesSearchQuery(
          [page.title, page.slug, page.metaTitle, page.metaDescription, bodyText]
            .filter(Boolean)
            .join(' '),
          q,
        )
      })
      .map(mapCmsPage)
      .filter((hit): hit is SiteContentHit => hit !== null)

    const homeSectionHits: SiteContentHit[] = []
    if (homePage) {
      const heroText = [homePage.heroTitle, homePage.heroSubtitle].filter(Boolean).join(' ')
      if (matchesSearchQuery(heroText, q)) {
        homeSectionHits.push({
          id: 'global-home-hero',
          title: homePage.heroTitle ?? 'Welcome',
          href: '/',
          excerpt: homePage.heroSubtitle ?? undefined,
          type: 'section',
        })
      }

      const aboutText = [homePage.aboutHeading, lexicalToPlainText(homePage.aboutBody)]
        .filter(Boolean)
        .join(' ')
      if (matchesSearchQuery(aboutText, q)) {
        homeSectionHits.push({
          id: 'global-home-about',
          title: homePage.aboutHeading ?? 'About FIZAM',
          href: '/#about',
          excerpt: lexicalToPlainText(homePage.aboutBody).slice(0, 160) || undefined,
          type: 'section',
        })
      }
    }

    const jobHits: SiteContentHit[] = jobsResult.docs
      .filter((job) =>
        matchesSearchQuery(
          [
            job.title,
            job.slug,
            job.department,
            job.location,
            job.type,
            job.salaryRange,
            job.description,
            ...(job.requirements ?? []).map((r) => r.item),
          ]
            .filter(Boolean)
            .join(' '),
          q,
        ),
      )
      .map((job) => ({
        id: `job-${job.id}`,
        title: job.title,
        href: `/careers/${job.slug}/apply`,
        excerpt: [job.department, job.location, job.type].filter(Boolean).join(' · '),
        type: 'career' as const,
      }))

    const teamHits: SiteContentHit[] = teamResult.docs
      .filter((member) =>
        matchesSearchQuery(
          [member.name, member.position, member.department, member.bio]
            .filter(Boolean)
            .join(' '),
          q,
        ),
      )
      .map((member) => ({
        id: `team-${member.id}`,
        title: member.name,
        href: '/team',
        excerpt: [member.position, member.department].filter(Boolean).join(' · '),
        type: 'team' as const,
      }))

    const content = dedupeContentHits([
      ...staticHits,
      ...sectionHits,
      ...homeSectionHits,
      ...cmsPageHits,
      ...jobHits,
      ...teamHits,
    ])

    return NextResponse.json({ products, content, query: q })
  } catch (e) {
    console.error('[search GET]', e)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
