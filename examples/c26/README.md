# C26 状态提升、保留与重置 · 示例

主线继续自己的 `inventory/`。正文：[C26](../../src/content/docs/05-react/c26-state-ownership-reset.mdx)。本轮目标发行版 **2026.10-v2.3**：前置 C25、完成 C26；参考增量 [steps/C26](../../labs/reference/steps/C26/) 只给独立编辑区加稳定 key。发行入口见 [Lab](https://socoo123.github.io/js_web/labs/)，主验收/发布证据位置为 `labs/records/A.md`。

## 运行

| 入口 | 工作目录与命令 | 用途 |
| --- | --- | --- |
| 当前工程 | `inventory/`：`npm run lab -- start C26`、`npm run lab -- dev` | 接 C25，不重写表单 |
| 本课检查 | `inventory/`：`npm run lab -- check C26` | 实际工程的草稿身份 |
| 专项组件检查 | `inventory/`：`node tools/forms-state-check.mjs C26` | 22 条当前与必要前置用例 |
| 专项浏览器 | `inventory/`：`node tools/forms-state.browser.mjs C26` | 直接换商品、取消与关开 |
| 旧固定输出 | 仓库根：`npm run examples -- c26` | selected-id/draft-boundary/prediction 三个参考例子 |

## 本轮验证记录

- 2026-10-29 · macOS arm64 · Node 24.22.0、npm 11.19.1、React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.4、RTL 16.3.3、Playwright 1.64.1、Chromium 156.0.8078.4。依赖只读复用，没有安装或改锁。
- `npm run examples -- c26`：3/3 固定输出通过，仅作为旧纯函数参考兼容性。
- 已从第1路最终 `handoff-C24`（2026.10-v2.3/C24）按正文连续组装 C25→C26，App与参考增量一致；正文旧引用0/当前查找3的机制片段实际执行。是作者回归，不是独立读者抽验。
- 实际上游最新组件22 passed/7后课skipped；原身份/草稿/取消/统计/3000ms队列与新增全量汇总溢出行为回归通过。C26继续继承C25预检，源码未改；最新组件日志在 `delivery/.validation/overflow-walkthrough-20261029/`。
- 实际上游 Chromium 真键盘、直接切换/错误清空、取消换商品、同商品重开通过，360px无溢出/pageerror；初稿旧前置85条Lab/原UI曾通过，本次未重复A4正在接入的共享检查器。
- 主错误：临时 App 去掉 key，直接切 P002 的回归失败（收到旧键盘草稿/库存）；恢复 key 后同命令通过。特意不把“取消后换商品通过”当成 key 正确的充分证据。
- 最终日志在 `delivery/.validation/real-c24-20261029/`；完整作者命令见 `delivery/agent-2.md` §7，入口 `walkthrough-agent-2.mjs`。只读上游49文件hash前后不变；C26一行key增量原样复用。
- 必要返修：MDX静态LessonTask、含组件lint、80锚点及四页静态夹具输出已通过；真实C24连续作者回归和主错误红绿已补验。主集成16快照、全站门禁与发行见 [阶段 A](../../labs/records/A.md)。
- 未运行：React DevTools/Chrome Sources 界面手动点击、屏幕阅读器、其他浏览器/操作系统；独立读者抽验范围及全站视觉/Pages由阶段 A 统一记录。

旧验证与发布历史见 [基线 README](https://github.com/socoo123/js_web/blob/93f81d29fef57e4bd86da38cc8f740e12b14775e/examples/c26/README.md)，不移作本轮新实现证据。
