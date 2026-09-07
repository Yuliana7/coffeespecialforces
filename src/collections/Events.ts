import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'workArea'],
    group: 'Content',
    description: 'Anything with a date. Each event belongs to one work area.',
  },
  access: { read: () => true },
  defaultSort: '-date',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Future dates show under "Upcoming".',
      },
    },
    {
      // Required: the work areas page is built by grouping events under this.
      name: 'workArea',
      type: 'relationship',
      relationTo: 'work-areas',
      required: true,
      admin: { description: 'Which area of our work this event belongs to.' },
    },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', localized: true },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
}
