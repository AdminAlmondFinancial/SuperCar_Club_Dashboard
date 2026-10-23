import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** The one shape for "nothing here", "no results" and "could not load", so every page says it the same way. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('panel px-6 py-12 text-center sm:py-16', className)}>
      {icon && <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-line-strong text-champagne [&_svg]:size-5">{icon}</div>}
      <p className="type-display text-3xl text-ivory">{title}</p>
      {children && <p className="mx-auto mt-3 max-w-sm text-smoke">{children}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
