import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { toApplicationResponse } from '@/lib/applicationApi'
import { resolveMediaFromDoc } from '@/lib/mediaUrl'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = await authorizeCapability(request, 'applications.manage')
  if (!auth.ok) return auth.response
  try {
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'applications',
      limit: 500,
      sort: '-createdAt',
      depth: 1,
      overrideAccess: true,
    })
    return NextResponse.json(
      result.docs.map((doc) =>
        toApplicationResponse(doc, resolveMediaFromDoc(doc.resume)),
      ),
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[admin/applications GET]', e)
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 })
  }
}
