import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption leading-none font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-ivory/8 text-ivory',
        accent: 'bg-teal/15 text-teal-bright',
        champagne: 'bg-champagne/12 text-champagne',
        signal: 'bg-signal/15 text-[#f08a7f]',
        outline: 'border border-line-strong text-smoke',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
