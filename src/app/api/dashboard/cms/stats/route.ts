import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'cms.view')
  if (!auth.ok) return auth.response

  try {
    const payload = await getPayloadSingleton()
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [pagesRes, mediaRes, pageviewsRes] = await Promise.all([
      payload.find({ collection: 'pages', limit: 1000, depth: 0, sort: '-updatedAt', overrideAccess: true }),
      payload.find({ collection: 'media', limit: 1, depth: 0, overrideAccess: true }),
      payload.find({
        collection: 'analytics-events',
        where: { and: [{ type: { equals: 'pageview' } }, { createdAt: { greater_than: since } }] },
        limit: 100000,
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const pages = pagesRes.docs as Array<{
      id: number | string
      title: string
      slug: string
      status?: string
      metaTitle?: string | null
      metaDescription?: string | null
      updatedAt: string
    }>

    // Pageviews grouped by path.
    const viewsByPath = new Map<string, number>()
    for (const e of pageviewsRes.docs as Array<{ path?: string | null }>) {
      const path = (e.path || '/').split('?')[0]
      viewsByPath.set(path, (viewsByPath.get(path) ?? 0) + 1)
    }

    const totalPages = pagesRes.totalDocs
    const publishedPages = pages.filter((p) => p.status === 'published').length

    // SEO score = average meta-completeness across pages (metaTitle + metaDescription).
    let seoScore = 0
    if (pages.length > 0) {
      const points = pages.reduce((sum, p) => {
        let s = 0
        if (p.metaTitle && p.metaTitle.trim()) s += 1
        if (p.metaDescription && p.metaDescription.trim()) s += 1
        return sum + s / 2
      }, 0)
      seoScore = Math.round((points / pages.length) * 100)
    }

    const recentPages = pages.slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status ?? 'draft',
      updatedAt: p.updatedAt,
      views: viewsByPath.get(`/${p.slug}`) ?? 0,
    }))

    const homeViews = viewsByPath.get('/') ?? 0

    return NextResponse.json(
      {
        totalPages,
        publishedPages,
        mediaCount: mediaRes.totalDocs,
        seoScore,
        homeViews,
        recentPages,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[dashboard/cms/stats GET]', e)
    return NextResponse.json({ error: 'Failed to load CMS stats' }, { status: 500 })
  }
}
