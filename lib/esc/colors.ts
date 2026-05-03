function hexToComponents(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function rgbLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function hexLuminance(hex: string): number {
  return rgbLuminance(...hexToComponents(hex))
}

function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l < 0.5 ? d / (max + min) : d / (2 - max - min)
  let h = 0
  if (max === r) h = ((g - b) / d + 6) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60)       { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) {        g = c; b = x }
  else if (h < 240) {        g = x; b = c }
  else if (h < 300) { r = x;        b = c }
  else              { r = c;        b = x }
  return [r + m, g + m, b + m]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Returns the --surface CSS variable value from the document root, or a fallback.
export function readSurfaceColor(): string {
  if (typeof window === 'undefined') return '#ffffff'
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--surface').trim() || '#ffffff'
}

// Derives a complement-hue ghost color (H+180°) with lightness binary-searched
// to just exceed 3:1 WCAG contrast against the given surface color.
// Adapts to both light (#ffffff) and dark (#1a1a1a) surfaces automatically.
export function accentToGhost(accentHex: string, surfaceHex: string): string {
  const [ar, ag, ab] = hexToComponents(accentHex)
  const [h, s] = rgbToHsl(ar, ag, ab)
  const compHue = (h + 180) % 360
  const compS = Math.min(s, 0.8)
  const surfaceLum = hexLuminance(surfaceHex)
  const onDark = surfaceLum < 0.18

  // Binary search for the lightness boundary where contrast just hits 3:1.
  // Dark surface → find minimum L bright enough. Light surface → find maximum L dark enough.
  let lo = 0.0, hi = 1.0
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    const [cr, cg, cb] = hslToRgb(compHue, compS, mid)
    const ratio = contrastRatio(rgbLuminance(cr, cg, cb), surfaceLum)
    if (onDark ? ratio < 3.0 : ratio >= 3.0) lo = mid
    else hi = mid
  }
  const [cr, cg, cb] = hslToRgb(compHue, compS, (lo + hi) / 2)
  return rgbToHex(cr, cg, cb)
}
