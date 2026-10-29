# C29 useEffect 深入与清理 · 示例

正文：[C29](../../src/content/docs/05-react/c29-effects-cleanup.mdx)。主线继续同一 `inventory/`，发行版 `2026.10-v2.3`，C28→C29；真实C28已接回，最终checker已通过。主集成16快照、独立抽验及发布见 [阶段 A](../../labs/records/A.md)，旧阶段4仅作历史参考。

| 入口 | 命令 / 说明 |
| --- | --- |
| cleanup-closure.js、deps-identity.js、prediction.js | 根目录 `npm run examples -- c29`，机制参考 |
| 当前工作区 | `npm run lab -- start C29`、`npm run lab -- dev`、`npm run lab -- check C29` |
| 实际组件 | 工作区 `node node_modules/vitest/vitest.mjs run --configLoader runner --config tools/effect.config.mjs` |
| 实际浏览器 | 工作区 `node tools/browser-a3.mjs C29` |

## 当前验证记录

- 最终checker验收：39个主仓库tools完整只读镜像、12个本路工具无回退，最新C21–32重建后完整 `node tools/check.mjs C29` exit0：85条实际文件断言、Vitest 7/7、共享5组隔离浏览器及本路browser均通过，src/data未改写。日志 `delivery/evidence/final-checker/C29.log`；汇总 `delivery/final-checker-acceptance.md`。未重复红绿。
- 旧H3兼容补验：清单9/9覆盖，MDX AST确认21个正文ID无重复（代码围栏不计）；锚点均在本轮预检修改后继续保留。
- 本轮接回最新C28同步保存预检：导入validateProducts，dispatch前用只读next候选执行validateProducts+summarize；C29 App去掉Hook导入/调用两行后与主仓库最新C28逐字节相同。
- 实际App溢出专项 `node node_modules/vitest/vitest.mjs run --configLoader runner --config tools/save-overflow-a3.config.mjs` 2/2通过。修前同两项2 failed，真实Chromium编辑/新建均main=0/form=0；修后2项及定点浏览器通过，草稿/原商品/52/2634800保留、修正重试成功。记录 `delivery/evidence/save-overflow/C29-{red,green}-{unit,browser}.txt`；测试仅限C29–31，不接后段Action。
- 最新C28起点按公开正文连续作者拼接：原组件5/5+溢出2/2、Hooks lint与完整源码对照通过；跳过无关旧浏览器。课程临时镜像48课lint零error/warning，C29为4672字符/9块。当前修复交稿见 `delivery/agent-3-overflow.md`。

- 2026-10-29 · macOS arm64 · Node 24.22.0、React 19.3.1、Vitest 5.0.5、happy-dom 21.0.4、Chromium 156.0.8078.4。
- 真实C21–28 steps按授权逐字节导入；重建C28 src/data共25个文件与handoff-C28相同，见 `delivery/evidence/real-C28-import.json`。
- C29只改Hook+App，删除旧300ms StockActions覆盖；StockActions/ProductEditor均原样继承真实C28，没有重复Effect。
- 固定输出3/3；实际组件5/5：StrictMode一键一次、回调更换/卸载/重挂载、repeat保护、卸载timer；另保护noValidate/autoFocus/错误关联/首错name→stock→price→category和2000ms计时。
- 前次完整浏览器记录（本轮只重跑溢出向量）：12→15/16、两秒取消/筛掉行后无晚补货；取消回编辑按钮、按钮筛除后回h1、保存改名移出筛选回h1；标题/快捷键通过，360px页面异常0。每个独立向量使用新context。
- 主错误在真实链副本删除键盘cleanup，原用例exit1；恢复原字节exit0，见 `delivery/evidence/C29-main-{red,green}.txt`。
- `C29-final.txt`含最终专用测试/lint/browser原命令。`real-prose-assembly.txt`从真实C28起点按正文重建C29–32并运行后才对照终态；这是作者自审，不是主agent独立跟做。
- 同basename MDX+LessonTask、原md删除；12个旧H2保留。临时catalog镜像48课lint零error/warning，见 `round2-{anchors,lesson-lint}.txt`（后续真实衔接已重跑）。
- 首轮旧上游结果不挪作最终证据；本次完整checker已重跑通过。全站build/视觉/冻结/Pages及独立读者验收由主agent完成，汇总写入 [阶段A记录](../../labs/records/A.md)。
- 未运行：完整DevTools手点、Firefox/Safari、Windows、屏幕阅读器；本路未提交、推送、部署。
