function toBase64(value: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64')
  }
  return btoa(value)
}

function fromBase64(encoded: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(encoded, 'base64').toString('utf8')
  }
  return atob(encoded)
}

/** Encode an email for client-side decoding (keeps plain addresses out of HTML hrefs). */
export function encodeEmail(email: string): string {
  return toBase64(email.trim())
}

export function decodeEmail(encoded: string): string {
  try {
    return fromBase64(encoded)
  } catch {
    return ''
  }
}

/** Pre-encoded site inboxes used in static pages. */
export const ENCODED_EMAILS = {
  infoFizamNg: encodeEmail('info@fizam.ng'),
  infoFizamWater: encodeEmail('info@fizam.ng'),
} as const
