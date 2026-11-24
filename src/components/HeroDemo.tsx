import { StatusPill } from './ui'
import { Chat, Doc, Target } from './icons'

export function HeroDemo() {
  return (
    <div className="relative">
      <div className="glow-brand pointer-events-none absolute -inset-10 opacity-70 blur-2xl" aria-hidden="true" />
      <div className="light-band pointer-events-none absolute -inset-x-6 -top-10 h-40" aria-hidden="true" />
      <figure className="panel relative overflow-hidden rounded-2xl shadow-[0_30px_80px_-35px_rgba(0,0,0,0.95)]">
        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-700/80 bg-ink-900/60 px-5 py-3.5 sm:px-6">
          <span className="text-sm font-semibold">岗位对照示例</span>
          <span className="text-xs text-fg-muted"><span className="font-mono">S02</span> · IT 审计</span>
        </figcaption>
        <div className="divide-y divide-ink-700/65 px-5 sm:px-6">
          <div className="hero-demo-step flex flex-wrap items-start justify-between gap-3 py-4">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2 text-xs text-fg-muted">
                <Target className="h-3.5 w-3.5 text-brand-300" /> 岗位要求
              </div>
              <p className="text-base font-semibold leading-relaxed">提取、清洗并分析业务数据</p>
            </div>
            <StatusPill status="partial" />
          </div>
          <div className="hero-demo-step py-4">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-fg-muted">
              <Doc className="h-3.5 w-3.5 text-fg-dim" /> 简历原文
            </div>
            <blockquote className="text-sm leading-relaxed text-fg-muted">
              「会编写一些程序，通过程序获取客户的联系方式」
            </blockquote>
          </div>
        </div>
        <div className="hero-demo-step hero-demo-question border-t border-brand-500/20 bg-brand-500/[0.08] px-5 py-4 sm:px-6">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-brand-300">
            <Chat className="h-3.5 w-3.5" /> 接下来问
          </div>
          <p className="text-base font-medium leading-relaxed">用了什么工具？处理了多少数据？</p>
        </div>
      </figure>
    </div>
  )
}
