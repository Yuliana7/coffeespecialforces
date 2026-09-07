import path from 'path'
import { fileURLToPath } from 'url'

import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { uk } from '@payloadcms/translations/languages/uk'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Events } from './collections/Events'
import { Locations } from './collections/Locations'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { WorkAreas } from './collections/WorkAreas'
import { Donate } from './globals/Donate'
import { Foundation } from './globals/Foundation'
import { Home } from './globals/Home'
import { SiteSettings } from './globals/SiteSettings'
import { LOCALES, DEFAULT_LOCALE } from './lib/locales'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL
const isProduction = process.env.NODE_ENV === 'production'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— Coffee Special Forces',
    },
  },

  // Content is written in Ukrainian first; English falls back to it until translated.
  localization: {
    locales: LOCALES.map((code) => ({
      code,
      label: code === 'uk' ? 'Українська' : 'English',
    })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },

  // The admin interface itself, so editors can work in Ukrainian.
  i18n: {
    supportedLanguages: { en, uk },
    fallbackLanguage: 'uk',
  },

  collections: [Projects, Events, WorkAreas, Locations, Media, Users],
  globals: [Home, Foundation, Donate, SiteSettings],

  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./coffeesf.db' },
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  /*
   * Payload refuses cookie auth when a request's Origin is missing from its
   * CSRF allowlist, and `serverURL` is added to that list automatically. Pinning
   * it in development therefore breaks every save the moment the real origin
   * differs — which happens on its own, since Next falls back to another port
   * when 3000 is taken. Left unset in development, Payload derives the origin
   * from the request instead; production pins it, where the origin is known.
   */
  ...(isProduction && serverURL ? { serverURL, cors: [serverURL], csrf: [serverURL] } : {}),
  sharp,
})
