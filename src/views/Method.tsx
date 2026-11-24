import { Button, Shell } from '../components/ui'
import { navigate } from '../lib/router'
import { COMPARISON, GATES, INTERVIEW_ROWS, PRINCIPLES, WEIGHTS } from '../data/demo'

const lessonSections = [
  { id: 'interviews', title: '访谈样本', description: '5 位受访者的求职卡点' },
  { id: 'principles', title: '设计原则', description: '5 条原则与原话出处' },
  { id: 'gates', title: '事实安全', description: '原文、数字与禁用表述' },
  { id: 'weights', title: '评分口径', description: '评价维度与初始权重' },
  { id: 'comparison', title: '产品定位对比', description: '对比职镜与其他简历工具的设计侧重' },
] as const

function MethodDetails({ section }: { section: (typeof lessonSections)[number]['id'] }) {
  switch (section) {
    case 'interviews':
      return (
        <ul className="divide-y divide-ink-700/65">
          {INTERVIEW_ROWS.map((row) => (
            <li key={row.code} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <div>
                <span className="mr-2 font-mono text-xs text-brand-300">{row.code}</span>
                <span className="font-medium">{row.person}</span>
                <p className="mt-1 text-sm text-fg-muted">{row.profile} · {row.target}</p>
              </div>
              <div className="text-sm leading-relaxed">
                <p className="text-fg-muted">{row.finding}</p>
                <p className="mt-1 text-brand-300">对应模块：{row.module}</p>
              </div>
            </li>
          ))}
        </ul>
      )
    case 'principles':
      return (
        <ul className="divide-y divide-ink-700/65">
          {PRINCIPLES.map((item) => (
            <li key={item.no} className="py-4">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.desc}</p>
              <blockquote className="mt-3 border-l-2 border-brand-500/45 pl-3 text-sm leading-relaxed text-fg-muted">
                「{item.quote}」<span className="ml-2 text-xs text-fg-dim">— {item.who}</span>
              </blockquote>
            </li>
          ))}
        </ul>
      )
    case 'gates':
      return (
        <ul className="grid gap-4 py-4 sm:grid-cols-3">
          {GATES.map((gate) => (
            <li key={gate.no} className="rounded-lg bg-ink-900/60 p-4">
              <h3 className="font-semibold">{gate.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{gate.desc}</p>
            </li>
          ))}
        </ul>
      )
    case 'weights':
      return (
        <>
          <ul className="divide-y divide-ink-700/65">
            {WEIGHTS.map((weight) => (
              <li key={weight.dim} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-5">
                <div className="flex items-baseline gap-2 font-medium">
                  {weight.dim}<span className="font-mono text-sm text-brand-300">{weight.w}%</span>
                </div>
                <div className="text-sm leading-relaxed text-fg-muted">{weight.q}<br />输出字段：{weight.field}</div>
              </li>
            ))}
          </ul>
          <p className="py-3 text-sm leading-relaxed text-fg-muted">
            权重来自初步访谈编码，待更多复核样本校准。分数用于定位缺口和安排修改顺序。
          </p>
        </>
      )
    case 'comparison':
      return (
        <>
          <div className="overflow-x-auto py-3">
            <table className="w-full min-w-[37rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-600">
                  <th scope="col" className="p-3 text-left">能力项</th>
                  {COMPARISON.cols.map((column) => (
                    <th key={column} scope="col" className="p-3 text-center font-medium">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((row) => (
                  <tr key={row.label} className="border-b border-ink-700/65 last:border-0">
                    <th scope="row" className="p-3 text-left font-medium text-fg-muted">{row.label}</th>
                    {row.v.map((value, index) => (
                      <td key={COMPARISON.cols[index]} className={`p-3 text-center ${index === row.v.length - 1 ? 'bg-brand-500/10 text-brand-300' : 'text-fg-muted'}`}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pb-3 text-sm leading-relaxed text-fg-muted">表格依据公开功能与产品定位整理，供参赛展示参考。</p>
        </>
      )
  }
}

export function Method() {
  return (
    <Shell className="py-12 sm:py-16">
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-sm font-medium text-brand-300">访谈方法论</p>
        <h1 className="text-[2rem] font-semibold leading-tight sm:text-[2.75rem]">职镜的设计依据</h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          团队整理了 5 份匿名求职访谈，从中提炼出岗位对照、反问补细节和事实核验规则。
        </p>
      </header>

      <div className="space-y-3">
        {lessonSections.map((section) => (
          <details key={section.id} className="jl-disclosure panel overflow-hidden rounded-xl">
            <summary className="gap-4 px-5 py-4 hover:bg-ink-800/40 sm:px-6">
              <span className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
                <span className="text-base font-semibold">{section.title}</span>
                <span className="text-sm text-fg-muted">{section.description}</span>
              </span>
            </summary>
            <div className="border-t border-ink-700/75 px-5 py-1 sm:px-6">
              <MethodDetails section={section.id} />
            </div>
          </details>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-ink-700/70 pt-6">
        <p className="max-w-xl text-sm leading-relaxed text-fg-muted">
          当前为前端原型，报告使用预设案例，含用于演示的假设岗位。AI 分析链路与事实校验器仍在开发。
        </p>
        <Button onClick={() => navigate('/app')}>体验示例</Button>
      </div>
    </Shell>
  )
}
