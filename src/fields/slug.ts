import type { Field, FieldHook } from 'payload'

/**
 * Ukrainian -> Latin transliteration, following the official KMU 55:2010 table
 * closely enough for URLs. Without this, Cyrillic titles produce empty slugs.
 */
const TRANSLITERATION: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh',
  з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n',
  о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia', ъ: '', ы: 'y', э: 'e', ё: 'e',
}

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .split('')
    .map((char) => TRANSLITERATION[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

/**
 * Localized fields arrive as a plain string when a locale is active, and as a
 * `{ uk: '...', en: '...' }` map when reading/writing with `locale: 'all'`.
 */
const readLocalized = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const map = value as Record<string, unknown>
    for (const candidate of Object.values(map)) {
      if (typeof candidate === 'string' && candidate.length > 0) return candidate
    }
  }
  return ''
}

const deriveFromSource =
  (sourceField: string): FieldHook =>
  ({ data, value }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)

    const source = readLocalized(data?.[sourceField])
    return source ? slugify(source) : value
  }

/**
 * URL identifier. Deliberately NOT localized: one entry keeps one URL across
 * locales, so /uk/projects/x and /en/projects/x resolve to the same document.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  required: true,
  admin: {
    position: 'sidebar',
    description: 'Used in the URL. Leave blank to generate it from the title.',
  },
  hooks: {
    beforeValidate: [deriveFromSource(sourceField)],
  },
})
