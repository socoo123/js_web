# C35 React UT、集成测试与 E2E 地图 · 示例

配套正文：[C35](../../src/content/docs/05-react/c35-react-testing.md)。固定数据沿用 shared/products，测试推进阶段 4，根工程不加依赖。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| boundary.js | `node boundary.js` | 复用库存/金额解析，空白、0、小数 |
| async-order.js | `node async-order.js` | async 拒绝与后续微任务 |
| fixture.js | `node fixture.js` | 新增 P007、不改变固定起点 |

## 运行

- 仓库根运行 `npm run examples -- c35`，3 个固定输出自动核对。
- 在 `examples/inventory/04-react` 执行 `npm ci`；`npm test -- tests/testing-forms.test.jsx tests/testing-async.test.jsx` 运行新增的 8 条正常用例。
- 同目录执行 `npm run lint`、`npm test`、`npm run build`：正常回归累计 171 条，错误起点在 labs，独立运行。
- E2E：执行 `npx playwright install chromium` 后运行 `npm run test:e2e`。配置自动构建、在 4178 端口启动预览、用 Chromium 检查跨页路径并关闭服务。失败 trace 写入忽略的 test-results。
- 浏览器跟做：执行 `npm run dev -- --host 127.0.0.1`，打开 `/js_web/#/products`；新增 P007 并编辑为随身转接头 / 配件 / 3 件 / 0.29 元，预期 7 种、55 件、26348.87 元。P002 空库存报错并聚焦，0 可保存，刷新恢复 6 种、52 件。
- 错误练习：`npm run test:bug -- labs/testing-bugs.test.jsx` 原始起点失败。按正文把 BlankStockBroken 的 Number 转换/范围判断替换为 parseStock / null 判断，重复命令通过；完整答案 BlankStockFixed。仓库保留错误起点。
- 练习 2：把 CachedProductDetails 首个「重试详情」回调改为空函数，运行 `npm test -- tests/testing-async.test.jsx -t 详情失败后由用户重试成功` 失败；恢复 query.refetch 后通过。

## 文件与边界

- tests/rtl-support.jsx：导入 jest-dom/vitest，显式 afterEach cleanup，清空独立 QueryClient、恢复 spy/global。仅新测试导入，不改旧测试的挂载辅助文件。
- testing-forms.test.jsx：空库存、合法 0/29 分、空名称、同名按钮作用域、创建后卡片与统计，共 5 条。
- testing-async.test.jsx：首次失败/用户重试、手控 Promise 加载态、卸载取消，共 3 条。Query 测试 retry=false、gcTime=Infinity，加载函数为边界替身；真实组件和缓存库保留。
- e2e/inventory.spec.js：筛选→详情→刷新→返回，静态 JSON 真实读取，保持 /js_web/ 和 hash；验证本地生产产物，不表示阶段 4 应用已部署到课程 Pages。
- 本课未新增 D2、站点配置或工作流；Pages CI 现有 npm test 会运行新增 RTL，用例范围不包含本地 E2E 命令。

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0 / npm 11.19.1：固定输出 3/3、新增正常 8/8、全量 171/171、阶段 4 lint/build 通过。
- 同日：错误起点 1 项失败，Expected「库存无效」、Received「已保存库存 0」；按正文修改后同命令 1/1 通过，随后恢复错误起点。
- 同日：练习 2 空回调使成功内容查询超时，恢复回调后通过；隔离的两表单实验漏 cleanup 时第二项报多个匹配，导入清理入口后 2/2 通过，实验文件已移除。
- 同日 · Playwright 1.64.1 / Chromium 156.0.8078.4（headless，独立进程）：生产产物跨页 E2E 1/1；开发页新增、空库存、合法 0、焦点、刷新与 blank/blank-answer 操作通过；拦截静态读取为 HTTP 503 后重试恢复，应用自动重试另发一次请求。
- 同日：课程 lint（正文 9115 字符、15 代码块、0 error/warning）、Astro check/build 与 40 页产物检查通过；静态课页 200、标题及正文折叠答案通过；Pages 部署待发布后核验。
- 未运行：Firefox、Safari、Windows、多浏览器 E2E、屏幕阅读器；全套周视觉验收留 C36。
