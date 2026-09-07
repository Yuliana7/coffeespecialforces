import type { ReactNode } from 'react'

export const Container = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
