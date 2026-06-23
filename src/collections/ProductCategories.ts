import type { CollectionConfig } from 'payload'

const isAdmin = (role: string | undefined) => role === 'super_admin' || role === 'admin'

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  timestamps: true,
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'sortOrder', 'isActive'],
    group: 'Products',
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
    update: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
    delete: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'label', type: 'text', required: true },
    { name: 'sortOrder', type: 'number', defaultValue: 100 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
