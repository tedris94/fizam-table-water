import config from '@payload-config'
import { createPayloadRequest } from 'payload'
import type { User } from '@/payload-types'

export { PAYLOAD_TOKEN_COOKIE } from '@/constants/payload'

export function isAdminRole(role: string | undefined): role is 'super_admin' | 'admin' {
  return role === 'super_admin' || role === 'admin'
}

/** Authenticate the incoming request using Payload's REST auth pipeline. */
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    const req = await createPayloadRequest({
      config,
      request,
      canSetHeaders: false,
    })
    return (req.user as User | null) ?? null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getCurrentUser]', error)
    }
    return null
  }
}
