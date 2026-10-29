# C22 Props、组合与渲染模型 · 示例

正文：[C22](../../src/content/docs/05-react/c22-props-composition-render.mdx)。接自己 C21 的工作区，不切换到旧阶段 4。

| 材料 | 入口 | 用途 |
| --- | --- | --- |
| props.js、conditions.js、purity-broken/fixed.js、prediction.js | 仓库根目录 `npm run examples -- c22` | 5 个固定输出 |
| [C22 steps](../../labs/reference/steps/C22/) | C21 → C22 | App、ProductList、Toolbar；原卡片保留 |
| [c22.test.jsx](../../labs/inventory/tools/c22.test.jsx) | 当前工作区组件回归 | 冻结 props、空态、children、附加内容函数 |

## Lab 与运行

- 发行版 `2026.10-v2.3`，C21 起点/C22 终点；下载目录 `downloads/inventory/2026.10-v2.3/`；主验收与上线证据见 [阶段 A](../../labs/records/A.md)。
- 当前 `inventory/` 执行 `npm run lab -- start C22`、`npm run lab -- dev`、`npm run lab -- check C22`；源码在 `src/react/`。
- 专用组件回归：工作区执行 `node node_modules/vitest/vitest.mjs run --config tools/foundations.config.mjs tools/c21.test.jsx tools/c22.test.jsx`。
- 汇总证据与发布状态见 [A 记录](../../labs/records/A.md)；本路交稿位于该记录所列隔离副本的 `delivery/agent-1.md`。

## 本次验证 · 2026-10-29

- macOS arm64；Node 24.22.0/npm 11.19.1；React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.4；未对提供的依赖链接安装。
- `npm run examples -- c22` 5/5；本课组件回归 3/3；`lab check C22` 85 条当前工作文件检查与六卡页面通过。
- 在真实 ProductList return 前加入 `products[0].stock += 1`：冻结输入回归抛 TypeError，空态也失败；删除后 3/3 通过。不是只测另一份纯函数。
- headless Chromium 156.0.8078.4：错误页未点击就显示 P001=14；CDP Sources 断点单步为 12→13；恢复只读组件后为 12。
- 按正文加入同一个 App 的可选备注、给现有 root 再 render：输入保留“先盘外设”，节点比较 true。此实验只改独立验证副本，完成后恢复。
- 三份主体文件与正文片段一致；建议注册表镜像中的 lint：4788/8000 字、11 块、零 error/warning；原有 18 个标题/显式锚点保留。
- QA 使用真实 C21→C22 参考链；独立读者抽验由主 agent 执行。
- 本路未运行：重新 npm ci、手动 React DevTools UI、Profiler 录制、Firefox/Safari/Windows。本批 Sources 证据来自独立浏览器 CDP；主集成的安装、16快照、构建及视觉/发布记录见阶段 A。

## 历史

2026-10-17 旧阶段 4 发布：[Pages 39018608877](https://github.com/socoo123/js_web/actions/runs/39018608877)。旧示例保留，但不作为当前工作区的完成证据。
