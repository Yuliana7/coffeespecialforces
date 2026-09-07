import type { CollectionConfig } from 'payload'

/**
 * Admin accounts. Payload handles the login screen, sessions, password reset
 * and the `/admin` gate — there is no separate auth layer in this project.
 *
 * Access control note: every operation not listed below falls back to Payload's
 * default, which requires an authenticated user. Nothing here is public.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email'],
    group: 'Settings',
    description: 'People who can sign in and edit the website.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Shown in the corner of the admin panel.' },
    },
  ],
}
