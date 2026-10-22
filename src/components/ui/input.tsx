import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 border border-line bg-white px-4 text-[14px] text-ink placeholder:text-stone transition-colors outline-none focus-visible:border-ink disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
