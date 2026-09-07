import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home page',
  admin: {
    group: 'Pages',
    description: 'The headline, hero image and intro text on the front page.',
  },
  access: { read: () => true },
  fields: [
    { name: 'heroHeading', type: 'text', required: true, localized: true },
    { name: 'heroSubheading', type: 'textarea', localized: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'aboutHeading',
      type: 'text',
      localized: true,
    },
    {
      name: 'aboutText',
      type: 'richText',
      localized: true,
      admin: { description: 'The "who we are" section under the hero.' },
    },
    {
      name: 'stats',
      type: 'array',
      labels: { singular: 'Stat', plural: 'Stats' },
      maxRows: 4,
      admin: {
        description: 'Short numbers shown across the hero, e.g. "120 000 ₴ raised".',
      },
      fields: [
        { name: 'value', type: 'text', required: true, localized: true },
        { name: 'label', type: 'text', required: true, localized: true },
      ],
    },
  ],
}
