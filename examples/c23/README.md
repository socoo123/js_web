# C23 useState：状态快照与更新队列 · 示例

配套正文：[C23](../../src/content/docs/05-react/c23-state-snapshot-queue.md)。纯 JS 使用固定商品数据；真实 React 状态与交互在[阶段 4](../inventory/04-react/)。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| update-queue.js | 由其他文件导入 | 仅手算单个 state 的替换/updater 顺序，不模拟 React 调度 |
| queue-values.js | node queue-values.js | 三次替换为 13，外层快照仍为 12 |
| queue-updaters.js | node queue-updaters.js | 三次累计、混合顺序与最后替换 |
| closure.js | node closure.js | 不同调用的闭包分别保留 12 与 15 |
| prediction.js | node prediction.js | 练习 1：32、13、18、12 |
| 阶段 4 src/InventoryCounter.jsx | npm run dev | 本次盘点计数，立即/连续/延时记录 |
| 阶段 4 labs/state.html | dev 服务 | 下表九个 state 实验 |
| 阶段 4 tests/state.test.jsx | npm test | 真正挂载 React，检查交互结果与快照日志 |
| 阶段 4 labs/state-bugs.test.jsx | npm run test:bug -- labs/state-bugs.test.jsx | 两项故意失败回归，修复对应组件后通过 |

## 运行

- 仓库根目录：`npm run examples -- c23`，核对 4 个固定输出文件。
- 阶段 4：`npm ci`，再 `npm run dev -- --host 127.0.0.1`；实验地址为终端输出的 /js_web/ 后接 labs/state.html?case=下表值。
- 正常发布构建：阶段 4 执行 `npm test`、`npm run build`；`npm run preview -- --host 127.0.0.1` 预览首页，labs 仅由 dev 服务提供。
- 测试文件按需使用 happy-dom 环境，其他测试保持 Node；state-harness 用 createRoot/act 挂载，StrictMode 保留，可控时钟只用于测试。

| case | 起点与预期 |
| --- | --- |
| basic | 0 → 1 → 2，下一次渲染不重置为 0 |
| snapshot（默认） | 点击后页面 15，再补一件 16；三条日志始终为 12 |
| queue / queue-answer | 连续补三件：错误 12 → 13 → 14；正确 12 → 15 → 18 |
| delay / delay-answer | 延时补三件，期间补一件：错误 13 → 15；正确 13 → 16 |
| mixed | 每次刷新从 12 开始：先替换再累加为 16，先累加再替换为 15 |
| rules | 顶层 Hook 后条件 return；隐藏与再显示无 Hook 顺序错误 |
| independent | 两处盘点计数分别保存，第一处为 1 时第二处仍为 0 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5；新增 happy-dom 21.0.3，仅改阶段 4 独立清单与锁，网站根锁未改。
- `npm run examples -- c23` 4/4；阶段 4 正常 `npm test` 14/14（新增 8 个状态用例）。两项 bug 回归实跑失败，分别得到 13 与 15；改为参数累加后同一测试 2/2 通过，最终恢复教学错误起点。
- 独立临时配置的后台 Chrome 155.0.8059.82：队列错误与修复、混合顺序、延时覆盖与两次未到期补货、快照日志、Hook 条件返回、独立实例和首页 0 → 4 → 7 均通过；没有 pageerror。未操作现有 Chrome 窗口或标签页。
- Chrome 调试断点实际命中：QueueBroken 的 stock=12，替换值为 13；DelayBroken 的回调在页面已为 13 时仍捕获 stock=12，替换值为 15。使用独立 Chrome 的调试接口读取作用域，没有操作用户的 DevTools。
- basic 两次点击为 1、2；练习 3 临时增加清空按钮，实际得到 3 → 0 → 1；未到期定时器在清空后仍增加三次，恢复参考文件后正常 14 条测试与阶段构建通过。
- 阶段 4 重装 npm ci 及生产预览通过；首页的六件商品仍保持固定库存，生产版本计数交互正常。
- 网站 lint 为 23 课零 error/warning，check 零诊断，build 固定输出 211/211、27 个 HTML 与 23 课产物检查通过。正文 9,017 字符、15 个代码块，4 个具名代码块与示例逐字一致。
- 本地静态 C23 HTTP 200；Chrome 核对标题、D2、6 个练习折叠区与路线页 23 / 48；禁用 JavaScript 后正文仍可阅读。未执行全站周验收（按计划在 C24 后进行）。
- Pages：[run 39020278502](https://github.com/socoo123/js_web/actions/runs/39020278502) 构建与部署成功；线上 C23 HTTP 200，标题、6 个答案折叠区、D2 资源正确，路线页 HTTP 200 且为 23 / 48。
- 未运行：Firefox、Safari、Windows；原生 DevTools 界面的手动点击路径。

## V2 工作区试做

- 2026-10-28 · 发行版 `2026.10-v2.1` · 起点 `P22` → 终点 `P23`；两条 React 状态用例、真实页面连续与延迟交错通过。原例子保留为可选参考，不是当前主线工作目录。
- 在练习工作区执行 `npm run lab -- check C23`。教师从起点按正文片段跟做并修改实际文件验证先红后绿：`npm run test:lab-walkthrough`。
- 详细环境、错误证据、范围与限制见 [V2 验证](../../labs/records/README.md)。C23/C41 的试做前置单独提供，连续路线仍需 R6/R7 验收。
