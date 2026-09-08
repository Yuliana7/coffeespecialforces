import type { CollectionConfig } from "payload";

/*
 * Uploads are written to the local filesystem, so on a host where only a mounted
 * volume survives a redeploy the directory has to move onto that volume. The
 * path is relative to the process working directory when it is relative, which
 * is why the default still resolves to `public/media` in development.
 *
 * Files are served by Payload's own `/api/media/file/**` route rather than by
 * Next's static handler, so nothing breaks when the directory leaves `public/`.
 */
const staticDir = process.env.MEDIA_DIR || "public/media";

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
    staticDir,
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
