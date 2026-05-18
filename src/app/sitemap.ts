import type { MetadataRoute } from 'next'
import { getPayloadSingleton } from '@/lib/payload'
import { getSiteUrl } from '@/lib/seo'

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] =
  [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/order', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/team', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/careers', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/quality-certifications', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
  ]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  try {
    const payload = await getPayloadSingleton()
    const jobs = await payload.find({
      collection: 'jobs',
      limit: 200,
      depth: 0,
      where: {
        status: { equals: 'open' },
      },
    })

    for (const job of jobs.docs) {
      if (!job.slug) continue
      entries.push({
        url: `${base}/careers/${job.slug}/apply`,
        lastModified: job.updatedAt ? new Date(job.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.5,
      })
    }
  } catch {
    // DB unavailable at build time — static routes still work
  }

  return entries
}
