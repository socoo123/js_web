# 官方来源、版本基线与更新规则

核查日期：**2026-10-15**。下表是本轮查询所见状态，不代表已经安装或运行这些版本。网站实现 M1 与各生态课程编写时必须重新核对兼容性并固定实际使用版本。

**从 C06 起的记录规则**：本文件只记录会过时的信息，即版本、安装命令、新 API 的状态，以及查询日期和结论。每课不超过 3 行。给学员看的链接写在正文里（优先 MDN、react.dev 和官方文档），运行验证写在 `examples/cNN/README.md`，都不写在这里。

## 当前所见基线

| 项目 | 查询所见 | 课程/实施决策 | 直接来源 |
| --- | --- | --- | --- |
| ECMAScript | 2026，第 17 版，2026-06 | 现代常用语法主线，年度新特性附录 | [Ecma ECMA-262](https://ecma-international.org/publications-and-standards/standards/ecma-262/) |
| TC39 | 流程含 Stage 2.7 | 区分标准、完成提案、在研提案与支持情况 | [TC39 process](https://tc39.es/process-document/) |
| Node | 24.22.0 Latest LTS；26.12.0 Latest Release/Current；22 仍为 LTS | 优先 Node 24 LTS，M1 固定兼容补丁；不追逐 Current | [Node releases](https://nodejs.org/en/about/previous-releases) |
| npm | registry latest 为 12.2.0 | 使用与固定 Node 兼容的版本，不自动全局升级 | [npm 官方 registry](https://registry.npmjs.org/npm/latest) |
| Yarn | Modern latest 为 4.18.1 | 解释 Modern/Classic 与 PnP，不沿用旧 1.x 教程作为现代默认 | [官方 release](https://github.com/yarnpkg/berry/releases/tag/@yarnpkg/cli/4.18.1) |
| pnpm | 文档当前发布线 12；latest 为 12.11.2 | 学安装布局与解析策略，独立练习 | [安装文档](https://pnpm.io/installation)、[官方 release](https://github.com/pnpm/pnpm/releases/tag/v12.11.2) |
| Bun | 文档页头为 1.4.3 | 理解集成工具箱，兼容性需要实测 | [Bun docs](https://bun.com/docs) |
| React | latest 为 19.3；2026-09-09 发布 | 函数组件/Hooks 核心；19.x 新特性分级教学 | [版本页](https://react.dev/versions)、[19.3 发布](https://react.dev/blog/2026/09/09/react-19-3) |
| SAP/UI5 | 文档面存在不同更新节奏，不固定“全家族最新版” | 目标包/CDN/Tooling 分别核验，再写安装步骤 | [UI5 docs](https://ui5.github.io/docs/)、[SAPUI5 version overview](https://ui5.sap.com/versionoverview.html) |
| Astro/Starlight/D2/测试工具 | 本轮只确定架构，不锁具体版本 | M1 核验 Node、React 和集成兼容性后建立锁文件 | 下方对应官方文档 |

截至查询，UI5 Markdown 首页显示 1.139，而 SAPUI5 CDN 总览显示 1.153；这不是一个适合概括成单一“UI5 最新版”的状态。不得由旧教程路径或文档导航推断安装版本。

## JS 历史与语言

- 原设计者与标准工作者历史资料：[JavaScript: The First 20 Years](https://wirfs-brock.com/allen/posts/866)。用于解释 1995 诞生、标准化与后续演变，正文应原创讲述。
- 现行标准：[ECMA-262 标准页](https://ecma-international.org/publications-and-standards/standards/ecma-262/)。最新草案与发布年度标准有区别。
- 标准化流程：[TC39 process](https://tc39.es/process-document/)；完成提案与年度分组：[finished proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)。
- ES2026 发布记录：[官方 release](https://github.com/tc39/ecma262/releases/tag/es2026)。
- 语言查阅：[MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)；集合：[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)、[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)。

ES2026 查询所见新增组为 Map/WeakMap Upsert、JSON 源文本访问、Iterator Sequencing、Uint8Array Base64/Hex、Math.sumPrecise、Error.isError、Array.fromAsync。Temporal、Explicit Resource Management 在完成提案表所见为预计 2027；正文编写前核对最新归属和具体 API，不能因为环境提前实现而改变标准年份。

## Node 与包管理

- [Node 事件循环](https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick)：说明 JS 执行与系统 I/O/线程池，浏览器与 Node 的时序不能直接等同。
- [Node TypeScript](https://nodejs.org/api/typescript.html)：type stripping 与完整类型检查分别解释。
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)、[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)：这些是带版本的文档入口，实施时查所安装 CLI 对应版本。
- [Yarn 安装](https://yarnpkg.com/getting-started/install)、[Yarn PnP](https://yarnpkg.com/features/pnp)。
- [Corepack README](https://github.com/nodejs/corepack)：Node 25 起不再捆绑 Corepack，不能永久假设 corepack 命令已经存在。
- [pnpm 布局](https://pnpm.io/symlinked-node-modules-structure)、[pnpm 安装](https://pnpm.io/installation)。
- [Bun docs](https://bun.com/docs)：runtime/package manager/test runner/bundler 各自职责与兼容性。

## React

- [Learn](https://react.dev/learn)：组件、交互、状态与外部系统的主线。
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)：C23 核心依据。
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)、[useEffect](https://react.dev/reference/react/useEffect)：C29 边界与清理。
- [React 19](https://react.dev/blog/2024/12/05/react-19)、[19.2](https://react.dev/blog/2025/10/01/react-19-2)、[19.3](https://react.dev/blog/2026/09/09/react-19-3)：新特性按版本及深度标注。
- [React Compiler](https://react.dev/learn/react-compiler/introduction)：构建工具选修，正确状态/渲染模型仍先教。
- [Custom HTML Elements](https://react.dev/reference/react-dom/components#custom-html-elements)：React 19 的支持现状。
- [CRA 退役说明](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)：新练习采用 Vite。
- [HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter)：独立 Pages 练习的路由方案。
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)：数据请求/缓存，不作为通用 UI 状态库。

## SAP、UI5 与静态边界

- [SAP Fiori](https://experience.sap.com/fiori-design-web/sap-fiori/)：设计系统背景。
- [SAPUI5 vs OpenUI5](https://ui5.github.io/docs/02_Read-Me-First/sapui5-vs-openui5-5982a97.html)、[UI5 ecosystem](https://ui5.github.io/docs/02_Read-Me-First/the-ui5-ecosystem-b72ccb5.html)：体系与交付区别。
- [UI5 Web Components](https://ui5.github.io/webcomponents/docs/)、[First Steps](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/)：Custom Elements、npm 导入与资源打包。
- [UI5 Web Components for React](https://github.com/UI5/webcomponents-react)：包装库用途、版本与废弃组件说明。
- [V2 MockServer](https://ui5.github.io/docs/04_Essentials/mock-server-69d3cbd.html)：浏览器 mock 与静态数据。
- [OData V4 教程 step 1](https://github.com/UI5/tutorials/blob/main/packages/odatav4/steps/01/README.md)：CAP 服务与有限教程 mock 的边界。
- [UI5 Tooling](https://ui5.github.io/cli/stable/)：本地工程与构建，命令实施前再核查。

已发现的文档冲突：UI5 Web Components Introduction 已说明 React 19 Custom Elements 支持，但 React 专题旧例仍出现 CRA 和旧事件限制。课程以当前 React 文档、目标包版本和实际验证为准。完整 V4 CAP mock 需要服务，不能宣称直接由 Pages 提供。

## 开源组件与工具分类

| 方案 | 官方定位依据 | 课程判断 |
| --- | --- | --- |
| Ant Design | [介绍](https://ant.design/docs/react/introduce) | 企业表格/表单主练习 |
| MUI | [Material UI](https://mui.com/material-ui/getting-started/)、[MUI X 许可](https://mui.com/x/introduction/licensing/) | 完整组件与主题对照；收费扩展分开说明 |
| Mantine | [官网](https://mantine.dev/) | 组件/Hooks/表单体系概览 |
| shadcn/ui | [文档](https://ui.shadcn.com/docs) | 代码分发与项目自持有组件的模式 |
| Radix | [Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) | 无样式可访问性交互基础 |
| UI5 React | [官方仓库](https://github.com/UI5/webcomponents-react) | SAP/Fiori 风格同业务对照 |

这些是根据官方定位作出的教学选择，不是市场份额排名。Query/Table/Form/状态管理等工具另行分类，不全部称为 UI 组件库。

## 调试与测试

完整工具与任务见 [DEBUG_TESTING.md](DEBUG_TESTING.md)，包括相关官方链接。

重点来源：[Chrome DevTools](https://developer.chrome.com/docs/devtools/overview)、[React DevTools](https://react.dev/learn/react-developer-tools)、[Node 调试](https://nodejs.org/learn/getting-started/debugging)、[Vitest](https://vitest.dev/guide/)、[Jest](https://jestjs.io/docs/getting-started)、[RTL](https://testing-library.com/docs/react-testing-library/intro/)、[user-event](https://testing-library.com/docs/user-event/intro/)、[Playwright](https://playwright.dev/docs/intro)。

版本最低要求、配置和异步 API 在实施时查看当前指南；不要直接复制旧 Vitest/Vite/React 工程配置。

## 静态站、D2 与 Pages

- [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/)、[islands](https://docs.astro.build/en/concepts/islands/)、[routing](https://docs.astro.build/en/guides/routing/)。
- [Starlight 内容](https://starlight.astro.build/guides/authoring-content/)、[搜索](https://starlight.astro.build/guides/site-search/)。
- [D2 exports](https://www.d2lang.com/tour/exports/)、[D2 CLI](https://d2lang.com/tour/man/)。
- [Astro GitHub 部署](https://docs.astro.build/en/guides/deploy/github/)、[GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 实施时如何更新

1. 保留本轮查询日期；新的核查另写日期，不把历史记录改成“永远最新”。
2. 核对官方发布/registry/package engines 与框架集成兼容性。
3. 为站点固定 Node、npm 和依赖锁文件；为 D2 固定 CLI；例子分别记录真实版本。
4. 对核心新特性检查目标浏览器/运行时支持；必要时给兼容写法。
5. 实际执行后记录命令、结果和日期；未执行者保持 reviewed/unverified，练习类型另行标注。
6. 将影响课程结论的更新写进 STATUS 与对应课程，不只在来源文件里修改数字。

## C01 编写时的重新核查与实际验证

日期：**2026-10-15**。本次按用户范围只交付 C01，未实施 Astro 依赖基线。

- 重新读取 Ecma 标准页，确认 ECMAScript 2026 / 第 17 版 / 2026-06；读取 ES2015 与 ES2017 正式版入口，对照现代语法的年度归属。
- 重新读取 TC39 流程与提案列表；Temporal 为 Stage 4，完成表预计 2027；Decorators 在进行中列表为 Stage 2.7。C01 均标明核查日期，并与实际环境支持分开讲解。
- 历史依据使用 [设计者与标准工作者的论文全文](https://www.wirfs-brock.com/allen/jshopl.pdf)，核对原型、命名、兼容背景及 Node/CommonJS 转折；正文原创讲解。
- Node、Bun、npm、Yarn、pnpm、React、UI5 家族定位使用对应官方文档核对；本课没有新增其安装命令或第三方依赖。
- 实际执行环境：Chrome 155.0.8059.40、Node 23.11.0、JDK 21.0.2。Node 23 是本机验证环境，不改动后续工程选择 Node 24 LTS 的计划。执行项和命令见 [C01 练习记录](../examples/c01/README.md)。
- 固定并实际运行 [D2 0.9.0](https://github.com/d2lang/d2/releases/tag/v0.9.0)，使用 Dagre。中文字体固定到 [Google Fonts Noto Sans SC 提交](https://github.com/google/fonts/tree/a85815a42757630ce188fdad368c2dfc444d4773/ofl/notosanssc)，原始 TTF 的 SHA-256、许可和重建方法见 [图说明](../diagrams/README.md)。SVG 内嵌字形和许可，无在线字体依赖。
- 静态 Markdown 预览及图渲染通过；未执行 Astro 构建、Pages 子路径或部署验证。

## 网站与提前 Pages 部署的核查

日期：**2026-10-15**。本次用户要求部署现有 C01，并授权后续每次文章完成后提交、推送与自动更新 Pages；不扩写 C02。

- 官方 Node 发布索引确认 **24.22.0 LTS**，自带 **npm 11.19.1**；下载对应 macOS arm64 归档，按官方 `SHASUMS256.txt` 校验后在项目忽略目录使用。本地与 CI 版本一致。
- npm 官方 registry 元数据与包 engines/peerDependencies 核对：Astro **7.3.8**、Starlight **0.42.6**（要求 Astro ^7.2.10）、@astrojs/markdown-remark **7.3.2**、@astrojs/check **0.9.10**、TypeScript **6.0.3**。固定直接依赖与根级锁文件；TypeScript 仅用于网站工程检查，不改变课程 JS 主线。
- [Starlight 手动设置](https://starlight.astro.build/manual-setup/)、[配置参考](https://starlight.astro.build/reference/configuration/)、[侧栏 API](https://starlight.astro.build/guides/sidebar/) 和 [搜索](https://starlight.astro.build/guides/site-search/) 用于中文根语言、内容集合、自动导航与 Pagefind；按当前 API 把 autogenerate 放进分组的 items 数组。
- [Astro Pages 部署](https://docs.astro.build/en/guides/deploy/github/) 与 [GitHub 自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 用于静态子路径与最小任务权限。Actions 版本从对应官方仓库标签解析，并固定到 commit SHA。
- 固定 D2 各平台发布归档摘要来源于官方 v0.9.0 的 GitHub release API，字体仍采用 C01 固定提交与摘要；本地自动准备脚本已执行。
- 安装时 npm audit 发现 PostCSS 解析器的间接依赖告警；依据 [官方审定公告](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)，仅在 postcss-nested 依赖下覆盖到修复版 **postcss-selector-parser 7.1.6**，随后安装、锁文件复现与生产构建通过，audit 为 0 漏洞。该包用于可信源码的构建期解析，覆盖规则待上游依赖修复后再评估移除。
- 生产页面、浏览器和线上验证的实际结果见 [STATUS](STATUS.md)；此前 C01 小节记录的是建站前的历史交付范围，不表示本次仍未建站。

## C02 Web 基础与调试的核查

日期：**2026-10-15**。沿用站点已固定的依赖与工具，不新增第三方示例依赖。

- [HTML 语义](https://html.spec.whatwg.org/multipage/semantics.html)、[表单](https://html.spec.whatwg.org/multipage/forms.html)、[按钮](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)、[脚本处理](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer)：核对元素、原生约束、布尔属性、普通外部脚本的 defer/async 差异；未把下载并行称为 JS 多线程。
- [DOM 标准](https://dom.spec.whatwg.org/)：核对 querySelector、textContent、事件注册与 preventDefault；区分文件源码、当前 DOM 和业务变量。
- [CSS 盒模型](https://www.w3.org/TR/css-box-3/)、[尺寸](https://www.w3.org/TR/css-sizing-3/)、[层叠](https://www.w3.org/TR/css-cascade-5/)、[Flex](https://www.w3.org/TR/css-flexbox-1/)、[Grid](https://www.w3.org/TR/css-grid-1/)、[媒体查询](https://www.w3.org/TR/mediaqueries-4/)：讲解 border-box、选择器冲突、布局与按视口调整；未把隐藏横向滚动当作修复。
- [web.dev 响应式基础](https://web.dev/articles/responsive-web-design-basics)：核对 viewport meta 与 CSS 像素；辅助技术状态提示对照 [WAI-ARIA status](https://www.w3.org/TR/wai-aria-1.2/#status)，未声称实际使用屏幕阅读器验收。
- [URL 标准](https://url.spec.whatwg.org/)、[HTTP 状态](https://httpwg.org/specs/rfc9110.html#status.codes)：核对相对路径、根路径、查询/片段与200/304/404；提示 Pages 的 /js_web/ 子路径。
- [Chrome Console](https://developer.chrome.com/docs/devtools/console/javascript)、[CSS](https://developer.chrome.com/docs/devtools/css/)、[Network](https://developer.chrome.com/docs/devtools/network/)、[Sources](https://developer.chrome.com/docs/devtools/javascript/)、[设备模式](https://developer.chrome.com/docs/devtools/device-mode/)：面板操作已核对；自动化验证与手动面板点击分别标注。
- [Python 静态服务](https://docs.python.org/3/library/http.server.html#command-line-interface)、[Windows 启动器](https://docs.python.org/3.11/using/windows.html#python-launcher-for-windows)：主线使用已有 Python 3 提供本机文件服务，不引入 npm 安装步骤；Windows 写法未执行。
- 实际环境：Chrome **155.0.8059.40**、Python **3.11.8**；验证驱动使用固定 Node **24.22.0**。已执行正常表单、无效值/超卖/售完、Enter、路径404、漏defer、协议断点与单步、360px/1280px、补货组合答案和禁用页面JS。完整结果见 [C02 练习记录](../examples/c02/README.md)；站点生产/线上验收另见 [STATUS](STATUS.md)。

## C03–C05 语言基础的核查

日期：**2026-10-15**。本批使用已定稿的基础语言能力；引用 [ECMAScript 2026 固定版本](https://tc39.es/ecma262/2026/multipage/)，与持续更新的编辑草案区分。站点依赖和根级锁文件不变。

- C03（2026-10-15 范例重写）：正文改链 MDN 的 typeof、Number、BigInt、`??`、Object.is、相等比较与 Falsy 页面，规范只在延伸阅读留 1 条。Console 依次粘贴的说法依据 [Chrome 92 起支持跨输入重复声明 const](https://developer.chrome.com/blog/new-in-devtools-92#const-redeclaration)，并实测「先 let 后 const」会报错。Java 对照表由 `examples/c03/JavaNumbers.java` 在 Java 21 实际运行得出。
- C04 对照[声明与控制流](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)、[环境记录](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html#sec-environment-records)，明确 TDZ 中的绑定不回退外层查找，`var` 的初始化和赋值不是同一步。
- 数组越界例子使用未改原型的普通数组；依据[普通对象属性读取](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver)解释缺失下标得到 `undefined`，没有把 `NaN` 当成抛出的异常。
- C04 的[Chrome 断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)与[调试参考](https://developer.chrome.com/docs/devtools/javascript/reference)用于手动操作路径核对；[V8 堆栈说明](https://v8.dev/docs/stack-trace-api)用于说明 `error.stack` 的格式边界。
- C05 对照对象属性、浅复制、JSON、String 和 Date；使用明确的 ISO 时间偏移和 UTC 输出，并实际切换时区验证，避免将作者本机时区当成读者环境。JSON 语法解析与业务数据校验分别教学；参数传值与重新绑定使用运行结果解释。
- 逐课实际版本、命令、输出及未验证范围见 [C03](../examples/c03/README.md)、[C04](../examples/c04/README.md)、[C05](../examples/c05/README.md)。本批没有新增运行时或第三方库安装命令，不据此宣称其他浏览器与操作系统已通过。

## C01 按新版规范重构

- 2026-10-15：重新核对 [Ecma 正式标准页](https://ecma-international.org/publications-and-standards/standards/ecma-262/)，当前为 ECMAScript 2026 / 第 17 版；按 [TC39 流程](https://tc39.es/process-document/)区分 Stage 4、年度归属与环境支持，正文移除具体在研提案的易过时快照。
- 同日：按 [Node 环境差异](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser)、[CommonJS](https://nodejs.org/api/modules.html)、[npm](https://docs.npmjs.com/about-npm/)、[Bun](https://bun.com/docs)及 Yarn/pnpm、React/UI5 官方文档重核职责与文中命令，无新增安装命令或依赖。
- 同日：[Chrome Console](https://developer.chrome.com/docs/devtools/console/javascript)与 [JS 历史论文](https://www.wirfs-brock.com/allen/jshopl.pdf)用于操作路径与年代背景；实际运行记录移至 [examples/c01](../examples/c01/README.md)。

## C02 按新版规范重构

- 2026-10-15：重新核对 [Python http.server](https://docs.python.org/3/library/http.server.html#command-line-interface) 的端口与 `--bind` 命令，主线继续使用已有 Python 或编辑器静态服务，无新增安装命令。
- 同日：依 [MDN script](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/script)、[表单](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Extensions/Forms/Your_first_form)及 Chrome 的 [Sources](https://developer.chrome.com/docs/devtools/javascript/)、[Network](https://developer.chrome.com/docs/devtools/network/)、[CSS](https://developer.chrome.com/docs/devtools/css/) 核对脚本时机与面板步骤；实际验证记录见 [examples/c02](../examples/c02/README.md)。

## C04 按新版规范重构

- 2026-10-15：重新核对 MDN 的 [let / TDZ](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let)、[const](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const)、[var](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/var)、[switch](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/switch)、[for-of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of)、[for-in](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...in)与 [try/catch](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch)。正文改为短例子与固定库存数据，规范只放在延伸阅读，D2 补全「未声明」和「TDZ」两个错误出口。
- 同日：重核 [Chrome 单步、Scope 与 Call Stack](https://developer.chrome.com/docs/devtools/javascript/reference)、[异常断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)和 [Python 本地服务命令](https://docs.python.org/3/library/http.server.html#command-line-interface)。未增加安装命令或第三方依赖；运行与断点实测明细见 [examples/c04](../examples/c04/README.md)。

## C05 按新版规范重构

- 2026-10-16：重新核对 MDN 的[对象属性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_objects)、[Object.hasOwn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)、[可选链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining)、[解构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring)、[展开](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)及 [String](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String)。正文改用固定商品数据和短例子，规范链接与逐块验证日志移出正文。
- 同日：按 [JSON.parse](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)、[JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)、[Date](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)与 [Intl.DateTimeFormat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)核对语法与业务校验、序列化损失、时间点与业务日期的区别。
- 同日：重核 [Chrome 断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)与 [Python 本地服务命令](https://docs.python.org/3/library/http.server.html#command-line-interface)，未增加安装命令或第三方依赖。Node/Chrome 输出、导入边界、三个时区与草稿断点的实际记录见 [examples/c05](../examples/c05/README.md)。

## C06 函数、闭包与高阶操作

- 2026-10-16：重新读取 [Node 官方下载页](https://nodejs.org/en/download)与[发布状态](https://nodejs.org/en/about/previous-releases)，确认 Node 24 为 LTS，下载页当前版本为 24.22.0。正文使用主版本与 `node --version`、`node 文件名.js`，安装向导未实际重装。
- 同日：核对 MDN 的[函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)、[箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)、[默认参数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Default_parameters)、[rest 参数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/rest_parameters)与[闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Closures)。区分函数值/调用结果、定义位置/调用栈、共享绑定/每次工厂调用独立绑定，以及同步回调与异步执行。
- 同日：按 [Java lambda 体规范](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.2)核对 final/effectively final 的局部变量捕获限制；按 [Chrome Scope 调试参考](https://developer.chrome.com/docs/devtools/javascript/reference#scope)核对操作路径，实际断点与单步读取 count、var/let 捕获结果。运行记录见 [examples/c06](../examples/c06/README.md)。

## C07 this、原型与 class

- 2026-10-16：按 MDN 的 [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)、[原型链](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)、[class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)与[私有元素](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)重核基础规则；均为已定稿能力，无提案特性、新依赖或安装命令，沿用 Node 24 基线。运行记录见 [examples/c07](../examples/c07/README.md)。

## C08 Array 与业务数据处理

- 2026-10-16：核对 MDN 的 [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)、[map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)、[filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)、[every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)与 [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)，确认空数组、空位、回调返回值与浅复制的区别；正文使用固定商品数据。
- 同日：按 [sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)、[toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)、[toSpliced](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)与 [ECMA-262 数组算法](https://tc39.es/ecma262/multipage/indexed-collections.html)核对默认 UTF-16 顺序、比较器符号、稳定排序与复制方法；ES2023 复制方法均为正式标准，实际运行记录见 [examples/c08](../examples/c08/README.md)。
- 同日：按 [Chrome Scope 与单步调试](https://developer.chrome.com/docs/devtools/javascript/reference#scope)核对回调内和回调后的断点步骤。沿用既有 Node 24 与 Python 本地服务命令，没有新增依赖或安装步骤。

## C09 Object、Map、Set 与弱集合

- 2026-10-16：核对 MDN 的 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)、[set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set)、[get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get) 与 [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)，确认对象身份、SameValueZero、覆盖与重插入顺序、条目与对象属性的区别；索引用固定字符串 id，分组用显式循环，没有引入新的分组或集合运算 API。
- 同日：核对 [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)、[Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)、[Object.hasOwn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) 与[迭代协议](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)，区分数字属性键、原型属性、迭代器进度与普通对象的属性枚举。
- 同日：按 [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) 与 [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) 核对对象/非注册 Symbol、弱引用、不可枚举与缺少 size 的原因。只演示一份对象快照的附属检查信息，未把可观察行为验证当成垃圾回收时机验证。
- 同日：按 [Chrome Scope 调试参考](https://developer.chrome.com/docs/devtools/javascript/reference#scope)核对暂停位置与 Console 求值路径。沿用 Node 24 与已有静态服务命令，无新依赖或安装步骤；运行结果见 [examples/c09](../examples/c09/README.md)。
- 同日：用 Java 官方 [Map](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html)、[IdentityHashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/IdentityHashMap.html) 与 [WeakHashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/WeakHashMap.html) 核对 equals/hashCode、身份比较与弱键接口的类比边界。

## C10 栈、队列、树与复杂度

- 2026-10-16：核对 MDN 的 [push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)、[pop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop) 与 [shift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)，确认尾部进出、返回新长度、空数组 undefined、首部删除及长度变化。复杂度按本课算法和普通数组操作估算，区分抽象代价与引擎优化，未把标准描述写成特定引擎的固定耗时保证。
- 同日：按 [MDN 递归过深错误](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion)、[Node console.time/timeEnd](https://nodejs.org/api/console.html#consoletimelabel) 与 [Chrome Scope、单步调试](https://developer.chrome.com/docs/devtools/javascript/reference#scope)核对深度错误、计时标签与断点步骤。DFS/BFS 和复杂度来自随课实现；使用已有 Node 24 与静态服务命令，无新依赖、安装步骤或提案 API；运行与断点证据见 [examples/c10](../examples/c10/README.md)。

## C11 DOM、事件、表单与页面调试

- 2026-10-16：核对 MDN [querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll)、[textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)、[innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)、[replaceChildren](https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren) 与 [script/defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script)。区分静态 NodeList 与节点引用、文本与 HTML 解析、事件属性 XSS、替换子节点与移除容器；经典外部 defer 脚本在解析后按顺序执行。
- 同日：按 [事件冒泡](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling)、[addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) 与 [closest](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) 核对传播顺序、target/currentTarget、函数身份去重与父列表委托。
- 同日：按 [客户端表单验证](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation)、[submit 事件](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event)、[setCustomValidity](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setCustomValidity) 和 [Chrome 断点参考](https://developer.chrome.com/docs/devtools/javascript/breakpoints) 核对原生校验先于 submit、错误清除、事件断点、DOM 节点删除断点与面板入口。CSS 排查路径按 [Chrome CSS 参考](https://developer.chrome.com/docs/devtools/css/reference)核对 Styles 与 Computed。沿用已有 Node 24 和静态服务，无新安装步骤或依赖；实际运行证据见 [examples/c11](../examples/c11/README.md)。

## C12 从回调到 Promise：执行顺序

- 2026-10-16：核对 MDN 的 [Promise 构造器](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise)、[then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)、[catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)、[finally](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally)与[使用 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)。区分执行器同步执行、反应回调排入微任务、resolve 跟随其他 Promise、处理器返回值与失败传播，以及 finally 正常完成时透传原结果。
- 同日：按 [MDN 微任务指南](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)、[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)与 [HTML 事件循环处理模型](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)核对任务选择、微任务检查点、新追加微任务与渲染机会。D2 只表达浏览器主线程主线，说明任务来源并非一个全局 FIFO、渲染可以跳过，未把等待门槛当成精确执行时间。
- 同日：核对 [Node 事件循环](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)、[Java CompletableFuture](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html)与 [Chrome 调试参考](https://developer.chrome.com/docs/devtools/javascript/reference)。浏览器与 Node 的宿主差异只用一段说明；Java 对照限定在结果依赖与恢复机制，区分 supplyAsync 的执行器与 Promise 主线程回调。沿用已有 Node 24 和静态服务，无新增安装命令、依赖或提案 API；实际验证见 [examples/c12](../examples/c12/README.md)。

## C13 async/await、请求与 Network

- 2026-10-16：核对 MDN [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)、[await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)、[Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)、[allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) 与 [forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)。确认 async 总返回 Promise、同步运行至 await、恢复通过微任务、等待处失败进入 catch；组合器不启动或自动取消操作、结果按输入顺序、forEach 忽略回调返回值。例子均由固定库存数据独立编写。
- 同日：核对 MDN [Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)、[Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)、[Response.json](https://developer.mozilla.org/en-US/docs/Web/API/Response/json)、[AbortController.abort](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) 与 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)。区分 HTTP 状态与网络失败、响应与响应体读取、JSON 语法与业务结构、单次消费响应体；取消仅覆盖进行中的请求/读取，CORS 只解释浏览器现象与服务端许可。
- 同日：核对 [Chrome Network 参考](https://developer.chrome.com/docs/devtools/network/reference/)与[入门](https://developer.chrome.com/docs/devtools/network/)，确认 Headers/Response/Initiator/Timing、禁用缓存、限速、Offline 与 canceled 的定位；TTFB 不等同于服务端方法耗时。静态服务命令沿用前课并对照 [Python http.server](https://docs.python.org/3/library/http.server.html)。无新增依赖、安装命令或提案 API；Node 24 沿用已安装版本，运行和浏览器证据见 [examples/c13](../examples/c13/README.md)。

## C14 原生页面、存储与错误处理

- 2026-10-16：核对 MDN [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)、[setItem](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem) 与 [Web Storage 用法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)，区分字符串/对象、源/路径、缺失/损坏/策略异常、同步读写与隐私会话。sessionStorage 和 IndexedDB 仅各用一句定位，不扩展实现。
- 同日：核对 [Blob.text](https://developer.mozilla.org/en-US/docs/Web/API/Blob/text)、[input.files](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/files)、[createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) 与 [revokeObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static)。文件读取需要 await，导入后缀不代替结构校验；下载使用 Blob、临时链接与稍后撤销 URL，版本和字段规则属于本项目契约。
- 同日：按 [Chrome 本地存储面板](https://developer.chrome.com/docs/devtools/storage/localstorage)核对 Application → Storage → Local Storage 的查看/编辑/删除入口。沿用 Node 24 与 Python 静态服务，无新增依赖、安装命令、提案 API 或教学图；实际运行与失败注入见 [examples/c14](../examples/c14/README.md)。

## C15 CSS 布局与响应式

- 2026-10-16：核对 MDN [box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)、[Flex 基本概念](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)、[repeat](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat)、[min-width](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width) 与 [@media](https://developer.mozilla.org/en-US/docs/Web/CSS/@media)。确认内容/边框尺寸、Flex 直接子项和基准尺寸、auto-fill 空轨道、fr 与间距、自动最小尺寸与移动优先覆盖规则；项目采用明确的 1/2/4 列断点，auto-fill 单独示范。
- 同日：核对 [CSS 变量](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)、[:focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) 与 [W3C 对比度要求](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)；颜色比值按不透明 sRGB 公式计算，字体和轮廓仍在浏览器中观察。
- 同日：核对 Chrome DevTools 的 [Grid](https://developer.chrome.com/docs/devtools/css/grid)、[Flex](https://developer.chrome.com/docs/devtools/css/flexbox)、[Computed/Styles](https://developer.chrome.com/docs/devtools/css/reference) 与[设备模式](https://developer.chrome.com/docs/devtools/device-mode)入口。沿用 Python 静态服务与 Node 24，无新增依赖、安装步骤、提案 API 或教学图；实际尺寸、层叠故障、溢出与键盘验证见 [examples/c15](../examples/c15/README.md)。
