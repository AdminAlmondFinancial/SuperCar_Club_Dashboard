import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useAuth } from '@/lib/auth'

/**
 * Event replies. The club has no events service yet, so replies are kept in this browser for
 * the signed-in member and the pages say so.
 */
type RsvpState = {
  going: Set<string>
  isGoing: (eventId: string) => boolean
  toggle: (eventId: string) => void
}

const RsvpContext = createContext<RsvpState | null>(null)
const key = (memberId: string) => `scc.rsvp.${memberId}`

function load(memberId: string): Set<string> {
  try {
    const raw = localStorage.getItem(key(memberId))
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function RsvpProvider({ children }: { children: ReactNode }) {
  const { member } = useAuth()
  const memberId = member?.id ?? null
  const [going, setGoing] = useState<Set<string>>(() => new Set())

  useEffect(() => setGoing(memberId ? load(memberId) : new Set()), [memberId])

  const toggle = useCallback(
    (eventId: string) => {
      if (!memberId) return
      setGoing((prev) => {
        const next = new Set(prev)
        if (!next.delete(eventId)) next.add(eventId)
        try {
          localStorage.setItem(key(memberId), JSON.stringify([...next]))
        } catch {
          /* storage unavailable: the reply lasts until reload */
        }
        return next
      })
    },
    [memberId],
  )

  const value = useMemo(() => ({ going, isGoing: (id: string) => going.has(id), toggle }), [going, toggle])
  return <RsvpContext.Provider value={value}>{children}</RsvpContext.Provider>
}

export function useRsvp() {
  const ctx = useContext(RsvpContext)
  if (!ctx) throw new Error('useRsvp must be used inside <RsvpProvider>')
  return ctx
}
