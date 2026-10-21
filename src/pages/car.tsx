import { ArrowLeft, Check, ChevronLeft, ChevronRight, Hand, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { Piston } from '@/components/memorabilia'
import { Button } from '@/components/ui/button'
import { CarViewer } from '@/components/viewer/car-viewer'
import { cars } from '@/data/cars'
import { GARAGE_LIMIT, useGarage } from '@/lib/garage'
import { cn } from '@/lib/utils'

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })

export default function CarPage() {
  const { carId } = useParams()
  const car = cars.find((c) => c.id === carId)
  const { entries, add, update, isFull } = useGarage()
  const entry = entries.find((e) => e.carId === carId)

  const [hotspot, setHotspot] = useState<string | null>(null)
  const [localColour, setLocalColour] = useState<string | null>(null)
  const [factIndex, setFactIndex] = useState(0)

  const colour = entry?.colour ?? localColour ?? car?.colours[0].hex ?? '#888'
  const active = useMemo(() => car?.hotspots.find((h) => h.id === hotspot) ?? null, [car, hotspot])

  if (!car) return <Navigate to="/garage" replace />

  const pickColour = (hex: string) => (entry ? update(car.id, { colour: hex }) : setLocalColour(hex))

  const tiles = [
    { label: 'Power', value: `${car.powerHp}`, unit: 'hp' },
    { label: 'Torque', value: `${car.torqueNm}`, unit: 'Nm' },
    { label: '0 to 100 km/h', value: `${car.zeroTo100s}`, unit: 'sec' },
    { label: 'Top speed', value: `${car.topSpeedKmh}`, unit: 'km/h' },
    { label: 'Weight', value: car.weightKg.toLocaleString('en-GB'), unit: 'kg' },
    { label: 'Price when new', value: gbp.format(car.priceGbp), unit: '' },
  ]

  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink">
      {/* Make name as a watermark behind the stage, as the Mercedes reference does with its star */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[34vh] flex justify-center overflow-hidden md:top-[30vh]">
        <span className="type-display text-[clamp(8rem,22vw,22rem)] leading-none whitespace-nowrap text-ivory/[0.03]">{car.make}</span>
      </div>
      <div aria-hidden className="absolute inset-x-0 top-0 h-[80vh] bg-[radial-gradient(70%_60%_at_50%_45%,rgba(58,155,138,0.16),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1440px] pb-dock px-4 pt-24 md:px-8 md:pt-28">
        <Link to="/garage" className="-ml-2 inline-flex h-10 items-center gap-2 rounded-full px-2 text-label text-smoke transition-colors hover:text-ivory">
          <ArrowLeft className="size-4" aria-hidden /> Back to garage
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="eyebrow">{entry ? 'Your collection' : 'Club register'}</p>
            <h1 className="type-display mt-2 text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[0.95] text-ivory">
              {car.make} {car.model}
            </h1>
            <p className="mt-3 text-lead text-smoke">
              {car.year}, {car.engine}
            </p>
          </div>
          {entry ? (
            <span className="inline-flex h-11 items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-5 text-label text-teal-bright">
              <Check className="size-4" /> In your garage
            </span>
          ) : (
            <Button
              variant="default"
              disabled={isFull}
              onClick={() => add(car.id)}
              title={isFull ? `Your garage holds ${GARAGE_LIMIT} cars. Remove one to make room.` : undefined}
            >
              <Plus /> {isFull ? 'Garage full' : 'Add to my garage'}
            </Button>
          )}
        </div>

        {/* Stage: modes, viewer, facts */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative">
            <div className="relative h-[44vh] min-h-[300px] w-full md:h-[64vh]">
              <CarViewer car={car} colour={colour} activeHotspot={hotspot} onHotspot={setHotspot} className="!absolute inset-0" />
            </div>
            <div role="group" aria-label="Features" className="mt-3 flex flex-wrap justify-center gap-2">
              {car.hotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  aria-pressed={hotspot === h.id}
                  onClick={() => setHotspot(hotspot === h.id ? null : h.id)}
                  className={cn(
                    'h-10 rounded-full border px-4 text-label transition-colors duration-200',
                    hotspot === h.id ? 'border-teal bg-teal text-ink' : 'border-line-strong text-smoke hover:text-ivory',
                  )}
                >
                  {h.label}
                </button>
              ))}
            </div>
            <p className="pointer-events-none mt-3 flex items-center justify-center gap-2 text-center text-caption text-smoke">
              <Hand className="size-3.5" strokeWidth={1.75} aria-hidden />
              Drag to walk around the car. Scroll or pinch to zoom.
            </p>
          </div>

          <aside className="flex flex-col gap-4 lg:pt-10">
            <div className="rounded-[24px] bg-ivory p-6 text-ink">
              <p className="text-caption font-medium text-ink/70">{active ? 'Up close' : 'Did you know'}</p>
              <h2 className="type-display mt-2 text-[26px] leading-tight">{active ? active.label : car.tagline}</h2>
              <p className="mt-3 text-label leading-relaxed text-ink/80">{active ? active.detail : car.facts[factIndex]}</p>
              {!active && (
                <div className="mt-5 flex items-center justify-between">
                  <span className="type-spec text-caption text-ink/65">
                    {factIndex + 1} of {car.facts.length}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      aria-label="Previous fact"
                      onClick={() => setFactIndex((i) => (i - 1 + car.facts.length) % car.facts.length)}
                      className="flex size-10 items-center justify-center rounded-full border border-ink/15 hover:bg-ink/5"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next fact"
                      onClick={() => setFactIndex((i) => (i + 1) % car.facts.length)}
                      className="flex size-10 items-center justify-center rounded-full border border-ink/15 hover:bg-ink/5"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
              {active && (
                <button type="button" onClick={() => setHotspot(null)} className="mt-5 h-10 text-label font-medium underline underline-offset-4">
                  Back to facts
                </button>
              )}
            </div>

            <div className="panel p-5">
              <p className="text-caption text-smoke">Engine</p>
              <p className="mt-1 text-ivory">{car.engine}</p>
              <p className="mt-3 text-caption text-smoke">Gearbox and drive</p>
              <p className="mt-1 text-ivory">
                {car.transmission}, {car.drivetrain}
              </p>
            </div>
          </aside>
        </div>

        {/* Specifications, grouped; the garage's "View details" lands here */}
        <section id="details" aria-labelledby="highlights" className="mt-12 scroll-mt-28">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 id="highlights" className="type-display text-[clamp(2rem,3.4vw,2.75rem)] text-ivory">
              Performance
            </h2>
            <div className="flex items-center gap-3" role="radiogroup" aria-label="Paint colour">
              <span className="text-sm text-smoke">{car.colours.find((c) => c.hex === colour)?.name ?? 'Colour'}</span>
              {car.colours.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  role="radio"
                  aria-checked={colour === c.hex}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => pickColour(c.hex)}
                  className={cn(
                    'size-7 rounded-full ring-offset-2 ring-offset-ink transition-shadow',
                    colour === c.hex ? 'ring-2 ring-ivory' : 'ring-1 ring-white/20 hover:ring-white/50',
                  )}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:px-0 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
            {tiles.map((t) => (
              <li key={t.label} className="tile min-w-[160px] shrink-0 snap-start p-5">
                <p className="text-caption text-smoke">{t.label}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="type-spec text-[30px] leading-none text-ivory">{t.value}</span>
                  {t.unit && <span className="text-caption text-smoke">{t.unit}</span>}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* All ten facts */}
        <section aria-labelledby="facts" className="relative mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Piston className="pointer-events-none absolute -bottom-10 -left-10 hidden size-64 text-champagne opacity-[0.1] lg:block" />
          <h2 id="facts" className="type-display text-[clamp(2rem,3.4vw,2.75rem)] text-ivory">
            Ten things to know about the {car.model}
          </h2>
          <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {car.facts.map((f, i) => (
              <li key={f} className="flex gap-4 border-t border-line pt-4">
                <span className="type-spec text-caption text-champagne">{String(i + 1).padStart(2, '0')}</span>
                <p className="leading-relaxed text-ivory/90">{f}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-16 max-w-3xl text-caption text-smoke">
          {car.id === 'ferrari-458-italia'
            ? 'Ferrari 458 model by vicent091036 on Sketchfab, as distributed with the three.js examples.'
            : 'Stylised model built from the car’s published dimensions. Figures are manufacturer claims and may vary by market.'}
        </p>
      </div>
    </div>
  )
}
