# C12 从回调到 Promise：执行顺序 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| callback-api.js / mock-api.js | 由其他文件导入 | 固定数据的回调 API 与 Promise 包装，无 HTTP 请求 |
| sync-callback.js / callback-return.js | `node 文件名.js` | 同步 map 与异步回调的返回值 |
| order.js / order.html | Node / 本地网页 | 执行器、任务、微任务与断点顺序 |
| settlement.js | `node settlement.js` | 首次交付、状态不变与执行器继续 |
| callback-nested.js / chain.js | `node 文件名.js` | 嵌套回调与返回 Promise 的平坦链 |
| chain-values.js | `node chain-values.js` | then 返回新 Promise，普通值与 undefined |
| errors.js / finally.js | `node 文件名.js` | 抛错、恢复、finally 透传失败 |
| missing-return-broken.js / missing-return-fixed.js | Node / 对应 HTML | 漏 return 提前继续，修复后等待读取 |
| swallow-broken.js / swallow-fixed.js | Node / swallow.html、swallow-fixed.html | catch 日志恢复为 undefined，重新抛错继续传播 |
| prediction.js | `node prediction.js` | 练习 1：任务内部注册的微任务 |
| recovery-answer.js | `node recovery-answer.js` | 练习 2：数量降级为 0，finally 关闭加载 |
| rendering.html / rendering.js | 本地网页 | DOM 更新、短暂主线程忙等与画面更新 |
| project-check.js | `node project-check.js` | 阶段 1 异步加载与第一周业务参考值 |
| ../inventory/01-core/demo.js | `node demo.js`（在该目录） | 完整第一周报告与异步成功、编辑隔离、失败、收尾 |

## 运行

- 在本目录执行上表 Node 命令；仓库根目录 `npm run examples -- c12` 核对 16 份固定输出。
- 根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c12/`。
- HTML 页把日志同步写入页面和 Console；错误与修复版各有入口。
- Promise 教学脚本使用静态数据与定时器，等待时长只作模拟。

## 验证记录

- 2026-10-16 · Node 24.22.0 / npm 11.19.1 · macOS arm64：本课固定输出 16/16；全量 141/141；astro check 零诊断，lint 零 error/warning，build 与生产输出检查通过。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：
  - 15 个教学脚本逐个运行，输出与 Node 固定输出一致。
  - order.html 断点依次命中同步结束、Promise 回调、定时器回调；后两者活动栈不含原始脚本调用，能追踪异步来源。
  - 漏 return 的下一步断点中 stock 为 undefined，尚无读取日志；修复版 stock 为数字 0。
  - 吞错版成功处理器收到 undefined；重新抛错后只执行末尾错误处理。
  - rendering.html 同步和微任务均读到加载中，随后完成；约 300ms 忙等推迟了后续定时器，无脚本异常。
  - 练习 2 失败时降级数量 0 并关闭加载，成功时数量 6 且无错误日志。
- 第一周周验收：C01–C12 与首页/路线页共 56 组宽度和主题组合无横向溢出；9 张 D2 图在两种宽度均加载，中文正常；4 个答案折叠、代码复制、闭包/原型/微任务搜索和实际搜索框通过；禁用 JS 后 C03/C12 正文与原生折叠可读，无资源或脚本错误。
- 阶段 1：核对 6 种、52 件、2634800 分、分类计数、售罄/低库存 id 和标签；加载副本及其 tags、撤销历史隔离，空数据、模拟失败、构造与复制异常均通过。
- 同日：[Pages Actions 38915791749](https://github.com/socoo123/js_web/actions/runs/38915791749) 成功；新课与路线页返回 200，HTML 与本地构建逐字节一致；新增 D2 SVG 与搜索模块均返回 200。
- 未运行：在 DevTools 界面上手动点击的路径、Firefox、Safari、真实手机；面板路径按 Chrome 官方文档核对。

## V2 连续工作区

2026-10-28 · 发行版 2026.10-v2.2：本课在 `labs/inventory/` 持续修改，`npm run lab -- check C12` 检查实际文件。C00→C20 的单目录正文跟做、错误证据与修复见 [R5 验证](../../labs/records/R5.md)。Java 完整源文件在 labs/reference/java，已用 Java 21.0.2 执行；旧例子保留为可选参考。网站使用原 URL 与 F1 课号。
