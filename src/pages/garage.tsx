import { ArrowRight, Check, Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'

import { DemoNote, Eyebrow, Photo, Reveal } from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cars, type Car } from '@/data/cars'
import { members, shows } from '@/data/members'
import { carImage } from '@/data/showroom'
import { useAuth } from '@/lib/auth'
import { GARAGE_LIMIT, nextServiceDate, useGarage, type GarageEntry } from '@/lib/garage'
import { cn } from '@/lib/utils'

const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const BODY_LABEL: Record<Car['body'], string> = { coupe: 'Coupé', gt: 'Grand tourer', hypercar: 'Supercar', suv: 'SUV' }

function colourName(car: Car, hex: string) {
  return car.colours.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.name ?? 'Custom colour'
}

function Tabs({ mine }: { mine: number }) {
  const tab = (isActive: boolean) =>
    cn('eyebrow relative pb-3 text-[11px] transition-colors', isActive ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ink' : 'text-stone hover:text-ink')
  return (
    <nav aria-label="Garage views" className="mt-10 flex gap-8 border-b border-line">
      <NavLink to="/garage" end className={({ isActive }) => tab(isActive)}>
        My Garage ({mine})
      </NavLink>
      <NavLink to="/garage/collection" className={({ isActive }) => tab(isActive)}>
        Club Collection
      </NavLink>
    </nav>
  )
}

function Header({ eyebrow, title, intro, action }: { eyebrow: string; title: string; intro: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="display rise mt-4 text-[clamp(2.8rem,6.4vw,5.4rem)]">{title}</h1>
        <p className="rise mt-3 max-w-[52ch] text-[15px] text-stone [animation-delay:80ms]">{intro}</p>
      </div>
      {action}
    </div>
  )
}

function EditForm({ entry, car, onDone }: { entry: GarageEntry; car: Car; onDone: () => void }) {
  const { update } = useGarage()
  const [mileage, setMileage] = useState(String(entry.mileageKm))
  const [lastService, setLastService] = useState(entry.lastService)
  const [colour, setColour] = useState(entry.colour)
  const today = new Date().toISOString().slice(0, 10)
  const miles = Number(mileage)
  const valid = mileage !== '' && Number.isFinite(miles) && miles >= 0 && miles <= 2_000_000 && lastService && lastService <= today
  return (
    <form
      className="mt-5 grid gap-4 border-t border-line pt-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        update(car.id, { mileageKm: Math.round(miles), lastService, colour })
        onDone()
      }}
    >
      <label className="grid gap-1.5" htmlFor={`mileage-${car.id}`}>
        <span className="eyebrow text-[10px] text-stone">Mileage (km)</span>
        <Input id={`mileage-${car.id}`} inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value.replace(/[^\d]/g, ''))} />
      </label>
      <label className="grid gap-1.5" htmlFor={`service-${car.id}`}>
        <span className="eyebrow text-[10px] text-stone">Last service</span>
        <Input id={`service-${car.id}`} type="date" max={today} value={lastService} onChange={(e) => setLastService(e.target.value)} />
      </label>
      <fieldset className="grid gap-2">
        <legend className="eyebrow mb-1.5 text-[10px] text-stone">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {car.colours.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColour(c.hex)}
              aria-pressed={colour === c.hex}
              title={c.name}
              className={cn('size-8 rounded-full ring-1 ring-line ring-offset-2 ring-offset-white transition', colour === c.hex && 'ring-2 ring-ink')}
              style={{ background: c.hex }}
            >
              <span className="sr-only">{c.name}</span>
            </button>
          ))}
        </div>
        <p className="text-[12px] text-stone">{colourName(car, colour)}</p>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!valid}>
          Save details
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function GarageCard({ entry, car }: { entry: GarageEntry; car: Car }) {
  const { remove, update, ready } = useGarage()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const img = carImage(car.id, 'light')
  return (
    <article className="flex flex-col">
      <Link to={`/cars/${car.id}`} className="photo-zoom block" aria-label={`Open the ${car.make} ${car.model} in the showroom`}>
        <Photo src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" alt={`${car.make} ${car.model}`} />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="display text-[24px] leading-tight">
            {car.make} {car.model}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-[12px] text-stone">
            {car.year}
            <span aria-hidden>·</span>
            <span className="inline-block size-2.5 rounded-full ring-1 ring-black/10" style={{ background: entry.colour }} aria-hidden />
            {colourName(car, entry.colour)}
          </p>
        </div>
        <Link to={`/cars/${car.id}`} aria-label="Open in the showroom" className="mt-1.5">
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>

      <dl className="mt-4 grid grid-cols-3 border-y border-line text-[12px]">
        {[
          ['Mileage', `${entry.mileageKm.toLocaleString('en-GB')} km`],
          ['Next service', fmtDate(nextServiceDate(entry, car))],
          ['Owned since', fmtDate(new Date(entry.acquired))],
        ].map(([k, v], i) => (
          <div key={k} className={cn('py-3', i > 0 && 'border-l border-line pl-3')}>
            <dt className="eyebrow text-[9.5px] text-stone">{k}</dt>
            <dd className="mt-1 tabular">{v}</dd>
          </div>
        ))}
      </dl>

      <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 text-[13px]" htmlFor={`share-${car.id}`}>
        <span>
          Share with the Club Collection
          <span className="block text-[12px] text-stone">{entry.shared ? 'Other members can see this car.' : 'Only you can see this car.'}</span>
        </span>
        <input
          id={`share-${car.id}`}
          type="checkbox"
          role="switch"
          checked={!!entry.shared}
          disabled={!ready}
          onChange={(e) => update(car.id, { shared: e.target.checked })}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative h-6 w-11 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>

      {editing ? (
        <EditForm entry={entry} car={car} onDone={() => setEditing(false)} />
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to={`/cars/${car.id}`} className="link-rule text-[10.5px]">
            View vehicle
          </Link>
          <button type="button" onClick={() => setEditing(true)} disabled={!ready} className="link-rule text-[10.5px] disabled:opacity-40">
            Edit details
          </button>
          {confirming ? (
            <span className="flex items-center gap-3 text-[12px]">
              Remove from your garage?
              <button type="button" onClick={() => remove(car.id)} className="link-rule text-[10.5px] text-signal">
                Remove
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="link-rule text-[10.5px] text-stone">
                Keep
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} disabled={!ready} className="link-rule text-[10.5px] text-stone disabled:opacity-40">
              Remove
            </button>
          )}
        </div>
      )}
    </article>
  )
}

function AddTile({ onClick, full }: { onClick: () => void; full: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[300px] flex-col items-center justify-center gap-3 border border-dashed border-line-strong bg-mist/50 p-8 text-center transition-colors hover:border-ink/50"
    >
      <span className="flex size-12 items-center justify-center rounded-full border border-ink/40 transition-colors group-hover:bg-ink group-hover:text-paper">
        <Plus className="size-5" strokeWidth={1.25} />
      </span>
      <span className="display text-[22px]">{full ? 'Your garage is full' : 'Add a new vehicle'}</span>
      <span className="max-w-[28ch] text-[13px] text-stone">
        {full ? `Each member keeps up to ${GARAGE_LIMIT} cars. Remove one to make room.` : 'Register a car from the club register to your collection.'}
      </span>
    </button>
  )
}

function Register({ onClose }: { onClose: () => void }) {
  const { entries, isFull, add, ready } = useGarage()
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    ref.current?.querySelector('input')?.focus({ preventScroll: true })
  }, [])
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cars.filter((c) => !q || `${c.make} ${c.model} ${c.engine} ${c.year}`.toLowerCase().includes(q))
  }, [query])
  return (
    <section ref={ref} aria-labelledby="register-title" className="mt-16 scroll-mt-24 border-t border-ink pt-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow>Add a vehicle</Eyebrow>
          <h2 id="register-title" className="display mt-3 text-[clamp(1.9rem,3vw,2.6rem)]">
            The club register
          </h2>
          <p className="mt-2 text-[14px] text-stone">
            {isFull ? `Your garage holds ${GARAGE_LIMIT} cars. Remove one to add another.` : 'Choose your car. You can set its mileage, service date and colour afterwards.'}
          </p>
        </div>
        <div className="flex w-full max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone" aria-hidden />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search make, model or engine" aria-label="Search the register" className="pl-10" />
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close the register">
            <X />
          </Button>
        </div>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-5">
        {list.map((car) => {
          const owned = entries.some((e) => e.carId === car.id)
          const img = carImage(car.id, 'light')
          return (
            <li key={car.id} className="flex flex-col">
              <Photo src={img.src} srcSet={img.srcSet} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw" alt={`${car.make} ${car.model}`} />
              <p className="display mt-3 text-[18px] leading-tight">
                {car.make} {car.model}
              </p>
              <p className="mt-1 text-[12px] text-stone">
                {car.year} · {BODY_LABEL[car.body]}
              </p>
              <div className="mt-3">
                {owned ? (
                  <span className="eyebrow inline-flex h-10 items-center gap-2 text-[10.5px]">
                    <Check className="size-3.5" /> In your garage
                  </span>
                ) : (
                  <Button size="sm" variant="outline" disabled={isFull || !ready} onClick={() => add(car.id)} aria-label={`Add the ${car.make} ${car.model} to your garage`}>
                    <Plus /> Add
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {!list.length && <p className="mt-8 text-[14px] text-stone">No cars match &ldquo;{query}&rdquo;. Try a make such as Ferrari, or an engine such as V12.</p>}
    </section>
  )
}

function MyGarage() {
  const { garageCars, isFull, ready } = useGarage()
  const { previewMode } = useAuth()
  const [params, setParams] = useSearchParams()
  const registering = params.has('add')
  const openRegister = () => setParams({ add: '1' }, { replace: true })
  const closeRegister = () => setParams({}, { replace: true })

  return (
    <>
      <Header
        eyebrow="Your private collection"
        title="The Garage."
        intro="Manage, view and explore your vehicles. Open one to see it in the showroom, in 3D."
        action={
          <Button variant="outline" size="sm" onClick={openRegister} disabled={isFull}>
            <Plus /> Add vehicle
          </Button>
        }
      />
      <Tabs mine={garageCars.length} />
      {!ready && !previewMode && <p className="mt-8 text-[14px] text-stone">Loading your garage&hellip;</p>}
      <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {garageCars.map((g, i) => (
          <Reveal key={g.car.id} delay={i * 90}>
            <GarageCard entry={g.entry} car={g.car} />
          </Reveal>
        ))}
        {ready && <AddTile onClick={openRegister} full={isFull} />}
      </div>
      {previewMode && (
        <DemoNote className="mt-10">Preview session: your garage is saved in this browser. Signed-in members&rsquo; garages are saved to the club&rsquo;s server.</DemoNote>
      )}
      {registering && <Register onClose={closeRegister} />}
    </>
  )
}

type CollectionItem = { car: Car; owner: string; colour: string; yours?: boolean }

function Collection() {
  const { garageCars } = useGarage()
  const { member } = useAuth()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [make, setMake] = useState('all')
  const [body, setBody] = useState<'all' | Car['body']>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (params.has('search')) searchRef.current?.focus()
  }, [params])

  const items = useMemo<CollectionItem[]>(() => {
    const shared = garageCars.filter((g) => g.entry.shared).map((g) => ({ car: g.car, owner: member?.name ?? 'You', colour: g.entry.colour, yours: true }))
    const others = members.filter((m) => shows(m, 'cars')).flatMap((m) =>
      m.carIds.flatMap((id) => {
        const car = cars.find((c) => c.id === id)
        return car ? [{ car, owner: m.name, colour: m.carColours[id] ?? car.colours[0].hex }] : []
      }),
    )
    return [...shared, ...others]
  }, [garageCars, member])

  const makes = useMemo(() => [...new Set(cars.map((c) => c.make))].sort(), [])
  const visible = items.filter((it) => {
    const q = query.trim().toLowerCase()
    return (
      (make === 'all' || it.car.make === make) &&
      (body === 'all' || it.car.body === body) &&
      (!q || `${it.car.make} ${it.car.model} ${it.owner} ${it.car.year}`.toLowerCase().includes(q))
    )
  })

  const select = 'h-11 border border-line bg-white px-3 text-[13px] text-ink outline-none focus-visible:border-ink'

  return (
    <>
      <Header
        eyebrow="Shared by members"
        title="The Collection."
        intro="Extraordinary cars from our community. Members choose which of their cars appear here."
      />
      <Tabs mine={garageCars.length} />
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <Input ref={searchRef} id="collection-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the collection" aria-label="Search the collection" className="pl-10" />
        </div>
        <select id="collection-make" aria-label="Filter by make" value={make} onChange={(e) => setMake(e.target.value)} className={select}>
          <option value="all">All makes</option>
          {makes.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select id="collection-body" aria-label="Filter by body style" value={body} onChange={(e) => setBody(e.target.value as typeof body)} className={select}>
          <option value="all">All body styles</option>
          {(Object.keys(BODY_LABEL) as Car['body'][]).map((b) => (
            <option key={b} value={b}>
              {BODY_LABEL[b]}
            </option>
          ))}
        </select>
        <p className="text-[12px] text-stone tabular sm:ml-auto">
          {visible.length} of {items.length} vehicles
        </p>
      </div>

      {visible.length ? (
        <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((it, i) => {
            const img = carImage(it.car.id, 'light')
            return (
              <Reveal as="li" key={`${it.owner}-${it.car.id}`} delay={(i % 3) * 80}>
                <Link to={`/cars/${it.car.id}`} className="photo-zoom group block">
                  <Photo src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" alt={`${it.car.make} ${it.car.model}`} />
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="display text-[22px] leading-tight">
                        {it.car.make} {it.car.model}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-[12px] text-stone">
                        {it.car.year}
                        <span aria-hidden>·</span>
                        <span className="inline-block size-2.5 rounded-full ring-1 ring-black/10" style={{ background: it.colour }} aria-hidden />
                        {it.yours ? 'Shared by you' : it.owner}
                      </p>
                    </div>
                    <ArrowRight className="mt-1.5 size-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      ) : (
        <div className="mt-10 border border-line bg-white px-6 py-14 text-center">
          <p className="display text-[26px]">No vehicles match</p>
          <p className="mt-2 text-[14px] text-stone">Try another make or clear the search.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={() => {
              setQuery('')
              setMake('all')
              setBody('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      <DemoNote className="mt-12">Other members&rsquo; cars are sample entries from the demo member directory. Cars you share from your garage appear here too.</DemoNote>
    </>
  )
}

export default function GaragePage() {
  const { pathname } = useLocation()
  const collection = pathname.startsWith('/garage/collection')
  return <div className="page-gutter mx-auto max-w-[1520px] pt-28 pb-24 lg:pt-36">{collection ? <Collection /> : <MyGarage />}</div>
}
