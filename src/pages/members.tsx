import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { MemberCard } from '@/components/directory/member-card'
import { KeyFob } from '@/components/memorabilia'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { cars } from '@/data/cars'
import { members, shows } from '@/data/members'

export function MembersPage() {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => {
      // Search only what each member has chosen to show
      const carText = (shows(m, 'cars') ? m.carIds : [])
        .map((id) => cars.find((c) => c.id === id))
        .map((c) => (c ? `${c.make} ${c.model}` : ''))
        .join(' ')
      return `${m.name} ${shows(m, 'city') ? m.city : ''} ${carText}`.toLowerCase().includes(q)
    })
  }, [query])

  return (
    <div className="relative overflow-hidden">
      <KeyFob className="pointer-events-none absolute -right-8 top-20 size-64 -rotate-12 text-champagne/10 md:right-10 md:size-96" />
      <div className="relative mx-auto max-w-[1440px] pb-dock enter px-4 pt-28 md:px-8">
        <h1 className="type-display text-5xl md:text-7xl">Members</h1>
        <p className="mt-4 max-w-xl text-lead text-smoke">
          <span className="type-spec text-ivory">{members.length}</span> drivers, from the founders to the newest keys in the club. Each member chooses what they show here.
        </p>

        <div className="mt-8 flex max-w-xl flex-wrap items-center gap-x-4 gap-y-2">
          <div className="relative w-full max-w-md">
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
          {query && (
            <p className="text-label text-smoke" aria-hidden>
              {results.length} of {members.length}
            </p>
          )}
        </div>

        {results.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={<Search />}
            title="No one matches that"
            action={
              <Button variant="outline" onClick={() => setQuery('')}>
                Clear search
              </Button>
            }
          >
            We could not find a member for &ldquo;{query}&rdquo;. Try a different name, city or car.
          </EmptyState>
        ) : (
          <div className="mt-10 grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
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
