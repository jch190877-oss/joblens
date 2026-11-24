import { Button, Kicker, SectionHead, Shell, Tag } from '../components/ui'
import { ArrowRight, Quote, Shield, Target, Gauge, Layers } from '../components/icons'
import { navigate } from '../lib/router'
import { Reveal } from '../components/Reveal'
import { GATES, INTERVIEW_ROWS, PRINCIPLES, WEIGHTS } from '../data/demo'

export function Method() {
  return (
    <div className="relative">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-35" />

      <Shell className="relative py-12 sm:py-16">
        {/* 页头 */}
        <div className="max-w-3xl">
          <Kicker className="mb-4">访谈方法论</Kicker>
          <h1 className="text-[30px] font-semibold leading-[1.22] sm:text-[40px]">
            我们不是在猜产品该长什么样
          </h1>
          <p className="mt-5 text-[14.5px] leading-[1.9] text-fg-muted">
            在写第一行代码之前，团队先访谈了 5 位已经拿到优质实习或大厂岗位的同学，
            覆盖教培、互联网技术、市场营销与产品运营三条路径，形成 5 份逐字转录稿。
            下面这些原则，每一条都能指回某一句原话。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Tag tone="brand">5 份逐字转录稿</Tag>
            <Tag tone="neutral">3 类岗位</Tag>
            <Tag tone="neutral">6 类评价维度</Tag>
            <Tag tone="ok">0 处新增事实</Tag>
          </div>
        </div>

        {/* 一、访谈样本 */}
        <section className="mt-16">
          <SectionHead
            kicker="一 · 样本"
            title="5 位受访者，5 种不同的卡点"
            desc="他们不是「不会用 AI」的人——恰恰相反，每个人都在用，而且都摸索出了自己的方法。问题在于这些方法没有被沉淀下来。"
          />

          <div className="panel overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-ink-700 bg-ink-900/50 text-[11px] uppercase tracking-wider text-fg-dim">
                    <th className="px-4 py-3 font-medium">代号</th>
                    <th className="px-4 py-3 font-medium">画像</th>
                    <th className="px-4 py-3 font-medium">目标岗位</th>
                    <th className="px-4 py-3 font-medium">最关键的发现</th>
                    <th className="px-4 py-3 font-medium">对应模块</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERVIEW_ROWS.map((r) => (
                    <tr
                      key={r.code}
                      className="border-b border-ink-700/40 align-top transition-colors last:border-0 hover:bg-ink-800/30"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-brand-300">{r.code}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="text-fg">{r.person}</div>
                        <div className="mt-0.5 text-[11px] text-fg-dim">{r.profile}</div>
                      </td>
                      <td className="px-4 py-3.5 text-fg-muted">{r.target}</td>
                      <td className="max-w-[320px] px-4 py-3.5 leading-relaxed text-fg-muted">
                        {r.finding}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md border border-brand-500/25 bg-brand-500/10 px-2 py-1 text-[11px] text-brand-300">
                          {r.module}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 二、设计原则 */}
        <section className="mt-16">
          <SectionHead
            kicker="二 · 设计原则"
            title="5 条被原话验证过的规则"
            desc="每一条都直接决定了产品里的某个交互——不是文案，是行为。"
          />

          <div className="grid gap-3 md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <Reveal
                key={p.no}
                delay={i * 60}
                className={i === PRINCIPLES.length - 1 ? 'md:col-span-2' : ''}
              >
                <article className="panel h-full rounded-xl p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-brand-300">
                    {p.no}
                  </span>
                  <span className="font-mono text-[10px] text-fg-dim">来源 {p.who}</span>
                </div>
                <h3 className="text-[15px] font-semibold">{p.title}</h3>
                <p className="mt-2 text-[12.5px] leading-[1.8] text-fg-muted">{p.desc}</p>
                <figure className="mt-4 flex gap-2.5 border-t border-ink-700/60 pt-3.5">
                  <Quote className="mt-0.5 h-3 w-3 shrink-0 text-brand-500/50" />
                  <blockquote className="text-[12px] leading-[1.75] text-fg/75">
                    「{p.quote}」
                  </blockquote>
                </figure>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 三、三道闸 */}
        <section className="mt-16">
          <SectionHead
            kicker="三 · 事实安全"
            title="三道闸，挡住「看起来很厉害的假话」"
            desc="S02 说得最直接：AI 会不知不觉帮你伪造几条你根本没做过的事。如果没有校验，这句话就是产品最大的风险。"
          />

          <div className="grid gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 sm:grid-cols-3">
            {GATES.map((g) => (
              <div key={g.no} className="bg-ink-850 p-6">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg border border-ok/25 bg-ok/10">
                  <Shield className="h-4 w-4 text-ok" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-fg-dim">{g.no}</span>
                  <h3 className="text-[14px] font-semibold">{g.title}</h3>
                </div>
                <p className="mt-2 text-[12px] leading-[1.8] text-fg-muted">{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 四、评分口径 */}
        <section className="mt-16">
          <SectionHead
            kicker="四 · 评分口径"
            title="把 HR 的判断，变成可复查的字段"
            desc="我们没有做一个「黑箱打分器」。每一项分数都对应一个可观察字段，以及一组访谈里问过 HR 的问题。"
          />

          <div className="panel overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-ink-700 bg-ink-900/50 text-[11px] uppercase tracking-wider text-fg-dim">
                    <th className="px-4 py-3 font-medium">维度</th>
                    <th className="px-4 py-3 font-medium">对应的访谈判断问题</th>
                    <th className="px-4 py-3 font-medium">产品输出字段</th>
                    <th className="px-4 py-3 text-right font-medium">初始权重</th>
                  </tr>
                </thead>
                <tbody>
                  {WEIGHTS.map((w) => (
                    <tr
                      key={w.dim}
                      className="border-b border-ink-700/40 last:border-0 hover:bg-ink-800/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="flex items-center gap-2 text-fg">
                          <Gauge className="h-3 w-3 text-fg-dim" />
                          {w.dim}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-fg-muted">{w.q}</td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-fg-dim">{w.field}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1 w-12 overflow-hidden rounded-full bg-ink-700">
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{ width: `${(w.w / 25) * 100}%` }}
                            />
                          </div>
                          <span className="tnum w-7 font-mono text-[11.5px] text-fg-muted">
                            {w.w}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-fg-dim">
            <Layers className="mt-[2px] h-3 w-3 shrink-0" />
            <span>
              权重来自访谈编码的初始设定，会随 HR 复核样本与用户采纳数据滚动校准。
              分数用于定位问题、排序修改优先级，不用于预测录用结果。
            </span>
          </p>
        </section>

        {/* 五、边界说明 */}
        <section className="mt-16">
          <div className="panel relative overflow-hidden rounded-xl p-7">
            <div className="glow-brand pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative max-w-3xl">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-400" />
                <h2 className="text-[15px] font-semibold">关于这份 Demo 的边界，我们想说明白</h2>
              </div>
              <ul className="space-y-2.5 text-[12.5px] leading-[1.85] text-fg-muted">
                <li className="flex gap-2.5">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  <span>
                    当前版本为<span className="text-fg">前端原型</span>：报告数据预置，
                    AI 分析链路（JD 拆解、反问生成、事实校验器）尚在开发中。
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  <span>
                    所有案例整理自团队访谈转录稿，已作匿名化处理；
                    其中一条访谈的原岗位信息由受访者当场说明为「假设性举例」，该案例仅作流程演示，不用于推断任何真实招聘标准。
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  <span>
                    平台输出为求职辅助建议，所有结论均指向简历原文与规则编号；
                    录用判断由招聘主体独立完成，平台不作录用承诺。
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => navigate('/app')} icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  去演示里验证这些规则
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  回到首页
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Shell>
    </div>
  )
}
