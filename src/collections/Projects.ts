import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'raisedAmount', 'goalAmount'],
    group: 'Content',
    description: 'Fundraisers and campaigns. These appear on the home page.',
  },
  access: { read: () => true },
  defaultSort: '-startDate',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      admin: { description: 'One or two sentences, shown on cards and listings.' },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', localized: true },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Photos shown at the bottom of the project page.' },
    },
    {
      type: 'collapsible',
      label: 'Fundraising',
      admin: {
        description: 'Update "raised so far" by hand as donations come in.',
      },
      fields: [
        {
          name: 'goalAmount',
          type: 'number',
          min: 0,
          admin: { description: 'Leave empty to hide the progress bar.' },
        },
        { name: 'raisedAmount', type: 'number', min: 0, defaultValue: 0 },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'UAH',
          options: [
            { label: '₴ UAH', value: 'UAH' },
            { label: '$ USD', value: 'USD' },
            { label: '€ EUR', value: 'EUR' },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Featured projects are pinned to the top of the home page.',
      },
    },
    { name: 'startDate', type: 'date', admin: { position: 'sidebar' } },
    { name: 'endDate', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
}
