import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { getPayloadSingleton } from '@/lib/payload'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'audit.view')
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || ''
  const collection = searchParams.get('collection') || ''
  const q = searchParams.get('q')?.trim() || ''
  const page = Math.max(Number(searchParams.get('page')) || 1, 1)
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 25, 1), 100)

  const and: Where[] = []
  if (action) and.push({ action: { equals: action } })
  if (collection) and.push({ collectionSlug: { equals: collection } })
  if (q) {
    and.push({
      or: [
        { userEmail: { like: q } },
        { title: { like: q } },
        { documentId: { equals: q } },
      ],
    })
  }
  const where: Where = and.length > 0 ? { and } : {}

  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'audit-logs',
      where,
      sort: '-createdAt',
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json(
      {
        docs: result.docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[dashboard/audit GET]', e)
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 })
  }
}
