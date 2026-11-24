import { useState } from 'react'
import { Button, Kicker, Shell, Tag } from '../components/ui'
import {
  ArrowRight,
  Check,
  CheckCircle,
  Doc,
  Download,
  Eye,
  Lock,
  Shield,
  Sparkle,
  XMark,
  AlertTriangle,
} from '../components/icons'
import { navigate } from '../lib/router'
import { CASES, type FactFlag } from '../data/demo'
import { getCompletedEvidence, setCaseId, useCase, useCaseId } from '../lib/store'

const FACT_META: Record<FactFlag, { label: string; tone: string; text: string; ring: string }> = {
  verified: {
    label: '原文可证',
    tone: 'bg-ok/10',
    text: 'text-ok',
    ring: 'ring-ok/30',
  },
  'needs-number': {
    label: '需你补数字',
    tone: 'bg-warn/10',
    text: 'text-warn',
    ring: 'ring-warn/30',
  },
  blocked: {
    label: '已拦截 AI 新增事实',
    tone: 'bg-bad/10',
    text: 'text-bad',
    ring: 'ring-bad/30',
  },
  removed: {
    label: '建议删除',
    tone: 'bg-ink-800',
    text: 'text-fg-dim',
    ring: 'ring-ink-600',
  },
}

export function Rewrite() {
  const current = useCase()
  const currentId = useCaseId()

  const [accepted, setAccepted] = useState<Record<string, boolean>>(
    () => Object.fromEntries(current.rewrites.map((r) => [r.id, r.fact === 'verified'])),
  )
  const [hrMode, setHrMode] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmedEvidence, setConfirmedEvidence] = useState(false)

  // 切案例时重置
  const [lastId, setLastId] = useState(current.id)
  if (lastId !== current.id) {
    setLastId(current.id)
    setConfirmedEvidence(false)
    setAccepted(Object.fromEntries(current.rewrites.map((r) => [r.id, r.fact === 'verified'])))
  }

  const exportable = current.rewrites.filter((r) => accepted[r.id] && r.fact === 'verified')
  const acceptCount = exportable.length
  const evidence = getCompletedEvidence(current)
  const lines = exportable.map((r) => `· ${r.after}`)
  if (confirmedEvidence && evidence) lines.push(`· ${evidence}`)
  const compiled = `【改写后 · ${current.role}】\n\n${lines.join('\n') || '暂无可导出的条目'}`

  function toggle(id: string) {
    setAccepted((a) => ({ ...a, [id]: !a[id] }))
  }

  function copy() {
    navigator.clipboard?.writeText(compiled).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      },
      () => undefined,
    )
  }

  const blockedCount = current.rewrites.filter((r) => r.fact === 'blocked').length
  const needNumCount = current.rewrites.filter((r) => r.fact === 'needs-number').length

  return (
    <Shell className="py-10 sm:py-14">
      {/* 页头 */}
      <div className="mb-7">
        <Kicker className="mb-3">改写工作台</Kicker>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="editorial-heading text-[30px] sm:text-[38px]">
              采纳之前，先看清它凭什么这么说
            </h1>
            <p className="mt-2.5 text-[13.5px] leading-[1.85] text-fg-muted">
              每一条建议都附上原文依据、修改理由和事实状态。
              采纳与忽略都由你决定——这一点来自 S03 的原话：
              <span className="text-fg">「哪些采纳他的，哪些按我自己的想法来。」</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-ink-700 bg-ink-900 p-0.5">
              <button
                type="button"
                onClick={() => setHrMode(false)}
                className={`rounded-md px-2.5 py-1.5 text-[11.5px] transition-colors ${
                  !hrMode ? 'bg-ink-700 text-fg' : 'text-fg-dim hover:text-fg-muted'
                }`}
              >
                完整视图
              </button>
              <button
                type="button"
                onClick={() => setHrMode(true)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] transition-colors ${
                  hrMode ? 'bg-brand-500/20 text-brand-300' : 'text-fg-dim hover:text-fg-muted'
                }`}
              >
                <Eye className="h-3 w-3" />
                HR 3 秒视角
              </button>
            </div>
            <Button size="sm" onClick={() => setShowExport(true)} icon={<Download className="h-3.5 w-3.5" />}>
              导出投递版
            </Button>
          </div>
        </div>

        {/* 案例 + 统计 */}
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-ink-700/60 pt-5 sm:flex-row sm:items-center">
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px]">
            <span className="text-fg-muted">
              已采纳 <span className="tnum text-ok">{acceptCount}</span> / {current.rewrites.length}
            </span>
            <span className="text-fg-muted">
              待补数字 <span className="tnum text-warn">{needNumCount}</span>
            </span>
            <span className="text-fg-muted">
              已拦截 <span className="tnum text-bad">{blockedCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* HR 模式提示 */}
      {hrMode && (
        <div className="animate-rise mb-5 rounded-xl border border-brand-500/25 bg-brand-500/[0.06] px-5 py-4">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] font-medium text-brand-300">
            <Eye className="h-3.5 w-3.5" />
            HR 视角：只看「动作 + 规模 + 结果」，理由和依据在这一层是不可见的
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {current.hrFold.map((h, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-fg-muted">
                <AlertTriangle className="mt-[3px] h-3 w-3 shrink-0 text-warn/70" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_290px]">
        {/* 主栏 */}
        <div className="space-y-3">
          {evidence && (
            <section className="panel rounded-xl border-brand-500/30 p-5">
              <h2 className="text-[17px] font-bold">来自经历深挖的证据</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                根据本案例的追问回答整理，请先核对。下方案例建议供独立对比。
              </p>
              <p className="mt-3 break-words text-[14px] leading-relaxed">{evidence}</p>
              <label className="mt-4 flex items-start gap-2 text-[13px] text-fg">
                <input
                  type="checkbox"
                  checked={confirmedEvidence}
                  onChange={(event) => setConfirmedEvidence(event.target.checked)}
                />
                我已核对这段内容，将它纳入导出预览
              </label>
            </section>
          )}
          {current.rewrites.map((r, i) => {
            const on = accepted[r.id]
            const fm = FACT_META[r.fact]
            const isRemove = r.action === 'remove'
            const canAccept = r.fact === 'verified'
            return (
              <div
                key={r.id}
                className={`panel animate-rise overflow-hidden rounded-xl transition-all ${
                  on ? '' : 'opacity-55'
                }`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-3 border-b border-ink-700/60 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9.5px] tracking-[0.14em] text-fg-dim">
                      {r.id}
                    </span>
                    <Tag tone={isRemove ? 'neutral' : r.action === 'merge' ? 'info' : 'brand'}>
                      {isRemove ? '删除建议' : r.action === 'merge' ? '合并改写' : '改写建议'}
                    </Tag>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] ring-1 ${fm.tone} ${fm.text} ${fm.ring}`}
                    >
                      {r.fact === 'blocked' ? (
                        <Shield className="h-2.5 w-2.5" />
                      ) : r.fact === 'verified' ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : (
                        <Sparkle className="h-2.5 w-2.5" />
                      )}
                      {fm.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(r.id)}
                    disabled={!canAccept}
                    aria-pressed={canAccept ? Boolean(on) : undefined}
                    className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors ${
                      on
                        ? 'bg-ok/15 text-ok'
                        : 'bg-ink-800 text-fg-dim hover:text-fg-muted'
                    }`}
                  >
                    {on ? <CheckCircle className="h-3 w-3" /> : <XMark className="h-3 w-3" />}
                    {canAccept ? (on ? '已采纳' : '已忽略') : '不加入投递版'}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2">
                  {/* before */}
                  <div className="border-b border-ink-700/50 p-5 sm:border-b-0 sm:border-r">
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                      <Doc className="h-2.5 w-2.5" />
                      简历原文
                    </div>
                    <p className="text-sm leading-[1.85] text-fg-dim line-through decoration-ink-500 decoration-1">
                      {r.before}
                    </p>
                  </div>

                  {/* after */}
                  <div className="bg-ink-900/75 p-5">
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                      <Sparkle className="h-2.5 w-2.5 text-brand-400" />
                      建议表述
                    </div>
                    <p
                      className={`text-sm leading-[1.85] ${
                        isRemove ? 'text-fg-dim' : 'text-fg/95'
                      }`}
                    >
                      {r.after}
                    </p>
                  </div>
                </div>

                {!hrMode && (
                  <div className="space-y-2.5 border-t border-ink-700/60 bg-ink-900/30 px-5 py-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-[3px] font-mono text-[9.5px] uppercase tracking-widest text-fg-dim">
                        理由
                      </span>
                      <p className="flex-1 text-[11.5px] leading-relaxed text-fg-muted">
                        {r.reason}
                      </p>
                    </div>
                    <div
                      className={`flex items-start gap-2 rounded-md px-2.5 py-2 ${fm.tone}`}
                    >
                      <Shield className={`mt-[2px] h-3 w-3 shrink-0 ${fm.text}`} />
                      <p className={`flex-1 text-[11.5px] leading-relaxed ${fm.text} opacity-90`}>
                        {r.factNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/40 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-[12px] text-fg-muted">
              改完只是「可投」。要不要为下一个岗位再出一版，可以随时从这里复制。
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/report')}>
                回看报告
              </Button>
              <Button
                size="sm"
                variant="soft"
                onClick={() => setShowExport(true)}
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                导出投递版
              </Button>
            </div>
          </div>
        </div>

        {/* 右栏 */}
        <aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <div className="panel rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-ok" />
              <span className="text-[12px] font-medium">事实安全三道闸</span>
            </div>
            <ul className="space-y-3">
              {[
                { n: 'G1', t: '原文锚定', d: '指不回原文的内容不进入改写稿' },
                { n: 'G2', t: '数字留空', d: '模型不生成任何量化数字' },
                { n: 'G3', t: '禁用表述', d: '拦截「保证录用」类承诺' },
              ].map((g) => (
                <li key={g.n} className="flex gap-2.5">
                  <span className="mt-0.5 font-mono text-[9px] text-fg-dim">{g.n}</span>
                  <div>
                    <div className="text-[11.5px] font-medium text-fg-muted">{g.t}</div>
                    <div className="text-[10.5px] leading-relaxed text-fg-dim">{g.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-fg-dim" />
              <span className="text-[11.5px] font-medium text-fg-muted">导出前提醒</span>
            </div>
            <p className="text-[11px] leading-relaxed text-fg-dim">
              导出前请逐条确认：这里的数字都是真实发生过的吗？
              系统无法替你验证，也不会替你承担后果。
            </p>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-5">
            <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
              换一个岗位
            </div>
            <p className="text-[11px] leading-relaxed text-fg-dim">
              S01 提到，一份经历可以有很多种描述方式。同一段经历换岗只需要重排，不用重写。
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => navigate('/app')}
            >
              新建一个岗位版本
            </Button>
          </div>
        </aside>
      </div>

      {/* 导出弹层 */}
      {showExport && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-fg/40 p-5 backdrop-blur-sm"
          onClick={() => setShowExport(false)}
        >
          <div
            className="panel w-full max-w-2xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink-700 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Doc className="h-3.5 w-3.5 text-brand-400" />
                <span className="text-[13px] font-semibold">投递版 · {current.role}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExport(false)}
                className="rounded p-1 text-fg-dim hover:bg-ink-800 hover:text-fg"
              >
                <XMark className="h-4 w-4" />
              </button>
            </div>

            <pre className="max-h-[46vh] overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-[12px] leading-[1.9] text-fg-muted">
              {compiled}
            </pre>

            <div className="flex flex-col justify-between gap-3 border-t border-ink-700 px-5 py-3.5 sm:flex-row sm:items-center">
              <p className="text-[11px] text-fg-dim">
                已包含 {lines.length} 条。待补数字、删除建议和拦截条目均排除。
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy} disabled={lines.length === 0}>
                  {copied ? '已复制' : '复制文本'}
                </Button>
                <Button size="sm" variant="soft" onClick={() => setShowExport(false)}>
                  完成
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
