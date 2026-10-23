import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DateBlock, ReserveButton, StatusChip, timeOf, useEventFacts } from '@/components/directory/event-card'
import { Tachometer } from '@/components/memorabilia'
import { Button } from '@/components/ui/button'
import type { ClubEvent } from '@/data/events'
import { useAuth } from '@/lib/auth'
import { nextServiceDate, useGarage } from '@/lib/garage'
import { daysUntil, daysUntilDate, fmtDay, fmtLong, inDays } from './dates'

function NextEvent({ event }: { event: ClubEvent }) {
  const { left, status, host } = useEventFacts(event)
  const days = daysUntil(new Date(event.date))
  return (
    <article className="panel-feature p-6 md:p-8" aria-labelledby="next-event-title">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Your next club event, {inDays(days)}</p>
        <StatusChip status={status} />
      </div>
      <div className="mt-5 flex items-start gap-5">
        <DateBlock iso={event.date} />
        <div className="min-w-0">
          <h2 id="next-event-title" className="type-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-ivory">
            {event.title}
          </h2>
          <p className="mt-2 flex items-start gap-1.5 text-label text-smoke">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {event.venue}, {event.region}
          </p>
          <p className="mt-1 text-label text-smoke">
            {timeOf(event)}. Hosted by {host?.name ?? 'the club'}
            {status !== 'full' && <>. {left} of {event.capacity} places left</>}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ReserveButton event={event} className="sm:flex-1" />
        <Button asChild variant="ghost" className="sm:flex-1">
          <Link to={`/events#event-${event.id}`}>
            View details <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function WelcomeBand({ next }: { next?: ClubEvent }) {
  const { member } = useAuth()
  const { garageCars } = useGarage()
  const first = member?.name.split(' ')[0] ?? 'there'

  const service = garageCars
    .map(({ entry, car }) => ({ car, date: nextServiceDate(entry, car) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  const serviceDays = service ? daysUntilDate(service.date) : null

  return (
    <section className="field-verde relative overflow-hidden border-b border-line" aria-labelledby="welcome-title">
      <Tachometer className="pointer-events-none absolute -bottom-48 -left-32 hidden h-[420px] w-[420px] text-champagne opacity-[0.1] sm:block" />
      <div className="enter relative mx-auto grid max-w-[1440px] gap-10 px-6 pt-28 pb-14 md:px-10 md:pt-36 lg:grid-cols-12 lg:items-end lg:pb-20">
        <div className="lg:col-span-6">
          <p className="text-label text-smoke">{fmtLong(new Date())}</p>
          <h1 id="welcome-title" className="type-display mt-3 text-[clamp(3rem,7vw,5.5rem)] text-ivory">
            Welcome back, {first}
          </h1>
          {/* A quiet garage summary in place of the old stat tiles */}
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-label">
            <div>
              <dt className="text-smoke">Your garage</dt>
              <dd className="mt-0.5 text-ivory">
                {garageCars.length ? garageCars.map(({ car }) => `${car.make} ${car.model}`).join(' and ') : <Link to="/garage" className="text-teal-bright underline-offset-4 hover:underline">Add your first car</Link>}
              </dd>
            </div>
            {service && (
              <div>
                <dt className="text-smoke">Next service</dt>
                <dd className="mt-0.5 text-ivory">
                  <Link to="/#service" className="underline-offset-4 hover:underline">
                    {service.car.model}, {fmtDay(service.date)}
                  </Link>
                  {serviceDays !== null && serviceDays < 0 && <span className="ml-2 text-[#f08a7f]">overdue</span>}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="lg:col-span-6">
          {next ? (
            <NextEvent event={next} />
          ) : (
            <div className="panel p-6 md:p-8">
              <p className="eyebrow">Your next club event</p>
              <p className="type-display mt-3 text-3xl text-ivory">Nothing on the calendar yet</p>
              <p className="mt-2 text-smoke">The committee posts new dates here first.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
