import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Site Header',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      defaultValue: 'FIZAM Table Water',
      admin: { description: 'Text shown next to the logo.' },
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Navigation links',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'CTA button label',
      admin: { description: 'Optional highlighted button (e.g. Order now).' },
    },
    { name: 'ctaHref', type: 'text', label: 'CTA button link' },
    {
      name: 'showLogin',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Login / Dashboard link',
    },
  ],
}
