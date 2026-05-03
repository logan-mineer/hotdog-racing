export type ResumeEntry = {
  year: string
  series: string
  result: string
  detail?: string
}

export const resumeEntries: ResumeEntry[] = [
  {
    year: '2025',
    series: 'Drift-PDX SDC Oregon Series',
    result: '1st Overall',
    detail: '3 round wins, 1 second place, 1 TQ',
  },
  {
    year: '2025',
    series: 'SDC World Finals',
    result: 'Top 32',
    detail: 'Qualified 22nd overall',
  },
  {
    year: '2024',
    series: 'Protek PDX Underground Drift Series',
    result: '3rd Overall',
    detail: '2 podium finishes',
  },
  {
    year: '2024',
    series: 'PDX Underground Tandem Tuesday Series',
    result: '1st Overall',
    detail: '2 round wins',
  },
  {
    year: '2024',
    series: 'PDX Underground SDC Oregon Series',
    result: '2nd Overall',
    detail: '2 round wins, 1 TQ',
  },
  {
    year: '2024',
    series: 'SDC World Finals',
    result: 'Top 48',
    detail: 'Qualified 39th overall',
  },
]

export type SpecRow = {
  label: string
  value: string
}

export const buildSpecs: SpecRow[] = [
  { label: 'Chassis', value: 'Yokomo MD 3.0' },
  { label: 'Hardware', value: '1up Pro Duty Titanium Screws/Bearings/Turnbuckles' },
  { label: 'ESC', value: 'Acuvance Xarvis XX' },
  { label: 'Motor', value: 'Acuvance Agile 10.5 / LV45 Rotor' },
  { label: 'Capacitor', value: 'Acuvance Blaze' },
  { label: 'Servo', value: 'Futaba CD-700' },
  { label: 'Gyro', value: 'Futaba GYD-550' },
  { label: 'Receiver', value: 'Futaba R404SBS-E' },
  { label: 'Transmitter', value: 'Futaba 10-PX' },
  { label: 'Competition Body', value: 'ReveD GR Corolla' },
]

