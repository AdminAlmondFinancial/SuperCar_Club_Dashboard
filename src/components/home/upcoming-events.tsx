import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DateBlock, StatusChip, useEventFacts } from '@/components/directory/event-card'
import { SectionHeader } from '@/components/ui/section-header'
import type { ClubEvent } from '@/data/events'
import { fmtTime } from '@/lib/dates'

function Row({ event }: { event: ClubEvent }) {
  const { status } = useEventFacts(event)
  return (
    <li>
      <Link
        to={`/events#event-${event.id}`}
        className="group flex items-center gap-4 rounded-[18px] px-3 py-3.5 transition-colors duration-200 hover:bg-ivory/[0.04]"
      >
        <DateBlock iso={event.date} />
        <span className="min-w-0 flex-1">
          <span className="block text-ivory">{event.title}</span>
          <span className="mt-0.5 block truncate text-label text-smoke">
            {event.venue}, {fmtTime(new Date(event.date))}
          </span>
        </span>
        <span className="hidden sm:block">
          <StatusChip status={status} />
        </span>
        <ChevronRight className="size-4 shrink-0 text-smoke transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  )
}

export function UpcomingEvents({ events }: { events: ClubEvent[] }) {
  return (
    <section aria-labelledby="events-title">
      <SectionHeader
        id="events-title"
        title="Coming up after that"
        action={
          <Link to="/events" className="text-label text-teal-bright underline-offset-4 hover:underline">
            All events
          </Link>
        }
      />
      {events.length ? (
        <ul className="panel divide-y divide-line px-3 py-2">
          {events.map((e) => (
            <Row key={e.id} event={e} />
          ))}
        </ul>
      ) : (
        <div className="panel p-8 text-smoke">Nothing else is scheduled yet. New dates appear here as soon as the committee posts them.</div>
      )}
    </section>
  )
}
