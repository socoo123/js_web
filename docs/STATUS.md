# 当前进度与续做入口

恢复关键词：**JS_WEB_START**。最后更新：2026-11-07（V3 收尾，改为 V4「Lab 优先」；**V4 批次 1 已发布**（[Pages run](https://github.com/socoo123/js_web/actions/runs/42343673582)，见 [V4-1](../labs/records/V4-1.md)）；**V4 批次 2 L5 本地后端已发布**（[Pages run](https://github.com/socoo123/js_web/actions/runs/42354130699)，发行版 `2026.11-v4.0`，见 [V4-2](../labs/records/V4-2.md)））。

## 续做时按这个顺序读

1. 本文件的「下一步」。
2. [PLAN](PLAN.md)：V4「Lab 优先」：信息架构、L1–L6 设计、界面与交互、L5 后端契约、内容边界（只勘误）、执行方式与三批队列。
3. [CONTENT_GUIDE](CONTENT_GUIDE.md)：写作硬约束，写任何课程之前必须读完。
4. [CURRICULUM](CURRICULUM.md) 的逐章任务，再读 [DEBUG_TESTING](DEBUG_TESTING.md#revision-v2-errors) 错误矩阵和 [ARCHITECTURE](ARCHITECTURE.md#revision-v2-ui) 页面规格。
5. [Lab 设计](../labs/README.md) 与阶段记录；Lab 主页、L6 与 L5 后端以 PLAN §3 为准；勘误见 [V4-errata](../labs/records/V4-errata.md)。

## 用户要求的变更记录

- 最初的要求：中文课程，读者会 Java；4 周 48 课，8 周慢速版；内容覆盖 JS 历史、语言、数据结构、异步、Node 与包管理器、详细的 React、SAP UI5 与开源组件；图只用 D2；静态站部署到 GitHub Pages。不要求所有示例在线运行，需要动手的标「自己尝试」；必须教调试工具和 UT。每篇完成后授权验证、提交、推送并检查 Pages（见 AGENTS.md）。
- **2026-10-15–16：用户要求精简写作规范，以 C03 为范例重构 C01–C05，并开发 C06。** 课程与 D2 按篇幅/数据约束重构；T0 门禁及 C06 完成，原风格停等已由后续开发请求解除。历史计划见 Git；第一版结果保留在课程发布表。
- **2026-10-16：用户按最新计划与 C03 依次要求开发 C07–C12，解除 C06 风格确认停等。** 类、数组、集合、栈/队列/树、DOM 与 Promise 课程、对应项目和第一周验收已完成，各课按篇幅上限与门禁实施。
- **2026-10-16–17：用户要求按最新计划与重做的 C03 开发 C13–C20。** 请求、存储、布局、ESM、ES 速查、Node/包管理器、报表、构建/UT 与 TS 失败实验完成上线；C17 网页对照未运行且已标注。
- **2026-10-17：用户要求开发 C21–C24、配置 React DevTools 并避开正在使用的窗口。** React/JSX、props、状态、数组/key、阶段 4、Q2 与 Java ↔ JS 速查完成上线；扩展入口可用，C23 用独立后台 Chrome；F1 保留。
- **2026-10-17–18：用户要求按最新计划与重做的 C03 开发 C25–C30。** 表单、可访问性、状态归属、reducer/Context、ref、Effect/请求竞态及阶段 4 更新已上线，每课门禁与 Pages 核验通过；F1 保留。
- **2026-10-18–19：用户要求按最新计划与重做的 C03 开发 C31–C44。** 自定义 Hooks/路由、Query、Action/乐观预览、React 复盘、组件库、经典 UI5、原生组件与 UI5 速查已上线，每课门禁与 Pages 核验完成。
- **2026-10-19：用户要求按最新计划与重做的 C03 开发 C45–C48，随后要求补齐 F1。** 四课与 F1 已上线；C48 门禁/Q4、F1 数据/交互/全站复检及 Pages 核验完成，最终验收 12/12。
- **2026-10-19–20：用户要求整理 README/导航、一并提交 C03 数值转换，并升级 Node。** 均已完成并上线；Node 默认 24.22.0/npm 11.19.1，详细验证保留在 SOURCES 和 examples/c03、c06。
- **2026-10-28：用户明确授权实施 V2 改版。** 从 R1 开始，先工作区/快照/组件门禁和三课试做，再按课程依赖迁移并逐批发布。
- **2026-10-29：用户要求替换 PLAN/Lab，并明确每阶段 4 个 Sol max 子 agent 同时执行。** 规划与四路分工已落盘；主 agent 等四路交稿/返修结束后集成验收发布，统一返回结果与接续文本，用户清理上下文再开下一阶段；A/B/C 完成即结束。
- **2026-11-01：用户强调 Lab 必须有网站导航，任务与业务规则必须在网页里写清，不能只放源码。** 本次维护补齐 L1–L5 导航、规则与验收网页、阶段任务和课程任务卡入口。
- **2026-11-06：用户要求删除旧 PLAN 并重写：UI 更好看、交互更强；以 Lab 为主线、做 Lab 时不断回看课文；课文核心不变但多展示代码效果、降低密度；L5 提供后端，学员写前端。** 新 PLAN 已写成 V3 五阶段，每阶段仍为 4 个子 agent 并行加主 agent 验收；同日指定子 agent 全部用 Opus 5.5 1M Extra High。阶段 1 已发布，见 [V3-1](../labs/records/V3-1.md)。
- **2026-11-06：阶段 1 发布过程中，用户要求用更好的审美优化页面样式、排版和代码高亮。** 已改为 GitHub 代码配色、轻量提示框与行内代码、单层演示框和首页高亮代码，随阶段 1 发布（`c38b74f`）。
- **2026-11-07：阶段 2 派发约 20 分钟后，用户叫停，认为现有课文已经可用。** 四路子 agent 的半成品没有合并；阶段 2 的本地基线提交和隔离副本已删除，仓库与线上保持阶段 1 发布后的状态。
- **2026-11-07：用户认为执行太慢，要求首页和目录 Lab 优先、通过 Lab 子标签进入课程，新增最终 Lab 全局检验能力，修正对照卡与重点框不对齐，看答案时可交互揭晓，图换技术重构以配合 UI，内容只改错误，PLAN 全部改写、Lab 重新设计。** PLAN 改为 V4 三批；批次 1 由主 agent 与 4 个子 agent（Opus 5.5 Extra High，各自 worktree）并行完成，见 [V4-1](../labs/records/V4-1.md)。
- **2026-11-07：用户因 Opus 额度用完，授权 V4 批次 3 主、子 agent 改用 GPT-6 Astra（`openai/gpt-6-astra`）。** 两路勘误核查已结束，C03/C20 定点修正；主 agent 负责全站终验与发布，验收与发布要求不变。
## 当前状态
| 项目 | 状态 |
| --- | --- |
| 网站 | [socoo123.github.io/js_web](https://socoo123.github.io/js_web/)；Lab 优先：侧栏按 L1–L6 分组、首页 Lab 标签、Lab 主页课程标签、[L6 毕业挑战](https://socoo123.github.io/js_web/labs/l6/) |
| 工程 | Node 24.22.0、npm 11.19.1（本机默认已对齐）、Astro 7.3.8、Starlight 0.42.6、React islands（`@astrojs/react` 7.1.4、React 19.3.1）；代码高亮 GitHub Dark/Light（`ec.config.mjs`）；根目录只有一个 package-lock.json |
| 已发布 | 48 / 48（C01–C48）；全部接入Lab主线，任务卡/catalog/旧URL与线上核验通过 |
| 贯穿项目 | V4 批次 2 起发行版 `2026.11-v4.0`：C44 起附带作者提供的本地后端 `server/`（`npm run lab -- api`）与空白前端壳 `shell/`，L5 对接后端，接口见[L5 后端接口](https://socoo123.github.io/js_web/labs/api/)；V2 L1–L5全部发布，v2.5提供C00–C48；五起点C00/C10/C20/C36/C44，旧七阶段保留参考；独立抽验见[A](../labs/records/A.md)、[B](../labs/records/B.md)、[C](../labs/records/C.md) |
| 机制图 | 14 张站内图形组件（`src/components/diagrams/`，主题变量，10 张可逐步播放）；D2 管线已删除（历史见 `ba2c814`） |
| 自动门禁 | 内容 lint、固定输出示例、后端契约与规则同步（`test:api`）、L6 题目与验收数字（`check:capstone`）、机制图登记与产物检查、Lab 标签锚点；均接入 build |
| 学习进度功能 | F1已上线；C最终产物标记/导入导出/恢复/跨标签/存储故障回归通过，见[C](../labs/records/C.md)；首次[Pages](https://github.com/socoo123/js_web/actions/runs/39263906094)保留 |
| V2 改版 | 已完成；A/v2.3、B/v2.4、C/v2.5均已发布；[C发布证据](../labs/records/C.md#发布) |
| V3 改版 | 只完成阶段 1（2026-11-07 发布，见 [V3-1](../labs/records/V3-1.md)）；阶段 2 被叫停，其余并入 V4 |
| V4 改版 | **批次 1 已发布**，见 [V4-1](../labs/records/V4-1.md)；**批次 2 L5 本地后端已发布**，见 [V4-2](../labs/records/V4-2.md)；批次 3 勘误与全站终验进行中：C03/C20 修正、旧勘误复核与文档同步，验收与发布结果待记录 |

## 已发布课程

| 课 | 线上 | 示例与验证记录 | 部署记录 |
| --- | --- | --- | --- |
| C01 JavaScript 的故事与生态地图 | [打开](https://socoo123.github.io/js_web/01-history-web/c01-story-ecosystem/) | [examples/c01](../examples/c01/README.md) | 首次：[run 38662138819](https://github.com/socoo123/js_web/actions/runs/38662138819)；重构：[run 38755041902](https://github.com/socoo123/js_web/actions/runs/38755041902) |
| C02 Web 基础与第一个调试现场 | [打开](https://socoo123.github.io/js_web/01-history-web/c02-web-debugging/) | [examples/c02](../examples/c02/README.md) | 首次：[run 38663909240](https://github.com/socoo123/js_web/actions/runs/38663909240)；重构：[run 38761177588](https://github.com/socoo123/js_web/actions/runs/38761177588) |
| C03 值、类型、转换与比较 | [打开](https://socoo123.github.io/js_web/02-language-data/c03-values-types/) | [examples/c03](../examples/c03/README.md) | 范例重写：[run 38752272921](https://github.com/socoo123/js_web/actions/runs/38752272921)；[V3改写](../labs/records/V3-1.md#发布) |
| C04 变量、作用域与控制流 | [打开](https://socoo123.github.io/js_web/02-language-data/c04-scope-control/) | [examples/c04](../examples/c04/README.md) | 重构：[run 38764394967](https://github.com/socoo123/js_web/actions/runs/38764394967) |
| C05 对象、引用与数据交换 | [打开](https://socoo123.github.io/js_web/02-language-data/c05-objects-json/) | [examples/c05](../examples/c05/README.md) | 重构：[run 38842751440](https://github.com/socoo123/js_web/actions/runs/38842751440) |
| C06 函数、闭包与高阶操作 | [打开](https://socoo123.github.io/js_web/02-language-data/c06-functions-closures/) | [examples/c06](../examples/c06/README.md) | [run 38844828221](https://github.com/socoo123/js_web/actions/runs/38844828221) |
| C07 this、原型与 class | [打开](https://socoo123.github.io/js_web/02-language-data/c07-this-prototypes/) | [examples/c07](../examples/c07/README.md) | [run 38866722105](https://github.com/socoo123/js_web/actions/runs/38866722105) |
| C08 Array 与业务数据处理 | [打开](https://socoo123.github.io/js_web/02-language-data/c08-arrays-processing/) | [examples/c08](../examples/c08/README.md) | [run 38868560351](https://github.com/socoo123/js_web/actions/runs/38868560351) |
| C09 Object、Map、Set 与弱集合 | [打开](https://socoo123.github.io/js_web/02-language-data/c09-maps-sets/) | [examples/c09](../examples/c09/README.md) | [run 38871515466](https://github.com/socoo123/js_web/actions/runs/38871515466) |
| C10 栈、队列、树与复杂度 | [打开](https://socoo123.github.io/js_web/02-language-data/c10-stacks-queues-trees/) | [examples/c10](../examples/c10/README.md) | [run 38876725107](https://github.com/socoo123/js_web/actions/runs/38876725107) |
| C11 DOM、事件、表单与页面调试 | [打开](https://socoo123.github.io/js_web/03-async-modules/c11-dom-events-forms/) | [examples/c11](../examples/c11/README.md) | [run 38913333294](https://github.com/socoo123/js_web/actions/runs/38913333294) |
| C12 从回调到 Promise：执行顺序 | [打开](https://socoo123.github.io/js_web/03-async-modules/c12-callbacks-promises/) | [examples/c12](../examples/c12/README.md) | [run 38915791749](https://github.com/socoo123/js_web/actions/runs/38915791749) |
| C13 async/await、请求与 Network | [打开](https://socoo123.github.io/js_web/03-async-modules/c13-async-await-fetch/) | [examples/c13](../examples/c13/README.md) | [run 38919408362](https://github.com/socoo123/js_web/actions/runs/38919408362) |
| C14 原生页面、存储与错误处理 | [打开](https://socoo123.github.io/js_web/03-async-modules/c14-storage-errors/) | [examples/c14](../examples/c14/README.md) | [run 38924073963](https://github.com/socoo123/js_web/actions/runs/38924073963) |
| C15 CSS 布局与响应式：排版库存页 | [打开](https://socoo123.github.io/js_web/03-async-modules/c15-css-layout-responsive/) | [examples/c15](../examples/c15/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/38927024152)；[C定点修正](../labs/records/C.md#发布)；[V3改写](../labs/records/V3-1.md#发布) |
| C16 模块、依赖与组织代码 | [打开](https://socoo123.github.io/js_web/03-async-modules/c16-modules-dependencies/) | [examples/c16](../examples/c16/README.md) | [run 38984292309](https://github.com/socoo123/js_web/actions/runs/38984292309) |
| C17 Node 与浏览器的边界 | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c17-node-browser/) | [examples/c17](../examples/c17/README.md) | [run 38989123796](https://github.com/socoo123/js_web/actions/runs/38989123796) |
| C18 npm：项目、版本与可复现安装 | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c18-npm-reproducible-installs/) | [examples/c18](../examples/c18/README.md) | [run 38994824234](https://github.com/socoo123/js_web/actions/runs/38994824234) |
| C19 Yarn、pnpm、Bun 的职责与选择 | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c19-yarn-pnpm-bun/) | [examples/c19](../examples/c19/README.md) | [run 38996724990](https://github.com/socoo123/js_web/actions/runs/38996724990) |
| C20 构建工具与第一次 UT | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c20-vite-vitest/) | [examples/c20](../examples/c20/README.md) | [run 38997587821](https://github.com/socoo123/js_web/actions/runs/38997587821) |
| C21 React 来由、JSX 与第一个组件 | [打开](https://socoo123.github.io/js_web/05-react/c21-react-jsx-components/) | [examples/c21](../examples/c21/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39009250317)；[A改版](../labs/records/A.md#发布) |
| C22 Props、组合与渲染模型 | [打开](https://socoo123.github.io/js_web/05-react/c22-props-composition-render/) | [examples/c22](../examples/c22/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39018608877)；[A改版](../labs/records/A.md#发布) |
| C23 useState：状态快照与更新队列 | [打开](https://socoo123.github.io/js_web/05-react/c23-state-snapshot-queue/) | [examples/c23](../examples/c23/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39020278502)；[A改版](../labs/records/A.md#发布)；[V3改写](../labs/records/V3-1.md#发布) |
| C24 数组更新、key 与派生数据 | [打开](https://socoo123.github.io/js_web/05-react/c24-arrays-keys-derived/) | [examples/c24](../examples/c24/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39021433607)；[A改版](../labs/records/A.md#发布) |
| C25 表单、校验与可访问性 | [打开](https://socoo123.github.io/js_web/05-react/c25-forms-validation-accessibility/) | [examples/c25](../examples/c25/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39030596833)；[A改版](../labs/records/A.md#发布) |
| C26 状态提升、保留与重置 | [打开](https://socoo123.github.io/js_web/05-react/c26-state-ownership-reset/) | [examples/c26](../examples/c26/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39037201320)；[A改版](../labs/records/A.md#发布) |
| C27 useReducer 与 Context | [打开](https://socoo123.github.io/js_web/05-react/c27-reducer-context/) | [examples/c27](../examples/c27/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39038415280)；[A改版](../labs/records/A.md#发布) |
| C28 useRef 与外部系统 | [打开](https://socoo123.github.io/js_web/05-react/c28-refs-external-systems/) | [examples/c28](../examples/c28/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39040017175)；[A改版](../labs/records/A.md#发布) |
| C29 useEffect 深入与清理 | [打开](https://socoo123.github.io/js_web/05-react/c29-effects-cleanup/) | [examples/c29](../examples/c29/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39042403933)；[A改版](../labs/records/A.md#发布) |
| C30 请求状态与竞态调试 | [打开](https://socoo123.github.io/js_web/05-react/c30-requests-races/) | [examples/c30](../examples/c30/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39081623244)；[A改版](../labs/records/A.md#发布) |
| C31 自定义 Hooks 与路由 | [打开](https://socoo123.github.io/js_web/05-react/c31-custom-hooks-routing/) | [examples/c31](../examples/c31/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39082631885)；[A改版](../labs/records/A.md#发布) |
| C32 认识 TanStack Query 与服务端状态 | [打开](https://socoo123.github.io/js_web/05-react/c32-tanstack-query-server-state/) | [examples/c32](../examples/c32/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39087677999)；[A改版](../labs/records/A.md#发布) |
| C33 现代 React 19 与更新速查 | [打开](https://socoo123.github.io/js_web/05-react/c33-modern-react-actions/) | [examples/c33](../examples/c33/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39088993996)；[A改版](../labs/records/A.md#发布) |
| C34 性能、加载与错误诊断 | [打开](https://socoo123.github.io/js_web/05-react/c34-performance-loading-errors/) | [examples/c34](../examples/c34/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39101734918)；[A改版](../labs/records/A.md#发布) |
| C35 React UT、集成测试与 E2E 地图 | [打开](https://socoo123.github.io/js_web/05-react/c35-react-testing/) | [examples/c35](../examples/c35/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39108651570)；[A改版](../labs/records/A.md#发布) |
| C36 React 项目复盘与故障排查 | [打开](https://socoo123.github.io/js_web/05-react/c36-react-project-debugging/) | [examples/c36](../examples/c36/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39110881230)；[A改版](../labs/records/A.md#发布) |
| C37 组件生态与选择标准 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c37-component-ecosystem-selection/) | [examples/c37](../examples/c37/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39111938025)；[B改版](../labs/records/B.md#发布) |
| C38 一个普通组件库的完整案例 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c38-antd-inventory/) | [examples/c38](../examples/c38/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39121201638)；[B改版](../labs/records/B.md#发布) |
| C39 SAP Fiori 与 UI5 家族 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c39-fiori-ui5-family/) | [examples/c39](../examples/c39/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39122376307)；[B改版](../labs/records/B.md#发布) |
| C40 OpenUI5 入门：MVC 与工程 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c40-openui5-mvc-project/) | [examples/c40](../examples/c40/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39124104412)；[B改版](../labs/records/B.md#发布) |
| C41 UI5 Model、绑定与业务控件 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c41-model-binding-controls/) | [examples/c41](../examples/c41/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39134470004)；[B改版](../labs/records/B.md#发布) |
| C42 UI5 路由与 OData 起点 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c42-routing-odata/) | [examples/c42](../examples/c42/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39144417753)；[B改版](../labs/records/B.md#发布) |
| C43 UI5 Web Components 原生使用 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c43-native-web-components/) | [examples/c43](../examples/c43/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39180665049)；[B改版](../labs/records/B.md#发布) |
| C44 UI5 Web Components for React | [打开](https://socoo123.github.io/js_web/06-components-ui5/c44-ui5-react/) | [examples/c44](../examples/c44/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39182549346)；[B改版](../labs/records/B.md#发布) |
| C45 全链路 Debug 与交付前检查 | [打开](https://socoo123.github.io/js_web/07-project/c45-debug-delivery-checks/) | [examples/c45](../examples/c45/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39184048121)；[C改版](../labs/records/C.md#发布)；[V4后端](../labs/records/V4-2.md) |
| C46 静态构建与 GitHub Pages | [打开](https://socoo123.github.io/js_web/07-project/c46-static-build-pages/) | [examples/c46](../examples/c46/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39243733535)；[C改版](../labs/records/C.md#发布)；[V4后端](../labs/records/V4-2.md) |
| C47 综合项目与测试选择 | [打开](https://socoo123.github.io/js_web/07-project/c47-project-testing-strategy/) | [examples/c47](../examples/c47/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39253230340)；[C改版](../labs/records/C.md#发布)；[V4后端](../labs/records/V4-2.md) |
| C48 总复盘与后续路线 | [打开](https://socoo123.github.io/js_web/07-project/c48-review-next-steps/) | [examples/c48](../examples/c48/README.md) | [首次](https://github.com/socoo123/js_web/actions/runs/39257555264)；[C改版](../labs/records/C.md#发布)；[V4后端](../labs/records/V4-2.md) |

## 周验收记录
- 建站至第一周（2026-10-15–16）：C01–C12、首页/路线的 1280/360px × 亮暗、9 张 D2 中文、折叠答案、复制、三关键词搜索与禁用 JS 阅读通过；C01–C05 另在线上 Pages 检查，阶段 1 业务参考值一致。
- C24 / 第二周验收（2026-10-17）：本地 28 页的 1280px/360px、亮暗模式、12 张 D2、折叠答案/复制、三关键词搜索、25 页禁用 JS 阅读通过；阶段 1–3 业务参考值、原生页编辑/刷新/坏副本恢复与 React 列表操作通过。。C36 / 第三周验收（2026-10-18）：41 页共 164 组宽度/亮暗检查、13 张 D2、折叠答案/复制、竞态/乐观/故障搜索与禁用 JS 阅读通过；库存 v2 本地快照/详情/校验、源码映射与 190 条回归、2 条生产 E2E 通过。
- C48 / 第四周验收（2026-10-19）：54 页、216 组 1280/360px × 亮暗、14 张 D2、折叠答案/复制、三关键词搜索与禁用 JS 阅读通过；七阶段安装/构建/业务复检通过，§10 仅余 F1 学习进度。F1 / 站点交互变更复检（同日）：15 条数据测试、浏览器主流程/故障回归、54 页/216 组宽度主题、14 张 D2、搜索/复制/答案和禁用 JS 阅读通过；Pages 与线上交互通过，明细见 SOURCES。
- V2 R1–R4 / 首批（2026-10-28）：61 页/366 组、双栏复制与无 JS、D2/搜索、旧 F1、三课起点跟做/错误先红后绿、UI5 严格静态子路径通过；[记录](../labs/records/README.md)。[Pages run](https://github.com/socoo123/js_web/actions/runs/40684581291) 成功，线上课程和下载核验通过。
- V2 A / C24–C36（2026-10-29）：61页/366组、14张D2、键盘/复制/答案/搜索/无JS及F1通过；四课独立跟做、16个React快照、144包线上SHA与Pages通过，见[A记录](../labs/records/A.md)。V2 B / C37–C44（同日）：10页/60组、键盘/复制/答案/搜索/D2/无JS通过；四课独立跟做、8快照、234包线上SHA与Pages通过，见[B记录](../labs/records/B.md)；未重做全站/F1浏览器验收。
- V2 C / 最终验收（2026-10-30）：61页/366组、14张D2、键盘/复制/答案/七词搜索/无JS/F1及四课独立跟做通过；v2.5冻结、Linux CI/Pages、线上60页/332包SHA与五起点浏览器下载通过，见[C](../labs/records/C.md)。
- V3 阶段 1（2026-11-06–07）：最终集成 62 页/372 组、14 张 D2、键盘/复制/答案/七词搜索/无 JS、F1 与 Lab 步骤通过；L3 C22→C23 独立跟做红绿、C03/C15 组件行为通过；线上 9 入口/46 资源/332 包 SHA 通过，见 [V3-1](../labs/records/V3-1.md)。
- V4 批次 1（2026-11-07）：构建全部门禁、63 页/378 组宽度×亮暗、14 张机制图（尺寸/溢出/键盘步进/无 JS）、七词搜索、63 页禁用 JS、F1/Lab 标签与步骤、48 课交互揭晓、L6 题目与验收数字通过，见 [V4-1](../labs/records/V4-1.md)。
- V4 批次 2（2026-11-07）：构建全部门禁（契约 23、lint 0）、四条 Lab 链（交付链 19 组真实源码红→绿）、新物化 C48 用 `lab api` + `lab dev` 实际跑通、受影响 11 页 66 组宽度×亮暗/无 JS、48 课揭晓、F1 与 Lab 步骤通过；`2026.11-v4.0` 冻结；线上 98 包 SHA、C44 包后端启动与 16 个地址通过，见 [V4-2](../labs/records/V4-2.md)。
## 已知问题（不阻塞）

- Starlight 自定义 404 有一条路由优先级提示，404.html 正常；上游 Pages Actions 有 Node 20 弃用提示，runner 实际使用 Node 24，部署成功，升级时复查。维护待定：项目级 LICENSE 尚未添加；PR 自动检查未配置；跨浏览器、Windows、真机与屏幕阅读器未做完整验收。选修仍由用户指定。

## 下一步

1. **V4 批次 3：勘误与全站终验**（[PLAN §7](PLAN.md#7-批次队列)）：主、子 agent 均用 **GPT-6 Astra**（`openai/gpt-6-astra`），按 §6 判断是否并行；汇总 [勘误清单](../labs/records/V4-errata.md) 逐条核实修正；L1/L2/L4/L5 按需补步骤数据；L6 工作区自动检查（若做）；全站 360/768/1280 × 亮暗、键盘、无 JS、搜索、复制、答案揭晓、图步进、F1 与 Lab 进度回归；README/DEPLOYMENT 同步。完成后 PLAN 关闭，下一步为无。用户有具体修改意见时先按意见处理；V2/V3/V4 成果、源码、锁、历史包和个人学习数据保留。

## 本文件的更新规则

- 每批发布：更新现有课程行/当前状态/下一步，不重复新增同课；每阶段证据写 `labs/records/<阶段>.md`，本文件只放结论与链接。
- 周验收写不超过 3 行；新要求追加一行。保留发布事实，必要时将历史表移入独立记录并保留链接，本文件保持在 120 行以内。
