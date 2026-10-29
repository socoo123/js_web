# C27 useReducer 与 Context · 示例

正文：[C27](../../src/content/docs/05-react/c27-reducer-context.mdx)。主线为自己的 `inventory/`。本轮目标发行版 **2026.10-v2.3**：前置 C26、完成 C27；参考增量 [steps/C27](../../labs/reference/steps/C27/)。发行入口见 [Lab](https://socoo123.github.io/js_web/labs/)，主 agent 的阶段验收与发布证据位置为 `labs/records/A.md`。

## 运行

| 入口 | 工作目录与命令 | 用途 |
| --- | --- | --- |
| 当前工程 | `inventory/`：`npm run lab -- start C27`、`npm run lab -- dev` | 迁移三个文件，UI 草稿继续局部 |
| 本课检查 | `inventory/`：`npm run lab -- check C27` | 真实工程行为 |
| 专项组件/纯函数 | `inventory/`：`node tools/forms-state-check.mjs C27` | 35 条通过，6 条后课跳过 |
| 专项浏览器 | `inventory/`：`node tools/forms-state.browser.mjs C27` | Provider 更新不污染本地草稿 |
| 旧固定输出 | 仓库根：`npm run examples -- c27` | action-flow/immutable-update/invalid-action/prediction 四个参考例子 |

旧示例使用旧 productsReducer 接口，不是新工作区 inventoryReducer 的第二份实现。新接口为 restocked{id,amount}/created{product}/saved{product}/deleted{id}/replaced{products}。

## 本轮验证记录

- 2026-10-29 · macOS arm64 · Node 24.22.0、npm 11.19.1、React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.4、RTL 16.3.3、Playwright 1.64.1、Chromium 156.0.8078.4。依赖软链接只读，未 install/ci 或改锁。
- `npm run examples -- c27`：4/4 固定输出通过。
- 已从第1路最终 `handoff-C24` 按最新正文连续接C25→C26→C27，三个文件与参考解一致；最新组件/纯函数35 passed/6后课skipped，含全量汇总溢出和既有纯函数/草稿/队列回归。是作者回归，不是独立读者抽验。
- 实际 Provider 队列：一次事件两次补货，事件快照 0、dispatch 返回 undefined、页面 2；两个 Provider A 补到 1 而 B 仍 0。正文连续 action 52+1−12=41、旧 P002=0 实测。
- 实际上游 Chromium 确认P001未提交草稿在P002 dispatch后保留，已保存P001不改、P002=1、总库存53；表单与身份前置通过。初稿旧前置85条Lab/原UI曾通过，本次未重复A4正在接入的共享检查器。
- 主错误：只在临时 reducer 的 restocked 分支原地改 product 并返回 products；冻结输入测试红（只读 stock 赋值异常），恢复 core 的新数组更新后同命令绿。不是只比较最终库存。
- 最终日志在 `delivery/.validation/real-c24-20261029/`，含实际C24输入hash和各课生成源码；完整命令见 `delivery/agent-2.md` §7，入口 `walkthrough-agent-2.mjs`。上游49文件hash前后不变。
- 必要返修：MDX静态LessonTask、含组件lint、80锚点及四页静态夹具输出已通过；真实C24连续作者回归和主错误红绿已补验。主集成16快照、全站门禁与发行见 [阶段 A](../../labs/records/A.md)。
- 跨课输入修复：saveProduct在dispatch前对完整候选集合validateProducts/summarize，失败由表单catch显示并保留草稿，不存第二份商品state。实际App编辑/新建溢出回归先2失败后2通过，定点浏览器先main/form清空、修后保留输入/商品/52与2634800并能修正重试；详见 `delivery/agent-2-overflow.md`，未重跑其他旧浏览器路径。
- 未运行：DevTools 界面手工步骤、屏幕阅读器、Firefox/Safari/Windows；未增加 Java 可执行对照片段。独立读者抽验范围及全站视觉/Pages由阶段 A 统一记录。

旧版验证与发布历史见 [基线 README](https://github.com/socoo123/js_web/blob/93f81d29fef57e4bd86da38cc8f740e12b14775e/examples/c27/README.md)。
