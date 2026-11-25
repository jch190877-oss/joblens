import { STATUS_SCORE, type Case, type Dimension, type ReqType } from '../data/demo'
import type { HrProfile } from '../data/hr'

/**
 * 诊断维度：全部由已有数据算出，不再手写分数。
 *
 * - 门槛达成 / 相关经历 / 加分储备：按要求类型分组，组内加权平均达成度
 * - 表达与结构：来自投递前检查（必须补 −20 / 注意 −8）
 * - 待核对事实：由改写页单独统计，不给求职者扣分
 *
 * 注意：这四个维度是「分组视图」，不是总分的分解项——
 * 总分是按每条要求的权重逐条加权，维度是按类型分组后各自平均，口径不同。
 */

function groupOf(c: Case, type: ReqType) {
  const rs = c.requirements.filter((r) => r.type === type)
  const weight = rs.reduce((s, r) => s + r.weight, 0)
  const gained = rs.reduce((s, r) => s + r.weight * (STATUS_SCORE[r.status] ?? 0), 0)
  return {
    n: rs.length,
    weight,
    score: weight ? (gained / weight) * 100 : 0,
    met: rs.filter((r) => r.status === 'met').length,
  }
}

export function dimsOf(c: Case, hr?: HrProfile): Dimension[] {
  const gate = groupOf(c, 'hard')
  const core = groupOf(c, 'core')
  const bonus = groupOf(c, 'plus')

  const pres = (hr?.checks ?? []).filter((x) => (x.kind ?? 'presentation') === 'presentation')
  const fail = pres.filter((x) => x.status === 'fail').length
  const warn = pres.filter((x) => x.status === 'warn').length
  const format = Math.max(0, 100 - 20 * fail - 8 * warn)

  return [
    {
      key: 'gate',
      label: '门槛达成',
      score: Math.round(gate.score),
      basis: gate.n
        ? `硬性条件 ${gate.n} 条，满足 ${gate.met} 条 · 门槛优先于加权`
        : '本岗位未列出硬性条件',
    },
    {
      key: 'core',
      label: '相关经历',
      score: Math.round(core.score),
      basis: `核心职责 ${core.n} 条，组内加权达成 ${Math.round(core.score)}%`,
    },
    {
      key: 'bonus',
      label: '加分储备',
      score: Math.round(bonus.score),
      basis: bonus.n
        ? `加分项 ${bonus.n} 条，达成 ${Math.round(bonus.score)}%`
        : '本岗位未列出加分项',
    },
    {
      key: 'format',
      label: '表达与结构',
      score: format,
      basis: `投递前检查：${fail} 项必须补、${warn} 项注意（每项扣 20 / 8 分）`,
    },
  ]
}
