import { cn } from '@/lib/utils'

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'type-spec grid shrink-0 place-items-center rounded-full bg-graphite-2 text-ivory ring-1 ring-champagne/60 ring-offset-2 ring-offset-graphite',
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function AttendeeStack({ initials, extra, label }: { initials: string[]; extra: number; label: string }) {
  return (
    <div className="flex items-center" role="img" aria-label={label}>
      {initials.map((i, idx) => (
        <span
          key={`${i}-${idx}`}
          aria-hidden="true"
          className="type-spec -ml-2 grid size-9 place-items-center rounded-full border-2 border-graphite bg-graphite-2 text-[11px] tracking-normal text-ivory first:ml-0"
        >
          {i}
        </span>
      ))}
      {extra > 0 && (
        <span
          aria-hidden="true"
          className="type-spec -ml-2 grid h-9 min-w-9 place-items-center rounded-full border-2 border-graphite bg-ivory/10 px-1.5 text-[11px] text-smoke"
        >
          +{extra}
        </span>
      )}
    </div>
  )
}
