import type { CollectionConfig } from 'payload'
import { EMAIL_TEMPLATE_SLUGS } from '@/lib/emailTemplateCatalog'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'enabled'],
    hidden: true,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) =>
      ['super_admin', 'admin'].includes((req.user as { role?: string })?.role ?? ''),
  },
  timestamps: true,
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: EMAIL_TEMPLATE_SLUGS.map((slug) => ({ label: slug, value: slug })),
      admin: { readOnly: true },
    },
    { name: 'name', type: 'text', required: true },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Shown in the dashboard to explain when this email is sent.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Careers', value: 'careers' },
        { label: 'Orders', value: 'orders' },
        { label: 'Contact', value: 'contact' },
        { label: 'Internal', value: 'internal' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'careers',
      options: [
        { label: 'Careers branded', value: 'careers' },
        { label: 'Fizam branded', value: 'branded' },
        { label: 'Plain', value: 'plain' },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: { description: 'Use placeholders like {{jobTitle}} — see Variables help.' },
    },
    {
      name: 'textBody',
      type: 'textarea',
      required: true,
      admin: { description: 'Plain-text version of the email.' },
    },
    {
      name: 'htmlBody',
      type: 'textarea',
      required: true,
      admin: { description: 'HTML body (inner content only; layout wrapper is applied automatically).' },
    },
    {
      name: 'variablesHelp',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Available placeholders for this template.',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'When disabled, this email will not be sent.' },
    },
  ],
}
