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
    {
      name: 'applicationRef',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Applicant reference (e.g. FZ-APP-2026-00042). Shown in confirmation emails.',
      },
    },
    { name: 'address', type: 'textarea' },
    {
      name: 'educationHistory',
      type: 'array',
      label: 'Education (CV)',
      fields: [
        { name: 'qualification', type: 'text', required: true },
        { name: 'institution', type: 'text', required: true },
        { name: 'fieldOfStudy', type: 'text' },
        { name: 'startYear', type: 'text' },
        { name: 'endYear', type: 'text' },
        { name: 'grade', type: 'text' },
      ],
    },
    {
      name: 'workHistory',
      type: 'array',
      label: 'Work history (CV)',
      fields: [
        { name: 'jobTitle', type: 'text', required: true },
        { name: 'company', type: 'text', required: true },
        { name: 'location', type: 'text' },
        { name: 'startDate', type: 'text' },
        { name: 'endDate', type: 'text' },
        { name: 'current', type: 'checkbox', defaultValue: false },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'professionalSummary',
      type: 'textarea',
      admin: { description: 'CV professional summary' },
    },
    {
      name: 'motivationStatement',
      type: 'textarea',
      admin: { description: 'Why the applicant wants this role' },
    },
    {
      name: 'education',
      type: 'textarea',
      admin: { description: 'Formatted education summary (auto-generated on apply)' },
    },
    { name: 'experience', type: 'textarea', admin: { description: 'Formatted experience summary' } },
    { name: 'coverLetter', type: 'textarea', admin: { description: 'Formatted cover letter summary' } },
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
        { label: 'Pending review', value: 'pending' },
        { label: 'Shortlisted', value: 'shortlisted' },
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
