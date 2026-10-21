import { useMemo, useState } from 'react'

import { EventRow, FeaturedEvent } from '@/components/directory/event-card'
import { ChequeredFlag } from '@/components/memorabilia'
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

export function EventsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all')
  const [going, setGoing] = useState<Set<string>>(() => new Set())

  const upcoming = useMemo(() => {
    const list = upcomingEvents()
    return list.length ? list : [...events].sort((a, b) => a.date.localeCompare(b.date))
  }, [])
  const visible = upcoming.filter((e) => filter === 'all' || e.kind === filter)
  const lead = visible[0]

  const toggle = (id: string) =>
    setGoing((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const months: { label: string; items: ClubEvent[] }[] = []
  for (const e of visible.slice(1)) {
    const label = fmtMonthYear(new Date(e.date))
    const last = months[months.length - 1]
    if (last?.label === label) last.items.push(e)
    else months.push({ label, items: [e] })
  }
  const leadMonth = lead ? fmtMonthYear(new Date(lead.date)) : ''

  return (
    <div className="relative overflow-hidden">
      <ChequeredFlag className="pointer-events-none absolute -right-10 top-16 size-72 rotate-6 text-champagne/10 md:right-8 md:size-[26rem]" />
      <div className="relative mx-auto max-w-[1280px] px-4 pb-28 pt-28 md:px-8 md:pb-24">
        <h1 className="type-display text-5xl md:text-7xl">Events</h1>
        <p className="mt-4 max-w-xl text-base text-smoke">Drives, meets and evenings with the club. Reserve a place and we will keep it for you.</p>

        <div role="group" aria-label="Filter events by kind" className="-mx-4 mt-8 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="inline-flex gap-1 rounded-full border border-line bg-black/50 p-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'h-10 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-teal-bright',
                  filter === f.key ? 'bg-ivory text-ink' : 'text-smoke hover:text-ivory',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {!lead ? (
          <div className="panel mt-10 px-6 py-16 text-center">
            <p className="type-display text-3xl">Nothing planned here yet</p>
            <p className="mx-auto mt-3 max-w-sm text-smoke">There are no events of this kind on the calendar. Try another filter, or check back soon.</p>
            <button type="button" onClick={() => setFilter('all')} className="mt-6 h-11 rounded-full border border-line-strong px-5 text-sm text-ivory transition-colors hover:bg-ivory/5">
              Show all events
            </button>
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            {/* The calendar reads as a timeline: each month's name holds the left column while its events scroll past */}
            <section aria-labelledby="month-lead" className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
              <h2 id="month-lead" className="type-display text-3xl text-champagne lg:sticky lg:top-28 lg:self-start lg:pt-2">{leadMonth}</h2>
              <div className="space-y-4">
                <FeaturedEvent event={lead} going={going.has(lead.id)} onToggle={() => toggle(lead.id)} />
                {months[0]?.label === leadMonth && months[0].items.map((e) => <EventRow key={e.id} event={e} going={going.has(e.id)} onToggle={() => toggle(e.id)} />)}
              </div>
            </section>
            {months
              .filter((m) => m.label !== leadMonth)
              .map((m) => (
                <section key={m.label} aria-label={m.label} className="grid gap-5 border-t border-line pt-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
                  <h2 className="type-display text-3xl text-champagne lg:sticky lg:top-28 lg:self-start lg:pt-2">{m.label}</h2>
                  <div className="space-y-4">
                    {m.items.map((e) => (
                      <EventRow key={e.id} event={e} going={going.has(e.id)} onToggle={() => toggle(e.id)} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
