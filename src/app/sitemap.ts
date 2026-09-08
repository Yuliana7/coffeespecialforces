import type { MetadataRoute } from "next";

import { getPayloadClient } from "@/lib/payload";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/locales";

/**
 * Generated from the CMS, so a new project or event appears in the sitemap
 * without anyone remembering to add it.
 *
 * Slugs are not localized — one document keeps one slug in both languages — so
 * each entry lists its translations under `alternates.languages` rather than
 * appearing twice.
 */
export const dynamic = "force-dynamic";

const COLLECTIONS = ["projects", "events", "work-areas"] as const;
const STATIC_PATHS = [
  "",
  "projects",
  "work-areas",
  "events",
  "locations",
  "foundation",
  "donate",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const url = (locale: string, path: string) =>
    `${baseUrl}/${locale}${path ? `/${path}` : ""}`;

  /** One entry per page, with every locale listed as an alternate. */
  const entry = (
    path: string,
    lastModified?: Date,
  ): MetadataRoute.Sitemap[number] => ({
    url: url(DEFAULT_LOCALE, path),
    lastModified,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, url(locale, path)]),
      ),
    },
  });

  const payload = await getPayloadClient();

  const documents = await Promise.all(
    COLLECTIONS.map(async (collection) => {
      const { docs } = await payload.find({
        collection,
        depth: 0,
        limit: 1000,
        pagination: false,
        select: { slug: true, updatedAt: true },
      });

      return docs.map((doc) =>
        entry(`${collection}/${doc.slug}`, new Date(doc.updatedAt)),
      );
    }),
  );

  return [...STATIC_PATHS.map((path) => entry(path)), ...documents.flat()];
}
