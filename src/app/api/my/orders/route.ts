import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadSingleton } from '@/lib/payload'

/** Orders placed by the logged-in customer (matches shipping.email). */
export async function GET(request: Request) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayloadSingleton()
  const email = user.email
  const orders = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    where: {
      'shipping.email': {
        equals: email,
      },
    },
    sort: '-createdAt',
    limit: 100,
    depth: 2,
  })

  const mapped = orders.docs.map((o) => ({
    id: String(o.id),
    items: o.items,
    total: o.total,
    status: o.status,
    created_at: o.createdAt,
  }))

  return NextResponse.json(mapped)
}
