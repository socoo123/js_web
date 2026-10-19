# 本地构建、文章同步与 GitHub Pages

已上线：仓库 [socoo123/js_web](https://github.com/socoo123/js_web)，项目网站 [Java → JavaScript 学习站](https://socoo123.github.io/js_web/)。Astro 的 `site`、`base`、静态输出与结尾斜杠已在 [配置](../astro.config.mjs) 中指定。Pages 使用 GitHub Actions 发布 `dist/`。

## 本地准备

网站工程使用 **Node 24.22.0 + npm 11.19.1**，版本见 `.node-version` 和 `package.json`。先安装该版本的 [官方 Node](https://nodejs.org/en/download)，或用你已有的版本管理器切换；不要把课程的 C01 历史验证环境当成网站构建版本。

工作目录为仓库根目录：

```sh
node --version
npm --version
npm ci
npm ci --prefix examples/inventory/04-react
npm run setup:diagrams
npm run check
npm run build
npm run preview
```

前两个命令应分别显示 `v24.22.0` 与 `11.19.1`。预览使用终端给出的地址，并带上 `/js_web/` 子路径。开发时运行 `npm run dev`；正式验收使用生产预览，因为 Pagefind 搜索索引在构建后才生成。

C32 的 Node 示例复用阶段 4 安装的 TanStack Query，因此全量构建前也要安装该阶段的锁定依赖；Actions 会执行相同步骤。网站根锁与阶段 4 的独立锁分别使用。

根目录只有 npm 的 `package-lock.json`。没有使用 React island 的当前页面只需 Astro/Starlight；未来真正加入交互示例时再核查并安装 React 集成。

## 构建流程

- `npm run setup:diagrams`：按当前 macOS/Linux 的架构下载固定 D2 和中文字体，核对 SHA-256，保存在被忽略的 `.cache/tools/`。首次准备需要网络；生成图本身可离线。
- `npm run sync:roadmap`：从 `docs/CURRICULUM.md` 的 48 课大纲与现有文章生成路线页；已有文章显示链接，其余显示「待发布」。
- `npm run check`：Astro 内容与类型检查。
- `npm run build`：课程 lint 与全量固定输出示例 → 学习进度数据测试 → 同步目录 → 重建 D2 SVG → Astro 静态构建与 Pagefind 索引 → 检查 `/js_web/` 页面/资产链接、中文语言、课程折叠区、进度入口与四张速查侧栏。任一步失败都会停止。
- `npm run test:progress:browser`：生产预览运行后检查进度标记、导入导出、损坏恢复、存储受限、跨标签与禁用 JS 阅读，准备方式见根 README。默认端口 8751，可通过 `PROGRESS_BASE_URL` 指定地址。

如果更新 D2 版本或字体，先核查官方来源，再同时更新下载摘要、固定版本与许可信息，不能仅改版本号。

## 每次生成文章后的同步

用户已授权自动提交和推送，完整约定在 [AGENTS.md](../AGENTS.md)，门禁定义在 [PLAN §6](PLAN.md)。执行者每次完成文章后：

1. 运行 `npm run examples -- cNN`、`npm run lint:lessons`、`npm run check`、`npm run build`。构建也会自动检查全部课程与固定输出示例；验证细节写进 `examples/cNN/README.md`。
2. 在 `docs/STATUS.md` 的「已发布课程」加一行，更新「下一步」。路线页由构建自动同步。
3. 审阅 Git 差异，只提交本次的文章、配套示例、图和相关网站改动；不提交缓存、凭据或用户无关的工作。
4. 检查远端，再正常提交并推送到 `origin/main`，例如 `docs: publish C06 functions and closures lesson`。不强制推送。
5. 等对应的 Actions 完成，确认新文章线上地址返回 200；失败时继续修复，或如实报告具体的阻塞。
6. 全套视觉验收（宽度、亮暗模式、搜索、禁用 JS）按 PLAN §6 每周做一次。

这是执行者的项目约定。仅编辑并保存一个文件不会自行创建 Git 提交；提交并推送到 `main` 后，Pages 工作流会自动部署。用户当次要求「仅本地草稿」或「暂不发布」时遵循该要求。

## Pages 自动部署

[工作流](../.github/workflows/deploy.yml) 在 `main` 推送或手动触发时运行：固定 Node → 安装网站与阶段 4 锁定依赖 → 阶段 4 lint/测试/构建 → 准备 D2/字体 → 检查 → 构建与链接检查 → 上传静态输出 → Pages 发布。

GitHub 仓库的 Settings → Pages → Source 需要选择 **GitHub Actions**。工作流的构建任务只有读取内容与 Pages 配置的权限，部署任务取得 `pages: write` 和 `id-token: write`；不需要额外的网站部署密钥。

维护时检查 [Actions](https://github.com/socoo123/js_web/actions)、[Pages 设置](https://github.com/socoo123/js_web/settings/pages) 和实际 URL。首页可访问后，还应检查课程深层地址、D2 图、样式/脚本和中文搜索，不能仅凭推送成功就声称部署成功。

官方依据（2026-10-15 核查）：[Astro 部署 GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)、[GitHub 自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Starlight 手动配置](https://starlight.astro.build/manual-setup/)、[Starlight 搜索](https://starlight.astro.build/guides/site-search/)。实际验证与线上状态见 [STATUS](STATUS.md)。
