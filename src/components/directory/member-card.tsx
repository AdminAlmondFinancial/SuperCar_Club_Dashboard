import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/directory/avatar'
import { Badge } from '@/components/ui/badge'
import { cars } from '@/data/cars'
import type { ClubMember } from '@/data/members'
import { cn } from '@/lib/utils'

const tierVariant = { Founder: 'champagne', Patron: 'accent', Member: 'default' } as const

export function MemberCard({ member, open, onToggle }: { member: ClubMember; open: boolean; onToggle: () => void }) {
  const memberCars = member.carIds.flatMap((id) => cars.find((c) => c.id === id) ?? [])
  const bioId = `bio-${member.id}`
  return (
    <article className={cn('panel flex flex-col p-6 transition-colors duration-300', open ? 'border-champagne/30' : 'hover:border-line-strong')}>
      <div className="flex items-start gap-4">
        <Avatar initials={member.initials} className="size-14 text-base" />
        <div className="min-w-0 flex-1">
          <h3 className="type-display text-2xl">{member.name}</h3>
          <p className="mt-1 text-sm text-smoke">
            {member.city}, member since <span className="type-spec text-ivory">{member.memberSince.slice(0, 4)}</span>
          </p>
        </div>
        <Badge variant={tierVariant[member.tier]}>{member.tier}</Badge>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`Cars owned by ${member.name}`}>
        {memberCars.map((car) => (
          <li key={car.id}>
            <Link
              to={`/cars/${car.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-[13px] text-ivory transition-colors hover:border-teal hover:text-teal-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-bright"
            >
              <span className="size-2.5 rounded-full ring-1 ring-ivory/30" style={{ background: member.carColours[car.id] }} aria-hidden="true" />
              {car.make} {car.model}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
        <p className="text-sm text-smoke">
          <span className="type-spec text-xl text-ivory">{member.drivesAttended}</span> drives attended
        </p>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bioId}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-smoke transition-colors hover:bg-ivory/8 hover:text-ivory focus-visible:outline-2 focus-visible:outline-teal-bright"
        >
          {open ? 'Hide bio' : 'Read bio'}
          <ChevronDown className={cn('size-4 transition-transform duration-300 ease-(--ease-luxe)', open && 'rotate-180')} />
        </button>
      </div>

      <div
        id={bioId}
        className={cn('grid transition-[grid-template-rows,opacity] duration-500 ease-(--ease-luxe)', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
      >
        <div className="overflow-hidden">
          <p className="pt-4 text-[15px] leading-relaxed text-ivory/85">{member.bio}</p>
        </div>
      </div>
    </article>
  )
}
