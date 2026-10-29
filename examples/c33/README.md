# C33 现代 React 19 与更新速查 · 示例

正文：[C33](../../src/content/docs/05-react/c33-modern-react-actions.mdx)。主线继续自己的 `inventory/`，不切换到旧阶段 4。

## Lab 入口

- 目标发行版 `2026.10-v2.3`：C32 完成态 → C33；`labs/reference/steps/C33` 只增加 ProductEditor / App。
- 工作区：`npm run lab -- start C33`、`npm run lab -- dev`、`npm run lab -- check C33`。
- 专用检查：`node node_modules/vitest/vitest.mjs run --config tools/action.config.mjs`。
- 记录：正式阶段记录由主 agent 写 `labs/records/A.md`；本路最终证据在 `delivery/agent-4.md` 与 `delivery/evidence/`，不进入学习包。

## 保留的独立参考

| 文件 | 命令 | 内容 |
| --- | --- | --- |
| form-data.js | `node form-data.js` | 字符串字段、缺失字段 |
| action-results.js | `node action-results.js` | 历史操作工厂成功/失败；不是新 Lab 的另一份商品来源 |
| promise-identity.js | `node promise-identity.js` | Promise 身份 |
| prediction.js | `node prediction.js` | 手动传回上次结果 |

根目录 `npm run examples -- c33` 自动核对固定输出。旧实验保留在 `examples/inventory/04-react/labs/actions.html`，仅作历史参考，不参与当前 Lab 衔接。

## 本次真实接续验证

- 2026-10-29 · macOS arm64 · Node 24.22.0 / React 19.3.1 / Vitest 5.0.5 / Playwright 1.64.1 / Chromium 156.0.8078.4；沿用已装依赖，没有重装或下载浏览器。
- 起点为主 agent 交付的真实 C32，66 个文件哈希全部匹配；本副本重建 C32 的 30 个源码/数据/package 文件也全部匹配。
- 真实 C33 独立快照的 `node tools/check.mjs C33` 通过：85 条核心断言、Effect/计时 4 条、Query 6 条、Action 4 条、8 组隔离浏览器场景及 Hooks lint。只跳过不适用于异步 Action 的同步 C28 表单用例。
- 浏览器覆盖 pending、预览 8→3 回滚、草稿仍 8、分类保留、重试后总库存 57、15/16、取消定时、真实 Tab/Enter 与 trigger/heading 焦点回退。
- `node delivery/red-green-agent-4.mjs real final-real`：签名、首错顺序、noValidate、取消传事件四项均退出码红 1→修复绿 0；见 `final-real-C33-*-{red,green}.log`。
- `node delivery/assemble-from-prose-agent-4.mjs`：从真实 C32 只用公开围栏组装，`start C33` / `check C33` 通过；属于作者拼装自审，不是独立读者验收。
- 根目录 `npm run examples -- c33` 4/4；临时 catalog 副本的 48 课 lint 零 error/warning，正式 registry 未修改。见 `final-c33-examples.log` / `final-real-content-lint.log`。
- happy-dom 的原生 reset/select 行为差异由真实 Chromium 的分类断言补足；RTL 另断言最终 DTO 保留分类/tags，没有为模拟器改业务规则。
- 主集成16快照、独立抽验范围与全站发布验收见 [阶段 A](../../labs/records/A.md)。未执行：Sources/React DevTools 手动面板、Firefox/Safari/Windows/屏幕阅读器；真实后端/RSC/Server Functions 不在本课范围。

## 历史夹具与发布

早期 `fixture-*` / `revision-*` 是临时契约夹具或旧轮次记录，现由上述 `final-*` 真实链证据取代；详情保留在 `delivery/history-agent-4.md`，不进入正式起点。

第一版于 2026-10-18 发布，[Pages 39088993996](https://github.com/socoo123/js_web/actions/runs/39088993996)；旧实验的 154 条回归等为当时源码证据，不用于声明本次改版通过。
