import type { MetadataRoute } from 'next'

/**
 * Served at `/robots.txt`. Allows the public site to be indexed but blocks the
 * Payload admin, dashboard, and API routes (matches the Namecheap deploy plan).
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://fizam.ng'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/dashboard', '/dashboard/', '/api/', '/login'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
