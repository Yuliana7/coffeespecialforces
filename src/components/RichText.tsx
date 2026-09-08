import {
  RichText as LexicalRichText,
  LinkJSXConverter,
} from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import Link from "next/link";

import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";

/** Which collections have a detail route, and under which path segment. */
const COLLECTION_PATHS: Record<string, string> = {
  projects: "projects",
  events: "events",
  "work-areas": "work-areas",
};

type Related = { relationTo?: string; value?: unknown };

/**
 * Builds the frontend URL for a document referenced from rich text.
 *
 * The reference is populated only when the document was queried with
 * `depth >= 1`; at depth 0 it is a bare id. Without a slug there is no detail
 * URL to build, so those fall back to the collection listing.
 */
const docHref = (
  locale: Locale,
  related: Related | null | undefined,
): string => {
  const segment = COLLECTION_PATHS[related?.relationTo ?? ""];
  if (!segment) return `/${locale}/${related?.relationTo ?? ""}`;

  const value = related?.value;
  const slug =
    value && typeof value === "object" && "slug" in value
      ? (value as { slug?: string }).slug
      : null;

  return slug ? `/${locale}/${segment}/${slug}` : `/${locale}/${segment}`;
};

/**
 * Payload's default converters cover text, headings, lists, tables and uploads,
 * but not documents referenced from rich text. Two gaps, both silent:
 *
 * 1. The default link converter is built as `LinkJSXConverter({})` — with no
 *    `internalDocToHref` — so a link to another document renders `href="#"`.
 *    Supplying that function is the documented step, not an override.
 *    https://payloadcms.com/docs/rich-text/converting-jsx
 * 2. There is no `relationship` converter at all, so the editor's Relationship
 *    node renders nothing. That one is entirely ours; Payload ships no default
 *    because it cannot know how a given site wants to present a linked doc.
 */
const buildConverters =
  (locale: Locale): JSXConvertersFunction =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
      internalDocToHref: ({ linkNode }) => docHref(locale, linkNode.fields.doc),
    }),
    relationship: ({ node }) => {
      const related = node as unknown as Related & {
        value?: { title?: string; name?: string };
      };
      const label =
        related.value?.title ??
        related.value?.name ??
        getDictionary(locale).readMore;

      return (
        <Link
          href={docHref(locale, related)}
          className="my-4 flex items-center justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3 no-underline transition-colors hover:border-ink"
        >
          <span className="font-medium text-ink">{label}</span>
          <span aria-hidden="true" className="text-ink-muted">
            →
          </span>
        </Link>
      );
    },
  });

/** Renders Lexical editor content, or nothing when the field is empty. */
export const RichText = ({
  data,
  locale,
  className = "",
}: {
  data?: unknown;
  locale: Locale;
  className?: string;
}) => {
  if (!data) return null;

  return (
    <div className={`prose-body max-w-3xl ${className}`}>
      <LexicalRichText
        data={data as SerializedEditorState}
        converters={buildConverters(locale)}
      />
    </div>
  );
};
