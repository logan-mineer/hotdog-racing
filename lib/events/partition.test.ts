import { describe, it, expect } from 'vitest'
import { partitionEvents } from './partition'
import type { Event } from './config'

const events: Event[] = [
  { name: 'Far Future', date: '2026-06-01', location: 'Portland, OR', series: 'Series A' },
  { name: 'Near Future', date: '2026-05-01', location: 'Portland, OR', series: 'Series A' },
  { name: 'Recent Past', date: '2025-11-15', location: 'Las Vegas, NV', series: 'Series B' },
  { name: 'Old Past', date: '2024-04-10', location: 'Portland, OR', series: 'Series A' },
]

const ref = new Date('2026-04-30T00:00:00Z')

describe('partitionEvents', () => {
  it('splits upcoming and past correctly', () => {
    const { upcoming, past } = partitionEvents(events, ref)
    expect(upcoming.map(e => e.name)).toEqual(['Near Future', 'Far Future'])
    expect(past.map(e => e.name)).toEqual(['Recent Past', 'Old Past'])
  })

  it('sorts upcoming ascending by date', () => {
    const { upcoming } = partitionEvents(events, ref)
    for (let i = 0; i < upcoming.length - 1; i++) {
      expect(upcoming[i].date <= upcoming[i + 1].date).toBe(true)
    }
  })

  it('sorts past descending by date', () => {
    const { past } = partitionEvents(events, ref)
    for (let i = 0; i < past.length - 1; i++) {
      expect(past[i].date >= past[i + 1].date).toBe(true)
    }
  })

  it('treats an event on the reference date as upcoming', () => {
    const sameDay: Event[] = [{ name: 'Today', date: '2026-04-30', location: 'X', series: 'Y' }]
    const { upcoming, past } = partitionEvents(sameDay, ref)
    expect(upcoming).toHaveLength(1)
    expect(past).toHaveLength(0)
  })

  it('returns empty arrays for empty input', () => {
    const { upcoming, past } = partitionEvents([], ref)
    expect(upcoming).toHaveLength(0)
    expect(past).toHaveLength(0)
  })
})
