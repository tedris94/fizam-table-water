import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['category', 'name', 'size', 'price', 'stock'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) =>
      (req.user as { role?: string } | undefined)?.role === 'super_admin',
  },
  fields: [
    {
      name: 'category',
      type: 'text',
      required: true,
      defaultValue: 'table_water',
      admin: {
        position: 'sidebar',
        description: 'Category slug (managed in Dashboard → Products → Categories).',
      },
    },
    { name: 'name', type: 'text', required: true },
    { name: 'size', type: 'text', required: true },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'description', type: 'textarea' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'stock', type: 'number', required: true, defaultValue: 0, min: 0 },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'product-tags',
      hasMany: true,
      admin: { description: 'Optional product tags for search and filtering.' },
    },
  ],
}
