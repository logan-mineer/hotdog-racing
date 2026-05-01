export type Event = {
  name: string
  date: string // ISO 8601 YYYY-MM-DD
  location: string
  series: string
}

export const events: Event[] = [
  {
    name: 'SDC Oregon Series — Round 1',
    date: '2026-05-17',
    location: 'Drift-PDX, Portland OR',
    series: 'Super Drift Championship',
  },
  {
    name: 'Drift to Death 3',
    date: '2026-07-10',
    location: 'Drift-PDX, Portland OR',
    series: 'Matsuri',
  },
  {
    name: 'SDC World Finals 2025',
    date: '2025-11-15',
    location: 'Las Vegas, NV',
    series: 'Super Drift Championship',
  },
  {
    name: 'SDC Oregon Series — Round 4',
    date: '2025-08-16',
    location: 'Drift-PDX, Portland OR',
    series: 'Super Drift Championship',
  },
  {
    name: 'Drift to Death 2',
    date: '2025-07-04',
    location: 'Drift-PDX, Portland OR',
    series: 'Matsuri',
  },
  {
    name: 'SDC Oregon Series — Round 1',
    date: '2025-04-12',
    location: 'Drift-PDX, Portland OR',
    series: 'Super Drift Championship',
  },
]
