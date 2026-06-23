import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { canViewEmailTemplates } from '@/lib/emailTemplateCatalog'
import {
  ensureEmailTemplatesSeeded,
  toEmailTemplateResponse,
} from '@/lib/emailTemplateEngine'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!canViewEmailTemplates(user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureEmailTemplatesSeeded()
    const payload = await getPayloadSingleton()
    const result = await payload.find({
      collection: 'email-templates',
      limit: 50,
      sort: 'category',
      overrideAccess: true,
    })

    return NextResponse.json(
      result.docs.map((doc) => toEmailTemplateResponse(doc as Parameters<typeof toEmailTemplateResponse>[0])),
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (e) {
    console.error('[admin/email-templates GET]', e)
    return NextResponse.json({ error: 'Failed to load email templates' }, { status: 500 })
  }
}
