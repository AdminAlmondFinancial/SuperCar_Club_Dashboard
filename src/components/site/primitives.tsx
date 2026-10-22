import { ArrowRight, Info } from 'lucide-react'
import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('font-display text-[19px] font-[420] tracking-[0.2em] whitespace-nowrap uppercase', className)}>SuperCar Club</span>
}

/**
 * Fades its content up once as it scrolls into view. Content already on screen when the page
 * loads is left alone, so the first frame is complete without any scrolling.
 */
export function Reveal<T extends ElementType = 'div'>({
  as,
  delay = 0,
  className,
  children,
  ...rest
}: { as?: T; delay?: number; className?: string; children: ReactNode } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) return
    el.dataset.reveal = 'pending'
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.style.transitionDelay = `${delay}ms`
        el.dataset.reveal = 'in'
        io.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])
  return createElement(as ?? 'div', { ref, className, ...rest }, children)
}

/** Uppercase label above a heading; names what kind of thing follows. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('eyebrow text-stone', className)}>{children}</p>
}

export function SectionHeading({
  title,
  action,
  id,
  className,
}: {
  title: ReactNode
  action?: { to: string; label: string }
  id?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-end justify-between gap-6', className)}>
      <h2 id={id} className="display text-[clamp(1.6rem,2.4vw,2.1rem)]">
        {title}
      </h2>
      {action && <ArrowLink to={action.to}>{action.label}</ArrowLink>}
    </div>
  )
}

export function ArrowLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={cn('group inline-flex shrink-0 items-center gap-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase', className)}>
      {children}
      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
    </Link>
  )
}

/** Marks sample content that does not come from the club's live records yet. */
export function DemoNote({ children, tone = 'light', className }: { children: ReactNode; tone?: 'light' | 'dark'; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-start gap-2 text-[12px] leading-snug',
        tone === 'light' ? 'text-stone' : 'text-fog',
        className,
      )}
    >
      <Info className="mt-px size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span>{children}</span>
    </p>
  )
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span className={cn('eyebrow inline-flex h-5 items-center border border-current px-1.5 text-[9.5px] tracking-[0.14em] opacity-70', className)}>Demo</span>
  )
}

/** Responsive photograph with fixed aspect ratio so the page never jumps while images load. */
export function Photo({
  src,
  srcSet,
  sizes,
  alt,
  ratio = '16 / 10',
  className,
  imgClassName,
  eager,
}: {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  ratio?: string
  className?: string
  imgClassName?: string
  eager?: boolean
}) {
  return (
    <div className={cn('relative overflow-hidden bg-mist', className)} style={{ aspectRatio: ratio }}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('absolute inset-0 size-full object-cover', imgClassName)}
      />
    </div>
  )
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ name, url, className }: { name: string; url?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-obsidian-3 text-[12px] font-medium tracking-wide text-white',
        className,
      )}
      aria-hidden
    >
      {url ? <img src={url} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  )
}
