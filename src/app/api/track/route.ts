import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { isPayloadEnabled } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const VALID_TYPES = new Set(['pageview', 'click', 'resource_served', 'web_vital'])
const MAX_EVENTS = 25
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|monitor|preview/i

const SESSION_COOKIE = 'fz_sid'
const VISITOR_COOKIE = 'fz_vid'
const SESSION_MAX_AGE = 60 * 30 // 30 minutes
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type IncomingEvent = {
  type?: string
  path?: string
  referrer?: string
  target?: string
  resourceType?: string
  metricName?: string
  metricValue?: number
  rating?: string
}

function str(value: unknown, max = 512): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

export async function POST(request: Request) {
  const userAgent = request.headers.get('user-agent') ?? ''

  // Drop obvious bots/crawlers so analytics reflect real human traffic.
  if (BOT_RE.test(userAgent)) {
    return NextResponse.json({ ok: true, skipped: 'bot' })
  }

  let body: { events?: IncomingEvent[] }
  try {
    body = (await request.json()) as { events?: IncomingEvent[] }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const incoming = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : []
  if (incoming.length === 0) {
    return NextResponse.json({ ok: true, stored: 0 })
  }

  // Resolve / mint identifiers from cookies.
  const cookieHeader = request.headers.get('cookie') ?? ''
  const parseCookie = (name: string) =>
    cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`))
      ?.slice(name.length + 1)

  const sessionId = parseCookie(SESSION_COOKIE) || randomUUID()
  const visitorId = parseCookie(VISITOR_COOKIE) || randomUUID()

  const response = NextResponse.json({ ok: true, stored: incoming.length })
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: VISITOR_MAX_AGE,
  })

  if (!isPayloadEnabled()) {
    return response
  }

  // Best-effort current user (so logged-in activity can be attributed).
  let userId: number | undefined
  let userEmail: string | undefined
  if (cookieHeader.includes('payload-token=')) {
    try {
      const { getCurrentUser } = await import('@/lib/auth')
      const user = await getCurrentUser(request)
      if (user) {
        userId = typeof user.id === 'number' ? user.id : Number(user.id) || undefined
        userEmail = user.email
      }
    } catch {
      // ignore — anonymous tracking is fine
    }
  }

  try {
    const { getPayloadSingleton } = await import('@/lib/payload')
    const payload = await getPayloadSingleton()

    await Promise.all(
      incoming
        .filter((e) => e.type && VALID_TYPES.has(e.type))
        .map((e) =>
          payload.create({
            collection: 'analytics-events',
            data: {
              type: e.type as 'pageview' | 'click' | 'resource_served' | 'web_vital',
              path: str(e.path, 1024),
              referrer: str(e.referrer, 1024),
              sessionId,
              visitorId,
              userId,
              userEmail,
              target: str(e.target, 1024),
              resourceType: str(e.resourceType, 64),
              metricName: str(e.metricName, 32),
              metricValue:
                typeof e.metricValue === 'number' && Number.isFinite(e.metricValue)
                  ? e.metricValue
                  : undefined,
              rating: str(e.rating, 32),
              userAgent: str(userAgent, 512),
            },
          }),
        ),
    )
  } catch (error) {
    console.error('[track] failed to store events:', error)
    // Still return ok so the client beacon never surfaces errors to users.
  }

  return response
}
