import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { getPayloadSingleton } from '@/lib/payload'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'cms.pages.view')
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const status = searchParams.get('status') || ''

  const and: Where[] = []
  if (status) and.push({ status: { equals: status } })
  if (q) and.push({ or: [{ title: { like: q } }, { slug: { like: q } }] })
  const where: Where = and.length > 0 ? { and } : {}

  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'pages',
      where,
      sort: '-updatedAt',
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })
    const docs = result.docs.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: (p as { status?: string }).status ?? 'draft',
      metaTitle: p.metaTitle ?? '',
      metaDescription: p.metaDescription ?? '',
      sections: Array.isArray((p as { layout?: unknown[] }).layout)
        ? (p as { layout?: unknown[] }).layout!.length
        : 0,
      updatedAt: p.updatedAt,
    }))
    return NextResponse.json({ docs, totalDocs: result.totalDocs }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (e) {
    console.error('[admin/pages GET]', e)
    return NextResponse.json({ error: 'Failed to load pages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await authorizeCapability(request, 'cms.pages.create')
  if (!auth.ok) return auth.response

  let body: { title?: string; slug?: string; metaTitle?: string; metaDescription?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const title = body.title?.trim()
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  const slug = (body.slug?.trim() ? slugify(body.slug) : slugify(title)) || `page-${Date.now()}`

  try {
    const payload = await getPayloadSingleton()
    // Guard against duplicate slug.
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      return NextResponse.json({ error: `A page with slug "${slug}" already exists.` }, { status: 409 })
    }

    const created = await payload.create({
      collection: 'pages',
      data: {
        title,
        slug,
        status: 'draft',
        metaTitle: body.metaTitle?.trim() || undefined,
        metaDescription: body.metaDescription?.trim() || undefined,
      },
      overrideAccess: true,
    })
    return NextResponse.json({ doc: { id: created.id, title: created.title, slug: created.slug } }, { status: 201 })
  } catch (e) {
    console.error('[admin/pages POST]', e)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
