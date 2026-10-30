# Java → JavaScript 学习站

面向**会 Java、初学前端**的开发者，用中文从 HTML/CSS 和浏览器讲起，逐步掌握 JavaScript、工程工具、React、开源组件与 SAP UI5。**48 课、5 个 Lab、一个长期库存工作区**；用任务、代码、预期结果、有价值的 Java 对照、调试与测试连起整条学习路径。

48 课必修正文、四张速查页、14 张 D2 机制图与本地阅读进度保留。当前学习导航以 Lab 为主：阶段内连续修改，阶段间可用固定快照补课。C23/C41 分别接正式 C22/C40，L4 保留 React 主应用并提供四种并列适配，L5 回到 React 主应用交付。实际发布版本、验证范围与维护状态以 [STATUS](docs/STATUS.md) 和 [阶段记录](labs/records/)为准。

**[从 Lab 开始跟做](https://socoo123.github.io/js_web/labs/) · [48 课学习路线](https://socoo123.github.io/js_web/roadmap/) · [在线阅读](https://socoo123.github.io/js_web/) · [C48 自测与复盘](https://socoo123.github.io/js_web/07-project/c48-review-next-steps/)**

## 学员从这里开始

在线阅读不用安装课程网站。先按 [Lab 入口](https://socoo123.github.io/js_web/labs/)准备 Node 24，将 C00 初始包解压到新的空目录 `inventory/`，在其中执行一次：

```sh
npm ci
npm run lab -- start C01
npm run lab -- dev
```

打开终端地址，应看到 P001 机械键盘、库存 12 件，再从 [C01](https://socoo123.github.io/js_web/01-history-web/c01-story-ecosystem/)开始。启动骨架已提供；npm、模块与框架原理会按课解释。已克隆仓库也可直接在 `labs/inventory/` 跟做，不必安装根目录网站依赖。

### 五个 Lab 与固定起点

| Lab / 课程 | 补课起点（2026.10-v2.5） | 阶段交付 |
| --- | --- | --- |
| [L1 库存规则与数据](https://socoo123.github.io/js_web/labs/l1/) · C01–C10 | [C00](https://socoo123.github.io/js_web/downloads/inventory/2026.10-v2.5/C00.tar.gz) | 校验、草稿、筛选统计、集合与撤销 |
| [L2 可用的原生库存页](https://socoo123.github.io/js_web/labs/l2/) · C11–C20 | [C10](https://socoo123.github.io/js_web/downloads/inventory/2026.10-v2.5/C10.tar.gz) | 列表、请求、存储、CSS、模块、Node 报表与 UT |
| [L3 React 库存应用](https://socoo123.github.io/js_web/labs/l3/) · C21–C36 | [C20](https://socoo123.github.io/js_web/downloads/inventory/2026.10-v2.5/C20.tar.gz) | 从 JSX 到状态、表单、路由、缓存、测试与恢复 |
| [L4 组件库与 UI5 适配](https://socoo123.github.io/js_web/labs/l4/) · C37–C44 | [C36](https://socoo123.github.io/js_web/downloads/inventory/2026.10-v2.5/C36.tar.gz) | 四个并列 adapter，共用业务规则与 P004 编辑场景 |
| [L5 调试与静态交付](https://socoo123.github.io/js_web/labs/l5/) · C45–C48 | [C44](https://socoo123.github.io/js_web/downloads/inventory/2026.10-v2.5/C44.tar.gz) | 保留的 React 主应用：排错、生产路径、风险回归与现场增量 |

该发行格式提供 C00–C48 快照及 [SHA-256 清单](https://socoo123.github.io/js_web/downloads/inventory/2026.10-v2.5/manifest.json)。C00 是初始工程，Cnn 是该课完成参考态；例如 C20 是 C21 的起点，不是 L3 答案。正常跟做一直用自己的目录，不每天下载完成解。历史包和 48 个课程 URL 保留。

### 暂停与恢复

在 `inventory/` 执行 `npm run lab -- status` 查看任务，`npm run lab -- start Cnn` 选择下一课；`start` 不改源码。`npm run lab -- check Cnn` 检查当前文件，`npm run lab -- compare Cnn` 只读对照。

暂停在 `notes/next.md` 记当前课、已改文件、观察结果和下一步。需要补课才用 `npm run lab -- restore C20 ../inventory-react` 另存到**新的空目录**；目标非空拒绝，不覆盖作业。跨发行版先保留旧工程，按 [升级说明](https://socoo123.github.io/js_web/labs/#从较早发行版继续)合并自己的源码、笔记、测试与 scripts，再用新版锁安装；不搬旧 `node_modules`。

### L5 的本地交付

从 C44 保留的 `src/react/` 继续，不切到 UI5 React adapter。四课留下 `notes/debug.md`、`notes/delivery.md`、`notes/test-plan.md`、`notes/final-review.md`；先保管个人快照，再按 C45 准备固定数据的 `baseline.json`，每次独立实验前导入。

C46 在现有 `vite.config.js` 增加 `base: "/js_web/demos/inventory/"`，保留 source map 与 test 配置。**以下命令在学员 `inventory/` 执行，不在网站根目录执行：**

```sh
npm run lab -- start C46
npm run lab -- build
LAB_STATIC_ROOT=dist/src-react node tools/static-react-server.mjs
```

默认地址是 `http://127.0.0.1:8068/js_web/demos/inventory/`。必须保留 `LAB_STATIC_ROOT=dist/src-react`：该模式只读现有产物，不重建、不修正 base、没有 SPA fallback；省略环境变量会进入旧的重新构建冒烟模式。改源码后先重新 build；运行本课或后续 `check` 前 Ctrl+C 停止手工预览，避免占用 8068 端口。

C47 用同步 HashRouter 和四项风险检查覆盖坏快照、逐字输入、失败重试、路径/键盘/刷新；C48 把 URL 的 `stock=low` 与搜索/分类取交集，初始只显示 P004/P006、8 件/539200 分，清除后恢复 6/52/2634800。具体步骤与验收见 [L5](https://socoo123.github.io/js_web/labs/l5/)；本地构建和预览不等于线上演示已部署。

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

先看本课任务卡，确认起点和改动位置；在当前工作区先预测再运行，收集错误证据、修复、检查，卡住后再展开提示与答案。Lab 收尾包含在每天的预算中。DevTools、React DevTools、Node inspect、Vitest/RTL 和 Playwright 贯穿学习过程，Jest 用于理解已有工程的测试选择。

在线阅读无需安装本仓库。标注「自己尝试」的内容在自己的浏览器或本地工程运行，环境、步骤与预期结果见正文；每课文件及实际验证范围在 `examples/cNN/README.md`。TypeScript 是短桥接与选修，不是开始学习的前置条件。

## 本地启动网站

这是维护课程网站的入口，**不是学员启动 Lab 的步骤**。网站使用 Astro + Starlight + Markdown/MDX 静态生成，搜索使用 Pagefind，机制图由 D2 构建为 SVG；站点进度交互使用原生浏览器脚本。

仓库固定 **Node 24.22.0 + npm 11.19.1**，以 [.node-version](.node-version) 和 [package.json](package.json) 为准。先用已有版本管理器或 [Node 官方下载](https://nodejs.org/en/download)切换版本，再执行：

```sh
git clone https://github.com/socoo123/js_web.git
cd js_web
node --version
npm --version
npm ci
npm run dev -- --host 127.0.0.1
```

打开终端给出的 `/js_web/` 地址，默认是 `http://127.0.0.1:4321/js_web/`。

完整构建前，在仓库根目录准备额外的验证环境：

```sh
npm ci --prefix labs/inventory
npm ci --prefix examples/inventory/04-react
npm exec --prefix labs/inventory -- playwright install chromium
npm run setup:diagrams
```

`examples/inventory/04-react` 的锁定依赖仍供 C32 等旧固定输出使用，它不是主线学员要切换的工程。Lab 与站点 F1 浏览器测试统一使用 `labs/inventory` 锁定的 Playwright 和上面准备的 Chromium，不必再为 F1 准备旧阶段浏览器。根目录网站只用 npm 和唯一根锁；Lab 与保留参考工程各用自己的独立锁。Linux CI 安装 Chromium 时加 `--with-deps`，补齐系统依赖。

D2 准备脚本需要 Bash、curl、tar、Python 3，以及 `shasum` 或 `sha256sum`；首次下载工具与中文字体需要联网。自动准备支持 macOS/Linux 的 arm64、x64，已实测 macOS arm64 与 Linux x64；其他环境与手动准备方式见 [D2 说明](diagrams/README.md)。

构建会实际运行 Java 对照，需要 JDK 21（`java --version`）。自动组装和真实源码检查的命令映射见下表；只看正文完成的独立读者抽验另记在阶段记录中，二者不混为一种证据。

构建并检查生产预览，在仓库根目录执行：

```sh
npm run check
npm run build
npm run preview -- --host 127.0.0.1
```

打开终端的 `/js_web/` 地址，默认是 `http://127.0.0.1:4321/js_web/`。Pagefind 索引在生产构建时生成，搜索验收使用生产预览。开发与预览服务请分别启动，端口以终端输出为准。安装与排错细节见 [DEPLOYMENT](docs/DEPLOYMENT.md)。

## 旧七阶段工程：保留参考

这些目录保存第一版最终实现，用于查阅和旧验证路径。**必做主线从 Lab 进入，不按下表反复切换工程。** 所有阶段使用[同一份商品数据](examples/shared/products.json)：初始 6 种商品、总库存 52、总价值 2634800 分。

| 阶段与运行说明 | 对应课程 | 交付内容 |
| --- | --- | --- |
| [01-core](examples/inventory/01-core/README.md) | C06–C10、C12 | 纯 JS 库存模块、筛选统计、索引/分组、撤销栈、分类树与异步加载 |
| [02-web](examples/inventory/02-web/README.md) | C11、C13–C16 | 原生页面、请求、筛选编辑、存储/导入导出、响应式布局与 ESM |
| [03-tooling](examples/inventory/03-tooling/README.md) | C17、C18、C20 | Node 报表、npm scripts、Vite 构建与 Vitest |
| [04-react](examples/inventory/04-react/README.md) | C21–C36、C45–C47 | React 库存应用、表单/CRUD、持久化、详情路由、请求与测试 |
| [05-antd](examples/inventory/05-antd/README.md) | C38 | Ant Design 表格、编辑弹窗、校验与主题 |
| [06-openui5](examples/inventory/06-openui5/README.md) | C40–C42 | XML View、Controller、JSONModel、绑定、路由、i18n 与 OData V2 mock |
| [07-ui5-react](examples/inventory/07-ui5-react/README.md) | C43–C44 | React + UI5 Web Components 表单/列表；原生组件实验另见 [C43](examples/c43/README.md) |

如需运行旧参考，按各自 README 安装和启动；仍被固定输出或检查依赖的安装路径保留。逐课 `examples/cNN/README.md` 记录示例、精确环境和验证结果，不是另一套日常作业。

Pages 发布课程网站与学习包。Lab 应用按课程在本地构建和严格静态预览，默认 `/js_web/demos/inventory/` 是生产目标，不是已经上线的演示承诺。数据编辑在浏览器内存或本地存储，UI5 使用静态教学数据或浏览器内 mock；Pages 不运行 Node 后端。

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
| `npm run build:labs` | 生成版本化学习包并核对冻结源码；不运行整站构建 |
| `npm run test:labs` | 工作区/恢复/快照与受控片段契约 |
| `npm run test:lab-walkthrough` | C00→C20 连续源码及 C03/C23/C41 片段自动组装、错误红绿；不重新生成下载包，不等同独立读者验收 |
| `npm run test:lab-react` | C21–C36 各自真实快照的必要前置、组件、请求、浏览器与测试检查 |
| `npm run test:lab-ui5` | C37–C44 连续快照、四个 adapter 共同场景及 UI5 专项检查 |
| `npm run test:lab-delivery` | C44→C48 实际交付链，入口为 `node scripts/verify-delivery-lab.mjs` |
| `npm run test:progress` | 进度格式、合并、备份与故障恢复 |
| `npm run build` | 学习包/冻结源码 → Lab/片段契约 → Java 对照 → 课程 lint/固定输出 → F1 数据 → 路线/D2 → Astro/Pagefind → 页面、全部发行包 SHA/源码清单与子路径资源检查 |
| `npm run check:build` | 检查已有 `dist/` 的页面、链接、资源、折叠区、进度、速查导航与全部发行版下载包 |

CI 在同一源码与环境下执行一次 `check`、一次完整 `build`，再将 walkthrough、react、ui5、delivery 四条行为门禁各跑一次。四条行为命令不重新打包；`build` 也不包含它们。不要在 `build` 前后再全量重跑它已包含的子命令，单项命令用于定位失败。

旧 `examples/inventory/04-react` 的 `npm run lint`、`npm test`、`npm run build` 检查另一份仍被引用的源码，在该目录各执行一次，不能用当前 Lab 的检查替代。故意失败的 `test:bug`、`lint:bug` 等旧参考命令是教学实验，单独运行。完整发布顺序见 [DEPLOYMENT](docs/DEPLOYMENT.md)。

全站视觉/F1 浏览器、线上下载核验与独立读者验收另做，不在根 `build` 内。站点进度浏览器回归复用 `labs/inventory` 锁定的 Playwright；完成上面的工作区依赖/Chromium 准备和网站构建后，可直接运行以下流程。

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
src/content/docs/       48 课正文、首页、路线、五个 Lab 与四张速查页
src/components/         课程包装、学习进度与主题组件
src/lib/                进度数据校验、保存与恢复
src/scripts/            浏览器进度交互
src/styles/             站点样式
src/assets/diagrams/    D2 生成的 SVG
diagrams/               D2 源码、字体许可与构建说明
labs/inventory/         学员长期库存工作区（C00）
labs/reference/         作者参考起点与逐课改动
labs/releases/          冻结发行包与校验清单
labs/records/           实际跟做、测试和发布证据
examples/c01…c48/       每课机制参考、预期输出与验证记录
examples/shared/        固定库存数据
examples/inventory/     旧七阶段参考工程，保留必要验证依赖
scripts/                内容/示例/产物检查、路线同步与图构建
tests/                  工作区/片段契约、站点进度与浏览器回归
docs/                   计划、规范、架构、来源与状态
.github/workflows/      GitHub Pages 检查、构建与发布
```

## 维护与部署

| 文档 | 用途 |
| --- | --- |
| [STATUS](docs/STATUS.md) | 实际完成状态、发布记录、已知问题与下一步 |
| [PLAN](docs/PLAN.md) | 三阶段收尾、固定数据、验收、主/子 agent 协作与接续提示词 |
| [Lab 设计](labs/README.md) | 五个 Lab 的固定起点、任务边界、共同场景与恢复契约 |
| [CURRICULUM](docs/CURRICULUM.md) | 48 课范围、学习节奏与选修方向 |
| [CONTENT_GUIDE](docs/CONTENT_GUIDE.md) | 写课规范；修改课程前必读 |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | 内容模型、进度、搜索、D2 与站点边界 |
| [DEBUG_TESTING](docs/DEBUG_TESTING.md) | 调试与测试教学路线 |
| [SOURCES](docs/SOURCES.md) | 官方来源、核查日期与实际验证范围 |
| [DEPLOYMENT](docs/DEPLOYMENT.md) | 环境安装、构建、文章同步与 Pages 发布 |
| [AGENTS](AGENTS.md) | 仓库协作约定与恢复入口 |

推送 `main` 或手动触发[工作流](.github/workflows/deploy.yml)后，Actions 安装锁定依赖、执行相应门禁并发布 `dist/`；具体命令以工作流与 [DEPLOYMENT](docs/DEPLOYMENT.md)为准。发布地址为 `https://socoo123.github.io/js_web/`，资源和链接必须保留 `/js_web/` 子路径。对应提交的 Pages 成功后还要核验课程、Lab 与下载校验值，实际结果见 [Actions](https://github.com/socoo123/js_web/actions)和阶段记录。当前工作流未配置 PR 自动触发。

恢复工作时发送 **`JS_WEB_START`**，先读 STATUS 的真实下一步；若已写“本轮改版完成，下一阶段：无”，只按用户提出的具体维护需求行动，不自动开启另一轮。阶段实施和主/子 agent 验收协议保留在 PLAN §7–8。

## 当前范围与待办

- X01–X10 是待展开的选修方向，尚无独立课程，不计入 48 课必修完成度。
- 实测以 macOS/Chrome 和 Pages Linux 构建为主；Firefox/Safari、Windows、真实手机与屏幕阅读器未做完整验收，各课保留具体标注。
- 仓库尚未选定项目级许可证，未添加 `LICENSE`；第三方字体的 [OFL 许可](diagrams/NotoSansSC-OFL.txt)已保留。

反馈问题可在 [Issues](https://github.com/socoo123/js_web/issues)附上课程地址、复现步骤、预期与实际结果；涉及运行时再补浏览器/Node 版本。
