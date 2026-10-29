# C31 自定义 Hooks 与路由 · 示例

正文：[C31](../../src/content/docs/05-react/c31-custom-hooks-routing.mdx)。同一 `inventory/`，发行版 `2026.10-v2.3`，C30→C31；主集成与发布见 [阶段 A](../../labs/records/A.md)。主 agent 从独立完成的C30继续本课，真实npm ci后完整check通过，漏productId依赖的lint/请求回归红→绿。旧阶段4只作参考。

| 入口 | 命令 / 说明 |
| --- | --- |
| url-parts.js、catalog-params.js、storage-recovery.js、prediction.js | 根目录 `npm run examples -- c31`，4个机制参考 |
| 当前工作区 | `npm run lab -- start C31`、`npm run lab -- dev`、`npm run lab -- check C31` |
| 实际组件 | 工作区 `node node_modules/vitest/vitest.mjs run --configLoader runner --config tools/request.config.mjs` |
| 浏览器/严格静态hash | 工作区 `node tools/browser-a3.mjs C31` |

## 当前验证记录

- 最终checker验收：39 tools完整只读镜像、本路12专用工具无回退；最新C21–32重建后完整 `node tools/check.mjs C31` exit0：85条实际文件断言、Vitest 15/15、共享5组隔离浏览器及本路browser/严格静态hash通过，src/data未改写。日志 `delivery/evidence/final-checker/C31.log`；未重复红绿，汇总 `delivery/final-checker-acceptance.md`。
- 旧H3兼容补验：清单5/5覆盖，MDX AST确认17个正文ID无重复（代码围栏不计）；本轮预检修改后继续保留。
- 本轮接回validateProducts导入和saveProduct的只读next全量预检；错误同步留在ProductEditor，未新增state。实际App专项 `node node_modules/vitest/vitest.mjs run --configLoader runner --config tools/save-overflow-a3.config.mjs` 修前2 failed、修后2/2；Chromium修前编辑/新建main=0/form=0，修后错误/草稿/原商品/52/2634800保留且修正可保存，见 `delivery/evidence/save-overflow/C31-{red,green}-{unit,browser}.txt`。
- 最新C28按正文连续作者拼接：原组件10/10+溢出2/2、Hooks lint与完整源码对照通过，跳过无关旧浏览器；临时catalog镜像48课lint零error/warning，C31为4790字符/12块。专项仅限C29–31；交稿 `delivery/agent-3-overflow.md`。

- 2026-10-29 · macOS arm64 · Node 24.22.0、React 19.3.1、React Router 8.4.0、Vitest 5.0.5、happy-dom 21.0.4、Chromium 156.0.8078.4。
- 当前链来自真实handoff-C28；StockActions/ProductEditor逐字节继承，App保留标题ref回退/可见性预判/onCancel包装。
- 固定输出4/4；实际组件10/10：请求5条、快照与storage可选key兼容3条、真实C28表单/2000ms边界2条。快照仅显式保存，不自动双写。
- 主错误在当前useProductRequest删productId依赖，原回归exit1；恢复原字节exit0，日志 `delivery/evidence/C31-main-{red,green}.txt`。
- 前次完整浏览器记录（本轮只重跑溢出向量）：P004保存8/快照刷新、hash分享/返回/后退/未知ID/未知路径/非法枚举/坏导入通过；详情仍读静态起始数据，和reducer修改区分。
- 实际生产build挂无fallback `/js_web/demos/inventory/`，P004 hash打开/刷新通过；history路径products/P004明确404。未发布在线演示。
- 真实C28保留向量：12→15/16、两秒取消/卸载、noValidate/autoFocus、取消返按钮与筛除后返标题、保存改名出筛选返标题；360px页面异常0。
- 假时钟的筛除向量先等待URL导航提交并确认行卸载，再推进2300ms；不把“发起导航”当成组件已经卸载。
- 原命令 `C31-final.txt`；按正文从真实C28连续重建后再完整对照终态的作者自审 `real-prose-assembly.txt`。非主agent独立读者跟做。
- MDX+LessonTask、原md删除、12个旧H2保留；临时catalog镜像48课lint零error/warning，Hooks lint通过。
- 最终checker本路已验收通过；主独立跟做、全站门禁与冻结/Pages证据见 [阶段A记录](../../labs/records/A.md)。
- 未运行：完整DevTools手点、Firefox/Safari、Windows、屏幕阅读器；本路未提交、推送、部署。
