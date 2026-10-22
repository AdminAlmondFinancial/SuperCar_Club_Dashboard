import { LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Avatar, Eyebrow } from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { GARAGE_LIMIT, useGarage } from '@/lib/garage'
import { useRsvp } from '@/lib/rsvp'

const PROVIDER: Record<string, string> = { google: 'Google', microsoft: 'Microsoft', preview: 'Preview (no account)' }

function Section({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
      <div>
        <h2 className="display text-[26px]">{title}</h2>
        <p className="mt-2 max-w-[38ch] text-[14px] leading-relaxed text-stone">{intro}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-4 py-3.5 text-[14px]">
          <dt className="text-stone">{k}</dt>
          <dd className="min-w-0 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function AccountPage() {
  const { member, previewMode, signOut } = useAuth()
  const { garageCars, update, ready } = useGarage()
  const { going } = useRsvp()
  if (!member) return null
  const shared = garageCars.filter((g) => g.entry.shared)
  const since = new Date(member.memberSince).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <div className="page-gutter mx-auto max-w-[1200px] pt-28 pb-24 lg:pt-36">
      <Eyebrow>Your account</Eyebrow>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <Avatar name={member.name} url={member.avatarUrl} className="size-16 text-[18px]" />
        <div>
          <h1 className="display rise text-[clamp(2.4rem,5vw,4rem)]">{member.name}</h1>
          <p className="mt-1 text-[14px] text-stone">Member since {since}</p>
        </div>
      </div>

      <div className="mt-12">
        <Section title="Profile" intro="Your name and email come from the account you sign in with. Change them there and they update here at your next sign-in.">
          <Rows
            rows={[
              ['Name', member.name],
              ['Email', member.email],
              ['Signed in with', PROVIDER[member.provider] ?? member.provider],
              ['Member since', since],
              ...(member.isAdmin ? ([['Role', 'Club administrator']] as [string, ReactNode][]) : []),
            ]}
          />
        </Section>

        <Section title="Garage and sharing" intro="Your garage is private. A car appears in the Club Collection only when you turn on sharing for it.">
          <Rows
            rows={[
              ['Cars in your garage', `${garageCars.length} of ${GARAGE_LIMIT}`],
              ['Shared with the club', shared.length ? shared.map((g) => `${g.car.make} ${g.car.model}`).join(', ') : 'None'],
            ]}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/garage">Manage your garage</Link>
            </Button>
            {shared.length > 0 && (
              <Button variant="ghost" size="sm" disabled={!ready} onClick={() => shared.forEach((g) => update(g.car.id, { shared: false }))}>
                Stop sharing all
              </Button>
            )}
          </div>
        </Section>

        <Section title="Events" intro="Your replies to club events.">
          <Rows rows={[['Places reserved', String(going.size)]]} />
          <p className="mt-3 text-[12px] text-stone">Replies are saved in this browser until the club&rsquo;s events service is connected.</p>
          <Button asChild variant="outline" size="sm" className="mt-6">
            <Link to="/events">See the calendar</Link>
          </Button>
        </Section>

        <Section
          title="Session"
          intro={previewMode ? 'This is a preview without a club account. Your garage and replies are kept in this browser only.' : 'Signing out ends your session on this device.'}
        >
          <Button variant="solid" onClick={() => void signOut()}>
            <LogOut /> Sign out
          </Button>
        </Section>
      </div>
    </div>
  )
}
