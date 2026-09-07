"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";
import { LocaleSwitcher } from "./LocaleSwitcher";

export type NavItem = { href: string; label: string };

export const Header = ({
  locale,
  siteName,
  logoUrl,
  nav,
}: {
  locale: Locale;
  siteName: string;
  logoUrl: string;
  nav: NavItem[];
}) => {
  const t = getDictionary(locale);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-8">
        <Link
          href={`/${locale}`}
          className="flex min-w-0 shrink items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src={logoUrl}
            alt=""
            width={44}
            height={44}
            className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
          />
          {/* Hidden on the narrowest screens so the donate button always fits. */}
          <span className="hidden truncate font-display text-base font-bold uppercase leading-tight sm:inline sm:text-lg">
            {siteName}
          </span>
        </Link>

        <nav
          className="ml-auto hidden items-center gap-6 lg:flex"
          aria-label={t.menu}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold hover:text-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-0">
          <LocaleSwitcher current={locale} />
          <Link
            href={`/${locale}/donate`}
            className="rounded-full bg-gold px-3 py-1.5 text-xs font-bold uppercase text-ink transition-transform hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
          >
            {t.donate}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rounded border border-line p-2 lg:hidden"
          >
            <span className="sr-only">{t.menu}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              aria-hidden
              focusable="false"
            >
              <path
                d={open ? "M3 3l12 12M15 3L3 15" : "M1 4h16M1 9h16M1 14h16"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label={t.menu}
          className="border-t border-line bg-surface px-5 py-3 lg:hidden"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-3 text-sm font-semibold last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
};
