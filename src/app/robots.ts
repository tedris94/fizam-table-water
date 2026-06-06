import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo'

/**
 * Served at `/robots.txt`. Allows the public site to be indexed but blocks the
 * Payload admin, dashboard, and API routes (matches the Namecheap deploy plan).
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/api/',
          '/login',
          '/test',
          '/order/success',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
