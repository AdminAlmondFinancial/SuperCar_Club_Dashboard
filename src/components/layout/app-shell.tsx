import { CalendarDays, CarFront, ChevronDown, House, LayoutGrid, LogOut, Menu, Search, UserRound, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { Avatar, Wordmark } from '@/components/site/primitives'
import { SiteFooter } from '@/components/site/site-footer'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export const NAV = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/garage', label: 'Garage', icon: CarFront },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/members', label: 'Members', icon: Users },
] as const

type Tone = 'overlay' | 'paper' | 'dark'

function firstName(name: string) {
  return name.split(/\s+/)[0] ?? name
}

function AccountMenu({ tone }: { tone: Tone }) {
  const { member, signOut, previewMode } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!member) return null
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 py-1"
      >
        <Avatar name={member.name} url={member.avatarUrl} className={cn('size-8', tone === 'paper' ? '' : 'bg-white/15')} />
        <span className="eyebrow hidden text-[11px] xl:inline">{firstName(member.name)}</span>
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} strokeWidth={1.75} />
      </button>
      {open && (
        <div role="menu" className="absolute top-12 right-0 w-64 border border-line bg-white p-2 text-ink shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]">
          <div className="border-b border-line px-3 pt-2 pb-3">
            <p className="text-[14px] font-medium">{member.name}</p>
            <p className="truncate text-[12px] text-stone">{member.email}</p>
            {previewMode && <p className="mt-1 text-[11px] text-stone">Preview session in this browser</p>}
          </div>
          <Link role="menuitem" to="/account" className="mt-1 flex items-center gap-3 px-3 py-2.5 text-[13px] hover:bg-mist">
            <UserRound className="size-4" strokeWidth={1.5} /> Your account
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] hover:bg-mist"
          >
            <LogOut className="size-4" strokeWidth={1.5} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { member, signOut } = useAuth()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[70] flex flex-col bg-paper text-ink lg:hidden">
      <div className="page-gutter flex h-16 items-center justify-between border-b border-line" style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}>
        <Wordmark className="text-[16px]" />
        <button type="button" onClick={onClose} aria-label="Close menu" className="-mr-2 flex size-10 items-center justify-center">
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      <nav aria-label="Menu" className="page-gutter flex flex-1 flex-col overflow-y-auto py-6">
        {[...NAV, { to: '/garage/collection', label: 'Club Collection' }, { to: '/account', label: 'Your account' }].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item}
            onClick={onClose}
            className={({ isActive }) => cn('display border-b border-line py-4 text-[28px]', isActive ? 'text-ink' : 'text-ink/60')}
          >
            {item.label}
          </NavLink>
        ))}
        {member && (
          <div className="mt-auto flex items-center justify-between gap-4 pt-10">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={member.name} url={member.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">{member.name}</p>
                <p className="truncate text-[12px] text-stone">{member.email}</p>
              </div>
            </div>
            <button type="button" onClick={() => void signOut()} className="eyebrow shrink-0 underline underline-offset-4">
              Sign out
            </button>
          </div>
        )}
      </nav>
    </div>
  )
}

export function AppShell() {
  const { pathname, hash } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // React Router does not scroll on navigation or to #anchors, so do both here.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => window.clearTimeout(t)
  }, [pathname, hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const showroom = pathname.startsWith('/cars/')
  const home = pathname === '/'
  const tone: Tone = showroom ? 'dark' : home && !scrolled ? 'overlay' : 'paper'

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color] duration-500',
          tone === 'overlay' && 'border-transparent bg-gradient-to-b from-black/55 to-transparent text-white',
          tone === 'paper' && 'border-line bg-paper/92 text-ink backdrop-blur-md',
          tone === 'dark' && 'border-obsidian-line bg-obsidian/92 text-white backdrop-blur-md',
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="page-gutter mx-auto flex h-16 max-w-[1520px] items-center justify-between gap-6 lg:h-[72px]">
          <Link to="/" aria-label="SuperCar Club home">
            <Wordmark className="text-[16px] lg:text-[19px]" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            {NAV.map(({ to, label, ...rest }) => (
              <NavLink
                key={to}
                to={to}
                end={'end' in rest}
                className={({ isActive }) =>
                  cn(
                    'eyebrow relative py-2 text-[11px] transition-opacity duration-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-500',
                    isActive ? 'after:scale-x-100' : 'opacity-75 after:scale-x-0 hover:opacity-100 hover:after:scale-x-100',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 lg:gap-5">
            <Link to="/garage/collection?search=1" aria-label="Search the Club Collection" className="hidden size-10 items-center justify-center lg:flex">
              <Search className="size-[18px]" strokeWidth={1.5} />
            </Link>
            <span className="hidden h-5 w-px bg-current opacity-25 lg:block" aria-hidden />
            <div className="hidden lg:block">
              <AccountMenu tone={tone} />
            </div>
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-mr-2 flex size-10 items-center justify-center lg:hidden">
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}

      <main id="main" className={cn('pb-nav', showroom ? 'bg-obsidian' : 'bg-paper')}>
        <Outlet />
        <SiteFooter />
      </main>

      {/* Bottom navigation on phones and small tablets */}
      <nav
        aria-label="Main"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 border-t lg:hidden',
          showroom ? 'border-obsidian-line bg-obsidian/95 text-white' : 'border-line bg-paper/95 text-ink',
          'backdrop-blur-md',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="page-gutter mx-auto grid h-16 max-w-xl grid-cols-5">
          {NAV.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-[0.04em] transition-opacity',
                  isActive ? 'opacity-100 before:absolute before:top-0 before:h-0.5 before:w-6 before:bg-current' : 'opacity-55',
                )
              }
            >
              <Icon className="size-5" strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
