import * as React from 'react'

import { cn } from '@/lib/utils'

const cardVariant = {
  standard: 'panel p-6',
  featured: 'panel-feature p-6 md:p-8',
  compact: 'tile p-4',
  interactive: 'panel interactive p-6',
} as const

function Card({ className, variant = 'standard', ...props }: React.ComponentProps<'div'> & { variant?: keyof typeof cardVariant }) {
  return <div data-slot="card" className={cn(cardVariant[variant], className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('mb-5 flex items-end justify-between gap-4', className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 data-slot="card-title" className={cn('type-display text-[28px] text-ivory', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-label text-smoke', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription }
