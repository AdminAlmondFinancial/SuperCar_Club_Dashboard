import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ChequeredFlag } from '@/components/memorabilia'
import { memberById } from '@/data/members'
import type { ClubEvent } from '@/data/events'
import { cn } from '@/lib/utils'
import { fmtLong, fmtTime, inDays, daysUntil } from './dates'

function AvatarStack({ ids, max = 5 }: { ids: string[]; max?: number }) {
  const shown = ids.slice(0, max)
  return (
    <div className="flex items-center">
      <ul className="flex -space-x-2" aria-label="Members attending">
        {shown.map((id) => {
          const m = memberById(id)
          return (
            <li
              key={id}
              title={m?.name}
              className="grid size-9 place-items-center rounded-full border-2 border-[#08120f] bg-graphite-2 text-[11px] font-medium text-champagne"
            >
              <span aria-hidden>{m?.initials ?? '?'}</span>
              <span className="sr-only">{m?.name}</span>
            </li>
          )
        })}
      </ul>
      {ids.length > max && <span className="ml-3 text-sm text-smoke">and {ids.length - max} more</span>}
    </div>
  )
}

function DateBlock({ date, large }: { date: Date; large?: boolean }) {
  return (
    <div
      className={cn(
        'shrink-0 rounded-[18px] border border-line-strong bg-ivory/[0.04] text-center',
        large ? 'w-24 px-3 py-4' : 'w-14 px-2 py-2',
      )}
    >
      <p className={cn('type-spec text-ivory', large ? 'text-4xl' : 'text-xl')}>{date.getDate()}</p>
      <p className={cn('text-smoke', large ? 'mt-1 text-sm' : 'text-xs')}>
        {date.toLocaleDateString('en-GB', { month: 'short' })}
      </p>
    </div>
  )
}

function Featured({ event }: { event: ClubEvent }) {
  const [going, setGoing] = useState(false)
  const date = new Date(event.date)
  const count = event.attendeeIds.length + (going ? 1 : 0)
  return (
    <article className="panel-feature overflow-hidden p-6 sm:p-8" aria-labelledby={`ev-${event.id}`}>
      <ChequeredFlag className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rotate-12 text-champagne opacity-[0.14]" />
      <div className="relative flex flex-col gap-6 sm:flex-row">
        <div className="self-start"><DateBlock date={date} large /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-teal-bright">Your next event, {inDays(daysUntil(date))}</p>
          <h3 id={`ev-${event.id}`} className="type-display mt-2 text-3xl text-ivory sm:text-4xl">
            {event.title}
          </h3>
          <p className="mt-3 flex items-center gap-2 text-smoke">
            <MapPin className="size-4 shrink-0 text-champagne" aria-hidden />
            {event.venue}, {event.region}
          </p>
          <p className="mt-1 text-smoke">
            {fmtLong(date)} at {fmtTime(date)}
          </p>
          <p className="mt-4 max-w-xl text-ivory/80">{event.description}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <AvatarStack ids={event.attendeeIds} />
              <p className="mt-2 text-sm text-smoke">
                <span className="type-spec text-ivory">{count}</span> of {event.capacity} places taken
              </p>
            </div>
            <Button
              variant={going ? 'outline' : 'accent'}
              size="lg"
              aria-pressed={going}
              onClick={() => setGoing((g) => !g)}
            >
              {going && <Check aria-hidden />}
              {going ? "You're going" : 'Reserve your place'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function UpcomingEvents({ events }: { events: ClubEvent[] }) {
  const [first, ...rest] = events
  return (
    <section aria-labelledby="events-title">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="events-title" className="type-display text-3xl text-ivory md:text-4xl">
          Upcoming events and car meets
        </h2>
        <Link to="/events" className="shrink-0 text-sm text-teal-bright underline-offset-4 hover:underline">
          See all events
        </Link>
      </div>
      {first ? (
        <div className="space-y-4">
          <Featured event={first} />
          <ul className="panel divide-y divide-line px-3 py-2">
            {rest.slice(0, 4).map((e) => {
              const d = new Date(e.date)
              return (
                <li key={e.id}>
                  <Link
                    to="/events"
                    className="flex items-center gap-4 rounded-[18px] px-3 py-3.5 transition-colors hover:bg-ivory/[0.04]"
                  >
                    <DateBlock date={d} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ivory">{e.title}</span>
                      <span className="block truncate text-sm text-smoke">
                        {e.venue}, {fmtTime(d)}
                      </span>
                    </span>
                    <span className="hidden text-sm text-smoke sm:block">
                      <span className="type-spec text-ivory">{e.attendeeIds.length}</span> going
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="panel p-8 text-smoke">Nothing is scheduled right now. New dates appear here as soon as the committee posts them.</div>
      )}
    </section>
  )
}
