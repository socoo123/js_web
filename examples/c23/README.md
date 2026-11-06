# C23 useState：状态快照与更新队列 · 示例

正文：[C23](../../src/content/docs/05-react/c23-state-snapshot-queue.mdx)。正式路线接自己 C22 的 ProductList/Toolbar，不再下载 P22 试做起点。

| 材料 | 入口 | 用途 |
| --- | --- | --- |
| queue-values/updaters.js、closure.js、prediction.js | 仓库根目录 `npm run examples -- c23` | 4 个固定输出；队列手算不是调度实现 |
| [C23 steps](../../labs/reference/steps/C23/) | C22 → C23 | StockActions 与 App；三秒延迟 |
| [react-check.test.jsx](../../labs/inventory/tools/react-check.test.jsx) | 工作区 `tools/vitest.config.mjs` | 真正挂载当前 StockActions 的 3 条回归 |
| [C23Queue.java](../../labs/reference/java/C23Queue.java) | `java labs/reference/java/C23Queue.java` | 普通 Java 连续赋值对照 |

## Lab 与运行

- 发行版 `2026.10-v2.3`；正式 C22 起点/C23 终点；下载目录 `downloads/inventory/2026.10-v2.3/`；主验收与上线证据见 [阶段 A](../../labs/records/A.md)。
- 当前 `inventory/` 执行 `npm run lab -- start C23`、`npm run lab -- dev`、`npm run lab -- check C23`。
- 专用队列回归：工作区执行 `node node_modules/vitest/vitest.mjs run --config tools/vitest.config.mjs`。
- 共享注册表已由主 agent 集成：四个 CodeExcerpt 与队列卡右侧指向正式 C23，正式起点为 C22。
- 阶段汇总与发布状态见 [A 记录](../../labs/records/A.md)；本路局部证据位于该记录所列隔离副本的 `delivery/agent-1.md`。

## 本次验证 · 2026-11-06（V3 阶段 1 范例课改写）

- macOS arm64；Node 24.22.0/npm 11.19.1；Astro 7.3.8、React/react-dom 19.3.1、Vitest 5.0.5；headless Chromium 156.0.8078.4（Playwright 1.64.1）。复用只读依赖，未安装。
- 正文按「主张→代码→效果→原因→Java 对照」重写；课号、标题、URL、学习日、旧锚点、CodeCompare 与四个 CodeExcerpt、D2 图、Lab 数字不变。新增 2 个「先猜一猜」与 2 个交互演示（`c23-first-render`、`c23-update-queue`）。
- `npm run examples -- c23` 4/4；`npm run lint:lessons` C23 4498/10000 字符、14 块，V3 可读性规则 0 warning，全站 0 error/0 warning；`npm run check` 0 error。
- 只按改写后正文从 C22 恢复目录组装（四个 CodeExcerpt、对照卡右侧、Predict 里的错误写法）：
  - 三次 `setStock(stock + 1)`：`lab check C23` 退出 1，`expected 'P001 当前库存 13 件' to contain '15 件'`。
  - 延迟回调写 `setStock(stock + 3)`：退出 1，`expected 'P001 当前库存 15 件' to contain '16 件'`。
  - 按正文修复：退出 0，组件 3/3、隔离浏览器场景 3 组、当前工作文件 86 条通过。终端效果面板里的两行即这次输出。
- 两个演示（Chromium，键盘操作）：首次渲染 12 → Enter 点 +1 得 13 → 方向键换 P002 仍 13；队列传值 13、updater 15；延迟 1 秒期间立即 +1，updater 得 16、旧值写法得 15。禁用 JS 时显示 12 的初始画面、禁用按钮和说明文字；减少动态效果时动画全部关闭；360/768/1280 亮暗主题无横向溢出。
- 构建产物：只有 C23 页含交互岛，新增 JS 约 74.6 KB（gzip），其他页面不加载 React。
- Java 21.0.2 执行 C23Queue.java 输出 15。
- 集成后复验（同日）：页面截图 `c23/actions` 为截图流程生成的真实图，正文用 2 次（页首、第 5 节）；Console、终端、窗口外框改用站点配色变量，亮暗两套文字对比度均 ≥ 5:1；上面的红绿结果在集成结果上重做一致。
- 未运行：手动 DevTools UI、`lab dev` 交互、Firefox/Safari/Windows。

## 历史

- 2026-10-29 正式 C22→C23 路线：参考解组装与主 agent 独立抽验均为红 13/15 → 绿 15/16，`lab check C23` 86 条通过；CDP 断点显示 setter 前后 stock 都为 12。证据见阶段 A。

- 2026-10-17 旧阶段 4 发布：[Pages 39020278502](https://github.com/socoo123/js_web/actions/runs/39020278502)。旧机制例子保留。
- 2026-10-28 的 P22/P23 试做包保持原字节；其成功记录不算本次正式连续路线已发布。
