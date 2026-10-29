# C30 请求状态与竞态调试 · 示例

正文：[C30](../../src/content/docs/05-react/c30-requests-races.mdx)。同一 `inventory/`，发行版 `2026.10-v2.3`，C29→C30；主集成与发布见 [阶段 A](../../labs/records/A.md)。主 agent 从公开C29只按正文完成本课，完整check及竞态故障红→绿通过；旧阶段4保留为参考。

| 入口 | 命令 / 说明 |
| --- | --- |
| http-errors.js、race-order.js、abort-signal.js、prediction.js | 根目录 `npm run examples -- c30`，4个机制参考 |
| 当前工作区 | `npm run lab -- start C30`、`npm run lab -- dev`、`npm run lab -- check C30` |
| 实际组件 | 工作区 `node node_modules/vitest/vitest.mjs run --configLoader runner --config tools/request.config.mjs` |
| 实际浏览器 | 工作区 `node tools/browser-a3.mjs C30` |

## 当前验证记录

- 最终checker验收：主仓库39 tools完整只读镜像，本路12专用工具无回退；最新C21–32重建后完整 `node tools/check.mjs C30` exit0：85条实际文件断言、Vitest 12/12、共享5组隔离浏览器及本路browser通过，src/data未改写。日志 `delivery/evidence/final-checker/C30.log`，无重复红绿。正文已更正：模拟失败保持勾选时重试仍失败，取消勾选才重新读取并恢复。
- 旧H3兼容补验：清单5/5覆盖，MDX AST确认18个正文ID无重复（代码围栏不计）；本轮预检修改后继续保留。
- 本轮导入validateProducts并接回只读next候选的全量同步预检；不变更请求/计时/焦点接口。实际App专项 `node node_modules/vitest/vitest.mjs run --configLoader runner --config tools/save-overflow-a3.config.mjs` 修前2 failed、修后2/2；真实Chromium修前编辑/新建main=0/form=0，修后表单/草稿/原商品/52/2634800保留且修正可重试，见 `delivery/evidence/save-overflow/C30-{red,green}-{unit,browser}.txt`。
- 最新C28按正文连续作者拼接：原组件7/7+溢出2/2、Hooks lint和完整源码对照通过，跳过无关旧浏览器；临时catalog镜像48课lint零error/warning，C30为4319字符/9块。专项仅限C29–31，不用于后段Action；交稿 `delivery/agent-3-overflow.md`。

- 2026-10-29 · macOS arm64 · Node 24.22.0、React 19.3.1、Vitest 5.0.5、happy-dom 21.0.4、Chromium 156.0.8078.4。
- 基线为主agent实际handoff-C28；依赖导入哈希见 `delivery/evidence/real-C28-import.json`，不是首轮继承夹具。
- 固定输出4/4；当前组件7/7：请求5条覆盖晚成功/晚失败、旧完成时新pending、A→B→A、新signal、重试、卸载和实例独立；另2条保护真实C28表单首错/2000ms边界。
- 主错误去成功ignore守卫，忽略signal的旧P001结果触发exit1；恢复exit0。额外注入旧finally无条件写状态，同一pending向量exit1→恢复exit0，日志 `C30-{main,finally}-{red,green}.txt`。
- 前次完整浏览器记录（本轮只重跑溢出向量）：P001文件返回后选P002最终鼠标0；模拟失败/恢复/关闭通过。300/30ms处理延迟在HTTP读取后，不当成Network Timing；与两秒补货计时器区分。
- 同时验证12→15/16、两秒取消/卸载、不倒退表单、普通取消与筛除后的标题回退、保存改名出筛选回标题；360px页面异常0。
- 原命令在 `delivery/evidence/C30-final.txt`；从真实C28按正文连续重建后才完整对照源码的作者自审在 `real-prose-assembly.txt`。非主agent独立读者验收。
- MDX+LessonTask、原md删除、13个旧H2保留；临时catalog镜像课程lint零error/warning，Hooks lint通过。
- 最终共享checker本路已验收通过；主独立跟做/全站门禁/冻结/Pages仍由主流程完成，汇总由主agent写 [阶段A记录](../../labs/records/A.md)。
- 未运行：完整DevTools手点、Firefox/Safari、Windows、屏幕阅读器；本路未提交、推送、部署。
