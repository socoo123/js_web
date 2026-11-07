# L6 毕业挑战：数据与验证记录

页面：`src/content/docs/labs/l6.mdx`（站内地址 `/js_web/labs/l6/`）。本目录只放数据和验证明细，正文不引用这里的内容。

## 文件

| 文件 | 内容 |
| --- | --- |
| `quiz.mjs` | `AREAS`（六个领域、对应 Lab 链接）和 `QUESTIONS`（44 题） |
| `bugs.mjs` | `BUGS`（8 段 Bug 猎人代码、答案行、干扰行提示、修复） |
| `project.mjs` | 毕业项目：起点、固定数据结果 `CASES`/`PARTIAL`、三档目标 `LEVELS`、自评量表 |
| `verify/react.test.jsx` | React/Vitest 实测，复制进 C48 工作区副本运行 |
| `verify/browser.mjs` | 在 Chromium 里对真实 `ui5-button` 运行题目代码，并测量盒模型题的卡片宽度 |

渲染组件在 `src/components/capstone/`，浏览器交互在 `src/scripts/capstone.mjs`，共用的链接与锚点解析在 `src/lib/capstone.mjs`。

## 数据格式

- 题目：`{ id, area, type: 'single'|'multi'|'predict', lesson, anchor, prompt, lang?, code?, options, answer: [下标], explain, verify }`。`answer` 是选项下标；预测题的选项就是终端输出原文。
- Bug：`{ id, area, lesson, anchor, title, scenario, lang, file, code, lines: [答案行], decoys: { 行号: 点错时的提示 }, hint, symptom, cause, fixLang, fix, fixNote, verify }`。
- `lesson` + `anchor` 指向课文小节。构建时 `src/lib/capstone.mjs` 用 `render(entry).headings` 和正文里的 `<a id>` 校验，锚点不存在会让构建失败。
- `verify.run: 'node'` 的条目由检查脚本用 Node 实际运行；`verify.source` 写明依据或运行它的脚本。

## 浏览器存储

只用 `localStorage['js-web-capstone-v1']`，不读写课程进度键 `js_web:progress:v1`。

```json
{
  "version": 1,
  "quiz": { "lang-tdz": { "picked": [2], "correct": false, "at": "…" } },
  "bugs": { "bug-closure-var": { "attempts": 2, "misses": [4], "found": true, "line": 3, "hint": true, "revealed": false } },
  "checks": { "must.core.same-numbers": true },
  "rubric": { "react": 3 },
  "updatedAt": "…"
}
```

## 怎样检查

```bash
# 结构、Node 实跑、项目数字重算、终端块比对（不需要服务器）
node scripts/check-capstone.mjs
# 另外检查页面上每个回看/先读链接 200 且锚点存在（先启动 dev 或 preview）
node scripts/check-capstone.mjs --base http://127.0.0.1:4321/js_web/
# React、浏览器和构建相关条目：在临时 C48 工作区副本里运行，结束后删除副本
LAB_DEPENDENCIES=<已安装依赖的 labs/inventory/node_modules> node scripts/verify-capstone-workspace.mjs
```

`verify-capstone-workspace.mjs` 从 `bugs.mjs`/`quiz.mjs` 的代码原文生成组件，修复版按页面上的修复片段替换对应行，所以题面改了会直接反映在实测里。`KEEP_CAPSTONE_VERIFY=1` 保留临时副本。

## 验证记录（2026-11-07）

### Node 实际运行（20 条）

`check-capstone.mjs` 在 Node v24.22.0 下运行 23 次（17 道预测/单选题，3 个 Bug 的有问题版与修复版），输出与正确选项逐字一致，且没有错误选项与实际输出相同：

- 题目：lang-convert、lang-tdz、lang-shallow、lang-closure、lang-this、lang-sort、lang-map、web-event-loop、web-then-return、web-foreach、tool-live-binding、tool-default-import（Node 报 `does not provide an export named 'default'`）、tool-ts（Node 直接运行 `.ts`，输出 `31`）、del-host、del-url、del-hash、del-shallow。
- Bug：bug-closure-var `P006 P006 P006` → `P001 P004 P006`；bug-sort-mutates 原数组被改 → 不再改；bug-fetch-ok `SyntaxError：Unexpected token '<'…` → `Error：HTTP 404`。

### C48 工作区副本实测（11 条）

`verify-capstone-workspace.mjs`，happy-dom + React Testing Library，Chromium 156，工作区自带的 C41 浏览器检查：

| 条目 | 结果 |
| --- | --- |
| react-lowercase | 6 个 `productcard` 元素、0 个 article、`ProductCard` 调用 0 次；React 开发模式提示 incorrect casing |
| react-and-zero | `renderToStaticMarkup` 得到 `<div>0</div>` |
| react-queue | 一次点击后显示 34 |
| tool-assert | `toEqual`、`toThrow(() => …)` 通过；`toBe` 失败；直接调用在断言前抛出 RangeError |
| bug-stale-timeout | 假定时器：旧写法 13 → 15，updater 13 → 16 |
| bug-index-key | 删除 P001 后 P002 行：下标 key 显示「键盘待盘点」，id key 显示「鼠标待盘点」 |
| bug-effect-race | P001 慢、P002 快：旧写法先鼠标后变回键盘，加 ignore 后保持鼠标 |
| ui5-boolean-attr | Console 输出 `true true`；渲染后内部 button 仍禁用 |
| web-box | content-box 外框 228px；border-box 外框 200px、内容区 172px |
| bug-ui5-path | 把页面上的有问题写法注入 C48 副本的控制器：C41 浏览器检查失败于「P004 保存8/P001 不变」，原 P001 位置变成 id P004；恢复后通过，context 为 `/products/3`、P004 |
| bug-vite-base | `base: "/"`：入口 `/assets/…js`，页面 200、入口 JS 404；改回子路径后入口 JS 200 |

### 资料核对，未运行（21 条）

以下是不带代码的概念或单选题，依据课文小节和官方文档核对：lang-undo、web-network、web-textcontent、web-storage、tool-cwd、tool-npm-ci、tool-runtime、react-mutate、react-key-reset、react-ref、react-effect、react-query-key、react-action、react-rtl、ui5-antd-form、ui5-family、ui5-binding、ui5-odata、ui5-react-form、del-standard、del-test-layer。依据见各条目的 `verify.source`。页面上展示的代码全部属于上面两类实际运行过的条目。

### 毕业项目数字

`check-capstone.mjs` 从 `examples/shared/products.json` 重算，并与 `project.mjs` 和页面终端块比对：

| 阈值 / 目标 | 计划 | 合计 | 补货后库存 / 价值 |
| --- | --- | --- | --- |
| 5 / 10 | P002+10、P004+7、P006+5 | 3 种 22 件 787800 分 | 74 / 3422600 |
| 7 / 12 | P002+12、P003+5、P004+9、P006+7 | 4 种 33 件 1852700 分 | 85 / 4487500 |
| 0 / 1 | P002+1 | 1 种 1 件 12900 分 | 53 / 2647700 |
| 5 / 5 | RangeError「目标库存必须大于阈值」，CLI 退出码 1 | — | — |
| 5 / 10 中途 P004 失败 | 已补 P002；重算 P004+7、P006+5 | 12 件 658800 分 | 74 / 3422600 |

参考实现只在临时 C48 副本里写过、没有提交（页面只给参考思路）。在副本里：`npm test` 7 个文件 35 条通过；`npm run lab -- check C48` 通过；`node src/cli/restock.js 5 10` 输出与页面终端块一致，`5 5` 退出码 1；`npm run lab -- build` 后用严格静态服务器运行补货 Playwright 用例 1 条通过（子路径下带条件刷新、失败后重试到 74 件）。挑战档的 UI5 指引核对了 `npm run lab -- start C43` 切换到 `adapters/web-components`、`npm run lab -- dev` 能打开含 `ui5-input`/`ui5-button` 的页面、`start C48` 能切回；UI5 版补货区本身没有写参考实现。

### 页面交互

Playwright 脚本（不在仓库内）在 dev server 上点击作答、Bug 选行、勾选与自评，检查计分、领域条、错题本、刷新后保留、重做错题与焦点、键盘作答、方向键选行、`aria-live` 文本、毕业报告排序与原因、两次确认的清除、`js_web:progress:v1` 不被改动、1280/360 × 浅色/深色无横向滚动，以及禁用 JS 时题目、代码和折叠答案可读；75 项全部通过。

## 与课文不一致的地方

- C43「按钮始终灰着」证据一步写「attribute 值是字符串 false」。在 UI5 Web Components 2.27 的已渲染 `ui5-button` 上，`setAttribute("disabled", "false")` 后 `getAttribute("disabled")` 立即变成空字符串（组件把布尔 property 反射回 attribute），`disabled` property 为 true。课文第 2 节用 `hasAttribute` 的示例（`true true`）是对的。本页题目改用 `hasAttribute`，课文未改。
