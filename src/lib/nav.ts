import { getDictionary } from "./dictionary";
import type { Locale } from "./locales";
import type { NavItem } from "@/components/Header";

export const buildNav = (locale: Locale): NavItem[] => {
  const t = getDictionary(locale);
  return [
    { href: `/${locale}/projects`, label: t.nav_projects },
    { href: `/${locale}/work-areas`, label: t.nav_workAreas },
    { href: `/${locale}/events`, label: t.nav_events },
    { href: `/${locale}/locations`, label: t.nav_locations },
    { href: `/${locale}/foundation`, label: t.nav_foundation },
  ];
};
