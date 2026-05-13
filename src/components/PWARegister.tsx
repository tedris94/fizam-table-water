'use client'

import { useEffect } from 'react'

/**
 * Registers the PWA service worker once the page is interactive. Only runs in
 * production to avoid interfering with Next.js dev HMR.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const register = async () => {
      try {
        const probe = await fetch('/service-worker.js', { method: 'HEAD' })
        if (!probe.ok) return
        await navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      } catch (e) {
        console.warn('[pwa] service worker registration skipped:', e)
      }
    }

    const idle =
      'requestIdleCallback' in window
        ? (window as unknown as { requestIdleCallback: (cb: () => void) => number })
            .requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 800)

    idle(() => void register())
  }, [])

  return null
}
