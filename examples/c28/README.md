# C28 useRef 与外部系统 · 示例

正文：[C28](../../src/content/docs/05-react/c28-refs-external-systems.mdx)。主线继续自己的 `inventory/`。本轮目标发行版 **2026.10-v2.3**：前置 C27、完成 C28；参考增量 [steps/C28](../../labs/reference/steps/C28/)。发行入口见 [Lab](https://socoo123.github.io/js_web/labs/)，主验收/发布记录位置为 `labs/records/A.md`。

## 运行

| 入口 | 工作目录与命令 | 用途 |
| --- | --- | --- |
| 当前工程 | `inventory/`：`npm run lab -- start C28`、`npm run lab -- dev` | 修改三个既有文件 |
| 本课检查 | `inventory/`：`npm run lab -- check C28` | 实际工作区而非 reference |
| 专项组件/纯函数 | `inventory/`：`node tools/forms-state-check.mjs C28` | 41 条通过，无后课要求 |
| 专项浏览器 | `inventory/`：`node tools/forms-state.browser.mjs C28` | 取消、替换、卸载、焦点 fallback |
| 旧固定输出 | 仓库根：`npm run examples -- c28` | ref-object/cancel-handle/prediction 三个参考例子 |

## 本轮验证记录

- 2026-10-29 · macOS arm64 · Node 24.22.0、npm 11.19.1、React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.4、RTL 16.3.3、Playwright 1.64.1、Chromium 156.0.8078.4。依赖软链接只读，缓存在本副本内，没有安装/改锁。
- `npm run examples -- c28`：3/3 固定输出通过；正文 12/15/12 闭包机制片段另行实际执行。
- 已从第1路最终 `handoff-C24` 按最新正文连续组装C25–C28，最终三个文件与参考增量一致；最新组件41/41，含溢出保留/重试、前置队列、取消/替换/卸载和全部焦点回归。是作者回归，不是独立读者抽验。
- 实际上游 Chromium 在360px走键盘表单、两秒取消/替换/筛选卸载撤销、P004保存8与取消返按钮、按钮移除/改名移出搜索返标题；无pageerror/溢出。初稿旧前置85条Lab/原UI曾通过，本次未重复A4正在接入的共享检查器。
- 主错误：只在临时 StockActions 将 useRef 改为每次新建普通容器；等待 state 重渲染后取消失效，回归收到16而期待13；恢复 useRef 后同命令通过。正式 steps 均为正确版本。
- timer ref 保存句柄、waiting state 生成提示；ProductEditor fields ref 只找 DOM；App trigger ref 返焦点，heading ref 处理触发按钮不再存在的边界。没有把可变库存 class 放进 React state。
- 最终日志在 `delivery/.validation/real-c24-20261029/`，包含实际C24输入hash和每课组装源码；完整作者命令见 `delivery/agent-2.md` §7，入口 `walkthrough-agent-2.mjs`。上游49文件hash前后不变。
- 衔接已验：C25–C27保留真实上游3000ms，C28按正文改2000ms；保留上游type="button"，有最小卸载清理、name-first/noValidate/heading fallback。后段需继续保留这些能力。
- 必要返修：MDX静态LessonTask、含组件lint、80锚点及四页静态夹具输出已通过；真实C24连续作者回归和主错误红绿已补验。主集成16快照、全站门禁与发行见 [阶段 A](../../labs/records/A.md)。
- 跨课输入修复：保留C27的同步全量候选预检，通过后才dispatch/closeEditor；汇总错误留在表单，不移动到关闭焦点。实际App编辑/新建溢出回归先2失败后2通过，新定点浏览器保留草稿/商品/统计并能修正重试，无pageerror；详见 `delivery/agent-2-overflow.md`。其他旧浏览器路径未重复。
- 未运行：DevTools 界面手动点击、屏幕阅读器、其他浏览器/系统；独立读者抽验范围及全站视觉/Pages由阶段 A 统一记录。

旧版验证与发布历史见 [基线 README](https://github.com/socoo123/js_web/blob/93f81d29fef57e4bd86da38cc8f740e12b14775e/examples/c28/README.md)，不作为本轮新源码证据。
