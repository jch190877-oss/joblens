# 交接文档 · 职镜 JobLens

> **给接手这个项目的 AI / 开发者：先读这一份，再动手。**
> 这是一份纯前端产品原型，已经有 12 个版本、一条完整的自动化发布链路。
> 最后更新：2026-11-28 ｜ 版本 `v0.12-multimodal`

---

## 0. 五分钟速览

| | |
| --- | --- |
| **是什么** | 面向大学生求职的 **AI 简历优化平台** 前端原型（纯静态，无后端） |
| **一句话** | 把目标岗位的要求逐条拆开，把真实做过的事一条条对上；对不上的不猜，来问你 |
| **线上** | <https://jch190877-oss.github.io/joblens/> |
| **仓库** | <https://github.com/jch190877-oss/joblens> |
| **本地** | `C:\Users\弘ORIZON\Desktop\小挑\joblens` |
| **技术栈** | Vite 6 + React 18 + TypeScript + Tailwind CSS 4 |
| **发布** | push 到 `main` → GitHub Actions 自动构建部署（约 1 分钟） |
| **当前分支** | `main` @ `271f5eb` |

**三个演示捷径**（重要，答辩时直接用）：

```
https://jch190877-oss.github.io/joblens/?sample=1#/upload     预填示例简历
https://jch190877-oss.github.io/joblens/?demo=1#/analyze      预填简历+JD 并跑出对照
https://jch190877-oss.github.io/joblens/?fill=1#/deepdive     预填深挖答案，看到证据卡完成态
```

---

## 1. 这个产品解决什么问题

**学生侧三个痛点**（来自 5 位已拿到优质实习 / 大厂 offer 的同学访谈）：

1. 不知道哪些经历该留、哪些该删 → 全都放上去，反而埋掉最相关的
2. 写出来永远是「参与 / 协助 / 负责」→ 停在动作层
3. 用 AI 改完，不敢确认哪句是真的 → 只能全信或全弃

**招聘者侧三条补充**（来自 2 位企业 HR 访谈）：

1. 初筛先看硬性条件，通过后再比相关实习
2. 决策函数是「上手快、降低培养成本」，不是「你优秀」
3. **「知名企业实习最大的坑，就是把平台当成个人能力」**

**产品立场**：不替你编经历，只把真实的讲清楚。所以交互的第一动作是**追问事实**，不是生成文字。

---

## 2. 页面与路由

| 路由 | 文件 | 职责 |
| --- | --- | --- |
| `/` | `views/Landing.tsx` | 首屏：一份正在被修改的简历 + 定位 + 痛点 + 对比 |
| `/upload` | `views/Upload.tsx` | **多模态输入**：文件 / 截图 / 粘贴 → 解析 → 6 项体检 |
| `/analyze` | `views/Analyze.tsx` | **自定义对照**：自己的简历 + 自己贴的 JD → 规则版四态判定 |
| `/app` | `views/Workbench.tsx` | 预设案例工作台（三步向导） |
| `/report` | `views/Report.tsx` | 预设案例的对照报告（核心页） |
| `/deepdive` | `views/Deepdive.tsx` | 反问式深挖：AI 追问，答完拼出证据 |
| `/resume` | `views/Resume.tsx` | **简历页**：采纳建议后简历那一行实时改变，可导出 |
| `/rewrite` | `views/Rewrite.tsx` | 改写工作台（较早期页面，与 `/resume` 有重叠） |
| `/practice` | `views/Practice.tsx` | 单条证据练习（Codex 新增） |
| `/practice/example` | 同上 | 单条练习的示例状态 |
| `/method` | `views/Method.tsx` | 方法论：7 位受访者、HR 视角、分歧、评分口径、边界 |

**三条数据链路**（能力强度不同，是刻意分级的）：

| 入口 | 能力 | 证据强度 |
| --- | --- | --- |
| `/upload` | 真解析 + 确定性体检 | 强（规则确定） |
| `/analyze` | 规则匹配四态判定 | 中（会错，需核对） |
| `/app` → `/report` → `/deepdive` → `/resume` | 完整链路 | 强（requirements 人工写过） |

---

## 3. 快速开始

```bash
cd "C:\Users\弘ORIZON\Desktop\小挑\joblens"

pnpm install          # 或 npm install
pnpm dev              # http://localhost:5173
pnpm build            # 产出 dist/
pnpm preview          # 本地预览构建产物（node scripts/serve.mjs）
```

> ⚠️ **不要双击 `dist/index.html`**：`file://` 下 ES module 会被 CORS 拦截，页面白屏。必须走 http。

---

## 4. 目录结构（关键文件）

```
src/
├─ App.tsx                    路由分发（switch on hash route）
├─ main.tsx                   入口
├─ index.css                  ★ 设计令牌（@theme）+ 全局样式，改配色只改这里
├─ fonts.css                  自托管 Noto 子集（拉丁/中文分片）
├─ vite-env.d.ts              ?url 导入与 mammoth 的类型声明
│
├─ data/
│  ├─ demo.ts                 ★ 预设的 3 个案例 + 评分函数 scoreOf + HR 权重/结论/分歧 + 访谈表
│  └─ hr.ts                   ★ HR 访谈衍生的：经历结构 / 平台检查 / 投递前自检
│
├─ lib/
│  ├─ router.ts               手写哈希路由 + 导航项
│  ├─ store.ts                当前案例（useSyncExternalStore + localStorage）
│  ├─ scoring.ts              五个诊断维度由判定实时计算
│  ├─ parseResume.ts          ★ PDF / DOCX / 文本 / 图片 OCR 解析
│  ├─ resumeCheck.ts          6 项确定性体检（正则+词表，不调模型）
│  └─ customAnalyze.ts        ★ JD 拆条 + 简历切块 + 概念匹配（规则版）
│
├─ components/
│  ├─ Layout.tsx              导航 + 页脚 + 噪点层
│  ├─ ui.tsx                  Button / Tag / StatusPill / ScoreDial / Meter / SectionHead
│  ├─ icons.tsx               全部手写 SVG，不引图标库
│  ├─ Reveal.tsx              IntersectionObserver 滚动进场
│  ├─ ResumePaper.tsx         首屏的「简历纸」（改动就地发生）
│  └─ ResumeThumb.tsx         报告页的简历缩略图（有建议的行标黄）
│
└─ views/                     11 个页面，见第 2 节

public/
├─ tessdata/                  ★ OCR 语言包（chi_sim 1.65MB + eng 1.89MB，fast 版）
└─ samples/resume-photo.png   示例简历照片（900×1200，供 OCR 演示）

docs/
├─ 产品说明.md                ★ 给评委看的完整产品说明（约 5000 字）
├─ PRODUCT.md                 早期版本产品说明
├─ 命名释义.md                为什么叫「职镜 JobLens」
├─ 部署与协作指南.md          链接选型、GitHub 协作、现场兜底
└─ ahp/                       AHP 权重标定工具（问卷.html + ahp.py + README）
```

---

## 5. 数据与模型（改产品逻辑前必读）

### 5.1 总分怎么算

```ts
// src/data/demo.ts → scoreOf(case)
总分 = Σ(归一化权重_i × 达成度_i)
达成度：满足 1.0 · 部分满足 0.5 · 待核实 0.2 · 不满足 0
硬性条件不满足 → 门槛优先，总分封顶 40
```

- 每个案例的要求权重**已归一化到 100**
- 报告页可展开「总分怎么算出来的」，逐行列出权重 / 判定 / 达成度 / 得分
- **不要把这个分数改回手写值**——它曾经是硬编码的，是最大的方法学漏洞

### 5.2 五个诊断维度（`src/lib/scoring.ts`）

| 维度 | 计算来源 |
| --- | --- |
| 门槛达成 | 硬性条件组内加权达成度 |
| 相关经历 | 核心职责组内加权达成度 |
| 加分储备 | 加分项组内加权达成度 |
| 表达与结构 | 投递前检查扣分（必须补 −20 / 注意 −8） |
| 可信度 | 改写事实标记扣分（已拦截 −12 / 待补数字 −6） |

维度是**分组视图**，不参与总分合成——两者口径不同，界面上有标注。

### 5.3 自定义对照的匹配算法（`src/lib/customAnalyze.ts`）

规则版，**没有语义理解**：

1. `parseJD`：按行与编号切条，过滤岗位名称行与`【岗位职责】`类标题，按关键词归为硬性/核心/加分，权重 30/50/20 组内均分
2. `parseResumeBullets`：按`【模块】`与项目符号切块
3. 匹配：**16 类概念词典**（学历/语言/工具/内容/数据/协作/教学/销售…）命中率为主，二元组余弦兜底
4. 阈值：≥0.6 → 满足（有量化）或部分满足；≥0.3 → 待核实；否则不满足

> 已知局限：概念粒度粗，会把「负责官方账号运营」错配到「协助店长运营门店」（都命中「运营」）。页面上已标注「规则匹配 · 非语义理解」，并要求核对证据原句。

### 5.4 两条数据来源要分清

| 文件 | 来源 | 性质 |
| --- | --- | --- |
| `data/demo.ts` | 5 份学生访谈（S01–S05）编码 | 案例的经历、JD、requirements 是**人工编写**的演示数据；分数由规则算出 |
| `data/hr.ts` | 2 份 HR 访谈（HR01–HR02） | 经历结构权重、平台检查、投递前检查的**依据来自原话** |

---

## 6. 设计系统

- **配色**：`src/index.css` 的 `@theme` 块。当前是**白底浅色主题**（`--color-ink-950: #ffffff`），主色 `--color-brand-500: #2d56c2`，四态色 `ok/warn/bad/info` 都是深色版本
- **字体**：正文 `JobLens Text`（Noto Sans SC 子集，自托管分 4 片）；标题 `JobLens Display`（衬线，`var(--font-editorial)`）
- **图标**：全部手写 SVG 在 `components/icons.tsx`，**不要引图标库**
- **组件约定**：`panel` = 渐变面 + 顶部内高光 + 双层阴影；`Reveal` = 滚动进场
- **衬线只用于 hero 与页标题**，面板内部一律无衬线——混用会像报纸排版穿帮

---

## 7. 版本线与回滚

| 标签 | 内容 |
| --- | --- |
| `v0.1-demo` | 初版 6 页 |
| `v0.2-typography` | 字体与文字层级（Codex） |
| `v0.3-texture` | 材质/光效/数据可视化/分享图 |
| `v0.4-hero` | 首屏动态演示 + 滚动进场 |
| `v0.5-hr` | 依据 HR 访谈重构评估模型 |
| `v0.6-score` | 总分改为可复算加权模型 |
| `v0.7-dims` | 维度由判定实时计算 + AHP 工具 |
| `v0.8-resume-first` | 首屏改为「一份正在被修改的简历」 |
| `v0.9-resume-page` | 新增简历页 + 报告页简历档案 |
| `v0.10-upload` | 上传 PDF/Word/文本/图片 + 本地体检 |
| `v0.11-analyze` | 自定义简历 + 自定义 JD 的规则版对照 |
| `v0.12-multimodal` | 三入口多模态上传 + OCR 语言包本地化 |

**回滚**：

```bash
cd "C:\Users\弘ORIZON\Desktop\小挑\joblens"
git reset --hard v0.11-analyze
git push --force origin main
```

---

## 8. 已知问题 / 待办（诚实清单）

### 8.1 逻辑问题（建议优先修）

- **采纳状态没有全局共享**：`/resume` 与 `/rewrite` 各自用 `useState` 存「已采纳」，两处不一致，导出结果可能不同。应提到 `lib/store.ts`。
- `/rewrite` 与 `/resume` 功能重叠，后者是超集。可以考虑把 `/rewrite` 收掉或改成只读对照。

### 8.2 能力缺口

- **没有真实模型调用**：AI 分析链路（JD 拆解、反问生成、事实校验器）全部是预置或规则，没有后端
- 自定义对照**只给判定，不给改写建议**——改写需要真正的改写器
- 简历文件解析没有做版面还原（只提文本，多栏简历会串行）
- OCR 对项目符号「·」识别不稳，常认成引号

### 8.3 内容缺口

- 预设案例的 requirements、evidence 是人工写的，正式版需要 HR 复核
- AHP 权重**未实际采集**（工具在 `docs/ahp/`，问卷 5 分钟可填，但没人填）

---

## 9. 证据边界（不能声称的事）

这是比赛材料，**下面几条一旦说错会被当场追问穿**：

1. 访谈共 **7 份**：5 位学生（S01–S05）+ 2 位 HR（HR01–HR02）。不是 10 份。
2. 两位 HR **都来自教育行业**（外籍人员子女学校、教培），不能外推到全行业。
3. 两份 HR 记录是**记录整理稿**，非逐字转录。
4. 两位 HR 的 **Q20–Q24（A/B 简历对比、AI 参与看法、AI 评价维度、三条建议）全部未作答**——所以产品里关于 AI 价值的判断是**我们的推断**，不是 HR 的结论。
5. 尚未做与 HR 判断的一致性检验（kappa），不能说「系统判定已通过专家验证」。
6. 商业计划书里若写「不少于 10 名 HR 访谈」，与实际 2 名**不一致，必须改**。

产品页（`/method`）与技术文档都按上面如实标注了，改文案时不要把这些限定删掉。

---

## 10. 环境坑（踩过的，别再踩）

| 坑 | 现象 | 处理 |
| --- | --- | --- |
| **git 不走系统代理** | push 超时、无限重试（曾试 8–10 次才成功） | 已给本仓库配 `git config --local http.proxy http://127.0.0.1:7897`（Clash 端口）。若代理关闭需 unset |
| **PowerShell 写中文会乱码** | 用 `Get-Content`/`Set-Content` 改含中文的文件后出现「锟斤拷」 | 一律用编辑器工具写文件，或 `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` |
| **pnpm 11 配置位置变了** | `package.json` 的 `pnpm` 字段被忽略；`IGNORED_BUILDS` 报错退出 1 | 设置写在 `pnpm-workspace.yaml`；`allowBuilds` 里 `esbuild: true`、`tesseract.js: false` |
| **tesseract 运行时会解压语言包** | 项目根目录冒出 `chi_sim.traineddata`（6MB）被误提交 | 已加进 `.gitignore` 的 `*.traineddata`；不要 `git add -A` 前不检查 |
| **headless Chrome 最小宽度 500px** | 390px 截图右侧被裁，误以为布局溢出 | 移动端验证用 ≥500px，或真机 |
| **`git add -A` 会把临时截图带进仓库** | 截图目录里混进 `_*.png` 之类 | 提交前 `git status` 看一眼 |

---

## 11. 交接约定

### 改东西之前

1. `git pull` 拿最新（远端可能被其他人/其他 AI 推过）
2. 从标签或 `main` 开分支：`git checkout -b feat/xxx v0.12-multimodal`
3. 改完 `pnpm build` 必须通过（含 `tsc`）

### 发布

```bash
git fetch origin && git rebase origin/main
pnpm build                 # 必须通过
git push origin HEAD:main  # 推送后约 1 分钟自动上线
```

- **不要 force push 到 main**
- 构建失败时 Actions 会失败，GitHub Pages 保留上一次成功的版本，线上不会挂
- 大改之前打个标签，方便回滚

### 不要动的东西

- `.github/workflows/deploy.yml`（部署配置）
- `vite.config.ts` 的 `base: './'`（改了 GitHub Pages 子路径就废）
- `package.json` 的 scripts

---

## 12. 90 秒演示动线

| 时间 | 动作 | 说什么 |
| --- | --- | --- |
| 0:00 | 打开首页 | 「大学生求职最难的其实不是写不好，是不知道自己做了什么值得写。」 |
| 0:15 | 指首屏那份简历 | 「你看，这不是一份报告，是一份正在被改的简历——原句划掉，新句在这儿。」 |
| 0:30 | 点「上传简历，先体检」 | 「文件、截图、文本三种都行，全在本地解析，不上传服务器。」 |
| 0:50 | 点「用示例截图试 OCR」 | 「这是真在识别一张照片，语言包随站点打包，断网也能用。」 |
| 1:05 | 点「用这份简历做岗位对照」→ 贴 JD → 开始对照 | 「每条要求都给出判定和简历里的可能依据。」 |
| 1:20 | 切到 `/report` 展开「总分怎么算出来的」 | 「分数不是黑箱，每一分都能逐行核对。」 |
| 1:40 | 切到 `/resume`，点一条采纳 | 「采纳之后，左边那一行立即变成改写后的文字。」 |

---

## 13. 相关文档

- [产品说明](docs/产品说明.md) —— 给评委看的完整版
- [命名释义](docs/命名释义.md) —— 为什么叫「职镜」
- [部署与协作指南](docs/部署与协作指南.md) —— 链接选型、GitHub 协作、现场兜底
- [AHP 工具](docs/ahp/README.md) —— 权重标定（未采集）

---

**交接人备注**：这个项目的技术含量不在代码，在**证据链**——每一条判定都能指回原话、每一个权重都能说出依据、每一处局限都写明了。改功能时守住这一点，比多加十个页面重要。
