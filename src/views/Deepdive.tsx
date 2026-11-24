import { useMemo, useState } from 'react'
import { Button, Kicker, Shell, Tag } from '../components/ui'
import {
  ArrowRight,
  Chat,
  CheckCircle,
  Doc,
  Sparkle,
  Shield,
  Target,
} from '../components/icons'
import { navigate } from '../lib/router'
import { CASES } from '../data/demo'
import { getCaseAnswers, saveCaseAnswers, setCaseId, useCase, useCaseId } from '../lib/store'

export function Deepdive() {
  const current = useCase()
  const currentId = useCaseId()
  const { deep } = current

  // 演示捷径：URL 带 ?fill=1 时预填示例回答，方便评审直接看到完成态
  const prefill = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('fill') === '1'
    } catch {
      return false
    }
  }, [])

  const [answers, setAnswers] = useState<Record<string, string>>(() => initialAnswers(current))

  function initialAnswers(selected: typeof current) {
    return getCaseAnswers(selected.id) ??
      (prefill ? Object.fromEntries(selected.deep.questions.map((q) => [q.id, q.chips[0]])) : {})
  }

  function updateAnswers(next: Record<string, string>) {
    saveCaseAnswers(current.id, next)
    setAnswers(next)
  }

  function reviewEvidence() {
    saveCaseAnswers(current.id, answers)
    navigate('/rewrite')
  }
  const [focused, setFocused] = useState<string | null>(null)

  const total = deep.questions.length
  const filled = useMemo(
    () => deep.questions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length,
    [answers, deep.questions],
  )
  const done = filled === total
  const pct = Math.round((filled / total) * 100)

  function set(id: string, v: string) {
    updateAnswers({ ...answers, [id]: v })
  }

  function fillExamples() {
    const next: Record<string, string> = { ...answers }
    deep.questions.forEach((q) => {
      if (!(next[q.id] ?? '').trim()) next[q.id] = q.chips[0]
    })
    updateAnswers(next)
  }

  // 把模板里的 {token} 渲染成已填 / 待补充
  const rendered = useMemo(() => {
    const parts = deep.template.split(/(\{[^}]+\})/g)
    return parts.map((p, i) => {
      const m = p.match(/^\{([^}]+)\}$/)
      if (!m) return <span key={i}>{p}</span>
      const token = m[1]
      const q = deep.questions.find((x) => x.token === token)
      if (!q) return <span key={i}>{p}</span>
      const val = (answers[q.id] ?? '').trim()
      return val ? (
        <mark
          key={i}
          className="rounded bg-brand-500/15 px-1 py-0.5 text-fg decoration-brand-500/40 underline-offset-2"
        >
          {val}
        </mark>
      ) : (
        <span
          key={i}
          className="mx-0.5 inline-flex items-center rounded border border-dashed border-warn/40 bg-warn/[0.07] px-1.5 py-0.5 align-baseline font-mono text-[11px] text-warn/80"
        >
          {q.slot}
        </span>
      )
    })
  }, [answers, deep])

  return (
    <Shell className="py-10 sm:py-14">
      {/* 页头 */}
      <div className="mb-8">
        <Kicker className="mb-3">反问式深挖 · 核心交互</Kicker>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="text-[26px] font-semibold leading-tight sm:text-[32px]">
              {deep.title}
            </h1>
            <p className="mt-2.5 text-[13.5px] leading-[1.85] text-fg-muted">
              我们不直接改写。系统只负责把问题问准——
              <span className="text-fg">你回答事实，它负责组织成证据。</span>
              这个交互来自 S02 访谈：他让 AI 一直反问，直到把自己都问清楚了。
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={fillExamples}>
              用示例回答填充
            </Button>
            <Button
              size="sm"
              variant={done ? 'primary' : 'soft'}
              disabled={!done}
              onClick={reviewEvidence}
              icon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              带证据去改写工作台
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {CASES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (c.id === currentId) return
                setCaseId(c.id)
                setAnswers(initialAnswers(c))
                setFocused(null)
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11.5px] transition-all ${
                c.id === currentId
                  ? 'border-brand-500/50 bg-brand-500/10 text-fg'
                  : 'border-ink-700 bg-ink-900/40 text-fg-muted hover:border-ink-500'
              }`}
            >
              <span className="font-mono text-[9px] tracking-widest opacity-60">{c.code}</span>
              {c.person}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* ============ 左：证据卡 ============ */}
        <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <div className="panel relative overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/50 px-5 py-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
                <Shield className="h-3 w-3" />
                证据卡 · 实时生成
              </span>
              <span className="tnum font-mono text-[10.5px] text-fg-dim">
                {filled}/{total}
              </span>
            </div>

            <div className="p-5">
              {/* 原话 */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                  <Doc className="h-2.5 w-2.5" />
                  简历原话
                </div>
                <p className="rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2.5 text-[12px] leading-relaxed text-fg-dim">
                  {deep.raw}
                </p>
              </div>

              {/* 箭头 */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-600 to-transparent" />
                <Sparkle className={`h-3.5 w-3.5 ${done ? 'text-ok' : 'text-brand-400'}`} />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-600 to-transparent" />
              </div>

              {/* 生成的句子 */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                  <CheckCircle className="h-2.5 w-2.5" />
                  生成中的证据
                </div>
                <p className="min-h-[104px] text-[13.5px] leading-[2] text-fg/90">{rendered}</p>
              </div>

              {/* 进度 */}
              <div className="mt-5 border-t border-ink-700/60 pt-4">
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-fg-dim">
                  <span>证据完整度</span>
                  <span className={done ? 'text-ok' : 'text-brand-300'}>{pct}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      done ? 'bg-ok' : 'bg-brand-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {deep.questions.map((q) => {
                    const on = (answers[q.id] ?? '').trim().length > 0
                    return (
                      <span
                        key={q.id}
                        title={q.slot}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          on ? 'bg-ok/70' : 'bg-ink-600'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 完成后点评 */}
          {done && (
            <div className="animate-rise rounded-xl border border-ok/25 bg-ok/[0.06] p-5">
              <div className="flex items-center gap-2 text-[12.5px] font-medium text-ok">
                <CheckCircle className="h-3.5 w-3.5" />
                追问已填完，请核对证据内容
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-fg-muted">{deep.afterNote}</p>
              <Button
                variant="soft"
                size="sm"
                className="mt-3.5 w-full"
                onClick={reviewEvidence}
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                去改写工作台对比
              </Button>
            </div>
          )}

          <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-4">
            <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-fg-muted">
              <Target className="h-3.5 w-3.5 text-brand-400" />
              对应岗位要求
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-fg-dim">{deep.reqRef}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-fg-muted">
              {current.requirements.find((r) => r.id === deep.reqRef)?.jdLine}
            </p>
          </div>
        </div>

        {/* ============ 右：追问 ============ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/[0.05] px-4 py-3">
            <Chat className="h-3.5 w-3.5 shrink-0 text-brand-400" />
            <p className="text-[12px] leading-relaxed text-fg-muted">
              案例预设了几条追问，从「你做了什么」问到「你怎么知道它有效」。
              可直接填写或使用示例，答案仅保留在当前页面会话。
            </p>
          </div>

          {deep.questions.map((q, i) => {
            const val = answers[q.id] ?? ''
            const isDone = val.trim().length > 0
            const isFocused = focused === q.id
            return (
              <div
                key={q.id}
                className={`panel rounded-xl p-5 transition-all ${
                  isDone
                    ? 'border-ok/25'
                    : isFocused
                      ? 'border-brand-500/40'
                      : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] ${
                      isDone
                        ? 'border-ok/40 bg-ok/15 text-ok'
                        : 'border-ink-600 bg-ink-900 text-fg-dim'
                    }`}
                  >
                    {isDone ? <CheckCircle className="h-3 w-3" /> : String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Tag tone={isDone ? 'ok' : 'brand'}>{q.slot}</Tag>
                      <span className="font-mono text-[9.5px] tracking-wide text-fg-dim">
                        对应 {deep.reqRef}
                      </span>
                    </div>

                    <p className="text-[13.5px] font-medium leading-[1.65]">{q.ask}</p>

                    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-fg-dim">
                      <Sparkle className="mt-[3px] h-3 w-3 shrink-0 text-brand-500/60" />
                      <span>{q.why}</span>
                    </p>

                    {/* 输入 */}
                    <div className="mt-3">
                      <input
                        value={val}
                        onChange={(e) => set(q.id, e.target.value)}
                        onFocus={() => setFocused(q.id)}
                        onBlur={() => setFocused(null)}
                        placeholder="用你自己的话回答，越具体越好…"
                        className={`h-10 w-full rounded-lg border bg-ink-950/70 px-3 text-[12.5px] outline-none transition-colors placeholder:text-fg-dim/60 ${
                          isDone
                            ? 'border-ok/30 text-fg'
                            : 'border-ink-600 text-fg focus:border-brand-500/60'
                        }`}
                      />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.chips.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => set(q.id, c)}
                            className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                              val === c
                                ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                                : 'border-ink-700 bg-ink-900/60 text-fg-dim hover:border-ink-500 hover:text-fg-muted'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* 收尾 */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/40 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-[12px] text-fg-muted">
              {done
                ? '全部回答完毕。这条经历现在可以被安全地写进简历了。'
                : `还剩 ${total - filled} 个问题。填不出的可以直接留空——系统不会替你编。`}
            </p>
            <div className="flex gap-2">
              {!done && (
                <Button variant="outline" size="sm" onClick={fillExamples}>
                  示例填充
                </Button>
              )}
              <Button
                size="sm"
                disabled={!done}
                onClick={() => navigate('/rewrite')}
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                下一步
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
