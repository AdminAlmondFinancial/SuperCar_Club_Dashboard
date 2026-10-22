import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/** Square-cornered, letterspaced buttons, as on an auction catalogue rather than an app. */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-3 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] transition-[background-color,color,border-color] duration-300 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: 'bg-ink text-paper hover:bg-obsidian-3',
        outline: 'border border-ink/80 text-ink hover:bg-ink hover:text-paper',
        'outline-light': 'border border-white/70 text-white hover:bg-white hover:text-ink',
        light: 'bg-white text-ink hover:bg-paper',
        ghost: 'text-ink hover:bg-ink/5',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 px-4',
        icon: 'size-10 tracking-normal',
      },
    },
    defaultVariants: { variant: 'solid', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
