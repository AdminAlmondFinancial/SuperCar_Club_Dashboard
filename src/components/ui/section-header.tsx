import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** A section's serif title, with an optional line under it and an optional link or control on the right. */
export function SectionHeader({
  id,
  title,
  description,
  action,
  className,
}: {
  id?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div className="min-w-0">
        <h2 id={id} className="type-display text-[clamp(2rem,3.4vw,2.75rem)] text-ivory">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-[60ch] text-smoke">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
