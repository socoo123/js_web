# Java → JavaScript 学习站

面向**会 Java、初学前端**的开发者，用中文从 HTML/CSS 和浏览器讲起，逐步掌握 JavaScript、工程工具、React、开源组件与 SAP UI5。以同一个库存管理应用贯穿课程，每课包含可运行示例、预期输出、Java 对照、调试任务和练习答案。

**48 课必修主线已完结**，配套七阶段库存项目、四张速查页、14 张 D2 机制图与本地学习进度。完成与验证记录见 [STATUS](docs/STATUS.md)。

**[在线学习](https://socoo123.github.io/js_web/) · [48 课学习路线](https://socoo123.github.io/js_web/roadmap/) · [从 C01 开始](https://socoo123.github.io/js_web/01-history-web/c01-story-ecosystem/) · [C48 自测与复盘](https://socoo123.github.io/js_web/07-project/c48-review-next-steps/)**

## 课程地图

| 课程 | 学习内容 | 正文源码 |
| --- | --- | --- |
| C01–C02 | JS 历史与生态，HTML/CSS、浏览器和第一个调试现场 | [历史与 Web](src/content/docs/01-history-web/) |
| C03–C10 | 类型与转换、作用域、对象、闭包、this/原型、数组与集合、栈/队列/树 | [语言与数据结构](src/content/docs/02-language-data/) |
| C11–C16 | DOM/事件/表单、Promise、请求、存储、响应式布局与模块 | [浏览器、异步与模块](src/content/docs/03-async-modules/) |
| C17–C20 | Node 与浏览器的边界，npm/Yarn/pnpm/Bun、构建与第一次单元测试 | [运行时与工程工具](src/content/docs/04-runtime-tooling/) |
| C21–C36 | 16 课 React：组件、状态快照、表单、Context、Effect、请求竞态、路由、Query、现代 API、性能与测试 | [React](src/content/docs/05-react/) |
| C37–C44 | 组件选型、Ant Design、Fiori、SAPUI5/OpenUI5、原生 UI5 Web Components 与 React 包装库 | [组件生态与 UI5](src/content/docs/06-components-ui5/) |
| C45–C48 | 全链路排错、静态交付与 Pages、测试选择、综合复盘与后续路线 | [项目交付](src/content/docs/07-project/) |

随时查阅：[ES 版本](https://socoo123.github.io/js_web/reference/es-versions/)、[Java ↔ JS](https://socoo123.github.io/js_web/reference/java-js/)、[React Hooks](https://socoo123.github.io/js_web/reference/react-hooks/)、[UI5 家族](https://socoo123.github.io/js_web/reference/ui5-family/)；[速查页源码](src/content/docs/reference/)。

## 怎么学

| 节奏 | 安排 |
| --- | --- |
| 4 周主线 | 每周 6 天，每天 2 课，共 24 个学习日；每天 3–4 小时，包含阅读、练习、调试与项目 |
| 8 周慢速版 | 每周 6 天，每天 1 课；按相同课号顺序推进，增加复习与独立练习 |

先预测输出，再运行示例，完成练习后展开答案，最后把改动接回库存项目。DevTools、React DevTools、Node inspect、Vitest/RTL 和 Playwright 贯穿学习过程，Jest 用于理解已有工程的测试选择。

在线阅读无需安装本仓库。标注「自己尝试」的内容在自己的浏览器或本地工程运行，环境、步骤与预期结果见正文；每课文件及实际验证范围在 `examples/cNN/README.md`。TypeScript 是短桥接与选修，不是开始学习的前置条件。

## 本地启动网站

网站使用 **Astro + Starlight + Markdown/MDX** 静态生成，搜索使用 Pagefind，机制图由 D2 构建为 SVG。React 课程使用独立 Vite 工程；当前站点的进度交互使用原生浏览器脚本。

仓库固定 **Node 24.22.0 + npm 11.19.1**，以 [.node-version](.node-version) 和 [package.json](package.json) 为准。先用已有版本管理器或 [Node 官方下载](https://nodejs.org/en/download)切换版本，再执行：

```sh
git clone https://github.com/socoo123/js_web.git
cd js_web
node --version
npm --version
npm ci
npm ci --prefix examples/inventory/04-react
npm run setup:diagrams
npm run dev -- --host 127.0.0.1
```

打开终端给出的 `/js_web/` 地址，默认是 `http://127.0.0.1:4321/js_web/`。阶段 4 的依赖供 C32 固定输出示例和浏览器测试复用，全量构建前需要安装。

D2 准备脚本需要 Bash、curl、tar、Python 3，以及 `shasum` 或 `sha256sum`；首次下载工具与中文字体需要联网。自动准备支持 macOS/Linux 的 arm64、x64，已实测 macOS arm64 与 Linux x64；其他环境与手动准备方式见 [D2 说明](diagrams/README.md)。

构建并检查生产预览，在仓库根目录执行：

```sh
npm run check
npm run build
npm run preview -- --host 127.0.0.1
```

打开终端的 `/js_web/` 地址，默认是 `http://127.0.0.1:4321/js_web/`。Pagefind 索引在生产构建时生成，搜索验收使用生产预览。开发与预览服务请分别启动，端口以终端输出为准。安装与排错细节见 [DEPLOYMENT](docs/DEPLOYMENT.md)。

## 七阶段库存项目

每个目录保存对应阶段的最终参考实现，课程正文说明当课怎样推进。所有阶段使用[同一份商品数据](examples/shared/products.json)：初始 6 种商品、总库存 52、总价值 26,348.00 元。

| 阶段与运行说明 | 对应课程 | 交付内容 |
| --- | --- | --- |
| [01-core](examples/inventory/01-core/README.md) | C06–C10、C12 | 纯 JS 库存模块、筛选统计、索引/分组、撤销栈、分类树与异步加载 |
| [02-web](examples/inventory/02-web/README.md) | C11、C13–C16 | 原生页面、请求、筛选编辑、存储/导入导出、响应式布局与 ESM |
| [03-tooling](examples/inventory/03-tooling/README.md) | C17、C18、C20 | Node 报表、npm scripts、Vite 构建与 Vitest |
| [04-react](examples/inventory/04-react/README.md) | C21–C36、C45–C47 | React 库存应用、表单/CRUD、持久化、详情路由、请求与测试 |
| [05-antd](examples/inventory/05-antd/README.md) | C38 | Ant Design 表格、编辑弹窗、校验与主题 |
| [06-openui5](examples/inventory/06-openui5/README.md) | C40–C42 | XML View、Controller、JSONModel、绑定、路由、i18n 与 OData V2 mock |
| [07-ui5-react](examples/inventory/07-ui5-react/README.md) | C43–C44 | React + UI5 Web Components 表单/列表；原生组件实验另见 [C43](examples/c43/README.md) |

先试纯 JS 项目，无需安装示例依赖，在仓库根运行：

```sh
node examples/inventory/01-core/demo.js
```

启动 React 项目，在另一个终端从仓库根执行：

```sh
cd examples/inventory/04-react
npm ci
npm run dev -- --host 127.0.0.1
```

其余阶段按各自 README 运行。阶段工程有独立的 `package.json` 与锁文件；网站根目录只使用 npm 和根锁文件。Yarn/pnpm/Bun 的比较放在 [C19 隔离实验](examples/c19/README.md)。

Pages 发布课程网站；七阶段库存应用供本地练习，未作为在线应用部署。数据编辑发生在浏览器内存或本地存储中，UI5 mock 使用静态教学数据。

## 学习进度与备份

在每课页底「标记完成」或「撤销完成」，[学习路线](https://socoo123.github.io/js_web/roadmap/)显示逐课状态与总进度。路线页可导出、导入 JSON，导入会合并已完成课程。

进度保存在当前浏览器，换浏览器或设备前先导出备份。记录损坏时可恢复上一次有效备份、导入文件或重新开始；存储受限时有提示。禁用 JavaScript 仍可阅读课程与展开练习答案。

## 检查与测试

以下命令在仓库根执行：

| 命令 | 检查内容 |
| --- | --- |
| `npm run lint:lessons` | 48 课结构、篇幅、代码块和教学约定 |
| `npm run examples -- c03` | 指定课程的固定输出示例；省略 `-- c03` 检查全部 |
| `npm run check` | Astro 内容与类型 |
| `npm run test:progress` | 进度格式、合并、备份与故障恢复 |
| `npm run build` | 课程 lint → 全量固定输出 → 进度数据测试 → 路线同步 → D2 → Astro/Pagefind → 页面与子路径资源检查 |
| `npm run check:build` | 检查已有 `dist/` 的页面、链接、资源、练习折叠区、进度与速查导航 |

项目测试在对应阶段目录运行。阶段 4 的 `npm run lint`、`npm test`、`npm run build` 已接入 Pages CI；其他阶段的单元/浏览器测试入口见各阶段 README。故意失败的 `test:bug`、`lint:bug` 等是教学练习，单独运行。

站点进度浏览器回归复用阶段 4 锁定的 Playwright。完成上述安装和网站构建后，首次准备浏览器：

```sh
cd examples/inventory/04-react
npx playwright install chromium
cd ../../..
```

终端一，在仓库根启动生产预览并保持运行：

```sh
npm run preview -- --host 127.0.0.1 --port 8751 --ignore-lock
```

终端二，在仓库根运行：

```sh
npm run test:progress:browser
```

`--ignore-lock` 让本次预览使用独立端口，避免复用已有的预览进程。默认地址为 `http://127.0.0.1:8751/js_web/`，可通过 `PROGRESS_BASE_URL` 指定其他地址。测试使用独立浏览器上下文，检查标记、跨标签同步、导入导出、损坏恢复、存储故障与禁用 JS 阅读，截图保存在被忽略的 `.cache/qa/f1/`。

## 仓库结构

```text
src/content/docs/       48 课正文、首页、路线与四张速查页
src/components/         课程包装、学习进度与主题组件
src/lib/                进度数据校验、保存与恢复
src/scripts/            浏览器进度交互
src/styles/             站点样式
src/assets/diagrams/    D2 生成的 SVG
diagrams/               D2 源码、字体许可与构建说明
examples/c01…c48/       每课示例、预期输出与验证记录
examples/shared/        固定库存数据
examples/inventory/     七阶段库存项目
scripts/                内容/示例/产物检查、路线同步与图构建
tests/                  站点进度的数据与浏览器回归
docs/                   计划、规范、架构、来源与状态
.github/workflows/      GitHub Pages 检查、构建与发布
```

## 维护与部署

| 文档 | 用途 |
| --- | --- |
| [STATUS](docs/STATUS.md) | 实际完成状态、发布记录、已知问题与下一步 |
| [PLAN](docs/PLAN.md) | 总目标、固定数据、项目阶段与验收标准 |
| [CURRICULUM](docs/CURRICULUM.md) | 48 课范围、学习节奏与选修方向 |
| [CONTENT_GUIDE](docs/CONTENT_GUIDE.md) | 写课规范；修改课程前必读 |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | 内容模型、进度、搜索、D2 与站点边界 |
| [DEBUG_TESTING](docs/DEBUG_TESTING.md) | 调试与测试教学路线 |
| [SOURCES](docs/SOURCES.md) | 官方来源、核查日期与实际验证范围 |
| [DEPLOYMENT](docs/DEPLOYMENT.md) | 环境安装、构建、文章同步与 Pages 发布 |
| [AGENTS](AGENTS.md) | 仓库协作约定与恢复入口 |

推送 `main` 或手动触发[工作流](.github/workflows/deploy.yml)后，Actions 安装锁定依赖、检查 React 参考项目与课程网站，再发布 `dist/`。发布地址为 `https://socoo123.github.io/js_web/`；资源和链接必须保留 `/js_web/` 子路径。实际运行结果见 [Actions](https://github.com/socoo123/js_web/actions)。当前工作流未配置 PR 自动触发。

接续维护时，在本仓库上下文中发送 **`JS_WEB_START`**，按 AGENTS 的顺序读取 STATUS、PLAN、CONTENT_GUIDE 与 CURRICULUM。主线队列已完成，后续按反馈维护。

## 当前范围与待办

- X01–X10 是待展开的选修方向，尚无独立课程，不计入 48 课必修完成度。
- 实测以 macOS/Chrome 和 Pages Linux 构建为主；Firefox/Safari、Windows、真实手机与屏幕阅读器未做完整验收，各课保留具体标注。
- 仓库尚未选定项目级许可证，未添加 `LICENSE`；第三方字体的 [OFL 许可](diagrams/NotoSansSC-OFL.txt)已保留。

反馈问题可在 [Issues](https://github.com/socoo123/js_web/issues)附上课程地址、复现步骤、预期与实际结果；涉及运行时再补浏览器/Node 版本。
