import { events, type ClubEvent } from '@/data/events'

export const DAY_MS = 86_400_000

export function upcomingEvents(now = new Date()): ClubEvent[] {
  return events
    .filter((e) => new Date(e.endDate ?? e.date).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function daysUntil(date: Date, now = new Date()): number {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return Math.round((b - a) / DAY_MS)
}

export const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
export const fmtLong = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
export const fmtTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export function inDays(n: number): string {
  if (n <= 0) return 'today'
  if (n === 1) return 'tomorrow'
  return `in ${n} days`
}
