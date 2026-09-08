import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "File", plural: "Media" },
  admin: {
    group: "Content",
    description: "Photos and PDF reports used across the site.",
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "public/media",
    mimeTypes: ["image/*", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 480, height: 320, position: "centre" },
      { name: "card", width: 900, height: 600, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      admin: {
        description:
          "Describe the image for screen readers. Leave blank for PDFs.",
      },
    },
  ],
};
