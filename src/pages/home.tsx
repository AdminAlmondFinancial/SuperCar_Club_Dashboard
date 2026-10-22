import { ArrowLeft, ArrowRight, CalendarDays, CarFront, FileText, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ArrowLink, DemoNote, Eyebrow, Photo, Reveal, SectionHeading } from '@/components/site/primitives'
import { cars } from '@/data/cars'
import { coverSlides, featuredStories } from '@/data/editorial'
import { eventKindLabel, upcomingEvents } from '@/data/events'
import { members } from '@/data/members'
import { carImage } from '@/data/showroom'
import { fmtDay } from '@/lib/dates'
import { useGarage } from '@/lib/garage'
import { cn } from '@/lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

function Cover() {
  const [index, setIndex] = useState(0)
  const count = coverSlides.length
  const go = useCallback((i: number) => setIndex((i + count) % count), [count])
  const region = useRef<HTMLElement>(null)

  // Arrow keys move between stories while focus is inside the cover.
  useEffect(() => {
    const el = region.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowLeft') go(index - 1)
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [go, index])

  const slide = coverSlides[index]

  return (
    <section
      ref={region}
      aria-roledescription="carousel"
      aria-label="Featured stories"
      className="relative isolate h-[min(640px,calc(100svh-64px))] min-h-[520px] overflow-hidden bg-obsidian text-white lg:h-[clamp(600px,78vh,780px)]"
    >
      {coverSlides.map((s, i) => (
        <div key={s.id} className="hero-slide absolute inset-0" data-active={i === index} aria-hidden={i !== index}>
          <img
            src={s.image.src}
            srcSet={s.image.srcSet}
            sizes="100vw"
            alt={s.image.alt}
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={cn('absolute inset-0 size-full object-cover', s.image.tone === 'studio' && 'lg:object-contain lg:object-right')}
            style={{ objectPosition: s.image.position }}
          />
        </div>
      ))}
      {/* Legibility: darken the left third and the foot of the image */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_8_9/0.82)_0%,rgb(8_8_9/0.45)_42%,transparent_70%)]" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(8_8_9/0.75)_0%,transparent_45%)]" aria-hidden />

      <div className="page-gutter relative mx-auto flex h-full max-w-[1520px] flex-col justify-end pt-24 pb-8 lg:justify-center lg:pb-24">
        <div key={slide.id} className="max-w-[960px]" aria-live="polite">
          <p className="eyebrow rise hidden text-white/80 sm:block">{slide.kicker}</p>
          <h1 className="display rise mt-5 text-[clamp(2.9rem,7.4vw,6.4rem)] leading-[0.95] [animation-delay:80ms]">
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </h1>
          <p className="rise mt-6 max-w-[42ch] text-[15px] leading-relaxed text-white/85 [animation-delay:160ms] lg:text-[17px]">{slide.standfirst}</p>
          <Link
            to={slide.cta.to}
            className="eyebrow rise group mt-8 inline-flex h-12 items-center gap-4 border border-white/80 px-6 font-semibold transition-colors [animation-delay:240ms] hover:bg-white hover:text-ink"
          >
            {slide.cta.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="mt-10 flex items-end justify-between gap-6 lg:absolute lg:inset-x-0 lg:bottom-10 lg:mt-0 lg:px-[max(40px,env(safe-area-inset-left,0px))]">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4" role="tablist" aria-label="Choose a story">
              {coverSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Story ${i + 1} of ${count}: ${s.title.join(' ')}`}
                  onClick={() => go(i)}
                  className={cn('flex items-center gap-4 text-[12px] font-medium tabular transition-opacity', i === index ? 'opacity-100' : 'opacity-55 hover:opacity-90')}
                >
                  {pad(i + 1)}
                  {i === index && <span className="h-px w-12 bg-white" aria-hidden />}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-1 sm:flex">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous story" className="flex size-9 items-center justify-center opacity-70 hover:opacity-100">
                <ArrowLeft className="size-4" strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next story" className="flex size-9 items-center justify-center opacity-70 hover:opacity-100">
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <Link to={slide.caption.to} className="group hidden text-right sm:block">
            <span className="eyebrow block text-[10px] text-white/70">{slide.caption.label}</span>
            <span className="eyebrow mt-1 inline-flex items-center gap-2 text-[11px] font-semibold">
              {slide.caption.title}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Shortcut({ icon, label, title, sub, to, cta }: { icon: ReactNode; label: string; title: string; sub?: string; to: string; cta?: string }) {
  return (
    <Link to={to} className="group flex items-center gap-5 border border-line bg-white px-5 py-5 transition-colors hover:border-ink/40 lg:px-6 lg:py-6">
      <span className="text-ink/80">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block text-[10px] text-stone">{label}</span>
        <span className="display mt-1 block truncate text-[21px] leading-tight">{title}</span>
        {sub && <span className="eyebrow mt-1.5 block text-[10px] text-stone">{sub}</span>}
        {cta && <span className="link-rule mt-2 block text-[10px]">{cta}</span>}
      </span>
      <ArrowRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
    </Link>
  )
}

function Clubhouse() {
  const { garageCars } = useGarage()
  const next = upcomingEvents()[0]
  const icon = 'size-6'
  return (
    <section aria-labelledby="clubhouse" className="page-gutter mx-auto max-w-[1520px] pt-12 lg:pt-14">
      <SectionHeading id="clubhouse" title="Your clubhouse" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {next ? (
          <Shortcut
            icon={<CalendarDays className={icon} strokeWidth={1.25} />}
            label="Next drive"
            title={next.region}
            sub={fmtDay(new Date(next.date))}
            to="/events"
          />
        ) : (
          <Shortcut icon={<CalendarDays className={icon} strokeWidth={1.25} />} label="Next drive" title="Nothing booked" to="/events" />
        )}
        <Shortcut
          icon={<CarFront className={icon} strokeWidth={1.25} />}
          label="Your garage"
          title={`${garageCars.length} ${garageCars.length === 1 ? 'vehicle' : 'vehicles'}`}
          cta="View collection"
          to="/garage"
        />
        <Shortcut icon={<Users className={icon} strokeWidth={1.25} />} label="Club members" title={`${members.length} members`} cta="Meet the community" to="/members" />
        <Shortcut icon={<FileText className={icon} strokeWidth={1.25} />} label="Latest news" title="A new chapter" cta="Open your dashboard" to="/dashboard" />
      </div>
    </section>
  )
}

function Featured() {
  return (
    <section aria-labelledby="featured" className="page-gutter mx-auto max-w-[1520px] pt-16 lg:pt-20">
      <SectionHeading id="featured" title="Featured this month" action={{ to: '/dashboard', label: 'All club updates' }} />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {featuredStories.map((s, i) => (
          <Reveal key={s.id} delay={i * 90}>
            <Link to={s.to} className="photo-zoom group relative block overflow-hidden bg-obsidian text-white">
              <Photo src={s.image.src} srcSet={s.image.srcSet} sizes="(min-width: 768px) 33vw, 100vw" alt={s.image.alt} ratio="4 / 3" className="bg-obsidian-2" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(0_0_0/0.78)_0%,rgb(0_0_0/0.15)_48%,transparent_70%)]" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 lg:p-6">
                <div>
                  <p className="eyebrow text-[10px] text-white/75">{s.kind}</p>
                  <h3 className="display mt-1.5 text-[26px] leading-tight">{s.title}</h3>
                  <p className="mt-2 max-w-[36ch] text-[13px] leading-snug text-white/75">{s.standfirst}</p>
                </div>
                <ArrowRight className="mb-1 size-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function GarageFeature() {
  const { garageCars } = useGarage()
  const first = garageCars[0]
  const car = first?.car ?? cars.find((c) => c.id === 'ferrari-458-italia')!
  const img = carImage(car.id, 'light')
  return (
    <section aria-labelledby="garage-feature" className="page-gutter mx-auto max-w-[1520px] pt-20 lg:pt-28">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
        <Reveal>
          <Link to={`/cars/${car.id}`} className="photo-zoom block" aria-label={`Open the ${car.make} ${car.model} in the showroom`}>
            <Photo src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 60vw, 100vw" alt={`${car.make} ${car.model}`} />
          </Link>
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>{first ? 'From your garage' : 'Your garage'}</Eyebrow>
          <h2 id="garage-feature" className="display mt-4 text-[clamp(2.4rem,4.4vw,4rem)]">
            {car.make} {car.model}
          </h2>
          <p className="mt-2 text-[14px] text-stone">
            {car.year} · {car.engine} · {car.powerHp} hp
          </p>
          <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-ink/80">
            {first
              ? 'Mileage, service dates and the car itself, laid out like a catalogue entry. Open the showroom to walk all the way around it.'
              : 'Add the cars you own and keep their mileage and service dates in one place. Here is one from the register to start.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={`/cars/${car.id}`} className="eyebrow inline-flex h-12 items-center gap-3 bg-ink px-6 font-semibold text-paper hover:bg-obsidian-3">
              Open the showroom <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link to="/garage" className="eyebrow inline-flex h-12 items-center border border-ink/80 px-6 font-semibold hover:bg-ink hover:text-paper">
              Your garage
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function CollectionTeaser() {
  const picks = ['mclaren-750s', 'porsche-911-gt3-rs', 'rolls-royce-spectre', 'bugatti-chiron-super-sport'].map((id) => cars.find((c) => c.id === id)!)
  return (
    <section aria-labelledby="collection-teaser" className="mt-20 bg-mist py-16 lg:mt-28 lg:py-24">
      <div className="page-gutter mx-auto max-w-[1520px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>The Club Collection</Eyebrow>
            <h2 id="collection-teaser" className="display mt-3 text-[clamp(2rem,3.6vw,3.2rem)]">
              Cars our members share.
            </h2>
          </div>
          <ArrowLink to="/garage/collection">Browse the collection</ArrowLink>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
          {picks.map((car, i) => {
            const img = carImage(car.id, 'light')
            return (
              <Reveal as="li" key={car.id} delay={i * 80}>
                <Link to={`/cars/${car.id}`} className="photo-zoom group block">
                  <Photo src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 25vw, 50vw" alt={`${car.make} ${car.model}`} className="bg-white" />
                  <p className="display mt-4 text-[19px] leading-tight lg:text-[22px]">
                    {car.make} {car.model}
                  </p>
                  <p className="eyebrow mt-1.5 text-[10px] text-stone">{car.year}</p>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function SeasonAhead() {
  const list = upcomingEvents().slice(0, 3)
  return (
    <section aria-labelledby="season" className="bg-obsidian py-16 text-white lg:py-24">
      <div className="page-gutter mx-auto grid max-w-[1520px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
        <div>
          <p className="eyebrow text-fog">The season ahead</p>
          <h2 id="season" className="display mt-4 text-[clamp(2.2rem,4vw,3.6rem)]">
            Roads worth
            <br />
            getting up for.
          </h2>
          <Link to="/events" className="eyebrow mt-8 inline-flex h-12 items-center gap-3 border border-white/70 px-6 font-semibold hover:bg-white hover:text-ink">
            All events <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
        <ol className="divide-y divide-obsidian-line border-y border-obsidian-line">
          {list.map((e) => (
            <li key={e.id}>
              <Link to="/events" className="group grid grid-cols-[88px_minmax(0,1fr)_auto] items-baseline gap-4 py-6 lg:grid-cols-[120px_minmax(0,1fr)_auto]">
                <span className="eyebrow tabular text-[11px] text-fog">{fmtDay(new Date(e.date))}</span>
                <span className="min-w-0">
                  <span className="display block text-[22px] leading-tight lg:text-[28px]">{e.title}</span>
                  <span className="mt-1 block text-[13px] text-fog">
                    {eventKindLabel(e.kind)} · {e.venue}
                  </span>
                </span>
                <ArrowRight className="size-4 self-center transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Cover />
      <Clubhouse />
      <Featured />
      <div className="page-gutter mx-auto max-w-[1520px] pt-5">
        <DemoNote>Events, members and stories on this page are sample content until the club&rsquo;s records are connected. The cover photograph is illustrative.</DemoNote>
      </div>
      <GarageFeature />
      <CollectionTeaser />
      <SeasonAhead />
    </>
  )
}
