import { formatMoney, progressPercent } from "@/lib/format";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";

export const ProgressBar = ({
  raised,
  goal,
  currency,
  locale,
}: {
  raised?: number | null;
  goal?: number | null;
  currency?: string | null;
  locale: Locale;
}) => {
  // No goal set means this project isn't collecting money — show nothing.
  if (!goal || goal <= 0) return null;

  const t = getDictionary(locale);
  const raisedAmount = raised ?? 0;
  const percent = progressPercent(raisedAmount, goal);
  const code = currency || "UAH";

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold">
          {t.raised}{" "}
          <span className="text-blue">
            {formatMoney(raisedAmount, code, locale)}
          </span>
        </span>
        <span className="text-ink-muted">
          {t.goal} {formatMoney(goal, code, locale)}
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t.raised}: ${percent}%`}
      >
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs font-semibold text-ink-muted">
        {percent}%
      </div>
    </div>
  );
};
