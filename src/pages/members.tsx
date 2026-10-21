import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { MemberCard } from '@/components/directory/member-card'
import { KeyFob } from '@/components/memorabilia'
import { Input } from '@/components/ui/input'
import { cars } from '@/data/cars'
import { members } from '@/data/members'

export function MembersPage() {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => {
      const carText = m.carIds
        .map((id) => cars.find((c) => c.id === id))
        .map((c) => (c ? `${c.make} ${c.model}` : ''))
        .join(' ')
      return `${m.name} ${m.city} ${carText}`.toLowerCase().includes(q)
    })
  }, [query])

  return (
    <div className="relative overflow-hidden">
      <KeyFob className="pointer-events-none absolute -right-8 top-20 size-64 -rotate-12 text-champagne/10 md:right-10 md:size-96" />
      <div className="relative mx-auto max-w-[1440px] pb-dock px-4 pt-28 md:px-8">
        <h1 className="type-display text-5xl md:text-7xl">Members</h1>
        <p className="mt-4 max-w-xl text-base text-smoke">
          <span className="type-spec text-ivory">{members.length}</span> drivers, from the founders to the newest keys in the club.
        </p>

        <div className="relative mt-8 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-smoke" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city or car"
            aria-label="Search members by name, city or car"
            className="pl-11"
          />
        </div>

        {results.length === 0 ? (
          <div className="panel mt-10 px-6 py-16 text-center">
            <p className="type-display text-3xl">No one matches that</p>
            <p className="mx-auto mt-3 max-w-sm text-smoke">We could not find a member for &ldquo;{query}&rdquo;. Try a different name, city or car.</p>
            <button type="button" onClick={() => setQuery('')} className="mt-6 h-11 rounded-full border border-line-strong px-5 text-sm text-ivory transition-colors hover:bg-ivory/5">
              Clear search
            </button>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-4">
            {results.map((m) => (
              <MemberCard key={m.id} member={m} open={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} />
            ))}
          </div>
        )}
        <p className="sr-only" aria-live="polite">{results.length} members shown</p>
      </div>
    </div>
  )
}
