import { NextResponse } from 'next/server'
import { getPayloadSingleton } from '@/lib/payload'
import type { User } from '@/payload-types'

/** Orders placed by the logged-in customer (matches shipping.email). */
export async function GET(request: Request) {
  const payload = await getPayloadSingleton()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = (user as User).email

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
