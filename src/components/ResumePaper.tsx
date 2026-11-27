import { Check, ChevronRight, Sparkle } from './icons'

/**
 * 首屏的「简历纸」：让第一眼看到的是**一份正在被修改的简历**，
 * 而不是一张岗位对照表。
 *
 * 设计意图：
 * - A4 竖版、白纸、细阴影 —— 先建立"这是一份文档"的直觉
 * - 改动就地发生：原句划掉、新句高亮、右侧批注 —— 而不是另开一个评分面板
 * - 系统信息（匹配度、采纳计数）靠边，不抢主体
 */

type Item =
  | { kind: 'edit'; before: string; after: string; tag: string }
  | { kind: 'ask'; text: string; ask: string }

interface Role {
  company: string
  period: string
  items: Item[]
}

const ROLES: Role[] = [
  {
    company: '某互联网公司 · 市场部实习生',
    period: '2025.07–09',
    items: [
      {
        kind: 'edit',
        before: '参与社交媒体内容运营，撰写图文',
        after: '独立负责 B 端内容账号，3 个月产出 24 篇',
        tag: '补方法',
      },
      {
        kind: 'ask',
        text: '协助整理竞品资料',
        ask: '整理给谁看？最后得出了什么结论？',
      },
    ],
  },
  {
    company: '某新能源车企 · 市场顾问实习生',
    period: '2026.03–06',
    items: [
      {
        kind: 'edit',
        before: '协助店长运营门店，参与日常事务',
        after: '独立完成讲车与试驾邀约，留资率 80%–90%',
        tag: '补结果',
      },
    ],
  },
]

export function ResumePaper() {
  return (
    <div className="relative">
      {/* 纸后方的柔光，避免白纸贴死在白底上 */}
      <div className="pointer-events-none absolute -inset-8 rounded-[28px] bg-gradient-to-br from-brand-500/10 via-transparent to-brand-500/5 blur-2xl" />

      {/* 顶部：目标岗位与匹配度 */}
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-950/70 px-2.5 py-1 text-[11px] text-fg-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          目标岗位 · 产品运营实习生
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2.5 py-1 text-[11px] font-medium text-warn">
          匹配 69 · 3 处待改
        </span>
      </div>

      {/* 纸张 */}
      <div className="relative overflow-hidden rounded-xl border border-ink-600 bg-white shadow-[0_2px_4px_rgba(23,36,58,0.06),0_24px_60px_-24px_rgba(23,36,58,0.28)]">
        <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500/40" />

        <div className="px-6 pb-5 pt-5 sm:px-7">
          {/* 抬头 */}
          <div className="flex items-end justify-between gap-4 border-b border-ink-700 pb-3">
            <div>
              <div
                className="text-[22px] leading-none text-fg"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                李同学
              </div>
              <div className="mt-1.5 text-[11.5px] text-fg-muted">市场营销 · 2021 级 · 大四</div>
            </div>
            <div className="text-right text-[11px] leading-relaxed text-fg-dim">
              求职意向
              <br />
              <span className="text-fg-muted">产品运营实习生</span>
            </div>
          </div>

          {/* 经历 */}
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wide text-fg-muted">实习经历</span>
              <span className="h-px flex-1 bg-ink-700" />
            </div>

            <div className="space-y-3.5">
              {ROLES.map((role) => (
                <div key={role.company}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[12.5px] font-medium text-fg">{role.company}</span>
                    <span className="shrink-0 font-mono text-[10px] text-fg-dim">{role.period}</span>
                  </div>

                  <ul className="space-y-1.5">
                    {role.items.map((item, i) =>
                      item.kind === 'edit' ? (
                        <li
                          key={i}
                          className="relative rounded-md bg-ok/[0.045] px-2.5 py-1.5 ring-1 ring-inset ring-ok/15"
                        >
                          <div className="flex items-start gap-1.5 pr-14">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-500" />
                            <span className="text-[11.5px] leading-[1.6] text-fg-dim line-through decoration-bad/60 decoration-[1.5px]">
                              {item.before}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-start gap-1.5">
                            <ChevronRight className="mt-[3px] h-3 w-3 shrink-0 text-ok" />
                            <span className="text-[11.5px] font-medium leading-[1.6] text-fg">
                              {item.after}
                            </span>
                          </div>
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-ok/12 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-ok ring-1 ring-ok/25">
                            {item.tag}
                          </span>
                        </li>
                      ) : (
                        <li
                          key={i}
                          className="rounded-md border border-dashed border-warn/40 bg-warn/[0.04] px-2.5 py-1.5"
                        >
                          <div className="flex items-start gap-1.5">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-warn/70" />
                            <span className="text-[11.5px] leading-[1.6] text-fg-muted">
                              {item.text}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-start gap-1.5">
                            <Sparkle className="mt-[3px] h-3 w-3 shrink-0 text-warn" />
                            <span className="text-[11px] leading-[1.6] text-warn">{item.ask}</span>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 页脚 */}
          <div className="mt-4 flex items-center justify-between border-t border-ink-700 pt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-fg-dim">
              <Check className="h-3 w-3 text-ok" />
              每一条改动都指向简历原文
            </span>
            <span className="font-mono text-[10px] text-fg-dim">2 / 3 已采纳</span>
          </div>
        </div>
      </div>

      {/* 纸外浮标：AI 追问 */}
      <div className="relative ml-4 mt-3 flex items-start gap-2 rounded-lg border border-brand-500/25 bg-brand-500/[0.06] px-3 py-2 backdrop-blur">
        <Sparkle className="mt-0.5 h-3 w-3 shrink-0 text-brand-500" />
        <p className="text-[11.5px] leading-[1.6] text-fg-muted">
          <span className="font-medium text-brand-600">AI：</span>
          「协助整理竞品资料」——整理给谁看？最后得出了什么结论？
        </p>
      </div>
    </div>
  )
}
