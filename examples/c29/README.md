# C29 useEffect 深入与清理 · 示例

配套正文：[C29](../../src/content/docs/05-react/c29-effects-cleanup.md)。普通 JS 在本目录，真实 React 在[阶段 4](../inventory/04-react/)，沿用固定商品数据。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| cleanup-closure.js | node cleanup-closure.js | 手动模拟启停，说明旧清理保留旧参数；没有运行 React |
| deps-identity.js | node deps-identity.js | Object.is 比较字符串与新对象、函数、数组 |
| prediction.js | node prediction.js | 两次调用分别保留库存快照 |
| 阶段 4 src/InventoryTitle.jsx | dev / 首页 | 按总库存同步标题，cleanup 恢复原标题 |
| 阶段 4 src/InventorySearchShortcut.jsx | dev / 首页 | 全局 / 快捷键订阅、编辑保护与注销 |
| 阶段 4 labs/effects-main.jsx | 下表实验页 | 八个 Effect 实验 |
| 阶段 4 tests/effects.test.jsx | npm test | 十一项新增正常回归 |
| 阶段 4 labs/effects-bugs.test.jsx | npm run test:bug -- labs/effects-bugs.test.jsx | 四项故意失败，修复后通过 |

## 运行

- 仓库根目录执行 `npm run examples -- c29`，或在本目录逐个运行 node 命令。
- 阶段 4 执行 `npm ci`、`npm run dev -- --host 127.0.0.1`；打开终端的 /js_web/ 地址。
- 实验路径为 labs/effects.html?case=下表值，仅 dev 提供；切换实验要重新打开地址，避免旧监听干扰。
- 阶段 4 执行 `npm run lint`、`npm test`、`npm run build`；用 `npm run preview -- --host 127.0.0.1` 检查生产首页。
- `npm run lint:bug` 单独检查 StaleSubscriptionBroken 与 IntervalBroken，原始版本预期报缺 productId、count 两项错误；只启用两条 Hooks 规则。

| case | 操作与预期 |
| --- | --- |
| lifecycle | 首次 setup/cleanup/setup；备注不重新订阅；切换先清 P001 再建 P002；每条通知只加一，隐藏后无回调，重新显示归零 |
| missing | 初次发通知计数 2；再切换并发一条，累计 5；缺清理留下三个监听 |
| stale | 切到 P002，页面文字已更新，通知回调仍打印 P001 |
| guard | 根 StrictMode 清理后，ref 拦截新 setup；发通知仍为 0 |
| interval | 三秒后仍为 1，回调保留 count=0 |
| interval-answer | 三秒后为 3，卸载清除唯一计时器 |
| loop | 连续设置新数组使依赖变化，超过六次停止并显示实验错误 |
| loop-answer | 渲染时直接计算，固定数据有货 5 种 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3。本阶段新增 ESLint 10.13.0 与 eslint-plugin-react-hooks 7.1.1，精确锁入阶段 4，网站根清单与锁不变。
- 固定输出 3/3；`npm ci` 后正常 lint 和 97/97 回归通过，本课新增 11 条；生产应用构建通过。正常测试覆盖依赖变化的旧/新顺序、无关更新、真实注销和重启、interval 计时与清除、派生值来源变化、标题更新/恢复及快捷键。
- 错误 lint 先报两项缺依赖；四项 bug 回归先分别报收到 3 次、新编号仍为 P001、三秒仍为 1、循环停止。通知组件按 ProductWatch、interval 按 IntervalFixed、筛选按 LoopFixed 替换后，lint:bug 与 4/4 回归通过；之后恢复教学错误起点。
- 独立后台 Chrome 155.0.8059.82：八个实验按正文操作通过，包含开发三行时序、备注不重订阅、隐藏后无通知、重挂载从零、missing 的 2/5、stale 的旧编号、guard 的零次、interval 的 1/3 和循环止损；未操作现有窗口。
- Chrome 调试接口的真实暂停帧：missing 发一条通知在处理函数停两次，闭包编号均 P001；stale 切换后文字为 P002，暂停帧仍读 P001。未手动点击 DevTools 界面。
- 首页项目步骤通过：初始 52 件/26348.00 元，按 / 聚焦搜索，筛选键盘仅一张卡片但标题仍 52；P002 补一件后为 53/26477.00，标题更新；编辑名称输入 / 保留字符与焦点；取消后刷新恢复固定数据。
- 网站 lint 29 课零 error/warning，check 零诊断，build 固定输出 235/235、34 页产物检查通过；正文 9715 字符、14 个代码块，均与源文件或连续节选一致，带 title 的三个块逐字一致。
- 生产预览：首页标题/快捷键/补货通过；课程 HTTP 200，禁用 JS 后 14 段代码、四个折叠区和 D2 可阅读；路线 29/48 与 C29 链接正确。D2 源码编译为第 13 张图，中文与执行路径已检查。
- Pages：[run 39042403933](https://github.com/socoo123/js_web/actions/runs/39042403933) build/deploy 成功；C29 与路线均 HTTP 200，课程标题、D2、快捷键内容及 29/48 目录已上线。
- 未运行：屏幕阅读器朗读、DevTools 界面手动点击、Firefox、Safari、Windows。
