import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, feature, ...props }: React.ComponentProps<'div'> & { feature?: boolean }) {
  return <div data-slot="card" className={cn(feature ? 'panel-feature' : 'panel', 'p-6', className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('mb-5 flex items-end justify-between gap-4', className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 data-slot="card-title" className={cn('type-display text-[28px] text-ivory', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-sm text-smoke', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription }
