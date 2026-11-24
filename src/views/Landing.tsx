import { Button, LinkArrow, Shell, Tag } from '../components/ui'
import { ArrowRight, Chat, Doc, Shield, Target } from '../components/icons'
import { HeroDemo } from '../components/HeroDemo'
import { Reveal } from '../components/Reveal'
import { navigate } from '../lib/router'

const STEPS = [
  { title: '选一个目标岗位', text: '从教培、后端、产品运营案例开始。', Icon: Target, to: '/app' },
  { title: '查看依据与缺口', text: '对照岗位要求，找到支撑它的原文。', Icon: Doc, to: '/report' },
  { title: '回答追问，补齐细节', text: '把你实际做过的事整理成证据。', Icon: Chat, to: '/deepdive' },
] as const

export function Landing() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-35" aria-hidden="true" />
        <div className="glow-brand pointer-events-none absolute inset-x-0 -top-52 h-[580px] opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" aria-hidden="true" />
        <Shell className="relative pb-12 pt-13 sm:pb-18 sm:pt-20 lg:pb-22 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.02fr] lg:gap-18">
            <div className="animate-rise">
              <p className="mb-4 text-sm tracking-[0.12em] text-brand-300">大学生求职 · 简历对照</p>
              <h1 className="hero-title">
                以岗位为镜，
                <span className="hero-title-accent text-grad">照见真实能力</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-[1.85] text-fg-muted sm:text-lg">
                逐条对照岗位要求与简历原文。哪里有依据，哪里需要补充，一眼看清。
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button size="lg" onClick={() => navigate('/app')}>
                  体验示例
                </Button>
                <LinkArrow onClick={() => navigate('/method')}>查看设计依据</LinkArrow>
              </div>
            </div>
            <HeroDemo />
          </div>
        </Shell>
      </section>

      <section className="border-y border-ink-700/70 bg-ink-900/55">
        <Shell className="py-12 sm:py-16">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold sm:text-[2rem]">跟着一个案例走</h2>
            <span className="text-sm text-fg-muted">三类岗位 · 预设案例</span>
          </div>
          <ol className="grid gap-2 sm:grid-cols-3 sm:gap-4">
            {STEPS.map(({ title, text, Icon, to }, index) => (
              <li key={to}>
                <a
                  href={`#${to}`}
                  className="group flex h-full flex-col gap-4 rounded-xl border border-ink-700 bg-ink-850/70 p-5 transition-colors hover:border-brand-500/50 hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                >
                  <span className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-brand-300" />
                    <span className="font-mono text-sm text-fg-dim">{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <span>
                    <span className="flex items-center gap-2 text-base font-semibold">
                      {title}
                      <ArrowRight className="h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-fg-muted">{text}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </Shell>
      </section>

      <Shell className="pb-4 pt-12 sm:pt-16">
        <Reveal>
          <div className="grid items-center gap-6 border-l-2 border-brand-500/45 pl-5 sm:grid-cols-[1fr_auto] sm:gap-10 sm:pl-7">
            <div>
              <Tag tone="neutral" className="mb-3"><Shield className="h-3 w-3" /> 设计依据</Tag>
              <h2 className="text-xl font-semibold sm:text-[1.65rem]">从 5 份求职访谈到产品规则</h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted sm:text-base">
                访谈发现、原文追溯与事实校验规则，都可在方法论查阅。
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/method')} className="justify-self-start">
              阅读方法论
            </Button>
          </div>
        </Reveal>
      </Shell>
    </>
  )
}
