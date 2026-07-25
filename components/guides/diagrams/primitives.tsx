import type { ReactNode } from 'react'

/**
 * Shared building blocks for every lesson diagram.
 *
 * All colour flows through `C` and `toneHex` below, and every entry resolves to
 * a CSS variable rather than a fixed hex — that is what lets the same SVGs read
 * correctly in both the light and dark themes. The tone names are a categorical
 * palette (they carry no semantic meaning); see `--diagram-*` in globals.css.
 */
export const C = {
  rust: 'var(--diagram-rust)',
  plum: 'var(--diagram-plum)',
  amber: 'var(--diagram-amber)',
  teal: 'var(--diagram-teal)',
  indigo: 'var(--diagram-indigo)',
  ink: 'var(--foreground)',
  muted: 'var(--muted)',
  faint: 'var(--muted)',
  edge: 'var(--border)',
  node: 'var(--card)',
  well: 'var(--background)',
} as const

export type Tone = 'rust' | 'plum' | 'amber' | 'teal' | 'indigo' | 'muted'

const toneHex: Record<Tone, string> = {
  rust: C.rust,
  plum: C.plum,
  amber: C.amber,
  teal: C.teal,
  indigo: C.indigo,
  muted: C.faint,
}

export function hex(tone: Tone): string {
  return toneHex[tone]
}

const TONES: Tone[] = ['rust', 'plum', 'amber', 'teal', 'indigo', 'muted']

export function DiagramShell({
  w = 760,
  h = 440,
  title,
  children,
}: {
  w?: number
  h?: number
  title: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={title}
      className="block h-auto w-full"
      style={{ minWidth: 560 }}
      fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    >
      <title>{title}</title>
      <defs>
        {TONES.map((t) => (
          <marker
            key={t}
            id={`arr-${t}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill={toneHex[t]} />
          </marker>
        ))}
      </defs>
      {children}
    </svg>
  )
}

/** Rounded-rect node with a centered title and optional subtitle. */
export function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone,
  dashed = false,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  sub?: string
  tone?: Tone
  dashed?: boolean
}) {
  const cx = x + w / 2
  const cy = y + h / 2
  const stroke = tone ? toneHex[tone] : C.edge
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={C.node}
        stroke={stroke}
        strokeOpacity={tone ? 0.75 : 1}
        strokeWidth={1.4}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <text
        x={cx}
        y={sub ? cy - 4 : cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={C.ink}
        fontSize={13.5}
        fontWeight={600}
      >
        {title}
      </text>
      {sub && (
        <text
          x={cx}
          y={cy + 13}
          textAnchor="middle"
          dominantBaseline="central"
          fill={C.muted}
          fontSize={10.5}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

/** A larger dashed container used to group nodes, labelled at the top-left. */
export function Zone({
  x,
  y,
  w,
  h,
  label,
  tone = 'muted',
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  tone?: Tone
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={C.well}
        stroke={toneHex[tone]}
        strokeOpacity={0.5}
        strokeWidth={1.2}
        strokeDasharray="6 5"
      />
      <text
        x={x + 14}
        y={y + 20}
        fill={toneHex[tone]}
        fontSize={11}
        fontWeight={700}
        letterSpacing={1.2}
        style={{ textTransform: 'uppercase' }}
      >
        {label.toUpperCase()}
      </text>
    </g>
  )
}

/** Arrow along an SVG path `d`, with an optional label near its midpoint. */
export function Arrow({
  d,
  tone = 'muted',
  dashed = false,
  label,
  lx,
  ly,
}: {
  d: string
  tone?: Tone
  dashed?: boolean
  label?: string
  lx?: number
  ly?: number
}) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={toneHex[tone]}
        strokeOpacity={tone === 'muted' ? 0.9 : 0.8}
        strokeWidth={1.6}
        strokeDasharray={dashed ? '5 4' : undefined}
        markerEnd={`url(#arr-${tone})`}
      />
      {label && lx !== undefined && ly !== undefined && (
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          fill={tone === 'muted' ? C.muted : toneHex[tone]}
          fontSize={10.5}
          fontWeight={500}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** Free-floating caption text. */
export function Caption({
  x,
  y,
  text,
  tone,
  anchor = 'middle',
  size = 10.5,
}: {
  x: number
  y: number
  text: string
  tone?: Tone
  anchor?: 'start' | 'middle' | 'end'
  size?: number
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={tone ? toneHex[tone] : C.muted} fontSize={size}>
      {text}
    </text>
  )
}

/** Numbered step marker. */
export function Step({ x, y, n, tone = 'rust' }: { x: number; y: number; n: number; tone?: Tone }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={10}
        fill={toneHex[tone]}
        fillOpacity={0.15}
        stroke={toneHex[tone]}
        strokeWidth={1.2}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={toneHex[tone]}
        fontSize={11}
        fontWeight={700}
      >
        {n}
      </text>
    </g>
  )
}

/** Small mono-spaced chip, used for tokens, ids, and payload snippets. */
export function Chip({
  x,
  y,
  text,
  tone = 'muted',
}: {
  x: number
  y: number
  text: string
  tone?: Tone
}) {
  const wid = text.length * 6.4 + 16
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={wid}
        height={20}
        rx={6}
        fill={toneHex[tone]}
        fillOpacity={0.12}
        stroke={toneHex[tone]}
        strokeOpacity={0.55}
        strokeWidth={1}
      />
      <text
        x={x + wid / 2}
        y={y + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fill={tone === 'muted' ? C.muted : toneHex[tone]}
        fontSize={10}
        fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
      >
        {text}
      </text>
    </g>
  )
}
