import { Button, Kicker, LinkArrow, SectionHead, Shell } from '../components/ui'
import { ArrowRight, ArrowUpRight, Quote, Shield, Target } from '../components/icons'
import { HeroDemo } from '../components/HeroDemo'
import { Reveal } from '../components/Reveal'
import { navigate } from '../lib/router'
import { COMPARISON, FLOW, PAIN_POINTS } from '../data/demo'

/* ------------------------------------------------------------ landing */

export function Landing() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink-850 via-ink-900 to-ink-950">
        <div className="grid-bg absolute inset-0 opacity-[0.55]" />
        <div className="glow-brand pointer-events-none absolute inset-x-0 -top-40 h-[520px] opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />

        <Shell className="relative pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* 左 */}
            <div className="animate-rise">
              <Kicker className="mb-5">AI 简历竞争力分析 · 大学生求职场景</Kicker>

              <h1 className="hero-title">
                把做过的事，
                <span className="hero-title-accent text-grad">讲成值得录用的证据</span>
              </h1>

              <p className="mt-6 max-w-[35rem] text-[16px] leading-[1.9] sm:text-[17px] text-fg-muted">
                职镜不会替你编经历。它只做一件事：
                <span className="text-fg"> 把目标岗位的要求逐条拆开，再把你真实做过的事，一条一条对上。</span>
                对不上的地方，它不猜——它来问你。
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate('/app')}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  体验完整案例
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/method')}>
                  看我们的访谈方法论
                </Button>
              </div>

              <p className="mt-4 text-sm text-fg-muted">
                当前为案例演示。
                <LinkArrow onClick={() => navigate('/practice')}>用自己的经历练一条</LinkArrow>
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-wide text-fg-dim">
                <span className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  首批覆盖教培 / 互联网后端 / 产品运营
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  不新增事实
                </span>
              </div>
            </div>

            {/* 右 */}
            <div className="animate-fade lg:pl-4" style={{ animationDelay: '160ms' }}>
              <HeroDemo />
              <div className="mt-4 flex justify-end">
                <LinkArrow onClick={() => navigate('/practice/example')}>直接体验这条追问</LinkArrow>
              </div>
            </div>
          </div>
        </Shell>
      </section>

      {/* ================= 数据条 ================= */}
      <section className="border-y border-ink-700 bg-ink-850/75">
        <Shell>
          <div className="grid grid-cols-2 divide-ink-700/60 sm:grid-cols-4 sm:divide-x">
            {[
              { n: '7', u: '份', l: '学生与 HR 访谈', s: '5 位学生 · 2 位招聘者' },
              { n: '3', u: '类', l: '首批试点岗位', s: '教培 / 后端 / 产品运营' },
              { n: '6', u: '维', l: 'HR 评价维度', s: '含初始权重' },
              { n: '0', u: '处', l: '允许 AI 新增事实', s: '三道校验闸' },
            ].map((s, i) => (
              <div
                key={s.l}
                className="animate-rise px-1 py-7 sm:px-7 first:pl-0"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-baseline gap-1">
                  <span className="metric-number text-[35px] font-semibold leading-none text-brand-400">{s.n}</span>
                  <span className="text-[12px] text-fg-dim">{s.u}</span>
                </div>
                <div className="mt-2 text-[13px] font-medium">{s.l}</div>
                <div className="mt-0.5 text-[11px] text-fg-dim">{s.s}</div>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      {/* ================= 痛点 ================= */}
      <Shell className="py-20 sm:py-24">
        <SectionHead
          kicker="我们从访谈里听到的"
          title={
            <>
              不是不会写，是
              <span className="text-fg-muted">不知道自己做了什么值得写</span>
            </>
          }
          desc="5 位拿到优质实习或大厂岗位的同学，反复提到同一件事：真正难的从来不是排版和润色，而是「我做过的事，到底对招聘者意味着什么」。"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {PAIN_POINTS.map((p, i) => (
            <Reveal key={p.no} delay={i * 90} className="h-full">
              <article className="panel group relative flex h-full flex-col overflow-hidden rounded-xl p-6 transition-colors hover:border-ink-500">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-fg-dim">{p.no}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-ink-600 to-transparent ltr:ml-3 rtl:mr-3" />
                </div>
                <h3 className="text-[18px] font-bold leading-snug">{p.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-[1.85] text-fg-muted">{p.body}</p>

                <figure className="mt-5 rounded-r-lg border-l-2 border-brand-500/45 bg-ink-900 px-4 py-3">
                  <Quote className="mb-1 h-3 w-3 text-brand-500/60" />
                  <blockquote className="editorial-quote text-[15px] leading-[1.8] text-brand-300">
                    {p.quote}
                  </blockquote>
                  <figcaption className="mt-2 font-mono text-[10.5px] tracking-wide text-fg-dim">
                    {p.who}
                  </figcaption>
                </figure>
              </article>
            </Reveal>
          ))}
        </div>
      </Shell>

      {/* ================= 流程 ================= */}
      <section className="relative border-y border-ink-700/70 bg-ink-900/30 py-20 sm:py-24">
        <div className="grid-bg-sm absolute inset-0 opacity-40" />
        <Shell className="relative">
          <SectionHead
            kicker="产品链路"
            title="四步，从「有一堆经历」到「有一版投得出去的简历」"
            desc="流程不是我们先想好的，是访谈里 5 个人各自摸索出来的路径，被抽象成了同一条。"
          />

          <Reveal>
            <div className="grid gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-4">
              {FLOW.map((f) => (
                <div key={f.step} className="group relative bg-ink-850 p-6 transition-colors hover:bg-ink-800">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-600 bg-ink-900 font-mono text-[11px] text-brand-300">
                      {f.step}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-500 transition-colors group-hover:text-brand-500" />
                  </div>
                  <h3 className="text-[17px] font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-[1.8] text-fg-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-700 bg-ink-850/60 px-5 py-4">
            <p className="text-[13px] text-fg-muted">
              想看完整链路跑起来？演示里预置了 3 个来自访谈的真实案例。
            </p>
            <LinkArrow onClick={() => navigate('/app')}>打开演示工作台</LinkArrow>
          </div>
        </Shell>
      </section>

      {/* ================= 对比 ================= */}
      <Shell className="py-20 sm:py-24">
        <SectionHead
          kicker="差异在哪"
          title="同样是「AI 改简历」，路径可以完全不同"
          desc="通用模型负责「写得好看」，招聘平台负责「筛得快」。我们想做的是中间那个一直缺位的东西：可核对、可解释、不编造。"
        />

        <div className="panel overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-ink-700 bg-ink-900/60">
                  <th className="px-5 py-3.5 text-left font-medium text-fg-dim">能力项</th>
                  {COMPARISON.cols.map((c, i) => (
                    <th
                      key={c}
                      className={`px-3 py-3.5 text-center font-medium ${
                        i === COMPARISON.cols.length - 1
                          ? 'bg-brand-500/10 text-brand-300'
                          : 'text-fg-dim'
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((r) => (
                  <tr key={r.label} className="border-b border-ink-700/50 last:border-0">
                    <td className="px-5 py-3 text-fg-muted">{r.label}</td>
                    {r.v.map((v, i) => {
                      const last = i === r.v.length - 1
                      const tone =
                        v === '强'
                          ? 'text-ok'
                          : v === '部分'
                            ? 'text-warn'
                            : v === '弱'
                              ? 'text-fg-dim'
                              : v === '无'
                                ? 'text-ink-500'
                                : 'text-fg-muted'
                      return (
                        <td
                          key={i}
                          className={`px-3 py-3 text-center ${last ? 'bg-brand-500/[0.07] font-medium' : ''}`}
                        >
                          <span className={last ? 'text-brand-300' : tone}>{v}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-fg-dim">
          注：评分依据各类方案公开功能与产品定位，用于说明差异方向，非第三方测评结果。
        </p>
      </Shell>

      {/* ================= 方法论 CTA ================= */}
      <section className="relative overflow-hidden border-t border-ink-700/70">
        <div className="glow-brand pointer-events-none absolute inset-0 opacity-50" />
        <Shell className="relative py-20 text-center sm:py-24">
          <Kicker className="mb-5 justify-center">研究支撑</Kicker>
          <h2 className="editorial-heading mx-auto max-w-2xl text-[28px] sm:text-[36px]">
            每一条产品规则，都能指回某一句访谈原话
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[14px] leading-[1.85] text-fg-muted">
            我们整理了 5 份、共 8 万余字的访谈转录稿，把里面被反复验证的做法，
            拆成了 5 条设计原则和 3 道事实校验闸。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              variant="soft"
              onClick={() => navigate('/method')}
              icon={<ArrowUpRight className="h-4 w-4" />}
            >
              阅读方法论
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/report')}>
              直接看分析报告
            </Button>
          </div>
        </Shell>
      </section>
    </>
  )
}
