import type { ComponentType } from 'react'

export type MemorabiliaProps = { className?: string }

// Line-art geometry helpers. Angles are in degrees, counter-clockwise from 3 o'clock,
// the way a dial is read. SVG y runs downwards, so y is subtracted.
const round = (n: number) => Math.round(n * 100) / 100

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180
  return [round(cx + r * Math.cos(rad)), round(cy - r * Math.sin(rad))] as const
}

// Arc from one angle to another, travelling clockwise on screen (decreasing angle).
const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const [x1, y1] = polar(cx, cy, r, from)
  const [x2, y2] = polar(cx, cy, r, to)
  const large = Math.abs(from - to) > 180 ? 1 : 0
  return `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

// Tapered spoke polygon running from radius r0 (half-width w0) to radius r1 (half-width w1).
const taper = (cx: number, cy: number, r0: number, w0: number, r1: number, w1: number, deg: number) => {
  const rad = (deg * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = -Math.sin(rad)
  const px = -uy
  const py = ux
  const bx = cx + r0 * ux
  const by = cy + r0 * uy
  const ex = cx + r1 * ux
  const ey = cy + r1 * uy
  const pts: [number, number][] = [
    [bx + px * w0, by + py * w0],
    [ex + px * w1, ey + py * w1],
    [ex - px * w1, ey - py * w1],
    [bx - px * w0, by - py * w0],
  ]
  return pts.map(([x, y]) => `${round(x)},${round(y)}`).join(' ')
}

const pathFrom = (pts: readonly (readonly [number, number])[]) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')

const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

// Rev counter: 270 degree sweep, 0 at lower left, 9 at lower right.
const TACH_START = 225
const TACH_STEP = 30
const tachAngle = (v: number) => TACH_START - v * TACH_STEP

export function Tachometer({ className }: MemorabiliaProps) {
  const ticks = Array.from({ length: 19 }, (_, i) => {
    const v = i / 2
    const major = Number.isInteger(v)
    const a = tachAngle(v)
    const [x1, y1] = polar(100, 100, major ? 82 : 84, a)
    const [x2, y2] = polar(100, 100, major ? 70 : 78, a)
    return <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />
  })

  const numerals = Array.from({ length: 10 }, (_, v) => {
    const [x, y] = polar(100, 100, 58, tachAngle(v))
    return (
      <text
        key={`n${v}`}
        x={x}
        y={y}
        fill="currentColor"
        stroke="none"
        fontFamily="'Instrument Sans Variable', sans-serif"
        fontSize={11}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {v}
      </text>
    )
  })

  const needleTip = polar(100, 100, 74, tachAngle(6.2))
  const needleTail = polar(100, 100, 14, tachAngle(6.2) + 180)

  return (
    <svg {...LINE} viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <circle cx={100} cy={100} r={96} />
      <circle cx={100} cy={100} r={90} />
      <path d={arc(100, 100, 96, tachAngle(7), tachAngle(9))} strokeWidth={4} />
      <g>{ticks}</g>
      <g>{numerals}</g>
      <path d={`M${needleTail[0]} ${needleTail[1]} L${needleTip[0]} ${needleTip[1]}`} strokeWidth={2} />
      <circle cx={100} cy={100} r={7} />
      <circle cx={100} cy={100} r={2.5} fill="currentColor" />
    </svg>
  )
}

// Chequered flag: a waving flag on a pole, its squares filled at low opacity.
const flagPoint = (u: number, v: number) => {
  const wave = Math.sin(u * Math.PI * 1.5 + 0.3) * (4 + 14 * u)
  const top = 60 + 8 * u + wave
  const h = 76 + 8 * u
  return [round(34 + 136 * u), round(top + v * h)] as const
}

const FLAG_STEPS = 24
const flagTop = Array.from({ length: FLAG_STEPS + 1 }, (_, i) => flagPoint(i / FLAG_STEPS, 0))
const flagBottom = Array.from({ length: FLAG_STEPS + 1 }, (_, i) => flagPoint(i / FLAG_STEPS, 1))
const flagOutline = pathFrom([...flagTop, ...flagBottom.slice().reverse()]) + ' Z'

const FLAG_COLS = 6
const FLAG_ROWS = 4
const flagSquares = Array.from({ length: FLAG_COLS * FLAG_ROWS }, (_, k) => {
  const i = k % FLAG_COLS
  const j = Math.floor(k / FLAG_COLS)
  if ((i + j) % 2 !== 0) return null
  const corners = [
    flagPoint(i / FLAG_COLS, j / FLAG_ROWS),
    flagPoint((i + 1) / FLAG_COLS, j / FLAG_ROWS),
    flagPoint((i + 1) / FLAG_COLS, (j + 1) / FLAG_ROWS),
    flagPoint(i / FLAG_COLS, (j + 1) / FLAG_ROWS),
  ]
  return <polygon key={k} points={corners.map(([x, y]) => `${x},${y}`).join(' ')} fill="currentColor" fillOpacity={0.3} stroke="none" />
})

export function ChequeredFlag({ className }: MemorabiliaProps) {
  return (
    <svg {...LINE} viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <path d={flagOutline} />
      {flagSquares}
      <path d="M34 12 V194" strokeWidth={1.75} />
      <circle cx={34} cy={10} r={3.5} fill="currentColor" />
    </svg>
  )
}

// Three-spoke sports wheel with a top centre marker.
const WHEEL_SPOKES = [210, 270, 330]

export function SteeringWheel({ className }: MemorabiliaProps) {
  return (
    <svg {...LINE} viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <circle cx={100} cy={100} r={88} />
      <circle cx={100} cy={100} r={76} />
      <circle cx={100} cy={100} r={82} strokeDasharray="1.5 5" strokeWidth={1} />
      <rect x={93} y={12} width={14} height={12} fill="currentColor" fillOpacity={0.35} />
      {WHEEL_SPOKES.map((a) => (
        <polygon key={a} points={taper(100, 100, 26, 9, 78, 13, a)} />
      ))}
      <circle cx={100} cy={100} r={24} />
      <circle cx={100} cy={100} r={9} />
    </svg>
  )
}

// Piston with crown, rings, wrist pin and connecting rod.
export function Piston({ className }: MemorabiliaProps) {
  return (
    <svg {...LINE} viewBox="0 0 120 200" className={className} aria-hidden="true" focusable="false">
      <path d="M28 66 C28 48 40 38 60 38 C80 38 92 48 92 66" />
      <path d="M28 66 V140 Q28 150 38 150 H82 Q92 150 92 140 V66" />
      <path d="M28 76 H92" />
      <path d="M28 84 H92" />
      <path d="M28 96 H36 M84 96 H92" strokeWidth={1} />
      <rect x={22} y={118} width={76} height={8} rx={4} />
      <path d="M52 150 L48 170 M68 150 L72 170" />
      <circle cx={60} cy={182} r={12} />
      <circle cx={60} cy={182} r={4} />
    </svg>
  )
}

// Spark plug: terminal, ribbed ceramic insulator, hex shell, threaded body and electrode.
export function SparkPlug({ className }: MemorabiliaProps) {
  const threads = Array.from({ length: 5 }, (_, k) => {
    const y = 150 + k * 5
    return <path key={k} d={`M40 ${y} L60 ${y + 2.5}`} strokeWidth={1} />
  })
  return (
    <svg {...LINE} viewBox="0 0 100 200" className={className} aria-hidden="true" focusable="false">
      <rect x={40} y={8} width={20} height={14} rx={4} />
      <path d="M36 22 H64 V48 H76 V58 H64 V68 H76 V78 H64 V92 Q64 96 60 96 H40 Q36 96 36 92 V78 H24 V68 H36 V58 H24 V48 H36 Z" />
      <rect x={28} y={120} width={44} height={26} rx={2} />
      <path d="M28 128 H72 M28 138 H72" strokeWidth={1} />
      <path d="M40 146 V172 M60 146 V172" />
      {threads}
      <path d="M40 172 L46 192 H54 L60 172" />
      <path d="M50 192 V198" />
    </svg>
  )
}

// Car key fob: rounded body, four buttons and a central badge.
export function KeyFob({ className }: MemorabiliaProps) {
  return (
    <svg {...LINE} viewBox="0 0 140 200" className={className} aria-hidden="true" focusable="false">
      <circle cx={70} cy={10} r={9} />
      <rect x={20} y={20} width={100} height={160} rx={34} />
      <rect x={30} y={30} width={80} height={140} rx={26} strokeWidth={0.75} />
      <circle cx={70} cy={40} r={2} fill="currentColor" />
      <rect x={44} y={56} width={22} height={20} rx={10} />
      <rect x={74} y={56} width={22} height={20} rx={10} />
      <rect x={44} y={86} width={22} height={20} rx={10} />
      <rect x={74} y={86} width={22} height={20} rx={10} />
      <circle cx={70} cy={138} r={18} />
      <circle cx={70} cy={138} r={6} />
    </svg>
  )
}

// Classic racing cup on a two-tier plinth.
export function Trophy({ className }: MemorabiliaProps) {
  return (
    <svg {...LINE} viewBox="0 0 200 210" className={className} aria-hidden="true" focusable="false">
      <ellipse cx={100} cy={30} rx={54} ry={6} />
      <path d="M46 30 C46 96 72 126 100 126 C128 126 154 96 154 30" />
      <path d="M52 62 Q100 76 148 62" strokeWidth={1} />
      <path d="M50 50 C30 46 22 66 26 82 C30 98 44 102 58 96" />
      <path d="M150 50 C170 46 178 66 174 82 C170 98 156 102 142 96" />
      <path d="M92 126 L94 166 H106 L108 126" />
      <rect x={84} y={166} width={32} height={8} rx={2} />
      <rect x={60} y={174} width={80} height={12} rx={2} />
      <rect x={46} y={186} width={108} height={16} rx={2} />
    </svg>
  )
}

// Oval rally plaque with an inset border and a four-point compass star.
export function RallyPlaque({ className }: MemorabiliaProps) {
  return (
    <svg {...LINE} viewBox="0 0 240 160" className={className} aria-hidden="true" focusable="false">
      <ellipse cx={120} cy={80} rx={112} ry={72} />
      <ellipse cx={120} cy={80} rx={102} ry={64} strokeWidth={0.75} />
      <path d="M120 54 L126 74 L146 80 L126 86 L120 106 L114 86 L94 80 L114 74 Z" />
      <path d="M74 36 H166 M74 124 H166" strokeWidth={0.75} />
      <circle cx={120} cy={80} r={2} fill="currentColor" />
    </svg>
  )
}

// Tyre side view: tread blocks around the outer edge and a five-spoke rim.
const TYRE_SPOKES = [18, 90, 162, 234, 306]

export function Tyre({ className }: MemorabiliaProps) {
  const blocks = Array.from({ length: 45 }, (_, k) => {
    const a = k * 8
    const [x1, y1] = polar(100, 100, 84, a)
    const [x2, y2] = polar(100, 100, 95, a)
    return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={k % 2 ? 1 : 1.5} />
  })
  return (
    <svg {...LINE} viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <circle cx={100} cy={100} r={95} />
      <circle cx={100} cy={100} r={82} />
      <g>{blocks}</g>
      <circle cx={100} cy={100} r={60} />
      <circle cx={100} cy={100} r={52} strokeWidth={0.75} />
      {TYRE_SPOKES.map((a) => (
        <polygon key={a} points={taper(100, 100, 16, 3, 50, 8, a)} />
      ))}
      <circle cx={100} cy={100} r={14} />
      <circle cx={100} cy={100} r={4} fill="currentColor" />
    </svg>
  )
}

// Racing roundel with a dotted ring and a serif race number.
export function RaceNumber({ className, number = 7 }: MemorabiliaProps & { number?: number }) {
  const label = String(number)
  const size = label.length >= 3 ? 56 : label.length === 2 ? 80 : 110
  const dots = Array.from({ length: 32 }, (_, k) => {
    const [x, y] = polar(100, 100, 89, k * 11.25)
    return <circle key={k} cx={x} cy={y} r={1.1} fill="currentColor" stroke="none" />
  })
  return (
    <svg {...LINE} viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <circle cx={100} cy={100} r={94} />
      <circle cx={100} cy={100} r={84} />
      <circle cx={100} cy={100} r={72} strokeWidth={0.75} />
      <g>{dots}</g>
      <text
        x={100}
        y={101}
        fill="currentColor"
        stroke="none"
        fontFamily="'Instrument Serif', serif"
        fontSize={size}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {label}
      </text>
    </svg>
  )
}

export const MEMORABILIA: { name: string; Component: ComponentType<MemorabiliaProps> }[] = [
  { name: 'Tachometer', Component: Tachometer },
  { name: 'Chequered flag', Component: ChequeredFlag },
  { name: 'Steering wheel', Component: SteeringWheel },
  { name: 'Piston', Component: Piston },
  { name: 'Spark plug', Component: SparkPlug },
  { name: 'Key fob', Component: KeyFob },
  { name: 'Trophy', Component: Trophy },
  { name: 'Rally plaque', Component: RallyPlaque },
  { name: 'Tyre', Component: Tyre },
  { name: 'Race number', Component: RaceNumber },
]
