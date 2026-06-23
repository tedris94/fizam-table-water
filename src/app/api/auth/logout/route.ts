import { NextResponse } from 'next/server'
import { PAYLOAD_TOKEN_COOKIE } from '@/constants/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Clears the Payload auth cookie so dashboard middleware and /api/users/me treat the user as signed out. */
export async function POST() {
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
