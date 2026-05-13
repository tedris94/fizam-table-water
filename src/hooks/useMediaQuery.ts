'use client'

import { useLayoutEffect, useState } from 'react'

/**
 * Subscribes to `window.matchMedia(query)` and returns whether it currently matches.
 * Uses `useLayoutEffect` so the first client paint matches the real viewport (avoids
 * one frame where SSR `false` would show the wrong UI for mobile-only affordances).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useLayoutEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])

  return matches
}
