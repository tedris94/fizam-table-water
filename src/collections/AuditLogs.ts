import type { CollectionConfig } from 'payload'

const canReadAudit = (req: { user?: { role?: string } | null }) =>
  ['super_admin', 'admin'].includes(req.user?.role ?? '')

/**
 * Immutable audit trail. Entries are written server-side (collection hooks and
 * auth hooks) via the Local API, so external create/update/delete are disabled.
 */
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'collectionSlug', 'documentId', 'userEmail', 'createdAt'],
    hidden: true,
    group: 'System',
  },
  access: {
    read: ({ req }) => canReadAudit(req),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  timestamps: true,
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Login', value: 'login' },
        { label: 'Logout', value: 'logout' },
      ],
    },
    { name: 'collectionSlug', type: 'text', index: true },
    { name: 'documentId', type: 'text' },
    { name: 'title', type: 'text', admin: { description: 'Human-readable label of the affected document.' } },
    { name: 'userId', type: 'number' },
    { name: 'userEmail', type: 'text', index: true },
    { name: 'userRole', type: 'text' },
    {
      name: 'changes',
      type: 'json',
      admin: { description: 'Changed fields (before/after) for updates, or the document snapshot.' },
    },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
}
