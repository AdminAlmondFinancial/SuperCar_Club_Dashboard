import { Tachometer } from '@/components/memorabilia'
import { nextServiceDate, useGarage } from '@/lib/garage'
import { useAuth } from '@/lib/auth'
import { daysUntil, fmtDay, inDays, upcomingEvents } from './dates'

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="tile px-5 py-4">
      <p className="type-spec text-3xl text-ivory">{value}</p>
      <p className="mt-1 text-[13px] text-smoke">{label}</p>
    </div>
  )
}

export function WelcomeBand() {
  const { member } = useAuth()
  const { garageCars } = useGarage()
  const first = member?.name.split(' ')[0] ?? 'there'
  const now = new Date()
  const upcoming = upcomingEvents(now)
  const next = upcoming[0]
  const nextDays = next ? daysUntil(new Date(next.date), now) : null
  const soonCount = upcoming.filter((e) => daysUntil(new Date(e.date), now) <= 45).length

  const service = garageCars
    .map(({ entry, car }) => ({ car, date: nextServiceDate(entry, car) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]

  return (
    <section className="field-verde relative overflow-hidden border-b border-line" aria-labelledby="welcome-title">
      <Tachometer className="pointer-events-none absolute -bottom-48 -left-32 hidden h-[420px] w-[420px] text-champagne opacity-[0.14] sm:block" />
      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <h1 id="welcome-title" className="type-display text-5xl text-ivory md:text-7xl">
            Welcome back, {first}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-smoke">
            {next ? (
              <>
                Your next drive with the club is <span className="text-ivory">{next.title}</span> on {fmtDay(new Date(next.date))}, {inDays(nextDays ?? 0)}.
              </>
            ) : (
              'No events are on the calendar yet. We will post the next one soon.'
            )}{' '}
            {service ? (
              <>
                The {service.car.make} {service.car.model} is due a service on <span className="text-ivory">{fmtDay(service.date)}</span>.
              </>
            ) : (
              'Add a car to your garage and we will keep track of its service dates.'
            )}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:col-span-5 lg:self-end">
          <Stat value={garageCars.length} label={garageCars.length === 1 ? 'car in your garage' : 'cars in your garage'} />
          <Stat value={soonCount} label="events in the next six weeks" />
          <Stat value={nextDays ?? '-'} label="days to your next meet" />
        </div>
      </div>
    </section>
  )
}
