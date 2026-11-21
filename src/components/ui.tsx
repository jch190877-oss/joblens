import type { ReactNode } from 'react'
import { CheckCircle, Minus, XMark, HelpCircle, ArrowRight } from './icons'
import type { Status } from '../data/demo'

/* ---------------------------------------------------------------- 容器 */

export function Shell({
  children,
  className = '',
  wide = false,
}: {
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div className={`mx-auto w-full ${wide ? 'max-w-[1360px]' : 'max-w-[1180px]'} px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- 按钮 */

type BtnProps = {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'ghost' | 'outline' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  className?: string
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
}: BtnProps) {
  const sizes = {
    sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-[13.5px] gap-2 rounded-[10px]',
    lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
  }[size]

  const variants = {
    primary:
      'bg-brand-500 text-[#08090C] font-semibold hover:bg-brand-400 shadow-[0_8px_28px_-10px] shadow-brand-500/70',
    ghost: 'text-fg-muted hover:text-fg hover:bg-ink-800',
    outline:
      'border border-ink-600 bg-ink-850/60 text-fg hover:border-ink-500 hover:bg-ink-800 backdrop-blur',
    soft: 'bg-brand-500/12 text-brand-300 border border-brand-500/25 hover:bg-brand-500/20',
  }[variant]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-200 active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-40 ${sizes} ${variants} ${className}`}
    >
      {children}
      {icon}
    </button>
  )
}

/* ---------------------------------------------------------------- 标签 */

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.13em] text-fg-dim ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-brand-500" />
      {children}
    </div>
  )
}

export function Tag({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: 'neutral' | 'brand' | 'ok' | 'warn' | 'bad' | 'info'
  className?: string
}) {
  const tones = {
    neutral: 'bg-ink-800 text-fg-muted border-ink-600',
    brand: 'bg-brand-500/12 text-brand-300 border-brand-500/30',
    ok: 'bg-ok/12 text-ok border-ok/30',
    warn: 'bg-warn/12 text-warn border-warn/30',
    bad: 'bg-bad/12 text-bad border-bad/30',
    info: 'bg-info/12 text-info border-info/30',
  }[tone]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] leading-none tracking-wide ${tones} ${className}`}
    >
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------- 四态 */

export const STATUS_META: Record<
  Status,
  { label: string; tone: 'ok' | 'warn' | 'bad' | 'info'; bg: string; bar: string; text: string; ring: string; Icon: typeof CheckCircle }
> = {
  met: {
    label: '满足',
    tone: 'ok',
    bg: 'bg-ok/10',
    bar: 'bg-ok',
    text: 'text-ok',
    ring: 'ring-ok/30',
    Icon: CheckCircle,
  },
  partial: {
    label: '部分满足',
    tone: 'warn',
    bg: 'bg-warn/10',
    bar: 'bg-warn',
    text: 'text-warn',
    ring: 'ring-warn/30',
    Icon: Minus,
  },
  missing: {
    label: '不满足',
    tone: 'bad',
    bg: 'bg-bad/10',
    bar: 'bg-bad',
    text: 'text-bad',
    ring: 'ring-bad/30',
    Icon: XMark,
  },
  unverified: {
    label: '待核实',
    tone: 'info',
    bg: 'bg-info/10',
    bar: 'bg-info',
    text: 'text-info',
    ring: 'ring-info/30',
    Icon: HelpCircle,
  },
}

export function StatusPill({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' }) {
  const m = STATUS_META[status]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ring-1 ${m.bg} ${m.text} ${m.ring} ${
        size === 'sm' ? 'text-[11px]' : 'text-[12px]'
      }`}
    >
      <m.Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {m.label}
    </span>
  )
}

/* ---------------------------------------------------------------- 评分 */

export function ScoreDial({
  value,
  size = 168,
  label = '综合匹配度',
  sub,
}: {
  value: number
  size?: number
  label?: string
  sub?: string
}) {
  const r = size / 2 - 12
  const c = 2 * Math.PI * r
  // 只画 260° 的弧
  const arc = 0.7222
  const dash = c * arc
  const filled = (value / 100) * dash
  const stroke =
    value >= 75 ? 'var(--color-ok)' : value >= 55 ? 'var(--color-brand-500)' : 'var(--color-warn)'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[132deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-ink-700)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="tnum flex items-baseline gap-0.5">
          <span className="text-[44px] font-semibold leading-none tracking-tight">{value}</span>
          <span className="text-[15px] font-medium text-fg-dim">/100</span>
        </div>
        <div className="mt-1.5 text-[11.5px] font-medium tracking-wide text-fg-muted">{label}</div>
        {sub && <div className="mt-0.5 font-mono text-[10px] text-fg-dim">{sub}</div>}
      </div>
    </div>
  )
}

export function Meter({
  value,
  label,
  hint,
  delay = 0,
}: {
  value: number
  label: string
  hint?: string
  delay?: number
}) {
  const color =
    value >= 75 ? 'bg-ok' : value >= 55 ? 'bg-brand-500' : value >= 40 ? 'bg-warn' : 'bg-bad'
  return (
    <div className="group">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-fg-muted">{label}</span>
        <span className="tnum font-mono text-[13px] font-medium text-fg">{value}</span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-full bg-ink-700">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${value}%`,
            animation: `jl-grow 1s cubic-bezier(.2,.7,.2,1) ${delay}ms both`,
          }}
        />
      </div>
      {hint && <div className="mt-1.5 text-[11.5px] leading-relaxed text-fg-dim">{hint}</div>}
      <style>{`@keyframes jl-grow{from{width:0}}`}</style>
    </div>
  )
}

/* ---------------------------------------------------------------- 结构 */

export function SectionHead({
  kicker,
  title,
  desc,
  align = 'left',
  action,
}: {
  kicker?: string
  title: ReactNode
  desc?: ReactNode
  align?: 'left' | 'center'
  action?: ReactNode
}) {
  const isC = align === 'center'
  return (
    <div
      className={`mb-9 flex flex-col gap-4 ${
        isC ? 'items-center text-center' : 'items-start'
      } md:flex-row md:items-end md:justify-between`}
    >
      <div className={isC ? 'max-w-2xl' : 'max-w-2xl'}>
        {kicker && <Kicker className="mb-3">{kicker}</Kicker>}
        <h2 className="text-[26px] font-semibold leading-[1.25] sm:text-[32px]">{title}</h2>
        {desc && <p className="mt-3 text-[14.5px] leading-[1.8] text-fg-muted">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

export function LinkArrow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-300 transition-colors hover:text-brand-400"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}
