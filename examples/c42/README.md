# C42 UI5 路由与 OData 起点 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| route-identity.js | `node route-identity.js` | 可见索引、数组位置与业务编号 |
| query-options.js | `node query-options.js` | 相对 URL 与查询选项；不发送请求 |
| prediction.js | `node prediction.js` | 大小写、0、查找失败与低库存排序 |
| cache-console.js | 已加载表格的 OData 实验页 Console | 已缓存 P002 与未缓存 P999 |
| read-console.js | 已启动的 OData 实验页 Console | 真实 V2 read 读取 P002 |
| routing-odata.test.js | 见下 | 5 条真实 UI5 浏览器回归 |
| ../inventory/06-openui5 | 本地 UI5 | 列表/详情、元数据、独立 V2 mock |

## 运行

- 本目录执行 Node 命令；仓库根执行 `npm run examples -- c42` 核对三个 `.expected.txt`。
- 阶段 6 执行 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:8040/index.html`；详情为 `index.html#/products/P004`，未知路径为 `#/wrong/path`。
- 同一开发服务打开 `http://127.0.0.1:8040/test/odata.html`；点击有限查询，预期 P006 5 件、P004 3 件。在这个页面执行 read-console.js，预期 P002 0。
- 仓库根执行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c42/vitest.config.js`。工具复用阶段 4 已锁定的依赖，缺失时在阶段 4 执行 npm ci。
- 可用 C42_BASE_URL 指定主应用入口；C40_BASE_URL、C41_BASE_URL 分别指定前两课回归入口。均使用独立 headless Chrome，不操作现有窗口。
- 反例：回归命令前加 `C42_BROKEN_ID=1`、末尾加 `-t '筛选第一行'`；或加 `C42_BROKEN_SET=1`、末尾加 `-t '真实 V2'`。分别预期错误详情、读取失败。只拦截开发源码，不改文件。
- 生产：阶段 6 执行 `npm run build`，将完整 dist 挂到静态目录；设置 `C42_BASE_URL=http://127.0.0.1:8342/js_web/ui5/index.html` 后运行同一套正常回归。完整产物包含 test/localService，mock 仍在浏览器中运行。

## 验证记录

- 2026-10-19 · macOS arm64 · Node 24.19.0/npm 11.7.0：固定输出 3/3；OpenUI5 1.153.0/UI5 CLI 4.0.71 静态构建通过。使用本地现有 Node 24 执行；仓库原固定版本与锁文件未改，无新依赖或 D2。
- Chrome 155.0.8059.82 headless · Vitest 5.0.5/Playwright 1.64.1：C42 开发 5/5、静态 /js_web/ui5/ 5/5；C40 开发 3/3、C41 开发与静态均 9/9。正常回归收集页面异常、Console error 和失败资源。
- 覆盖筛选 P004→正确详情、业务 id、复制/刷新、浏览器前进后退、直接打开、返回列表、慢 JSON 下 P001→P002、零库存、不存在商品/未知路径、无效数据错误/刷新恢复、列表编辑后的详情同步；C40/C41 原业务兼容。
- 真实 V2 模型读取元数据 Products、六件固定商品、P002 主键；有限查询结果为 P006/P004，缓存 P002 库存为 0，未加载 P999 属性为 undefined。read-console.js 输出 P002 0。
- 两个反例均先失败：路由把数组位置传为 id，详情没有 P004；集合路径改小写，页面显示读取失败。恢复正常参数后开发 5/5，静态同样通过。
- 初次运行发现同字段顶层 Filter 数组按 OR 分组，查询错误返回 P005/P001；修复成显式 AND 后低库存回归通过。发现 MockServer rootUri 使用含域名 URL 时 metadata 404，改为与模型一致的站内路径；hash 使用框架默认 #/ 前缀。
- 断点实测 onDetail 的 id=P004、path=/products/3；小写集合错误回调的 statusCode=404。练习 3 移除 LE 条件实际返回 P005/P001，恢复后返回 P006/P004。
- 网站 lint 42 课零 error；check 零诊断；全量固定输出 280/280；build 48 页与 /js_web/ 产物检查通过。课程生产页 HTTP 200、6 个折叠区、资源与页面异常检查、禁用 JS 阅读通过。
- Pages：[run 39144417753](https://github.com/socoo123/js_web/actions/runs/39144417753) 成功；线上课程与路线均 HTTP 200，标题、6 个课程折叠区、路线 42/48 与 C42 链接正确。
- 未运行：DevTools 界面手动点选、屏幕阅读器、Firefox、Safari、Windows；V4/CAP、完整 OData CRUD、真实 SAP 登录/权限/CSRF/持久化。
