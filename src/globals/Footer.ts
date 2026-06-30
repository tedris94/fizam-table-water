import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Site Footer',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'about',
      type: 'textarea',
      label: 'About blurb',
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Link columns',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact details',
      fields: [
        {
          name: 'phones',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text' },
          ],
        },
        { name: 'email', type: 'text' },
        { name: 'address', type: 'textarea' },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      label: 'Social links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Twitter / X', value: 'twitter' },
          ],
          required: true,
        },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal / bottom links',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      admin: { description: 'Defaults to "© {year} Fizam Table Water. All rights reserved."' },
    },
  ],
}
