# 当前进度与续做入口

恢复关键词：**JS_WEB_START**。最后更新：2026-10-15（C02 按 C03 范例重构）。

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

## 当前状态

| 项目 | 状态 |
| --- | --- |
| 网站 | [socoo123.github.io/js_web](https://socoo123.github.io/js_web/)；推送 main 后由 Actions 自动部署 |
| 工程 | Node 24.22.0、npm 11.19.1、Astro 7.3.8、Starlight 0.42.6；根目录只有一个 package-lock.json |
| 已发布 | 5 / 48（C01–C05）。C01–C03 已按新规范重构；C04、C05 等待 R1 整改 |
| D2 | 0.9.0 + Dagre + Noto Sans SC；已有 5 张图：c01-ecosystem、c02-page-flow、c03-value-boundary、c04-scope、c05-alias-copy |
| 自动门禁 | `lint:lessons`、`examples` 未实现（T0） |
| 学习进度功能 | 未实施（F1） |
| React islands | 未接入，没有实际需求前不安装 |

## 已发布课程

| 课 | 线上 | 示例与验证记录 | 部署记录 |
| --- | --- | --- | --- |
| C01 JavaScript 的故事与生态地图 | [打开](https://socoo123.github.io/js_web/01-history-web/c01-story-ecosystem/) | [examples/c01](../examples/c01/README.md) | 首次：[run 38662138819](https://github.com/socoo123/js_web/actions/runs/38662138819)；重构：[run 38755041902](https://github.com/socoo123/js_web/actions/runs/38755041902) |
| C02 Web 基础与第一个调试现场 | [打开](https://socoo123.github.io/js_web/01-history-web/c02-web-debugging/) | [examples/c02](../examples/c02/README.md) | 首次：[run 38663909240](https://github.com/socoo123/js_web/actions/runs/38663909240)；重构：[run 38761177588](https://github.com/socoo123/js_web/actions/runs/38761177588) |
| C03 值、类型、转换与比较 | [打开](https://socoo123.github.io/js_web/02-language-data/c03-values-types/) | [examples/c03](../examples/c03/README.md) | 范例重写：[run 38752272921](https://github.com/socoo123/js_web/actions/runs/38752272921) |
| C04 变量、作用域与控制流 | [打开](https://socoo123.github.io/js_web/02-language-data/c04-scope-control/) | [examples/c04](../examples/c04/README.md) | 同上 |
| C05 对象、引用与数据交换 | [打开](https://socoo123.github.io/js_web/02-language-data/c05-objects-json/) | [examples/c05](../examples/c05/README.md) | 同上 |

发布新课时在表格末尾加一行。验证细节写进 examples README，这里不写。

## 周验收记录

- 建站与 C01–C05（2026-10-15，旧流程）：本地和线上 Pages 都检查过 1280px/360px、亮暗模式、D2 中文、折叠答案、禁用 JS 后阅读、搜索、代码复制，全部通过。

## 已知问题（不阻塞）

- Starlight 自定义 404 与内部路由在构建时有一条优先级提示，实际的 404.html 正常。
- 上游 Pages Actions 有 Node 20 的弃用提示；runner 实际使用 Node 24，部署成功。升级 Actions 时复查。
- C05 正文里「C14 处理存储」的预告仍然有效（C14 没有变）。

## 下一步

完整队列见 PLAN §8。

P1 与 C01–C03 重构已上线。C02 正文约 7,800 字符、15 个代码块；临时内容规则、Node 1/1、Chrome 交互与故障复现、`check`/`build` 通过（T0 尚未实现）；Pages 成功，文章与新版 D2 返回 200、均与本地构建一致。

1. **T0 工具门禁**：按 PLAN §8 实现 `lint:lessons`、`examples`，让 check-build 自动发现课程，创建 `examples/shared/products.*`，修改侧栏名称。完成标准：C01–C03 零 error，C04、C05 只有 warning，`npm run examples -- c03` 12/12 通过，`npm run build` 通过。
2. **C06 函数、闭包与高阶操作**：目录 `02-language-data/c06-functions-closures.md`。内容与范围见 CURRICULUM 第 3 天和第 1 周写作范围，结构和语气对照 C03。项目从 `examples/inventory/01-core/inventory.js` 开始，写筛选工厂 `createCategoryFilter(category)`。属于难点课，正文上限 10,000 字。发布后**停下，请用户确认风格**，再做 R1。
3. **R1 整改 C04、C05**：按 PLAN §8 只做减法。

## 本文件的更新规则

- 每发布一课：在「已发布课程」加一行，更新「当前状态」和「下一步」。不写过程日志。
- 每次周验收：在「周验收记录」写不超过 3 行。
- 用户提出新要求：在「用户要求的变更记录」加一行。
- 本文件保持在 120 行以内。
