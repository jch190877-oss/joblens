/**
 * 自定义材料分析（规则版）
 *
 * 目标：让「自己的简历 + 自己的 JD」也能走到逐条对照，而不是只能看预设案例。
 *
 * 必须说清楚能力边界：这里**没有语义理解**，靠的是
 *   ① JD 按行/编号切条并按关键词归类（硬性 / 核心 / 加分）
 *   ② 简历按模块与项目符号切块
 *   ③ 中文字符二元组的重合度做粗匹配
 * 所以它擅长「关键词对得上就对得上」的硬性条件，也会漏掉语义相关但用词不同的情况。
 * 因此判定一律保留「待核实」，并把命中的原句摊开让人自己核对。
 */

export type ReqKind = 'hard' | 'core' | 'plus'
export type MatchStatus = 'met' | 'partial' | 'unverified' | 'missing'

export interface ParsedReq {
  id: string
  kind: ReqKind
  text: string
  weight: number
}

export interface MatchedReq extends ParsedReq {
  status: MatchStatus
  /** 命中的简历原句 */
  evidence?: string
  /** 粗糙的文本重合度，0–1，仅用于解释判定 */
  affinity: number
}

export interface CustomAnalysis {
  reqs: MatchedReq[]
  score: number
  hardFail: boolean
  stats: Record<MatchStatus, number>
  /** 完全没找到依据的要求 */
  gaps: string[]
  /** 简历里没被任何要求命中的条目（可能该删） */
  unused: string[]
}

const STATUS_SCORE: Record<MatchStatus, number> = {
  met: 1,
  partial: 0.5,
  unverified: 0.2,
  missing: 0,
}

/* ---------------------------------------------------------------- JD */

const HARD_RE =
  /(本科|硕士|博士|研究生|学历|专业要求|相关专业|证书|资格证|教师资格|年限|年以上|应届|在校|每周|到岗|全职|实习\s*\d|英语|雅思|托福|四六级|专八|CET|普通话|熟练使用)/
const PLUS_RE = /(优先|加分|更佳|者优先|有.{0,8}者优先|愿意学|有热情)/

/** 去掉行首的段落标题与编号：【岗位职责】、1.、(1)、一、· - 等 */
function stripBullet(line: string) {
  return line
    .replace(/^\s*[【\[（(]\s*[^】\]）)]{1,12}\s*[】\]）)]\s*/, '')
    .replace(
      /^\s*(?:[（(]?\d{1,2}[)）.、]|[①-⑳]|[一二三四五六七八九十]+[、.]|[-*·•▪◦—])\s*/,
      '',
    )
    .trim()
}

/** 段落标题 / 岗位名称行，不是要求 */
const HEADER_RE =
  /^(岗位职责|工作职责|任职要求|职位要求|任职资格|加分项|我们希望你|你将负责|岗位描述)[:：]?$/

/** JD 切条：先按行，再按分号/句号把一行里塞的多条拆开 */
export function parseJD(jd: string): ParsedReq[] {
  const raw: string[] = []
  const lines = jd.split('\n')
  let first = true

  for (const line of lines) {
    const t = stripBullet(line)
    if (!t) continue

    // 第一行多半是岗位名称（「产品运营实习生（内容生态方向）」），不是要求
    if (first) {
      first = false
      if (t.length <= 28 && !/[，,；;。]/.test(t)) continue
    }

    if (t.length > 24 && /[；;。]/.test(t)) {
      for (const p of t.split(/[；;。]/)) {
        const s = stripBullet(p)
        if (s.length >= 4) raw.push(s)
      }
    } else {
      raw.push(t)
    }
  }

  const items = raw.filter((t) => t.length >= 4 && !HEADER_RE.test(t))

  const grouped: Record<ReqKind, string[]> = { hard: [], core: [], plus: [] }
  for (const t of items) {
    if (PLUS_RE.test(t)) grouped.plus.push(t)
    else if (HARD_RE.test(t)) grouped.hard.push(t)
    else grouped.core.push(t)
  }

  // 权重：硬性合计 30、核心合计 50、加分合计 20，组内均分
  const budget: Record<ReqKind, number> = { hard: 30, core: 50, plus: 20 }
  const out: ParsedReq[] = []
  let n = 0
  for (const kind of ['hard', 'core', 'plus'] as ReqKind[]) {
    const list = grouped[kind]
    if (!list.length) continue
    const per = budget[kind] / list.length
    for (const text of list) {
      out.push({ id: `R${String(++n).padStart(2, '0')}`, kind, text, weight: per })
    }
  }
  return out
}

/* ---------------------------------------------------------------- 简历 */

export interface ResumeBullet {
  text: string
  section: string
}

/** 简历切块：记录每行落在哪个模块下，便于给证据加上下文 */
export function parseResumeBullets(resume: string): ResumeBullet[] {
  const out: ResumeBullet[] = []
  let section = ''
  for (const line of resume.split('\n')) {
    const t = line.trim()
    if (!t) continue
    const sec = t.match(/^[【\[](.+?)[】\]]/)
    if (sec) {
      section = sec[1]
      continue
    }
    // 纯模块名（教育背景 / 实习经历 / 项目经历 / 技能 等），无标点、较短
    if (t.length <= 10 && /^(教育|实习|工作|项目|科研|竞赛|校园|技能|证书|荣誉|自我评价)/.test(t)) {
      section = t
      continue
    }
    out.push({ text: stripBullet(t), section })
  }
  return out
}

/* ---------------------------------------------------------------- 匹配 */

const STOP = new Set(['的', '了', '和', '与', '及', '或', '在', '是', '有', '能', '会', '对', '为', '等', '中'])

/**
 * 概念词典：把「换了说法但指同一件事」的表述归到同一概念。
 *
 * 用整句二元组做匹配时，「本科及以上在读」对「2021 级本科」只能命中 1 个二元组，
 * 会被判成不满足——这是算法的问题，不是简历的问题。
 * 概念表让这类同义表述能被认出来。
 */
const CONCEPTS: { id: string; label: string; re: RegExp }[] = [
  { id: 'edu', label: '学历', re: /本科|硕士|博士|研究生|大专|在读|应届|毕业生|学历/ },
  { id: 'major', label: '专业', re: /专业|市场营销|软件工程|英语|财会|会计|计算机|信息管理/ },
  { id: 'lang', label: '语言', re: /英语|雅思|托福|四六级|CET|专八|口语|双语|普通话/ },
  { id: 'cert', label: '证书', re: /证书|资格证|教师资格|从业|认证/ },
  { id: 'toolDesign', label: '设计工具', re: /剪映|PS|Photoshop|Figma|Canva|设计|排版/ },
  { id: 'toolOffice', label: '办公工具', re: /Excel|PPT|Office|Word|表格|文档/ },
  { id: 'tech', label: '技术', re: /SQL|Python|Java|爬虫|脚本|编程|代码|数据库/ },
  { id: 'content', label: '内容', re: /内容|文案|图文|脚本|短视频|公众号|社交媒体|新媒体|小红书|抖音|B站|选题|写作/ },
  { id: 'account', label: '账号运营', re: /账号|运营|粉丝|涨粉|知名度|发布|推送/ },
  { id: 'data', label: '数据', re: /数据|复盘|分析|转化|留存|曝光|阅读|点击|ROI|GMV|指标/ },
  { id: 'user', label: '用户', re: /用户|客户|画像|需求|反馈|调研|问卷/ },
  { id: 'collab', label: '协作', re: /协作|沟通|对接|配合|跨部门|推进|跟进|协调/ },
  { id: 'project', label: '项目', re: /项目|策划|落地|统筹|排期|执行|活动/ },
  { id: 'teach', label: '教学', re: /教学|授课|教案|课堂|学生|试讲|备课|教研/ },
  { id: 'sales', label: '销售', re: /销售|转化|签单|成交|订单|拜访|客户接待/ },
  { id: 'scale', label: '规模', re: /人数|人次|规模|场次|条数|篇数|课时/ },
]

function conceptsOf(text: string): Set<string> {
  const out = new Set<string>()
  for (const c of CONCEPTS) if (c.re.test(text)) out.add(c.id)
  return out
}

function bigrams(s: string): Set<string> {
  const clean = s.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase()
  const set = new Set<string>()
  for (let i = 0; i < clean.length - 1; i++) {
    const g = clean.slice(i, i + 2)
    if (STOP.has(g[0]) || STOP.has(g[1])) continue
    set.add(g)
  }
  return set
}

/** 兼容打分的兜底：二元组余弦（对长句更宽容） */
function cosine(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let hit = 0
  for (const g of a) if (b.has(g)) hit++
  return hit / Math.sqrt(a.size * b.size)
}

const NUMBER_RE = /\d+(\.\d+)?\s*(%|％|篇|条|人|次|万|元|小时|课时|天|个月|年|个|家|所|份|名|项|场|倍|周|月)/

export function analyze(resume: string, jd: string): CustomAnalysis {
  const reqs = parseJD(jd)
  const bullets = parseResumeBullets(resume)
  const bulletConcepts = bullets.map((b) => conceptsOf(b.text))
  const bulletBigrams = bullets.map((b) => bigrams(b.text))

  const matched: MatchedReq[] = reqs.map((r) => {
    const rc = conceptsOf(r.text)
    const rb = bigrams(r.text)

    let best = { score: 0, index: -1 }

    bullets.forEach((b, i) => {
      let s: number
      if (rc.size > 0) {
        // 概念命中率为主：要求里出现的概念，被这条经历覆盖了多少
        let shared = 0
        for (const c of rc) if (bulletConcepts[i].has(c)) shared++
        s = shared / rc.size
      } else {
        s = cosine(rb, bulletBigrams[i])
      }
      // 概念全中时，用二元组余弦微调，避免同分
      if (rc.size > 0 && s > 0) s = s * 0.85 + cosine(rb, bulletBigrams[i]) * 0.15
      if (s > best.score) best = { score: s, index: i }
    })

    const ev = best.index >= 0 ? bullets[best.index].text : ''

    let status: MatchStatus
    if (best.score >= 0.6) {
      status = NUMBER_RE.test(ev) ? 'met' : 'partial'
    } else if (best.score >= 0.3) {
      status = 'unverified'
    } else {
      status = 'missing'
    }

    return {
      ...r,
      status,
      evidence: best.score >= 0.3 && ev.length >= 4 ? ev : undefined,
      affinity: Math.round(best.score * 100) / 100,
    }
  })

  const total = matched.reduce((s, r) => s + r.weight, 0) || 100
  const raw = matched.reduce((s, r) => s + (r.weight / total) * 100 * STATUS_SCORE[r.status], 0)
  const hardFail = matched.some((r) => r.kind === 'hard' && r.status === 'missing')
  const score = Math.round(hardFail ? Math.min(raw, 40) : raw)

  const stats: Record<MatchStatus, number> = { met: 0, partial: 0, unverified: 0, missing: 0 }
  matched.forEach((r) => (stats[r.status] += 1))

  // 简历里没被任何要求命中的条目
  const used = new Set(matched.map((r) => r.evidence).filter(Boolean) as string[])
  const unused = bullets
    .filter((b) => b.text.length >= 6 && !used.has(b.text))
    .map((b) => b.text)
    .slice(0, 6)

  return {
    reqs: matched,
    score,
    hardFail,
    stats,
    gaps: matched.filter((r) => r.status === 'missing').map((r) => r.text),
    unused,
  }
}

export const KIND_LABEL: Record<ReqKind, string> = {
  hard: '硬性条件',
  core: '核心职责',
  plus: '加分项',
}

export const STATUS_LABEL: Record<MatchStatus, string> = {
  met: '满足',
  partial: '部分满足',
  unverified: '待核实',
  missing: '不满足',
}
