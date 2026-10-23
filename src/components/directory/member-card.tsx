import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/directory/avatar'
import { Badge } from '@/components/ui/badge'
import { cars } from '@/data/cars'
import { shows, type ClubMember } from '@/data/members'
import { cn } from '@/lib/utils'

const tierVariant = { Founder: 'champagne', Patron: 'accent', Member: 'outline' } as const

export function MemberCard({ member, open, onToggle }: { member: ClubMember; open: boolean; onToggle: () => void }) {
  const memberCars = shows(member, 'cars') ? member.carIds.flatMap((id) => cars.find((c) => c.id === id) ?? []) : []
  const hasBio = shows(member, 'bio') && !!member.bio
  const bioId = `bio-${member.id}`
  return (
    <article className={cn('panel interactive flex flex-col p-6 md:p-7', open && 'border-champagne/30')}>
      <div className="flex items-start gap-4">
        <Avatar initials={member.initials} className="size-14 text-base" />
        <div className="min-w-0 flex-1">
          <h3 className="type-display text-[28px] leading-tight">{member.name}</h3>
          <p className="mt-1 text-label text-smoke">
            {shows(member, 'city') && <>{member.city}, </>}member since <span className="type-spec text-ivory">{member.memberSince.slice(0, 4)}</span>
          </p>
        </div>
      </div>
      {member.tier !== 'Member' && (
        <div className="mt-4">
          <Badge variant={tierVariant[member.tier]}>{member.tier}</Badge>
        </div>
      )}

      {memberCars.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`Cars owned by ${member.name}`}>
          {memberCars.map((car) => (
            <li key={car.id}>
              <Link
                to={`/cars/${car.id}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-label text-ivory transition-colors duration-200 hover:border-teal hover:text-teal-bright"
              >
                <span className="size-2.5 shrink-0 rounded-full ring-1 ring-ivory/30" style={{ background: member.carColours[car.id] }} aria-hidden="true" />
                {car.make} {car.model}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 [&:not(:first-child)]:mt-6">
        <p className="text-label text-smoke">
          {shows(member, 'drives') ? (
            <>
              <span className="type-spec text-ivory">{member.drivesAttended}</span> club drives
            </>
          ) : (
            'Club member'
          )}
        </p>
        {hasBio && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={bioId}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-label text-smoke transition-colors duration-200 hover:bg-ivory/8 hover:text-ivory"
          >
            {open ? 'Hide bio' : 'Read bio'}
            <ChevronDown className={cn('size-4 transition-transform duration-200 ease-(--ease-luxe)', open && 'rotate-180')} aria-hidden />
          </button>
        )}
      </div>

      {hasBio && (
        <div
          id={bioId}
          className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-(--ease-luxe)', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
        >
          <div className="overflow-hidden">
            <p className="pt-4 leading-relaxed text-ivory/90">{member.bio}</p>
          </div>
        </div>
      )}
    </article>
  )
}
