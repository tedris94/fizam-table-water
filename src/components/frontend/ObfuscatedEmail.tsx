'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { decodeEmail } from '@/lib/obfuscateEmail'

type ObfuscatedEmailProps = {
  encoded: string
  className?: string
  children?: ReactNode
  /** Accessible label when children are icons only. */
  ariaLabel?: string
}

/**
 * Renders an email link without a mailto: href in the initial HTML.
 * The address is decoded client-side on interaction.
 */
export function ObfuscatedEmail({
  encoded,
  className,
  children,
  ariaLabel,
}: ObfuscatedEmailProps) {
  const [email, setEmail] = useState('')

  useEffect(() => {
    setEmail(decodeEmail(encoded))
  }, [encoded])

  function openMailbox(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const address = email || decodeEmail(encoded)
    if (address) window.location.href = `mailto:${address}`
  }

  return (
    <a
      href="#"
      className={className}
      aria-label={ariaLabel}
      onClick={openMailbox}
    >
      {children ?? (email || 'Email')}
    </a>
  )
}
