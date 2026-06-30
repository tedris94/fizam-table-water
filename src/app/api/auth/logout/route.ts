import { NextResponse } from 'next/server'
import { PAYLOAD_TOKEN_COOKIE } from '@/constants/payload'
import { isPayloadEnabled } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Clears the Payload auth cookie so dashboard middleware and /api/users/me treat the user as signed out. */
export async function POST(request: Request) {
  // Best-effort audit log of the logout before the cookie is cleared.
  if (isPayloadEnabled() && (request.headers.get('cookie') ?? '').includes('payload-token=')) {
    try {
      const { getCurrentUser } = await import('@/lib/auth')
      const user = await getCurrentUser(request)
      if (user) {
        const { getPayloadSingleton } = await import('@/lib/payload')
        const payload = await getPayloadSingleton()
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        await payload.create({
          collection: 'audit-logs',
          overrideAccess: true,
          data: {
            action: 'logout',
            collectionSlug: 'users',
            documentId: String(user.id),
            title: user.email,
            userId: typeof user.id === 'number' ? user.id : Number(user.id) || undefined,
            userEmail: user.email,
            userRole: (user as { role?: string }).role,
            ip: ip || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
          },
        })
      }
    } catch {
      // never block logout on audit failure
    }
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(PAYLOAD_TOKEN_COOKIE, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    maxAge: 0,
  })
  return response
}
