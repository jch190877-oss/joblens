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
  Target,
} from '../components/icons'
import { navigate } from '../lib/router'
import { parseResumeFile, type ParseMethod } from '../lib/parseResume'
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
  const imgRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [method, setMethod] = useState<ParseMethod | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [fileName, setFileName] = useState('')
  // 演示捷径：?sample=1 直接填好示例
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

  /** 载入随站点打包的示例截图，真实走一遍 OCR */
  async function useSampleImage() {
    try {
      setError('')
      setProgress('读取示例截图…')
      setParsing(true)
      const url = new URL('samples/resume-photo.png', document.baseURI).href
      const res = await fetch(url)
      const blob = await res.blob()
      const file = new File([blob], '示例简历截图.png', { type: 'image/png' })
      setParsing(false)
      await handleFile(file)
    } catch {
      setParsing(false)
      setError('示例截图加载失败，请直接上传一张图片试试。')
    }
  }

  function reset() {
    setText('')
    setFileName('')
    setMethod(null)
    setWarnings([])
    setError('')
  }

  const entries = [
    {
      key: 'file',
      title: '上传简历文件',
      desc: 'PDF · Word · TXT',
      hint: '提取文本层，排版不乱',
      onClick: () => fileRef.current?.click(),
      Icon: Doc,
    },
    {
      key: 'image',
      title: '上传简历截图',
      desc: 'PNG · JPG · 手机拍照',
      hint: '自动 OCR 识别成文字',
      onClick: () => imgRef.current?.click(),
      Icon: Sparkle,
    },
    {
      key: 'text',
      title: '直接粘贴文本',
      desc: '手打 · 从别处复制',
      hint: '最准，也不会解析失败',
      onClick: () => textRef.current?.focus(),
      Icon: Target,
    },
  ]

  return (
    <Shell className="py-10 sm:py-14">
      {/* 页头 */}
      <div className="mb-8">
        <Kicker className="mb-3">上传简历 · 多模态输入</Kicker>
        <h1 className="editorial-heading text-[28px] leading-tight sm:text-[36px]">
          文件、截图、文本，三种方式都行
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-fg-muted">
          简历可能是 PDF、Word，也可能只是手机里的一张照片。
          <span className="text-fg">三种输入都会在浏览器里解析成可编辑的文本，文件不会上传到任何服务器。</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag tone="ok">本地解析 · 不上传</Tag>
          <Tag tone="neutral">PDF / Word / TXT</Tag>
          <Tag tone="neutral">截图 OCR · 语言包已内置</Tag>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* ============ 左：三种输入 ============ */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {entries.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={e.onClick}
                className="group flex flex-col items-start rounded-xl border border-ink-600 bg-ink-900/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-500/60 hover:bg-ink-900/80 hover:shadow-[0_12px_28px_-16px_rgba(23,36,58,0.5)]"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-850 transition-colors group-hover:border-brand-500/40 group-hover:bg-brand-500/10">
                  <e.Icon className="h-4 w-4 text-brand-500" />
                </span>
                <span className="text-[12.5px] font-semibold leading-snug">{e.title}</span>
                <span className="mt-1 font-mono text-[10px] tracking-wide text-fg-dim">{e.desc}</span>
                <span className="mt-1.5 text-[10.5px] leading-relaxed text-fg-dim">{e.hint}</span>
              </button>
            ))}
          </div>

          {/* 拖拽区 */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors ${
              dragging
                ? 'border-brand-500 bg-brand-500/[0.07]'
                : 'border-ink-600 bg-ink-900/30 hover:border-brand-500/50'
            }`}
          >
            {parsing ? (
              <span className="text-[12.5px] text-fg-muted">{progress || '解析中…'}</span>
            ) : (
              <>
                <Doc className="h-3.5 w-3.5 text-fg-dim" />
                <span className="text-[12px] text-fg-muted">
                  也可以把文件或图片拖到这里
                </span>
              </>
            )}
          </div>

          {/* 示例入口 */}
          <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
            <span className="text-fg-dim">没有材料？</span>
            <button
              type="button"
              onClick={useSampleImage}
              disabled={parsing}
              className="text-brand-600 hover:underline disabled:opacity-50"
            >
              用示例截图试 OCR
            </button>
            <span className="text-ink-500">|</span>
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
              用示例文本
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.rtf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFile(f)
              e.target.value = ''
            }}
          />
          <input
            ref={imgRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/bmp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFile(f)
              e.target.value = ''
            }}
          />

          {fileName && (
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-fg-muted">
              <span className="truncate font-mono text-fg-dim">{fileName}</span>
              {method && <Tag tone="brand">{METHOD_LABEL[method]}</Tag>}
              <button type="button" onClick={reset} className="text-brand-600 hover:underline">
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
            </div>
            <textarea
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              placeholder="解析结果会出现在这里，也可以直接把自己的简历粘贴进来。"
              className="h-[260px] w-full resize-none rounded-xl border border-ink-700 bg-ink-950/60 p-4 font-mono text-[12px] leading-[1.85] text-fg outline-none transition-colors placeholder:text-fg-dim/70 focus:border-brand-500/60"
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
                <Target className="h-3.5 w-3.5 text-brand-500" />
                下一步：对着具体岗位逐条对照
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-fg-muted">
                体检只能看出通用问题。要判断「这份简历配不配这个岗位」，
                需要先把 JD 拆成条目、再逐条比对原文——把那一段岗位描述贴进来就行。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={!text.trim()}
                  onClick={() => {
                    try {
                      sessionStorage.setItem('jl.custom.resume', text)
                    } catch {
                      /* 忽略 */
                    }
                    navigate('/analyze')
                  }}
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  用这份简历做岗位对照
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/app')}>
                  看预设案例
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-ok/25 bg-ok/[0.05] px-4 py-3">
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />
            <p className="text-[11px] leading-relaxed text-fg-muted">
              文件解析与 OCR 都在浏览器本地完成，不上传服务器；
              识别用的中文语言包随站点一起打包，现场断网也能用。
            </p>
          </div>
        </div>
      </div>
    </Shell>
  )
}
