import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import type { ClubEvent } from '@/data/events'
import { useAuth } from '@/lib/auth'

/**
 * The member's event reservations. There is no booking API yet, so they are kept in this
 * browser for each member, and the pages say so next to the reserve buttons.
 */
type RsvpState = {
  isGoing: (eventId: string) => boolean
  toggle: (eventId: string) => void
}

const RsvpContext = createContext<RsvpState | null>(null)
const storageKey = (memberId: string) => `scc.rsvp.${memberId}`

function load(memberId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(memberId))
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function RsvpProvider({ children }: { children: ReactNode }) {
  const { member } = useAuth()
  const memberId = member?.id ?? null
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(memberId ? load(memberId) : [])
  }, [memberId])

  const toggle = useCallback(
    (eventId: string) => {
      if (!memberId) return
      setIds((prev) => {
        const next = prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
        try {
          localStorage.setItem(storageKey(memberId), JSON.stringify(next))
        } catch {
          /* storage unavailable: the reservation lasts until reload */
        }
        return next
      })
    },
    [memberId],
  )

  const value = useMemo(() => ({ isGoing: (id: string) => ids.includes(id), toggle }), [ids, toggle])
  return <RsvpContext.Provider value={value}>{children}</RsvpContext.Provider>
}

export function useRsvp() {
  const ctx = useContext(RsvpContext)
  if (!ctx) throw new Error('useRsvp must be used inside <RsvpProvider>')
  return ctx
}

export type EventStatus = 'reserved' | 'available' | 'full' | 'past'

/** One status per event, worked out from real capacity and dates only. */
export function eventStatus(event: ClubEvent, going: boolean, now = new Date()): EventStatus {
  if (new Date(event.endDate ?? event.date).getTime() < now.getTime()) return 'past'
  if (going) return 'reserved'
  return event.attendeeIds.length >= event.capacity ? 'full' : 'available'
}
