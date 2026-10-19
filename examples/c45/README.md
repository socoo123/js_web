# C45 全链路 Debug 与交付前检查 · 示例

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
- 复现与实际：刷新后图片损坏；Network 的 /media/inventory.svg 返回 404，Initiator 指向 img。
- 根因：以 / 开头的 URL 从域名根解析，跳过应用的 /js_web/。
- 修复：img.src 使用 import.meta.env.BASE_URL 加 media/inventory.svg；asset-answer 保留完整版本。
- 验证：正确资源返回 200、naturalWidth=96；再打开错误入口仍可复现 404。正文练习 3 可依此结构保存自己的记录。

## 验证记录

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
- 未运行：DevTools/React DevTools 面板内的人工点击、真实触摸设备、虚拟键盘、屏幕阅读器、Firefox/Safari 与 Windows。面板路径据官方文档核对，源码暂停、堆快照、CPU profile、DOM 与事件通过独立 Chrome 检查。
