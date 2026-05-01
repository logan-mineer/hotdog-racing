export type Event = {
  name: string
  date: string      // YYYY-MM-DD (start, inclusive)
  endDate?: string  // YYYY-MM-DD (end, inclusive) — only present for multi-day events
  location: string
  series: string
}

export async function fetchEvents(url: string): Promise<Event[]> {
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`iCal fetch failed: ${res.status} ${res.statusText}`)
  return parseIcalText(await res.text())
}

export function parseIcalText(ics: string): Event[] {
  const unfolded = ics.replace(/\r?\n[ \t]/g, '')
  const lines = unfolded.split(/\r?\n/)

  const events: Event[] = []
  let current: Record<string, string> | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
    } else if (line === 'END:VEVENT') {
      if (current) {
        const event = toEvent(current)
        if (event) events.push(event)
        current = null
      }
    } else if (current) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) continue
      const key = line.slice(0, colonIdx).split(';')[0].toUpperCase()
      const value = line.slice(colonIdx + 1)
      current[key] = value
    }
  }

  return events
}

function toEvent(raw: Record<string, string>): Event | null {
  const summary = raw['SUMMARY']
  const dtstart = raw['DTSTART']
  if (!summary || !dtstart) return null

  const startDigits = dtstart.replace(/[^0-9]/g, '')
  if (startDigits.length < 8) return null
  const date = `${startDigits.slice(0, 4)}-${startDigits.slice(4, 6)}-${startDigits.slice(6, 8)}`

  const isAllDay = !dtstart.includes('T')
  let endDate: string | undefined

  const dtend = raw['DTEND']
  if (dtend) {
    const endDigits = dtend.replace(/[^0-9]/g, '')
    if (endDigits.length >= 8) {
      let end = `${endDigits.slice(0, 4)}-${endDigits.slice(4, 6)}-${endDigits.slice(6, 8)}`
      if (isAllDay) {
        // iCal all-day DTEND is exclusive — subtract one day for inclusive display
        const d = new Date(end + 'T00:00:00Z')
        d.setUTCDate(d.getUTCDate() - 1)
        end = d.toISOString().slice(0, 10)
      }
      if (end !== date) endDate = end
    }
  }

  return {
    name: unescape(summary),
    date,
    ...(endDate ? { endDate } : {}),
    location: unescape(raw['LOCATION'] ?? ''),
    series: unescape((raw['CATEGORIES'] ?? '').split(',')[0].trim()),
  }
}

function unescape(value: string): string {
  return value
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\n/gi, ' ')
    .replace(/\\\\/g, '\\')
}
