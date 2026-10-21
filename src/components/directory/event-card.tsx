import { Check, Clock, MapPin, Route, Users } from 'lucide-react'

import { AttendeeStack } from '@/components/directory/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { eventKindLabel, type ClubEvent } from '@/data/events'
import { memberById } from '@/data/members'
import { CLUB_TIME_ZONE, fmtTime } from '@/lib/dates'
import { eventStatus, useRsvp, type EventStatus } from '@/lib/rsvp'
import { cn } from '@/lib/utils'

export function DateBlock({ iso, large }: { iso: string; large?: boolean }) {
  const d = new Date(iso)
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center justify-center rounded-[18px] border border-line-strong bg-ivory/[0.04] text-center',
        large ? 'size-24' : 'size-[72px]',
      )}
    >
      <span className="text-caption text-smoke">{d.toLocaleDateString('en-GB', { month: 'short', timeZone: CLUB_TIME_ZONE })}</span>
      <span className={cn('type-spec leading-none text-ivory', large ? 'text-4xl' : 'text-2xl')}>
        {d.toLocaleDateString('en-GB', { day: 'numeric', timeZone: CLUB_TIME_ZONE })}
      </span>
      <span className="mt-0.5 text-caption text-smoke">{d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: CLUB_TIME_ZONE })}</span>
    </div>
  )
}

export function timeOf(e: ClubEvent) {
  const f = (s: string) => fmtTime(new Date(s))
  return e.endDate ? `${f(e.date)} to ${f(e.endDate)}` : `From ${f(e.date)}`
}

export function useEventFacts(event: ClubEvent) {
  const { isGoing, toggle } = useRsvp()
  const going = isGoing(event.id)
  const host = memberById(event.hostId)
  const total = event.attendeeIds.length + (going ? 1 : 0)
  const left = Math.max(event.capacity - total, 0)
  const shown = event.attendeeIds.slice(0, going ? 4 : 5).map((id) => memberById(id)?.initials ?? '?')
  if (going) shown.unshift('You')
  const status = eventStatus(event, going)
  return { going, toggle: () => toggle(event.id), status, host, total, left, shown, extra: Math.max(total - shown.length, 0) }
}

const STATUS: Record<EventStatus, { label: string; variant: 'accent' | 'default' | 'signal' | 'outline' }> = {
  reserved: { label: 'Reserved', variant: 'accent' },
  available: { label: 'Available', variant: 'default' },
  full: { label: 'Full', variant: 'signal' },
  past: { label: 'Past', variant: 'outline' },
}

export function StatusChip({ status }: { status: EventStatus }) {
  const { label, variant } = STATUS[status]
  return (
    <Badge variant={variant}>
      {status === 'reserved' && <Check className="size-3.5" aria-hidden />}
      {label}
    </Badge>
  )
}

export function ReserveButton({ event, size, className }: { event: ClubEvent; size?: 'default' | 'lg'; className?: string }) {
  const { going, toggle, status } = useEventFacts(event)
  if (status === 'past') return null
  return (
    <Button
      size={size}
      variant={going ? 'outline' : 'accent'}
      onClick={toggle}
      aria-pressed={going}
      disabled={status === 'full'}
      className={cn(going && 'border-teal/50 text-teal-bright', className)}
      aria-label={going ? `Cancel your place at ${event.title}` : `Reserve your place at ${event.title}`}
    >
      {going ? 'Cancel reservation' : status === 'full' ? 'Fully booked' : 'Reserve your place'}
    </Button>
  )
}

export function FeaturedEvent({ event, eyebrow = 'Featured event' }: { event: ClubEvent; eyebrow?: string }) {
  const { host, left, shown, extra, total, status } = useEventFacts(event)
  return (
    <article id={`event-${event.id}`} className="panel-feature scroll-mt-28 overflow-hidden p-6 md:p-10" aria-labelledby={`ev-${event.id}`}>
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-teal/15 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
        <DateBlock iso={event.date} large />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{eyebrow}</p>
          <h3 id={`ev-${event.id}`} className="type-display mt-3 text-[clamp(2rem,4vw,3rem)]">
            {event.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusChip status={status} />
            <Badge variant="outline">{eventKindLabel(event.kind)}</Badge>
          </div>
          <p className="mt-5 max-w-2xl leading-relaxed text-smoke">{event.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="tile p-4">
              <dt className="flex items-center gap-1.5 text-caption text-smoke"><MapPin className="size-3.5" aria-hidden /> Where</dt>
              <dd className="mt-1 text-label text-ivory">{event.venue}</dd>
              <dd className="text-caption text-smoke">{event.region}</dd>
            </div>
            <div className="tile p-4">
              <dt className="flex items-center gap-1.5 text-caption text-smoke"><Clock className="size-3.5" aria-hidden /> Time</dt>
              <dd className="type-spec mt-1 text-label text-ivory">{timeOf(event)}</dd>
              {event.dressCode && <dd className="mt-0.5 text-caption text-smoke">{event.dressCode}</dd>}
            </div>
            <div className="tile p-4">
              <dt className="flex items-center gap-1.5 text-caption text-smoke"><Route className="size-3.5" aria-hidden /> Route</dt>
              <dd className="type-spec mt-1 text-xl text-ivory">{event.routeKm ? `${event.routeKm} km` : 'Not a drive'}</dd>
            </div>
            <div className="tile p-4">
              <dt className="flex items-center gap-1.5 text-caption text-smoke"><Users className="size-3.5" aria-hidden /> Places left</dt>
              <dd className="type-spec mt-1 text-xl text-ivory">{left}</dd>
              <dd className="text-caption text-smoke">of {event.capacity}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AttendeeStack initials={shown} extra={extra} label={`${total} members are going`} />
              <p className="text-label text-smoke">Hosted by {host?.name ?? 'the club'}</p>
            </div>
            <ReserveButton event={event} size="lg" />
          </div>
        </div>
      </div>
    </article>
  )
}

export function EventRow({ event }: { event: ClubEvent }) {
  const { host, left, shown, extra, total, status } = useEventFacts(event)
  return (
    <article id={`event-${event.id}`} className="panel interactive scroll-mt-28 p-5 md:p-6" aria-labelledby={`ev-${event.id}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
        <div className="flex items-start gap-4 md:contents">
          <DateBlock iso={event.date} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status={status} />
              <Badge variant="outline">{eventKindLabel(event.kind)}</Badge>
            </div>
            <h3 id={`ev-${event.id}`} className="type-display mt-2.5 text-[28px] leading-tight">
              {event.title}
            </h3>
            <p className="mt-1.5 flex items-start gap-1.5 text-label text-smoke">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {event.venue}, {event.region}
            </p>
            <p className="mt-1 text-label text-smoke">
              {timeOf(event)}
              {event.routeKm ? `, ${event.routeKm} km route` : ''}. Hosted by {host?.name ?? 'the club'}
            </p>
            <p className="mt-3 line-clamp-2 max-w-2xl text-label leading-relaxed text-ivory/80">{event.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 md:w-48 md:shrink-0 md:flex-col md:items-end md:gap-3">
          <div className="flex flex-col gap-2 md:items-end">
            <AttendeeStack initials={shown} extra={extra} label={`${total} members are going`} />
            {status !== 'past' && (
              <p className="text-label text-smoke">
                <span className="type-spec text-ivory">{left}</span> of {event.capacity} places left
              </p>
            )}
          </div>
          <ReserveButton event={event} />
        </div>
      </div>
    </article>
  )
}
