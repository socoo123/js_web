# C25 表单、校验与可访问性 · 示例

主线是自己的 `inventory/`，不是本目录或旧阶段演示。正文：[C25](../../src/content/docs/05-react/c25-forms-validation-accessibility.mdx)。本轮目标发行版 **2026.10-v2.3**：前置 C24、完成 C25；参考增量在 [steps/C25](../../labs/reference/steps/C25/)，发行入口见 [Lab](https://socoo123.github.io/js_web/labs/)。本轮冻结、主验收与发布证据统一写入 `labs/records/A.md`，局部通过不代表已发布。

## 运行

| 入口 | 工作目录与命令 | 用途 |
| --- | --- | --- |
| 当前工程 | `inventory/`：`npm run lab -- start C25`、`npm run lab -- dev` | 接 C24 加表单 |
| 本课检查 | `inventory/`：`npm run lab -- check C25` | 检查真实工作文件 |
| 专项组件检查 | `inventory/`：`node tools/forms-state-check.mjs C25` | 18 条本课/必要前置用例；后课用例跳过 |
| 专项浏览器 | `inventory/`：`node tools/forms-state.browser.mjs C25` | 真实键盘、错误焦点、0 与取消 |
| 旧固定输出 | 仓库根：`npm run examples -- c25` | 本目录五个 JS 参考例子，不是 Lab 实现 |

旧固定输出文件为 value-boundary.js、price-cents.js、validate-draft.js、prediction.js、invalid-draft.js，继续使用原阶段纯函数。本轮没有再维护第二份业务源码；Lab 调用自己的 core.toDraft/parseDraft，返回值接口与旧 validateDraft 不同。

## 本轮验证记录

- 2026-10-29 · macOS arm64 · Node 24.22.0、npm 11.19.1；React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.4、RTL 16.3.3、Playwright 1.64.1、Chromium 156.0.8078.4。依赖软链接只读，未 install/ci；Vite 缓存落到隔离副本。
- `npm run examples -- c25`：5/5 固定输出通过。它们只是旧示例兼容证据，不替代新表单检查。
- 已从第1路最终 `handoff-C24`（2026.10-v2.3/C24，49文件只读复制）按正文连续组装 C25，两个文件与参考增量一致；正文 Console 数字/字符串、空白、0、0.29 与非法价格输出实际执行。是作者回归，不是独立读者抽验。
- 实际上游最新组件检查18 passed/11后课skipped；原输入/焦点/取消/统计及3000ms前置队列通过，新增编辑与新建的全量汇总溢出行为回归也通过。C25原有同步预检作为不崩溃基准，源码未改。共享Lab仍由主agent集成后终验。
- 独立后台 Chromium：Tab/Enter 打开 P002，空名称与空库存 Enter 拒绝并聚焦，键盘输入 0/0.29 后 Enter 保存，Tab 到取消后 Enter 不保存；360px 无横向溢出、无 pageerror。
- 主错误：仅在临时 C25 工作区把原始库存先 Number 再转字符串；“拒绝空库存”回归失败（onSave 被调用），恢复原解析行后同命令通过。正式 steps 保留正确版本。
- 最终真实衔接日志：第2路 `delivery/.validation/real-c24-20261029/`，包含输入hash、组件/浏览器/主错误红绿和各课组装源码；完整命令见 `delivery/agent-2.md` §7，入口 `walkthrough-agent-2.mjs`。上游49文件前后hash不变。
- 必要返修：MDX静态LessonTask、含组件lint、80锚点及四页静态夹具输出已通过；真实C24连续作者回归和主错误红绿已补验。主集成16快照、全站门禁与发行见 [阶段 A](../../labs/records/A.md)。
- 跨课溢出定点记录见 `delivery/agent-2-overflow.md`：C25基准2/2，C27/C28修复前2失败、修后2通过；只重跑新溢出浏览器路径。最新正文组装/组件日志 `delivery/.validation/overflow-walkthrough-20261029/`；此前整段浏览器仍为上轮记录。
- 未运行：DevTools 界面手动点击、屏幕阅读器、Firefox、Safari、Windows；独立读者抽验范围及全站视觉/Pages由阶段 A 统一记录。

旧版运行/发布记录保留在 [基线 README](https://github.com/socoo123/js_web/blob/93f81d29fef57e4bd86da38cc8f740e12b14775e/examples/c25/README.md)，不作为本轮新源码的验证记录。
