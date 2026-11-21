import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="jl-mark" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#92A9FF" />
          <stop offset="100%" stopColor="#5570F0" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#0E1117" stroke="#252B39" />
      <circle cx="16" cy="16" r="7.6" stroke="url(#jl-mark)" strokeWidth="2.1" />
      <circle cx="16" cy="16" r="3" fill="#3DD68C" />
      <path d="M16 4.6v2.4M16 25v2.4M4.6 16H7M25 16h2.4" stroke="#6E8BFF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ArrowRight(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowUpRight(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

export function ChevronRight(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function Check(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function CheckCircle(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.4 12.2 2.6 2.6 4.6-5" />
    </svg>
  )
}

export function AlertTriangle(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 4.5 21 20H3L12 4.5Z" />
      <path d="M12 10v4.2M12 17.2v.2" />
    </svg>
  )
}

export function HelpCircle(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4M12 16.8v.2" />
    </svg>
  )
}

export function XMark(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function Minus(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function Sparkle(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5Z" />
      <path d="M18.6 16.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </svg>
  )
}

export function Target(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Shield(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3.2 19.2 6v5.6c0 4.2-3 7.3-7.2 9.2-4.2-1.9-7.2-5-7.2-9.2V6L12 3.2Z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </svg>
  )
}

export function Doc(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6.5 3.5h7L18.5 8v12.5h-12V3.5Z" />
      <path d="M13 3.5V8h5M9.4 12h5.2M9.4 15.4h5.2M9.4 8.7h1.6" />
    </svg>
  )
}

export function Quote(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M9.5 6.5C6.9 8 5.5 10.2 5.5 13v4.5h4.6V13H7.7c0-1.9.7-3.3 2.4-4.4l-.6-2.1ZM18.5 6.5C15.9 8 14.5 10.2 14.5 13v4.5h4.6V13h-2.4c0-1.9.7-3.3 2.4-4.4l-.6-2.1Z" />
    </svg>
  )
}

export function Download(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 4v10M8 10.5l4 4 4-4M5 18.5h14" />
    </svg>
  )
}

export function Layers(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5Z" />
      <path d="m5 12.2 7 3.7 7-3.7M5 16.2l7 3.7 7-3.7" />
    </svg>
  )
}

export function Chat(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M20 12.4c0 3.7-3.6 6.7-8 6.7-.9 0-1.8-.1-2.6-.3L5 20.5l1.2-3.3A6.4 6.4 0 0 1 4 12.4c0-3.7 3.6-6.7 8-6.7s8 3 8 6.7Z" />
      <path d="M9 11.6h6M9 14.6h3.6" />
    </svg>
  )
}

export function Gauge(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 17a8.4 8.4 0 1 1 16 0" />
      <path d="M12 17l3.6-4.6" />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Github(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5.01 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.06 10.06 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

export function Lock(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="4.8" y="10.4" width="14.4" height="9.6" rx="2.2" />
      <path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4" />
    </svg>
  )
}

export function Eye(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M2.6 12S6 6.2 12 6.2 21.4 12 21.4 12 18 17.8 12 17.8 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}
