const BLUEPRINT_PRIMARY = 'rgba(255, 0, 32, 0.85)'
const BLUEPRINT_SECONDARY = 'rgba(255, 0, 32, 0.55)'
const BLUEPRINT_DASH = 'rgba(255, 0, 32, 0.25)'
const BLUEPRINT_LABEL = 'rgba(255, 0, 32, 0.45)'
const BLUEPRINT_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

type BlueprintProps = {
  className?: string
}

export function SuspensionBlueprint({ className }: BlueprintProps) {
  return (
    <svg viewBox="0 0 280 200" className={className} aria-hidden="true">
      <g>
        <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
          TOP
        </text>
        <line x1="20" y1="50" x2="260" y2="50" stroke={BLUEPRINT_DASH} strokeDasharray="3 3" />
        <line x1="140" y1="18" x2="140" y2="82" stroke="rgba(255, 0, 32, 0.18)" strokeDasharray="2 2" />
        <rect x="80" y="30" width="120" height="40" rx="3" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <rect x="40" y="20" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        <rect x="40" y="68" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        <g transform="rotate(-4 224 26)">
          <rect x="208" y="20" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        </g>
        <g transform="rotate(4 224 74)">
          <rect x="208" y="68" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        </g>
        <line x1="224" y1="32" x2="224" y2="68" stroke={BLUEPRINT_DASH} />
      </g>
      <g transform="translate(0, 110)">
        <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
          FRONT
        </text>
        <line x1="20" y1="78" x2="260" y2="78" stroke={BLUEPRINT_SECONDARY} />
        <line x1="60" y1="28" x2="60" y2="78" stroke="rgba(255, 0, 32, 0.18)" strokeDasharray="2 2" />
        <line x1="220" y1="28" x2="220" y2="78" stroke="rgba(255, 0, 32, 0.18)" strokeDasharray="2 2" />
        <line x1="65" y1="28" x2="55" y2="76" stroke={BLUEPRINT_PRIMARY} strokeWidth="2" />
        <ellipse cx="55" cy="76" rx="7" ry="2" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <line x1="215" y1="28" x2="225" y2="76" stroke={BLUEPRINT_PRIMARY} strokeWidth="2" />
        <ellipse cx="225" cy="76" rx="7" ry="2" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <rect x="115" y="36" width="50" height="30" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <line x1="115" y1="40" x2="65" y2="32" stroke={BLUEPRINT_SECONDARY} />
        <line x1="165" y1="40" x2="215" y2="32" stroke={BLUEPRINT_SECONDARY} />
        <line x1="115" y1="62" x2="55" y2="72" stroke={BLUEPRINT_SECONDARY} />
        <line x1="165" y1="62" x2="225" y2="72" stroke={BLUEPRINT_SECONDARY} />
        <circle cx="115" cy="40" r="1.5" fill={BLUEPRINT_PRIMARY} />
        <circle cx="165" cy="40" r="1.5" fill={BLUEPRINT_PRIMARY} />
        <circle cx="115" cy="62" r="1.5" fill={BLUEPRINT_PRIMARY} />
        <circle cx="165" cy="62" r="1.5" fill={BLUEPRINT_PRIMARY} />
      </g>
    </svg>
  )
}

export function EscBlueprint({ className }: BlueprintProps) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden="true">
      <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
        ESC
      </text>
      <line x1="18" y1="86" x2="148" y2="86" stroke={BLUEPRINT_SECONDARY} />
      <line x1="18" y1="20" x2="18" y2="86" stroke={BLUEPRINT_SECONDARY} />
      <line x1="18" y1="86" x2="18" y2="89" stroke={BLUEPRINT_SECONDARY} />
      <line x1="83" y1="86" x2="83" y2="89" stroke={BLUEPRINT_DASH} />
      <line x1="148" y1="86" x2="148" y2="89" stroke={BLUEPRINT_SECONDARY} />
      <line x1="18" y1="86" x2="148" y2="22" stroke={BLUEPRINT_DASH} strokeDasharray="2 2" />
      <path
        d="M 18 86 C 35 82, 50 76, 65 65 C 75 55, 80 38, 95 30 C 110 26, 125 22, 148 18"
        stroke={BLUEPRINT_PRIMARY}
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="83" cy="42" r="1.8" fill={BLUEPRINT_PRIMARY} />
      <text x="88" y="40" fontSize="5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="0.5">
        BOOST
      </text>
      <text x="22" y="100" fontSize="5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="1">
        THROTTLE
      </text>
    </svg>
  )
}

export function GyroBlueprint({ className }: BlueprintProps) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden="true">
      <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
        GYRO
      </text>
      <path d="M 30 86 A 50 50 0 0 1 130 86" stroke={BLUEPRINT_DASH} strokeDasharray="2 3" fill="none" />
      <line x1="30" y1="86" x2="30" y2="92" stroke={BLUEPRINT_SECONDARY} />
      <line x1="130" y1="86" x2="130" y2="92" stroke={BLUEPRINT_SECONDARY} />
      <line x1="80" y1="86" x2="80" y2="38" stroke={BLUEPRINT_DASH} strokeDasharray="2 2" />
      <line x1="80" y1="86" x2="115" y2="51" stroke={BLUEPRINT_PRIMARY} strokeWidth="2" />
      <g transform="rotate(-45 115 51)">
        <rect x="108" y="41" width="14" height="20" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.4" fill="none" />
      </g>
      <path d="M 80 70 A 16 16 0 0 1 91 78" stroke={BLUEPRINT_SECONDARY} fill="none" />
      <circle cx="80" cy="86" r="2.5" fill={BLUEPRINT_PRIMARY} />
      <text x="22" y="100" fontSize="5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="1">
        STEER ANGLE
      </text>
    </svg>
  )
}
