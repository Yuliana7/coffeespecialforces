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

export const mediaUrl = (
  value: unknown,
  size?: "thumbnail" | "card" | "hero",
): string | null => {
  const media = asMedia(value);
  if (!media) return null;
  if (size) {
    const sized = media.sizes?.[size]?.url;
    if (sized) return sized;
  }
  return media.url ?? null;
};

export const mediaAlt = (value: unknown, fallback = ""): string =>
  asMedia(value)?.alt || fallback;

export const asMediaList = (value: unknown): Media[] =>
  Array.isArray(value)
    ? value.map(asMedia).filter((m): m is Media => m !== null)
    : [];
