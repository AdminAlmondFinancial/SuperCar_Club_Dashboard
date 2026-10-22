import { ArrowRight, CalendarDays, CarFront, Mail, Newspaper, UserRound, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { eventImage } from '@/components/site/event-image'
import { RsvpButton } from '@/components/site/rsvp-button'
import { ArrowLink, Avatar, DemoNote, Eyebrow, Photo, Reveal, SectionHeading } from '@/components/site/primitives'
import { clubUpdates } from '@/data/editorial'
import { eventKindLabel, upcomingEvents, type ClubEvent } from '@/data/events'
import { members } from '@/data/members'
import { carImage } from '@/data/showroom'
import { CLUB_TIME_ZONE, daysUntil, fmtDay, fmtTime, inDays } from '@/lib/dates'
import { useAuth } from '@/lib/auth'
import { useGarage } from '@/lib/garage'
import { useRsvp } from '@/lib/rsvp'
import { cn } from '@/lib/utils'

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: CLUB_TIME_ZONE }).format(now))
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function dateRange(e: ClubEvent) {
  const start = new Date(e.date)
  return e.endDate ? `${fmtDay(start)} to ${fmtDay(new Date(e.endDate))}` : `${fmtDay(start)}, ${fmtTime(start)}`
}

function Tile({ icon, label, title, children, to, cta }: { icon: ReactNode; label: string; title: string; children?: ReactNode; to: string; cta: string }) {
  return (
    <div className="flex flex-col border border-line bg-white p-5 lg:p-6">
      <div className="flex items-center gap-3 text-stone">
        {icon}
        <span className="eyebrow text-[10px]">{label}</span>
      </div>
      <p className="display mt-4 text-[24px] leading-tight">{title}</p>
      {children && <div className="mt-1.5 text-[13px] text-stone">{children}</div>}
      <Link to={to} className="link-rule mt-auto inline-flex items-center gap-2 pt-6 text-[10.5px]">
        {cta} <ArrowRight className="size-3.5 no-underline" strokeWidth={1.5} />
      </Link>
    </div>
  )
}

export function DashboardPage() {
  const { member } = useAuth()
  const { garageCars } = useGarage()
  const { going } = useRsvp()
  const now = new Date()
  const upcoming = upcomingEvents(now)
  const [lead, second] = upcoming
  const invitations = upcoming.filter((e) => !going.has(e.id))
  const firstName = member?.name.split(/\s+/)[0] ?? 'member'
  const hero = carImage(garageCars[0]?.car.id ?? 'ferrari-458-italia', 'dark')
  const sharedCount = members.reduce((n, m) => n + m.carIds.length, 0)

  return (
    <div>
      {/* Welcome band */}
      <section className="relative overflow-hidden bg-obsidian text-white">
        <img
          src={hero.src}
          srcSet={hero.srcSet}
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt=""
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-[70%_60%] opacity-55 lg:w-[58%] lg:object-contain lg:object-[right_center] lg:opacity-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-obsidian)_0%,var(--color-obsidian)_30%,rgb(12_13_15/0.55)_60%,transparent_100%)]" aria-hidden />
        <div className="page-gutter relative mx-auto flex max-w-[1520px] flex-wrap items-end justify-between gap-6 pt-28 pb-24 lg:pt-36 lg:pb-32">
          <div>
            <p className="eyebrow rise text-fog">{greeting(now)}</p>
            <h1 className="display rise mt-4 text-[clamp(2.6rem,5.4vw,4.6rem)] [animation-delay:80ms]">Welcome back, {firstName}.</h1>
            <p className="rise mt-4 max-w-[44ch] text-[15px] text-white/80 [animation-delay:160ms]">Your drives, collection and club updates at a glance.</p>
          </div>
          <p className="eyebrow rise text-right text-[10.5px] text-white/75 [animation-delay:200ms]">
            {now.toLocaleDateString('en-GB', { weekday: 'long', timeZone: CLUB_TIME_ZONE })}
            <br />
            {now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: CLUB_TIME_ZONE })}
          </p>
        </div>
      </section>

      {/* Overview tiles overlap the band, as in the catalogue's contents page */}
      <section aria-label="Overview" className="page-gutter relative mx-auto -mt-14 max-w-[1520px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Tile
            icon={<CalendarDays className="size-5" strokeWidth={1.25} />}
            label="Next drive"
            title={lead ? lead.region : 'Nothing booked'}
            to="/events"
            cta="View details"
          >
            {lead && (
              <>
                {fmtDay(new Date(lead.date))}, {inDays(daysUntil(new Date(lead.date), now))}
                {going.has(lead.id) && <span className="ml-2 font-medium text-ink">· You are going</span>}
              </>
            )}
          </Tile>
          <Tile icon={<CarFront className="size-5" strokeWidth={1.25} />} label="My garage" title={`${garageCars.length} ${garageCars.length === 1 ? 'vehicle' : 'vehicles'}`} to="/garage" cta="Open garage">
            {garageCars.length ? garageCars.map((g) => `${g.car.make} ${g.car.model}`).join(', ') : 'Add the cars you own'}
          </Tile>
          <Tile icon={<Mail className="size-5" strokeWidth={1.25} />} label="Club invitations" title={`${invitations.length} ${invitations.length === 1 ? 'invitation' : 'invitations'}`} to="/events" cta="View all">
            Upcoming events you have not replied to
          </Tile>
          <Tile icon={<UserRound className="size-5" strokeWidth={1.25} />} label="Your account" title="Membership" to="/account" cta="Manage">
            {member?.provider === 'preview' ? 'Preview session' : `Signed in with ${member?.provider === 'google' ? 'Google' : 'Microsoft'}`}
          </Tile>
        </div>
      </section>

      {/* Upcoming experiences */}
      {lead && (
        <section aria-labelledby="experiences" className="page-gutter mx-auto max-w-[1520px] pt-16 lg:pt-20">
          <SectionHeading id="experiences" title="Upcoming experiences" action={{ to: '/events', label: 'View all events' }} />
          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Reveal className="relative overflow-hidden bg-obsidian text-white">
              <Photo {...eventImage(lead)} sizes="(min-width: 1024px) 66vw, 100vw" ratio="16 / 9" className="bg-obsidian-2 max-sm:aspect-[4/5]!" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.82)_0%,rgb(0_0_0/0.35)_55%,transparent_80%)] max-sm:bg-[linear-gradient(0deg,rgb(0_0_0/0.85)_0%,rgb(0_0_0/0.3)_60%,transparent_100%)]" aria-hidden />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:justify-center lg:p-10">
                <p className="eyebrow text-[10.5px] text-white/80">
                  {eventKindLabel(lead.kind)} · {dateRange(lead)}
                </p>
                <h3 className="display mt-3 max-w-[16ch] text-[clamp(1.9rem,3.2vw,2.9rem)] leading-[1.02]">{lead.title}</h3>
                <p className="mt-3 max-w-[44ch] text-[14px] leading-relaxed text-white/80 max-sm:line-clamp-3">{lead.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <RsvpButton event={lead} tone="dark" />
                  <span className="text-[12px] text-white/70">
                    {lead.attendeeIds.length + (going.has(lead.id) ? 1 : 0)} of {lead.capacity} places taken
                  </span>
                </div>
              </div>
            </Reveal>
            {second && (
              <Reveal delay={100} className="relative overflow-hidden bg-obsidian text-white">
                <Link to="/events" className="photo-zoom block h-full">
                  <Photo {...eventImage(second)} sizes="(min-width: 1024px) 33vw, 100vw" ratio="4 / 3" className="h-full bg-obsidian-2 lg:aspect-auto!" />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(0_0_0/0.8)_0%,transparent_60%)]" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="eyebrow text-[10px] text-white/75">{fmtDay(new Date(second.date))}</p>
                    <h3 className="display mt-1.5 text-[24px] leading-tight">{second.title}</h3>
                  </div>
                </Link>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Activity, highlights and members */}
      <section className="page-gutter mx-auto grid max-w-[1520px] gap-12 pt-16 pb-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16 lg:pt-20 lg:pb-28">
        <div>
          <SectionHeading title="Club updates" />
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {clubUpdates.map((u) => (
              <li key={u.id}>
                <Link to={u.to} className="group flex items-start gap-4 py-5">
                  <Newspaper className="mt-0.5 size-5 shrink-0 text-stone" strokeWidth={1.25} />
                  <span className="min-w-0 flex-1">
                    <span className="eyebrow block text-[10px] text-stone">{u.kind}</span>
                    <span className="mt-1 block text-[15px] font-medium">{u.title}</span>
                    <span className="mt-0.5 block text-[13px] text-stone">{u.detail}</span>
                  </span>
                  <span className="shrink-0 text-[12px] text-stone tabular">{u.daysAgo === 1 ? '1 day ago' : `${u.daysAgo} days ago`}</span>
                </Link>
              </li>
            ))}
          </ul>
          <DemoNote className="mt-4">Club updates, events and the member directory are sample content. Replies to events are saved in this browser until the club&rsquo;s events service is connected.</DemoNote>
        </div>

        <div>
          <SectionHeading title="Club highlights" />
          <dl className="mt-5 grid grid-cols-3 border-y border-line">
            {[
              [members.length, 'Members'],
              [upcoming.length, 'Upcoming events'],
              [sharedCount, 'Vehicles shared'],
            ].map(([n, label], i) => (
              <div key={label} className={cn('py-6', i > 0 && 'border-l border-line pl-5')}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="display block text-[40px] leading-none tabular">{n}</span>
                  <span className="eyebrow mt-3 block text-[10px] text-stone">{label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex items-end justify-between gap-4">
            <Eyebrow>Member directory</Eyebrow>
            <ArrowLink to="/members">Browse</ArrowLink>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Some club members">
            {members.slice(0, 10).map((m) => (
              <li key={m.id} title={m.name}>
                <Link to={`/members#${m.id}`}>
                  <Avatar name={m.name} className="size-11 text-[13px]" />
                  <span className="sr-only">{m.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/members" className="flex size-11 items-center justify-center rounded-full border border-line text-[12px] text-stone">
                <Users className="size-4" strokeWidth={1.5} />
                <span className="sr-only">All members</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
