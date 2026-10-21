import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-full border border-input bg-ivory/[0.03] px-5 text-[15px] text-ivory placeholder:text-smoke transition-colors outline-none focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
