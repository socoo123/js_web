# C32 认识 TanStack Query 与服务端状态 · 示例

配套正文：[C32](../../src/content/docs/05-react/c32-tanstack-query-server-state.md)。Node 示例导入阶段 4 的 query-client.js，使用实际 TanStack Query；先在 `examples/inventory/04-react` 执行 `npm ci`。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| cache-reads.js | `node cache-reads.js` | 同键并发与新鲜缓存复用 |
| keys.js | `node keys.js` | 内容匹配、编号隔离、对象字段换序 |
| invalidation.js | `node invalidation.js` | 无观察者时失效保留数据，显式读取新值 |
| retries.js | `node retries.js` | retry 1 共尝试两次 |
| prediction.js | `node prediction.js` | 售罄库存失效后仍为 0 |
| cache-isolation.js | `node cache-isolation.js` | 两个客户端不共用缓存 |

## 运行

- Node：在本目录执行表中命令，或在根目录执行 `npm run examples -- c32`，固定输出 6/6。
- React：阶段 4 执行 `npm run dev -- --host 127.0.0.1`，打开 `/js_web/labs/query.html`。实验用同一个客户端与 mock，支持切换商品/观察者、快慢响应、失败一次/持续失败、保存失败。
- 错误起点：`labs/query.html?case=key-bug`。键盘成功后选鼠标仍显示键盘；向 QueryKeyBroken 的 queryKey 加入 productId 后恢复。`npm run test:bug -- labs/query-bugs.test.jsx` 对原始起点失败，修复后通过。
- 正常回归：阶段 4 执行 `npm run lint`、`npm test`、`npm run build`。query.test.jsx 新增 9 条、query-core.test.jsx 新增 4 条，共 144 条；旧路由测试适配 Query 异步通知与详情标签，手工 Hook 回归保留。
- 生产预览：`npm run preview -- --host 127.0.0.1`；打开 `/js_web/#/products/P002?q=鼠标`。详情用查询缓存与浏览器 mock；列表继续用本地 reducer，两个区域有明确说明，mock 补货不会改列表。刷新恢复 mock 与缓存。
- 模拟写入只更新当前页面内存 Map；Network 中只有读取静态 JSON 的 GET。实验速度在 GET 前增加 mock 等待，不把这段等待当作网络传输耗时。
- CI 先安装阶段 4 锁定依赖并运行 lint/测试/构建，随后站点 build 才运行全量 Node 示例；网站根依赖与根锁不变。

## 验证记录

- 2026-10-18 · Node 24.22.0、npm 11.19.1、React 19.3.1、TanStack Query 5.104.4 · macOS arm64：阶段 4 `npm ci` 成功；C32 固定输出 6/6、React 正常回归 144/144，通过 Hooks lint。
- 同日 · Chrome 155.0.8059.82（独立 headless）：按正文实验操作，快网成功后返回与增加观察者未增加 GET；同键双观察者补货只读回一次，均为 13；模拟保存失败维持 13；慢响应显示后台更新并保留旧详情。
- 同日：失败一次增加两次查询尝试后成功；持续失败显示错误与旧库存，恢复后可重读；离线时分别显示缓存/等待连接，联网后恢复。模拟速度与 HTTP 传输分开记录。
- 同日：错误 key 选择 P002 后无 P002 GET、仍显示 P001；给浏览器模块响应补上编号后出现 P002 GET 且显示 P002。同一 Vitest bug 用例先失败，修改源文件加入编号后通过，随后还原教学错误起点。
- 同日：应用 hash 详情补货后库存为 1，回列表仍为本地库存 0、总数 52；重入复用详情缓存，刷新恢复 0，资源路径保留 /js_web/。
- 同日：去掉 onSuccess 后，mock 保存断点显示 current.stock=12、saved.stock=13，缓存仍为 12、没有新 GET；恢复后显示 13 且只读回一次。源文件已恢复。
- 同日：根目录 lint:lessons（32 课零 error/warning）、check（零诊断）、build 通过；全量固定输出 249/249 与 37 页子路径/资源/折叠区检查通过。阶段 4 生产构建与 hash 详情预览通过；静态正文禁用 JS 后可阅读及展开 6 个折叠区。Pages 待推送后核验。
- 未运行：Firefox、Safari、Windows、真实后端和多用户同步。
