import { getDictionary } from '../lib/dictionary'
import type { Locale } from '../lib/locales'
import type { Donate } from '../payload-types'

/**
 * The one place payment details are rendered. Used by /donate and by every
 * project page, so an IBAN is never duplicated in the codebase.
 */
export const DonateBlock = ({
  donate,
  locale,
  compact = false,
}: {
  donate: Donate
  locale: Locale
  compact?: boolean
}) => {
  const t = getDictionary(locale)
  const methods = donate.methods ?? []
  const hasBank = Boolean(donate.iban || donate.recipient)

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      {!compact && donate.heading ? (
        <h2 className="text-2xl uppercase">{donate.heading}</h2>
      ) : null}
      {!compact && donate.intro ? (
        <p className="mt-2 max-w-2xl text-ink-muted">{donate.intro}</p>
      ) : null}
      {compact ? (
        <h2 className="text-xl uppercase">{donate.heading || t.donate}</h2>
      ) : null}

      {methods.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {methods.map((method) => (
            <li key={method.id ?? method.url}>
              <a
                href={method.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-full flex-col justify-center rounded-md bg-gold px-4 py-3 font-bold text-ink transition-transform hover:scale-[1.02]"
              >
                {method.label}
                {method.description ? (
                  <span className="mt-0.5 block text-xs font-medium text-ink/70">
                    {method.description}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {hasBank ? (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">
            {t.bankTransfer}
          </h3>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            {donate.recipient ? (
              <>
                <dt className="font-semibold text-ink-muted">{t.recipient}</dt>
                <dd>{donate.recipient}</dd>
              </>
            ) : null}
            {donate.iban ? (
              <>
                <dt className="font-semibold text-ink-muted">{t.iban}</dt>
                <dd className="font-mono break-all">{donate.iban}</dd>
              </>
            ) : null}
            {donate.taxId ? (
              <>
                <dt className="font-semibold text-ink-muted">{t.taxId}</dt>
                <dd className="font-mono">{donate.taxId}</dd>
              </>
            ) : null}
            {donate.paymentPurpose ? (
              <>
                <dt className="font-semibold text-ink-muted">{t.paymentPurpose}</dt>
                <dd>{donate.paymentPurpose}</dd>
              </>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  )
}
