import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const Locations: CollectionConfig = {
  slug: "locations",
  labels: { singular: "Location", plural: "Locations" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "address", "slug"],
    group: "Content",
    description: "Our coffee shops.",
  },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "address", type: "text", localized: true },
    {
      name: "openingHours",
      type: "textarea",
      localized: true,
      admin: { description: 'One line per day, e.g. "Mon–Fri: 8:00–20:00".' },
    },
    { name: "phone", type: "text" },
    {
      name: "mapUrl",
      type: "text",
      admin: { description: "Link to Google Maps. Opens in a new tab." },
    },
    { name: "description", type: "textarea", localized: true },
    {
      name: "photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    slugField("name"),
  ],
};
