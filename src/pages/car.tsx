import { ArrowLeft, Check, ChevronLeft, ChevronRight, Cog, Hand, Plus, Armchair, Car as CarIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { Piston } from '@/components/memorabilia'
import { Button } from '@/components/ui/button'
import { CarViewer, type ViewMode } from '@/components/viewer/car-viewer'
import { cars } from '@/data/cars'
import { GARAGE_LIMIT, useGarage } from '@/lib/garage'
import { cn } from '@/lib/utils'

const MODES: { key: ViewMode; label: string; icon: typeof CarIcon; hint: string }[] = [
  { key: 'exterior', label: 'Exterior', icon: CarIcon, hint: 'Drag to walk around the car. Scroll or pinch to zoom.' },
  { key: 'interior', label: 'Interior', icon: Armchair, hint: 'The roof lifts away so you can see the cabin. Drag to look around.' },
  { key: 'engine', label: 'Engine', icon: Cog, hint: 'The body turns to glass so you can see the drivetrain. Drag to orbit.' },
]

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })

export default function CarPage() {
  const { carId } = useParams()
  const car = cars.find((c) => c.id === carId)
  const { entries, add, update, isFull } = useGarage()
  const entry = entries.find((e) => e.carId === carId)

  const [mode, setMode] = useState<ViewMode>('exterior')
  const [hotspot, setHotspot] = useState<string | null>(null)
  const [localColour, setLocalColour] = useState<string | null>(null)
  const [factIndex, setFactIndex] = useState(0)

  const colour = entry?.colour ?? localColour ?? car?.colours[0].hex ?? '#888'
  const active = useMemo(() => car?.hotspots[mode].find((h) => h.id === hotspot) ?? null, [car, mode, hotspot])

  if (!car) return <Navigate to="/garage" replace />

  const pickColour = (hex: string) => (entry ? update(car.id, { colour: hex }) : setLocalColour(hex))
  const switchMode = (m: ViewMode) => {
    setMode(m)
    setHotspot(null)
  }
  const currentMode = MODES.find((m) => m.key === mode)!

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
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 flex justify-center overflow-hidden">
        <span className="type-display text-[clamp(8rem,22vw,22rem)] leading-none whitespace-nowrap text-ivory/[0.03]">{car.make}</span>
      </div>
      <div aria-hidden className="absolute inset-x-0 top-0 h-[80vh] bg-[radial-gradient(70%_60%_at_50%_45%,rgba(58,155,138,0.16),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1440px] px-4 pt-24 pb-32 md:px-8 md:pt-28">
        <Link to="/garage" className="inline-flex items-center gap-2 text-sm text-smoke hover:text-ivory">
          <ArrowLeft className="size-4" /> Garage
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="type-display text-[clamp(2.75rem,6vw,5.5rem)] text-ivory">{car.make}</h1>
            <p className="mt-2 text-[17px] text-smoke">
              {car.model}, {car.year}
            </p>
          </div>
          {entry ? (
            <span className="inline-flex h-11 items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-5 text-sm text-teal-bright">
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
        <div className="mt-6 grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)_300px]">
          <nav aria-label="View" className="flex gap-2 lg:flex-col lg:pt-10">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchMode(key)}
                aria-pressed={mode === key}
                className={cn(
                  'flex h-11 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-300 lg:flex-none lg:justify-start',
                  mode === key ? 'border-ivory bg-ivory text-ink' : 'border-line-strong text-smoke hover:text-ivory',
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </nav>

          <div className="relative">
            <div className="relative h-[52vh] min-h-[340px] w-full md:h-[60vh]">
              <CarViewer car={car} colour={colour} mode={mode} activeHotspot={hotspot} onHotspot={setHotspot} className="!absolute inset-0" />
            </div>
            <p className="pointer-events-none mt-2 flex items-center justify-center gap-2 text-center text-[13px] text-smoke">
              <Hand className="size-3.5" strokeWidth={1.75} aria-hidden />
              {currentMode.hint}
            </p>
          </div>

          <aside className="flex flex-col gap-4 lg:pt-10">
            <div className="rounded-[24px] bg-ivory p-6 text-ink">
              <p className="text-[13px] text-ink/60">{active ? currentMode.label : 'Did you know'}</p>
              <h2 className="type-display mt-2 text-[26px] leading-tight">{active ? active.label : car.tagline}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink/75">{active ? active.detail : car.facts[factIndex]}</p>
              {!active && (
                <div className="mt-5 flex items-center justify-between">
                  <span className="type-spec text-[12px] text-ink/50">
                    {factIndex + 1} of {car.facts.length}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      aria-label="Previous fact"
                      onClick={() => setFactIndex((i) => (i - 1 + car.facts.length) % car.facts.length)}
                      className="flex size-8 items-center justify-center rounded-full border border-ink/15 hover:bg-ink/5"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next fact"
                      onClick={() => setFactIndex((i) => (i + 1) % car.facts.length)}
                      className="flex size-8 items-center justify-center rounded-full border border-ink/15 hover:bg-ink/5"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
              {active && (
                <button type="button" onClick={() => setHotspot(null)} className="mt-5 text-[13px] font-medium underline underline-offset-4">
                  Back to facts
                </button>
              )}
            </div>

            <div className="panel p-5">
              <p className="text-[13px] text-smoke">Engine</p>
              <p className="mt-1 text-ivory">{car.engine}</p>
              <p className="mt-3 text-[13px] text-smoke">Gearbox and drive</p>
              <p className="mt-1 text-ivory">
                {car.transmission}, {car.drivetrain}
              </p>
            </div>
          </aside>
        </div>

        {/* Feature highlights, after the Mercedes reference */}
        <section aria-labelledby="highlights" className="mt-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 id="highlights" className="type-display text-[32px] text-ivory">
              Feature highlights
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
                <p className="text-[13px] text-smoke">{t.label}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="type-spec text-[30px] leading-none text-ivory">{t.value}</span>
                  {t.unit && <span className="text-[13px] text-smoke">{t.unit}</span>}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* All ten facts */}
        <section aria-labelledby="facts" className="relative mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Piston className="pointer-events-none absolute -bottom-10 -left-10 hidden size-64 text-champagne opacity-[0.1] lg:block" />
          <h2 id="facts" className="type-display text-[32px] text-ivory">
            Ten things to know about the {car.model}
          </h2>
          <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {car.facts.map((f, i) => (
              <li key={f} className="flex gap-4 border-t border-line pt-4">
                <span className="type-spec text-[13px] text-champagne">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-[15px] leading-relaxed text-ivory/85">{f}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-16 text-[12px] text-smoke/70">
          {car.id === 'ferrari-458-italia'
            ? 'Ferrari 458 model by vicent091036 on Sketchfab, as distributed with the three.js examples.'
            : 'Stylised model built from the car’s published dimensions. Figures are manufacturer claims and may vary by market.'}
        </p>
      </div>
    </div>
  )
}
