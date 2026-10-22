import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar, DemoNote, Eyebrow, Reveal } from '@/components/site/primitives'
import { Input } from '@/components/ui/input'
import { cars } from '@/data/cars'
import { members, shows, type ClubMember } from '@/data/members'
import { carImage } from '@/data/showroom'
import { cn } from '@/lib/utils'

const TIERS = ['All', 'Founder', 'Patron', 'Member'] as const
const since = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

function MemberEntry({ member }: { member: ClubMember }) {
  const owned = shows(member, 'cars') ? member.carIds.flatMap((id) => cars.filter((c) => c.id === id)) : []
  return (
    <article id={member.id} className="flex scroll-mt-28 flex-col border-t border-ink/80 pt-5">
      <div className="flex items-start gap-4">
        <Avatar name={member.name} className="size-12 text-[14px]" />
        <div className="min-w-0">
          <h2 className="display text-[24px] leading-tight">{member.name}</h2>
          <p className="eyebrow mt-1 text-[10px] text-stone">
            {member.tier}
            {shows(member, 'city') && <> · {member.city}</>}
          </p>
        </div>
      </div>
      {shows(member, 'bio') && <p className="mt-4 text-[14px] leading-relaxed text-ink/80">{member.bio}</p>}
      <dl className="mt-4 grid grid-cols-2 border-y border-line text-[12px]">
        <div className="py-2.5">
          <dt className="eyebrow text-[9.5px] text-stone">Member since</dt>
          <dd className="mt-1">{since(member.memberSince)}</dd>
        </div>
        <div className="border-l border-line py-2.5 pl-3">
          <dt className="eyebrow text-[9.5px] text-stone">Drives</dt>
          <dd className="mt-1 tabular">{shows(member, 'drives') ? member.drivesAttended : 'Private'}</dd>
        </div>
      </dl>
      <ul className="mt-4 grid gap-2">
        {owned.map((car) => {
          const img = carImage(car.id, 'light')
          return (
            <li key={car.id}>
              <Link to={`/cars/${car.id}`} className="group flex items-center gap-3">
                <img src={img.srcSet.split(' ')[0]} alt="" loading="lazy" className="aspect-[16/10] w-20 bg-mist object-cover" />
                <span className="text-[13px] group-hover:underline group-hover:underline-offset-4">
                  {car.make} {car.model}
                </span>
                <span className="ml-auto size-2.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: member.carColours[car.id] }} aria-hidden />
              </Link>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export function MembersPage() {
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<(typeof TIERS)[number]>('All')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => {
      if (tier !== 'All' && m.tier !== tier) return false
      if (!q) return true
      const carText = m.carIds.map((id) => cars.find((c) => c.id === id)).map((c) => (c ? `${c.make} ${c.model}` : '')).join(' ')
      return `${m.name} ${m.city} ${carText}`.toLowerCase().includes(q)
    })
  }, [query, tier])

  return (
    <div className="page-gutter mx-auto max-w-[1520px] pt-28 pb-24 lg:pt-36">
      <Eyebrow>The directory</Eyebrow>
      <h1 className="display rise mt-4 text-[clamp(2.8rem,6.4vw,5.4rem)]">Members.</h1>
      <p className="rise mt-3 max-w-[56ch] text-[15px] text-stone [animation-delay:80ms]">
        {members.length} drivers, from the founders to the newest keys in the club.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-line pb-4">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <Input id="member-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, city or car" aria-label="Search members" className="pl-10" />
        </div>
        <div role="group" aria-label="Filter by membership" className="flex gap-6">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tier === t}
              onClick={() => setTier(t)}
              className={cn('eyebrow text-[11px] transition-colors', tier === t ? 'text-ink underline underline-offset-[10px]' : 'text-stone hover:text-ink')}
            >
              {t === 'All' ? 'Everyone' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {results.length ? (
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((m, i) => (
            <Reveal key={m.id} delay={(i % 4) * 70}>
              <MemberEntry member={m} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-line bg-white px-6 py-16 text-center">
          <p className="display text-[28px]">No one matches that</p>
          <p className="mx-auto mt-3 max-w-sm text-[14px] text-stone">Try a different name, city or car.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setTier('All')
            }}
            className="link-rule mt-6 text-[10.5px]"
          >
            Clear search
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {results.length} members shown
      </p>
      <DemoNote className="mt-14">The member directory is sample content until the club&rsquo;s membership records are connected.</DemoNote>
    </div>
  )
}
