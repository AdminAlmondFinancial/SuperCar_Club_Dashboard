import { Gauge, Plus, Search, Timer, Wind, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { CarRender } from '@/components/car-render'
import { Tyre } from '@/components/memorabilia'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { cars, type Car } from '@/data/cars'
import { GARAGE_LIMIT, nextServiceDate, useGarage, type GarageEntry } from '@/lib/garage'
import { cn } from '@/lib/utils'

const FILTERS = [
  { key: 'all', label: 'All cars' },
  { key: 'coupe', label: 'Coupés' },
  { key: 'gt', label: 'Grand tourers' },
  { key: 'hypercar', label: 'Hypercars' },
  { key: 'suv', label: 'SUVs' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function Bay({ entry, car, onRemove }: { entry: GarageEntry; car: Car; onRemove: () => void }) {
  const next = nextServiceDate(entry, car)
  const colourName = car.colours.find((c) => c.hex === entry.colour)?.name ?? car.colours[0].name
  return (
    <article className="panel-feature relative flex flex-col overflow-hidden" aria-labelledby={`bay-${car.id}`}>
      <div className="flex items-start justify-between gap-4 p-6 pb-0 md:p-8 md:pb-0">
        <div className="min-w-0">
          <p className="eyebrow">In your garage</p>
          <h2 id={`bay-${car.id}`} className="type-display mt-2 text-[clamp(2rem,3.4vw,2.75rem)] leading-tight text-ivory">
            {car.make} {car.model}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-label text-smoke">
            <span className="size-2.5 shrink-0 rounded-full ring-1 ring-white/20" style={{ background: entry.colour }} aria-hidden />
            {colourName}, {car.year}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove the ${car.make} ${car.model} from your garage`} title="Remove from garage">
          <X />
        </Button>
      </div>
      <Link to={`/cars/${car.id}`} className="group relative block px-4 py-2 md:px-8" aria-label={`Open the ${car.make} ${car.model} in 3D`}>
        <CarRender car={car} className="mx-auto h-52 w-full transition-transform duration-700 ease-(--ease-luxe) group-hover:scale-[1.03] md:h-64" />
      </Link>
      <dl className="mx-5 mt-auto grid grid-cols-3 gap-3 border-t border-line pt-5 md:mx-8" aria-label="Ownership">
        {[
          ['Mileage', `${entry.mileageKm.toLocaleString('en-GB')} km`],
          ['Next service', fmtDate(next)],
          ['Joined the club', fmtDate(new Date(entry.acquired))],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-caption text-smoke">{k}</dt>
            <dd className="type-spec mt-1 text-label text-ivory">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-3 p-5 sm:flex-row md:px-8 md:pb-8">
        <Button asChild variant="accent" className="sm:flex-1">
          <Link to={`/cars/${car.id}`}>Open in 3D</Link>
        </Button>
        <Button asChild variant="outline" className="sm:flex-1">
          <Link to={`/cars/${car.id}#details`}>View details</Link>
        </Button>
      </div>
    </article>
  )
}

function EmptyBay({ onFind }: { onFind: () => void }) {
  return (
    <button
      type="button"
      onClick={onFind}
      className="group relative flex min-h-[420px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[28px] border border-dashed border-line-strong p-8 text-center transition-colors hover:border-teal/60"
    >
      <Tyre className="absolute -right-16 -bottom-16 size-64 text-champagne opacity-[0.1]" />
      <span className="flex size-14 items-center justify-center rounded-full border border-line-strong text-ivory transition-colors group-hover:border-teal group-hover:text-teal-bright">
        <Plus className="size-6" strokeWidth={1.5} />
      </span>
      <span className="type-display text-2xl text-ivory">This bay is free</span>
      <span className="max-w-[30ch] text-label text-smoke">Find your car in the register below and add it to your garage.</span>
    </button>
  )
}

function Spec({ icon: Icon, value, label }: { icon: typeof Gauge; value: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-smoke" title={label}>
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
      <span className="type-spec text-caption text-ivory">{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}

function RegisterCard({ car }: { car: Car }) {
  const { entries, isFull, add } = useGarage()
  const owned = entries.some((e) => e.carId === car.id)
  return (
    <li className="panel interactive group flex flex-col overflow-hidden">
      <Link to={`/cars/${car.id}`} className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-caption text-smoke">{car.make}</p>
            <h3 className="type-display mt-1 text-[30px] leading-tight text-ivory">{car.model}</h3>
            <p className="mt-1.5 text-caption text-smoke">
              {car.year}, {car.engine}
            </p>
          </div>
          {owned && <Badge variant="accent">In your garage</Badge>}
        </div>
        <div className="relative px-3 py-2">
          <div className="absolute inset-x-8 bottom-4 h-10 rounded-full bg-teal/10 blur-2xl" aria-hidden />
          <CarRender car={car} className="relative mx-auto h-40 w-full transition-transform md:h-56 duration-700 ease-(--ease-luxe) group-hover:scale-[1.04]" />
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3.5">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Spec icon={Gauge} value={`${car.powerHp} hp`} label="Power" />
          <Spec icon={Timer} value={`${car.zeroTo100s}s`} label="0 to 100 km/h" />
          <Spec icon={Wind} value={`${car.topSpeedKmh} km/h`} label="Top speed" />
        </div>
        {!owned && (
          <Button
            size="sm"
            variant="outline"
            disabled={isFull}
            onClick={() => add(car.id)}
            aria-label={`Add the ${car.make} ${car.model} to your garage`}
            title={isFull ? `Your garage holds ${GARAGE_LIMIT} cars. Remove one to make room.` : undefined}
          >
            <Plus /> Add
          </Button>
        )}
      </div>
    </li>
  )
}

export default function GaragePage() {
  const { garageCars, remove, isFull } = useGarage()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const searchRef = useRef<HTMLInputElement>(null)
  const registerRef = useRef<HTMLElement>(null)

  const findCar = () => {
    registerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    searchRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (params.has('search')) findCar()
  }, [params])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cars.filter(
      (c) =>
        (filter === 'all' || c.body === filter) &&
        (!q || `${c.make} ${c.model} ${c.engine} ${c.year}`.toLowerCase().includes(q)),
    )
  }, [query, filter])

  const bays = Array.from({ length: GARAGE_LIMIT }, (_, i) => garageCars[i])

  return (
    <div className="field-verde min-h-dvh">
      <div className="mx-auto max-w-[1440px] pb-dock px-4 pt-28 md:px-8 md:pt-32">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="type-display text-[clamp(2.75rem,6vw,5rem)] text-ivory">Your garage</h1>
            <p className="mt-3 max-w-[56ch] text-lead text-pretty text-smoke">
              {garageCars.length === 0
                ? 'Add the cars you drive to the club, up to two. Open one to walk all the way around it in 3D.'
                : 'Your cars, ready to explore in 3D. You can keep up to two here.'}
            </p>
          </div>
        </header>

        <section aria-label="Your cars" className="grid gap-5 lg:grid-cols-2">
          {bays.map((b, i) =>
            b ? <Bay key={b.car.id} entry={b.entry} car={b.car} onRemove={() => remove(b.car.id)} /> : <EmptyBay key={`empty-${i}`} onFind={findCar} />,
          )}
        </section>

        <section ref={registerRef} aria-labelledby="register-title" className="scroll-mt-28 pt-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 id="register-title" className="type-display text-[clamp(2rem,4vw,3rem)] text-ivory">
                The club register
              </h2>
              <p className="mt-2 text-smoke">
                {isFull ? 'Your garage is full. Remove a car to add another.' : 'Search for your car and add it to a free bay.'}
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-smoke" aria-hidden />
              <Input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by make, model or engine"
                aria-label="Search cars"
                className="pl-11"
              />
            </div>
          </div>

          <div role="radiogroup" aria-label="Filter by body style" className="mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-black/40 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="radio"
                aria-checked={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'h-10 shrink-0 rounded-full px-4 text-label font-medium transition-colors duration-200',
                  filter === f.key ? 'bg-ivory text-ink' : 'text-smoke hover:text-ivory',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {results.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {results.map((c) => (
                <RegisterCard key={c.id} car={c} />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Search />}
              title={query ? `No cars match \u201c${query}\u201d` : 'No cars of this kind yet'}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setFilter('all')
                  }}
                >
                  Clear search
                </Button>
              }
            >
              Try a make such as Ferrari, or an engine such as V12.
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  )
}
