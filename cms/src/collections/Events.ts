import { CollectionConfig } from 'payload/config'

const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: { useAsTitle: 'title' },
  access: { read: () => true },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', localized: true },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'dateTime', type: 'date', required: true },
    { name: 'location', type: 'relationship', relationTo: 'locations' },
    {
      name: 'images', type: 'array', fields: [
        { name: 'url', type: 'text' },
        { name: 'alt', type: 'text' }
      ]
    }
  ]
}

export default Events
