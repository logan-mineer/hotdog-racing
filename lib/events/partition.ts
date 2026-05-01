import type { Event } from './config'

export function partitionEvents(
  events: Event[],
  referenceDate: Date,
): { upcoming: Event[]; past: Event[] } {
  const today = referenceDate.toISOString().slice(0, 10)
  const upcoming = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const past = events
    .filter(e => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))
  return { upcoming, past }
}
