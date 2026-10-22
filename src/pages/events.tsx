import { MapPin, Route, Shirt, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { eventImage } from '@/components/site/event-image'
import { DemoNote, Eyebrow, Photo, Reveal } from '@/components/site/primitives'
import { RsvpButton } from '@/components/site/rsvp-button'
import { eventKindLabel, events, upcomingEvents, type ClubEvent } from '@/data/events'
import { memberById } from '@/data/members'
import { daysUntil, fmtDay, fmtLong, fmtMonthYear, fmtTime, inDays } from '@/lib/dates'
import { useRsvp } from '@/lib/rsvp'
import { cn } from '@/lib/utils'

const FILTERS: { key: 'all' | 'going' | ClubEvent['kind']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'drive', label: 'Drives' },
  { key: 'meet', label: 'Car meets' },
  { key: 'track', label: 'Track days' },
  { key: 'social', label: 'Socials' },
  { key: 'going', label: 'Your replies' },
]

function Facts({ event, tone = 'light' }: { event: ClubEvent; tone?: 'light' | 'dark' }) {
  const host = memberById(event.hostId)
  const { isGoing } = useRsvp()
  const taken = event.attendeeIds.length + (isGoing(event.id) ? 1 : 0)
  const muted = tone === 'dark' ? 'text-fog' : 'text-stone'
  return (
    <ul className={cn('mt-4 grid gap-2 text-[13px] sm:grid-cols-2', muted)}>
      <li className="flex items-center gap-2">
        <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} /> {event.venue}, {event.region}
      </li>
      <li className="flex items-center gap-2">
        <Users className="size-3.5 shrink-0" strokeWidth={1.5} /> {taken} of {event.capacity} places taken
        {host && <> · hosted by {host.name}</>}
      </li>
      {event.routeKm && (
        <li className="flex items-center gap-2">
          <Route className="size-3.5 shrink-0" strokeWidth={1.5} /> {event.routeKm} km route
        </li>
      )}
      {event.dressCode && (
        <li className="flex items-center gap-2">
          <Shirt className="size-3.5 shrink-0" strokeWidth={1.5} /> {event.dressCode}
        </li>
      )}
    </ul>
  )
}

function Lead({ event }: { event: ClubEvent }) {
  const date = new Date(event.date)
  return (
    <article className="grid overflow-hidden bg-obsidian text-white lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <Photo {...eventImage(event)} sizes="(min-width: 1024px) 55vw, 100vw" ratio="16 / 10" className="bg-obsidian-2 lg:aspect-auto! lg:h-full" eager />
      <div className="flex flex-col justify-center p-6 lg:p-12">
        <p className="eyebrow text-[10.5px] text-fog">
          Next up · {eventKindLabel(event.kind)} · {inDays(daysUntil(date))}
        </p>
        <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.02]">{event.title}</h2>
        <p className="mt-3 text-[14px] text-white/85">
          {fmtLong(date)}, {fmtTime(date)}
        </p>
        <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-white/80">{event.description}</p>
        <Facts event={event} tone="dark" />
        <div className="mt-8">
          <RsvpButton event={event} tone="dark" />
        </div>
      </div>
    </article>
  )
}

function Row({ event }: { event: ClubEvent }) {
  const date = new Date(event.date)
  const img = eventImage(event)
  return (
    <article className="grid gap-5 border-t border-line py-8 md:grid-cols-[200px_minmax(0,1fr)_auto] md:gap-8">
      <Photo {...img} sizes="200px" ratio="4 / 3" className="hidden bg-obsidian md:block" />
      <div className="min-w-0">
        <p className="eyebrow text-[10px] text-stone">
          {eventKindLabel(event.kind)} · {fmtDay(date)}, {fmtTime(date)}
        </p>
        <h3 className="display mt-2 text-[clamp(1.5rem,2.2vw,1.9rem)] leading-tight">{event.title}</h3>
        <p className="mt-2 max-w-[64ch] text-[14px] leading-relaxed text-ink/75">{event.description}</p>
        <Facts event={event} />
      </div>
      <div className="md:pt-6">
        <RsvpButton event={event} />
      </div>
    </article>
  )
}

export function EventsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all')
  const { going } = useRsvp()
  const upcoming = useMemo(() => {
    const list = upcomingEvents()
    return list.length ? list : [...events].sort((a, b) => a.date.localeCompare(b.date))
  }, [])
  const visible = upcoming.filter((e) => (filter === 'all' ? true : filter === 'going' ? going.has(e.id) : e.kind === filter))
  const [lead, ...rest] = visible

  const months: { label: string; items: ClubEvent[] }[] = []
  for (const e of rest) {
    const label = fmtMonthYear(new Date(e.date))
    const last = months[months.length - 1]
    if (last?.label === label) last.items.push(e)
    else months.push({ label, items: [e] })
  }

  return (
    <div className="page-gutter mx-auto max-w-[1520px] pt-28 pb-24 lg:pt-36">
      <Eyebrow>The calendar</Eyebrow>
      <h1 className="display rise mt-4 text-[clamp(2.8rem,6.4vw,5.4rem)]">Events.</h1>
      <p className="rise mt-3 max-w-[56ch] text-[15px] text-stone [animation-delay:80ms]">Drives, meets, track days and evenings with the club. Reserve a place and the host will keep it for you.</p>

      <div role="group" aria-label="Filter events" className="-mx-1 mt-10 flex gap-6 overflow-x-auto border-b border-line px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'eyebrow relative shrink-0 pb-3 text-[11px] transition-colors',
              filter === f.key ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ink' : 'text-stone hover:text-ink',
            )}
          >
            {f.label}
            {f.key === 'going' && going.size > 0 && <span className="ml-1.5 tabular">({going.size})</span>}
          </button>
        ))}
      </div>

      {!lead ? (
        <div className="mt-10 border border-line bg-white px-6 py-16 text-center">
          <p className="display text-[28px]">{filter === 'going' ? 'No replies yet' : 'Nothing planned here yet'}</p>
          <p className="mx-auto mt-3 max-w-sm text-[14px] text-stone">
            {filter === 'going' ? 'Reserve a place at an event and it will appear here.' : 'There are no events of this kind on the calendar. Try another filter.'}
          </p>
          <button type="button" onClick={() => setFilter('all')} className="link-rule mt-6 text-[10.5px]">
            Show all events
          </button>
        </div>
      ) : (
        <div className="mt-10">
          <Lead event={lead} />
          {months.map((m) => (
            <section key={m.label} aria-label={m.label} className="mt-14 grid gap-2 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
              <h2 className="display text-[28px] lg:sticky lg:top-28 lg:self-start lg:pt-8">{m.label}</h2>
              <div>
                {m.items.map((e) => (
                  <Reveal key={e.id}>
                    <Row event={e} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <DemoNote className="mt-14">These events are sample content. Replies are saved in this browser until the club&rsquo;s events service is connected. Photographs are illustrative.</DemoNote>
    </div>
  )
}
