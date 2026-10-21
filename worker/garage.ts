import type { GarageEntry } from './types'

const MAX_ENTRIES = 2
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value))
}

/** Returns a clean copy of the entries, or null when the input is not acceptable. Unknown keys are dropped. */
export function validateGarage(input: unknown): GarageEntry[] | null {
  if (!Array.isArray(input) || input.length > MAX_ENTRIES) return null
  const seen = new Set<string>()
  const out: GarageEntry[] = []
  for (const raw of input) {
    if (typeof raw !== 'object' || raw === null) return null
    const e = raw as Record<string, unknown>
    if (typeof e.carId !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(e.carId)) return null
    if (seen.has(e.carId)) return null
    seen.add(e.carId)
    if (typeof e.colour !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(e.colour)) return null
    if (!isIsoDate(e.acquired) || !isIsoDate(e.lastService)) return null
    if (typeof e.mileageKm !== 'number' || !Number.isFinite(e.mileageKm) || e.mileageKm < 0 || e.mileageKm > 2_000_000) {
      return null
    }
    out.push({
      carId: e.carId,
      colour: e.colour,
      acquired: e.acquired,
      lastService: e.lastService,
      mileageKm: Math.round(e.mileageKm),
    })
  }
  return out
}

export async function readGarage(kv: KVNamespace, memberId: string): Promise<GarageEntry[]> {
  const stored = await kv.get(`garage:${memberId}`, 'json')
  return validateGarage(stored) ?? []
}

export async function writeGarage(kv: KVNamespace, memberId: string, entries: GarageEntry[]): Promise<void> {
  await kv.put(`garage:${memberId}`, JSON.stringify(entries))
}
