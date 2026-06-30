import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await authorizeCapability(request, 'cms.pages.edit')
  if (!auth.ok) return auth.response
  const { id } = await params

  let body: {
    title?: string
    slug?: string
    metaTitle?: string
    metaDescription?: string
    status?: 'draft' | 'published'
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Publishing/unpublishing requires the dedicated capability.
  if (typeof body.status === 'string') {
    const pub = await authorizeCapability(request, 'cms.pages.publish')
    if (!pub.ok) return pub.response
  }

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string') data.title = body.title.trim()
  if (typeof body.slug === 'string' && body.slug.trim()) data.slug = slugify(body.slug)
  if (typeof body.metaTitle === 'string') data.metaTitle = body.metaTitle.trim()
  if (typeof body.metaDescription === 'string') data.metaDescription = body.metaDescription.trim()
  if (body.status === 'draft' || body.status === 'published') data.status = body.status

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    const payload = await getPayloadSingleton()
    const updated = await payload.update({
      collection: 'pages',
      id,
      data,
      overrideAccess: true,
    })
    return NextResponse.json({
      doc: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        status: (updated as { status?: string }).status ?? 'draft',
        metaTitle: updated.metaTitle ?? '',
        metaDescription: updated.metaDescription ?? '',
      },
    })
  } catch (e) {
    console.error('[admin/pages PATCH]', e)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await authorizeCapability(request, 'cms.pages.delete')
  if (!auth.ok) return auth.response
  const { id } = await params

  try {
    const payload = await getPayloadSingleton()
    await payload.delete({ collection: 'pages', id, overrideAccess: true })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/pages DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
