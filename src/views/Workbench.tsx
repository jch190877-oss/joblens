import { useMemo, useState } from 'react'
import { Button, Kicker, Shell, Tag } from '../components/ui'
import { ArrowRight, CheckCircle, Doc, Sparkle, Target, Shield, ChevronRight } from '../components/icons'
import { navigate } from '../lib/router'
import { CASES } from '../data/demo'
import { setCaseId, useCase, useCaseId } from '../lib/store'

const STEPS = ['选择简历', '查看目标岗位', '核对拆解结果']

export function Workbench() {
  const current = useCase()
  const currentId = useCaseId()

  const [step, setStep] = useState(0)
  const grouped = useMemo(() => {
    const g = { hard: [], core: [], plus: [] } as Record<string, typeof current.requirements>
    current.requirements.forEach((r) => g[r.type].push(r))
    return g
  }, [current])

  const NEXT_LABEL = ['下一步：查看岗位描述', '下一步：查看拆解结果', null]

  return (
    <Shell className="py-12 sm:py-16">
      {/* 页头 */}
      <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Kicker className="mb-3">分析工作台</Kicker>
          <h1 className="text-[28px] font-semibold leading-tight sm:text-[34px]">
            用一个案例体验岗位对照
          </h1>
          <p className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed text-fg-muted">
            选择一个脱敏案例，依次查看简历、岗位描述和预设对照报告。自定义材料分析待接入。
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850/60 px-3 py-2">
          <Shield className="h-3.5 w-3.5 text-ok" />
          <span className="font-mono text-[10.5px] tracking-wide text-fg-muted">
            本地演示 · 数据不会上传
          </span>
        </div>
      </div>

      {/* 步骤条 */}
      <div className="mb-8 flex items-center gap-1.5 sm:gap-3">
        {STEPS.map((s, i) => {
          const done = i < step
          const active = i === step
          return (
            <div key={s} className="flex flex-1 items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${
                  active
                    ? 'border-brand-500/50 bg-brand-500/10'
                    : done
                      ? 'border-ink-600 bg-ink-850 hover:border-ink-500'
                      : 'border-ink-700/60 bg-ink-900/40'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${
                    done
                      ? 'bg-ok/20 text-ok'
                      : active
                        ? 'bg-brand-500 text-[#08090C]'
                        : 'bg-ink-700 text-fg-dim'
                  }`}
                >
                  {done ? <CheckCircle className="h-3 w-3" /> : i + 1}
                </span>
                <span
                  className={`truncate text-[12.5px] ${
                    active ? 'font-medium text-fg' : done ? 'text-fg-muted' : 'text-fg-dim'
                  }`}
                >
                  {s}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-ink-500 sm:block" />
              )}
            </div>
          )
        })}
      </div>

      {/* 主体 */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="panel min-h-[460px] rounded-xl p-5 sm:p-7">
          {/* ---------- STEP 1 ---------- */}
          {step === 0 && (
            <div className="animate-fade">
              <h2 className="text-[16px] font-semibold">选择一份演示简历</h2>
              <p className="mt-1.5 text-[12.5px] text-fg-muted">
                这 3 份简历均来自访谈中同学自述的真实经历，已匿名化。
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {CASES.map((c) => {
                  const on = c.id === currentId
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCaseId(c.id)
                        setStep(0)
                      }}
                      className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                        on
                          ? 'border-brand-500/60 bg-brand-500/[0.08] shadow-[0_0_0_1px] shadow-brand-500/25'
                          : 'border-ink-700 bg-ink-900/50 hover:border-ink-500 hover:bg-ink-850'
                      }`}
                    >
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className={`font-mono text-[10px] tracking-widest ${on ? 'text-brand-300' : 'text-fg-dim'}`}>
                          {c.code}
                        </span>
                        {on && <CheckCircle className="h-3.5 w-3.5 text-brand-400" />}
                      </div>
                      <div className="text-[13.5px] font-semibold">{c.person}</div>
                      <div className="mt-1 text-[11.5px] leading-relaxed text-fg-dim">{c.meta}</div>
                      <div className="mt-3 flex items-center gap-1.5 border-t border-ink-700/60 pt-2.5">
                        <Target className="h-3 w-3 shrink-0 text-fg-dim" />
                        <span className="truncate text-[11.5px] text-fg-muted">{c.role}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Doc className="h-3.5 w-3.5 text-fg-dim" />
                    <span className="text-[12.5px] font-medium text-fg-muted">简历文本</span>
                  </div>
                </div>
                <textarea
                  value={current.resume}
                  readOnly
                  aria-label="示例简历"
                  className="h-[240px] w-full resize-none rounded-xl border border-ink-700 bg-ink-950/60 p-4 font-mono text-[12px] leading-[1.85] text-fg-muted"
                />
              </div>
            </div>
          )}

          {/* ---------- STEP 2 ---------- */}
          {step === 1 && (
            <div className="animate-fade">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold">查看示例岗位描述</h2>
                  <p className="mt-1.5 text-[12.5px] text-fg-muted">
                    下一步可查看案例中的硬性条件、核心职责与加分项。
                  </p>
                </div>
                <Tag tone="brand">{current.role}</Tag>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-fg-dim" />
                    <span className="text-[12.5px] font-medium text-fg-muted">岗位描述（JD）</span>
                  </div>
                  <span className="font-mono text-[10.5px] text-fg-dim">
                    {current.jd.length} 字
                  </span>
                </div>
                <textarea
                  value={current.jd}
                  readOnly
                  aria-label="示例岗位描述"
                  spellCheck={false}
                  className="h-[330px] w-full resize-none rounded-xl border border-ink-700 bg-ink-950/70 p-4 font-mono text-[12px] leading-[1.9] text-fg-muted outline-none transition-colors focus:border-brand-500/50 focus:text-fg"
                />
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-ink-700 bg-ink-900/50 px-3.5 py-3">
                <Sparkle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                <p className="text-[12px] leading-relaxed text-fg-muted">
                  访谈里 S05 提到，很多校招推文里的 JD 写得很泛。
                  我们会把泛泛的表述标注为「<span className="text-warn">理解待确认</span>」，
                  而不是替你猜它的含义。
                </p>
              </div>
            </div>
          )}

          {/* ---------- STEP 3 ---------- */}
          {step === 2 && (
            <div className="animate-fade">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold">拆解结果 · 请核对</h2>
                  <p className="mt-1.5 text-[12.5px] text-fg-muted">
                    共识别 {current.requirements.length} 条要求。拆错的地方可以直接勾掉。
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Tag tone="neutral">硬性 {grouped.hard.length}</Tag>
                  <Tag tone="brand">核心 {grouped.core.length}</Tag>
                  <Tag tone="neutral">加分 {grouped.plus.length}</Tag>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {(
                  [
                    ['hard', '硬性条件', '不满足则无法进入下一轮'],
                    ['core', '核心职责', '决定你的竞争力上限'],
                    ['plus', '加分项', '同等条件下的区分度'],
                  ] as const
                ).map(([key, label, hint]) => (
                  <div key={key}>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-[12px] font-medium text-fg">{label}</span>
                      <span className="text-[11px] text-fg-dim">{hint}</span>
                    </div>
                    <div className="space-y-1.5">
                      {grouped[key].map((r) => (
                        <div
                          key={r.id}
                          className="flex items-start gap-2.5 rounded-lg border border-ink-700 bg-ink-900/40 px-3 py-2.5"
                        >
                          <span className="mt-0.5 font-mono text-[9.5px] tracking-wider text-fg-dim">
                            {r.rule}
                          </span>
                          <span className="flex-1 text-[12.5px] leading-relaxed text-fg-muted">
                            {r.jdLine}
                          </span>
                          <span className="mt-0.5 shrink-0 font-mono text-[10px] text-brand-300/70">
                            {r.weight}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作 */}
          <div className="mt-7 flex items-center justify-between border-t border-ink-700/70 pt-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (step === 0 ? navigate('/') : setStep(step - 1))}
            >
              {step === 0 ? '返回首页' : '上一步'}
            </Button>

            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} icon={<ArrowRight className="h-3.5 w-3.5" />}>
                {NEXT_LABEL[step]}
              </Button>
            ) : (
              <Button onClick={() => navigate('/report')} icon={<Sparkle className="h-3.5 w-3.5" />}>
                打开案例报告
              </Button>
            )}
          </div>
        </div>

        {/* 右栏说明 */}
        <aside className="space-y-4">
          <div className="panel rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-[12.5px] font-medium">当前目标</span>
            </div>
            <div className="text-[14px] font-semibold leading-snug">{current.role}</div>
            <div className="mt-1 text-[11.5px] text-fg-dim">{current.org}</div>
            <div className="mt-4 space-y-2 border-t border-ink-700/70 pt-3.5 text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-fg-dim">候选人</span>
                <span className="text-fg-muted">{current.person}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-dim">来源</span>
                <span className="font-mono text-fg-muted">{current.code} 访谈</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-dim">识别要求</span>
                <span className="tnum text-fg-muted">{current.requirements.length} 条</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-5">
            <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
              本轮会产出
            </div>
            <ul className="space-y-2 text-[12px] text-fg-muted">
              {[
                '逐条四态判定（满足 / 部分 / 不满足 / 待核实）',
                '每条要求对应的简历原文依据',
                '需要你补充的事实清单',
                '可直接采纳的改写建议',
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-ok/20 bg-ok/[0.05] p-4">
            <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-ok">
              <Shield className="h-3.5 w-3.5" />
              事实安全承诺
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-fg-muted">
              系统不会为你生成任何未经你确认的技能、职责或数字。缺口处一律留空，等你自己填。
            </p>
          </div>
        </aside>
      </div>

    </Shell>
  )
}
