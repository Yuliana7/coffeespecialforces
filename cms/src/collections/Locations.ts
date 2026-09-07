import { CollectionConfig } from 'payload/config'

const Locations: CollectionConfig = {
  slug: 'locations',
  labels: { singular: 'Location', plural: 'Locations' },
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'name', type: 'text', required: true },
    { name: 'address', type: 'text' },
    { name: 'coords', type: 'text' },
    { name: 'description', type: 'textarea', localized: true },
  ]
}

export default Locations
