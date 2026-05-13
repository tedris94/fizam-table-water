import type { CollectionConfig } from 'payload'

const isAdmin = (role: string | undefined) => role === 'super_admin' || role === 'admin'

export const ShippingZones: CollectionConfig = {
  slug: 'shipping-zones',
  timestamps: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'fee', 'isActive', 'updatedAt'],
    description:
      'Delivery locations and fees: match customer State / LGA / City on checkout (see each field).',
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
    update: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
    delete: ({ req }) => isAdmin((req.user as { role?: string } | undefined)?.role),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Label for this delivery location (e.g. "Lagos — mainland").' },
    },
    {
      name: 'fee',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'Delivery fee (₦) when this location matches the customer address.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Optional notes shown in the admin (not displayed to customers).' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Inactive locations are skipped when calculating fees.' },
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 100,
      admin: {
        description:
          'When several locations match the same address tier (LGA, city, or state), the lowest number wins (default 100). Example: set "Lagos Island" to 10 and "All Lagos" to 50 so the island rate applies first.',
      },
    },
    {
      name: 'states',
      type: 'array',
      labels: { singular: 'State', plural: 'States' },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
      admin: { description: 'States where this fee applies (use official state names).' },
    },
    {
      name: 'lgas',
      type: 'array',
      labels: { singular: 'LGA', plural: 'LGAs' },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description:
          'Optional: Local Government Areas for a finer fee than state-wide. LGA match wins over city and state when the customer selects an LGA.',
      },
    },
    {
      name: 'cities',
      type: 'array',
      labels: { singular: 'City', plural: 'Cities' },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description:
          'City / area names (as customers type them). City match is used after LGA, before state.',
      },
    },
  ],
}
