# 当前进度与续做入口

恢复关键词：**JS_WEB_START**。最后更新：2026-10-17（C20 已上线，每课门禁与线上核验完成；下一项 F1）。

## 续做时按这个顺序读

1. 本文件的「下一步」。
2. [PLAN](PLAN.md)：总约束、项目数据与阶段、门禁、任务队列。
3. [CONTENT_GUIDE](CONTENT_GUIDE.md)：写作硬约束，写任何课程之前必须读完。
4. 范例课 [C03](../src/content/docs/02-language-data/c03-values-types.md) 及其 [examples/c03](../examples/c03/README.md)：新规范写出来的样子。
5. [CURRICULUM](CURRICULUM.md)：本课那一行，以及本周的写作范围。
6. 上一课的「小结」和「项目进度」。

## 用户要求的变更记录

- 最初的要求：中文课程，读者会 Java；4 周 48 课，8 周慢速版；内容覆盖 JS 历史、语言、数据结构、异步、Node 与包管理器、详细的 React、SAP UI5 与开源组件；图只用 D2；静态站部署到 GitHub Pages。不要求所有示例在线运行，需要动手的标「自己尝试」；必须教调试工具和 UT。
- 用户授权：每次生成文章后，验证、提交、推送并检查 Pages，不必再请求许可（见 AGENTS.md）。
- 用户曾要求用 3 个子 agent 并行写 C03–C05，已完成。
- **2026-10-15：用户认为 C01–C05 写得不好，要求约束并调整计划。** 已修订 PLAN、CONTENT_GUIDE、CURRICULUM、AGENTS 和本文件，问题和约束见 PLAN §0。从 C06 起按新规范写；C06 写完后停下，等用户确认风格。
- **2026-10-15：用户要求按新规范整篇重构 C03（文字和图），给其他 AI 当参考。** 已完成：正文约 7,500 字，新增 D2 图 c03-value-boundary，示例改用固定样例数据并全部带 `.expected.txt`。C03 不再属于 R1。
- **2026-10-15：用户要求在最新计划与 C03 基础上重构 C01。** 已完成正文、示例与 D2，C01 提前移出 R1。
- **2026-10-15：用户要求在最新计划与 C03 基础上重构 C02。** 正文、示例与 D2 按普通课上限整课重构，C02 提前移出 R1；T0、C06 原队列保留。
- **2026-10-15：用户要求在最新计划与 C03 基础上重构 C04。** 正文、示例与 D2 整课重构，按普通课 ≤ 8,000；C04 提前移出 R1，T0、C06 队列保留。
- **2026-10-16：用户要求在最新计划与 C03 基础上整课重构 C05。** 正文、示例与 D2 已重构，执行普通课 ≤ 8,000；替代 R1 减法整改，T0、C06 队列保留。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C06。** 先完成 T0，C06 由主 agent 编写；发布后等待风格确认。
- **2026-10-16：用户明确要求在最新计划与重做的 C03 基础上开发 C07。** 据此继续课程，解除 C06 风格确认停等；C07 正文、13 个示例、D2 与 Inventory 类已完成。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C08。** 正文与 14 个示例已完成，阶段 1 加入排序和统计，沿用普通课上限与每课门禁。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C09。** 正文、15 个示例、库存 id 索引、分类分组与标签去重已完成，沿用普通课上限与每课门禁。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C10。** 加入撤销栈、头索引队列、分类树遍历与 D2，按普通课上限和每课门禁实施。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C11。** 正文、DOM/事件调试示例与阶段 2 原生库存页已完成，按普通课上限和每课门禁实施。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C12。** 正文、Promise 执行顺序示例、D2 与阶段 1 模拟异步加载已完成，并完成第一周验收。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C13。** 按指定提前完成正文、异步/请求示例与阶段 2 静态 JSON 加载；F1 保留队列。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C14。** 按指定提前完成正文、存储/恢复示例与阶段 2 本地副本、导入导出；F1 保留队列。
- **2026-10-16：用户要求在最新计划与重做的 C03 基础上开发 C15。** 按指定提前完成 CSS 课程、布局实验与阶段 2 响应式库存页；F1 保留队列。
- **2026-10-17：用户要求等 C15 完成后，按最新计划与重做的 C03 开发 C16。** 已完成模块课、ES 版本速查、D2 与阶段 2 ESM 拆分；F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C17。** Node 课程、13 个固定输出示例与阶段 3 库存报表已完成；网页对照未运行，已标注，F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C18。** 已完成 npm 课程、隔离安装实验、D2 与阶段 3 scripts，F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C19。** 已完成 Yarn/pnpm/Bun 课程与仓库外隔离实验，每课门禁及 Pages 核验通过；F1 保留队列。
- **2026-10-17：用户要求按最新计划与重做的 C03 开发 C20。** 已完成构建/UT 课程、Vite 复用阶段 2 页面、38 条 Vitest 回归与独立 TS 失败实验；每课门禁及 Pages 核验通过，F1 保留队列。

## 当前状态

| 项目 | 状态 |
| --- | --- |
| 网站 | [socoo123.github.io/js_web](https://socoo123.github.io/js_web/)；推送 main 后由 Actions 自动部署 |
| 工程 | Node 24.22.0、npm 11.19.1、Astro 7.3.8、Starlight 0.42.6；根目录只有一个 package-lock.json |
| 已发布 | 20 / 48（C01–C20）；C20 每课门禁与线上核验通过 |
| 贯穿项目 | 阶段 1–3 已完成；阶段 3 含 Node 报表、Vite 构建、Vitest 回归与独立依赖锁 |
| D2 | 0.9.0 + Dagre + Noto Sans SC；已有 11 张图，新增 c18-npm-install-layout |
| 自动门禁 | T0 已实现：内容 lint、固定输出示例、自动发现课程与 D2 产物；已接入 build |
| 学习进度功能 | 未实施（F1） |
| React islands | 未接入，没有实际需求前不安装 |

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

发布新课时在表格末尾加一行。验证细节写进 examples README，这里不写。

## 周验收记录

- 建站与 C01–C05（2026-10-15，旧流程）：本地和线上 Pages 都检查过 1280px/360px、亮暗模式、D2 中文、折叠答案、禁用 JS 后阅读、搜索、代码复制，全部通过。
- T0 配置调整与 C06（2026-10-16）：本地 1280px/360px、亮暗模式、D2、折叠答案、代码复制、三个关键词搜索及禁用 JS 阅读通过。
- C12 / 第一周验收（2026-10-16）：C01–C12 及首页/路线页的 1280px/360px、亮暗模式、9 张 D2 中文、折叠答案、代码复制、三关键词搜索与禁用 JS 阅读通过；阶段 1 业务参考值一致。

## 已知问题（不阻塞）

- Starlight 自定义 404 与内部路由在构建时有一条优先级提示，实际的 404.html 正常。
- 上游 Pages Actions 有 Node 20 的弃用提示；runner 实际使用 Node 24，部署成功。升级 Actions 时复查。

## 下一步

完整队列见 PLAN §8。

P1、C01–C05 重构、T0、C06–C20 与 Q1 已完成；C20 每课门禁与 Pages 核验通过。验证明细见 examples/c20。

1. **F1 本地学习进度**：按 PLAN §8 实施「标记完成」、路线状态、导入导出与损坏恢复。
2. **C21 React 来由、JSX 与第一个组件**：核对 React/Vite 官方入门命令，建立阶段 4，用函数组件表达商品卡片。

## 本文件的更新规则

- 每发布一课：在「已发布课程」加一行，更新「当前状态」和「下一步」。不写过程日志。
- 每次周验收：在「周验收记录」写不超过 3 行。
- 用户提出新要求：在「用户要求的变更记录」加一行。
- 本文件保持在 120 行以内。
