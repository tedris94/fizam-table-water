/**
 * Payload media URLs are built from `serverURL` (often https://fizam.ng in .env).
 * Rewrite to a same-origin path so localhost serves files from /api/media/file/...
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null
  const trimmed = url.trim()

  if (trimmed.startsWith('/')) return trimmed

  try {
    const parsed = new URL(trimmed)
    if (parsed.pathname.startsWith('/api/media/file/')) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // Not a valid absolute URL — return as-is if it looks like a path segment.
    if (trimmed.includes('/api/media/file/')) {
      const idx = trimmed.indexOf('/api/media/file/')
      return trimmed.slice(idx)
    }
  }

  return trimmed
}

/** Build a media file path from a Payload filename when url is missing. */
export function mediaUrlFromFilename(filename: string | null | undefined): string | null {
  if (!filename?.trim()) return null
  return `/api/media/file/${filename.trim()}`
}

export function resolveMediaFromDoc(
  media: { url?: string | null; filename?: string | null } | number | null | undefined,
): string | null {
  if (!media || typeof media !== 'object') return null
  return resolveMediaUrl(media.url) ?? mediaUrlFromFilename(media.filename)
}
