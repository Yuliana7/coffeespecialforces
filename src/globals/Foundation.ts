import type { GlobalConfig } from 'payload'

export const Foundation: GlobalConfig = {
  slug: 'foundation',
  label: 'Charitable foundation',
  admin: {
    group: 'Pages',
    description: 'Our story, legal details and published reports.',
  },
  access: { read: () => true },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'story', type: 'richText', localized: true },
    {
      type: 'collapsible',
      label: 'Legal details',
      fields: [
        { name: 'legalName', type: 'text', localized: true },
        { name: 'registrationNumber', type: 'text', label: 'EDRPOU' },
        { name: 'legalAddress', type: 'text', localized: true },
        { name: 'contactEmail', type: 'email' },
        { name: 'contactPhone', type: 'text' },
      ],
    },
    {
      name: 'reports',
      type: 'array',
      labels: { singular: 'Report', plural: 'Reports' },
      admin: { description: 'Financial reports offered as downloads.' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'year', type: 'number', required: true },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Upload the PDF. Until one is attached, no download link is shown.',
          },
        },
      ],
    },
  ],
}
