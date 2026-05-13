/* Fizam Table Water — PWA service worker */
const CACHE_NAME = 'fizam-water-v1'
const PRECACHE_URLS = ['/', '/order', '/dashboard', '/team', '/careers']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  const allow = new Set([CACHE_NAME])
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (allow.has(key) ? null : caches.delete(key)))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Never cache API or Payload admin requests; always go to network.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next/data') ||
    url.pathname.startsWith('/dashboard')
  ) {
    return
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone))
        return response
      })
    }),
  )
})

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Fizam Water'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: data.url || '/',
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'close', title: 'Close' },
    ],
    tag: data.tag || 'fizam-notification',
    vibrate: [200, 100, 200],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'close') return
  const urlToOpen = event.notification.data || '/'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        return self.clients.openWindow ? self.clients.openWindow(urlToOpen) : null
      }),
  )
})
