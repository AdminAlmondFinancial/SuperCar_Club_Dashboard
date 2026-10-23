import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/ui/section-header'
import { nextServiceDate, useGarage } from '@/lib/garage'
import { daysUntilDate, DAY_MS, fmtDay } from './dates'

export function ServiceReminders() {
  const { garageCars } = useGarage()
  const now = new Date()
  return (
    <section id="service" aria-labelledby="service-title" className="scroll-mt-28">
      <SectionHeader id="service-title" title="Service reminders" />
      {garageCars.length === 0 ? (
        <div className="panel p-6 sm:p-8">
          <Wrench className="size-6 text-champagne" aria-hidden />
          <p className="type-display mt-4 text-2xl text-ivory">Your garage is empty</p>
          <p className="mt-2 text-smoke">Add a car and we will remind you when its next service is coming up.</p>
          <Link to="/garage" className="mt-5 inline-block text-sm text-teal-bright underline-offset-4 hover:underline">
            Add a car in your garage
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {garageCars.map(({ entry, car }) => {
            const due = nextServiceDate(entry, car)
            const days = daysUntilDate(due, now)
            const start = new Date(entry.lastService).getTime()
            const progress = Math.min(1, Math.max(0, (now.getTime() - start) / (due.getTime() - start || DAY_MS)))
            const overdue = days < 0
            const soon = !overdue && days <= 30
            return (
              <li key={car.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-ivory">
                      {car.make} {car.model}
                    </p>
                    <p className="mt-0.5 text-label text-smoke">Next service {fmtDay(due)}</p>
                  </div>
                  <Badge variant={overdue ? 'signal' : soon ? 'champagne' : 'accent'}>
                    {overdue ? 'Overdue' : soon ? 'Due soon' : 'On schedule'}
                  </Badge>
                </div>
                <div
                  className="mt-4 h-1.5 overflow-hidden rounded-full bg-ivory/10"
                  role="progressbar"
                  aria-label={`Service interval elapsed for ${car.make} ${car.model}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                >
                  <div
                    className={`h-full rounded-full ${overdue ? 'bg-signal' : soon ? 'bg-champagne' : 'bg-teal'}`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-label text-smoke">
                  {overdue ? (
                    <><span className="type-spec text-ivory">{-days}</span> days past due</>
                  ) : (
                    <><span className="type-spec text-ivory">{days}</span> days to go</>
                  )}
                  , every {car.serviceIntervalMonths} months
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
