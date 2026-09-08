import type { CollectionConfig } from "payload";

/**
 * Admin accounts. Payload handles the login screen, sessions and the `/admin`
 * gate — there is no separate auth layer in this project.
 *
 * Login is by **username**, not email. Payload's email-based flows (password
 * reset, email verification) need an email adapter to send anything, and there
 * is none configured here — so asking for an address would imply a recovery
 * route that does not exist. `requireEmail: false` drops the field entirely.
 * A forgotten password is reset by an existing admin, or from the CLI.
 *
 * Access control note: every operation not listed below falls back to Payload's
 * default, which requires an authenticated user. Nothing here is public.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    loginWithUsername: {
      allowEmailLogin: false,
      requireEmail: false,
    },
  },
  admin: {
    useAsTitle: "username",
    defaultColumns: ["name", "username"],
    group: "Settings",
    description: "People who can sign in and edit the website.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Shown in the corner of the admin panel." },
    },
  ],
};
