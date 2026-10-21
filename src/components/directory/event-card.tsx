import { Check, Gauge, MapPin, Route } from 'lucide-react'

import { AttendeeStack } from '@/components/directory/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { eventKindLabel, type ClubEvent } from '@/data/events'
import { memberById } from '@/data/members'
import { cn } from '@/lib/utils'

const kindVariant = { drive: 'accent', meet: 'default', track: 'champagne', social: 'default' } as const

export function DateBlock({ iso, large }: { iso: string; large?: boolean }) {
  const d = new Date(iso)
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center justify-center rounded-[18px] border border-line-strong bg-ivory/[0.04] text-center',
        large ? 'size-24' : 'size-[72px]',
      )}
    >
      <span className="text-xs text-smoke">{d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span>
      <span className={cn('type-spec leading-none text-ivory', large ? 'text-4xl' : 'text-2xl')}>
        {d.toLocaleDateString('en-GB', { day: 'numeric', timeZone: 'UTC' })}
      </span>
      <span className="mt-0.5 text-xs text-smoke">{d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}</span>
    </div>
  )
}

function timeOf(e: ClubEvent) {
  const f = (s: string) => new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
  return e.endDate ? `${f(e.date)} to ${f(e.endDate)}` : `from ${f(e.date)}`
}

export function useEventFacts(event: ClubEvent, going: boolean) {
  const host = memberById(event.hostId)
  const total = event.attendeeIds.length + (going ? 1 : 0)
  const left = Math.max(event.capacity - total, 0)
  const shown = event.attendeeIds.slice(0, going ? 4 : 5).map((id) => memberById(id)?.initials ?? '?')
  if (going) shown.unshift('You')
  return { host, total, left, shown, extra: Math.max(total - shown.length, 0) }
}

function ReserveButton({ event, going, onToggle, full, size }: { event: ClubEvent; going: boolean; onToggle: () => void; full: boolean; size?: 'default' | 'lg' }) {
  return (
    <Button
      size={size}
      variant={going ? 'outline' : 'accent'}
      onClick={onToggle}
      aria-pressed={going}
      disabled={full && !going}
      className={cn(going && 'border-teal/50 text-teal-bright')}
      aria-label={going ? `You're going to ${event.title}. Select to cancel.` : `Reserve your place at ${event.title}`}
    >
      {going ? (
        <>
          <Check /> You&apos;re going
        </>
      ) : full ? (
        'Fully booked'
      ) : (
        'Reserve your place'
      )}
    </Button>
  )
}

export function FeaturedEvent({ event, going, onToggle }: { event: ClubEvent; going: boolean; onToggle: () => void }) {
  const { host, left, shown, extra, total } = useEventFacts(event, going)
  return (
    <article className="panel-feature overflow-hidden p-6 md:p-10" aria-labelledby={`ev-${event.id}`}>
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-teal/15 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
        <DateBlock iso={event.date} large />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="champagne">Next up</Badge>
            <Badge variant={kindVariant[event.kind]}>{eventKindLabel(event.kind)}</Badge>
          </div>
          <h3 id={`ev-${event.id}`} className="type-display mt-4 text-3xl md:text-5xl">
            {event.title}
          </h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-smoke">{event.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="tile p-4">
              <dt className="flex items-center gap-1.5 text-xs text-smoke"><MapPin className="size-3.5" /> Where</dt>
              <dd className="mt-1 text-sm text-ivory">{event.venue}</dd>
              <dd className="text-xs text-smoke">{event.region}</dd>
            </div>
            <div className="tile p-4">
              <dt className="text-xs text-smoke">Time</dt>
              <dd className="type-spec mt-1 text-sm text-ivory">{timeOf(event)}</dd>
              {event.dressCode && <dd className="mt-0.5 text-xs text-smoke">{event.dressCode}</dd>}
            </div>
            <div className="tile p-4">
              <dt className="flex items-center gap-1.5 text-xs text-smoke"><Route className="size-3.5" /> Route</dt>
              <dd className="type-spec mt-1 text-xl text-ivory">{event.routeKm ? `${event.routeKm} km` : 'Not a drive'}</dd>
            </div>
            <div className="tile p-4">
              <dt className="flex items-center gap-1.5 text-xs text-smoke"><Gauge className="size-3.5" /> Spots left</dt>
              <dd className="type-spec mt-1 text-xl text-ivory">{left}</dd>
              <dd className="text-xs text-smoke">of {event.capacity}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AttendeeStack initials={shown} extra={extra} label={`${total} members are going`} />
              <p className="text-sm text-smoke">Hosted by {host?.name ?? 'the club'}</p>
            </div>
            <ReserveButton event={event} going={going} onToggle={onToggle} full={left === 0} size="lg" />
          </div>
        </div>
      </div>
    </article>
  )
}

export function EventRow({ event, going, onToggle }: { event: ClubEvent; going: boolean; onToggle: () => void }) {
  const { host, left, shown, extra, total } = useEventFacts(event, going)
  return (
    <article className="panel p-5 transition-colors duration-300 hover:border-line-strong md:p-6" aria-labelledby={`ev-${event.id}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
        <div className="flex items-start gap-4 md:contents">
          <DateBlock iso={event.date} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={kindVariant[event.kind]}>{eventKindLabel(event.kind)}</Badge>
              {event.routeKm && <span className="type-spec text-xs text-smoke">{event.routeKm} km route</span>}
            </div>
            <h3 id={`ev-${event.id}`} className="type-display mt-2 text-2xl">
              {event.title}
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-smoke">
              <MapPin className="size-3.5 shrink-0" /> {event.venue}, {event.region}
            </p>
            <p className="mt-1 text-sm text-smoke">Hosted by {host?.name ?? 'the club'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 md:w-auto md:flex-col md:items-end md:gap-3">
          <div className="flex items-center gap-3">
            <AttendeeStack initials={shown} extra={extra} label={`${total} members are going`} />
          </div>
          <p className="text-sm text-smoke">
            <span className="type-spec text-ivory">{left}</span> spots left
          </p>
        </div>
        <ReserveButton event={event} going={going} onToggle={onToggle} full={left === 0} />
      </div>
    </article>
  )
}
