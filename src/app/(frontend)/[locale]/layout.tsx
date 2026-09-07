import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import '../globals.css'

import { Footer } from '../../../components/Footer'
import { Header } from '../../../components/Header'
import { getDictionary } from '../../../lib/dictionary'
import { isLocale, LOCALES, type Locale } from '../../../lib/locales'
import { mediaUrl } from '../../../lib/media'
import { buildNav } from '../../../lib/nav'
import { getPayloadClient } from '../../../lib/payload'

// Both faces ship full Cyrillic, which the Ukrainian copy needs.
const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

/*
 * Applies to every page under this layout. Without it Next prerenders the
 * listing pages at build time, so an editor's change would not appear on the
 * live site until the next deploy — which defeats the point of the CMS. The
 * database is local, so rendering per request costs effectively nothing.
 */
export const dynamic = 'force-dynamic'

export const generateStaticParams = async () => LOCALES.map((locale) => ({ locale }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', locale, depth: 0 })

  return {
    title: {
      default: settings.siteName,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.tagline ?? undefined,
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })

  const t = getDictionary(locale)
  const nav = buildNav(locale)

  return (
    <html lang={locale} className={`${oswald.variable} ${inter.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:font-bold"
        >
          {t.skipToContent}
        </a>
        <Header
          locale={locale}
          siteName={settings.siteName}
          logoUrl={mediaUrl(settings.logo, 'thumbnail') ?? '/logo.jpg'}
          nav={nav}
        />
        <main id="main">{children}</main>
        <Footer locale={locale} settings={settings} nav={nav} />
      </body>
    </html>
  )
}
