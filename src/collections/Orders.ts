import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  timestamps: true,
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'status', 'total', 'createdAt'],
  },
  access: {
    read: ({ req }) =>
      Boolean(
        req.user &&
          ['super_admin', 'admin'].includes(
            (req.user as { role?: string }).role ?? '',
          ),
      ),
    create: () => true,
    update: ({ req }) =>
      Boolean(
        req.user &&
          ['super_admin', 'admin'].includes(
            (req.user as { role?: string }).role ?? '',
          ),
      ),
    delete: ({ req }) =>
      ['super_admin', 'admin'].includes((req.user as { role?: string })?.role ?? ''),
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    },
    {
      name: 'shipping',
      type: 'group',
      fields: [
        { name: 'fullName', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'address', type: 'textarea', required: true },
        { name: 'state', type: 'text' },
        { name: 'lga', type: 'text', admin: { description: 'Local Government Area' } },
        { name: 'city', type: 'text', admin: { description: 'City, area, or landmark' } },
        { name: 'postalCode', type: 'text' },
      ],
    },
    {
      name: 'deliveryMode',
      type: 'select',
      defaultValue: 'delivery',
      options: [
        { label: 'Home delivery', value: 'delivery' },
        { label: 'Pickup', value: 'pickup' },
      ],
      admin: { description: 'How the customer receives the order.' },
    },
    {
      name: 'shippingZone',
      type: 'relationship',
      relationTo: 'shipping-zones',
      admin: { description: 'Matched delivery location (shipping rule), captured at checkout.' },
    },
    {
      name: 'shippingFee',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { description: 'Computed delivery fee at the time of order.' },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Auto-linked customer account (created at checkout if needed).' },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Processing', value: 'processing' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'paystackReference',
      type: 'text',
      admin: { description: 'Paystack transaction reference' },
    },
    {
      name: 'paystackAccessCode',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.shipping?.fullName) {
          return {
            ...data,
            customerName: data.shipping.fullName,
          }
        }
        return data
      },
    ],
  },
}
