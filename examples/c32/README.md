# C32 TanStack Query 与服务端状态 · 示例

正文：[C32](../../src/content/docs/05-react/c32-tanstack-query-server-state.mdx)。同一 `inventory/`，发行版 `2026.10-v2.3`，C31→C32；主集成、独立抽验与发布见 [阶段 A](../../labs/records/A.md)。业务数据由repository持有，Query负责列表和详情缓存。

| 入口 | 命令 / 说明 |
| --- | --- |
| cache-reads.js、keys.js、invalidation.js、retries.js、prediction.js、cache-isolation.js | 根目录 `npm run examples -- c32`，6个机制参考，不替代新Lab |
| 当前工作区 | `npm run lab -- start C32`、`npm run lab -- dev`、`npm run lab -- check C32` |
| 实际组件 | 工作区 `node node_modules/vitest/vitest.mjs run --configLoader runner --config tools/request.config.mjs` |
| 浏览器/严格静态hash | 工作区 `node tools/browser-a3.mjs C32` |

## 当前验证记录

- 主 agent 只按公开正文从独立C31迁移到C32；仅工具补丁修复连续缓存故障后，原业务源码完整check通过，缓存key漏id故障红→绿。完成后才对照参考终态，改动及观察记录见阶段 A。

- 最终checker验收：39 tools完整只读镜像、本路12专用工具无回退；最新C21–32重建后完整 `node tools/check.mjs C32` exit0：85条实际文件断言、Vitest 11/11、共享5组隔离浏览器及本路browser/严格静态hash通过，src/data未改写。日志 `delivery/evidence/final-checker/C32.log`；未重复红绿，汇总 `delivery/final-checker-acceptance.md`。
- 旧H3兼容补验：清单9/9覆盖，MDX AST确认21个正文ID无重复（代码围栏不计），本轮继续保留。
- 上游保存预检接回后，本课只补正文迁移说明：替换旧saveProduct时同步预检交给repository.commit，移除App不再使用的validateProducts导入。C32业务源码、repo校验/App异步catch和接口完全不变；从最新C28按正文重建后的组件8/8、Hooks lint/完整源码对照通过，未重跑C32完整浏览器。临时镜像课程lint零error/warning，C32为5522字符/15块。见 `delivery/agent-3-overflow.md`。

- 2026-10-29 · macOS arm64 · Node 24.22.0、React 19.3.1、TanStack Query 5.104.4、Vitest 5.0.5、happy-dom 21.0.4、Chromium 156.0.8078.4。
- 固定输出6/6；实际组件8/8：repository/Query/Provider六条覆盖Promise/克隆/并发补货/CRUD/校验/模拟与容量失败/取消/恢复/缓存隔离/去重/重试/精确失效；另两条保护真实C28表单和两秒计时契约。
- queryKey删id的当前源码红绿exit1→恢复exit0，见 `delivery/evidence/C32-main-{red,green}.txt`。
- repository唯一可写商品与持久化，products从Query派生；await dispatch(saved P004=8)后详情8、总库存57，P002 key未失效；导入按inventory前缀刷新。失败保持好数据。
- 原样继承真实C28 StockActions/ProductEditor；App保存前判staysVisible并捕获target，await成功后closeEditor(target)。浏览器验证正常返按钮、取消时按钮筛除返标题、异步保存改名出筛选返标题，不把事件当DOM。
- 浏览器另覆盖12→15/16、2000ms取消/卸载、P004保存/刷新、失败保留旧数据并重试、坏导入保护、hash/返回/未知ID/非法枚举；360px页面异常0。
- 实际生产build+无fallback `/js_web/demos/inventory/` hash详情/刷新通过，history路径404；未发布在线演示。
- 最终命令在 `C32-final.txt`；从真实C28起点按正文连续重建C29–32、执行后才完整对照终态见 `real-prose-assembly.txt`。这是作者自审，不是主agent独立跟做。
- 精确最终接口/文件表见 `delivery/final-C32-interface.md`；无dispatch接口分叉，无第二份products或旧请求Effect。
- MDX+LessonTask、原md删除、12个旧H2保留；临时catalog镜像48课lint零error/warning，Hooks lint通过。
- 最终共享checker本路已验收通过；主独立跟做、连续依赖缓存修复与全站门禁/冻结/Pages证据见 [阶段A记录](../../labs/records/A.md)。
- 未运行：真实后端/多用户、跨浏览器、Windows、屏幕阅读器；本路未提交、推送、部署。
