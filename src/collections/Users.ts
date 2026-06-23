import type { CollectionConfig, FieldAccess } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'fullName', 'role'],
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      defaultValue: 'user',
      admin: {
        description:
          'Dashboard role slug (must match a role in Dashboard → Roles, e.g. admin, hr, warehouse).',
      },
      access: {
        update: (({ req }) =>
          (req.user as { role?: string } | undefined)?.role === 'super_admin') as FieldAccess,
      },
    },
  ],
}
