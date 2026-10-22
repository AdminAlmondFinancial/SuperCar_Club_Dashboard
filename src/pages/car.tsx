import { ArrowLeft, Check, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SketchfabCredit, SketchfabStage } from '@/components/site/sketchfab-viewer'
import { cars } from '@/data/cars'
import { carImage, modelPageUrl, sketchfab } from '@/data/showroom'
import { GARAGE_LIMIT, nextServiceDate, useGarage } from '@/lib/garage'
import { cn } from '@/lib/utils'

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const mph = (kmh: number) => Math.round(kmh / 1.609344)

const TABS = ['Specifications', 'Overview', 'Service', 'Media'] as const
type Tab = (typeof TABS)[number]

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-obsidian-line border-y border-obsidian-line">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 py-3.5 text-[14px]">
          <dt className="text-fog">{k}</dt>
          <dd className="tabular">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function CarPage() {
  const { carId } = useParams()
  const car = cars.find((c) => c.id === carId)
  const { entries, add, isFull, ready } = useGarage()
  const entry = entries.find((e) => e.carId === carId)
  const [tab, setTab] = useState<Tab>('Specifications')

  if (!car) return <Navigate to="/garage" replace />
  const model = sketchfab[car.id]
  const colour = entry ? (car.colours.find((c) => c.hex.toLowerCase() === entry.colour.toLowerCase())?.name ?? 'Custom colour') : null
  const back = entry ? { to: '/garage', label: 'My Garage' } : { to: '/garage/collection', label: 'Club Collection' }
  const others = cars.filter((c) => c.id !== car.id)

  const specs: [string, string][] = [
    ['Year', String(car.year)],
    ['Make', car.make],
    ['Model', car.model],
    ...(colour ? ([['Colour', colour]] as [string, string][]) : []),
    ['Engine', car.engine],
    ['Power', `${car.powerHp} hp`],
    ['Torque', `${car.torqueNm} Nm`],
  ]
  const performance: [string, string][] = [
    ['0 to 100 km/h', `${car.zeroTo100s} seconds`],
    ['Top speed', `${car.topSpeedKmh} km/h (${mph(car.topSpeedKmh)} mph)`],
    ['Weight', `${car.weightKg.toLocaleString('en-GB')} kg`],
    ['Gearbox', car.transmission],
    ['Drive', car.drivetrain === 'AWD' ? 'All-wheel drive' : 'Rear-wheel drive'],
    ['Price when new', `About ${gbp.format(car.priceGbp)}`],
  ]

  return (
    <div className="bg-obsidian text-white">
      <div className="page-gutter mx-auto max-w-[1520px] pt-24 lg:pt-28">
        <Link to={back.to} className="eyebrow inline-flex items-center gap-2 text-[10.5px] text-fog hover:text-white">
          <ArrowLeft className="size-3.5" strokeWidth={1.5} /> {back.label}
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="display rise text-[clamp(2.4rem,5vw,4.4rem)]">
              {car.make} {car.model}
            </h1>
            <p className="rise mt-2 text-[13px] text-fog [animation-delay:80ms]">
              {car.year}
              {colour && <> · {colour}</>} · {entry ? (entry.shared ? 'Shared with the club' : 'Private collection') : 'Club register'}
            </p>
          </div>
          {entry ? (
            <Link to="/garage" className="eyebrow inline-flex h-11 items-center gap-2.5 border border-white/50 px-5 text-[10.5px] font-semibold hover:bg-white hover:text-ink">
              <Pencil className="size-3.5" strokeWidth={1.5} /> Edit vehicle
            </Link>
          ) : (
            <button
              type="button"
              disabled={isFull || !ready}
              onClick={() => add(car.id)}
              title={isFull ? `Your garage holds ${GARAGE_LIMIT} cars. Remove one to make room.` : undefined}
              className="eyebrow inline-flex h-11 items-center gap-2.5 border border-white/50 px-5 text-[10.5px] font-semibold hover:bg-white hover:text-ink disabled:opacity-40"
            >
              <Plus className="size-3.5" strokeWidth={1.5} /> {isFull ? 'Garage full' : 'Add to my garage'}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1520px] lg:px-[max(40px,env(safe-area-inset-left,0px))]">
        <SketchfabStage car={car} />
        <div className="page-gutter lg:px-0">{model && <SketchfabCredit model={model} className="mt-3" />}</div>
      </div>

      {/* Other cars in the showroom, as the catalogue's thumbnail strip */}
      <nav aria-label="More cars in the showroom" className="page-gutter mx-auto mt-8 max-w-[1520px]">
        <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
          {others.map((c) => {
            const img = carImage(c.id, 'dark')
            return (
              <li key={c.id} className="shrink-0 snap-start">
                <Link to={`/cars/${c.id}`} className="group block w-36 lg:w-40" title={`${c.make} ${c.model}`}>
                  <img src={img.srcSet.split(' ')[0]} alt="" loading="lazy" className="aspect-[16/10] w-full border border-obsidian-line object-cover opacity-70 transition-opacity group-hover:opacity-100" />
                  <span className="mt-1.5 block truncate text-[11px] text-fog group-hover:text-white">
                    {c.make} {c.model}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <section className="mt-10 border-t border-obsidian-line">
        <div className="page-gutter mx-auto max-w-[1520px]">
          <div role="tablist" aria-label="Vehicle details" className="-mx-1 flex gap-8 overflow-x-auto px-1">
            {TABS.map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                type="button"
                role="tab"
                aria-selected={tab === t}
                aria-controls={`panel-${t}`}
                onClick={() => setTab(t)}
                className={cn(
                  'eyebrow relative shrink-0 py-5 text-[10.5px] transition-colors',
                  tab === t ? 'text-white after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-white' : 'text-fog hover:text-white',
                )}
              >
                {t === 'Service' ? 'Service history' : t}
              </button>
            ))}
          </div>

          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-4 pb-24">
            {tab === 'Specifications' && (
              <div className="grid gap-x-16 gap-y-2 md:grid-cols-2">
                <Rows rows={specs} />
                <Rows rows={performance} />
                <p className="text-[12px] text-fog md:col-span-2">Figures are the manufacturer&rsquo;s published numbers and approximate prices; check them before relying on them.</p>
              </div>
            )}

            {tab === 'Overview' && (
              <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <p className="display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-snug">{car.tagline}.</p>
                  <ul className="mt-8 space-y-4">
                    {car.facts.slice(0, 6).map((f) => (
                      <li key={f} className="border-t border-obsidian-line pt-4 text-[14px] leading-relaxed text-white/85">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow text-fog">What to look for</p>
                  <dl className="mt-4 divide-y divide-obsidian-line border-y border-obsidian-line">
                    {car.hotspots.map((h) => (
                      <div key={h.id} className="py-4">
                        <dt className="text-[15px] font-medium">{h.label}</dt>
                        <dd className="mt-1 text-[13px] leading-relaxed text-fog">{h.detail}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {tab === 'Service' && (
              <div className="grid gap-x-16 gap-y-6 md:grid-cols-2">
                <Rows
                  rows={[
                    ['Manufacturer interval', `Every ${car.serviceIntervalMonths} months or ${car.serviceIntervalKm.toLocaleString('en-GB')} km`],
                    ...(entry
                      ? ([
                          ['Last service', fmtDate(new Date(entry.lastService))],
                          ['Next service due', fmtDate(nextServiceDate(entry, car))],
                          ['Mileage', `${entry.mileageKm.toLocaleString('en-GB')} km`],
                        ] as [string, string][])
                      : []),
                  ]}
                />
                <div className="text-[14px] leading-relaxed text-fog">
                  {entry ? (
                    <p>
                      The next service date is worked out from your last service and the manufacturer&rsquo;s interval. Update them from{' '}
                      <Link to="/garage" className="text-white underline underline-offset-4">
                        your garage
                      </Link>
                      . Workshop records are not connected yet.
                    </p>
                  ) : (
                    <p>Add this car to your garage to track its mileage and service dates.</p>
                  )}
                  <p className="mt-3 inline-flex items-center gap-2 text-[12px]">
                    <Check className="size-3.5" /> Intervals vary by market; your dealer&rsquo;s schedule takes precedence.
                  </p>
                </div>
              </div>
            )}

            {tab === 'Media' && model && (
              <div className="grid gap-10 md:grid-cols-2">
                <Rows
                  rows={[
                    ['3D model', model.title],
                    ['Creator', model.author],
                    ['Licence', model.license],
                    ['Hosted by', 'Sketchfab'],
                  ]}
                />
                <div className="text-[14px] leading-relaxed text-fog">
                  <p>
                    The 3D view is the creator&rsquo;s model, hosted on Sketchfab and loaded only when you choose Explore in 3D. The studio still is cut from the same model&rsquo;s preview.
                  </p>
                  <a href={modelPageUrl(model)} target="_blank" rel="noreferrer" className="eyebrow mt-5 inline-flex h-11 items-center border border-white/50 px-5 text-[10.5px] font-semibold text-white hover:bg-white hover:text-ink">
                    View on Sketchfab
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
