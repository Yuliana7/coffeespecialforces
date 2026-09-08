"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isLocale, LOCALES, type Locale } from "@/lib/locales";

/**
 * Swaps the first path segment, so the visitor stays on the page they were
 * reading. Slugs are shared across locales, which is what makes this safe.
 */
export const LocaleSwitcher = ({ current }: { current: Locale }) => {
  const pathname = usePathname() || `/${current}`;

  const pathFor = (locale: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }
    return `/${segments.join("/")}`;
  };

  return (
    <div className="flex items-center gap-1 text-xs font-bold uppercase">
      {LOCALES.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden className="text-line">
              |
            </span>
          ) : null}
          {locale === current ? (
            <span className="text-ink" aria-current="true">
              {locale}
            </span>
          ) : (
            <Link
              href={pathFor(locale)}
              className="text-ink-muted hover:text-blue"
            >
              {locale}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
};
