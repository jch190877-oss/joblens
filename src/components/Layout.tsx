import type { ReactNode } from 'react'
import { Logo, ArrowRight } from './icons'
import { Button, Shell } from './ui'
import { NAV, navigate } from '../lib/router'

export function NavBar({ route }: { route: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-xl">
      <Shell wide className="flex h-16 items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="group flex items-center gap-2.5"
          aria-label="职镜 JobLens 首页"
        >
          <Logo className="h-8 w-8 transition-transform group-hover:rotate-6" />
          <div className="flex items-baseline gap-2">
            <span className="text-[15.5px] font-semibold tracking-tight">职镜</span>
            <span className="font-mono text-[11px] tracking-[0.14em] text-fg-dim">JOBLENS</span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = route === item.to
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className={`rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                  active
                    ? 'bg-ink-800 text-fg'
                    : 'text-fg-muted hover:bg-ink-850 hover:text-fg'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-ink-600 px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-fg-dim md:inline-flex">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" />
            DEMO
          </span>
          <Button size="sm" onClick={() => navigate('/app')} icon={<ArrowRight className="h-3.5 w-3.5" />}>
            开始分析
          </Button>
        </div>
      </Shell>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-700/70 bg-ink-900/40">
      <Shell className="py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <span className="text-[14.5px] font-semibold">职镜 JobLens</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
              面向大学生求职场景的 AI 简历竞争力分析与优化平台。
              不替你编经历，只帮你把真实做过的事，讲成值得录用的证据。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:grid-cols-3">
            <div>
              <div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-dim">
                产品
              </div>
              {NAV.slice(0, 3).map((n) => (
                <button
                  key={n.to}
                  type="button"
                  onClick={() => navigate(n.to)}
                  className="block py-1 text-[13px] text-fg-muted transition-colors hover:text-fg"
                >
                  {n.label}
                </button>
              ))}
            </div>
            <div>
              <div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-dim">
                研究
              </div>
              <button
                type="button"
                onClick={() => navigate('/method')}
                className="block py-1 text-[13px] text-fg-muted transition-colors hover:text-fg"
              >
                访谈方法论
              </button>
              <span className="block py-1 text-[13px] text-fg-dim">评分口径</span>
              <span className="block py-1 text-[13px] text-fg-dim">事实安全边界</span>
            </div>
            <div>
              <div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-dim">
                说明
              </div>
              <span className="block py-1 text-[13px] text-fg-dim">项目阶段：原型 Demo</span>
              <span className="block py-1 text-[13px] text-fg-dim">数据：5 份访谈（匿名）</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-700/60 pt-6 text-[11.5px] leading-relaxed text-fg-dim sm:flex-row sm:items-center sm:justify-between">
          <span>
            本页面为产品原型演示。案例内容整理自团队 5 份求职访谈转录稿，已作匿名化处理；
            分数与判定为演示逻辑，不构成录用预测。
          </span>
          <span className="font-mono tracking-wide">© 2026 JobLens · 挑战杯项目</span>
        </div>
      </Shell>
    </footer>
  )
}

export function Page({
  route,
  children,
  bare = false,
}: {
  route: string
  children: ReactNode
  bare?: boolean
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 全站细噪点：固定层，不参与布局与交互 */}
      <div className="grain" aria-hidden />
      <NavBar route={route} />
      <main className="flex-1">{children}</main>
      {!bare && <Footer />}
    </div>
  )
}
