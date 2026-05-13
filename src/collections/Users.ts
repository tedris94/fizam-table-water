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
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'HR', value: 'hr' },
        { label: 'User', value: 'user' },
        { label: 'Customer', value: 'customer' },
      ],
      access: {
        update: (({ req }) =>
          (req.user as { role?: string } | undefined)?.role === 'super_admin') as FieldAccess,
      },
    },
  ],
}
