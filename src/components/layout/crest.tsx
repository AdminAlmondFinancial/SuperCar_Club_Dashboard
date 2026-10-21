import { cn } from '@/lib/utils'

/** The club crest: a laurel-less shield with a chequered field and a single speed line. */
export function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 36" className={cn('h-8 w-7', className)} aria-hidden>
      <defs>
        <linearGradient id="crest-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9dcbc" />
          <stop offset="0.5" stopColor="#cdb98f" />
          <stop offset="1" stopColor="#8f7c55" />
        </linearGradient>
        <clipPath id="crest-shield">
          <path d="M16 2 L29 6 V17 C29 25.5 23.5 31 16 34 C8.5 31 3 25.5 3 17 V6 Z" />
        </clipPath>
      </defs>
      <path d="M16 2 L29 6 V17 C29 25.5 23.5 31 16 34 C8.5 31 3 25.5 3 17 V6 Z" fill="#071713" stroke="url(#crest-brass)" strokeWidth="1.4" />
      <g clipPath="url(#crest-shield)" fill="url(#crest-brass)" opacity="0.9">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3].map((c) =>
            (r + c) % 2 === 0 ? <rect key={`${r}-${c}`} x={8 + c * 4} y={9 + r * 4} width="4" height="4" /> : null,
          ),
        )}
      </g>
      <path d="M6 27 L26 21" stroke="#3a9b8a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Crest />
      <span className="type-display text-[22px] leading-none text-ivory">
        SuperCar Club
      </span>
    </span>
  )
}
