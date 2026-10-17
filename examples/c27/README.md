# C27 useReducer 与 Context · 示例

配套正文：[C27](../../src/content/docs/05-react/c27-reducer-context.md)。数据沿用 shared/products.js；React 代码在[阶段 4](../inventory/04-react/)。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| action-flow.js | node action-flow.js | 同一 reducer 顺序处理补货与删除 |
| immutable-update.js | node immutable-update.js | 新旧容器、目标记录和未变记录的引用 |
| invalid-action.js | node invalid-action.js | 未知 type、缺失 id、非法保存数据 |
| prediction.js | node prediction.js | 用 reduce 计算一组 action 的结果 |
| 阶段 4 src/products-reducer.js | npm test | 四种 action，保存边界与纯更新 |
| 阶段 4 src/InventoryContext.jsx | dev / 首页 | 库存和 dispatch 两个 Context |
| 阶段 4 src/InventoryCatalog.jsx、InventorySummary.jsx、App.jsx | dev / 首页 | 业务容器读取 Context，展示组件仍用 props |
| 阶段 4 labs/reducer-context-main.jsx | 下表实验页 | 队列、同引用错误与 Provider 作用域 |
| 阶段 4 tests/reducer.test.jsx、context.test.jsx | npm test | 业务、非法 action 与共享范围回归 |
| 阶段 4 labs/reducer-context-bugs.test.jsx | npm run test:bug -- labs/reducer-context-bugs.test.jsx | 两项故意失败，修复 Broken 文件后通过 |

## 运行

- 仓库根目录：`npm run examples -- c27` 自动核对四份固定输出；本目录可分别运行 node 命令。
- 阶段 4 目录：`npm ci`，再 `npm run dev -- --host 127.0.0.1`，打开终端的 /js_web/ 地址。
- 在地址后加 labs/reducer-context.html?case=下表值；实验页仅通过 dev 提供。
- 正常检查：阶段 4 执行 `npm test`、`npm run build`，然后 `npm run preview -- --host 127.0.0.1` 检查生产首页。

| case | 操作与预期 |
| --- | --- |
| queue | 点击一次由 0 到 2，再次到 4；首次 Console 为点击时 0、派发后 0 undefined |
| mutation | 点击后页面仍为鼠标 0、总库存 52；旧快照已被错误修改 |
| mutation-answer | 一次点击为鼠标 1、总库存 53；再次为 2、54 |
| split | 补货按钮更新外层库存，内层统计仍为 52 |
| split-answer | 同一 Provider 下补货后统计为 53 |
| scope | 库存 A 补货后 53，独立库存 B 仍为 52 |
| missing | 无 Provider，读取 createContext 的默认 null，显示尚未连接库存 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3。依赖清单与锁文件未改。
- 四份固定输出 4/4；阶段 4 正常回归 77/77，含 reducer 22 条和 Context 6 条；React 生产构建通过。保存校验、未知 action/编号、不可变输入、队列、上限、Provider 隔离与草稿保留均有回归。
- 两项 bug 回归先分别报旧库存变成 1、统计仍为 52；按正文替换两个 Broken 文件后，同一测试命令 2/2 通过，随后恢复教学错误起点。练习 2 的独立测试片段另行执行通过。
- 独立后台 Chrome 155.0.8059.82：七个实验均按正文操作通过；queue 日志首次为点击时 0、派发后 0 undefined，按钮依次 2、4；mutation 仍显示 0/52，修复版依次 1/53、2/54；split 统计仍为 52，修复版为 53；scope 为 A=53/B=52，missing 显示默认值提示。未操作已有窗口。
- 通过 Chrome 调试接口取得暂停帧：错误补货前 stock=0、product===products[1]、type=restocked；split 的内层消费者起点为 0，点击后外层 Provider 为 1，而内层统计仍为 52。未在 DevTools 界面手动点击 Components 或 Sources。
- 首页确认：P001 草稿与搜索鼠标在 P002 补货时保留，总库存 53；取消回标题，重开恢复机械键盘。保存 P002 为 3/129.90 后为 55 件、26737.70 元；排序保留草稿，Enter 保存聚焦标题，重开读到保存值。新增 P007/P008 后过滤删除鼠标，得到 7 种、52 件、26348.00 元；刷新回六件商品，无页面异常。
- 网站 lint 27 课零 error/warning，check 零诊断，build 固定输出 229/229、32 个 HTML 与 27 课产物检查通过；正文 7922 字符、14 个代码块。14 个 JS/JSX 片段均与源码一致或已单独运行。
- 生产预览：React 补货、保存与标题焦点通过；课程 HTTP 200，禁用 JS 后正文、14 段代码与四个答案折叠区可读可展开，路线为 27/48。
- Pages：待推送后核验。
- 未运行：React DevTools 界面手动操作、屏幕阅读器朗读、Firefox、Safari、Windows。
