/** The club is in the UK, so every event date and time is shown in London time whatever the viewer's zone. */
export const CLUB_TIME_ZONE = 'Europe/London'

export const DAY_MS = 86_400_000

const tz = { timeZone: CLUB_TIME_ZONE } as const

export const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', ...tz })
export const fmtLong = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', ...tz })
export const fmtTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', ...tz })
export const fmtMonthYear = (d: Date) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', ...tz })

/** The calendar day of an instant in London, as a UTC-midnight timestamp so days can be subtracted. */
function londonDay(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric', ...tz }).formatToParts(d)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return Date.UTC(get('year'), get('month') - 1, get('day'))
}

/** Whole calendar days from today to an event, counted on London calendar days. */
export function daysUntil(date: Date, now = new Date()): number {
  return Math.round((londonDay(date) - londonDay(now)) / DAY_MS)
}

/**
 * Whole calendar days from today to a date-only value ('YYYY-MM-DD' parsed as UTC midnight),
 * with both sides taken as UTC calendar dates so the viewer's time zone never shifts the answer.
 */
export function daysUntilDate(date: Date, now = new Date()): number {
  const a = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const b = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.round((b - a) / DAY_MS)
}

export function inDays(n: number): string {
  if (n <= 0) return 'today'
  if (n === 1) return 'tomorrow'
  return `in ${n} days`
}
