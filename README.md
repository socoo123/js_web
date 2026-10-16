# Java → JavaScript 学习网站

面向会 Java、尚未系统学习前端的开发者，用中文从 JavaScript 的历史讲到现代语言、数据结构、Node 与包管理、React、SAP UI5 和开源组件。

当前阶段：**C01–C07 正文与练习已完成，关键机制配套 D2 教学图；Astro + Starlight 网站使用 GitHub Pages 自动部署。课程逐篇发布，当前 7 / 48 课，实际部署与验证记录见 [STATUS](docs/STATUS.md)。**

- 网站：[Java → JavaScript 学习站](https://socoo123.github.io/js_web/)
- 首课：[C01 JavaScript 的故事与生态地图](https://socoo123.github.io/js_web/01-history-web/c01-story-ecosystem/)
- 第二课：[C02 Web 基础与第一个调试现场](https://socoo123.github.io/js_web/01-history-web/c02-web-debugging/)
- 最新课：[C07 this、原型与 class](https://socoo123.github.io/js_web/02-language-data/c07-this-prototypes/)
- [本地构建与自动提交/部署说明](docs/DEPLOYMENT.md)

## 已完成课程

- [C01 JavaScript 的故事与生态地图](src/content/docs/01-history-web/c01-story-ecosystem.md)：历史、Java 对照、生态分层、Console 练习与答案。
- [C01 练习与验证记录](examples/c01/README.md)：浏览器主线，Node/Java 选做对照。
- [C02 Web 基础与第一个调试现场](src/content/docs/01-history-web/c02-web-debugging.md)：HTML/CSS/DOM、页面加载、商品卡片和 DevTools 排错。
- [C02 练习与验证记录](examples/c02/README.md)：三个独立文件、手机布局、路径/加载故障与补货答案。
- [C03 值、类型、转换与比较](src/content/docs/02-language-data/c03-values-types.md)：数值精度、类型转换、比较和库存默认值。
- [C03 练习与验证记录](examples/c03/README.md)。
- [C04 变量、作用域与控制流](src/content/docs/02-language-data/c04-scope-control.md)：作用域、循环统计和断点排错。
- [C04 练习与验证记录](examples/c04/README.md)。
- [C05 对象、引用与数据交换](src/content/docs/02-language-data/c05-objects-json.md)：别名与浅复制、JSON 导入、日期与字符串。
- [C05 练习与验证记录](examples/c05/README.md)。
- [C06 函数、闭包与高阶操作](src/content/docs/02-language-data/c06-functions-closures.md)：函数值、词法作用域、闭包、筛选工厂与 Scope 调试。
- [C06 练习与验证记录](examples/c06/README.md)。
- [C07 this、原型与 class](src/content/docs/02-language-data/c07-this-prototypes.md)：调用方式、原型查找、私有字段、Inventory 类与组合。
- [C07 练习与验证记录](examples/c07/README.md)；[库存项目阶段 1](examples/inventory/01-core/README.md)。
- [D2 教学图与构建说明](diagrams/README.md)：保留源码、SVG 与固定工具/字体信息。

后续 C08–C48 仍为大纲；下一课继续数组筛选、排序与库存统计。

## 清理上下文后如何继续

在这个项目中发送关键词：**`JS_WEB_START`**。

完整示例：

> JS_WEB_START：请读取 AGENTS.md 和 docs/STATUS.md，按已保存的计划从下一项未完成任务开始。

这依靠仓库文件恢复项目上下文。换到其他目录或电脑时，先打开或克隆本仓库，再使用这个关键词。

## 计划文件

| 文件 | 内容 |
| --- | --- |
| [总计划](docs/PLAN.md) | 目标、4 周主线与 8 周节奏、网站实施顺序、验收标准 |
| [48 课课程大纲](docs/CURRICULUM.md) | 每日课程、代码练习、React 与 UI5 深度安排 |
| [网站架构](docs/ARCHITECTURE.md) | 静态站、React 演示、D2、GitHub Pages |
| [教学规范](docs/CONTENT_GUIDE.md) | Java 对照、示例、练习答案、图的使用规则 |
| [调试与测试路线](docs/DEBUG_TESTING.md) | DevTools、React 调试、Vitest/RTL、Jest 与 Playwright |
| [官方来源与版本基线](docs/SOURCES.md) | 资料链接、核查日期、版本更新规则 |
| [进度与续做入口](docs/STATUS.md) | 已完成工作、下一步、当前限制 |

## 学习节奏

每天 **3–4 小时**，每周学习 6 天，1 天休息或补课。4 周完成 48 个微课与综合项目；需要更从容时，拆为 8 周，每天 1 课并增加练习。

学习主线：历史与 Web 基础 → JS 语言和数据结构 → 异步、模块与工程工具 → 详细 React → 开源组件与 UI5 → 静态项目交付。

整个过程逐步实现同一个“库存管理小应用”，以 Java 的对象、集合、异常和工程经验作为起点。

课程不要求所有示例都在线运行。需你亲手操作的部分标注「自己尝试」，注明环境、步骤与预期结果；前端调试和单元测试贯穿课程。

## GitHub

- 仓库：<https://github.com/socoo123/js_web>
- Git 远程：`origin` → `https://github.com/socoo123/js_web.git`
- 主分支：`main`
- Pages 地址：<https://socoo123.github.io/js_web/>，实际发布状态见 [STATUS](docs/STATUS.md)。
- 技术栈：Astro + Starlight 静态站；D2 在构建时生成 SVG，React islands 按后续示例需要接入。
- 每次生成文章后按已授权流程验证、提交并推送 `main`；推送触发 GitHub Actions 自动部署 Pages。
