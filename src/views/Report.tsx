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
  Doc,
  Download,
  Layers,
  Shield,
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
          <p className="text-[13.5px] leading-[1.7] text-fg/90">{r.jdLine}</p>
        </div>
        <StatusPill status={r.status} size="sm" />
      </div>

      {/* 原文依据 */}
      <div className="mt-3.5">
        <div
          className={`rounded-lg border px-3.5 py-2.5 ${
            r.evidence && !r.evidence.startsWith('（')
              ? 'border-ink-700 bg-ink-950/50'
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

      <p className="mt-3 text-[12px] leading-[1.75] text-fg-muted">{r.note}</p>

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
              <h1 className="text-[26px] font-semibold leading-tight sm:text-[32px]">
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

            {/* 改写前后对照 */}
            {featured && (
              <Reveal>
                <section className="panel overflow-hidden rounded-xl">
                  <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <Sparkle className="h-3.5 w-3.5 text-brand-400" />
                      <h2 className="text-[13.5px] font-semibold">改写前后对照</h2>
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
                      <h2 className="text-[13.5px] font-semibold">{g.label}</h2>
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
