# C36 React 项目复盘与故障排查 · 示例

配套正文：[C36](../../src/content/docs/05-react/c36-react-project-debugging.md)；附 [React Hooks 速查](../../src/content/docs/reference/react-hooks.md)。沿用固定商品数据，无新依赖和 D2。

| 文件 | 运行 | 结果 |
| --- | --- | --- |
| sources.js | `node sources.js` | 旧/新鼠标 0/1，总库存 52/53，目标换身份、其他记录共享 |
| keys.js | `node keys.js` | 真实 QueryClient 的 P002 未命中，P001 库存 12 |
| recovery.js | `node recovery.js` | 合法 0 保留，坏 JSON 回退 52 并提示 |

## 运行

- 仓库根运行 `npm run examples -- c36`，三个固定输出自动核对。keys.js 需要阶段 4 已执行 npm ci。
- 在 `examples/inventory/04-react` 运行 `npm ci`；`npm run dev -- --host 127.0.0.1` 后打开 `/js_web/labs/review.html?case=summary / query / storage`，对应答案在 case 后加 -answer。
- `npm run test:bug -- labs/review-bugs.test.jsx` 原始三项失败；按正文修改三个 Review…Broken 文件、保留原导出名后同命令通过。仓库保留教学错误起点。
- 正确回归：`npm test -- tests/review.test.jsx`；全量 `npm run lint`、`npm test`、`npm run build`，生产冒烟 `npm run test:e2e`（先按 C35 安装 Chromium）。
- source maps：生产预览在 product-state.js 的 restockProduct 更新处暂停，检查 P002 与输入库存 0，继续后为 1；map 与当前构建文件配套。
- 商品快照键 js_web:inventory:products:v1，存储实验键 js_web:c36:broken:v1。手动保存当前商品供刷新恢复；清除只删快照，当前商品保留，刷新回初始。没有自动保存与跨标签同步。

## 文件与边界

- inventory-storage.js：version=1、商品字段/重复 id 校验、合法 0/空数组、失败恢复与原记录保留；写入/清除异常在 Provider 的事件里处理，初始化不写盘。
- ProductDetailRoute 上部读本地 Context，下部保留初始六种商品的 Query/Action mock；新增商品只显示本地详情，不读不存在的 JSON。
- review.test.jsx 新增 19 条：三个故障正确行为、快照恢复/清除/读写受限、本地详情、九组非法副本和合法边界；正常回归共 190 条。
- review-bugs.test.jsx 三条测试分别针对统计、键与读取恢复；review-main.jsx 只在 dev 的实验 HTML 使用。正常 build 仍只构建首页。
- E2E 追加保存/刷新/损坏/清除/新增详情路径，保留 C35 的跨页路径，共 2 条；本阶段应用未发布到课程 Pages。

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0 / npm 11.19.1：固定输出 3/3、全站 263/263；阶段 4 lint、190/190 回归与生产构建通过；Playwright 1.64.1 / Chromium 156.0.8078.4 的两条 E2E 通过。
- 同日：三个错误起点分别缺少统计 53、没有 P002 调用、JSON.parse 抛 SyntaxError；换成正文答案逻辑后同命令 3/3 通过，随后恢复错误文件。
- 同日 · 独立后台 Chrome 155.0.8059.82：六个故障/答案页面运行；检查组件 props/state 得到鼠标 1/统计 52；错误查询 prop=P002、详情=P001 且无 P002 GET，答案发出 P002 GET；坏 JSON 暂停时 raw="{"，正确页保留原文并恢复 52。
- 同日：生产 map HTTP 200，实际暂停位置回映到 src/product-state.js 第 2 行，参数为 P002/输入库存 0，继续后为 1。重做 C34 Profiler API 的同规模实验：一次备注更新 actualDuration 约 77.2ms → 0.3ms，仅是本次实验观察。
- Q3：P007 保存为随身转接头/配件/3 件/29 分，合计 55 件/26348.87 元；空库存阻止并聚焦、合法 0 可保存；快照刷新及 P007 详情恢复，无 P007 JSON 请求；清除刷新回 6 种/52 件/26348.00 元。
- Astro check、课程 lint（C36 正文 7893 字符、11 代码块、零 error/warning）、build 与 42 页产物检查通过。
- Q3 周验收：41 个可阅读页面共 164 组 1280/360px × 亮/暗检查通过；13 张 D2 中文截图、六个折叠区与代码复制通过；「竞态/乐观/故障」搜索及搜索 UI 通过，41 页禁用 JS 可读，无失败资源。新速查页改成两列保持手机 API 名称完整。
- 线上：待本次 Pages 部署核验。
- 未运行：React DevTools 面板的手动点击（路径按官方文档核对；props/state 与 Profiler 数据通过独立浏览器读取）、Firefox、Safari、Windows、屏幕阅读器。
