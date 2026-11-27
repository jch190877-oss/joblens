/**
 * 简历基础体检：纯规则，不依赖模型，对任何一份简历文本都能立刻给出结果。
 *
 * 这是「上传自己的简历」唯一诚实的即时反馈——不需要 JD、不需要 AI，
 * 只做能确定判断的事。完整的岗位对照分析仍需 JD 与规则引擎（待接入）。
 */

export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface BasicCheck {
  id: string
  label: string
  status: CheckStatus
  detail: string
  /** 命中的具体证据，便于用户核对 */
  evidence?: string
}

const WEAK_VERBS = ['参与', '协助', '配合', '负责', '帮助', '支持', '跟进', '完成']
const STRONG_SIGNALS = ['独立', '主导', '牵头', '设计', '搭建', '推动', '落地', '优化', '重写']

const MODULES = [
  { key: '教育', words: ['教育', '学历', '院校', 'GPA', '毕业'] },
  { key: '实习/工作', words: ['实习', '工作经历', '任职', '在职'] },
  { key: '项目', words: ['项目', '课题', '作品'] },
  { key: '技能/证书', words: ['技能', '证书', '语言', '雅思', '六级', '专八'] },
]

function bullets(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[·•▪◦\-*—]/.test(l))
    .map((l) => l.replace(/^[·•▪◦\-*—]\s*/, ''))
}

export function checkResume(raw: string): BasicCheck[] {
  const text = raw.trim()
  const lines = text.split('\n').filter((l) => l.trim())
  const chars = text.replace(/\s/g, '').length
  const bs = bullets(text)
  const out: BasicCheck[] = []

  /* 1. 联系方式 */
  const phone = /1[3-9]\d{9}/.test(text) || /\+?\d[\d\s-]{8,}\d/.test(text)
  const mail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text)
  if (phone && mail) {
    out.push({ id: 'contact', label: '联系方式', status: 'pass', detail: '手机号与邮箱都能识别到。' })
  } else if (phone || mail) {
    out.push({
      id: 'contact',
      label: '联系方式',
      status: 'warn',
      detail: `只找到${phone ? '手机号' : '邮箱'}。HR 反馈里「不写联系方式或联系方式无效」是最常见的淘汰原因，建议两项都写。`,
    })
  } else {
    out.push({
      id: 'contact',
      label: '联系方式',
      status: 'fail',
      detail: '没有识别到手机号或邮箱。这是最容易被直接淘汰的一项，导出前必须补上。',
    })
  }

  /* 2. 篇幅 */
  if (chars < 300) {
    out.push({
      id: 'length',
      label: '篇幅',
      status: 'warn',
      detail: `正文约 ${chars} 字，偏短——可能信息不足，也可能解析不完整。`,
    })
  } else if (chars > 2600) {
    out.push({
      id: 'length',
      label: '篇幅',
      status: 'warn',
      detail: `正文约 ${chars} 字、${lines.length} 行，超过单页常规容量（HR01：「删繁就简，控制篇幅」）。`,
    })
  } else {
    out.push({
      id: 'length',
      label: '篇幅',
      status: 'pass',
      detail: `正文约 ${chars} 字、${lines.length} 行，在单页常规范围内。`,
    })
  }

  /* 3. 量化 */
  const numbers =
    text.match(
      /\d+(\.\d+)?\s*(%|％|篇|条|人|次|万|元|块|小时|课时|天|个月|年|个|家|所|份|名|项|场|单|篇|倍|周|月)/g,
    ) ?? []
  if (numbers.length >= 3) {
    out.push({
      id: 'numbers',
      label: '量化信息',
      status: 'pass',
      detail: `识别到 ${numbers.length} 处带单位的数字。`,
      evidence: numbers.slice(0, 5).join(' · '),
    })
  } else if (numbers.length > 0) {
    out.push({
      id: 'numbers',
      label: '量化信息',
      status: 'warn',
      detail: `只有 ${numbers.length} 处带单位的数字。结果类信息通常需要规模、对象或反馈中的至少一项。`,
      evidence: numbers.join(' · '),
    })
  } else {
    out.push({
      id: 'numbers',
      label: '量化信息',
      status: 'fail',
      detail: '没有识别到任何带单位的数字。全文都是「做了什么」，没有「做到什么程度」。',
    })
  }

  /* 4. 动词层级 */
  const weak = bs.filter((b) => WEAK_VERBS.some((v) => b.startsWith(v)))
  const strong = bs.filter((b) => STRONG_SIGNALS.some((v) => b.includes(v)))
  if (bs.length === 0) {
    out.push({
      id: 'verbs',
      label: '动词层级',
      status: 'warn',
      detail: '没识别到简历项目符号（·、- 等），无法判断每条经历的起手动词。',
    })
  } else if (weak.length > bs.length / 2) {
    out.push({
      id: 'verbs',
      label: '动词层级',
      status: 'warn',
      detail: `${bs.length} 条要点里有 ${weak.length} 条以「${WEAK_VERBS.filter((v) => weak.some((b) => b.startsWith(v))).join('、')}」开头。这类词说明不了个人贡献，HR 会按团队成果折算。`,
      evidence: weak.slice(0, 3).join(' ／ '),
    })
  } else if (strong.length >= 2) {
    out.push({
      id: 'verbs',
      label: '动词层级',
      status: 'pass',
      detail: `有 ${strong.length} 条出现了「独立 / 主导 / 搭建」这类强动作词。`,
    })
  } else {
    out.push({
      id: 'verbs',
      label: '动词层级',
      status: 'pass',
      detail: '起手动词没有大面积偏向弱动词。',
    })
  }

  /* 5. 结构完整性 */
  const found = MODULES.filter((m) => m.words.some((w) => text.includes(w))).map((m) => m.key)
  const missing = MODULES.filter((m) => !found.includes(m.key)).map((m) => m.key)
  if (missing.length === 0) {
    out.push({
      id: 'structure',
      label: '结构模块',
      status: 'pass',
      detail: '教育、实习/工作、项目、技能四类模块都能识别到。',
    })
  } else {
    out.push({
      id: 'structure',
      label: '结构模块',
      status: missing.length >= 2 ? 'warn' : 'warn',
      detail: `缺少可识别的模块：${missing.join('、')}。若原文确实没有，可以考虑补；若原文有，说明排版让机器读不出来。`,
    })
  }

  /* 6. 时间信息 */
  const span =
    text.match(/20\d{2}\s*[.\-/年]\s*\d{1,2}/g) ??
    text.match(/20\d{2}\s*[-–~]\s*20\d{2}/g) ??
    []
  if (span.length >= 2) {
    out.push({
      id: 'time',
      label: '时间线',
      status: 'pass',
      detail: `识别到 ${span.length} 处时间标记。`,
    })
  } else if (span.length === 1) {
    out.push({
      id: 'time',
      label: '时间线',
      status: 'warn',
      detail: '只识别到 1 处时间标记，每段经历最好都写明起止时间。',
    })
  } else {
    out.push({
      id: 'time',
      label: '时间线',
      status: 'warn',
      detail: '没有识别到「2025.07」这类时间标记，HR 无法判断经历的先后与长短。',
    })
  }

  return out
}

export function summarize(checks: BasicCheck[]) {
  const fail = checks.filter((c) => c.status === 'fail').length
  const warn = checks.filter((c) => c.status === 'warn').length
  const pass = checks.filter((c) => c.status === 'pass').length
  return { fail, warn, pass, total: checks.length }
}
