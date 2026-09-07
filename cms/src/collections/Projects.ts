import { CollectionConfig } from 'payload/config'

const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
    },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    { name: 'location', type: 'relationship', relationTo: 'locations' },

    // localized fields: title, summary, content
    { name: 'title', type: 'text', localized: true },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'content', type: 'richText', localized: true },

    // images stored as array of URLs for now; later replace with upload relation
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'url', type: 'text' },
        { name: 'alt', type: 'text' },
      ],
    },
  ],
}

export default Projects
