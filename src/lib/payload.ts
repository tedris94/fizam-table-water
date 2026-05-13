import { getPayload } from 'payload'
import config from '@payload-config'

let cachedPromise: Promise<Awaited<ReturnType<typeof getPayload>>> | null = null

export async function getPayloadSingleton() {
  if (!cachedPromise) {
    cachedPromise = getPayload({ config })
  }
  return cachedPromise
}
