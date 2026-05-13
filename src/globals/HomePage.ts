import type { GlobalConfig } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page Content',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
      defaultValue: 'Pure hydration for every Nigerian home',
    },
    {
      name: 'heroSubtitle',
      type: 'textarea',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'aboutHeading',
      type: 'text',
    },
    {
      name: 'aboutBody',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          FixedToolbarFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          LinkFeature(),
        ],
      }),
    },
  ],
}
