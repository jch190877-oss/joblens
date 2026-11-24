/**
 * HR 访谈衍生数据
 *
 * 来源：企业 HR 访谈 2 份（HR01 外籍人员子女学校招聘 · HR02 教培/多行业招聘）
 * 说明：两位受访者的 Q20–Q24（A/B 简历对比、AI 参与看法、AI 评价维度、三条建议）
 *      均未作答，因此本文件中的结论只来自 Q1–Q19，且只覆盖教育行业。
 */

/** 经历结构：不同经历类型的加权占比 */
export interface ExpMix {
  kind: 'intern' | 'project' | 'contest' | 'campus'
  label: string
  count: number
  /** HR01 口径下的相对权重：实习 1.0 / 项目 0.8 / 竞赛 0.6 / 校园活动 0.4 */
  weight: number
  note: string
}

export type PlatformVerdict = 'platform' | 'personal' | 'mixed'

/** 「平台还是你的」检查 —— 依据 HR02：「知名企业实习最大的坑，就是把平台当成个人能力」 */
export interface PlatformCheck {
  id: string
  claim: string
  verdict: PlatformVerdict
  ask: string
  note: string
}

export type CheckStatus = 'pass' | 'warn' | 'fail'

/** 投递前自检 —— 依据 HR02：「最影响的是不写联系方式，或者联系方式无效」 */
export interface PreflightCheck {
  id: string
  label: string
  status: CheckStatus
  detail: string
  /** presentation 计入「表达与结构」维度；content 只作提示，不计分 */
  kind?: 'presentation' | 'content'
}

export interface HrProfile {
  expMix: ExpMix[]
  platform: PlatformCheck[]
  checks: PreflightCheck[]
  /** 这一份简历在 HR 口径下的整体判断 */
  verdict: string
}

const VERDICT_META: Record<PlatformVerdict, { label: string; cls: string }> = {
  platform: { label: '平台加成', cls: 'text-bad ring-bad/30 bg-bad/10' },
  personal: { label: '个人成果', cls: 'text-ok ring-ok/30 bg-ok/10' },
  mixed: { label: '团队混合', cls: 'text-warn ring-warn/30 bg-warn/10' },
}

export { VERDICT_META }

export const CHECK_META: Record<CheckStatus, { label: string; cls: string; dot: string }> = {
  pass: { label: '通过', cls: 'text-ok', dot: 'bg-ok' },
  warn: { label: '注意', cls: 'text-warn', dot: 'bg-warn' },
  fail: { label: '必须补', cls: 'text-bad', dot: 'bg-bad' },
}

/* ================================================================
   案例 A · 李同学 · 产品运营实习生
   ================================================================ */

const A: HrProfile = {
  verdict:
    '两段实习都在市场 / 内容方向，属于「上手快」的那类候选人。真正拉低分数的是写法：两条主线都是「参与 / 协助」，HR 拿不到你的个人贡献。',
  expMix: [
    { kind: 'intern', label: '实习经历', count: 2, weight: 1, note: '车企市场顾问 · 互联网市场部' },
    { kind: 'project', label: '项目经历', count: 0, weight: 0.8, note: '无' },
    { kind: 'contest', label: '竞赛获奖', count: 0, weight: 0.6, note: '无' },
    { kind: 'campus', label: '校园经历', count: 2, weight: 0.4, note: '学生会宣传部 · 校级三等奖学金' },
  ],
  platform: [
    {
      id: 'a-p1',
      claim: '参与社交媒体内容运营，撰写图文',
      verdict: 'mixed',
      ask: '这些内容是你独立选题、独立写完的，还是团队分工你只负责其中一段？',
      note: '混合。若能确认选题与成稿都由你主导，可以按「个人」写；否则按团队成果写反而更可信——HR 见过太多把团队产出写成一己之力的简历。',
    },
    {
      id: 'a-p2',
      claim: '到店客户留资率维持在 80%–90%，个人完成约 50% 的客户转化',
      verdict: 'personal',
      ask: '这个留资率是门店的整体数据，还是你个人接待的那部分？',
      note: '个人。这是你在一线拿到的数字，可以放心前置——HR01 明确说过，能让候选人「上手更快」的正是这类可核验的一线证据。',
    },
  ],
  checks: [
    {
      id: 'a-c1',
      label: '联系方式',
      status: 'fail',
      detail: '简历文本里没有任何邮箱或手机号。HR02 原话：「最影响的是不写联系方式，或者联系方式无效。」导出前必须补上。',
    },
    {
      id: 'a-c2',
      label: '篇幅',
      status: 'pass',
      detail: '一页，7 条要点，控制在单页内。符合 HR01 的「控制篇幅、拒绝冗余」。',
    },
    {
      id: 'a-c3',
      label: '投递版本',
      status: 'warn',
      detail: '同一份内容计划投递市场、运营、销售三个方向。HR01 建议「按需定制，不同岗位使用差异化版本」。',
    },
    {
      id: 'a-c4',
      label: '正文与技能栏一致性',
      status: 'pass',
      detail: '技能栏写的剪辑、Office 在正文中有对应使用场景。',
    },
  ],
}

/* ================================================================
   案例 B · 陈同学 · IT 审计实习生
   ================================================================ */

const B: HrProfile = {
  verdict:
    '实习 / 项目 / 竞赛三类齐全，结构最健康。问题是每一类都只有一行，HR 读不出深度——按 HR02 的说法，这不叫「经历丰富」，叫「都碰过」。',
  expMix: [
    { kind: 'intern', label: '实习经历', count: 1, weight: 1, note: '数据挖掘实习（爬虫）' },
    { kind: 'project', label: '项目经历', count: 1, weight: 0.8, note: '非遗饮品品牌 IP 化' },
    { kind: 'contest', label: '竞赛获奖', count: 1, weight: 0.6, note: 'IT 审计商赛（晋级线下答辩）' },
    { kind: 'campus', label: '校园经历', count: 0, weight: 0.4, note: '无' },
  ],
  platform: [
    {
      id: 'b-p1',
      claim: '会编写一些程序，通过程序获取客户的联系方式',
      verdict: 'personal',
      ask: '这个脚本是你独立写的，还是基于现成开源项目改的？',
      note: '个人。技术动作真实，问题只是没写清工具、规模和稳定性——补细节即可，不需要拔高。',
    },
    {
      id: 'b-p2',
      claim: '3 人跨学院组队参加 IT 审计商赛，负责技术方案设计',
      verdict: 'mixed',
      ask: '方案里的技术部分是你一个人做的，还是三人分模块？哪一块是你写的？',
      note: '混合。商赛成果三人共有，必须拆出你负责的模块，否则 HR 会整体按「参与」折算——这正是 HR02 说的「把平台当成个人能力」。',
    },
  ],
  checks: [
    {
      id: 'b-c1',
      label: '联系方式',
      status: 'fail',
      detail: '简历文本里没有任何邮箱或手机号。这是 HR 反馈里最高频的淘汰原因，导出前必须补上。',
    },
    {
      id: 'b-c2',
      label: '篇幅',
      status: 'pass',
      detail: '一页，6 条要点。',
    },
    {
      id: 'b-c3',
      label: '正文与技能栏一致性',
      status: 'warn',
      detail: '技能栏列了 Python / Java / MySQL，但正文从未出现过这些词。HR 会认为技能是「贴上去的」。',
    },
    {
      id: 'b-c4',
      label: '投递版本',
      status: 'pass',
      detail: '目标单一（IT 审计），不需要拆多版本。',
    },
  ],
}

/* ================================================================
   案例 C · 冯同学 · 教培英语教师
   ================================================================ */

const C: HrProfile = {
  verdict:
    '只有一段实习，而且是学校统一分配的。按 HR01 的排序，实习是最优先的类型，这段该被放到最前面；但它现在写成「参与 / 辅助」，把唯一的高价值经历写成了背景板。',
  expMix: [
    { kind: 'intern', label: '实习经历', count: 1, weight: 1, note: '中学英语教学实习' },
    { kind: 'project', label: '项目经历', count: 0, weight: 0.8, note: '无' },
    { kind: 'contest', label: '竞赛获奖', count: 0, weight: 0.6, note: '无（课程论文不计入）' },
    { kind: 'campus', label: '校园经历', count: 3, weight: 0.4, note: '学生会 · 奖学金 · 课程论文' },
  ],
  platform: [
    {
      id: 'c-p1',
      claim: '独立完成 2 次课堂试讲',
      verdict: 'personal',
      ask: '备课是你独立完成的，还是用了教研组现成的教案？',
      note: '个人。教培 HR 最关心的就是「能不能独立撑住一节课」，这条应该前置，而不是排在听课之后。',
    },
    {
      id: 'c-p2',
      claim: '参与英语课堂听课与辅助教学',
      verdict: 'platform',
      ask: '听课和辅助教学能说明什么？换一个实习生来写，会不会完全一样？',
      note: '平台。这类表述任何人都能写，不构成个人证据。建议删除或并入试讲条目——HR02 的说法是「把平台当成个人能力」。',
    },
  ],
  checks: [
    {
      id: 'c-c1',
      label: '联系方式',
      status: 'fail',
      detail: '简历文本里没有任何邮箱或手机号。HR02 原话：「最影响的是不写联系方式，或者联系方式无效。」',
    },
    {
      id: 'c-c2',
      label: '篇幅',
      status: 'pass',
      detail: '一页，信息量适中。',
    },
    {
      id: 'c-c3',
      label: '岗位核心能力覆盖',
      status: 'fail',
      kind: 'content',
      detail: 'JD 第 3 条「与家长沟通」在简历中完全没有对应内容。教培岗位的续费率几乎完全取决于家长沟通，这条不能空着。',
    },
    {
      id: 'c-c4',
      label: '投递版本',
      status: 'pass',
      detail: '目标单一（教培英语教师），证书与专业都对口。',
    },
  ],
}

export const HR_BY_CASE: Record<string, HrProfile> = { a: A, b: B, c: C }
