import { useEffect, useMemo, useState } from 'react'
import { Button, Kicker, Shell, Tag } from '../components/ui'
import {
  ArrowRight,
  Check,
  CheckCircle,
  Download,
  Shield,
  Sparkle,
  XMark,
} from '../components/icons'
import { navigate } from '../lib/router'
import { CASES, scoreOf, type Rewrite } from '../data/demo'
import { HR_BY_CASE } from '../data/hr'
import { setCaseId, useCase, useCaseId } from '../lib/store'

/**
 * 简历页：整站唯一「看到并修改一份完整简历」的地方。
 *
 * 采纳一条建议 → 下方简历纸上的那一行**立即变成改写后的文字**。
 * 这样「优化」这个动作才真正落在简历上，而不是停在报告里。
 */

const FACT_META: Record<string, { label: string; cls: string }> = {
  verified: { label: '原文可证', cls: 'bg-ok/10 text-ok ring-ok/25' },
  'needs-number': { label: '需补数字', cls: 'bg-warn/10 text-warn ring-warn/25' },
  blocked: { label: '已拦截', cls: 'bg-bad/10 text-bad ring-bad/25' },
  removed: { label: '建议删除', cls: 'bg-ink-800 text-fg-dim ring-ink-600' },
}

type Line =
  | { kind: 'name'; text: string }
  | { kind: 'section'; text: string }
  | { kind: 'bullet'; text: string; hit?: Rewrite }
  | { kind: 'plain'; text: string; hit?: Rewrite }
  | { kind: 'blank' }

function parseLines(resume: string, rewrites: Rewrite[]): Line[] {
  const raw = resume.split('\n')
  return raw.map((line, i) => {
    const text = line.trimEnd()
    if (!text.trim()) return { kind: 'blank' as const }
    const hit = rewrites.find((r) => text.includes(r.before))
    if (i === 0) return { kind: 'name' as const, text }
    if (text.trimStart().startsWith('【')) return { kind: 'section' as const, text }
    if (text.trimStart().startsWith('·')) return { kind: 'bullet' as const, text, hit }
    return { kind: 'plain' as const, text, hit }
  })
}

export function Resume() {
  const current = useCase()
  const currentId = useCaseId()
  const hr = HR_BY_CASE[current.id]
  const sc = scoreOf(current)

  const [adopted, setAdopted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(current.rewrites.map((r) => [r.id, r.fact === 'verified'])),
  )
  const [lastId, setLastId] = useState(current.id)
  if (lastId !== current.id) {
    setLastId(current.id)
    setAdopted(Object.fromEntries(current.rewrites.map((r) => [r.id, r.fact === 'verified'])))
  }

  const lines = useMemo(() => parseLines(current.resume, current.rewrites), [current])

  const adoptCount = current.rewrites.filter((r) => adopted[r.id] && r.action !== 'remove').length
  const total = current.rewrites.filter((r) => r.action !== 'remove').length

  /** 采纳后的最终文本（导出用） */
  const finalText = useMemo(() => {
    const out: string[] = []
    for (const l of lines) {
      if (l.kind === 'blank') {
        out.push('')
        continue
      }
      const hit = 'hit' in l ? l.hit : undefined
      const on = hit ? adopted[hit.id] : false
      if (!on || !hit) {
        out.push(l.text)
        continue
      }
      if (hit.action === 'remove') continue
      const prefix = l.text.slice(0, l.text.indexOf(hit.before))
      out.push(prefix + hit.after)
    }
    return out.join('\n')
  }, [lines, adopted])

  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)

  return (
    <Shell className="py-10 sm:py-14">
      {/* 页头 */}
      <div className="mb-7">
        <Kicker className="mb-3">简历原文 · 逐条修改</Kicker>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="editorial-heading text-[28px] sm:text-[34px]">你的简历，就在这里改</h1>
            <p className="mt-2.5 text-[13.5px] leading-[1.8] text-fg-muted">
              右边每采纳一条，左边那一行就会变成改写后的文字。
              <span className="text-fg">改完导出的就是一份能直接投出去的简历</span>
              ，不是一份报告。
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/report')}>
              回看对照报告
            </Button>
            <Button
              size="sm"
              onClick={() => setShowExport((v) => !v)}
              icon={<Download className="h-3.5 w-3.5" />}
            >
              {showExport ? '收起投递版' : '导出投递版'}
            </Button>
          </div>
        </div>

        {/* 案例切换 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700/60 pt-5">
          <div className="flex flex-wrap gap-2">
            {CASES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCaseId(c.id)}
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
          <div className="flex items-center gap-3 text-[11.5px] text-fg-muted">
            <span>
              已采纳 <span className="tnum font-medium text-ok">{adoptCount}</span> / {total}
            </span>
            <span className="text-fg-dim">|</span>
            <span>
              匹配 <span className="tnum font-medium text-fg">{sc.value}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        {/* ============ 左：简历纸 ============ */}
        <div className="space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-br from-brand-500/[0.07] via-transparent to-brand-500/[0.04] blur-2xl" />

            <div className="relative overflow-hidden rounded-xl border border-ink-600 bg-white shadow-[0_2px_4px_rgba(23,36,58,0.06),0_28px_70px_-30px_rgba(23,36,58,0.3)]">
              <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500/40" />

              <div className="px-7 py-7 sm:px-10 sm:py-9">
                {lines.map((l, i) => {
                  if (l.kind === 'blank') return <div key={i} className="h-2.5" />

                  if (l.kind === 'name') {
                    return (
                      <div key={i} className="mb-3 border-b border-ink-700 pb-3">
                        <div
                          className="text-[24px] leading-tight text-fg"
                          style={{ fontFamily: 'var(--font-editorial)' }}
                        >
                          {l.text}
                        </div>
                      </div>
                    )
                  }

                  if (l.kind === 'section') {
                    return (
                      <div key={i} className="mb-2 mt-4 flex items-center gap-2">
                        <span className="text-[11.5px] font-semibold tracking-wide text-fg-muted">
                          {l.text.replace(/[【】]/g, '')}
                        </span>
                        <span className="h-px flex-1 bg-ink-700" />
                      </div>
                    )
                  }

                  // 有建议的行
                  const hit = l.hit
                  const on = hit ? adopted[hit.id] : false
                  const removed = on && hit?.action === 'remove'

                  return (
                    <div
                      key={i}
                      className={`relative -mx-2 rounded px-2 py-[3px] text-[12.5px] leading-[1.85] transition-colors ${
                        hit && on
                          ? removed
                            ? 'text-fg-dim'
                            : 'bg-ok/[0.055] ring-1 ring-inset ring-ok/15'
                          : hit
                            ? 'bg-warn/[0.035]'
                            : ''
                      }`}
                    >
                      {hit && on && hit.action !== 'remove' ? (
                        <>
                          <span className="text-fg-dim line-through decoration-bad/50 decoration-[1.5px]">
                            {l.text}
                          </span>
                          <div className="flex items-start gap-1.5">
                            <Check className="mt-[6px] h-3 w-3 shrink-0 text-ok" />
                            <span className="font-medium text-fg">
                              {l.text.slice(0, l.text.indexOf(hit.before)) + hit.after}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span
                          className={`${
                            removed
                              ? 'text-fg-dim line-through decoration-bad/50 decoration-[1.5px]'
                              : l.kind === 'bullet'
                                ? 'text-fg-muted'
                                : 'text-fg-muted'
                          }`}
                        >
                          {l.text}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 投递版 */}
          {showExport && (
            <div className="panel overflow-hidden rounded-xl">
              <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3">
                <span className="flex items-center gap-2 text-[12.5px] font-semibold">
                  <Download className="h-3.5 w-3.5 text-brand-500" />
                  投递版 · 已采纳的改动已合入
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(finalText).then(
                      () => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1800)
                      },
                      () => undefined,
                    )
                  }}
                >
                  {copied ? '已复制' : '复制全文'}
                </Button>
              </div>
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-[11.5px] leading-[1.9] text-fg-muted">
                {finalText}
              </pre>
            </div>
          )}
        </div>

        {/* ============ 右：建议 ============ */}
        <aside className="space-y-3 lg:sticky lg:top-[88px] lg:self-start">
          <div className="panel overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-4 py-3">
              <span className="flex items-center gap-2 text-[12.5px] font-semibold">
                <Sparkle className="h-3.5 w-3.5 text-brand-500" />
                改写建议
              </span>
              <span className="tnum font-mono text-[10.5px] text-fg-dim">
                {adoptCount}/{total}
              </span>
            </div>

            <div className="divide-y divide-ink-700/50">
              {current.rewrites.map((r) => {
                const on = adopted[r.id]
                const fm = FACT_META[r.fact] ?? FACT_META.verified
                return (
                  <div key={r.id} className="px-4 py-3.5">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9.5px] ring-1 ${fm.cls}`}
                      >
                        {fm.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdopted((a) => ({ ...a, [r.id]: !a[r.id] }))}
                        className={`flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] transition-colors ${
                          on ? 'bg-ok/15 text-ok' : 'bg-ink-800 text-fg-dim hover:text-fg-muted'
                        }`}
                      >
                        {on ? <CheckCircle className="h-2.5 w-2.5" /> : <XMark className="h-2.5 w-2.5" />}
                        {on ? '已采纳' : '未采纳'}
                      </button>
                    </div>

                    <p className="text-[11px] leading-relaxed text-fg-dim line-through">
                      {r.before}
                    </p>
                    <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-fg">
                      {r.after}
                    </p>
                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-fg-dim">{r.factNote}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 还没补上的 */}
          {hr && (
            <div className="rounded-xl border border-warn/25 bg-warn/[0.05] p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium text-warn">
                <Shield className="h-3.5 w-3.5" />
                这些还没法写进简历
              </div>
              <ul className="space-y-1.5">
                {current.requirements
                  .filter((r) => r.gap)
                  .slice(0, 3)
                  .map((r) => (
                    <li key={r.id} className="text-[11px] leading-relaxed text-fg-muted">
                      <span className="font-mono text-[9.5px] text-fg-dim">{r.rule}</span>{' '}
                      {r.gap}
                    </li>
                  ))}
              </ul>
              <Button
                variant="soft"
                size="sm"
                className="mt-3 w-full"
                onClick={() => navigate('/deepdive')}
                icon={<ArrowRight className="h-3 w-3" />}
              >
                去补齐这些信息
              </Button>
            </div>
          )}

          <p className="px-1 text-[10.5px] leading-relaxed text-fg-dim">
            采纳与忽略都由你决定。被标记「已拦截」的建议默认不采纳——那是 AI 想加的、但简历里没有的事实。
          </p>
        </aside>
      </div>
    </Shell>
  )
}
