import Link from 'next/link'
import type { ReactNode } from 'react'

export const SectionHeading = ({
  children,
  href,
  linkLabel,
}: {
  children: ReactNode
  href?: string
  linkLabel?: string
}) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
    <h2 className="text-3xl uppercase sm:text-4xl">{children}</h2>
    {href && linkLabel ? (
      <Link
        href={href}
        className="text-sm font-semibold text-blue underline underline-offset-4 hover:text-ink"
      >
        {linkLabel} →
      </Link>
    ) : null}
  </div>
)
