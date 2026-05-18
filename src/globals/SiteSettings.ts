import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Fizam Table Water',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'facebook',
      type: 'text',
    },
    {
      name: 'instagram',
      type: 'text',
    },
    {
      name: 'twitter',
      type: 'text',
    },
    {
      name: 'linkedin',
      type: 'text',
    },
    {
      name: 'defaultMetaTitle',
      type: 'text',
    },
    {
      name: 'defaultMetaDescription',
      type: 'textarea',
      admin: {
        description: 'Used in Google search snippets and social shares (150–160 characters ideal).',
      },
    },
    {
      name: 'defaultKeywords',
      type: 'textarea',
      admin: {
        description: 'Comma-separated SEO keywords (e.g. Fizam, Fizam Table Water, table water Nigeria).',
      },
    },
    {
      name: 'googleSiteVerification',
      type: 'text',
      admin: {
        description: 'Google Search Console verification code (content value only, not the full meta tag).',
      },
    },
  ],
}
