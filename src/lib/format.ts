import type { Locale } from './locales'

const INTL_LOCALE: Record<Locale, string> = { uk: 'uk-UA', en: 'en-GB' }

export const formatMoney = (
  amount: number,
  currency: string,
  locale: Locale,
): string =>
  new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

export const formatDate = (value: string | Date, locale: Locale): string =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))

export const formatDateTime = (value: string | Date, locale: Locale): string =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

/** Percentage of a fundraising goal, clamped so a bar can never overflow. */
export const progressPercent = (raised: number, goal: number): number => {
  if (!goal || goal <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((raised / goal) * 100)))
}
