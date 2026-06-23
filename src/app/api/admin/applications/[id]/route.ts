import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { toApplicationResponse } from '@/lib/applicationApi'
import { notifyApplicantOfApplicationStatus } from '@/lib/applicationEmails'
import type { ApplicationStatus } from '@/lib/applicationRef'
import { resolveMediaFromDoc } from '@/lib/mediaUrl'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'applications.manage')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    const doc = await payload.findByID({
      collection: 'applications',
      id: parseId(id),
      depth: 1,
      overrideAccess: true,
    })
    return NextResponse.json(toApplicationResponse(doc, resolveMediaFromDoc(doc.resume)))
  } catch (e) {
    console.error('[admin/applications GET id]', e)
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'applications.manage')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const body = (await request.json()) as {
      status?: ApplicationStatus
      resendNotification?: boolean
    }
    if (
      !body.status ||
      !['pending', 'shortlisted', 'approved', 'rejected'].includes(body.status)
    ) {
      return NextResponse.json({ error: 'Valid status is required.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    const existing = await payload.findByID({
      collection: 'applications',
      id: parseId(id),
      depth: 0,
      overrideAccess: true,
    })

    const previousStatus = existing.status as ApplicationStatus
    const updated = await payload.update({
      collection: 'applications',
      id: parseId(id),
      data: { status: body.status },
      depth: 1,
      overrideAccess: true,
    })

    const applicationRef =
      updated.applicationRef ?? existing.applicationRef ?? `FZ-APP-${updated.id}`

    const jobTitle =
      (updated.jobTitle ??
        (typeof updated.job === 'object' && updated.job && 'title' in updated.job
          ? String(updated.job.title ?? '')
          : '')) || 'your application'

    const statusChanged = body.status !== previousStatus
    const shouldNotifyApplicant =
      Boolean(updated.email) &&
      (body.resendNotification === true ||
        (statusChanged && body.status !== 'pending'))

    let emailSent = false
    let emailError: string | undefined

    if (shouldNotifyApplicant && updated.email) {
      try {
        await notifyApplicantOfApplicationStatus({
          to: updated.email,
          applicantName: updated.fullName,
          jobTitle,
          applicationRef,
          status: body.status,
        })
        emailSent = true
        console.info(
          `[admin/applications] status email sent to ${updated.email} (${body.status})`,
        )
      } catch (err) {
        emailError =
          err instanceof Error ? err.message : 'Could not send applicant notification email.'
        console.error('[admin/applications] status email', err)
      }
    }

    return NextResponse.json({
      ...toApplicationResponse(updated, resolveMediaFromDoc(updated.resume)),
      emailSent,
      emailError,
    })
  } catch (e) {
    console.error('[admin/applications PUT]', e)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'applications.delete')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    await payload.delete({
      collection: 'applications',
      id: parseId(id),
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/applications DELETE]', e)
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}
