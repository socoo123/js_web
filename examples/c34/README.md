# C34 性能、加载与错误诊断 · 示例

正文：[C34](../../src/content/docs/05-react/c34-performance-loading-errors.mdx)。主线从自己的 C33 继续。

## Lab 入口

- 目标发行版 `2026.10-v2.3`：C33 → C34；新增 ReportPanel / ReportErrorBoundary，App 接 Profiler 与 lazy。
- 工作区：`npm run lab -- start C34`、沿用 dev、`npm run lab -- check C34`。
- 专用检查：`node node_modules/vitest/vitest.mjs run --config tools/performance.config.mjs`；浏览器检查读取当前 App / ReportPanel，不导入教师答案。
- 正式阶段记录由主 agent 写 `labs/records/A.md`；最终真实链证据见 `delivery/agent-4.md` / `delivery/evidence/`，不进入学习包。

## 保留的独立参考

| 文件 | 命令 | 内容 |
| --- | --- | --- |
| identity.js | `node identity.js` | 数组 / 函数 / 对象身份 |
| transition-order.js | `node transition-order.js` | 真实 startTransition 同步调用顺序 |
| report.js | `node report.js` | 历史分类汇总与固定值 |
| prediction.js | `node prediction.js` | props 身份预测 |

根目录 `npm run examples -- c34` 自动核对。旧 1200 行放大实验保留在阶段 4 的 `labs/performance.html`，不作为当前六商品实测。

## 本次真实接续验证

- 2026-10-29 · macOS arm64 · Node 24.22.0 / React 19.3.1 / Vitest 5.0.5 / Playwright 1.64.1 / Chromium 156.0.8078.4；沿用已装依赖。
- 起点为哈希核对一致的真实 C32→C33；真实 C34 的 `node tools/check.mjs C34` 通过：85 条核心断言、Effect/计时 4 条、Query 6 条、Action 4 条、报表 2 条、9 组隔离浏览器场景及 Hooks lint。同步 C28 表单用例由异步 Action 契约替代。
- 浏览器读取当前 App/ReportPanel；首次展开前模块请求 0 次、展开后 1 次；P002+1 后外设 13 件 / 491700 分，局部故障后列表可用并能恢复。
- 实际 `<Profiler>` onRender 已采集六商品筛选/补货/报表提交，本次 C34 日志约 1.0–4.7ms；仅为本机开发观察，不设阈值或借用旧 1200 行收益。见 `final-C34-check.log`。
- `node delivery/red-green-agent-4.mjs real final-real`：空依赖缓存真实 products 的分类统计回归红 1，恢复直接计算绿 0；见 `final-real-C34-stale-memo-{red,green}.log`。
- `node delivery/assemble-from-prose-agent-4.mjs`：公开围栏组装后 `start C34` / `check C34` 通过，包含 App 导入、可选仓库透传、lazy/边界的明确位置；只是作者自审。
- 根目录 `npm run examples -- c34` 4/4；正文 `Object.is(first, second)` 原围栏另行执行输出 false。见 `final-c34-examples.log` / `final-C34-inline-identity.json`。
- 临时 catalog 副本的 48 课 lint 零 error/warning；未修改正式 registry。四课旧 H2 目标全部保留。
- 主集成16快照、独立抽验范围与全站发布验收见 [阶段 A](../../labs/records/A.md)。未执行：React DevTools 手动 Profiler/Flamegraph/Ranked、Components/Sources 手动取证、生产专用 profiling、Compiler、Firefox/Safari/Windows/屏幕阅读器。

## 历史夹具与发布

早期 `fixture-*` / `revision-*` 仅为历史契约夹具证据，现以 `final-*` 的真实链为准；历史见 `delivery/history-agent-4.md`。

第一版 [Pages 39101734918](https://github.com/socoo123/js_web/actions/runs/39101734918) 的 163 条回归和放大实验属于旧源码证据。本次只复用正确机制，不继承其通过声明。
