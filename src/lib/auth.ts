import { headers } from 'next/headers'
import type { User } from '@/payload-types'
import { getPayloadSingleton } from '@/lib/payload'

export { PAYLOAD_TOKEN_COOKIE } from '@/constants/payload'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const payload = await getPayloadSingleton()
    const headersList = await headers()
    const auth = await payload.auth({ headers: headersList })
    return (auth.user as User | null) ?? null
  } catch {
    return null
  }
}
