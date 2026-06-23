import type { CollectionConfig } from 'payload'

const isAdmin = (role: string | undefined) => role === 'super_admin' || role === 'admin'

export const ProductSizes: CollectionConfig = {
  slug: 'product-sizes',
  timestamps: true,
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'categorySlug', 'sortOrder', 'isActive'],
    group: 'Products',
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
    update: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
    delete: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    {
      name: 'categorySlug',
      type: 'text',
      required: true,
      admin: { description: 'Category slug this size belongs to (e.g. table_water).' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 100 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
