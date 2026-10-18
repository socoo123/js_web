# C30 请求状态与竞态调试 · 示例

配套正文：[C30](../../src/content/docs/05-react/c30-requests-races.md)。普通 JS 在本目录，真实 React 在[阶段 4](../inventory/04-react/)，商品沿用固定数据。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| http-errors.js | node http-errors.js | Response 模拟 HTTP 已兑现，检查 ok 与 JSON 解析错误 |
| race-order.js | node race-order.js | 手动控制 Promise 完成顺序；普通 JS，不运行 React |
| abort-signal.js | node abort-signal.js | data URL 验证已取消 signal 无法复用 |
| prediction.js | node prediction.js | 不同调用的 ignore 独立，闭包各自保留归属 |
| 阶段 4 src/ProductDetails.jsx、RequestView.jsx | dev / 首页 | 五种请求状态、失效、取消与重试 |
| 阶段 4 src/product-api.js、read-product.js | dev / 首页 | Pages 子路径、HTTP / JSON / 字段检查 |
| 阶段 4 src/InventoryDetails.jsx、public/data/products | dev / 首页 | 六件商品只读初始快照，与本地编辑分开 |
| 阶段 4 labs/requests-main.jsx | 下表实验页 | 八个请求与竞态实验，仅 dev 提供 |
| 阶段 4 tests/requests.test.jsx | npm test | 十三项新增正常回归 |
| 阶段 4 labs/requests-bugs.test.jsx | npm run test:bug -- labs/requests-bugs.test.jsx | 三项故意失败，改用完整修复实现后通过 |

## 运行

- 根目录执行 `npm run examples -- c30`；本目录也可逐个执行 node 命令。
- 阶段 4 执行 `npm ci`、`npm run dev -- --host 127.0.0.1`，打开终端给出的 /js_web/ 地址。
- 实验路径 labs/requests.html?case=下表值；每换实验重新打开对应地址。
- 阶段 4 执行 `npm run lint`、`npm test`、`npm run build`；`npm run preview -- --host 127.0.0.1` 检查生产首页与静态 JSON。

| case | 操作与预期 |
| --- | --- |
| race | 看到 P001 收到文件后选 P002，200ms 的 P002 先显示，1200ms 的 P001 随后错误覆盖 |
| abort-only | 相同步骤，只取消 fetch 仍拦不住已开始的后续处理 |
| answer | 相同步骤，旧结果不能覆盖 P002；取消立即结束 loading，晚返回不更新，重新加载成功 |
| finally | 等初始完成，P002 开始处理后立刻切 P001；旧 finally 提前结束新 loading |
| finally-answer | 相同步骤，保持 P001 加载中直到自己完成 |
| http | 请求不存在的 P999.json，真实 HTTP 404，重试仍失败 |
| invalid | HTTP 200 的 txt 含损坏 JSON，进入 error |
| network | 无人工延时；Network 慢网取消 / Offline 失败 / 恢复后重试成功 |

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0、npm 11.19.1；沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3。无新增项目依赖或锁文件。
- 固定输出 4/4；阶段 4 正常 lint、110/110 回归与生产构建通过，本课新增 13 条；覆盖晚成功/晚失败、同 id 的 A→B→A、取消/重试、新 signal、卸载/重挂载、StrictMode 首次失效、idle、HTTP/解析/字段错误及子路径。
- 三项 bug 回归先分别报 P002 被 P001 覆盖、abort 后仍被 P001 覆盖、旧 finally 提前结束 loading；将三个 Broken 默认导出接到 ProductDetails 后，原命令 3/3 通过，之后恢复教学错误起点。
- 独立后台 Chrome 155.0.8059.82：race、abort-only、answer、finally、finally-answer、http、invalid、network 按正文操作；未操作现有窗口。竞态延时位于读取文件后的 JS 处理，Network 传输与处理日志分别核对。
- Chrome 调试接口的真实暂停帧：旧 finally 执行时 productId=P002、ignore=true，而页面已选 P001；页面随即错误结束 loading。未手动点击 DevTools 面板。
- Network 调试接口禁用缓存，600ms 延时 / 有限带宽下取消 P002、最终加载 P001；Offline 使 P002 失败，恢复后重试成功。Vite 缺文件回退 HTML 的问题通过 Accept: application/json 修正，http 模式真实返回 404。
- 首页与生产预览通过：详情请求为 /js_web/data/products/P002.json，HTTP 200、初始库存 0；列表补货后总库存 53 / 价值 26477.00 元，详情仍标初始库存；清空恢复 idle，刷新恢复 52 / 26348.00。
- 网站 lint 30 课零 error/warning；check 零诊断；build 固定输出 239/239、35 页产物检查通过。正文 9861 字符、13 个代码块，全部与示例完整文件或连续片段一致。
- 生产 C30 HTTP 200，禁用 JS 后 13 段代码、六个折叠区和 D2 可阅读；目录 30/48、C30 链接正确。共用 D2 已检查中文、箭头与两栏时序，全站仍为 13 张图。
- Pages 待推送核验。
- 未运行：屏幕阅读器朗读、DevTools 界面手动点击、Firefox、Safari、Windows。
