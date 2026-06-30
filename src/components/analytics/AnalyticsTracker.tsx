'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type TrackEvent = {
  type: 'pageview' | 'click' | 'resource_served' | 'web_vital'
  path?: string
  referrer?: string
  target?: string
  resourceType?: string
  metricName?: string
  metricValue?: number
  rating?: string
}

const ENDPOINT = '/api/track'

// Simple module-level queue with debounced flush + beacon on unload.
const queue: TrackEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function send(events: TrackEvent[]) {
  if (events.length === 0) return
  const payload = JSON.stringify({ events })
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(ENDPOINT, blob)
      return
    }
  } catch {
    // fall through to fetch
  }
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
    credentials: 'include',
  }).catch(() => {})
}

function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  if (queue.length === 0) return
  const batch = queue.splice(0, queue.length)
  send(batch)
}

function enqueue(event: TrackEvent, immediate = false) {
  queue.push(event)
  if (immediate) {
    flush()
    return
  }
  if (!flushTimer) {
    flushTimer = setTimeout(flush, 1500)
  }
}

function inferResourceType(anchor: HTMLAnchorElement): string {
  const explicit = anchor.getAttribute('data-track')
  if (explicit) return explicit
  const href = anchor.getAttribute('href') || ''
  if (/^https?:\/\//i.test(href) && !href.includes(window.location.host)) return 'outbound'
  if (/^tel:/i.test(href)) return 'phone'
  if (/^mailto:/i.test(href)) return 'email'
  if (/\.(pdf|zip|docx?|xlsx?|csv|png|jpe?g|svg|mp4)(\?|$)/i.test(href)) return 'download'
  return 'page'
}

let webVitalsRegistered = false

export function AnalyticsTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  // Page views (also fires on client-side navigation).
  useEffect(() => {
    if (!pathname) return
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    enqueue(
      {
        type: 'pageview',
        path: pathname,
        referrer: document.referrer || undefined,
      },
      true,
    )

    // "Served" resources currently rendered on the page.
    const seen = new Set<string>()
    document.querySelectorAll<HTMLElement>('[data-resource]').forEach((el) => {
      const name = el.getAttribute('data-resource') || ''
      if (!name || seen.has(name)) return
      seen.add(name)
      enqueue({
        type: 'resource_served',
        path: pathname,
        target: name,
        resourceType: el.getAttribute('data-track') || 'resource',
      })
    })
  }, [pathname])

  // Delegated click tracking (which resources are clicked).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement | null
      const node = el?.closest<HTMLElement>('a[href], [data-track]')
      if (!node) return

      if (node instanceof HTMLAnchorElement) {
        const href = node.getAttribute('href') || ''
        enqueue({
          type: 'click',
          path: window.location.pathname,
          target: node.getAttribute('data-resource') || href || node.innerText.trim().slice(0, 120),
          resourceType: inferResourceType(node),
        })
      } else {
        enqueue({
          type: 'click',
          path: window.location.pathname,
          target:
            node.getAttribute('data-resource') ||
            node.getAttribute('data-track') ||
            node.innerText.trim().slice(0, 120),
          resourceType: node.getAttribute('data-track') || 'element',
        })
      }
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  // Flush on tab hide / unload.
  useEffect(() => {
    function onHide() {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  // Web Vitals (performance).
  useEffect(() => {
    if (webVitalsRegistered) return
    webVitalsRegistered = true
    let cancelled = false
    void import('web-vitals')
      .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
        if (cancelled) return
        const report = (metric: { name: string; value: number; rating?: string }) => {
          enqueue({
            type: 'web_vital',
            path: window.location.pathname,
            metricName: metric.name,
            metricValue: Math.round(metric.value * 1000) / 1000,
            rating: metric.rating,
          })
        }
        onCLS(report)
        onINP(report)
        onLCP(report)
        onFCP(report)
        onTTFB(report)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
