import type { CollectionConfig } from 'payload'

const isAdmin = (req: { user?: { role?: string } | null }) =>
  ['super_admin', 'admin'].includes(req.user?.role ?? '')

/**
 * First-party analytics event store. Rows are written server-side by the
 * /api/track ingest route (via the Local API, which bypasses access control),
 * so external create/update/delete are disabled. Only admins can read.
 */
export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'path', 'target', 'createdAt'],
    hidden: true,
    group: 'System',
  },
  access: {
    read: ({ req }) => isAdmin(req),
    create: () => false,
    update: () => false,
    delete: ({ req }) => isAdmin(req),
  },
  timestamps: true,
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Page view', value: 'pageview' },
        { label: 'Click', value: 'click' },
        { label: 'Resource served', value: 'resource_served' },
        { label: 'Web vital', value: 'web_vital' },
      ],
    },
    { name: 'path', type: 'text', index: true },
    { name: 'referrer', type: 'text' },
    { name: 'sessionId', type: 'text', index: true },
    { name: 'visitorId', type: 'text', index: true },
    { name: 'userId', type: 'number' },
    { name: 'userEmail', type: 'text' },
    {
      name: 'target',
      type: 'text',
      admin: { description: 'Clicked resource label or href.' },
    },
    {
      name: 'resourceType',
      type: 'text',
      admin: { description: 'e.g. product, page, outbound, download, cta.' },
    },
    { name: 'metricName', type: 'text', admin: { description: 'Web Vital name (LCP, CLS, INP, FCP, TTFB).' } },
    { name: 'metricValue', type: 'number' },
    { name: 'rating', type: 'text', admin: { description: 'good | needs-improvement | poor' } },
    { name: 'userAgent', type: 'text' },
  ],
}
