import { useEffect, useMemo, useState } from 'react'
import { Button, Kicker, Shell, Tag } from '../components/ui'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Doc,
  HelpCircle,
  Minus,
  Shield,
  Sparkle,
  Target,
  XMark,
} from '../components/icons'
import { navigate } from '../lib/router'
import {
  analyze,
  KIND_LABEL,
  STATUS_LABEL,
  type CustomAnalysis,
  type MatchStatus,
  type ReqKind,
} from '../lib/customAnalyze'

const STORAGE_KEY = 'jl.custom.resume'

const STATUS_STYLE: Record<MatchStatus, { cls: string; Icon: typeof CheckCircle }> = {
  met: { cls: 'text-ok bg-ok/10 ring-ok/30', Icon: CheckCircle },
  partial: { cls: 'text-warn bg-warn/10 ring-warn/30', Icon: Minus },
  unverified: { cls: 'text-info bg-info/10 ring-info/30', Icon: HelpCircle },
  missing: { cls: 'text-bad bg-bad/10 ring-bad/30', Icon: XMark },
}

const SAMPLE_RESUME = `李同学 ｜ 市场营销 ｜ 2021级本科 ｜ 大四
电话 13800000000 ｜ 邮箱 li@example.com
求职意向：产品运营实习生

【实习经历】
某新能源车企 · 市场顾问实习生（2026.03–2026.06）
· 负责门店客户接待，为到店客户讲解车型产品
· 协助店长运营门店，参与日常事务

某互联网公司 · 市场部实习生（2025.07–2025.09）
· 参与社交媒体内容运营，撰写图文
· 协助整理竞品资料

【项目经历】
校园非遗市集策划（2025.11）
· 独立策划并落地 3 天市集，招募 24 个摊主，日均客流约 800 人

【技能】
Excel、剪映、CET-6`

const SAMPLE_JD = `产品运营实习生（内容生态方向）
【岗位职责】
1. 负责官方账号日常运营，提升账号知名度与粉丝量
2. 根据产品特性和目标用户，策划并撰写运营脚本，包括短视频脚本、图文内容
3. 分析运营数据，输出内容复盘报告，持续优化内容策略
4. 与产品、设计协作，跟进内容从策划到上线的全流程
5. 参与用户反馈收集与需求整理

【任职要求】
1. 本科及以上在读，可实习 3 个月以上，每周到岗 4 天
2. 熟悉小红书 / 抖音 / B站在内的内容平台生态
3. 具备良好文字表达能力，有内容作品者优先
4. 熟练使用剪映 / PS 等基础工具`

export function Analyze() {
  // 演示捷径：?demo=1 直接填好一份简历 + 一段 JD 并跑出结果
  const demo = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('demo') === '1'
    } catch {
      return false
    }
  }, [])

  const [resume, setResume] = useState(demo ? SAMPLE_RESUME : '')
  const [jd, setJd] = useState(demo ? SAMPLE_JD : '')
  const [result, setResult] = useState<CustomAnalysis | null>(demo ? analyze(SAMPLE_RESUME, SAMPLE_JD) : null)
  const [ran, setRan] = useState(demo)

  useEffect(() => {
    if (demo) return
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) setResume(saved)
    } catch {
      /* 忽略 */
    }
  }, [demo])

  const preview = useMemo(
    () => resume.split('\n').filter((l) => l.trim()).slice(0, 8),
    [resume],
  )

  function run() {
    setResult(analyze(resume, jd))
    setRan(true)
  }

  const ready = resume.trim().length > 20 && jd.trim().length > 10

  return (
    <Shell className="py-10 sm:py-14">
      {/* 页头 */}
      <div className="mb-8">
        <Kicker className="mb-3">自定义材料 · 岗位对照</Kicker>
        <h1 className="editorial-heading text-[28px] leading-tight sm:text-[36px]">
          用你自己的简历，对一次岗位
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.85] text-fg-muted">
          左边是你的简历，右边贴目标岗位描述。系统会先把 JD 拆成条目，
          再逐条去简历里找依据，给出四态判定。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag tone="ok">本地运行 · 不上传</Tag>
          <Tag tone="warn">规则匹配 · 非语义理解</Tag>
        </div>
      </div>

      {/* 两份材料 */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 简历 */}
        <div className="panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5">
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <Doc className="h-3.5 w-3.5 text-brand-500" />
              你的简历
            </span>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="text-[11.5px] text-brand-600 hover:underline"
            >
              {resume ? '重新上传 / 粘贴' : '去上传'}
            </button>
          </div>

          {resume ? (
            <div className="p-5">
              <textarea
                value={resume}
                onChange={(e) => {
                  setResume(e.target.value)
                  setResult(null)
                }}
                spellCheck={false}
                className="h-[220px] w-full resize-none rounded-lg border border-ink-700 bg-ink-950/50 p-3 font-mono text-[11.5px] leading-[1.8] text-fg-muted outline-none focus:border-brand-500/60"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-fg-dim">
                <span>{resume.replace(/\s/g, '').length} 字 · 可在此直接修改</span>
                <span className="truncate">{preview[0]?.slice(0, 20)}</span>
              </div>
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <Doc className="mx-auto h-5 w-5 text-ink-500" />
              <p className="mt-3 text-[12.5px] text-fg-muted">还没有简历</p>
              <p className="mt-1 text-[11px] text-fg-dim">先去上传页解析一份，或直接在这里粘贴</p>
              <Button size="sm" variant="soft" className="mt-4" onClick={() => navigate('/upload')}>
                去上传
              </Button>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="也可以直接粘贴简历正文…"
                className="mt-4 h-[120px] w-full resize-none rounded-lg border border-ink-700 bg-ink-950/50 p-3 font-mono text-[11.5px] leading-[1.8] outline-none focus:border-brand-500/60"
              />
            </div>
          )}
        </div>

        {/* JD */}
        <div className="panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5">
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <Target className="h-3.5 w-3.5 text-brand-500" />
              目标岗位描述
            </span>
            <button
              type="button"
              onClick={() => {
                setJd(SAMPLE_JD)
                setResult(null)
              }}
              className="text-[11.5px] text-brand-600 hover:underline"
            >
              填入示例 JD
            </button>
          </div>
          <div className="p-5">
            <textarea
              value={jd}
              onChange={(e) => {
                setJd(e.target.value)
                setResult(null)
              }}
              placeholder="把岗位职责与任职要求整段粘贴进来…"
              spellCheck={false}
              className="h-[220px] w-full resize-none rounded-lg border border-ink-700 bg-ink-950/50 p-3 font-mono text-[11.5px] leading-[1.8] text-fg-muted outline-none placeholder:text-fg-dim/70 focus:border-brand-500/60"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-fg-dim">
              <span>{jd.replace(/\s/g, '').length} 字</span>
              <span>越具体，拆出来的条越准</span>
            </div>
          </div>
        </div>
      </div>

      {/* 执行 */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/40 px-5 py-4">
        <p className="text-[12px] text-fg-muted">
          {ready ? '两份材料都齐了，可以开始对照。' : '还需要一份简历和一段岗位描述。'}
        </p>
        <Button onClick={run} disabled={!ready} icon={<Sparkle className="h-3.5 w-3.5" />}>
          开始对照
        </Button>
      </div>

      {/* 结果 */}
      {ran && result && (
        <div className="mt-6 space-y-5">
          {/* 概览 */}
          <section className="panel overflow-hidden rounded-xl">
            <div className="grid gap-6 p-6 sm:grid-cols-[170px_1fr] sm:gap-8">
              <div className="flex flex-col items-center justify-center">
                <div className="tnum flex items-baseline gap-1">
                  <span className="text-[46px] font-semibold leading-none">{result.score}</span>
                  <span className="text-[13px] text-fg-dim">/100</span>
                </div>
                <div className="mt-2 text-[11.5px] text-fg-muted">规则匹配度</div>
                <div className="mt-1 font-mono text-[10px] text-fg-dim">按条目权重加权</div>
              </div>

              <div className="min-w-0">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ['met', '满足'],
                      ['partial', '部分满足'],
                      ['unverified', '待核实'],
                      ['missing', '不满足'],
                    ] as const
                  ).map(([k, label]) => {
                    const s = STATUS_STYLE[k]
                    return (
                      <div key={k} className="rounded-lg border border-ink-700 bg-ink-900/50 px-3 py-2.5">
                        <div className={`flex items-baseline gap-1 ${s.cls.split(' ')[0]}`}>
                          <span className="tnum text-[19px] font-semibold">{result.stats[k]}</span>
                          <span className="text-[10.5px] text-fg-dim">条</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-fg-muted">{label}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-2">
                  {result.hardFail && (
                    <p className="flex items-start gap-1.5 rounded-md bg-bad/[0.07] px-2.5 py-2 text-[11.5px] leading-relaxed text-bad">
                      <AlertTriangle className="mt-[2px] h-3 w-3 shrink-0" />
                      有硬性条件没找到依据，按门槛规则总分封顶 40。先确认是真没有，还是简历里换了说法。
                    </p>
                  )}
                  <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-fg-dim">
                    <Shield className="mt-[2px] h-3 w-3 shrink-0" />
                    这是**关键词与结构的规则匹配**，不是语义理解。它会把「相关但换了说法」的经历判成「待核实」，
                    请逐条核对证据原句。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 逐条 */}
          {(['hard', 'core', 'plus'] as ReqKind[]).map((kind) => {
            const list = result.reqs.filter((r) => r.kind === kind)
            if (!list.length) return null
            return (
              <section key={kind} className="panel overflow-hidden rounded-xl">
                <header className="flex items-center justify-between border-b border-ink-700/70 bg-ink-900/40 px-5 py-3.5">
                  <h2 className="text-[13px] font-semibold">{KIND_LABEL[kind]}</h2>
                  <span className="tnum font-mono text-[11px] text-fg-dim">{list.length}</span>
                </header>
                <div className="divide-y divide-ink-700/50">
                  {list.map((r) => {
                    const s = STATUS_STYLE[r.status]
                    return (
                      <div key={r.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[9.5px] tracking-wide text-fg-dim">
                                {r.id}
                              </span>
                              <span className="font-mono text-[10px] text-fg-dim">
                                权重 {r.weight.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-[12.5px] leading-[1.7] text-fg">{r.text}</p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${s.cls}`}
                          >
                            <s.Icon className="h-3 w-3" />
                            {STATUS_LABEL[r.status]}
                          </span>
                        </div>

                        {r.evidence ? (
                          <div className="mt-2 rounded-md border border-ink-700 bg-ink-950/40 px-3 py-2">
                            <div className="mb-0.5 font-mono text-[9px] tracking-wide text-fg-dim">
                              简历中的可能依据 · 重合度 {r.affinity}
                            </div>
                            <p className="text-[11.5px] leading-relaxed text-fg-muted">
                              {r.evidence}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-[11px] text-fg-dim">
                            简历里没有找到对应内容——可能是真没有，也可能只是换了说法。
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* 两个清单 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-warn/25 bg-warn/[0.05] p-5">
              <div className="mb-2.5 flex items-center gap-2 text-[12.5px] font-semibold text-warn">
                <AlertTriangle className="h-3.5 w-3.5" />
                这些要求没找到依据（{result.gaps.length}）
              </div>
              {result.gaps.length === 0 ? (
                <p className="text-[11.5px] text-fg-muted">每条要求都找到了对应内容。</p>
              ) : (
                <ul className="space-y-1.5">
                  {result.gaps.map((g, i) => (
                    <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-fg-muted">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-warn/70" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/40 p-5">
              <div className="mb-2.5 flex items-center gap-2 text-[12.5px] font-semibold text-fg">
                <Minus className="h-3.5 w-3.5 text-fg-dim" />
                简历里没被用到的条目（{result.unused.length}）
              </div>
              {result.unused.length === 0 ? (
                <p className="text-[11.5px] text-fg-muted">所有条目都被某条要求用上了。</p>
              ) : (
                <ul className="space-y-1.5">
                  {result.unused.map((u, i) => (
                    <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-fg-dim">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-500" />
                      <span className="line-clamp-2">{u}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[10.5px] leading-relaxed text-fg-dim">
                不代表该删——只说明这版 JD 没用上它们。换岗位时可能正好是主角。
              </p>
            </div>
          </div>

          {/* 下一步 */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/40 px-5 py-4">
            <p className="text-[12px] text-fg-muted">
              想看到「逐条改写 + 事实校验 + 导出投递版」的完整效果，可以走一遍预设案例。
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/upload')}>
                回到上传
              </Button>
              <Button size="sm" onClick={() => navigate('/resume')} icon={<ArrowRight className="h-3.5 w-3.5" />}>
                看完整改写流程
              </Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
