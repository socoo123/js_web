# 静态网站架构与部署规划

状态：48 课主线、四张速查页、七阶段库存项目、14 张 D2 图与本地学习进度已实现。Node 24.22.0、npm 11.19.1、Astro 7.3.8 与 Starlight 0.42.6 已核查并固定，只有一个根级 package-lock.json。实际发布与验证状态见 [STATUS](STATUS.md)。课程 React 示例使用独立阶段工程，站点尚无需要 React island 的交互示例。

## 技术选择

采用 **Astro + Starlight + Markdown/MDX + 少量 React islands**。

| 需求 | 方案与理由 |
| --- | --- |
| 长篇中文课程、目录和移动阅读 | Starlight 提供文档站骨架，减少重复搭建导航 |
| 代码显示与复制 | 使用现有 Expressive Code 能力，保留文件名/高亮/差异标记 |
| 课程正文 | Markdown 为主；需要嵌入组件时使用 MDX；构建成真实 HTML |
| React 示例 | 独立 Vite + React 练习工程；需要站内演示时再按需接入 island |
| 搜索 | Starlight 默认 Pagefind 静态索引，测试中文分词与英文 API 搜索 |
| 进度 | 浏览器 localStorage；不引入账号/后端 |
| 关键图 | D2 构建期生成 SVG，浏览器只显示图 |
| 部署 | GitHub Actions 构建 dist，再发布 GitHub Pages |

VitePress 同样能生成静态文档，但默认主题基于 Vue，本项目要讲大量 React；Astro 的 React 集成使示例组织更直接。无需另做一个全站 React SPA。

依据：[Astro islands](https://docs.astro.build/en/concepts/islands/)、[React 集成](https://docs.astro.build/en/guides/integrations-guide/react/)、[Starlight 内容](https://starlight.astro.build/guides/authoring-content/)、[Starlight 搜索](https://starlight.astro.build/guides/site-search/)、[VitePress](https://vitepress.dev/guide/what-is-vitepress)。

## 运行边界与示例策略

用户不要求所有示例完全在线运行。第一版重点是清楚讲解和让学习者自己操作。

| 内容 | 所需环境 | 站内呈现 |
| --- | --- | --- |
| 纯 JS 语法/数据函数 | 浏览器 Console 或本地 Node，按 API 标注 | 代码、输出、预测题、自己尝试 |
| DOM/CSS/浏览器调试 | 本地 HTML/开发服务、Chrome/Edge DevTools | 完整必要文件、操作步骤、预期现象 |
| Node/npm/Yarn/pnpm/Bun | 学习者本地终端 | 命令、版本、目录、输出与排错说明 |
| React/普通组件/UI5 React | 本地 Vite 工程 | 分阶段代码与自己尝试；少量预构建演示可选 |
| 经典 OpenUI5 | 本地 UI5 CLI 或明确 bootstrap 的静态例子 | 文件与命令、绑定/路由/调试步骤 |
| OData V2 mock | 浏览器 MockServer + 静态 metadata/JSON | 有限范围演示或自行尝试 |
| OData V4/CAP/真实 SAP | 本地或外部服务 | 选修，明确服务要求，不宣称 Pages 自带后端 |

所有示例将“在哪里尝试”和“是否实际验证”分别记录。文档核对不能等同于运行通过。

不在第一版实现任意代码在线执行器。未来若有此需求，先验证隔离、超时、资源限制和结果输出，再决定是否引入；它不阻碍课程交付。

少量 React 演示按需加载，避免在首页或每篇文章加载所有组件库。经典 UI5/大型组件库示例可以独立构建或只作为本地练习资料。

React islands 默认仍会在构建期预渲染。`client:load` 只决定客户端加载/水合时机，不会跳过预渲染；`window`、`localStorage` 等浏览器 API 放在客户端 Effect/事件中。确实依赖 DOM 注册的 UI5 示例按需用 `client:only="react"`，并提供静态说明或 fallback，不让示例妨碍正文构建与阅读。依据：[Astro client directives](https://docs.astro.build/en/reference/directives-reference/#clientonly)。

## 目录草图

以下为当前主要目录；React 练习在阶段工程中，站点进度使用原生浏览器脚本：

```text
js_web/
├── README.md
├── AGENTS.md
├── .cursor/rules/project-context.mdc
├── docs/
│   ├── PLAN.md
│   ├── CURRICULUM.md
│   ├── ARCHITECTURE.md
│   ├── CONTENT_GUIDE.md
│   ├── DEBUG_TESTING.md
│   ├── SOURCES.md
│   └── STATUS.md
├── src/
│   ├── content/docs/
│   │   ├── index.md
│   │   ├── roadmap/
│   │   ├── 01-history-web/
│   │   ├── 02-language-data/
│   │   ├── 03-async-modules/
│   │   ├── 04-runtime-tooling/
│   │   ├── 05-react/
│   │   ├── 06-components-ui5/
│   │   ├── 07-project/
│   │   └── reference/
│   ├── components/            # 课程内容包装、进度与存储受限时的主题组件
│   ├── lib/                   # 进度格式、校验、备份与恢复
│   ├── scripts/               # 学习进度的客户端增强
│   ├── assets/diagrams/       # D2 构建生成 SVG
│   └── styles/
├── diagrams/                  # D2 源文件
├── examples/
│   ├── cNN/                   # 每课的独立例子、.expected.txt 与 README
│   ├── shared/                # PLAN §3.1 固定样例数据
│   └── inventory/             # 当前第一版的 7 个阶段；改版映射见新 PLAN §9
├── scripts/                   # D2、路线同步、产物检查、课程 lint 与固定输出检查
├── public/                    # 静态数据与可下载练习资料
├── tests/                     # 必要的站点关键行为验收
├── astro.config.mjs
├── package.json
├── package-lock.json
├── .node-version
└── .github/workflows/         # 用户提前要求部署，已创建 Pages 工作流
```

课程示例用 `.js/.jsx`，站点工程可使用适量 TypeScript。读者不需要先掌握复杂泛型才能开始学习。

## 内容模型

**当前约定**：课程 frontmatter 只用 `title`、`description`、`sidebar.order`；课号、周次、前置、时间写在页首信息行（见 CONTENT_GUIDE §3），验证明细写在 examples README。学习进度读取标题开头的稳定课号，不新增字段。下面的扩展字段是备选设计，没有实施；以后确需它们时，先扩展 `src/content.config.ts` 的 schema，再批量写入。

备选的扩展字段：

```yaml
title: C23 useState：状态快照与更新队列
description: 从 Java 的可变字段思维转向 React 的渲染快照。
lessonId: C23
week: 2
day: 12
prerequisites: [C06, C21, C22]
difficulty: core
estimatedMinutes: 40
execution: local-react
verification: reviewed
verifiedWith: null
lastReviewed: 2026-10-15
```

`estimatedMinutes` 表示阅读/跟做预算，另显示独立练习预算；不是承诺完成整课项目只要 40 分钟。`verification` 按具体示例记录更精确，页面聚合不得掩盖未执行的例子。

来源链接放在正文相关说明附近，并在课尾给出官方延伸阅读。课号不可随标题调整而变化。

## 进度与搜索

进度键：`js_web:progress:v1`。已实现的格式为 `{"version":1,"completed":["C01","C02"]}`，只记录主动标记完成的课号。原设想的最近阅读位置和更新时间没有纳入 F1。

- localStorage 不可用、JSON 损坏或包含已删除课号时，页面继续可读并给出恢复方式。
- 完成标记由学习者控制；翻页不等于学会。
- 导入校验结构、C01–C48 课号、版本和 64 KB 大小限制，去重后合并；导出纯 JSON。
- 保存前把上一份有效记录写入 `js_web:progress:v1:backup`。读取损坏时先提示，用户可恢复备份、导入文件或重新开始；修复前把损坏原文保留到 `js_web:progress:v1:damaged`。写入失败不显示保存成功。
- 同源标签页通过 `storage` 事件更新状态；禁用 JS 时隐藏操作控件，保留正文、路线和恢复说明。
- 默认只保存在当前浏览器，不宣称 GitHub 会同步学习进度。
- `CourseContent.astro` 复用 Starlight 的 MarkdownContent，只在课程页底和路线页添加进度。主题组件沿用 Starlight 图标与选择器，对存储读写加异常处理。

搜索采用静态索引；在生产构建后验证“闭包”“状态快照”“断点”“单元测试”“UI5”“useEffect”“npm ci”等查询。开发服务器里能显示页面不代表搜索索引正确。

## D2 构建

1. 源码放 `diagrams/`，有稳定文件名和对应课号。
2. 实施时选择并固定 D2 CLI 版本，使用无需商业许可的布局引擎。
3. 一条构建脚本逐个生成 SVG 到 `src/assets/diagrams/`，供课程相对导入。
4. D2 先构建，再进行 Astro 构建；非零退出必须阻止发布，不能只检查文件存在。
5. 中文字体、布局、文字大小和亮暗模式实际渲染检查；统一风格，避免图内塞长代码。
6. 每图有 alt/邻近文字解释；流程即使不看图也能理解。

依据：[D2 导出](https://www.d2lang.com/tour/exports/)、[D2 CLI](https://d2lang.com/tour/man/)。C01 使用 D2 0.9.0 + Dagre；`npm run setup:diagrams` 准备并校验工具/字体，`npm run build` 先执行图构建。字体来源、SHA-256 与复现命令见 [diagrams/README.md](../diagrams/README.md)。工具在被忽略的 `.cache/` 中，未全局安装；Astro 产物检查校验带 `/js_web/` 的 SVG 资产路径。

## Pages 子路径与路由

已实现的 Astro 配置：

```js
site: 'https://socoo123.github.io',
base: '/js_web/',
output: 'static',
trailingSlash: 'always'
```

- 课程对应真实生成的 HTML，深层地址首次打开和刷新都成功。
- 参数路由如有使用，构建时列出全部课路径。
- 手写链接与 public 资源由统一 helper 加 base；不要散落硬编码的 `/assets/...`。
- Markdown 图片优先相对导入，构建资产使用 Astro 的处理能力。
- 独立 React 练习可用 HashRouter；课程正文采用普通静态路径，不以 SPA 404 重写作为部署基础。
- 搜索索引、字体、图片、下载和示例数据必须一起通过子路径验收。

依据：[Astro Pages 部署](https://docs.astro.build/en/guides/deploy/github/)、[Astro 路由](https://docs.astro.build/en/guides/routing/)、[React Router HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter)。

## 依赖与命令规划

当前核心依赖：astro、@astrojs/starlight、@astrojs/markdown-remark；检查依赖为 @astrojs/check 与 TypeScript 6。Starlight 自带 MDX 集成；没有 React island 时不预装 React，后续按实际示例接入 @astrojs/react、react、react-dom。

本地与 CI 固定 Node 24.22.0 + npm 11.19.1，网站工程统一 npm、一份根级 `package-lock.json`；其他管理器实验在独立目录，不混用根锁文件。实际命令与文章提交约定见 [DEPLOYMENT](DEPLOYMENT.md)。

当前脚本与后续测试入口：

| 命令 | 用途 |
| --- | --- |
| npm run dev | 网站本地开发 |
| npm run diagrams | D2 生成 SVG |
| npm run check | 内容 schema、Astro/类型、必要链接检查 |
| npm run build | 课程/示例/进度测试、同步路线、D2、静态构建与产物检查 |
| npm run preview | 检查生产产物与搜索 |
| npm run test:progress | Node 内置运行器检查进度校验、合并、备份与故障恢复 |
| npm run test:progress:browser | 对生产预览检查进度交互、存储故障、跨标签与静态阅读 |

上述命令均已实现。浏览器验收复用阶段 4 的锁定 Playwright，准备与运行方式见根 README；进度数据测试接入 build。课程用的 UT 练习与网站自身测试分开组织。

## GitHub Actions 部署计划

Pages 自动部署已实现，第一版交付记录见 STATUS；改版门禁以新 PLAN §6 为准：

1. 仓库 Pages Source 设为 GitHub Actions。
2. 当前在 main 推送或手动触发时执行检查、构建与发布；尚未配置 PR 自动触发。
3. 构建 job：contents: read，安装固定 Node、npm ci、固定 D2、检查、构建、上传 dist。
4. 发布 job：依赖构建，仅此 job 给 pages: write、id-token: write，environment 为 github-pages。
5. 采用 GitHub 官方 Pages actions，实施时核对版本并固定完整 commit SHA；无需在仓库提交长期 PAT。
6. 设置部署 concurrency，记录成功部署的提交与 URL。

当前站点地址：`https://socoo123.github.io/js_web/`。各批文章是否已经部署及实际线上验收以 STATUS 为准。

依据：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 验证范围

用户允许示例自己尝试；验收仍需确保网站本身能构建、阅读和部署。

必须检查：静态构建、内容/链接、关键资源、首页与深层刷新、搜索、代码复制、答案展开、进度恢复、360px 阅读、键盘操作、关键 D2 渲染。

教学示例：选择代表性的核心机制与测试示范实际执行，其余核对代码/官方文档并标注自己尝试及验证状态。不要声称 48 课全部已运行。

网站测试只覆盖可能回归的行为，例如进度损坏恢复、导入校验和子路径资源；静态文本改动通常用内容检查与视觉审阅即可。

<a id="revision-v2-ui"></a>

## V2 页面与工作区呈现规格（逐批实施）

2026-10-28。上文记录当前线上架构；以下是 [新 PLAN](PLAN.md) 的目标设计；实际接入范围见 STATUS。可在浏览器打开 [HTML 审阅稿](review/lesson-layout.html)，查看 C03 和 C23 的排版及五个 Lab 的入口。审阅稿不连接本地工作文件，也不执行 Lab 命令。

### 页面信息顺序

| 位置 | 学员看到什么 | 交互/内容规则 |
| --- | --- | --- |
| 顶部 | 课程、Lab 总览、Java/JS 速查、搜索、主题 | 沿用 Starlight 的导航与搜索，不重建一套 SPA |
| 章节开头 | 标题、属于哪个 Lab、上一课已有什么、本课增加什么、阅读/实作时间、真实验证状态 | 首屏知道要做的业务变化；不先铺一页术语或目录 |
| 本课任务卡 | 当前工作目录、1–3 个改动文件、固定启动/检查命令、输入→预期结果 | 提供本课起点/提示/参考解入口；起点只为恢复，不引导每天下载新工程 |
| Java/JS 对照 | 左 Java，右 JS/React；各自输出；共同输入；一句行为差异 | 两种代码同时可见，不用默认只显示一种语言的 Tabs |
| 机制解释 | 3–5 个概念节，必要机制 D2，至少两次预测 | 每段回到任务里的同一变量、商品或操作；核心解释保持展开 |
| 自己尝试与调试 | 改动位置、操作、观察证据、修复与确认 | 在当前工作文件进行；可选独立机制实验折叠收纳 |
| 页尾 | 验收清单、暂停点、下一步、完成标记、延伸阅读 | 手动标记沿用 F1；检查通过不自动视为学会 |

“项目进度”从课尾附加作业变成整章主线；保留旧标题锚点或兼容锚点。正文不重复粘贴“练习答案”和“项目完整实现”两份相同代码。

### 双栏代码卡的确定规则

1. 同一张卡只比较一个概念，明确共同输入，例如 P001 的 12 件与输入文本“3”。Java/JS 使用相同字段名与金额单位。
2. 一侧一个有语言名、文件名、复制按钮的代码块；每侧独立显示“输出”或“页面结果”。不同结果就是教学重点，不把两个结果合并成共同输出。
3. 正常与错误版本分卡或在明确的“有问题的写法”段落对照。答案可以折叠；Java/JS 语言本身不折叠成二选一。
4. 单侧通常 6–18 行，最大 25 行；不强求物理行号完全对齐，不用空白填充伪造一一对应。
5. Java 是实际可编译片段，必要包装在完整源文件中；页面显示片段时标明所在方法。伪代码需标成伪代码，不称 Java 代码。
6. React 的一侧显示一次渲染/事件中的代码和下一次 UI 结果，说明 Java 局部变量赋值与 React 状态调度的差异；不发明 Java useState。
7. HTML/CSS/UI5 没有直接 Java 对应时，用准确的经验类比卡，或只放前端代码并说明新的机制。不能为了两栏而虚构 Java CSS/Shadow DOM API。
8. 复制只复制该侧代码，不带行号、输出、diff 的 +/- 或另一列内容。复制失败显示可选中复制的提示。

设计依据：Starlight 支持 Markdown/MDX 与静态内容；Code 组件支持从源码字符串渲染。实施时可在 Astro 包装组件内部使用现有 Code，避免额外 React 水合。[Starlight 内容](https://starlight.astro.build/guides/authoring-content/)、[Code 组件与源码导入](https://expressive-code.com/key-features/code-component/)。React 对照的语义依据是同一渲染持有 state 快照。[React 状态快照](https://react.dev/learn/state-as-a-snapshot)。

### 宽度、响应式与可访问性

- 1280px：左侧目录约 200–220px，主内容约 960px；对照区使用两等宽列、16px 间距，每列 `min-width: 0`。右侧固定目录收为页内导航，避免三栏挤压代码。
- 内容区域至少约 760px 时才并排；用容器宽度决定布局，不单纯看屏幕宽度。长代码仅在本侧代码框内横滚，页面自身不横滚。
- 768px 和 360px：导航折叠，对照卡依次显示 Java、Java 输出、JS、JS 输出和差异说明；双方仍可读。手机不做两栏各挤成十几个字符。
- 正文字号约 17px、行高约 1.8；代码约 14px。标题/输出/差异有清晰层级，不能仅用红绿表示错误/正确。普通段落保持适宜阅读宽度，对照区可更宽。
- 暗色同步现有主题变量，卡片边界和代码对比足够；主题不能写入存储时沿用现有容错。
- 键盘可操作复制、锚点、提示/答案，focus-visible 清楚；details/summary 使用原生语义，代码区可聚焦滚动，复制反馈使用 aria-live。
- 禁用 JS 后：两侧代码、输出、解释、任务和原生 details 仍存在。复制按钮等增强功能隐藏；不展示失效的执行按钮。
- 不使用 Java/JS 双栏的全局 CSS 选择器影响整站表格；样式限定到组件。现有 D2 保持 alt 和相邻说明。

### 组件与元数据契约

拟新增的组件只负责呈现，不执行学员代码：

| 组件/入口 | 数据与职责 | 不承担什么 |
| --- | --- | --- |
| `CodeCompare.astro` | 输入 `pairId`，从受控清单读取题目、两侧代码/语言/输出/差异和验证状态；内部用 Code 组件 | 不 eval MDX 字符串，不把未验证代码标成已验证 |
| `LessonTask.astro` | 输入 `lessonId`，显示 catalog 的 Lab、文件、命令、验收、起止快照 | 不自动覆盖文件或改变站点完成进度 |
| `LabOverview.astro` | 5 个 Lab 的业务产物、所属课程、当前课入口、恢复说明 | 不把 5 个 Lab 做成 5 套账号/安装流程 |
| `CourseContent.astro` | 保留 MarkdownContent 包装与 F1，按 catalog 关联当前课 | 不在每页加载 React、Ant Design 或 UI5 |
| `src/content/docs/labs/` | Lab 总览与 5 个说明页，静态链接到课程和练习包 | 不承诺浏览器可直接运行完整 Node/UI5 工具链 |

`labs/catalog.json` 是唯一关系表。最小字段为 `lessonId`、`labId`、`previousLesson`、`startCheckpoint`、`endCheckpoint`、`files`、`commands`、`acceptance`、`comparisonIds`、`errorIds`；验证记录另含发行版、源码校验值、真实执行环境及日期。教师元数据不原样显示给学员。

代码对照另设受控来源清单：Java 完整源文件、JS/JSX 所属参考快照的文件及稳定区域名、两侧预期结果、调用环境、片段说明。区域提取在构建期做，缺区域、重复区域、路径越界、快照不存在均失败；不得从学员的可变工作副本生成发布正文。

MDX 使用 `<CodeCompare pairId="c03-input-number" />` 一类稳定引用。不靠复制代码字符串填组件 props，更不在 HTML 属性中塞几十行正文。完整源文件与页面片段同源，作者修改源码后重新生成并执行对应例子。

### 门禁与生成链的具体改动

| 当前入口 | 实施改动 | 必要验证 |
| --- | --- | --- |
| `scripts/lint-lessons.mjs` | 在原有规则上识别 CodeCompare 的清单片段；计算两侧代码块/行数及组件承载的正文 | 普通16块/难点20块、单块25行；导入片段超限、缺来源、未运行标注缺失均能被发现 |
| `scripts/run-examples.mjs` | 旧行为保留；新增独立 Lab 检查入口，不靠其自动发现带package.json的工程 | check导入学员/参考快照的实际文件，故意改错真实代码能让它失败 |
| `scripts/sync-roadmap.mjs` | 保留48课识别；Lab入口从catalog生成；只根据真实迁移状态显示“已改版” | 旧进度课号不变；新增关系不导致重复48行或漏课 |
| `scripts/check-build.mjs` | 保留现有路径/D2检查；增加双栏静态文本、Lab页/下载和快照清单引用 | 生产HTML含两侧代码；`/js_web/`下实际目标存在，不能只匹配字符串 |
| `src/content.config.ts` | 优先继续只用原frontmatter三字段；Lab关系走catalog | 不先给所有课程加未定义的frontmatter字段 |
| `package.json` / Actions | 新Lab构建与关键契约检查显式接入；代码对照需要Java执行时配置相应JDK | 缺JDK不能冒称Java已运行；旧examples所需阶段4依赖仍可用 |

代码样例计数由片段清单和解析器支持；实现者先检查当前正则 lint 的局限，再选择最小改动。不能为了转成 MDX 全面豁免 lint，或只统计围栏而漏掉 imported code。

### 进度、路由、下载与静态数据

现有 `js_web:progress:v1` 的48课完成语义保持，原导入/导出、备份、损坏恢复、跨标签测试继续通过。新增本地Lab任务位置属于本机 `.lab/`；网站读不到它，不显示假“自动同步”。Lab页面可根据课号标记显示阅读完成度，但必须说明不代表本地检查通过。

`.md`→`.mdx` 保留同名 basename，每个slug只留一份。已有外部锚点优先保留；侧栏新增Lab入口同时保留章节导航，旧站首页/路线/四张速查仍可打开。

网站部署路径保持 `/js_web/`。如果发布预构建库存演示，单独放在 `/js_web/demos/inventory/`，Vite/UI5资源base按该目标设置，React内部仍采用hash路由。路径并不等于仓库磁盘上的 `labs/inventory/`；不要把三者混成一个字符串。起点/终点下载放在带发行版的 `/js_web/downloads/inventory/<release>/` 下，构建时生成并验证，避免链接到浮动的main终态。[Astro Pages 路径规则](https://docs.astro.build/en/guides/deploy/github/)。

下载包不含node_modules、凭据、缓存、个人快照或隐藏的教师完整答案目录。源码来源/使用许可沿用仓库实际授权状况；项目LICENSE仍待定时，不自行添加新的开源许可承诺。
