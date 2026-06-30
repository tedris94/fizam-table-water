import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'cms.seo.manage')
  if (!auth.ok) return auth.response

  try {
    const payload = await getPayloadSingleton()
    const doc = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return NextResponse.json(
      {
        siteName: doc.siteName ?? '',
        defaultMetaTitle: doc.defaultMetaTitle ?? '',
        defaultMetaDescription: doc.defaultMetaDescription ?? '',
        defaultKeywords: doc.defaultKeywords ?? '',
        googleSiteVerification: doc.googleSiteVerification ?? '',
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[admin/seo GET]', e)
    return NextResponse.json({ error: 'Failed to load SEO settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await authorizeCapability(request, 'cms.seo.manage')
  if (!auth.ok) return auth.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  for (const key of [
    'siteName',
    'defaultMetaTitle',
    'defaultMetaDescription',
    'defaultKeywords',
    'googleSiteVerification',
  ]) {
    if (typeof body[key] === 'string') data[key] = (body[key] as string).trim()
  }

  try {
    const payload = await getPayloadSingleton()
    const updated = await payload.updateGlobal({ slug: 'site-settings', data, overrideAccess: true })
    return NextResponse.json({
      siteName: updated.siteName ?? '',
      defaultMetaTitle: updated.defaultMetaTitle ?? '',
      defaultMetaDescription: updated.defaultMetaDescription ?? '',
      defaultKeywords: updated.defaultKeywords ?? '',
      googleSiteVerification: updated.googleSiteVerification ?? '',
    })
  } catch (e) {
    console.error('[admin/seo PUT]', e)
    return NextResponse.json({ error: 'Failed to save SEO settings' }, { status: 500 })
  }
}
