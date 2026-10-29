# C36 React 项目复盘与故障排查 · 示例

正文：[C36](../../src/content/docs/05-react/c36-react-project-debugging.mdx)。主线继续 C35 同一个应用；收尾见 [L3](../../src/content/docs/labs/l3.mdx)。

## Lab 入口

- 目标发行版 `2026.10-v2.3`：C35 → C36；阶段起点直接用该版 C20 包。
- 新文件：`notes/react-review.md`、`tests/react/review.test.jsx`；三个故障只在当前应用文件演练，随后恢复。
- 工作区 `npm run lab -- start C36`、dev、`npm run lab -- check C36`。
- 定向回归：`node node_modules/vitest/vitest.mjs run --config tools/behavior.config.mjs -t "补货后|新鲜缓存|坏快照"`。
- 正式证据由主 agent 写 `labs/records/A.md`；第4路局部记录在 delivery，不进入学习包。

## 保留的独立参考

| 文件 | 命令 | 内容 |
| --- | --- | --- |
| sources.js | `node sources.js` | 历史 reducer 的身份与 52→53 |
| keys.js | `node keys.js` | QueryClient 键隔离 |
| recovery.js | `node recovery.js` | 历史存储恢复边界 |

根目录 `npm run examples -- c36` 核对输出；旧 review.html 不作为新主线入口，旧两套库存来源也没有带回新 App。

## 本次真实接续验证

- 2026-10-29 · macOS arm64 · Node 24.22.0 / React 19.3.1 / Vitest 5.0.5 / Playwright 1.64.1 / Chromium 156.0.8078.4；沿用已装依赖。
- 从哈希一致的真实 C32 连续接至 C36，`node tools/check.mjs C36` 通过：85 条核心断言、Effect/计时 4 条、Query 6 条、Action 4 条、报表 2 条、RTL 7 条、10 组隔离浏览器场景、严格生产 E2E 1 条和 Hooks lint。同步 C28 表单断言由异步契约替代，2000ms 计时断言仍运行。
- 浏览器恢复：先保存 52，再改 P004=8；非法导入前后 localStorage 原文相同；损坏主记录后恢复 P004=3、总库存52，damaged 保留 `{bad`，详情同步为3。每场景独立 profile，不清空学员数据。
- 三故障都在真实工作副本红 1→修复绿 0：summary 冗余 state、detail key 缺 id、真实 repository 的 importText 提前写入；见 `final-real-C36-{summary,query-id,storage-order}-{red,green}.log`。
- 存储故障正文已给精确位置：在 `commit(decodeSnapshot(text))` 前插入 `store().setItem(reactStorageKey, text);`；修复只删这一行，恢复先解码后提交。
- 同输入回归：鼠标1后汇总53/2647700分；P001→P002显示鼠标0；坏字段不覆盖好原文，备份恢复。三条回归读取真实 App/Query/repository。
- `node delivery/assemble-from-prose-agent-4.mjs`：从真实 C32 用公开围栏顺序拼至 C36，四次 `start` / 完整 `check` 均通过；C36 为正文必做6条 RTL，参考解另含C35选做1条。属于作者自审。
- 根目录 `npm run examples -- c36` 3/3；临时 catalog 副本48课 lint 零 error/warning，四课旧47个H2目标保留。正式 catalog/registry 未改，`labs/records/A.md` 与发布由主 agent 完成。
- 共享接线另在真实 C25–C32 的8个独立快照全检查通过；见 `final-early-checks.json`，不是沿用夹具结果。
- 主集成16快照、根check/build、独立抽验范围与全站周视觉/冻结/Pages见 [阶段 A](../../labs/records/A.md)。未执行：本课独立读者跟做、DevTools 各面板手动取证、Firefox/Safari/Windows/屏幕阅读器。

## 历史夹具与发布

早期 `fixture-*` / `revision-*` 只作历史，现由 `final-*` 的真实链结果取代；见 `delivery/history-agent-4.md`，夹具不进入学习包。

第一版 [Pages 39110881230](https://github.com/socoo123/js_web/actions/runs/39110881230) 的 190 条回归/两条 E2E/周视觉是旧版证据，不计入本次改版。
