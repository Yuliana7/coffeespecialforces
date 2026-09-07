import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description: 'Logo, site name, social links and footer text.',
  },
  access: { read: () => true },
  fields: [
    { name: 'siteName', type: 'text', required: true, localized: true },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: { description: 'Sits under the site name in the footer.' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Falls back to the bundled logo if left empty.' },
    },
    {
      name: 'socialLinks',
      type: 'array',
      labels: { singular: 'Link', plural: 'Social links' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    { name: 'footerText', type: 'textarea', localized: true },
  ],
}
