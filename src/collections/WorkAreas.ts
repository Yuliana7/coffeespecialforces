import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const WorkAreas: CollectionConfig = {
  slug: 'work-areas',
  labels: { singular: 'Work area', plural: 'Work areas' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'slug'],
    group: 'Content',
    description: 'The kinds of work we do. Events are filed under these.',
  },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: { description: 'A short paragraph shown on the work areas page.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
    slugField(),
  ],
}
