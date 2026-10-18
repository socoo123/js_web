# C34 性能、加载与错误诊断 · 示例

配套正文：[C34](../../src/content/docs/05-react/c34-performance-loading-errors.md)。React 实验复用阶段 4 的锁定依赖，没有新增包。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| identity.js | `node identity.js` | 数组、函数、对象的身份 |
| transition-order.js | `node transition-order.js` | 真实 startTransition 回调立即执行；不模拟渲染 |
| report.js | `node report.js` | 复用实际分类汇总函数与固定业务总值 |
| prediction.js | `node prediction.js` | 练习：哪个 prop 改变 |

## 运行

- 先在 `examples/inventory/04-react` 执行 `npm ci`。回到仓库根运行 `npm run examples -- c34`，固定输出 4/4。
- React：在阶段 4 执行 `npm run dev -- --host 127.0.0.1`，打开 `/js_web/labs/performance.html?case=` 后接下表参数。labs 只进入开发服务，生产入口仍是应用首页。
- 性能实验重复展示固定六件商品为 1200 行，每行增加纯计算；sample rowKey 只标识展示位置，不新增业务商品。

| case | 操作与预期 |
| --- | --- |
| before / memo / after | 备注输入前后对照；前两者重渲染列表，after 通常跳过；筛选鼠标仍为 200 行，选择 P002 与备注有效 |
| transition | 输入即时回显，pending 时保留旧结果，最终按最新条件显示；清空恢复 1200 行 |
| stale / stale-answer | P001 补货后前者价值停在 4788.00，后者 13 件为 5187.00、14 件为 5586.00 |
| lazy | 首次展开故意等 900ms 后加载报表，盘点可用，重新展开复用模块 |
| request | C30 Effect 请求套 Suspense，仍显示自己的加载、Offline 失败与重试状态 |
| render-error / chunk-error | 分别抛出模拟渲染/模块错误，只替换报表；边界重试不修复原因。切回 lazy 并刷新恢复 |

- 先失败后修复：`npm run lint:c34-bug` 与 `npm run test:bug -- labs/performance-bugs.test.jsx` 预期失败；给 StaleMemoBroken 补完整依赖后，同命令通过，仓库保留错误起点。
- 正常回归：`npm run lint`、`npm test`、`npm run build`。新增 tests/performance.test.jsx 的 9 条，累计 163 条；验证报表汇总/同步、草稿/计数保留、加载时机、错误隔离、lazy 拒绝缓存、普通请求状态及筛选行为，不断言固定耗时。
- 生产预览：`npm run preview -- --host 127.0.0.1`，打开 `/js_web/#/products`，首次展开才请求 InventoryReport chunk。P002 补货后报表外设 13 件、4917.00 元，草稿与盘点不因展开收起而重置。

## 验证记录

- 2026-10-18 · Node 24.22.0、npm 11.19.1、React 19.3.1 · macOS arm64：固定输出 4/4，正常回归 163/163，Hooks lint 与生产构建通过；新增 InventoryReport 独立 chunk，沿用既有依赖/锁。
- 同日 · Chrome 155.0.8059.82（独立 headless）：before、memo、after 相同备注输入各测 3 次。程序化 Profiler actualDuration 分别约 54–94ms、52–85ms、0.3ms；开发模式下的放大实验，数值不作为性能基准。
- 同日：观察到 Transition 输入“鼠”已回显、结果仍为全部 1200 行且 pending，随后“鼠标”完成为 200 行；切耳机、清空、筛选后选择及备注保留通过。
- 同日：stale 复现价值不变；修复版同步为 5187.00，连续补货 5586.00 有回归保护；错误起点的 lint/业务断言先失败，补依赖后同命令通过，随后恢复错误起点。
- 同日：lazy 等待时盘点可用，成功后表格出现，再展开复用模块；Effect 请求显示自身 loading，Offline 后失败，恢复并重试成功，未激活 Suspense fallback。
- 同日：render-error/chunk-error 只显示局部错误，兄弟盘点继续工作；重试仍显示错误，切回正常加载并刷新后恢复。
- 同日：Sources 对应断点处，StaleMemoBroken 的 product.stock 为 13、priceCents 为 39900，继续后价值仍 4788.00；lazy 拒绝分支首次命中一次，边界重试后仍只一次。
- 同日：生产真实报表 chunk 展开前未请求，首次延迟下载显示 fallback、再次展开无新请求；库存同步、草稿/盘点保留、Action 详情与深层刷新通过。阻断 chunk 真实请求后只显示局部错误，重试不重载，恢复请求并刷新后成功；360px 报表无溢出。
- 同日：网站 lint:lessons（34 课零 error/warning，C34 7951 字符、12 个代码块）、check（零诊断）、build（固定输出 257/257、39 页子路径/资源检查）通过；12 个正文代码块均与源文件片段一致。
- 同日：本地静态正文 HTTP 200，禁用 JS 后可阅读并展开 4 个练习折叠区；路线显示 34/48，正文链接正确。
- 同日：Pages [run 39101734918](https://github.com/socoo123/js_web/actions/runs/39101734918) 构建/部署成功；线上课程与路线均 HTTP 200，标题、4 个练习折叠区、未运行标注与 34/48 目录链接一致。
- 未运行：Profiler 扩展面板的手动录制与 Flamegraph/Ranked 操作（正文已标注；已执行的是 React Profiler API 的真实组件测量）、Firefox、Safari、Windows、生产专用 profiling 构建和 Compiler；未关闭 StrictMode。
