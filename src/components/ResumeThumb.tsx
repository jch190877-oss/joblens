import type { Rewrite } from '../data/demo'

/**
 * 简历缩略图：报告页顶部的「原文档案」。
 * 把简历本身作为报告的第一眼主体，而不是只给一堆评分条。
 * 有改写建议的行标黄，一眼看出「问题在哪几行」。
 */
export function ResumeThumb({
  resume,
  rewrites,
  maxLines = 18,
}: {
  resume: string
  rewrites: Rewrite[]
  maxLines?: number
}) {
  const all = resume.split('\n')
  const total = all.filter((l) => l.trim()).length
  const lines = all.filter((l) => l.trim()).slice(0, maxLines)

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg border border-ink-600 bg-white shadow-[0_1px_2px_rgba(23,36,58,0.06),0_10px_24px_-14px_rgba(23,36,58,0.4)]">
        <div className="h-[3px] w-full bg-gradient-to-r from-brand-500 to-brand-500/30" />
        <div className="space-y-[3px] px-2.5 py-2.5">
          {lines.map((line, i) => {
            const t = line.trim()
            const hit = rewrites.some((r) => t.includes(r.before))
            const isSection = t.startsWith('【')
            const isName = i === 0
            return (
              <div
                key={i}
                className={`truncate rounded-[2px] px-0.5 text-[6.5px] leading-[1.5] ${
                  hit
                    ? 'bg-warn/25 text-fg'
                    : isName
                      ? 'font-semibold text-fg'
                      : isSection
                        ? 'font-medium text-fg-muted'
                        : 'text-fg-dim'
                }`}
              >
                {t}
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between border-t border-ink-700 px-2.5 py-1">
          <span className="font-mono text-[6px] text-fg-dim">共 {total} 行</span>
          <span className="font-mono text-[6px] text-warn">
            {rewrites.length} 处标记
          </span>
        </div>
      </div>
    </div>
  )
}
