import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * 滚动进场：元素进入视口时淡入上移。
 * - 首屏已可见的元素会立即显示（IntersectionObserver 首次回调）
 * - 尊重 prefers-reduced-motion
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  y = 18,
  once = true,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            if (once) io.disconnect()
          } else if (!once) {
            setShown(false)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: 'opacity .75s cubic-bezier(.22,.72,.2,1), transform .75s cubic-bezier(.22,.72,.2,1)',
        transitionDelay: shown ? `${delay}ms` : '0ms',
        willChange: shown ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
