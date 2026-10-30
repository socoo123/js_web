# 本地构建、文章同步与 GitHub Pages

已上线：仓库 [socoo123/js_web](https://github.com/socoo123/js_web)，项目网站 [Java → JavaScript 学习站](https://socoo123.github.io/js_web/)。Astro 的 `site`、`base`、静态输出与结尾斜杠已在 [配置](../astro.config.mjs) 中指定。Pages 使用 GitHub Actions 发布 `dist/`。

## 本地准备

网站工程使用 **Node 24.22.0 + npm 11.19.1**，版本见 `.node-version` 和 `package.json`。先安装该版本的 [官方 Node](https://nodejs.org/en/download)，或用你已有的版本管理器切换；不要把课程的 C01 历史验证环境当成网站构建版本。

工作目录为仓库根目录：

```sh
node --version
npm --version
npm ci
npm ci --prefix labs/inventory
npm ci --prefix examples/inventory/04-react
npm run setup:diagrams
npm run check
npm run build
npm run preview
```

前两个命令应分别显示 `v24.22.0` 与 `11.19.1`。预览使用终端给出的地址，并带上 `/js_web/` 子路径。开发时运行 `npm run dev`；正式验收使用生产预览，因为 Pagefind 搜索索引在构建后才生成。

C32 等旧 Node 示例仍复用阶段 4 安装的 TanStack Query，因此不能删去该安装。学习工作区与旧阶段 4 的锁均独立于网站根锁；各自在对应目录安装，不能用其他副本的根 `node_modules` 软链代替 `npm ci`。

根目录只有 npm 的 `package-lock.json`。没有使用 React island 的当前页面只需 Astro/Starlight；未来真正加入交互示例时再核查并安装 React 集成。

## 构建流程

- `npm run setup:diagrams`：按当前 macOS/Linux 的架构下载固定 D2 和中文字体，核对 SHA-256，保存在被忽略的 `.cache/tools/`。首次准备需要网络；生成图本身可离线。
- `npm run sync:roadmap`：从 `docs/CURRICULUM.md` 的 48 课大纲与现有文章生成路线页；已有文章显示链接，其余显示「待发布」。
- `npm run check`：Astro 内容与类型检查。
- `npm run build`：生成当前学习包并核对冻结源码 → Lab/受控片段契约 → Java 对照 → 课程 lint 与固定输出 → F1 数据 → 路线/D2 → Astro/Pagefind → 生产 HTML/资产、全部发行版的包 SHA 与源码清单。任一步失败都会停止。已冻结发行版从 `labs/releases/` 原样复制，不能在原版号下改写源码或历史包。
- `npm run test:lab-walkthrough`：C00→C20 连续自动组装、C03/C23/C41 主错误红绿；`test:lab-react`：C21–C36 实际快照；`test:lab-ui5`：C37–C44 实际快照及严格静态资源；`test:lab-delivery`：C44→C48 交付链。它们独立于根 build，不再次打包。先在 `labs/inventory` 执行 `npx playwright install chromium`（Linux CI 用 `--with-deps`）。自动组装不等于独立读者验收，后者仍按 PLAN §6 执行。
- `npm run test:progress:browser`：生产预览运行后检查进度标记、导入导出、损坏恢复、存储受限、跨标签与禁用 JS 阅读，准备方式见根 README。默认端口 8751，可通过 `PROGRESS_BASE_URL` 指定地址。

如果更新 D2 版本或字体，先核查官方来源，再同时更新下载摘要、固定版本与许可信息，不能仅改版本号。

### 命令责任与执行次数

同一源码和环境执行一次 `npm run check` 与一次 `npm run build`，再按改动执行必要行为检查。`build` 已包含 `build:labs`、`test:labs`、`test:comparisons`、`lint:lessons`、`examples`、`test:progress` 与 `check:build`，不要在同一批前后全量再跑。只改一课时可先运行其固定输出或单课检查；修改后重跑不是重复执行。

CI 中四个 `test:lab-*` 行为检查仍各执行一次。旧阶段 4 的 `lint`、`test`、`build` 检查的是另一份仍被引用的源码，不与当前 Lab 等价，继续保留。全站视觉/F1 浏览器、线上下载与主 agent 的独立教学验收不在根 build 内。

### 冻结和恢复

当前发行版由 `labs/catalog.json` 指定；C 阶段目标为 `2026.10-v2.5`、C00–C48。正文和验证接通后才将相应课标为 implemented/migrated，不能用空步骤凑齐快照。五个阶段起点沿用同一格式的 C00/C10/C20/C36/C44，不新增另一套阶段包。

发布前核对 `public/downloads/inventory/<release>/manifest.json` 的逐包 SHA、tar/JSON 两种格式与源码清单，再由主 agent 把实际发布包冻结到 `labs/releases/<release>/`。后续构建核对冻结包本身，当前版还要和实际参考源码一致；`check:build` 再核对 **dist 中全部发行版**，防止历史下载漏复制或被改写。

学习者恢复在工作区执行 `npm run lab -- restore C44 ../inventory-delivery`。目标必须不存在或为普通空目录；非空目录、普通文件和符号链接均拒绝。整个包的发行版/压缩 SHA/源码清单先验证，再暂存并原子移入目标。现有工作区和坏任务记录原文不改。`compare Cnn` 只读，不套用补丁；暂停记录保存在自己的 `notes/next.md`。

## 每次生成文章后的同步

用户已授权自动提交和推送，完整约定在 [AGENTS.md](../AGENTS.md)，门禁定义在 [PLAN §6](PLAN.md)。每阶段按 PLAN §7 同时启动 4 个指定模型子 agent，主 agent 等四路及返修全部结束，集成验收并负责发布：

1. 每课运行相应固定输出、Lab/错误行为检查；发布批次运行 `npm run check`、`npm run build`（内含 `lint:lessons`）及本批必要浏览器检查。同一源码/环境不重复执行 build 已包含的全量检查。验证明细写进 `examples/cNN/README.md` 并链接阶段记录。
2. 主 agent 等待全部子任务完成并独立验收；准备阶段记录，STATUS 在发布核验后更新现有课程行、实际状态与下一步。路线页由构建自动同步。
3. 审阅 Git 差异，只提交本次的文章、配套示例、图和相关网站改动；不提交缓存、凭据或用户无关的工作。
4. 检查远端，再正常提交并推送到 `origin/main`，例如 `docs: publish C06 functions and closures lesson`。不强制推送。
5. 等对应提交的 Actions 完成，确认课程/Lab/下载线上入口与资源正常、下载校验值一致；失败修复或明确报告阻塞。记录更新若触发再次部署，也等待该次完成。
6. 全套视觉验收（宽度、亮暗模式、搜索、禁用 JS）按 PLAN §6 每周做一次。

这是执行者的项目约定。仅编辑并保存一个文件不会自行创建 Git 提交；提交并推送到 `main` 后，Pages 工作流会自动部署。用户当次要求「仅本地草稿」或「暂不发布」时遵循该要求。

每阶段成功后，主 agent 按 PLAN §8 输出全新窗口可复制的接续段落；失败仍接续同阶段，C 成功后结束改版。

## Pages 自动部署

[工作流](../.github/workflows/deploy.yml) 在 `main` 推送或手动触发时运行：固定 Node/JDK → 安装网站、工作区、旧阶段 4 锁定依赖及 Chromium → 检查旧阶段 4 → 准备 D2/字体 → Astro 检查 → 一次全量构建/冻结包/产物检查 → 四个学习链行为检查 → 上传静态输出 → Pages 发布。任一门禁失败都不会上传发布；部署任务通过 `needs: build` 等待构建成功。

GitHub 仓库的 Settings → Pages → Source 需要选择 **GitHub Actions**。工作流的构建任务只有读取内容与 Pages 配置的权限，部署任务取得 `pages: write` 和 `id-token: write`；不需要额外的网站部署密钥。

维护时检查 [Actions](https://github.com/socoo123/js_web/actions)、[Pages 设置](https://github.com/socoo123/js_web/settings/pages) 和实际 URL。首页可访问后，还应检查课程深层地址、D2 图、样式/脚本和中文搜索，不能仅凭推送成功就声称部署成功。

官方依据：2026-10-29 核查 [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci)、[Node 文件系统](https://nodejs.org/docs/latest-v24.x/api/fs.html)、[GitHub 自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Astro 部署 GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)。Starlight 原有配置参考 [手动配置](https://starlight.astro.build/manual-setup/) 与 [搜索](https://starlight.astro.build/guides/site-search/)；实际验证与线上状态见 [STATUS](STATUS.md)。
