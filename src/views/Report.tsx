import { useMemo } from 'react'
import {
  Button,
  Kicker,
  Meter,
  ScoreDial,
  Shell,
  StatusPill,
  STATUS_META,
} from '../components/ui'
import {
  ArrowRight,
  Chat,
  Doc,
  Layers,
  Sparkle,
  AlertTriangle,
} from '../components/icons'
import { navigate } from '../lib/router'
import { Reveal } from '../components/Reveal'
import { CASES, type Requirement } from '../data/demo'
import { setCaseId, useCase, useCaseId } from '../lib/store'

const FACT_STYLE: Record<string, { label: string; cls: string }> = {
  verified: { label: '原文可证', cls: 'bg-ok/10 text-ok ring-ok/25' },
  'needs-number': { label: '需你补数字', cls: 'bg-warn/10 text-warn ring-warn/25' },
  blocked: { label: '已拦截新增事实', cls: 'bg-bad/10 text-bad ring-bad/25' },
  removed: { label: '建议删除', cls: 'bg-ink-800 text-fg-dim ring-ink-600' },
}

function ReqRow({ r }: { r: Requirement }) {
  const m = STATUS_META[r.status]

  return (
    <details className="jl-disclosure group relative border-b border-ink-700/55 last:border-0">
      <summary className="px-5 py-4 hover:bg-ink-800/40 sm:px-6">
        <span className={`absolute inset-y-0 left-0 w-[2px] ${m.bar}`} aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2 pr-3">
          <span className="text-sm font-medium leading-relaxed sm:max-w-[75%]">{r.jdLine}</span>
          <StatusPill status={r.status} size="sm" />
        </span>
      </summary>

      <div className="space-y-3 px-5 pb-5 sm:px-6">
        <p className="text-xs text-fg-dim"><span className="font-mono">{r.rule}</span> · 权重 {r.weight}%</p>
        <blockquote className="rounded-lg border-l-2 border-brand-500/45 bg-ink-950/50 px-4 py-3">
          <span className="block text-xs font-medium text-brand-300">简历原文依据</span>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">
            {r.evidence ? `「${r.evidence}」` : '未找到对应表述'}
          </p>
        </blockquote>
        <p className="text-sm leading-relaxed text-fg-muted">{r.note}</p>
        {r.gap && <p className="text-sm leading-relaxed text-warn">待你补充：{r.gap}</p>}
      </div>
    </details>
  )
}

export function Report() {
  const current = useCase()
  const currentId = useCaseId()

  const stats = useMemo(() => {
    const s = { met: 0, partial: 0, missing: 0, unverified: 0 }
    current.requirements.forEach((r) => (s[r.status] += 1))
    return s
  }, [current])

  // 失分最严重的维度，用一句话点出来
  const weakest = useMemo(
    () => [...current.dims].sort((a, b) => a.score - b.score)[0],
    [current],
  )

  // 挑一条最有代表性的改写做前后对照
  const featured = useMemo(
    () =>
      current.rewrites.find((r) => r.fact === 'needs-number') ??
      current.rewrites.find((r) => r.fact === 'verified') ??
      current.rewrites[0],
    [current],
  )

  const groups = [
    { key: 'hard', label: '硬性条件' },
    { key: 'core', label: '核心职责' },
    { key: 'plus', label: '加分项' },
  ] as const

  return (
    <div className="relative">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40" />

      <Shell className="relative py-10 sm:py-14">
        {/* 顶部 */}
        <div className="mb-7">
          <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-dim">
            <button onClick={() => navigate('/app')} className="hover:text-fg-muted">
              工作台
            </button>
            <span>/</span>
            <span className="text-fg-muted">对照报告</span>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <Kicker className="mb-3">岗位对照报告</Kicker>
              <h1 className="text-[28px] font-semibold leading-tight sm:text-[38px]">
                {current.role}
              </h1>
              <p className="mt-2 text-[13px] text-fg-muted">
                {current.person} · {current.meta} · 目标：{current.org}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => navigate('/deepdive')}
                icon={<Chat className="h-3.5 w-3.5" />}
              >
                补充事实
              </Button>
            </div>
          </div>

          {/* 案例切换 */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CASES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCaseId(c.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] transition-all ${
                  c.id === currentId
                    ? 'border-brand-500/50 bg-brand-500/10 text-fg'
                    : 'border-ink-700 bg-ink-900/40 text-fg-muted hover:border-ink-500'
                }`}
              >
                <span className="font-mono text-[9.5px] tracking-widest opacity-60">{c.code}</span>
                <span>{c.role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-brand-500/30 bg-brand-500/[0.09] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-xs font-semibold text-brand-300">优先补充</span>
            <span className="text-base font-semibold">{current.priority[0]?.title ?? weakest.label}</span>
          </div>
          {current.priority[0] && (
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">{current.priority[0].detail}</p>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          {/* ============ 主栏 ============ */}
          <div className="space-y-5">
            {/* 概览 */}
            <section className="panel overflow-hidden rounded-xl">
              <div className="grid gap-7 p-6 sm:grid-cols-[188px_1fr] sm:gap-9">
                {/* 左：分数 + 一句话结论 */}
                <div className="flex flex-col items-center gap-4 sm:items-start">
                  <ScoreDial value={current.score} sub={current.code} />
                  <div className="w-full rounded-lg border border-ink-700/70 bg-ink-950/40 px-3 py-2.5">
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
                      主要失分
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="text-[12.5px] font-medium text-warn">{weakest.label}</span>
                      <span className="tnum font-mono text-[12.5px] text-warn/80">
                        {weakest.score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右：五维 */}
                <div className="min-w-0">
                  <div className="mb-3.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
                      五维评分
                    </span>
                    <span className="font-mono text-[10px] text-fg-dim">权重见方法论</span>
                  </div>
                  <div className="space-y-3">
                    {current.dims.map((d, i) => (
                      <Meter
                        key={d.key}
                        label={d.label}
                        value={d.score}
                        delay={i * 90}
                      />
                    ))}
                  </div>
                  <details className="jl-disclosure mt-3 border-t border-ink-700/60">
                    <summary className="py-2 text-sm text-brand-300">查看评分依据</summary>
                    <ul className="space-y-2 pb-2 text-sm text-fg-muted">
                      {current.dims.map((d) => <li key={d.key}><strong className="text-fg">{d.label}</strong> · {d.basis}</li>)}
                    </ul>
                  </details>
                </div>
              </div>

              {/* 满足度分布条 */}
              <div className="border-t border-ink-700/70 px-6 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
                    要求满足分布
                  </span>
                  <span className="tnum font-mono text-[10px] text-fg-dim">
                    {current.requirements.length} 条
                  </span>
                </div>
                <div className="flex h-[6px] gap-px overflow-hidden rounded-full bg-ink-800">
                  {(
                    [
                      ['met', stats.met],
                      ['partial', stats.partial],
                      ['missing', stats.missing],
                      ['unverified', stats.unverified],
                    ] as const
                  )
                    .filter(([, n]) => n > 0)
                    .map(([k, n]) => (
                      <div
                        key={k}
                        className={`h-full ${STATUS_META[k].bar} opacity-80`}
                        style={{ width: `${(n / current.requirements.length) * 100}%` }}
                      />
                    ))}
                </div>
              </div>

              {/* 四态统计 */}
              <div className="grid grid-cols-2 border-t border-ink-700/70 sm:grid-cols-4">
                {(
                  [
                    ['met', '满足'],
                    ['partial', '部分满足'],
                    ['missing', '不满足'],
                    ['unverified', '待核实'],
                  ] as const
                ).map(([k, label], i) => {
                  const m = STATUS_META[k]
                  return (
                    <div
                      key={k}
                      className={`px-5 py-4 ${i < 3 ? 'border-r border-ink-700/50' : ''} ${
                        i < 2 ? 'border-b border-ink-700/50 sm:border-b-0' : ''
                      }`}
                    >
                      <div className="flex items-baseline gap-1.5">
                        <span className={`tnum text-[20px] font-semibold ${m.text}`}>
                          {stats[k]}
                        </span>
                        <span className="text-[11px] text-fg-dim">条</span>
                      </div>
                      <div className="mt-1 text-[11.5px] text-fg-muted">{label}</div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 改写前后对照 */}
            {featured && (
              <Reveal>
                <section className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <Sparkle className="h-3.5 w-3.5 text-brand-400" />
                      <h2 className="text-[13.5px] font-semibold">改写前后对照</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/rewrite')}
                      className="group inline-flex items-center gap-1 text-[11.5px] text-brand-300 transition-colors hover:text-brand-400"
                    >
                      查看全部 {current.rewrites.length} 条
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </header>

                  <div className="grid sm:grid-cols-2">
                    <div className="border-b border-ink-700/50 p-5 sm:border-b-0 sm:border-r">
                      <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                        <Doc className="h-2.5 w-2.5" />
                        简历原话
                      </div>
                      <p className="text-sm leading-relaxed text-fg-muted">
                        {featured.before}
                      </p>
                    </div>

                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                          <Sparkle className="h-2.5 w-2.5 text-brand-400" />
                          建议表述
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ring-1 ${
                            FACT_STYLE[featured.fact]?.cls ?? ''
                          }`}
                        >
                          {FACT_STYLE[featured.fact]?.label ?? featured.fact}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-fg/95">{featured.after}</p>
                      <p className="mt-3 border-t border-ink-700/60 pt-2.5 text-[11px] leading-relaxed text-fg-dim">
                        {featured.factNote}
                      </p>
                    </div>
                  </div>
                </section>
              </Reveal>
            )}

            <header className="pt-3">
              <h2 className="text-xl font-semibold">岗位要求逐条对照</h2>
              <p className="mt-1 text-sm text-fg-muted">点开任意要求，核对原文与判定理由。</p>
            </header>
            {groups.map((g) => {
              const list = current.requirements.filter((r) => r.type === g.key)
              if (!list.length) return null
              return (
                <section key={g.key} className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-3.5 w-3.5 text-fg-dim" />
                      <h2 className="text-[13.5px] font-semibold">{g.label}</h2>
                    </div>
                    <span className="tnum font-mono text-[11px] text-fg-dim">{list.length}</span>
                  </header>
                  <div>
                    {list.map((r) => (
                      <ReqRow key={r.id} r={r} />
                    ))}
                  </div>
                </section>
              )
            })}

          </div>

          {/* ============ 右栏 ============ */}
          <aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            <div className="panel rounded-xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
                  补充清单
                </span>
                <span className="rounded bg-warn/15 px-1.5 py-0.5 font-mono text-[9.5px] text-warn">
                  {current.priority.length}
                </span>
              </div>
              <ol className="space-y-3.5">
                {current.priority.map((p, i) => (
                  <li key={p.title} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-ink-600 bg-ink-900 font-mono text-[9px] text-fg-dim">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-[12.5px] font-medium leading-snug">{p.title}</div>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-fg-dim">{p.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button
                variant="soft"
                size="sm"
                className="mt-4 w-full"
                onClick={() => navigate('/deepdive')}
              >
                逐条回答这些问题
              </Button>
            </div>

            <details className="jl-disclosure rounded-xl border border-ink-700 bg-ink-900/40 px-5">
              <summary className="py-4 text-sm font-medium">
                <AlertTriangle className="mr-2 h-3.5 w-3.5 text-warn" /> HR 首屏扫描
              </summary>
              <ul className="space-y-2 pb-4">
                {current.hrFold.map((h) => <li key={h} className="text-sm leading-relaxed text-fg-muted">{h}</li>)}
              </ul>
            </details>

            <p className="px-1 text-[10.5px] leading-relaxed text-fg-dim">
              示例评分用于定位缺口。
            </p>
          </aside>
        </div>
      </Shell>
    </div>
  )
}
