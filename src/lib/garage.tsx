import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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
  add: (carId: string) => void
  remove: (carId: string) => void
  update: (carId: string, patch: Partial<Omit<GarageEntry, 'carId'>>) => void
}

const KEY = 'scc.garage'
const GarageContext = createContext<GarageState | null>(null)

const DEFAULT_ENTRIES: GarageEntry[] = [
  { carId: 'ferrari-amalfi', colour: '#B3131B', acquired: '2025-09-14', lastService: '2025-11-20', mileageKm: 4820 },
]

function load(): GarageEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GarageEntry[]) : DEFAULT_ENTRIES
  } catch {
    return DEFAULT_ENTRIES
  }
}

export function GarageProvider({ children }: { children: ReactNode }) {
  const { member, previewMode } = useAuth()
  const [entries, setEntries] = useState<GarageEntry[]>(load)

  // Signed-in members keep their garage on the Worker; preview keeps it in this browser.
  useEffect(() => {
    if (!member || previewMode) return
    fetch('/api/garage', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { entries: GarageEntry[] } | null) => data && setEntries(data.entries))
      .catch(() => {})
  }, [member, previewMode])

  const persist = useCallback(
    (next: GarageEntry[]) => {
      setEntries(next)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      if (member && !previewMode) {
        fetch('/api/garage', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ entries: next }),
        }).catch(() => {})
      }
    },
    [member, previewMode],
  )

  const add = useCallback(
    (carId: string) => {
      const car = cars.find((c) => c.id === carId)
      if (!car || entries.some((e) => e.carId === carId) || entries.length >= GARAGE_LIMIT) return
      const today = new Date().toISOString().slice(0, 10)
      persist([...entries, { carId, colour: car.colours[0].hex, acquired: today, lastService: today, mileageKm: 0 }])
    },
    [entries, persist],
  )

  const remove = useCallback((carId: string) => persist(entries.filter((e) => e.carId !== carId)), [entries, persist])

  const update = useCallback(
    (carId: string, patch: Partial<Omit<GarageEntry, 'carId'>>) =>
      persist(entries.map((e) => (e.carId === carId ? { ...e, ...patch } : e))),
    [entries, persist],
  )

  const value = useMemo(() => {
    const garageCars = entries.flatMap((entry) => {
      const car = cars.find((c) => c.id === entry.carId)
      return car ? [{ entry, car }] : []
    })
    return { entries, garageCars, isFull: entries.length >= GARAGE_LIMIT, add, remove, update }
  }, [entries, add, remove, update])

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
}

export function useGarage() {
  const ctx = useContext(GarageContext)
  if (!ctx) throw new Error('useGarage must be used inside <GarageProvider>')
  return ctx
}

/** Next service date: last service plus the manufacturer's interval in months. */
export function nextServiceDate(entry: GarageEntry, car: Car): Date {
  const d = new Date(entry.lastService)
  d.setMonth(d.getMonth() + car.serviceIntervalMonths)
  return d
}
