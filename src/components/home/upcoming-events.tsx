import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DateBlock, FeaturedEvent } from '@/components/directory/event-card'
import type { ClubEvent } from '@/data/events'
import { daysUntil, fmtTime, inDays } from '@/lib/dates'

export function UpcomingEvents({ events }: { events: ClubEvent[] }) {
  const [first, ...rest] = events
  const [going, setGoing] = useState(false)
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
          <FeaturedEvent
            event={first}
            going={going}
            onToggle={() => setGoing((g) => !g)}
            eyebrow={`Your next event, ${inDays(daysUntil(new Date(first.date)))}`}
          />
          <ul className="panel divide-y divide-line px-3 py-2">
            {rest.slice(0, 4).map((e) => (
              <li key={e.id}>
                <Link
                  to="/events"
                  className="flex items-center gap-4 rounded-[18px] px-3 py-3.5 transition-colors hover:bg-ivory/[0.04]"
                >
                  <DateBlock iso={e.date} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ivory">{e.title}</span>
                    <span className="block truncate text-sm text-smoke">
                      {e.venue}, {fmtTime(new Date(e.date))}
                    </span>
                  </span>
                  <span className="hidden text-sm text-smoke sm:block">
                    <span className="type-spec text-ivory">{e.attendeeIds.length}</span> going
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="panel p-8 text-smoke">Nothing is scheduled right now. New dates appear here as soon as the committee posts them.</div>
      )}
    </section>
  )
}
