import { Check } from 'lucide-react'

import type { ClubEvent } from '@/data/events'
import { useRsvp } from '@/lib/rsvp'
import { cn } from '@/lib/utils'

export function RsvpButton({ event, tone = 'light' }: { event: ClubEvent; tone?: 'light' | 'dark' }) {
  const { isGoing, toggle } = useRsvp()
  const going = isGoing(event.id)
  return (
    <button
      type="button"
      aria-pressed={going}
      onClick={() => toggle(event.id)}
      className={cn(
        'eyebrow inline-flex h-11 items-center gap-2.5 px-5 text-[10.5px] font-semibold transition-colors',
        going
          ? tone === 'dark'
            ? 'bg-white text-ink'
            : 'bg-ink text-paper'
          : tone === 'dark'
            ? 'border border-white/70 text-white hover:bg-white hover:text-ink'
            : 'border border-ink/80 hover:bg-ink hover:text-paper',
      )}
    >
      {going && <Check className="size-3.5" strokeWidth={2} />}
      {going ? 'You are going' : 'Reserve a place'}
    </button>
  )
}
