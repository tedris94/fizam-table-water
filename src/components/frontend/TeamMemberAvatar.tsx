'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { initialsFromName } from '@/lib/initials'
import { resolveMediaUrl } from '@/lib/mediaUrl'

type TeamMemberAvatarProps = {
  name: string
  photoUrl?: string | null
  className?: string
  initialsClassName?: string
}

export function TeamMemberAvatar({
  name,
  photoUrl,
  className = 'h-64 w-full',
  initialsClassName = 'text-6xl',
}: TeamMemberAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const resolvedUrl = resolveMediaUrl(photoUrl)

  useEffect(() => {
    setImageFailed(false)
  }, [photoUrl])

  if (resolvedUrl && !imageFailed) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <Image
          src={resolvedUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`bg-gradient-to-br from-[#1a1f71] to-[#2563eb] flex items-center justify-center text-white ${className}`}
    >
      <span className={`font-semibold ${initialsClassName}`}>{initialsFromName(name)}</span>
    </div>
  )
}
