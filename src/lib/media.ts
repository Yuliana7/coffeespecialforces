import type { Media } from "@/payload-types";

/**
 * Upload fields come back either as an ID (unpopulated) or a full document.
 * Everything rendering an image goes through here so that never has to be
 * re-checked at each call site.
 */
export const asMedia = (value: unknown): Media | null =>
  value && typeof value === "object" && "url" in value
    ? (value as Media)
    : null;

const ownOrigin = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/+$/, "");

/**
 * Payload prefixes upload URLs with `serverURL` whenever it is set, which it is
 * in production — so the same file that is `/api/media/file/x.jpg` in
 * development becomes `https://the-site/api/media/file/x.jpg` once deployed.
 * `next/image` treats that as a remote image and the optimizer rejects it with
 * `400 "url" parameter is not allowed`, since `next.config.ts` allowlists these
 * files under `localPatterns` rather than `remotePatterns`. The images render
 * fine in the admin panel, which does not use `next/image`, so it looks like a
 * frontend bug rather than a URL-shape one.
 *
 * Trimming our own origin back off restores the development shape and keeps the
 * optimizer talking to the local file instead of fetching the site through its
 * own public edge. URLs on any other origin — an S3/R2 bucket, should uploads
 * ever move there — are left alone, and need `remotePatterns` instead.
 */
const toLocalPath = (url: string): string =>
  ownOrigin && url.startsWith(`${ownOrigin}/`)
    ? url.slice(ownOrigin.length)
    : url;

export const mediaUrl = (
  value: unknown,
  size?: "thumbnail" | "card" | "hero",
): string | null => {
  const media = asMedia(value);
  if (!media) return null;
  if (size) {
    const sized = media.sizes?.[size]?.url;
    if (sized) return toLocalPath(sized);
  }
  return media.url ? toLocalPath(media.url) : null;
};

export const mediaAlt = (value: unknown, fallback = ""): string =>
  asMedia(value)?.alt || fallback;

export const asMediaList = (value: unknown): Media[] =>
  Array.isArray(value)
    ? value.map(asMedia).filter((m): m is Media => m !== null)
    : [];
