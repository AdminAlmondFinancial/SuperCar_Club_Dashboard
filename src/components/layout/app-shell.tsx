import { Bell, CalendarDays, CarFront, House, LogOut, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Wordmark } from '@/components/layout/crest'
import { useAuth } from '@/lib/auth'
import { daysUntilDate } from '@/lib/dates'
import { nextServiceDate, useGarage } from '@/lib/garage'
import { cn } from '@/lib/utils'

export const NAV = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/garage', label: 'Garage', icon: CarFront },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/members', label: 'Members', icon: Users },
] as const

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
}

export function AppShell() {
  const { member, signOut } = useAuth()
  const { garageCars } = useGarage()
  const navigate = useNavigate()
  // The bell only shows a dot when a car's service is overdue or due within a month.
  const serviceDue = garageCars.some(({ entry, car }) => daysUntilDate(nextServiceDate(entry, car)) <= 30)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash } = useLocation()

  // React Router does not scroll to #anchors, so do it here (the bell links to #service).
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => window.clearTimeout(t)
  }, [pathname, hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh bg-ink">
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
          scrolled ? 'border-line bg-black/75 backdrop-blur-xl' : 'border-transparent',
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
          <NavLink to="/" aria-label="SuperCar Club home">
            <Wordmark />
          </NavLink>

          {/* Pill navigation, after the Carvia reference */}
          <nav
            aria-label="Main"
            className="hidden items-center gap-1 rounded-full border border-line bg-black/55 p-1.5 backdrop-blur-xl md:flex"
          >
            {NAV.map(({ to, label, icon: Icon, ...rest }) => (
              <NavLink
                key={to}
                to={to}
                end={'end' in rest}
                className={({ isActive }) =>
                  cn(
                    'flex h-10 items-center gap-2 rounded-full px-4 text-label font-medium transition-colors duration-200',
                    isActive ? 'bg-ivory text-ink' : 'text-smoke hover:text-ivory',
                  )
                }
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/garage?search=1')}
              className="hidden size-10 items-center justify-center rounded-full border border-line bg-black/55 text-smoke backdrop-blur-xl transition-colors hover:text-ivory sm:flex"
              aria-label="Search cars"
            >
              <Search className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/#service')}
              className="relative flex size-10 items-center justify-center rounded-full border border-line bg-black/55 text-smoke backdrop-blur-xl transition-colors hover:text-ivory"
              aria-label={serviceDue ? 'Service reminders, a service is due soon' : 'Service reminders'}
            >
              <Bell className="size-4" strokeWidth={1.75} />
              {serviceDue && <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-champagne" aria-hidden />}
            </button>
            {member && (
              <div className="group relative">
                <button
                  type="button"
                  className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-champagne/50 bg-verde text-[13px] font-semibold text-champagne"
                  aria-label={`Signed in as ${member.name}`}
                >
                  {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="size-full object-cover" /> : initials(member.name)}
                </button>
                <div className="invisible absolute top-12 right-0 w-56 rounded-[18px] border border-line bg-graphite p-2 opacity-0 shadow-2xl transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <p className="px-3 pt-2 text-sm text-ivory">{member.name}</p>
                  <p className="truncate px-3 pb-2 text-xs text-smoke">{member.email}</p>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-smoke hover:bg-ivory/5 hover:text-ivory"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Floating pill dock on small screens, after the nav-bar reference; it sits above the phone's home indicator */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 mx-auto flex w-fit items-center gap-1 rounded-full border border-line bg-black/80 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl md:hidden"
      >
        {NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in rest}
            className={({ isActive }) =>
              cn(
                'flex h-14 w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-full text-[11px] leading-none font-medium transition-colors duration-200',
                isActive ? 'bg-ivory text-ink' : 'text-smoke hover:text-ivory',
              )
            }
          >
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
