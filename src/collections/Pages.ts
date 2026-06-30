import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { pageBlocks } from '../blocks'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
  },
  hooks: {
    // Auto-derive a slug from the title when one isn't provided so creating a
    // page never blocks on the required/unique slug field.
    beforeValidate: [
      ({ data }) => {
        if (data && (!data.slug || !String(data.slug).trim()) && typeof data.title === 'string') {
          data.slug = slugify(data.title) || `page-${Date.now()}`
        }
        return data
      },
    ],
  },
  access: {
    // Anonymous visitors only see published pages; authenticated users see all.
    read: ({ req }) => (req.user ? true : { status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'URL segment (e.g. about-us). Leave blank to auto-generate from the title.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page sections',
      blocks: pageBlocks,
      admin: { description: 'Build the page from reusable sections.' },
    },
    {
      name: 'body',
      type: 'richText',
      admin: {
        description: 'Legacy rich-text body (used only when no sections are added).',
      },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          LinkFeature(),
        ],
      }),
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: { position: 'sidebar' },
    },
    {
      name: 'keywords',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Comma-separated SEO keywords (optional). Falls back to site defaults.',
      },
    },
  ],
}
