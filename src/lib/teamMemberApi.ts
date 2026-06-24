import { resolveMediaFromDoc } from '@/lib/mediaUrl'

export function photoIdForPayload(
  photoId: number | string | null | undefined,
): number | null | undefined {
  if (photoId === undefined) return undefined
  if (photoId === null || photoId === '') return null
  const n = typeof photoId === 'number' ? photoId : Number(photoId)
  return Number.isFinite(n) ? n : undefined
}

export function photoIdFromDoc(photo: { id?: number | string; url?: string | null; filename?: string | null } | number | null | undefined) {
  if (!photo) return null
  if (typeof photo === 'object') return photo.id ?? null
  return photo
}

export function photoUrlFromDoc(photo: { url?: string | null; filename?: string | null } | number | null | undefined) {
  return resolveMediaFromDoc(photo)
}

export function toTeamMemberResponse(doc: {
  id: number | string
  name: string
  position: string
  department?: string | null
  bio?: string | null
  email?: string | null
  linkedin?: string | null
  twitter?: string | null
  sortOrder?: number | null
  photo?: { id?: number | string; url?: string | null } | number | null
}) {
  return {
    id: doc.id,
    name: doc.name,
    position: doc.position,
    department: doc.department ?? '',
    bio: doc.bio ?? '',
    email: doc.email ?? '',
    linkedin: doc.linkedin ?? '',
    twitter: doc.twitter ?? '',
    sortOrder: doc.sortOrder ?? 0,
    photoId: photoIdFromDoc(doc.photo),
    photoUrl: photoUrlFromDoc(doc.photo),
  }
}
