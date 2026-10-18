# 当前进度与续做入口

恢复关键词：**JS_WEB_START**。最后更新：2026-10-18（C39 已上线，每课门禁与线上核验完成；下一项 F1）。

## 续做时按这个顺序读

1. 本文件的「下一步」。
2. [PLAN](PLAN.md)：总约束、项目数据与阶段、门禁、任务队列。
3. [CONTENT_GUIDE](CONTENT_GUIDE.md)：写作硬约束，写任何课程之前必须读完。
4. 范例课 [C03](../src/content/docs/02-language-data/c03-values-types.md) 及其 [examples/c03](../examples/c03/README.md)：新规范写出来的样子。
5. [CURRICULUM](CURRICULUM.md)：本课那一行，以及本周的写作范围。
6. 上一课的「小结」和「项目进度」。

## 用户要求的变更记录

- 最初的要求：中文课程，读者会 Java；4 周 48 课，8 周慢速版；内容覆盖 JS 历史、语言、数据结构、异步、Node 与包管理器、详细的 React、SAP UI5 与开源组件；图只用 D2；静态站部署到 GitHub Pages。不要求所有示例在线运行，需要动手的标「自己尝试」；必须教调试工具和 UT。每篇完成后授权验证、提交、推送并检查 Pages（见 AGENTS.md）。
- **2026-10-15：用户认为 C01–C05 写得不好，要求约束并调整计划。** 已修订 PLAN、CONTENT_GUIDE、CURRICULUM、AGENTS 和本文件，问题和约束见 PLAN §0。从 C06 起按新规范写；C06 写完后停下，等用户确认风格。
- **2026-10-15：用户要求按新规范整篇重构 C03（文字和图），给其他 AI 当参考。** 已完成：正文约 7,500 字，新增 D2 图 c03-value-boundary，示例改用固定样例数据并全部带 `.expected.txt`。C03 不再属于 R1。
- **2026-10-15–16：用户要求按最新计划与 C03 重构 C01、C02、C04、C05。** 均按普通课上限完成正文、示例与 D2，并移出 R1；T0、C06 原队列保留。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C06。** 先完成 T0，C06 由主 agent 编写；发布后等待风格确认。
- **2026-10-16：用户按最新计划与 C03 依次要求开发 C07–C12，解除 C06 风格确认停等。** 类、数组、集合、栈/队列/树、DOM 与 Promise 课程、对应项目和第一周验收已完成，各课按篇幅上限与门禁实施。
- **2026-10-16–17：用户要求按最新计划与重做的 C03 提前开发 C13–C16。** 请求、存储/导入导出、响应式布局、ESM 拆分与 ES 版本速查已完成；各课门禁及 Pages 核验通过，F1 保留。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C17、C18。** Node/npm 课程、阶段 3 报表/scripts、隔离安装实验与 D2 完成；C17 网页对照未运行且已标注，F1 保留。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C19。** 已完成 Yarn/pnpm/Bun 课程与仓库外隔离实验，每课门禁及 Pages 核验通过；F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C20。** 已完成构建/UT 课程、Vite 复用阶段 2 页面、38 条 Vitest 回归与独立 TS 失败实验；每课门禁及 Pages 核验通过，F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C21。** 已完成 React/JSX 课程、阶段 4 商品卡片与调试实验；每课门禁及 Pages 核验通过，F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C22，并协助配置 React DevTools。** 已完成 props/组合/渲染课程、阶段 4 列表与调试实验；Chrome 扩展原已安装，Components 与 Profiler 入口已确认可用，F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C23，调试避开正在使用的窗口。** 已完成状态快照课程、D2 与阶段 4 盘点交互；使用独立后台 Chrome 验证，F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C24。** 已完成数组/key/派生数据、阶段 4 商品操作、Q2 与 Java ↔ JS 速查，每课门禁及 Pages 核验通过；F1 保留。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C25。** 已完成表单、校验、可访问性与阶段 4 商品编辑，每课门禁及 Pages 核验通过；F1 保留。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C26。** 已完成状态归属、保留/重置与阶段 4 单一编辑区，每课门禁及 Pages 核验通过；F1 保留。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C27、C28。** 已完成 reducer/Context、ref/外部系统、对应实验与阶段 4 代码，每课门禁及 Pages 核验通过；F1 保留。
- **2026-10-17–18：用户要求按最新计划与重做的 C03 开发 C29、C30。** 已完成 Effect、请求竞态、实验、共用 D2 与阶段 4 标题/快捷键/详情；每课门禁与 Pages 核验通过；F1 保留。
- **2026-10-18：用户要求按最新计划与重做的 C03 开发 C31–C33。** C31 自定义 Hooks/路由、C32 Query 缓存已上线；C33 Action/乐观预览、更新索引与每课门禁、Pages 核验完成；F1 保留。
- **2026-10-18：用户要求按最新计划与重做的 C03 开发 C34、C35。** 性能/加载实验与测试课程、每课门禁及 Pages 核验完成；F1 保留。
- **2026-10-18：用户要求按最新计划与重做的 C03 开发 C36。** 综合排错、商品快照/本地详情、Hooks 速查与 Q3 完成；每课门禁及 Pages 核验通过，F1 保留。
- **2026-10-18：用户要求按最新计划与重做的 C03 开发 C37–C39。** 组件比较、Ant Design 阶段 5、UI5 家族关系与绑定实验均已上线，每课门禁与 Pages 核验通过；F1 保留。

## 当前状态

| 项目 | 状态 |
| --- | --- |
| 网站 | [socoo123.github.io/js_web](https://socoo123.github.io/js_web/)；推送 main 后由 Actions 自动部署 |
| 工程 | Node 24.22.0、npm 11.19.1、Astro 7.3.8、Starlight 0.42.6；根目录只有一个 package-lock.json |
| 已发布 | 39 / 48（C01–C39）；C39 每课门禁与线上核验通过 |
| 贯穿项目 | 阶段 1–4、Q3 已完成；阶段 5：Ant Design 表格/弹窗、15 条业务回归与 5 条生产浏览器回归 |
| D2 | 0.9.0 + Dagre + Noto Sans SC；已有 14 张图，新增 C39 家族/MVC 绑定共用图 |
| 自动门禁 | T0 已实现：内容 lint、固定输出示例、自动发现课程与 D2 产物；已接入 build |
| 学习进度功能 | 未实施（F1） |

## 已发布课程

| 课 | 线上 | 示例与验证记录 | 部署记录 |
| --- | --- | --- | --- |
| C01 JavaScript 的故事与生态地图 | [打开](https://socoo123.github.io/js_web/01-history-web/c01-story-ecosystem/) | [examples/c01](../examples/c01/README.md) | 首次：[run 38662138819](https://github.com/socoo123/js_web/actions/runs/38662138819)；重构：[run 38755041902](https://github.com/socoo123/js_web/actions/runs/38755041902) |
| C02 Web 基础与第一个调试现场 | [打开](https://socoo123.github.io/js_web/01-history-web/c02-web-debugging/) | [examples/c02](../examples/c02/README.md) | 首次：[run 38663909240](https://github.com/socoo123/js_web/actions/runs/38663909240)；重构：[run 38761177588](https://github.com/socoo123/js_web/actions/runs/38761177588) |
| C03 值、类型、转换与比较 | [打开](https://socoo123.github.io/js_web/02-language-data/c03-values-types/) | [examples/c03](../examples/c03/README.md) | 范例重写：[run 38752272921](https://github.com/socoo123/js_web/actions/runs/38752272921) |
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
| C15 CSS 布局与响应式：排版库存页 | [打开](https://socoo123.github.io/js_web/03-async-modules/c15-css-layout-responsive/) | [examples/c15](../examples/c15/README.md) | [run 38927024152](https://github.com/socoo123/js_web/actions/runs/38927024152) |
| C16 模块、依赖与组织代码 | [打开](https://socoo123.github.io/js_web/03-async-modules/c16-modules-dependencies/) | [examples/c16](../examples/c16/README.md) | [run 38984292309](https://github.com/socoo123/js_web/actions/runs/38984292309) |
| C17 Node 与浏览器的边界 | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c17-node-browser/) | [examples/c17](../examples/c17/README.md) | [run 38989123796](https://github.com/socoo123/js_web/actions/runs/38989123796) |
| C18 npm：项目、版本与可复现安装 | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c18-npm-reproducible-installs/) | [examples/c18](../examples/c18/README.md) | [run 38994824234](https://github.com/socoo123/js_web/actions/runs/38994824234) |
| C19 Yarn、pnpm、Bun 的职责与选择 | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c19-yarn-pnpm-bun/) | [examples/c19](../examples/c19/README.md) | [run 38996724990](https://github.com/socoo123/js_web/actions/runs/38996724990) |
| C20 构建工具与第一次 UT | [打开](https://socoo123.github.io/js_web/04-runtime-tooling/c20-vite-vitest/) | [examples/c20](../examples/c20/README.md) | [run 38997587821](https://github.com/socoo123/js_web/actions/runs/38997587821) |
| C21 React 来由、JSX 与第一个组件 | [打开](https://socoo123.github.io/js_web/05-react/c21-react-jsx-components/) | [examples/c21](../examples/c21/README.md) | [run 39009250317](https://github.com/socoo123/js_web/actions/runs/39009250317) |
| C22 Props、组合与渲染模型 | [打开](https://socoo123.github.io/js_web/05-react/c22-props-composition-render/) | [examples/c22](../examples/c22/README.md) | [run 39018608877](https://github.com/socoo123/js_web/actions/runs/39018608877) |
| C23 useState：状态快照与更新队列 | [打开](https://socoo123.github.io/js_web/05-react/c23-state-snapshot-queue/) | [examples/c23](../examples/c23/README.md) | [run 39020278502](https://github.com/socoo123/js_web/actions/runs/39020278502) |
| C24 数组更新、key 与派生数据 | [打开](https://socoo123.github.io/js_web/05-react/c24-arrays-keys-derived/) | [examples/c24](../examples/c24/README.md) | [run 39021433607](https://github.com/socoo123/js_web/actions/runs/39021433607) |
| C25 表单、校验与可访问性 | [打开](https://socoo123.github.io/js_web/05-react/c25-forms-validation-accessibility/) | [examples/c25](../examples/c25/README.md) | [run 39030596833](https://github.com/socoo123/js_web/actions/runs/39030596833) |
| C26 状态提升、保留与重置 | [打开](https://socoo123.github.io/js_web/05-react/c26-state-ownership-reset/) | [examples/c26](../examples/c26/README.md) | [run 39037201320](https://github.com/socoo123/js_web/actions/runs/39037201320) |
| C27 useReducer 与 Context | [打开](https://socoo123.github.io/js_web/05-react/c27-reducer-context/) | [examples/c27](../examples/c27/README.md) | [run 39038415280](https://github.com/socoo123/js_web/actions/runs/39038415280) |
| C28 useRef 与外部系统 | [打开](https://socoo123.github.io/js_web/05-react/c28-refs-external-systems/) | [examples/c28](../examples/c28/README.md) | [run 39040017175](https://github.com/socoo123/js_web/actions/runs/39040017175) |
| C29 useEffect 深入与清理 | [打开](https://socoo123.github.io/js_web/05-react/c29-effects-cleanup/) | [examples/c29](../examples/c29/README.md) | [run 39042403933](https://github.com/socoo123/js_web/actions/runs/39042403933) |
| C30 请求状态与竞态调试 | [打开](https://socoo123.github.io/js_web/05-react/c30-requests-races/) | [examples/c30](../examples/c30/README.md) | [run 39081623244](https://github.com/socoo123/js_web/actions/runs/39081623244) |
| C31 自定义 Hooks 与路由 | [打开](https://socoo123.github.io/js_web/05-react/c31-custom-hooks-routing/) | [examples/c31](../examples/c31/README.md) | [run 39082631885](https://github.com/socoo123/js_web/actions/runs/39082631885) |
| C32 认识 TanStack Query 与服务端状态 | [打开](https://socoo123.github.io/js_web/05-react/c32-tanstack-query-server-state/) | [examples/c32](../examples/c32/README.md) | [run 39087677999](https://github.com/socoo123/js_web/actions/runs/39087677999) |
| C33 现代 React 19 与更新速查 | [打开](https://socoo123.github.io/js_web/05-react/c33-modern-react-actions/) | [examples/c33](../examples/c33/README.md) | [run 39088993996](https://github.com/socoo123/js_web/actions/runs/39088993996) |
| C34 性能、加载与错误诊断 | [打开](https://socoo123.github.io/js_web/05-react/c34-performance-loading-errors/) | [examples/c34](../examples/c34/README.md) | [run 39101734918](https://github.com/socoo123/js_web/actions/runs/39101734918) |
| C35 React UT、集成测试与 E2E 地图 | [打开](https://socoo123.github.io/js_web/05-react/c35-react-testing/) | [examples/c35](../examples/c35/README.md) | [run 39108651570](https://github.com/socoo123/js_web/actions/runs/39108651570) |
| C36 React 项目复盘与故障排查 | [打开](https://socoo123.github.io/js_web/05-react/c36-react-project-debugging/) | [examples/c36](../examples/c36/README.md) | [run 39110881230](https://github.com/socoo123/js_web/actions/runs/39110881230) |
| C37 组件生态与选择标准 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c37-component-ecosystem-selection/) | [examples/c37](../examples/c37/README.md) | [run 39111938025](https://github.com/socoo123/js_web/actions/runs/39111938025) |
| C38 一个普通组件库的完整案例 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c38-antd-inventory/) | [examples/c38](../examples/c38/README.md) | [run 39121201638](https://github.com/socoo123/js_web/actions/runs/39121201638) |
| C39 SAP Fiori 与 UI5 家族 | [打开](https://socoo123.github.io/js_web/06-components-ui5/c39-fiori-ui5-family/) | [examples/c39](../examples/c39/README.md) | [run 39122376307](https://github.com/socoo123/js_web/actions/runs/39122376307) |

## 周验收记录

- 建站与 C01–C05（2026-10-15，旧流程）：本地和线上 Pages 都检查过 1280px/360px、亮暗模式、D2 中文、折叠答案、禁用 JS 后阅读、搜索、代码复制，全部通过。
- T0 配置调整与 C06（2026-10-16）：本地 1280px/360px、亮暗模式、D2、折叠答案、代码复制、三个关键词搜索及禁用 JS 阅读通过。
- C12 / 第一周验收（2026-10-16）：C01–C12 及首页/路线页的 1280px/360px、亮暗模式、9 张 D2 中文、折叠答案、代码复制、三关键词搜索与禁用 JS 阅读通过；阶段 1 业务参考值一致。
- C24 / 第二周验收（2026-10-17）：本地 28 页的 1280px/360px、亮暗模式、12 张 D2、折叠答案/复制、三关键词搜索、25 页禁用 JS 阅读通过；阶段 1–3 业务参考值、原生页编辑/刷新/坏副本恢复与 React 列表操作通过。
- C36 / 第三周验收（2026-10-18）：41 页共 164 组宽度/亮暗检查、13 张 D2、折叠答案/复制、竞态/乐观/故障搜索与禁用 JS 阅读通过；库存 v2 本地快照/详情/校验、源码映射与 190 条回归、2 条生产 E2E 通过。

## 已知问题（不阻塞）

- Starlight 自定义 404 有一条路由优先级提示，404.html 正常；上游 Pages Actions 有 Node 20 弃用提示，runner 实际使用 Node 24，部署成功，升级时复查。

## 下一步

完整队列见 PLAN §8。C01–C39、T0、Q1–Q3 与三张速查页已完成；C39 每课门禁与线上核验通过。明细见 examples/c39。

1. **F1 本地学习进度**：按 PLAN §8 实施「标记完成」、路线状态、导入导出与损坏恢复。
2. **C40 OpenUI5 入门：MVC 与工程**：建立阶段 6，连接 bootstrap、模块、XML View、Controller、Component、manifest 与 UI5 CLI。

## 本文件的更新规则

- 每发布一课：在「已发布课程」加一行，更新「当前状态」和「下一步」。不写过程日志。
- 每次周验收：在「周验收记录」写不超过 3 行。
- 用户提出新要求：在「用户要求的变更记录」加一行。
- 本文件保持在 120 行以内。
