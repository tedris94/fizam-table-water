import { NextResponse } from 'next/server'
import { authorizeCapability } from '@/lib/dashboardAuth'
import { notifyCustomerOfOrderStatus } from '@/lib/orderEmails'
import { toOrderResponse } from '@/lib/orderApi'
import type { OrderStatus } from '@/lib/orderRef'
import { getPayloadSingleton } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'delivered',
  'cancelled',
]

function parseId(raw: string): number | string {
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'orders.view')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const payload = await getPayloadSingleton()
    const doc = await payload.findByID({
      collection: 'orders',
      id: parseId(id),
      depth: 3,
      overrideAccess: true,
    })
    return NextResponse.json(toOrderResponse(doc as Parameters<typeof toOrderResponse>[0]))
  } catch (e) {
    console.error('[admin/orders GET id]', e)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await authorizeCapability(request, 'orders.view')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const body = (await request.json()) as {
      status?: OrderStatus
      resendNotification?: boolean
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Valid status is required.' }, { status: 400 })
    }

    const payload = await getPayloadSingleton()
    const existing = await payload.findByID({
      collection: 'orders',
      id: parseId(id),
      depth: 3,
      overrideAccess: true,
    })

    const previousStatus = existing.status as OrderStatus
    const updated = await payload.update({
      collection: 'orders',
      id: parseId(id),
      data: { status: body.status },
      depth: 3,
      overrideAccess: true,
    })

    const statusChanged = body.status !== previousStatus
    const shouldNotifyCustomer =
      Boolean(updated.shipping?.email) &&
      (body.resendNotification === true ||
        (statusChanged &&
          body.status !== 'pending' &&
          (body.status === 'processing' ||
            body.status === 'delivered' ||
            body.status === 'cancelled' ||
            (body.status === 'paid' && previousStatus === 'pending'))))

    let emailSent = false
    let emailError: string | undefined

    if (shouldNotifyCustomer && updated.shipping?.email) {
      try {
        await notifyCustomerOfOrderStatus(
          updated as Parameters<typeof notifyCustomerOfOrderStatus>[0],
          body.status,
        )
        emailSent = true
        console.info(
          `[admin/orders] status email sent to ${updated.shipping.email} (${body.status})`,
        )
      } catch (err) {
        emailError =
          err instanceof Error ? err.message : 'Could not send customer notification email.'
        console.error('[admin/orders] status email', err)
      }
    }

    return NextResponse.json({
      ...toOrderResponse(updated as Parameters<typeof toOrderResponse>[0]),
      emailSent,
      emailError,
    })
  } catch (e) {
    console.error('[admin/orders PUT]', e)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
