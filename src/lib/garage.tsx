import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { cars, type Car } from '@/data/cars'
import { useAuth } from '@/lib/auth'

/** Each member keeps up to two cars in their portfolio. */
export const GARAGE_LIMIT = 2

export type GarageEntry = {
  carId: string
  colour: string // hex from car.colours
  acquired: string // ISO date
  lastService: string // ISO date
  mileageKm: number
}

type GarageState = {
  entries: GarageEntry[]
  garageCars: { entry: GarageEntry; car: Car }[]
  isFull: boolean
  /** False until the signed-in member's garage has loaded; edits wait for it. */
  ready: boolean
  add: (carId: string) => void
  remove: (carId: string) => void
  update: (carId: string, patch: Partial<Omit<GarageEntry, 'carId'>>) => void
}

const GarageContext = createContext<GarageState | null>(null)

// The preview starts with one car so the dashboard has something to show.
const PREVIEW_ENTRIES: GarageEntry[] = [
  { carId: 'ferrari-amalfi', colour: '#B3131B', acquired: '2025-09-14', lastService: '2025-11-20', mileageKm: 4820 },
]

const storageKey = (memberId: string) => `scc.garage.${memberId}`

function loadPreview(memberId: string): GarageEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(memberId))
    return raw ? (JSON.parse(raw) as GarageEntry[]) : PREVIEW_ENTRIES
  } catch {
    return PREVIEW_ENTRIES
  }
}

export function GarageProvider({ children }: { children: ReactNode }) {
  const { member, previewMode } = useAuth()
  const memberId = member?.id ?? null
  const [entries, setEntries] = useState<GarageEntry[]>([])
  const [ready, setReady] = useState(false)
  const saveSeq = useRef(0)

  // Each member gets their own garage: preview keeps it in this browser, signed-in members on the Worker.
  useEffect(() => {
    setReady(false)
    setEntries([])
    if (!memberId) return
    if (previewMode) {
      setEntries(loadPreview(memberId))
      setReady(true)
      return
    }
    let cancelled = false
    fetch('/api/garage', { credentials: 'include' })
      .then((r) => (r.ok ? (r.json() as Promise<{ entries: GarageEntry[] }>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return
        setEntries(data.entries)
        setReady(true)
      })
      .catch(() => {
        // Leave the garage read-only rather than risk overwriting it with stale data.
      })
    return () => {
      cancelled = true
    }
  }, [memberId, previewMode])

  const persist = useCallback(
    (next: GarageEntry[], prev: GarageEntry[]) => {
      if (!memberId || !ready) return
      setEntries(next)
      if (previewMode) {
        try {
          localStorage.setItem(storageKey(memberId), JSON.stringify(next))
        } catch {
          /* storage unavailable: the change lasts until reload */
        }
        return
      }
      // Only the latest save may settle the state, so out-of-order responses cannot win.
      const seq = ++saveSeq.current
      fetch('/api/garage', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entries: next }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status))
        })
        .catch(() => {
          if (seq === saveSeq.current) setEntries(prev)
        })
    },
    [memberId, previewMode, ready],
  )

  const add = useCallback(
    (carId: string) => {
      const car = cars.find((c) => c.id === carId)
      if (!car || entries.some((e) => e.carId === carId) || entries.length >= GARAGE_LIMIT) return
      const today = new Date().toISOString().slice(0, 10)
      persist([...entries, { carId, colour: car.colours[0].hex, acquired: today, lastService: today, mileageKm: 0 }], entries)
    },
    [entries, persist],
  )

  const remove = useCallback(
    (carId: string) =>
      persist(
        entries.filter((e) => e.carId !== carId),
        entries,
      ),
    [entries, persist],
  )

  const update = useCallback(
    (carId: string, patch: Partial<Omit<GarageEntry, 'carId'>>) =>
      persist(
        entries.map((e) => (e.carId === carId ? { ...e, ...patch } : e)),
        entries,
      ),
    [entries, persist],
  )

  const value = useMemo(() => {
    const garageCars = entries.flatMap((entry) => {
      const car = cars.find((c) => c.id === entry.carId)
      return car ? [{ entry, car }] : []
    })
    return { entries, garageCars, isFull: entries.length >= GARAGE_LIMIT, ready, add, remove, update }
  }, [entries, ready, add, remove, update])

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
}

export function useGarage() {
  const ctx = useContext(GarageContext)
  if (!ctx) throw new Error('useGarage must be used inside <GarageProvider>')
  return ctx
}

/**
 * Next service date: last service plus the manufacturer's interval in months,
 * worked out on calendar dates in UTC so it never shifts with the viewer's time zone.
 * A date past the end of the target month lands on its last day (31 Aug + 6 months = 28 Feb).
 */
export function nextServiceDate(entry: GarageEntry, car: Car): Date {
  const [y, m, d] = entry.lastService.split('-').map(Number)
  const target = m - 1 + car.serviceIntervalMonths
  const lastDay = new Date(Date.UTC(y, target + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, target, Math.min(d, lastDay)))
}
