# 项目上下文与恢复入口

本文件适用于整个仓库。用户要的是一个中文 JavaScript 学习静态网站，部署到 GitHub Pages。

## 续做时先读

1. `docs/STATUS.md`：当前进度和下一步。
2. `docs/PLAN.md`：总约束、项目数据与阶段、质量门禁、任务队列。
3. `docs/CONTENT_GUIDE.md`：写作硬约束。**写或改任何课程之前必须读完。**
4. `docs/CURRICULUM.md`：本课那一行和本周的写作范围。

## 当前改版任务

2026-10-28：用户要求先 review 贯穿大项目、几个 Lab、Java/JS 并排和逐章错误方案，再交另一位 agent 实现；当前提案为 5 个 Lab。旧 PLAN 已由新的改版计划替代；新目录和 Lab 命令按 R 任务逐步落地，实际范围以 STATUS 与练习 README 为准。用户已明确授权实施与逐批发布；先读 STATUS「下一步」确认 R 任务阶段，不能把试做通过当成全部迁移完成。逐章错误见 `docs/DEBUG_TESTING.md`，页面规格与审阅稿见 `docs/ARCHITECTURE.md`、`docs/review/lesson-layout.html`。

## 用户的要求（不可改变）

- 读者只会 Java，是有编程基础的前端初学者；不能跳过 HTML/CSS 和浏览器基础。
- 每天 3–4 小时：4 周 24 个学习日、48 课为主线，8 周为慢速版。
- 必须覆盖：JS 历史到当前标准、语言、数据结构、异步、Node/npm/Yarn/pnpm/Bun、详细的 React、SAP UI5 和开源组件。
- Node/Bun 是运行时，npm/Yarn/pnpm 是包管理器，要和语言、数据结构分开讲。
- 教学以可运行的代码、预期输出、Java 对照和练习为主；关键机制图只用 D2，保留源码并构建成 SVG。
- 网站静态输出：Astro + Starlight + MD/MDX + 少量 React islands。
- 仓库为 `socoo123/js_web`，Pages 子路径是 `/js_web/`，不能假定部署在域名根目录。
- 网站工程统一用 npm 和根目录唯一的 package-lock.json；其他包管理器在隔离示例里比较。
- 课程示例以 JS/JSX 为主；TypeScript 是短桥接和选修，不能挡在 JS 入门前面。
- 不要求所有示例在网站里运行；需要学员动手的内容标「自己尝试」，写明环境、步骤和预期结果。
- 必须教前端调试和 UT：DevTools、React DevTools、Node inspect、Vitest/RTL，以及 Playwright 和 Jest 的定位。
- 版本、安装命令等动态信息先查官方来源；区分正式标准、Stage 4、未完成的提案和实际环境支持。
- UI5 必须分清 SAPUI5、OpenUI5、UI5 Web Components 和 React 包装库；Pages 演示只用静态数据或浏览器内的 mock。

## 写作硬约束（详见 CONTENT_GUIDE）

- 正文写给学员，不写给审阅者。验证过程、作者环境、补丁版本号、内部编号（S01/V03 等）不进正文。
- 篇幅：普通课正文 ≤ 8,000 字，难点课 ≤ 10,000 字。超出就删内容，不放宽规则。
- 每个概念：主张 → 代码 → 输出 → 原因 → 一句 Java 对照。先讲规则，不写防御式免责。
- 正文链接 MDN、react.dev 或官方文档；ECMA-262 规范只放延伸阅读。
- 库存数据统一用 PLAN §3.1 的固定数据，项目按 PLAN §3.2 的阶段推进。
- `npm run lint:lessons` 报 error 的课不能发布（T0 完成后生效）。

## 诚实标注

- 验证状态必须真实：页首写一行，没运行过的例子在它前面标注，明细写在 `examples/cNN/README.md`。没执行过的例子不能写「已验证」。
- 不要把规划写成已完成，不要把资料核对写成运行通过，不要把失败写成已上线。
- 每完成一个任务就按 STATUS 末尾的规则更新 STATUS，写明下一项任务。

## 文章完成后的 GitHub 同步

用户已授权：每次生成文章后，完成 PLAN §6 的每课门禁，更新 STATUS，再把本次的文章、示例、D2 源码与 SVG 及相关站点改动提交并推送到 `origin`（`socoo123/js_web`），不必再请求许可。

- 在 `main` 上正常提交，提交信息要明确，例如 `docs: publish C06 functions and closures lesson`。
- 提交前检查 Git 状态和差异，只纳入本次的工作；不要混入用户无关的改动、缓存、依赖目录或凭据。
- 推送前检查远端有没有新提交；有冲突时保留双方内容再处理，不用强制推送。
- 推送后等对应的 Pages Actions 完成，确认新文章的线上地址返回 200。失败时继续修复，或者如实报告具体的阻塞。
- 全套视觉验收按 PLAN §6 每周做一次，不是每篇都做。
- 如果用户当次明确要求只做本地草稿或暂不发布，以当次要求为准。

## 关键词 JS_WEB_START

用户发送 `JS_WEB_START` 时，按上面「续做时先读」的顺序读文件，检查 Git 状态和现有代码，从 STATUS「下一步」的第一项继续。不重做规划，不假定仓库是空的。
