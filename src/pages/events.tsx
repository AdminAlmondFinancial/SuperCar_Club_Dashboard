import { CalendarX2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EventRow, FeaturedEvent } from '@/components/directory/event-card'
import { ChequeredFlag } from '@/components/memorabilia'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { events, upcomingEvents, type ClubEvent } from '@/data/events'
import { fmtMonthYear } from '@/lib/dates'
import { cn } from '@/lib/utils'

const FILTERS: { key: 'all' | ClubEvent['kind']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'drive', label: 'Drives' },
  { key: 'meet', label: 'Car meets' },
  { key: 'track', label: 'Track days' },
  { key: 'social', label: 'Socials' },
]

function byMonth(list: ClubEvent[]) {
  const months: { label: string; items: ClubEvent[] }[] = []
  for (const e of list) {
    const label = fmtMonthYear(new Date(e.date))
    const last = months[months.length - 1]
    if (last?.label === label) last.items.push(e)
    else months.push({ label, items: [e] })
  }
  return months
}

export function EventsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all')

  const upcoming = useMemo(() => upcomingEvents(), [])
  const past = useMemo(() => {
    const ids = new Set(upcoming.map((e) => e.id))
    return events.filter((e) => !ids.has(e.id)).sort((a, b) => b.date.localeCompare(a.date))
  }, [upcoming])

  const matches = (e: ClubEvent) => filter === 'all' || e.kind === filter
  const visible = upcoming.filter(matches)
  const [lead, ...rest] = visible
  const pastVisible = past.filter(matches)

  return (
    <div className="relative overflow-hidden">
      <ChequeredFlag className="pointer-events-none absolute -right-10 top-16 size-72 rotate-6 text-champagne/10 md:right-8 md:size-[26rem]" />
      <div className="pb-dock enter relative mx-auto max-w-[1280px] px-4 pt-28 md:px-8">
        <h1 className="type-display text-5xl md:text-7xl">Events</h1>
        <p className="mt-4 max-w-xl text-lead text-smoke">Drives, meets and evenings with the club. Reserve a place and the host will expect you.</p>

        <div role="group" aria-label="Filter events by kind" className="-mx-4 mt-8 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="inline-flex gap-1 rounded-full border border-line bg-black/50 p-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'h-10 whitespace-nowrap rounded-full px-4 text-label font-medium transition-colors duration-200',
                  filter === f.key ? 'bg-ivory text-ink' : 'text-smoke hover:text-ivory',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-caption text-smoke">Reservations are kept in this browser until club booking goes live.</p>

        {!lead ? (
          <EmptyState
            className="mt-10"
            icon={<CalendarX2 />}
            title="Nothing planned here yet"
            action={
              filter !== 'all' && (
                <Button variant="outline" onClick={() => setFilter('all')}>
                  Show all events
                </Button>
              )
            }
          >
            {filter === 'all'
              ? 'The committee has not posted the next dates yet. They will appear here as soon as it does.'
              : 'There are no events of this kind on the calendar. Try another filter, or check back soon.'}
          </EmptyState>
        ) : (
          <div className="mt-10 space-y-12">
            <FeaturedEvent event={lead} eyebrow={filter === 'all' ? 'Next on the calendar' : `Next ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}`} />
            {/* The calendar reads as a timeline: each month's name holds the left column while its events scroll past */}
            {byMonth(rest).map((m) => (
              <section key={m.label} aria-label={m.label} className="grid gap-5 border-t border-line pt-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
                <h2 className="type-display text-3xl text-champagne lg:sticky lg:top-28 lg:self-start lg:pt-2">{m.label}</h2>
                <div className="space-y-4">
                  {m.items.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {pastVisible.length > 0 && (
          <section aria-labelledby="past-title" className="mt-16 border-t border-line pt-10">
            <h2 id="past-title" className="type-display text-3xl text-ivory">Past events</h2>
            <div className="mt-6 space-y-4">
              {pastVisible.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
