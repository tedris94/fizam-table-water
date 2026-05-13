'use client'

import { useEffect } from 'react'

const HIGHLIGHT_CLASS = 'is-hash-highlighted'
const HIGHLIGHT_DURATION_MS = 2800

/**
 * Mount once per page. When the URL hash matches an element id, smoothly scrolls
 * the element into view and adds `is-hash-highlighted` for ~2.8s so CSS in
 * `globals.css` can flash the green shadow + blue outline on it.
 */
export function HashHighlighter() {
  useEffect(() => {
    function flash() {
      const hash = window.location.hash.replace('#', '')
      if (!hash) return
      // Defer so dynamic content (server data, hydration) has rendered.
      requestAnimationFrame(() => {
        const el = document.getElementById(hash)
        if (!el) return
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.remove(HIGHLIGHT_CLASS)
        // Force reflow so re-adding the class restarts the animation.
        void el.offsetWidth
        el.classList.add(HIGHLIGHT_CLASS)
        window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_DURATION_MS)
      })
    }

    flash()
    window.addEventListener('hashchange', flash)
    return () => window.removeEventListener('hashchange', flash)
  }, [])

  return null
}
