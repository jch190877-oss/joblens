import { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Kicker, Shell, Tag } from '../components/ui'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Doc,
  HelpCircle,
  Shield,
  Sparkle,
  XMark,
} from '../components/icons'
import { navigate } from '../lib/router'
import { ACCEPT, kindOf, parseResumeFile, type ParseMethod } from '../lib/parseResume'
import { checkResume, summarize, type CheckStatus } from '../lib/resumeCheck'

const METHOD_LABEL: Record<ParseMethod, string> = {
  pdf: 'PDF 文本提取',
  docx: 'Word 提取',
  text: '纯文本',
  ocr: '图片 OCR 识别',
}

const STATUS_META: Record<CheckStatus, { label: string; cls: string; dot: string }> = {
  pass: { label: '通过', cls: 'text-ok', dot: 'bg-ok' },
  warn: { label: '注意', cls: 'text-warn', dot: 'bg-warn' },
  fail: { label: '必须改', cls: 'text-bad', dot: 'bg-bad' },
}

const SAMPLE = `李同学 ｜ 市场营销 ｜ 2021级本科 ｜ 大四
电话 138-0000-0000 ｜ 邮箱 li@example.com
求职意向：产品运营实习生

【实习经历】
某新能源车企 · 市场顾问实习生（2026.03–2026.06）
· 负责门店客户接待，为到店客户讲解车型产品
· 协助店长运营门店，参与日常事务

【项目经历】
校园非遗市集策划（2025.11）
· 独立策划并落地 3 天市集，招募 24 个摊主，日均客流约 800 人

【技能】
Excel、剪映、CET-6`

export function Upload() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [method, setMethod] = useState<ParseMethod | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [fileName, setFileName] = useState('')
  // 演示捷径：?sample=1 直接填好示例，方便现场演示体检结果
  const [text, setText] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('sample') === '1' ? SAMPLE : ''
    } catch {
      return ''
    }
  })

  const checks = useMemo(() => (text.trim() ? checkResume(text) : []), [text])
  const sum = useMemo(() => summarize(checks), [checks])

  const handleFile = useCallback(async (file: File) => {
    const kind = kindOf(file)
    if (!kind) {
      setError('不支持这个格式。可以上传 PDF、Word(.docx)、纯文本，或简历截图。')
      return
    }
    setError('')
    setWarnings([])
    setFileName(file.name)
    setParsing(true)
    setProgress('准备中…')
    try {
      const res = await parseResumeFile(file, setProgress)
      setText(res.text)
      setMethod(res.method)
      setWarnings(res.warnings)
      if (!res.text.trim()) {
        setError('没有提取到文字。如果是扫描件请在下方直接粘贴，或换一张更清晰的截图。')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败，请改用手动粘贴。')
    } finally {
      setParsing(false)
      setProgress('')
    }
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) void handleFile(f)
  }

  return (
    <Shell className="py-10 sm:py-14">
      {/* 页头 */}
      <div className="mb-8">
        <Kicker className="mb-3">上传简历 · 本地解析</Kicker>
        <h1 className="editorial-heading text-[28px] leading-tight sm:text-[36px]">
          把你的简历放进来，先做一次体检
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-fg-muted">
          支持 PDF、Word、纯文本，也能直接传简历截图（OCR 识别）。
          <span className="text-fg">所有解析都在你的浏览器里完成，文件不会上传到任何服务器。</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag tone="ok">本地解析 · 不上传</Tag>
          <Tag tone="neutral">PDF / Word / 文本 / 截图</Tag>
          <Tag tone="neutral">20 MB 以内</Tag>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* ============ 左：上传与解析 ============ */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging
                ? 'border-brand-500 bg-brand-500/[0.07]'
                : 'border-ink-600 bg-ink-900/40 hover:border-brand-500/60 hover:bg-ink-900/70'
            }`}
          >
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-600 bg-ink-850">
              <Doc className="h-5 w-5 text-brand-500" />
            </span>
            <p className="text-[14px] font-medium">
              {parsing ? progress || '解析中…' : '点击选择文件，或把文件拖到这里'}
            </p>
            <p className="mt-1.5 text-[11.5px] text-fg-dim">
              PDF · DOCX · TXT · PNG / JPG 简历截图
            </p>
            {parsing && (
              <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-ink-700">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleFile(f)
                e.target.value = ''
              }}
            />
          </div>

          {fileName && (
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-fg-muted">
              <span className="font-mono text-fg-dim">{fileName}</span>
              {method && <Tag tone="brand">{METHOD_LABEL[method]}</Tag>}
              <button
                type="button"
                onClick={() => {
                  setText('')
                  setFileName('')
                  setMethod(null)
                  setWarnings([])
                  setError('')
                }}
                className="text-brand-600 hover:underline"
              >
                清空
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-bad/30 bg-bad/[0.06] px-3.5 py-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bad" />
              <p className="text-[11.5px] leading-relaxed text-bad">{error}</p>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-warn/25 bg-warn/[0.05] px-3.5 py-2.5"
                >
                  <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
                  <p className="text-[11.5px] leading-relaxed text-fg-muted">{w}</p>
                </div>
              ))}
            </div>
          )}

          {/* 文本区 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[12.5px] font-medium text-fg-muted">
                简历正文
                <span className="ml-2 font-normal text-fg-dim">解析结果永远需要你核对一遍</span>
              </label>
              <div className="flex gap-3 text-[11.5px]">
                <button
                  type="button"
                  onClick={() => {
                    setText(SAMPLE)
                    setFileName('示例简历（已填充）')
                    setMethod('text')
                    setWarnings([])
                    setError('')
                  }}
                  className="text-brand-600 hover:underline"
                >
                  用示例试试
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              placeholder="解析结果会出现在这里，也可以直接把自己的简历粘贴进来。"
              className="h-[300px] w-full resize-none rounded-xl border border-ink-700 bg-ink-950/60 p-4 font-mono text-[12px] leading-[1.85] text-fg outline-none transition-colors placeholder:text-fg-dim/70 focus:border-brand-500/60"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-fg-dim">
              <span>{text.replace(/\s/g, '').length} 字</span>
              <span>不会上传 · 刷新即清空</span>
            </div>
          </div>
        </div>

        {/* ============ 右：体检 ============ */}
        <div className="space-y-4">
          <div className="panel overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5">
              <span className="flex items-center gap-2 text-[13px] font-semibold">
                <Shield className="h-3.5 w-3.5 text-brand-500" />
                简历体检
              </span>
              {checks.length > 0 && (
                <span className="font-mono text-[10.5px] text-fg-dim">
                  通过 {sum.pass} · 注意 {sum.warn} · 必须改 {sum.fail}
                </span>
              )}
            </div>

            {checks.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Sparkle className="mx-auto h-5 w-5 text-ink-500" />
                <p className="mt-3 text-[12.5px] text-fg-muted">上传文件或粘贴简历后，这里会出现 6 项检查</p>
                <p className="mt-1 text-[11px] text-fg-dim">
                  联系方式 · 篇幅 · 量化 · 动词层级 · 结构模块 · 时间线
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ink-700/50">
                {checks.map((c) => {
                  const m = STATUS_META[c.status]
                  return (
                    <div key={c.id} className="flex items-start gap-3 px-5 py-3.5">
                      <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${m.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-medium">{c.label}</span>
                          <span className={`font-mono text-[10px] ${m.cls}`}>{m.label}</span>
                        </div>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-fg-muted">
                          {c.detail}
                        </p>
                        {c.evidence && (
                          <p className="mt-1 truncate font-mono text-[10.5px] text-fg-dim">
                            {c.evidence}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 下一步 */}
          <div className="panel relative overflow-hidden rounded-xl p-5">
            <div className="glow-brand pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <Sparkle className="h-3.5 w-3.5 text-brand-500" />
                下一步：对着具体岗位逐条对照
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-fg-muted">
                体检只能看出通用问题。要判断「这份简历配不配这个岗位」，
                需要先把 JD 拆成条目、再逐条比对原文——这一步需要目标岗位描述。
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-fg-dim">
                「自定义简历 + 自定义 JD」的完整分析链路仍在开发中。当前可以先用预设案例看完整流程。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate('/app')} icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  看预设案例的完整对照
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/report')}>
                  看一份对照报告
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-ok/25 bg-ok/[0.05] px-4 py-3">
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />
            <p className="text-[11px] leading-relaxed text-fg-muted">
              体检规则全部是确定性的文本判断（正则与词表），不调用模型，
              所以结果稳定、可解释，也不会凭空生成你的经历。
            </p>
          </div>
        </div>
      </div>
    </Shell>
  )
}
