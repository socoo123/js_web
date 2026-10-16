# 当前进度与续做入口

恢复关键词：**JS_WEB_START**。最后更新：2026-10-16（C09 内容已完成，待 Pages 核验；下一课 C10）。

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

## 当前状态

| 项目 | 状态 |
| --- | --- |
| 网站 | [socoo123.github.io/js_web](https://socoo123.github.io/js_web/)；推送 main 后由 Actions 自动部署 |
| 工程 | Node 24.22.0、npm 11.19.1、Astro 7.3.8、Starlight 0.42.6；根目录只有一个 package-lock.json |
| 已发布 | 8 / 48（C01–C08）；C09 内容已完成，待 Pages 核验后确认发布 |
| 贯穿项目 | 阶段 1：筛选、排序、统计、id 索引、分类分组与标签去重；demo 固定业务参考值通过 |
| D2 | 0.9.0 + Dagre + Noto Sans SC；已有 7 张图，新增 c07-prototype-lookup |
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

发布新课时在表格末尾加一行。验证细节写进 examples README，这里不写。

## 周验收记录

- 建站与 C01–C05（2026-10-15，旧流程）：本地和线上 Pages 都检查过 1280px/360px、亮暗模式、D2 中文、折叠答案、禁用 JS 后阅读、搜索、代码复制，全部通过。
- T0 配置调整与 C06（2026-10-16）：本地 1280px/360px、亮暗模式、D2、折叠答案、代码复制、三个关键词搜索及禁用 JS 阅读通过。

## 已知问题（不阻塞）

- Starlight 自定义 404 与内部路由在构建时有一条优先级提示，实际的 404.html 正常。
- 上游 Pages Actions 有 Node 20 的弃用提示；runner 实际使用 Node 24，部署成功。升级 Actions 时复查。

## 下一步

完整队列见 PLAN §8。

P1、C01–C05 重构、T0 与 C06–C08 已完成。C09 本地门禁通过，待发布核验，明细见 examples/c09。

1. **完成 C09 发布核验**：推送后等待 Pages Actions 成功，确认新课线上地址返回 200。
2. **C10 栈、队列、树与复杂度**：继续阶段 1，加入撤销栈、头索引队列与分类树遍历。
3. **C11–C12，随后 Q1 周验收**：继续阶段 1，在 C12 后按 PLAN §6 做全套视觉验收，详见 PLAN §8。

## 本文件的更新规则

- 每发布一课：在「已发布课程」加一行，更新「当前状态」和「下一步」。不写过程日志。
- 每次周验收：在「周验收记录」写不超过 3 行。
- 用户提出新要求：在「用户要求的变更记录」加一行。
- 本文件保持在 120 行以内。
