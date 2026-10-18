# C31 自定义 Hooks 与路由 · 示例

配套正文：[C31](../../src/content/docs/05-react/c31-custom-hooks-routing.md)。普通 JS 在本目录，React 在[阶段 4](../inventory/04-react/)，沿用固定商品数据。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| url-parts.js | node url-parts.js | 区分原生 URL 的 path/search/hash 和片段内路由 |
| catalog-params.js | node catalog-params.js | URL 筛选解析与非法枚举回退 |
| storage-recovery.js | node storage-recovery.js | 注入简单存储对象，检查缺失/正常/损坏/非文本；不运行 React |
| prediction.js | node prediction.js | 参数复制与字符串类型 |
| 阶段 4 src/useProductRequest.js、ProductDetails.jsx | 首页详情 / request | 提取 C30 生命周期，保持清理、取消与重试 |
| 阶段 4 src/useLocalStorage.js、storage-text.js、InventoryNote.jsx | 首页 / storage | 浏览器固定 key 的文本存储、损坏恢复、写入失败提示 |
| 阶段 4 src/useCatalogFilters.js、catalog-url.js | 首页 | URL 是筛选唯一来源，逐次 replace、保留其他字段 |
| 阶段 4 src/main.jsx、App.jsx、InventoryLayout.jsx | 首页 | HashRouter、嵌套/默认路由与 Outlet，Provider 跨路由保留 |
| 阶段 4 src/ProductDetailRoute.jsx、NotFound.jsx | 首页 | 参数检查、初始快照、明确返回链接与未知路径 |
| 阶段 4 labs/hooks-main.jsx | 下表 | 四个 dev 实验；不进入生产构建 |
| 阶段 4 tests/hooks.test.jsx、routes.test.jsx | npm test | 21 条新增回归，原 App 测试增加 MemoryRouter 上下文 |
| 阶段 4 labs/hooks-bugs.test.jsx | npm run test:bug -- labs/hooks-bugs.test.jsx | 缺 productId 依赖的一项失败起点 |

## 运行

- 根目录 `npm run examples -- c31`；本目录可逐个运行 node 命令。
- 阶段 4 `npm ci`、`npm run dev -- --host 127.0.0.1`；已有完整锁文件无需重复 install。若在自己的 C30 工程上跟做，先执行 `npm install --save-exact react-router@8`。
- 阶段 4 `npm run lint`、`npm test`、`npm run build`，再 `npm run preview -- --host 127.0.0.1`；所有路径以终端的 /js_web/ 地址为起点。
- 生产首页 #/products 为列表，#/products/P002?q=鼠标 为详情；本阶段产物只做本地预览，未发布到课程 Pages。

| case（labs/hooks.html?case= 后） | 操作与预期 |
| --- | --- |
| counters | 点两次 A，A=2、B=0；每次 Hook 调用状态独立 |
| storage | A 保存/刷新，B 独立；损坏 A 的 JSON 再刷新得到默认值和错误；再次输入修复 |
| request | C30 的正确请求组件改用 Hook，快速切换、取消与重试保持原行为 |
| stale | P001 成功后选 P002，没有新请求，详情仍停在 P001；补上 productId 依赖修复 |

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0、npm 11.19.1；React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3。新增 react-router 8.4.0 及两项传递依赖，只改阶段 4 清单/锁；网站根依赖不变。
- `npm run examples -- c31` 4/4；阶段 4 `npm ci`、正常 lint、131/131 回归与生产构建通过。新增 11 条 Hook / 存储、10 条路由回归，原 C30 的 13 条竞态测试全部保留通过。
- Hook 覆盖独立计数/独立取消、无关渲染不重请求、挂载只读、损坏/类型错误、读取权限/写入容量失败、恢复保存及相同 key 不自动共享 state。
- 路由覆盖 URL 初始筛选、保留其他参数、非法值回退、嵌套详情与焦点、未知路径/编号不请求、跨页保留库存/丢弃草稿、参数切换失效、后退与 replace 历史。
- 缺依赖的 lint 与 bug 回归先分别报 missing productId 和期望 P002/实为 P001；加入 productId 依赖后，两项原命令通过，再恢复教学错误起点。Chrome 调试接口真实暂停帧：修复前切到 P002 无新请求也不再命中加载断点，修复后断点读到 productId=P002，出现 P002.json 并显示正确详情。
- 独立后台 Chrome 155.0.8059.82：四个 Hook 实验按正文步骤运行；备注保存/刷新/损坏/重新输入恢复、独立实例、旧请求隔离及取消/重试均通过；没有操作用户现有窗口。
- 开发与生产预览均通过：完整 hash 地址的新标签分享/刷新、前进后退、保留 q/category/order、未知路径/编号返回入口、标题焦点、跨页库存保留、草稿卸载及备注恢复。P002 初始 JSON 为 /js_web/data/products/P002.json、HTTP 200、库存 0；原标签补货往返维持 53 / 26477.00，新标签和刷新恢复 52 / 26348.00。
- 网站 lint 31 课零 error/warning，check 零诊断，build 固定输出 243/243、36 页产物检查通过；正文 7887 字符、15 个代码块，所有 JS/JSX 与完整文件或连续片段一致。
- 静态课程生产预览 HTTP 200；禁用 JS 后 15 段代码、6 个答案折叠区与 /js_web/ 内部链接可用，路线页 31/48 与 C31 链接正确。
- Pages：[run 39082631885](https://github.com/socoo123/js_web/actions/runs/39082631885) build/deploy 成功；C31 与路线均 HTTP 200，标题、自定义 Hook、存储、hash 路由正文与 31/48 目录及链接已上线。
- 未运行：DevTools 界面手动点击、屏幕阅读器朗读、Firefox、Safari、Windows。
