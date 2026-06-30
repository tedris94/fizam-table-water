import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { ctaGroup, iconSelect } from './shared'

export const PageHeaderBlock: Block = {
  slug: 'pageHeader',
  interfaceName: 'PageHeaderBlock',
  labels: { singular: 'Page header', plural: 'Page headers' },
  fields: [
    iconSelect('icon', 'Icon (optional)'),
    { name: 'title', type: 'text', required: true },
    { name: 'subtitle', type: 'textarea', admin: { description: 'Lead text, or a line like "Last updated: …"' } },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Centered (icon + title)', value: 'center' },
        { label: 'Left (with breadcrumb)', value: 'left' },
      ],
    },
    {
      name: 'showBreadcrumb',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Show a "Home / <title>" breadcrumb (left-aligned headers).' },
    },
  ],
}

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Hero sections' },
  fields: [
    { name: 'badge', type: 'text', admin: { description: 'Small pill above the title' } },
    { name: 'title', type: 'text', required: true },
    { name: 'subtitle', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    ctaGroup('primaryCta', 'Primary button'),
    ctaGroup('secondaryCta', 'Secondary button'),
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  labels: { singular: 'Image + text', plural: 'Image + text sections' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Image on the right', value: 'right' },
        { label: 'Image on the left', value: 'left' },
      ],
    },
    ctaGroup('cta', 'Call to action'),
  ],
}

export const ProductsBlock: Block = {
  slug: 'products',
  interfaceName: 'ProductsBlock',
  labels: { singular: 'Products grid', plural: 'Products grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Product', plural: 'Products' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'size', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'text', admin: { description: 'Emoji or short label, e.g. 💧' } },
        { name: 'href', type: 'text' },
      ],
    },
    { name: 'bannerHeading', type: 'text' },
    { name: 'bannerBody', type: 'textarea' },
  ],
}

export const QualityBlock: Block = {
  slug: 'quality',
  interfaceName: 'QualityBlock',
  labels: { singular: 'Quality section', plural: 'Quality sections' },
  fields: [
    { name: 'badge', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'certifications',
      type: 'array',
      fields: [
        iconSelect(),
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    { name: 'processHeading', type: 'text' },
    {
      name: 'steps',
      type: 'array',
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    { name: 'guaranteeTitle', type: 'text' },
    { name: 'guaranteeBody', type: 'textarea' },
    { name: 'statValue', type: 'text', admin: { description: 'e.g. 100%' } },
    { name: 'statLabel', type: 'text' },
  ],
}

export const SalesChannelsBlock: Block = {
  slug: 'salesChannels',
  interfaceName: 'SalesChannelsBlock',
  labels: { singular: 'Sales channels', plural: 'Sales channels sections' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'channels',
      type: 'array',
      fields: [
        iconSelect(),
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'features',
          type: 'array',
          fields: [{ name: 'value', type: 'text', required: true }],
        },
      ],
    },
    { name: 'ctaHeading', type: 'text' },
    { name: 'ctaBody', type: 'textarea' },
    ctaGroup('primaryCta', 'Primary button'),
    ctaGroup('secondaryCta', 'Secondary button'),
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  labels: { singular: 'Contact section', plural: 'Contact sections' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'phoneHref', type: 'text', admin: { description: 'e.g. tel:+234…' } },
    { name: 'email', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'hours', type: 'text' },
    { name: 'whyTitle', type: 'text' },
    {
      name: 'whyItems',
      type: 'array',
      fields: [{ name: 'value', type: 'text', required: true }],
    },
  ],
}

export const CtaBannerBlock: Block = {
  slug: 'ctaBanner',
  interfaceName: 'CtaBannerBlock',
  labels: { singular: 'CTA banner', plural: 'CTA banners' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    {
      name: 'buttons',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text' },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary (solid)', value: 'primary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
      ],
    },
  ],
}

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature grid', plural: 'Feature grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        iconSelect(),
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Rich text', plural: 'Rich text sections' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'prose',
      options: [
        { label: 'Plain prose', value: 'prose' },
        { label: 'Boxed card (e.g. legal pages)', value: 'card' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
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
  ],
}

/** Every block available to the page builder and Home layout. */
export const pageBlocks: Block[] = [
  PageHeaderBlock,
  HeroBlock,
  ImageTextBlock,
  ProductsBlock,
  QualityBlock,
  SalesChannelsBlock,
  ContactBlock,
  FeatureGridBlock,
  CtaBannerBlock,
  RichTextBlock,
]
