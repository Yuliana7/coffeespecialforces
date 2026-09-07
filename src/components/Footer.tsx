import Link from "next/link";

import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";
import type { SiteSetting } from "@/payload-types";
import { Container } from "./Container";
import type { NavItem } from "./Header";

export const Footer = ({
  locale,
  settings,
  nav,
}: {
  locale: Locale;
  settings: SiteSetting;
  nav: NavItem[];
}) => {
  const t = getDictionary(locale);
  const socials = settings.socialLinks ?? [];

  return (
    <footer className="mt-24 bg-olive-deep text-white">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="text-2xl uppercase">{settings.siteName}</h2>
            {settings.tagline ? (
              <p className="mt-2 max-w-sm text-sm text-white/70">
                {settings.tagline}
              </p>
            ) : null}
            <Link
              href={`/${locale}/donate`}
              className="mt-6 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-bold uppercase text-ink"
            >
              {t.donate}
            </Link>
          </div>

          <nav aria-label={t.menu}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
              {t.menu}
            </h3>
            <ul className="space-y-2 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/80 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
              {t.contact}
            </h3>
            <ul className="space-y-2 text-sm">
              {settings.contactEmail ? (
                <li>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-white/80 hover:text-gold"
                  >
                    {settings.contactEmail}
                  </a>
                </li>
              ) : null}
              {socials.map((link) => (
                <li key={link.id ?? link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-white/80 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/50">
          {settings.footerText ? (
            <p className="mb-1">{settings.footerText}</p>
          ) : null}
          <p>
            © {new Date().getFullYear()} {settings.siteName}
          </p>
        </div>
      </Container>
    </footer>
  );
};
