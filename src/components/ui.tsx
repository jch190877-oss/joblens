import { useEffect, useState, type ReactNode } from 'react'
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
  size = 176,
  label = '综合匹配度',
  sub,
}: {
  value: number
  size?: number
  label?: string
  sub?: string
}) {
  const shown = useCountUp(value)

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 22
  const c = 2 * Math.PI * r
  const ARC_DEG = 260 // 只画 260°，留出底部缺口
  const arc = ARC_DEG / 360
  const dash = c * arc
  const filled = (value / 100) * dash

  const gradFrom = value >= 75 ? '#3dd68c' : value >= 55 ? '#8fa6ff' : '#f5b144'
  const gradTo = value >= 75 ? '#7ef0b8' : value >= 55 ? '#6e8bff' : '#ffcf7a'
  const tickNum = 27

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[130deg]" aria-hidden>
        <defs>
          <linearGradient id="jl-dial" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradFrom} />
            <stop offset="100%" stopColor={gradTo} />
          </linearGradient>
        </defs>

        {/* 刻度圈：只在弧覆盖的范围内画 */}
        {Array.from({ length: tickNum }).map((_, i) => {
          const deg = (i / (tickNum - 1)) * ARC_DEG
          const major = i % 2 === 0
          const active = i / (tickNum - 1) <= value / 100
          const len = major ? 6 : 3
          return (
            <line
              key={i}
              x1={cx + r + 13}
              y1={cy}
              x2={cx + r + 13 + len}
              y2={cy}
              transform={`rotate(${deg} ${cx} ${cy})`}
              stroke={active ? gradFrom : 'var(--color-ink-600)'}
              strokeOpacity={active ? 0.75 : 0.5}
              strokeWidth={major ? 1.5 : 1}
              strokeLinecap="round"
            />
          )
        })}

        {/* 轨道 */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-ink-700)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
        {/* 数据弧 */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#jl-dial)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="tnum flex items-baseline gap-0.5">
          <span className="text-[46px] font-semibold leading-none tracking-tight">{shown}</span>
          <span className="text-[14px] font-medium text-fg-dim">/100</span>
        </div>
        <div className="mt-2 text-[11.5px] font-medium tracking-wide text-fg-muted">{label}</div>
        {sub && <div className="mt-0.5 font-mono text-[10px] tracking-wider text-fg-dim">{sub}</div>}
      </div>
    </div>
  )
}

/** 数字滚动增长（尊重系统「减少动态效果」设置，此时直接显示终值） */
function useCountUp(target: number, duration = 1100) {
  const [v, setV] = useState(() => {
    if (typeof window === 'undefined') return target
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? target : 0
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const e = 1 - Math.pow(1 - t, 3)
      setV(Math.round(target * e))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return v
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
  const tint =
    value >= 75
      ? 'shadow-[0_0_14px_-2px] shadow-ok/50'
      : value >= 55
        ? 'shadow-[0_0_14px_-2px] shadow-brand-500/50'
        : value >= 40
          ? 'shadow-[0_0_14px_-2px] shadow-warn/50'
          : 'shadow-[0_0_14px_-2px] shadow-bad/50'

  return (
    <div className="group">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] text-fg-muted transition-colors group-hover:text-fg">
          {label}
        </span>
        <span className="tnum font-mono text-[13px] font-medium text-fg">{value}</span>
      </div>

      <div className="relative h-[6px] overflow-hidden rounded-full bg-ink-800 ring-1 ring-inset ring-ink-700/70">
        <div
          className={`relative h-full rounded-full ${color} ${tint}`}
          style={{
            width: `${value}%`,
            animation: `jl-grow 1.05s cubic-bezier(.2,.7,.2,1) ${delay}ms both`,
            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.28) 100%)',
          }}
        />
        {/* 刻度：铺在最上层，读数时有"量尺"感 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,.13) 0 1px, transparent 1px 10%)',
          }}
        />
      </div>

      {hint && (
        <div className="mt-1 text-[11px] leading-[1.6] text-fg-dim">{hint}</div>
      )}
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
