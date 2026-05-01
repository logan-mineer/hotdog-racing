import { describe, it, expect } from 'vitest'
import { parseIcalText } from './ical'

const FIXTURE = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260517
DTEND;VALUE=DATE:20260518
SUMMARY:SDC Oregon Series — Round 1
LOCATION:Drift-PDX\\, Portland OR
CATEGORIES:Super Drift Championship
UID:abc123@google.com
END:VEVENT
BEGIN:VEVENT
DTSTART:20260710T170000Z
DTEND:20260710T230000Z
SUMMARY:Drift to Death 3
LOCATION:Drift-PDX\\, Portland OR
CATEGORIES:Matsuri
UID:def456@google.com
END:VEVENT
BEGIN:VEVENT
DTSTART;TZID=America/Los_Angeles:20251115T090000
SUMMARY:SDC World Finals 2025
LOCATION:Las Vegas\\, NV
CATEGORIES:Super Drift Championship
UID:ghi789@google.com
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260601
SUMMARY:Event with folded line
 continuation here
LOCATION:
CATEGORIES:Series A,Series B
UID:fold001@google.com
END:VEVENT
BEGIN:VEVENT
SUMMARY:Missing DTSTART — should be skipped
LOCATION:Nowhere
UID:bad001@google.com
END:VEVENT
END:VCALENDAR`

describe('parseIcalText', () => {
  it('parses all-day events (VALUE=DATE)', () => {
    const events = parseIcalText(FIXTURE)
    const event = events.find(e => e.name === 'SDC Oregon Series — Round 1')!
    expect(event).toBeDefined()
    expect(event.date).toBe('2026-05-17')
    expect(event.location).toBe('Drift-PDX, Portland OR')
    expect(event.series).toBe('Super Drift Championship')
  })

  it('omits endDate for single-day events (DTEND is next day for all-day)', () => {
    const events = parseIcalText(FIXTURE)
    const event = events.find(e => e.name === 'SDC Oregon Series — Round 1')!
    expect(event.endDate).toBeUndefined()
  })

  it('sets endDate (inclusive) for multi-day all-day events', () => {
    const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260807
DTEND;VALUE=DATE:20260810
SUMMARY:Multi-Day Event
LOCATION:Portland OR
CATEGORIES:Matsuri
UID:multi001@google.com
END:VEVENT
END:VCALENDAR`
    const events = parseIcalText(ics)
    expect(events[0].date).toBe('2026-08-07')
    expect(events[0].endDate).toBe('2026-08-09')
  })

  it('parses UTC datetime events', () => {
    const events = parseIcalText(FIXTURE)
    const event = events.find(e => e.name === 'Drift to Death 3')!
    expect(event).toBeDefined()
    expect(event.date).toBe('2026-07-10')
  })

  it('parses TZID datetime events', () => {
    const events = parseIcalText(FIXTURE)
    const event = events.find(e => e.name === 'SDC World Finals 2025')!
    expect(event).toBeDefined()
    expect(event.date).toBe('2025-11-15')
  })

  it('unescapes iCal-encoded characters in LOCATION', () => {
    const events = parseIcalText(FIXTURE)
    const event = events.find(e => e.name === 'SDC Oregon Series — Round 1')!
    expect(event.location).toBe('Drift-PDX, Portland OR')
  })

  it('takes the first CATEGORIES value when multiple are present', () => {
    const events = parseIcalText(FIXTURE)
    // iCal unfolding removes CRLF + leading whitespace, joining without a space
    const event = events.find(e => e.name === 'Event with folded linecontinuation here')!
    expect(event).toBeDefined()
    expect(event.series).toBe('Series A')
  })

  it('skips events with no DTSTART', () => {
    const events = parseIcalText(FIXTURE)
    expect(events.find(e => e.name === 'Missing DTSTART — should be skipped')).toBeUndefined()
  })

  it('returns empty array for empty calendar', () => {
    expect(parseIcalText('BEGIN:VCALENDAR\nEND:VCALENDAR')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseIcalText('')).toEqual([])
  })
})
