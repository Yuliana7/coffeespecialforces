export const LOCALES = ['uk', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'uk'

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value)

export const LOCALE_LABELS: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English',
}
