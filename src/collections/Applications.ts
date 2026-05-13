import type { CollectionConfig } from 'payload'

export const Applications: CollectionConfig = {
  slug: 'applications',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'jobTitle', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) =>
      Boolean(
        req.user &&
          ['super_admin', 'admin', 'hr'].includes(
            (req.user as { role?: string }).role ?? '',
          ),
      ),
    create: () => true,
    update: ({ req }) =>
      Boolean(
        req.user &&
          ['super_admin', 'admin', 'hr'].includes(
            (req.user as { role?: string }).role ?? '',
          ),
      ),
    delete: ({ req }) =>
      ['super_admin', 'admin', 'hr'].includes((req.user as { role?: string })?.role ?? ''),
  },
  timestamps: true,
  fields: [
    {
      name: 'job',
      type: 'relationship',
      relationTo: 'jobs',
      required: true,
    },
    {
      name: 'jobTitle',
      type: 'text',
      admin: { description: 'Cached job title for quick listing' },
    },
    { name: 'fullName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'address', type: 'textarea' },
    { name: 'education', type: 'textarea' },
    { name: 'experience', type: 'textarea' },
    { name: 'coverLetter', type: 'textarea' },
    {
      name: 'resume',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.job && req.payload) {
          const job = await req.payload.findByID({
            collection: 'jobs',
            id: typeof data.job === 'object' ? data.job.id : data.job,
          })
          return {
            ...data,
            jobTitle: job?.title ?? data.jobTitle,
          }
        }
        return data
      },
    ],
  },
}
