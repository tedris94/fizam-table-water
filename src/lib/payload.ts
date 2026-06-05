/**
 * Lazy-load Payload so marketing pages can render when SQLite/libsql is unavailable
 * (common on Vercel without Turso). Callers should try/catch and use fallbacks.
 */
export function isPayloadEnabled(): boolean {
  if (process.env.DISABLE_PAYLOAD === '1') return false

  const uri = process.env.DATABASE_URI?.trim()

  // On Vercel, local file SQLite is ephemeral and often breaks serverless tracing.
  // Only enable Payload when a remote DB (e.g. Turso libsql://) is configured.
  if (process.env.VERCEL === '1') {
    if (!uri) return false
    if (uri.startsWith('file:')) return false
    return true
  }

  return true
}

let cachedPromise: Promise<Awaited<ReturnType<typeof import('payload').getPayload>>> | null =
  null

export async function getPayloadSingleton() {
  if (!isPayloadEnabled()) {
    throw new Error('Payload CMS is not configured for this deployment')
  }

  if (!cachedPromise) {
    cachedPromise = (async () => {
      const { getPayload } = await import('payload')
      const { default: config } = await import('@payload-config')
      return getPayload({ config })
    })().catch((error) => {
      cachedPromise = null
      throw error
    })
  }

  return cachedPromise
}
