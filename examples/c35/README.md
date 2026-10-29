# C35 React UT、集成测试与 E2E 地图 · 示例

正文：[C35](../../src/content/docs/05-react/c35-react-testing.mdx)。主线在自己的工作区新增测试，不维护第二份业务源码。

## Lab 入口

- 目标发行版 `2026.10-v2.3`：C34 → C35。
- 新文件：`tests/react/support.jsx` / `inventory.test.jsx`、`tests/e2e/inventory.spec.js`。
- 在工作区 `npm run lab -- start C35`、`npm run lab -- check C35`。
- RTL：`node node_modules/vitest/vitest.mjs run --config tools/behavior.config.mjs`。
- 严格生产冒烟：`node node_modules/@playwright/test/cli.js test --config tools/playwright.config.mjs`；配套工具构建当前文件、以无 fallback 服务器提供 `/js_web/demos/inventory/`。
- 专用服务/测试缓存与产物进入 `.lab`，不会清空真实浏览器数据；已有依赖链接只读，不运行 npm ci/install。

## 保留的独立参考

| 文件 | 命令 | 内容 |
| --- | --- | --- |
| boundary.js | `node boundary.js` | 历史转换边界 |
| async-order.js | `node async-order.js` | Promise 拒绝顺序 |
| fixture.js | `node fixture.js` | 历史 reducer 的新增场景 |

根目录 `npm run examples -- c35` 核对固定输出。旧阶段 4 的 testing-forms / testing-async 保留为历史参考，不冒充本次 Lab 测试。

## 本次真实接续验证

- 2026-10-29 · macOS arm64 · Node 24.22.0 / React 19.3.1 / Vitest 5.0.5 / Playwright 1.64.1 / Chromium 156.0.8078.4；沿用已装依赖，首次 Chromium 下载命令未运行。
- 从哈希一致的真实 C32 连续接至 C35，`node tools/check.mjs C35` 通过：85 条核心断言、Effect/计时 4 条、Query 6 条、Action 4 条、报表 2 条、RTL 4 条、9 组隔离浏览器场景、生产 E2E 1 条和 Hooks lint。同步 C28 表单用例由异步契约替代。
- 参考解 RTL 4 条包含正文必做 3 条（空白与 0、创建、详情重试），以及正文明确选做的失败草稿重试 1 条；没有把选做用例当作必做缺失。
- 创建测试先等待真实初始查询；详情错误断言限定在“商品详情”区，保留上游独立操作提示。每例独立真实仓库、App 与 Query，不 mock 校验函数。
- 严格生产 E2E 1/1：未知路径 404；P004 筛选→hash 详情→刷新→返回保留条件，无 pageerror。仅本地产物检查，不表示应用已在线部署。
- `node delivery/red-green-agent-4.mjs real final-real`：空白先变“0”的真实源码变异红 1→恢复绿 0；见 `final-real-C35-blank-{red,green}.log`。
- `node delivery/red-green-agent-4.mjs real final-real-extra C35-retry`：真实详情“重试”改空回调后红 1→恢复 `detail.refetch()` 绿 0；见 `final-real-extra-C35-retry-{red,green}.log`。
- `node delivery/assemble-from-prose-agent-4.mjs`：正文 3 条必做 RTL 与 E2E 组装后 `start C35` / `check C35` 通过；作者自审，不是独立读者验收。
- 根目录 `npm run examples -- c35` 3/3；临时 catalog 副本 48 课 lint 零 error/warning，正式 registry 未改。最终证据在 `delivery/evidence/`，阶段记录由主 agent 写 `labs/records/A.md`。
- 主集成16快照、独立抽验范围与全站发布验收见 [阶段 A](../../labs/records/A.md)。未执行：首次 Chromium 下载、Firefox/Safari/Windows/屏幕阅读器；真实后端不在范围。

## 历史夹具与发布

早期临时 C32 的 `fixture-*` / `revision-*` 不算正式接续；现以 `final-*` 真实链为准，历史保留在 `delivery/history-agent-4.md`。

第一版 [Pages 39108651570](https://github.com/socoo123/js_web/actions/runs/39108651570) 的 171 条回归属于旧源码。未将旧通过数挪作本次证据。
