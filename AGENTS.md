# AGENTS.md

> 给在此仓库工作的 AI 编码代理（Codex / Claude Code / Cursor 等）阅读。
> 人类协作者也建议先看一遍。

---

## 项目

**职镜 JobLens** —— 面向大学生求职场景的 AI 简历竞争力分析与优化平台（前端 Demo）。

- 仓库：<https://github.com/jch190877-oss/joblens>
- 线上：<https://jch190877-oss.github.io/joblens/>
- 产品说明：[`docs/PRODUCT.md`](docs/PRODUCT.md)
- 部署与协作：[`docs/部署与协作指南.md`](docs/部署与协作指南.md)

---

## 技术栈与约定

- Vite 6 + React 18 + TypeScript + Tailwind CSS 4
- 路由是**手写哈希路由**：`src/lib/router.ts`，路径形如 `#/app`、`#/report`、`#/deepdive`、`#/rewrite`、`#/method`
- 构建用 `base: './'`，产物可放在任意子路径下
- **演示内容集中在 `src/data/demo.ts`** —— 改案例、JD、评分、改写建议基本只动这一个文件
- 页面在 `src/views/`，通用组件在 `src/components/`，设计令牌在 `src/index.css` 的 `@theme`
- 图标是手写 SVG（`src/components/icons.tsx`），**不引入图标库**
- 除 React 外没有其他运行时依赖（无路由库、无 UI 库）

## 常用命令

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # 产出 dist/
pnpm preview      # 本地预览构建产物（node scripts/serve.mjs）
```

> 不要直接双击 `dist/index.html`：`file://` 下 ES module 会被 CORS 拦截，页面白屏。

---

## 硬性规则

1. **只在现有项目内修改。** 不要新建项目、不要新建仓库、不要 `npm init`、不要重排目录结构。
2. **不要改** `.github/workflows/deploy.yml`、`package.json` 的 `scripts`、`vite.config.ts` 的 `base`。
3. **不要删除** `docs/` 与 `docs/screenshots/` 下的任何文件。
4. **新增依赖前先停下来说明理由**和替代方案，不要直接安装。
5. 提交信息用 `feat:` / `fix:` / `docs:` / `style:` 前缀，一次提交只做一件事。
6. **不要 force push**，不要 `git push --force`。

---

## 发布流程（最重要）

线上是 GitHub Pages。**只有推送到 `main` 才会更新线上。**

```
改文件 → 提交 → push 到 main → Actions 自动构建（约 1 分钟）→ 线上更新
```

只是改文件、或只推到 `feat/` 分支，**线上不会变**。

### 改完自检

1. `pnpm build` 必须通过（含 `tsc`）
2. 用 `pnpm dev` 打开对应页面确认一眼

### 发布命令

```bash
git fetch origin
git rebase origin/main
pnpm build                    # 必须通过才继续
git push origin HEAD:main
```

- 构建不通过、或 rebase 有冲突 → **停下来说明情况，不要强推**
- 构建失败时 Actions 会失败，GitHub Pages **保留上一次成功的版本**，线上不会挂
- 推送后约 1 分钟线上生效

### 如果只想让人先看一眼

```bash
git push -u origin feat/xxx
```

然后由人在 GitHub 上点 **Merge pull request**。

---

## 回滚

稳定版标签：`v0.1-demo`

```bash
# 只看不换
git checkout v0.1-demo

# 线上恢复（会覆盖历史，确认没人正在基于 main 开发再用）
git reset --hard v0.1-demo
git push --force origin main
```

---

## 内容红线

- 演示案例已**匿名化**：统一用 `S01`–`S05` 代号 + `李同学 / 陈同学 / 冯同学`
- **不要**在代码、注释、提交信息、文档里写受访者真实姓名、学校、公司
- **不要**用「提升录用率 XX%」「保证拿到面试」这类无法验证的表述
- 分数只用于定位问题，不用于预测录用结果

---

## 页面速查

| 路由 | 文件 | 作用 |
| --- | --- | --- |
| `#/` | `src/views/Landing.tsx` | 首页：一份正在被修改的简历 + 定位 + 痛点 + 对比 |
| `#/upload` | `src/views/Upload.tsx` | 多模态输入：文件 / 截图 / 粘贴 → 解析 → 6 项体检 |
| `#/analyze` | `src/views/Analyze.tsx` | 自定义对照：自己的简历 + 自己的 JD → 规则版四态判定 |
| `#/app` | `src/views/Workbench.tsx` | 分析工作台（三步向导，预设案例） |
| `#/report` | `src/views/Report.tsx` | 对照报告：可复算总分 + 诊断维度 + 四态判定 |
| `#/deepdive` | `src/views/Deepdive.tsx` | 反问式深挖（核心交互） |
| `#/resume` | `src/views/Resume.tsx` | 简历页：采纳后原文实时改变，可导出投递版 |
| `#/rewrite` | `src/views/Rewrite.tsx` | 改写工作台（与 /resume 有重叠，较早期） |
| `#/practice` | `src/views/Practice.tsx` | 单条证据练习 |
| `#/method` | `src/views/Method.tsx` | 方法论：7 位受访者、HR 视角、分歧、评分口径 |

**演示捷径**：

```
?sample=1#/upload     预填示例简历
?demo=1#/analyze      预填简历 + JD 并跑出对照结果
?fill=1#/deepdive     预填深挖答案，直接看到证据卡完成态
```

---

## 交接

**完整交接文档见 [`HANDOFF.md`](HANDOFF.md)** —— 包含所有地址、路由、数据模型、环境坑、已知问题、演示动线。

接手前必读，其中「证据边界」一节尤其重要：**不能声称的结论**都列在那里。

---

## 证据边界（写文案时不得违反）

- 访谈共 **7 份**：5 位学生（S01–S05）+ 2 位 HR（HR01–HR02）
- 两位 HR 均来自**教育行业**，不能外推
- 两位 HR 的 **Q20–Q24（AI 相关）全部未作答**，产品中关于 AI 的判断属于推断
- 尚未做与 HR 判断的一致性检验（kappa）

