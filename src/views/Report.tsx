import { useMemo } from 'react'
import {
  Button,
  Kicker,
  Meter,
  ScoreDial,
  Shell,
  StatusPill,
  Tag,
  STATUS_META,
} from '../components/ui'
import {
  ArrowRight,
  Chat,
  ChevronRight,
  Doc,
  Download,
  Gauge,
  Layers,
  Shield,
  Sparkle,
  AlertTriangle,
} from '../components/icons'
import { navigate } from '../lib/router'
import { Reveal } from '../components/Reveal'
import { CASES, scoreOf, type Requirement } from '../data/demo'
import { HR_BY_CASE, VERDICT_META, CHECK_META } from '../data/hr'
import { setCaseId, useCase, useCaseId } from '../lib/store'

const FACT_STYLE: Record<string, { label: string; cls: string }> = {
  verified: { label: '原文可证', cls: 'bg-ok/10 text-ok ring-ok/25' },
  'needs-number': { label: '需你补数字', cls: 'bg-warn/10 text-warn ring-warn/25' },
  blocked: { label: '已拦截新增事实', cls: 'bg-bad/10 text-bad ring-bad/25' },
  removed: { label: '建议删除', cls: 'bg-ink-800 text-fg-dim ring-ink-600' },
}

const TYPE_META = {
  hard: { label: '硬性条件', tone: 'neutral' as const },
  core: { label: '核心职责', tone: 'brand' as const },
  plus: { label: '加分项', tone: 'neutral' as const },
}

function ReqRow({ r }: { r: Requirement }) {
  const m = STATUS_META[r.status]
  return (
    <div className="group relative border-b border-ink-700/40 px-5 py-5 transition-colors last:border-0 hover:bg-ink-800/30 sm:px-6">
      {/* 左色条 */}
      <span className={`absolute inset-y-0 left-0 w-[2px] ${m.bar}`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9.5px] tracking-[0.14em] text-fg-dim">{r.rule}</span>
            <Tag tone={TYPE_META[r.type].tone}>{TYPE_META[r.type].label}</Tag>
            <span className="font-mono text-[10px] text-fg-dim">权重 {r.weight}%</span>
          </div>
          <p className="text-[15px] font-semibold leading-relaxed text-fg">{r.jdLine}</p>
        </div>
        <StatusPill status={r.status} size="sm" />
      </div>

      {/* 原文依据 */}
      <div className="mt-3.5">
        <div
          className={`rounded-lg border px-3.5 py-2.5 ${
            r.evidence && !r.evidence.startsWith('（')
              ? 'border-ink-700 bg-ink-900'
              : 'border-dashed border-ink-700 bg-transparent'
          }`}
        >
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
            <Doc className="h-2.5 w-2.5" />
            简历原文依据
          </div>
          <p
            className={`text-[12px] leading-relaxed ${
              r.evidence && !r.evidence.startsWith('（') ? 'text-fg-muted' : 'text-fg-dim/70'
            }`}
          >
            {r.evidence ? `「${r.evidence}」` : '（未找到对应表述）'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-[1.8] text-fg-muted">{r.note}</p>

      {r.gap && (
        <div className="mt-2.5 flex items-start gap-1.5 rounded-md border border-warn/20 bg-warn/[0.04] px-2.5 py-2">
          <Sparkle className="mt-0.5 h-3 w-3 shrink-0 text-warn" />
          <span className="text-[11.5px] leading-relaxed text-warn/90">
            <span className="font-medium">待你补充：</span>
            {r.gap}
          </span>
        </div>
      )}
    </div>
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

  // 总分完全由四态判定加权得出，不再手写
  const sc = useMemo(() => scoreOf(current), [current])

  // 挑一条最有代表性的改写做前后对照
  const featured = useMemo(
    () =>
      current.rewrites.find((r) => r.fact === 'needs-number') ??
      current.rewrites.find((r) => r.fact === 'verified') ??
      current.rewrites[0],
    [current],
  )

  // HR 访谈衍生：经历结构 / 平台检查 / 投递前自检
  const hr = HR_BY_CASE[current.id]
  const mixMax = Math.max(1, ...(hr ? hr.expMix.map((m) => m.count * m.weight) : [1]))
  const checkPass = hr ? hr.checks.filter((c) => c.status === 'pass').length : 0

  const groups = [
    { key: 'hard', label: '硬性条件', hint: '不满足则直接出局' },
    { key: 'core', label: '核心职责', hint: '决定竞争力上限' },
    { key: 'plus', label: '加分项', hint: '同等条件下拉开差距' },
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
              <h1 className="editorial-heading text-[30px] sm:text-[38px]">
                {current.role}
              </h1>
              <p className="mt-2 text-[13px] text-fg-muted">
                {current.person} · {current.meta} · 目标：{current.org}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
                导出报告
              </Button>
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

        <div className="grid gap-5 lg:grid-cols-[1fr_306px]">
          {/* ============ 主栏 ============ */}
          <div className="space-y-5">
            {/* 概览 */}
            <section className="panel overflow-hidden rounded-xl">
              <div className="grid gap-7 p-6 sm:grid-cols-[188px_1fr] sm:gap-9">
                {/* 左：分数 + 一句话结论 */}
                <div className="flex flex-col items-center gap-4 sm:items-start">
                  <ScoreDial value={sc.value} sub={current.code} />
                  <div className="w-full rounded-lg border border-ink-700/70 bg-ink-900/60 px-3 py-2.5">
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
                      主要失分
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-medium text-warn">
                        {sc.biggestLoss?.rule ?? '—'}
                      </span>
                      <span className="tnum font-mono text-[12px] text-warn/80">
                        −{(sc.biggestLoss?.lost ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-fg-dim">
                      {sc.biggestLoss?.jdLine}
                    </p>
                  </div>
                </div>

                {/* 右：诊断维度 */}
                <div className="min-w-0">
                  <div className="mb-3.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
                      诊断维度
                    </span>
                    <span className="font-mono text-[10px] text-fg-dim">独立评估 · 不参与总分</span>
                  </div>
                  <div className="space-y-3">
                    {current.dims.map((d, i) => (
                      <Meter
                        key={d.key}
                        label={d.label}
                        value={d.score}
                        hint={d.basis}
                        delay={i * 90}
                      />
                    ))}
                  </div>
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

              {/* 总分推导 */}
              <details className="group border-t border-ink-700/70">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-3.5 transition-colors hover:bg-ink-900/50">
                  <span className="flex items-center gap-2 text-[12.5px] font-medium text-fg">
                    <Gauge className="h-3.5 w-3.5 text-fg-dim" />
                    总分怎么算出来的
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[10.5px] text-fg-dim">
                    Σ 权重 × 达成度
                    <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                  </span>
                </summary>

                <div className="border-t border-ink-700/50 px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-left text-[11.5px]">
                      <thead>
                        <tr className="text-[10px] tracking-wider text-fg-dim">
                          <th className="py-1.5 pr-3 text-left font-medium">规则</th>
                          <th className="py-1.5 pr-3 text-left font-medium">要求</th>
                          <th className="py-1.5 pr-3 text-right font-medium">权重</th>
                          <th className="py-1.5 pr-3 text-left font-medium">判定</th>
                          <th className="py-1.5 pr-3 text-right font-medium">达成度</th>
                          <th className="py-1.5 text-right font-medium">得分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sc.rows.map((r) => (
                          <tr key={r.id} className="border-t border-ink-700/40">
                            <td className="py-2 pr-3 font-mono text-[10px] text-fg-dim">{r.rule}</td>
                            <td className="max-w-[240px] truncate py-2 pr-3 text-fg-muted">
                              {r.jdLine}
                            </td>
                            <td className="tnum py-2 pr-3 text-right text-fg-muted">
                              {r.weight.toFixed(1)}
                            </td>
                            <td className="py-2 pr-3">
                              <StatusPill status={r.status} size="sm" />
                            </td>
                            <td className="tnum py-2 pr-3 text-right text-fg-dim">
                              ×{r.statusScore}
                            </td>
                            <td className="tnum py-2 text-right font-medium text-fg">
                              {r.gained.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-ink-600">
                          <td colSpan={5} className="py-2 pr-3 text-right text-fg-muted">
                            合计（未封顶）
                          </td>
                          <td className="tnum py-2 text-right font-semibold text-fg">
                            {sc.raw.toFixed(1)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="py-1 pr-3 text-right text-fg-muted">
                            总分（四舍五入）
                          </td>
                          <td className="tnum py-1 text-right font-semibold text-brand-600">
                            {sc.value}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] leading-relaxed text-fg-dim">
                    <p>
                      达成度：满足 1.0 · 部分满足 0.5 · 待核实 0.2 · 不满足 0。
                      权重已归一化，同一案例内合计 100。
                    </p>
                    {sc.hardFail ? (
                      <p className="text-bad">存在硬性条件不满足，按门槛规则总分封顶 40。</p>
                    ) : (
                      <p>硬性条件全部满足，未触发封顶规则。</p>
                    )}
                    <p>「诊断维度」为独立评估，用于定位问题，不参与这里的合成。</p>
                  </div>
                </div>
              </details>

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

            {/* 事实校验摘要 */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-ink-700 bg-ink-900/40 px-5 py-3.5">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-fg">
                <Shield className="h-3.5 w-3.5 text-ok" />
                事实校验
              </span>
              <span className="text-[11.5px] text-fg-muted">
                原文可证 <span className="tnum text-ok">{stats.met + stats.partial}</span> 条
              </span>
              <span className="text-[11.5px] text-fg-muted">
                待补充 <span className="tnum text-warn">{stats.missing + stats.unverified}</span> 项
              </span>
              <span className="text-[11.5px] text-fg-muted">
                已拦截 <span className="tnum text-bad">1</span> 处 AI 新增事实
              </span>
              <span className="ml-auto font-mono text-[10px] text-fg-dim">
                规则库 v0.3 · 3 道闸
              </span>
            </div>

            {/* 经历结构（HR 口径） */}
            {hr && (
              <Reveal>
                <section className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-3.5 w-3.5 text-fg-dim" />
                      <h2 className="text-[13.5px] font-semibold">经历结构</h2>
                      <span className="hidden text-[11.5px] text-fg-dim sm:inline">
                        按 HR 口径加权，不只看数量
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-fg-dim">HR01 · HR02</span>
                  </header>

                  <div className="space-y-2.5 p-5">
                    {hr.expMix.map((m) => {
                      const weighted = m.count * m.weight
                      return (
                        <div key={m.kind} className="flex items-center gap-3">
                          <span className="w-[68px] shrink-0 text-[12px] text-fg-muted">
                            {m.label}
                          </span>
                          <div className="relative h-[7px] flex-1 overflow-hidden rounded-full bg-ink-800">
                            <div
                              className={`h-full rounded-full ${m.count ? 'bg-brand-500' : ''}`}
                              style={{ width: `${(weighted / mixMax) * 100}%` }}
                            />
                          </div>
                          <span className="tnum w-11 shrink-0 text-right text-[11.5px] text-fg-muted">
                            {m.count} 段
                          </span>
                          <span className="w-9 shrink-0 text-right font-mono text-[10px] text-fg-dim">
                            ×{m.weight}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-ink-700/60 px-5 py-4">
                    <p className="text-[12px] leading-[1.75] text-fg-muted">{hr.verdict}</p>
                    <p className="mt-2.5 text-[11px] leading-relaxed text-fg-dim">
                      权重口径：实习 1.0 / 项目 0.8 / 竞赛 0.6 / 校园活动 0.4（HR01 的经历排序）。
                      另一位 HR 认为「经历类型只是不同维度、没有高低之分」——所以这是一套可调权重，不是唯一标准。
                    </p>
                  </div>
                </section>
              </Reveal>
            )}

            {/* 平台还是你的 */}
            {hr && (
              <Reveal>
                <section className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-3.5 w-3.5 text-fg-dim" />
                      <h2 className="text-[13.5px] font-semibold">平台还是你的</h2>
                      <span className="hidden text-[11.5px] text-fg-dim sm:inline">
                        离开这个平台，这句话还成立吗
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-fg-dim">HR02</span>
                  </header>

                  <div className="divide-y divide-ink-700/50">
                    {hr.platform.map((p) => {
                      const vm = VERDICT_META[p.verdict]
                      return (
                        <div key={p.id} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 flex-1 text-[12.5px] leading-[1.7] text-fg">
                              「{p.claim}」
                            </p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] ring-1 ${vm.cls}`}
                            >
                              {vm.label}
                            </span>
                          </div>
                          <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-brand-600">
                            <Chat className="mt-[2px] h-3 w-3 shrink-0" />
                            <span>{p.ask}</span>
                          </p>
                          <p className="mt-1.5 text-[11.5px] leading-relaxed text-fg-dim">{p.note}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-ink-700/60 px-5 py-3">
                    <p className="text-[11px] leading-relaxed text-fg-dim">
                      HR02 原话：「知名企业实习最大的坑，就是把平台当成个人能力。对我来说，没有什么区别。」
                    </p>
                  </div>
                </section>
              </Reveal>
            )}

            {/* 改写前后对照 */}
            {featured && (
              <Reveal>
                <section className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <Sparkle className="h-3.5 w-3.5 text-brand-400" />
                      <h2 className="text-[16px] font-bold">改写前后对照</h2>
                      <span className="hidden text-[11.5px] text-fg-dim sm:inline">
                        只改表达，不改事实
                      </span>
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
                      <p className="text-[12.5px] leading-[1.8] text-fg-dim line-through decoration-ink-500 decoration-1">
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
                      <p className="text-[12.5px] leading-[1.8] text-fg/95">{featured.after}</p>
                      <p className="mt-3 border-t border-ink-700/60 pt-2.5 text-[11px] leading-relaxed text-fg-dim">
                        {featured.factNote}
                      </p>
                    </div>
                  </div>
                </section>
              </Reveal>
            )}

            {/* 逐条对照 */}
            {groups.map((g) => {
              const list = current.requirements.filter((r) => r.type === g.key)
              if (!list.length) return null
              return (
                <section key={g.key} className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-3.5 w-3.5 text-fg-dim" />
                      <h2 className="text-[16px] font-bold">{g.label}</h2>
                      <span className="text-[11.5px] text-fg-dim">{g.hint}</span>
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

            {/* 投递前自检 */}
            {hr && (
              <Reveal>
                <section className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-fg-dim" />
                      <h2 className="text-[13.5px] font-semibold">投递前自检</h2>
                      <span className="hidden text-[11.5px] text-fg-dim sm:inline">
                        和文笔无关，但会直接导致淘汰
                      </span>
                    </div>
                    <span className="tnum font-mono text-[10px] text-fg-dim">
                      {checkPass}/{hr.checks.length} 通过
                    </span>
                  </header>

                  <div className="divide-y divide-ink-700/50">
                    {hr.checks.map((c) => {
                      const cm = CHECK_META[c.status]
                      return (
                        <div key={c.id} className="flex items-start gap-3 px-5 py-3.5">
                          <span className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${cm.dot}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[12.5px] font-medium">{c.label}</span>
                              <span className={`font-mono text-[10px] ${cm.cls}`}>{cm.label}</span>
                            </div>
                            <p className="mt-0.5 text-[11.5px] leading-relaxed text-fg-dim">
                              {c.detail}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-ink-700/60 px-5 py-3">
                    <p className="text-[11px] leading-relaxed text-fg-dim">
                      HR02 原话：「最影响的是不写联系方式，或者联系方式无效。」这类问题和技术无关，但会在初筛阶段直接出局。
                    </p>
                  </div>
                </section>
              </Reveal>
            )}

            {/* 底部 CTA */}
            <div className="panel relative overflow-hidden rounded-xl p-6">
              <div className="glow-brand pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2 text-[14px] font-semibold">
                    <Sparkle className="h-4 w-4 text-brand-400" />
                    有 {stats.missing + stats.unverified} 条要求缺少原文依据
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-fg-muted">
                    先补齐事实，再谈改写——这是访谈里所有人都在做的事，只是他们靠自己硬撑。
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/deepdive')}
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  进入反问深挖
                </Button>
              </div>
            </div>
          </div>

          {/* ============ 右栏 ============ */}
          <aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            <div className="panel rounded-xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
                  必须补的信息
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

            <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warn" />
                <span className="text-[12px] font-medium">HR 首屏扫描</span>
              </div>
              <ul className="space-y-2.5">
                {current.hrFold.map((h, i) => (
                  <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-fg-dim">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-ink-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-5">
              <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
                下一步
              </div>
              <div className="space-y-1.5">
                {[
                  { label: '反问式深挖', to: '/deepdive', active: true },
                  { label: '改写工作台', to: '/rewrite', active: false },
                  { label: '回到工作台', to: '/app', active: false },
                ].map((n) => (
                  <button
                    key={n.to}
                    type="button"
                    onClick={() => navigate(n.to)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-fg-muted transition-colors hover:bg-ink-800 hover:text-fg"
                  >
                    {n.label}
                    <ArrowRight className="h-3 w-3 opacity-40" />
                  </button>
                ))}
              </div>
            </div>

            <p className="px-1 text-[10.5px] leading-relaxed text-fg-dim">
              报告结论为求职辅助建议，每条判定均指向简历原文。录用判断由招聘主体独立完成。
            </p>
          </aside>
        </div>
      </Shell>
    </div>
  )
}
