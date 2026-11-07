# C45 全链路 Debug 与交付前检查 · 示例

## 当前 Lab 主线

- 发行版 `2026.10-v2.5`，C44→C45，工作区 `labs/inventory` / `src/react`；主独立跟做、最终补验与发布状态见 [阶段C](../../labs/records/C.md)。
- 在自己的工作区执行 `npm run lab -- start C45`、`dev`、`check C45`（后两项同样接在 `npm run lab --` 后）。start只选择任务，不复制答案。排错记录写自己的 `notes/debug.md`。
- 作者回归：根目录 `LAB_DELIVERY_PORT=19102 node scripts/verify-delivery-lab.mjs`，真实C44装配后逐课追加；这是自动组装/源码行为回归，不是独立读者跟做。
- 新增 `delivery-predictions.js` 对应当前正文的嵌套URL/浅复制预测；其余三个Node文件保留为第一版参考，不再是必做入口。
- 2026-10-29 · macOS arm64 · Node 24.22.0/npm 11.19.1 · Chromium 156.0.8078.4：当前文件85条核心断言及4组独立浏览器场景通过；P001绕过dispatch时界面12（期望13），恢复后13/53。
- 当前P004取消3/52、空白拒绝、Enter保存8/57且P001仍12；刷新、详情模拟失败/重试、坏导入原文与备份恢复通过。浏览器新context，不清理学员现有存储。
- `npm run examples -- c45` 4/4。正文图形DevTools断点、Performance/Memory人工分析未执行并就近标注；CDP诊断与其人工解释分别记录，不沿用下方旧源码的通过证据。
- 新源码CDP实际证据：三轮分类往返，正确版keydown监听器/heap中onKey closure均1→1，漏清理均3→9，恢复后1→1；报表首次模块请求1次、再次展开总数仍1。最终本机TaskDuration约0.0566s/0.0219s，不设性能阈值；完整命令和限制见第1路delivery/report.md。
- 未运行：真实手机/软键盘、屏幕阅读器、Firefox/Safari、Windows；发布/线上由主 agent 验收。

## 2026.11-v4.0：接上本地后端

上面 2026-10-29 的记录属于浏览器内 mock 时期（2026.10-v2.5），不能当作下面新内容的证据。

- 正文改动：页首运行环境加「本地后端」；开头改为两个终端（`npm run lab -- api` + `dev`），每次实验前「恢复固定数据」或 `npm run lab -- api reset`，替代 baseline.json；第 3 节存储实验改在 `VITE_DATA_SOURCE=mock` 模式；第 1 节表格加 `/api` 4xx/5xx 一行、「模拟详情失败」走后端注入、CORS 一段；第 2 节证据加 api 终端；第 3 节加后端坏数据文件一句；第 4 节预览保持 api 运行、断点改在 `api-repository.js`；常见错误、练习、项目进度、小结与自测随之调整。标题、锚点、主错误与 13/53、8/57 等数字未变。
- 2026-11-07 · macOS 26.3.1 arm64 · Node 24.22.0 / npm 11.19.1：在 `labs/inventory` 用 `LAB_API_PORT=8270 LAB_API_DATA=/tmp/l5docs-api.json` 实际运行 `npm run lab -- api`、`api reset`（在线与离线两种）、坏数据文件拒绝启动（退出码 1）与另存 `.damaged-…`、端口占用提示、Ctrl+C 的「库存后端已停止。」，以及 `startApiServer` 上的 CORS（默认无头、配置来源后放行、预检）、故障注入（500、422 自定义 body、1500ms 延迟）和客户端断开时的 `- … 注入故障 客户端已断开` 日志行。正文与 L5 页、L5 后端接口页里的后端响应和终端行来自这些运行，端口和数据路径换成默认的 8070 与 `.lab/server/products.json`。
- 前端行为按 `v4-l5app` 分支 `af357e9` 的 C45 参考源码核对：`ApiError` 消息「HTTP 状态：message」、`list()` 请求 `?page=1&pageSize=50`、保存时 App 传 `delay: 300`（每次保存先 `POST /api/_lab/faults`）、「数据源：…」、「恢复固定数据」、422 字段映射与 409 冲突提示。
- 2026-11-07 同一环境，参考实现实跑：在 /tmp 用 `v4-l5app` `4818e74` 的 `labs/snapshots.mjs` 拼出 C44 起点（`node_modules` 链接到本分支 `labs/inventory/node_modules`，没有安装依赖），复制 `labs/reference/steps/C45`（与 `af357e9` 相同）后运行 `LAB_DELIVERY_PORT=8276 LAB_E2E_PORT=8277 node tools/lab.mjs check C45`：7 组浏览器检查通过（state、editor、fields、retry、slow、storage、cors），85 条工作文件检查通过。cors 一组断言页面「读取失败：Failed to fetch」与 Console 的 CORS 报错，retry 一组断言「读取失败：HTTP 500：注入的故障：500」与「重新读取」，分别是 L5 场景 1 直连 8070 时的故障现象和场景 4 修好后的现象。
- 未运行：L5 场景 2–5 改坏代码后的页面现象（含 (canceled)）、source map 断点等 DevTools 手工步骤，正文对应位置已标注。L5 后端接口页「常见失败」里 Vite 代理 502 与缺代理 404 两行来自读 Vite 源码，未实际运行（见 C46 记录）。

## 第一版参考（非 Lab 主线）

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| paths.js | `node paths.js` | 域名根、应用 base 和商品 URL |
| identity.js | `node identity.js` | 新数组、新商品、未修改项共享与旧库存 |
| recovery.js | `node recovery.js` | 坏 JSON 恢复 52、保留合法 0 与原文 |
| ../inventory/04-react/labs/delivery.html | 本地 React | 资源、请求、状态、布局、存储、监听器实验 |

## 运行

- 仓库根执行 `npm run examples -- c45`，三个固定输出自动核对。
- 在 examples/inventory/04-react 执行 `npm ci`、`npm run dev -- --host 127.0.0.1`；打开 `/js_web/labs/delivery.html?case=asset`，端口以终端输出为准。
- case 可选 asset / asset-answer、request / request-answer、html-response、state / state-answer、overflow / overflow-answer、storage、memory / memory-answer。
- 正确回归：阶段目录 `npm test -- tests/delivery.test.jsx`；完整 `npm run lint`、`npm test`、`npm run test:e2e:delivery`、`npm run test:e2e`。
- 开发浏览器回归使用已安装的 Chrome 独立后台实例；生产 E2E 沿用 C35 安装的 Chromium，不操作用户窗口。两条命令按顺序运行。
- 生产源码断点：阶段目录 `npm run build`，再 `npm run preview -- --host 127.0.0.1 --port 8145 --strictPort`；打开 `/js_web/`。labs 不进入生产构建。
- 存储实验只操作 js_web:c45:products:v1；正式商品快照键仍为 js_web:inventory:products:v1。清除实验键不会改变正式快照。

## 排错记录：资源 URL 缺少应用 base

- 入口与初始条件：开发服务 `/js_web/labs/delivery.html?case=asset`，无缓存；预期出现库存标识。
- 复现与实际：刷新后图片损坏；Network 的 /media/inventory.svg 返回 404，对照 img 的 src 可见遗漏了应用目录。
- 根因：以 / 开头的 URL 从域名根解析，跳过应用的 /js_web/。
- 修复：img.src 使用 import.meta.env.BASE_URL 加 media/inventory.svg；asset-answer 保留完整版本。
- 验证：正确资源返回 200、naturalWidth=96；再打开错误入口仍可复现 404。正文练习 3 可依此结构保存自己的记录。

## 第一版验证记录（历史，非本轮源码证据）

- 2026-10-19 · macOS arm64 · Node 24.22.0 / npm 11.19.1：固定输出 3/3；阶段 4 Hooks lint、195/195 业务回归和生产构建通过。新增 5 条回归覆盖可见状态更新、base/编号/signal、HTTP 503、200 HTML 与卸载清理。
- Playwright 1.64.1 / 独立后台 Chrome 155.0.8059.82：开发实验 3/3 通过。资源 404、JSON Accept 请求 404、默认 Accept 的 200 HTML 解析失败分别复现；离线失败与恢复重试通过。
- 状态错误入口点一次仍为 12，正确版立即为 13；360px 错误面板横向溢出、正确版无溢出且按钮可获焦点。坏 JSON 恢复库存 52、P002=0，原文保留，按键清除成功。
- 监听器三次开启/关闭后，DOM 中均无探针；错误版 window 剩余 3 个 c45-stock-probe 监听器，答案版 0 个。实际 GC 与堆快照中 updateProbe 闭包分别为 3/0；保留链可从 Window 经 EventTargetData、RegisteredEventListener、V8EventListener 到 updateProbe，闭包引用节点。
- 生产 index-Tg2Az7Ox.js.map HTTP 200，映射回 src/product-state.js 第 2 行；断点实停，参数 P002/stock=0，继续后库存为 1、总库存 53。生产 E2E 2/2 通过，覆盖筛选/详情/刷新/返回、快照损坏/清除与新增本地详情。
- C34 同规模性能实验中输入一个备注字符：React Profiler actualDuration 本次约 78.6ms → 0.2ms；Chrome CPU profile 的 SlowRow/demonstrationCost 热点采样 35 → 0。为本次实验观察，不是固定性能门槛。
- 正常生产应用 360px/1280px 无页面横向溢出；库存留空提交后聚焦该字段，aria-invalid=true，说明关联 edit-P002-stock-error；合法 0 可由键盘保存。页面截图已留作本地检查。
- 另按正文模拟 1500ms 网络延迟，加载提示持续到成功；Tab 顺序经过分类/库存/价格/热销/保存，保存按钮的焦点轮廓为 3px，Enter 提交通过。
- 站点课程 lint 45 课零 error/warning、Astro check 零诊断、build 与全量固定输出 289/289 通过，52 个 HTML 产物路径检查通过。
- 新文章本地 HTTP 200，六个提示/答案折叠区、C44 上一页、路线 45/48 和禁用 JS 阅读通过；桌面截图已检查。
- Pages [run 39184048121](https://github.com/socoo123/js_web/actions/runs/39184048121) 成功；新文章与路线页均 HTTP 200，六个折叠区存在，路线为 45/48。
- 未运行：DevTools/React DevTools 面板内的人工点击、真实触摸设备、虚拟键盘、屏幕阅读器、Firefox/Safari 与 Windows。面板路径据官方文档核对，源码暂停、堆快照、CPU profile、DOM 与事件通过独立 Chrome 检查。
