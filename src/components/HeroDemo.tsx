import { useEffect, useMemo, useRef, useState } from 'react'
import { StatusPill, Tag } from './ui'
import { CheckCircle, Shield, Sparkle } from './icons'

/**
 * 首屏动态演示：把「岗位要求 → 简历原文 → 四态判定 → 追问 → 事实拦截」
 * 这一整套产品机制自我演示一遍。
 *
 * 实现要点：
 * - 所有元素始终在布局里，只切透明度/位移，避免高度跳变（CLS）
 * - 只播一次，播完停在完整状态
 * - 尊重 prefers-reduced-motion：直接显示终态
 */

const STEPS = [
  { at: 150, key: 'r1' }, // 硬性条件：满足
  { at: 550, key: 'r2' }, // 核心职责：出现
  { at: 850, key: 'r2ev' }, // 原文依据滑入
  { at: 1100, key: 'r2st' }, // 判为部分满足 + 缺口
  { at: 1500, key: 'r3' }, // 第二条：待核实
  { at: 1900, key: 'sum' }, // 汇总与分数
  { at: 2350, key: 'ask' }, // AI 追问
  { at: 3050, key: 'gate' }, // 事实拦截
]

const ASK_TEXT = '你说「会编写一些程序」——具体用什么语言？抓了多少条？'

function useStages() {
  const reduced = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const [stage, setStage] = useState(reduced ? STEPS.length + 1 : 0)

  useEffect(() => {
    if (reduced) return
    const timers = STEPS.map((s, i) => window.setTimeout(() => setStage(i + 1), s.at))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [reduced])

  return { stage, reduced }
}

/** 第 n 步是否已到达 */
function at(stage: number, n: number) {
  return stage >= n
}

function Row({
  show,
  children,
}: {
  show: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`px-4 py-3.5 transition-all duration-700 ease-out ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
      }`}
    >
      {children}
    </div>
  )
}

export function HeroDemo() {
  const { stage, reduced } = useStages()
  const [typed, setTyped] = useState(reduced ? ASK_TEXT : '')
  const [score, setScore] = useState(reduced ? 57 : 0)
  const askStarted = useRef(false)

  // AI 追问打字机
  useEffect(() => {
    if (reduced || stage < 7 || askStarted.current) return
    askStarted.current = true
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTyped(ASK_TEXT.slice(0, i))
      if (i >= ASK_TEXT.length) window.clearInterval(id)
    }, 34)
    return () => window.clearInterval(id)
  }, [stage, reduced])

  // 分数滚动
  useEffect(() => {
    if (reduced || stage < 6) return
    let n = 0
    const id = window.setInterval(() => {
      n += 3
      setScore(Math.min(57, n))
      if (n >= 57) window.clearInterval(id)
    }, 26)
    return () => window.clearInterval(id)
  }, [stage, reduced])

  return (
    <div className="relative">
      <div className="glow-brand pointer-events-none absolute -inset-10 opacity-80 blur-2xl" />
      <div className="light-band pointer-events-none absolute -inset-x-6 -top-10 h-40" />

      <div className="panel relative overflow-hidden rounded-2xl shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-ink-700/80 bg-ink-900/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ink-500" />
            <span className="h-2 w-2 rounded-full bg-ink-600" />
            <span className="h-2 w-2 rounded-full bg-ink-600" />
            <span className="ml-2 font-mono text-[10.5px] tracking-wide text-fg-dim">
              岗位要求对照 · 报告
            </span>
          </div>
          <span className="rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[9.5px] text-fg-dim">
            S02 · IT 审计
          </span>
        </div>

        {/* 汇总（第 6 步出现，占位始终保留） */}
        <div
          className={`flex items-center justify-between border-b border-ink-700/60 px-4 py-3.5 transition-all duration-700 ${
            at(stage, 6) ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-baseline gap-2">
            <span className="tnum text-[26px] font-semibold leading-none">{score}</span>
            <span className="text-[11px] text-fg-dim">/100 综合匹配</span>
          </div>
          <div className="flex gap-1.5">
            <Tag tone="ok">1 满足</Tag>
            <Tag tone="warn">2 部分</Tag>
            <Tag tone="info">2 待核实</Tag>
          </div>
        </div>

        {/* 条目 */}
        <div className="divide-y divide-ink-700/50">
          {/* R-01 硬性条件 */}
          <Row show={at(stage, 1)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 font-mono text-[9.5px] tracking-widest text-fg-dim">R-01</div>
                <p className="text-[12.5px] leading-[1.65] text-fg/90">
                  本科在读，计算机 / 信息管理 / 财会相关专业
                </p>
              </div>
              <StatusPill status="met" size="sm" />
            </div>
          </Row>

          {/* R-02 核心职责 */}
          <Row show={at(stage, 2)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 font-mono text-[9.5px] tracking-widest text-fg-dim">R-02</div>
                <p className="text-[12.5px] leading-[1.65] text-fg/90">
                  使用 SQL / Python 提取、清洗、分析业务数据，形成审计底稿
                </p>
              </div>
              <div
                className={`transition-all duration-500 ${
                  at(stage, 4) ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <StatusPill status="partial" size="sm" />
              </div>
            </div>

            {/* 原文依据 */}
            <div
              className={`mt-2.5 overflow-hidden rounded-lg border border-ink-700 bg-ink-950/60 transition-all duration-700 ${
                at(stage, 3) ? 'max-h-40 opacity-100' : 'max-h-0 border-transparent opacity-0'
              }`}
            >
              <div className="px-3 py-2">
                <div className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                  <Sparkle className="h-2.5 w-2.5" />
                  简历原文依据
                </div>
                <p className="text-[11.5px] leading-relaxed text-fg-muted">
                  「会编写一些程序，通过程序获取客户的联系方式」
                </p>
              </div>
            </div>

            {/* 缺口 */}
            <div
              className={`mt-2 flex items-start gap-1.5 text-[11px] text-warn/90 transition-all duration-500 ${
                at(stage, 4) ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              }`}
            >
              <Sparkle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>缺：语言与工具 · 数据规模 · 清洗方法 · 交付物</span>
            </div>
          </Row>

          {/* R-04 */}
          <Row show={at(stage, 5)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 font-mono text-[9.5px] tracking-widest text-fg-dim">R-04</div>
                <p className="text-[12.5px] leading-[1.65] text-fg/90">
                  与业务部门沟通，理解客户需求并转化为可执行的检查方案
                </p>
              </div>
              <StatusPill status="unverified" size="sm" />
            </div>
          </Row>
        </div>

        {/* AI 追问 */}
        <div
          className={`border-t border-ink-700/80 bg-brand-500/[0.06] px-4 py-3.5 transition-all duration-700 ${
            at(stage, 7) ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-brand-300">
            <Sparkle className="h-3 w-3" />
            反问式深挖
          </div>
          <p className="min-h-[22px] text-[12.5px] leading-[1.7] text-fg/90">
            {typed}
            <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-blink bg-brand-400 align-middle" />
          </p>
        </div>
      </div>

      {/* 角标 */}
      <div className="absolute -right-3 -top-3 hidden rounded-lg border border-ok/30 bg-ink-900/95 px-2.5 py-1.5 shadow-lg backdrop-blur sm:block">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ok">
          <CheckCircle className="h-3 w-3" />
          每条建议可回溯原文
        </span>
      </div>

      {/* 事实拦截卡 */}
      <div
        className={`relative mt-3 flex items-start gap-2.5 rounded-xl border border-bad/25 bg-ink-900/80 px-3.5 py-3 backdrop-blur transition-all duration-700 sm:ml-6 ${
          at(stage, 8) ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
        }`}
      >
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-bad/15">
          <Shield className="h-3 w-3 text-bad" />
        </span>
        <div>
          <div className="mb-0.5 font-mono text-[9.5px] uppercase tracking-widest text-bad">
            事实校验 · 已拦截 1 处
          </div>
          <p className="text-[11.5px] leading-relaxed text-fg-muted">
            AI 初稿补写了「促成 18 万美元成交额」，而
            <span className="text-bad">简历原文无任何成交记录</span>
            ，已被拦截并要求你补充真实数字。
          </p>
        </div>
      </div>
    </div>
  )
}
