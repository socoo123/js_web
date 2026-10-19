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

## C16 模块、依赖与组织代码及 ES 版本速查

- 2026-10-17：核对 [Node 24 ESM](https://nodejs.org/download/release/latest-v24.x/docs/api/esm.html)、[CommonJS](https://nodejs.org/download/release/latest-v24.x/docs/api/modules.html)与 MDN 模块/import/export/import()；沿用 Node 24 与既有 Python 静态服务，无新增依赖或安装命令。
- 同日：按 [Ecma 出版页](https://ecma-international.org/publications-and-standards/standards/ecma-262/)、[固定 ES2026](https://tc39.es/ecma262/2026/multipage/)、[完成提案](https://github.com/tc39/proposals/blob/main/finished-proposals.md)和 [TC39 流程](https://tc39.es/process-document/)重核年度与阶段；Temporal/资源管理仍列预计 2027；MDN 兼容数据中 toSorted 为 Chrome 110 / Node 20 起，Map.groupBy 为 Chrome 117 / Node 21 起，Safari 的旧 groupToMap 名称不等同正式 API。Node/Chrome 支持探测结果见 examples/c16。

## C17 Node 与浏览器的边界

- 2026-10-17：核对 [Node 与浏览器的差异](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser)、[事件循环](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)与[避免阻塞](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)。区分 V8/宿主、单个 JS 线程/libuv 文件线程池/网络系统通知；Promise 恢复不把 JSON.parse 移到线程池。沿用 Node 24，无新安装步骤或提案 API。
- 同日：按 Node 24 的 [fs/promises](https://nodejs.org/download/release/latest-v24.x/docs/api/fs.html#promises-api)、[path](https://nodejs.org/download/release/latest-v24.x/docs/api/path.html)、[ESM](https://nodejs.org/download/release/latest-v24.x/docs/api/esm.html#importmetaurl)、[fileURLToPath](https://nodejs.org/download/release/latest-v24.x/docs/api/url.html#urlfileurltopathurl-options)与 [process](https://nodejs.org/download/release/latest-v24.x/docs/api/process.html)核对 cwd/模块 URL、编码、参数/环境变量文本、退出状态与 wx 创建模式；项目目录独立 package.json 和锁文件无第三方依赖。
- 同日：核对 [Buffer](https://nodejs.org/download/release/latest-v24.x/docs/api/buffer.html)、[stream](https://nodejs.org/download/release/latest-v24.x/docs/api/stream.html)、[调试命令](https://nodejs.org/download/release/latest-v24.x/docs/api/cli.html)与 [Debugger](https://nodejs.org/download/release/latest-v24.x/docs/api/debugger.html)。Buffer/stream 各一个短例子；inspect-brk、终端连接、cont/repl/.exit 已实际操作。浏览器对照因无可用浏览器未执行，正文与 examples/c17 均作例外标注；静态 HTTP 200 不当作 JS 运行通过。

## C18 npm：项目、版本与可复现安装

- 2026-10-17：核对 npm 11 的 [package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)、[run](https://docs.npmjs.com/cli/v11/commands/npm-run/) 与 [registry](https://docs.npmjs.com/cli/v11/using-npm/registry/)，确认 strict JSON、private/type、三类依赖、peer 自动安装及冲突、脚本 cwd/PATH/参数和公共源。Maven 只类比清单、仓库与用途，区别固定生命周期、scope 和版本冲突机制。
- 同日：核对 [install](https://docs.npmjs.com/cli/v11/commands/npm-install/)、[ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) 与 [锁文件](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/)，区分沿用满足范围的锁、主动更新、清单/锁不匹配时失败、重建 node_modules，以及具体安装位置、resolved、integrity、dev；可复现性同时考虑工具版本、配置和平台可选包。
- 同日：按 [SemVer](https://semver.org/lang/zh-CN/) 与 [node-semver](https://github.com/npm/node-semver) 核对三段版本、^/~ 与主版本 0、预发布限制。`npm view semver version engines bin dist.integrity --json` 返回 7.8.5、Node >=10、semver CLI 和 sha512 摘要；教学依赖固定为 7.8.5，阶段 3 和实验模板各自生成独立 npm 锁文件，不改网站根锁。
- 同日：核对 [exec](https://docs.npmjs.com/cli/v11/commands/npm-exec/)、[ls](https://docs.npmjs.com/cli/v11/commands/npm-ls/) 与 [explain](https://docs.npmjs.com/cli/v11/commands/npm-explain/)。本地缺失时可临时准备到缓存；正文统一用 `--no --` 避免缺失包安装和选项被 npm 解析。实际 npm 11.19.1 下未分隔的 npx -r 被 npm 解析，已改为有分隔写法并重跑。
- 同日：先写示例后写正文，实际运行 scripts、范围判断、两次 ci 失败/修复、依赖树、参数转发和重复文件保护；详细记录见 [examples/c18](../examples/c18/README.md)。版本与命令核对使用 npm 11 文档，不将文档选择器显示的更新补丁号当成本项目版本；未引入语言提案或新的站点依赖。

## C19 Yarn、pnpm、Bun 的职责与选择

- 2026-10-17：核对 Yarn 的[安装](https://yarnpkg.com/getting-started/install)、[安装方式](https://yarnpkg.com/features/linkers)、[PnP](https://yarnpkg.com/features/pnp)、[workspaces](https://yarnpkg.com/features/workspaces)与 [install](https://yarnpkg.com/cli/install)。区分 Classic 1.x 与 Modern、默认 PnP 与可选 node-modules linker、ESM 加载集成提示、每个 workspace 自己声明依赖、--immutable 保持锁。Classic 按[旧版安装页](https://classic.yarnpkg.com/en/docs/install)辨认，不把 npm 上的 yarn 包当成 Modern 入口。
- 同日：核对 [Corepack README](https://github.com/nodejs/corepack)、[Yarn Corepack](https://yarnpkg.com/corepack)和 [Node 25 Corepack](https://nodejs.org/download/release/latest-v25.x/docs/api/corepack.html)。以 Node 25 文档确认不再随 Node 分发，避免沿用 Yarn 页面仍保留的「所有后续 Node 版本均附带」表述；使用已有 Corepack 0.36.0，正文直接 corepack yarn/pnpm，按 packageManager 固定版本，无需改全局 shims。
- 同日：按 pnpm 的[安装](https://pnpm.io/installation)、[链接结构](https://pnpm.io/symlinked-node-modules-structure)、[存储设置](https://pnpm.io/settings#packageimportmethod)、[install](https://pnpm.io/cli/install)和 [add](https://pnpm.io/cli/add)核对当前 pnpm 12 原生工具、内容寻址 store、文件导入方法与符号链接、默认隔离及提升例外、冻结安装与 --save-exact。实跑确认 add --exact 不适用，正文改为 --save-exact 后重跑通过。
- 同日：核对 Bun 的[安装](https://bun.com/docs/installation)、[运行时](https://bun.com/docs/runtime)、[锁文件](https://bun.com/docs/pm/lockfile)、[Node 兼容性](https://bun.com/docs/runtime/nodejs-compat)、[生命周期脚本](https://bun.com/docs/pm/lifecycle)、[测试](https://bun.com/docs/test)与[打包](https://bun.com/docs/bundler)。确认 JavaScriptCore、Bun 1.2 起默认 bun.lock 文本格式、安装与执行可分别选择、现有 Node 在 PATH 时 script 的 node 保留及 --bun 切换；测试/打包只列职责，不提供未执行的实验。
- 同日：npm registry 元数据 `npm view @yarnpkg/cli-dist version engines --json`、`npm view pnpm version engines --json`、`npm view bun version --json` 分别返回 4.18.1、12.14.0、1.4.3；模板固定这些工具版本。`npm view wrap-ansi@7.0.0 dependencies engines --json` 确认它直接依赖 string-width ^4.1.0，实验锁选中 4.2.3；[wrap-ansi 官方源码](https://github.com/chalk/wrap-ansi/tree/v7.0.0)用于核对显示宽度换行用法。旧 CommonJS 小包用于稳定演示依赖边界，并非要求实际项目降级依赖。
- 同日：三份模板在仓库外临时目录验证，固定数据来自 shared/products.json；冻结安装、完整报告、隐藏依赖失败/补齐、PnP 与 node-modules 对照、锁冲突/同步及 Node/Bun 运行时探测均实跑。根清单与根锁未改，未新增 D2；细节见 [examples/c19](../examples/c19/README.md)。

## C20 构建工具与第一次 UT

- 2026-10-17：核对 [Vite 入门](https://vite.dev/guide/)、[构建](https://vite.dev/guide/build)、[资源处理](https://vite.dev/guide/assets)与[静态部署](https://vite.dev/guide/static-deploy)，区分开发服务/静态构建/本地预览、HTML 入口、模块图、base 资源重写、静态 new URL 处理与运行时 API 支持。Node 24 满足工具要求，未使用脚手架或修改网站基础设施。
- 同日：核对 [build.sourcemap](https://vite.dev/config/build-options#build-sourcemap)、[assetsInlineLimit](https://vite.dev/config/build-options#build-assetsinlinelimit)、[server.fs.allow](https://vite.dev/config/server-options#server-fs-allow)与 [Chrome source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps)。阶段 2 页面作为构建 root，阶段 3 专用 dist 为产物；实际输出 JSON、动态块、.map，映射断点命中原 Inventory 的 setStock。
- 同日：核对 [Vitest 入门](https://vitest.dev/guide/)、[CLI](https://vitest.dev/guide/cli)、[Test API](https://vitest.dev/api/test)、[expect](https://vitest.dev/api/expect)与 [Node 环境](https://vitest.dev/config/environment)。使用 describe/it/expect、it.each、toBe/Object.is、toEqual、函数包装的 toThrow、await/rejects；正常测试与红灯实验用独立配置选择目录。watch script 显式 --watch，避免非交互终端的默认单次运行。
- 同日：核对 [Vite TS 转译](https://vite.dev/guide/features#typescript)与 [TypeScript 基础/类型擦除](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)，独立实验对比 Vite 构建成功/tsc noEmit 报 TS2345/浏览器 123；Number 转换后检查通过且浏览器显示 15。类型检查不替代 JSON 和表单运行时校验。
- 同日：`npm view vite version engines --json`、`npm view vitest version engines peerDependencies --json`、`npm view typescript version engines --json` 返回 Vite 8.3.4、Vitest 5.0.5、TypeScript 7.0.2；Vitest peer 兼容 Vite 8，Node 24 在支持范围。开发依赖精确锁入阶段 3 自己的清单与锁，根清单与根锁保持不变。版本、命令和先红后绿/边界破坏/浏览器执行记录见 [examples/c20](../examples/c20/README.md)。

## C21 React 来由、JSX 与第一个组件

- 2026-10-17：核对 [React 从零构建](https://react.dev/learn/build-a-react-app-from-scratch)、[Vite 模板命令](https://vite.dev/guide/#scaffolding-your-first-vite-project)与 [CRA 退役](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)。官方示例使用 react-ts，本课按 Vite 官方提供的 react 模板选择 JS/JSX；实跑 create-vite 9.2.1 的 `npm create vite@latest inventory-react -- --template react --no-interactive`，参考阶段保留入口与 StrictMode、去掉欢迎素材及本课用不到的 lint/type 依赖。
- 同日：核对 [2013 年设计来由](https://legacy.reactjs.org/blog/2013/06/05/why-react.html)、[函数组件](https://react.dev/learn/your-first-component)、[JSX](https://react.dev/learn/writing-markup-with-jsx)、[表达式](https://react.dev/learn/javascript-in-jsx-with-curly-braces)、[Fragment](https://react.dev/reference/react/Fragment)、[createRoot](https://react.dev/reference/react-dom/client/createRoot)、[createElement](https://react.dev/reference/react/createElement)与 [style](https://react.dev/reference/react-dom/components/common#applying-css-styles)。只讲首次显示与元素描述，不提前展开 state、props、Effect。
- 同日：npm registry 的 version/engines/peerDependencies 核对得到 React/react-dom 19.3.1、Vite 8.3.4、@vitejs/plugin-react 6.1.2（兼容 Vite 8），Node 24 满足工具要求；阶段 4 精确锁定上述包与 Vitest 5.0.5，网站根清单和根锁不变。[StrictMode](https://react.dev/reference/react/StrictMode)、[Vite JSX](https://vite.dev/guide/features#jsx)和 [Chrome 断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)用于开发转换与调试说明；实际运行记录见 [examples/c21](../examples/c21/README.md)。

## C22 Props、组合与渲染模型

- 2026-10-17：核对 React 官方 [props](https://react.dev/learn/passing-props-to-a-component)、[条件渲染](https://react.dev/learn/conditional-rendering)、[纯组件](https://react.dev/learn/keeping-components-pure)与[纯渲染规则](https://react.dev/reference/rules/components-and-hooks-must-be-pure)：解构默认值只处理 undefined、children 接收嵌套 JSX、数字 0 会显示、props 及其嵌套值只读、局部新建数据可以修改。示例使用固定商品数据自主编写；另核对 [key 特殊属性](https://react.dev/warnings/special-props)不作为业务 prop 传给组件、[renderToStaticMarkup](https://react.dev/reference/react-dom/server/renderToStaticMarkup)只生成静态 HTML 字符串。
- 同日：核对 [render/commit](https://react.dev/learn/render-and-commit)、[createRoot](https://react.dev/reference/react-dom/client/createRoot)与 [StrictMode](https://react.dev/reference/react/StrictMode)。实验显式 root.render，同位置同类型的输入节点可保留，日志调用次数不等于 DOM 操作或业务事务次数；保留开发检查，状态更新从下一课展开。
- 同日：按[官方 React DevTools 入口](https://react.dev/learn/react-developer-tools)找到 [Meta 的 Chrome 商店页](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)，商店显示扩展 8.0.0 已安装；实际打开 Components，定位 key=P002 但 product=P001 的卡片，Profiler 入口可见。没有新增依赖或安装命令，沿用阶段 4 独立锁；浏览器和先失败后修复记录见 [examples/c22](../examples/c22/README.md)。

## C23 useState：状态快照与更新队列

- 2026-10-17：核对 React 官方[组件的记忆](https://react.dev/learn/state-a-components-memory)、[响应事件](https://react.dev/learn/responding-to-events)和[Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)。useState 返回值与 setter、初始值与跨渲染保存、事件传函数、各实例独立、顶层调用与条件返回顺序均按当前文档。只讲 useState，不将后续 use API 的特殊规则泛化到这里。
- 同日：核对[state 快照](https://react.dev/learn/state-as-a-snapshot)、[更新队列](https://react.dev/learn/queueing-a-series-of-state-updates)与 [useState 参考](https://react.dev/reference/react/useState)：同一事件的快照、批处理与分别处理点击、替换值/updater 的顺序、纯 updater 与 StrictMode 开发检查、setter 无返回值。Node 手算器只算单个 state 队列；真实 React 事件、延时闭包和页面结果另行运行验证。
- 同日：核对 [Vitest 环境](https://vitest.dev/guide/environment)、[Happy DOM 官方仓库](https://github.com/capricorn86/happy-dom)与 [React act](https://react.dev/reference/react/act)。npm registry `npm view happy-dom version engines --json` 返回 21.0.3、Node >=20；只锁入阶段 4 的 devDependencies，按文件选择 happy-dom，不引入 RTL 或修改站点根依赖。使用 React createRoot/act 和可控时钟，测试连续补货及等待期间的新操作，保留两份教学错误起点。

## C24 数组更新、key 与派生数据及 Java ↔ JS 速查

- 2026-10-17：核对 React 官方[对象更新](https://react.dev/learn/updating-objects-in-state)、[数组更新](https://react.dev/learn/updating-arrays-in-state)和 [useState 相同值检查](https://react.dev/reference/react/useState#ive-updated-the-state-but-the-screen-doesnt-update)。强调 state 只读约定、Object.is、浅复制、新容器与新目标记录、嵌套 tags 的复制路径、纯 updater；未修改元素可以继续共享引用。
- 同日：核对[列表 key](https://react.dev/learn/rendering-lists)及[保留和重置状态](https://react.dev/learn/preserving-and-resetting-state)。同级稳定 key 配合类型识别组件，key 非普通 prop；索引错位使用实际行内草稿复现；随机 key 重建及移出树后重新挂载的边界按文档说明。
- 同日：核对[state 结构](https://react.dev/learn/choosing-the-state-structure)和[渲染时计算派生结果](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)，只存来源状态，筛选排序统计直接计算，草稿与已保存值区分。速查页回链已核查的 C03–C24 和对应官方入口，不引入新年度特性、安装命令或依赖；沿用阶段 4 独立锁和 Node 24。运行证据见 [examples/c24](../examples/c24/README.md)。

## C25 表单、校验与可访问性

- 2026-10-17：核对 React 官方 [input](https://react.dev/reference/react-dom/components/input)、[select](https://react.dev/reference/react-dom/components/select) 与[用 state 响应输入](https://react.dev/learn/reacting-to-input-with-state)。受控输入同步保存 value/checked，非受控使用 defaultValue/defaultChecked；select 在父元素管理当前值；草稿与业务记录分开，关闭表单后重新挂载读取已保存值。
- 同日：核对 MDN [FormData 构造](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData)、[数字输入](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number)、[button](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)、[约束校验](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation) 与 [requestSubmit](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit)。区分字符串/数字、name/id、未勾选/disabled 的省略规则、required/min/max/step、原生校验先于 submit、noValidate 自定义入口与取消按钮类型；未使用新 action API。
- 同日：核对 [W3C WAI 表单反馈](https://www.w3.org/WAI/tutorials/forms/notifications/) 与 [aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)。采用可见 label、字段说明关联、总错误 alert、成功 status、首次错误焦点及关闭后的焦点安排；浏览器检查键盘与关联属性，没有把屏幕阅读器朗读列为已验证。
- 同日：沿用现有 Node 24、npm 11 和阶段 4 独立锁，无安装新包、语言提案或新教学图；精确金额输入按两位小数文本解析，并检查安全整数分。运行、先失败后修复与 Chrome 证据见 [examples/c25](../examples/c25/README.md)。

## C26 状态提升、保留与重置

- 2026-10-17：核对 React 官方[共享 state](https://react.dev/learn/sharing-state-between-components)与[选择 state 结构](https://react.dev/learn/choosing-the-state-structure)。共同父节点拥有共享来源，子组件以 props/回调协调；受控设计可按组件行为划分；选中编号替代重复对象，派生值直接计算，未提交草稿与业务记录区分。
- 同日：核对[保留和重置 state](https://react.dev/learn/preserving-and-resetting-state)、[useState 初始值](https://react.dev/reference/react/useState)和 [key 特殊属性](https://react.dev/warnings/special-props)。树位置、组件/祖先类型与同级 key 决定身份；props 更新不重做初始化；移除再挂载不恢复旧 state，嵌套定义和不稳定 key 会重置子树。原创实验复用固定库存数据。
- 同日：核对[按 key 重置整份状态](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)与 [Context 的使用边界](https://react.dev/learn/passing-data-deeply-with-context)。单一编辑区使用商品 key，草稿本地保存，筛选不卸载编辑区；跨商品保存草稿作为设计对照，未加入默认应用。不新增 Effect、Context、依赖、安装流程或 D2 图；沿用阶段 4 的 npm 锁。运行记录见 [examples/c26](../examples/c26/README.md)。

## C27 useReducer 与 Context

- 2026-10-17：核对 React 官方[提取 reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)与 [useReducer](https://react.dev/reference/react/useReducer)：state/action/新 state、纯计算、初始化函数、dispatch 的稳定身份和无返回值、快照/连续队列、Object.is 与 StrictMode 开发纯度检查。业务 action、校验和边界由本项目自主定义；未引入第三方状态库。
- 同日：核对 [reducer 配合 Context](https://react.dev/learn/scaling-up-with-reducer-and-context)、[createContext](https://react.dev/reference/react/createContext)与 [useContext](https://react.dev/reference/react/useContext)。分开传递数据/dispatch、同一 Context 对象、最近上层 Provider、静态默认值与显式 undefined、React 19 的直接 Provider 写法、Context 订阅通知与父组件渲染的区别均依当前文档。
- 同日：沿用 Node 24、npm 11、React 19 与阶段 4 独立锁，无新依赖、安装工具或 D2。库存是页面内本地业务数据；Context 不实现服务端缓存、重试和失效。原创实验复用固定商品；运行与先失败后修复记录见 [examples/c27](../examples/c27/README.md)。

## C28 useRef 与外部系统

- 2026-10-17：核对 React 官方 [useRef](https://react.dev/reference/react/useRef) 与[引用值](https://react.dev/learn/referencing-values-with-refs)：同身份保留容器、初始值、每实例独立、current 可变但不触发渲染、不用 ref 充当渲染数据。普通 JS 对象例子只解释别名和闭包，React 的跨渲染行为由真实组件验证。
- 同日：核对 [DOM ref](https://react.dev/learn/manipulating-the-dom-with-refs)、[Effect 同步](https://react.dev/learn/synchronizing-with-effects)、[useEffect](https://react.dev/reference/react/useEffect) 与[纯渲染](https://react.dev/reference/rules/components-and-hooks-must-be-pure)。DOM 提交后连接 ref、移除归 null；已存在节点的事件焦点与条件挂载后的 Effect 焦点分开；空依赖、开发检查和卸载 cleanup 仅作为起点，完整依赖/竞态留给后课。
- 同日：核对 MDN [focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)、[clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout) 与 Node 24 [timers](https://nodejs.org/download/release/latest-v24.x/docs/api/timers.html)。浏览器与 Node 句柄类型区分，清空容器不等于撤销任务；项目自主约定一次保留一条延时记录。沿用 Node 24、npm 11 与阶段 4 独立锁，无新增依赖、安装工具或 D2。实际运行、失败/修复和焦点证据见 [examples/c28](../examples/c28/README.md)。

## C29 useEffect 深入与清理

- 2026-10-17：核对 [useEffect](https://react.dev/reference/react/useEffect)、[响应式生命周期](https://react.dev/learn/lifecycle-of-reactive-effects)、[依赖调整](https://react.dev/learn/removing-effect-dependencies)与[无需 Effect](https://react.dev/learn/you-might-not-need-an-effect)。确认提交后同步、依赖改变时旧 cleanup 先于新 setup、闭包保留对应输入、Object.is 逐项比较、函数式更新去掉 count 读取、派生值直接计算和按触发原因划分事件；未展开请求竞态或新增 Hook API。
- 同日：按 [StrictMode](https://react.dev/reference/react/StrictMode)核对根部首次开发 setup/cleanup 检查与局部子树边界；按 MDN [removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)核对监听身份、类型与 capture。原创浏览器内通知、interval、循环止损与 ref 拦截实验不连接服务；标题与键盘监听加入阶段 4，D2 保留源码及嵌入中文字体的 SVG。
- 同日：核对官方 [Hooks lint](https://react.dev/reference/eslint-plugin-react-hooks)、[exhaustive-deps](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps)与 [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files)。npm registry 查询 eslint 10.13.0（支持 Node >=24）、eslint-plugin-react-hooks 7.1.1（peer 包含 ESLint 10），仅精确锁入阶段 4；开启 rules-of-hooks/exhaustive-deps，错误实验单独 lint。网站根清单和锁不变；运行明细见 [examples/c29](../examples/c29/README.md)。

## C30 请求状态与竞态调试

- 2026-10-18：核对 React 官方 [useEffect 请求数据](https://react.dev/reference/react/useEffect#fetching-data-with-effects)和[同步 Effect 的请求清理](https://react.dev/learn/synchronizing-with-effects#fetching-data)。每次 setup 独立的 ignore、旧 cleanup 失效、成功和失败更新归属、StrictMode 的首次开发检查；原创固定商品实验控制完成顺序，未新增缓存库或自定义 Hook。
- 同日：核对 MDN [使用 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)、[Response.json](https://developer.mozilla.org/en-US/docs/Web/API/Response/json)、[AbortController.abort](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)和 [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)。区分 HTTP 错误与网络拒绝、body 异步解析与字段校验、默认 AbortError、signal 一次性，以及 abort 不能撤销不支持 signal 的后续处理。实验后续 setTimeout 刻意不接入 signal，不将其耗时冒充网络慢请求。
- 同日：核对 [Vite 内置环境变量](https://vite.dev/guide/env-and-mode#built-in-constants)的 BASE_URL 和 [Chrome Network](https://developer.chrome.com/docs/devtools/network/)、[节流与离线](https://developer.chrome.com/docs/devtools/network/reference/#throttling)。实际使用 /js_web/ 子路径、禁用缓存、传输节流和 Offline；Accept: application/json 使 Vite 的缺文件请求返回真实 404，避免 SPA 首页回退。独立后台 Chrome 与暂停帧的运行明细见 [examples/c30](../examples/c30/README.md)。
- 同日：沿用阶段 4 的 Node 24、npm 11 和独立锁，无新依赖或新安装命令。扩充 c29-effect-lifecycle 共用 D2 的请求归属栏，C29 更新读图说明，全站仍为 13 张图。

## C31 自定义 Hooks 与路由

- 2026-10-18：核对 React 官方[自定义 Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)、[Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)和 [useState 初始化](https://react.dev/reference/react/useState)。提取 C30 的手工生命周期而不改变竞态防护；独立调用不共享 state，依赖仍在 Hook 内完整声明。本课文本存储 Hook 限浏览器、固定 key、string 值，不实现跨实例/跨标签同步。
- 同日：核对 React Router 官方[声明式安装](https://reactrouter.com/start/declarative/installation)、[路由](https://reactrouter.com/start/declarative/routing)、[HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter)、[useParams](https://reactrouter.com/api/hooks/useParams)、[useSearchParams](https://reactrouter.com/api/hooks/useSearchParams)、[Link](https://reactrouter.com/api/components/Link)及[可访问性](https://reactrouter.com/how-to/accessibility)。npm registry `npm view react-router version engines peerDependencies --json` 返回 8.4.0，Node >=22.22.0、React/react-dom >=19.2.7；现有 Node 24、React 19.3.1 满足，精确锁入阶段 4 的独立清单与锁。正文用 `npm install --save-exact react-router@8`，沿用 Vite base，不改网站根依赖或站点配置。
- 同日：核对 MDN [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)和 [URI fragment](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment)。hash 不发服务器，搜索参数由 Router 解读，静态正文保持普通路径；文本读取/写入分别捕获异常。浏览器刷新/分享/历史、本地记录损坏及测试记录见 [examples/c31](../examples/c31/README.md)。

## C32 认识 TanStack Query 与服务端状态

- 2026-10-18：核对 TanStack Query 官方[安装](https://tanstack.com/query/latest/docs/framework/react/installation)、[查询函数](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions)、[查询键](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)与 [QueryClient](https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient)。使用 v5 对象参数 API、queryKey 内容匹配、变量入键、稳定客户端、Promise 数据/异常；HTTP 状态与响应校验沿用 C30。npm registry `npm view @tanstack/react-query version engines peerDependencies --json` 返回 5.104.4，React peer 为 ^18 或 ^19，@types/react 可选；阶段 4 精确锁入 5.104.4，依赖 query-core 同版，现有 React 19.3.1 满足。正文主版本安装，已有锁时 npm ci。
- 同日：核对[默认规则](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)、[查询重试](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries)、[查询状态](https://tanstack.com/query/latest/docs/framework/react/guides/queries)与[查询取消](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)。staleTime 与闲置 gcTime 分离；默认浏览器重试三次，本课配置 retry 1/300ms；初次 pending、后台 fetching、失败保留 data 与 paused 分开处理，signal 消费到 fetch。库默认和本课设置分别说明。
- 同日：核对 [mutation](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)、[useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation)、[查询失效](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)与[保存后失效](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)。仅 hook 级 onSuccess 用保存响应 id 精确失效；await 活跃读回保持 mutation pending，失效保留数据，非活跃查询等下次读取；写失败与读回失败区分。浏览器内 mock 仅内存 Map，没有写 API、后端持久化或多用户能力。
- 同日：只新增阶段 4 依赖和独立锁，不改网站根依赖/锁、不新增 D2（按 PLAN 图清单）。Actions 安装阶段 4 锁并运行 lint/test/build，供 C32 Node 示例使用实际库；行为、错误先失败后修复与 Chrome 运行记录见 [examples/c32](../examples/c32/README.md)。

## C33 现代 React 19 与更新速查

- 2026-10-18：核对 React 官方 [form action](https://react.dev/reference/react-dom/components/form)、[useActionState](https://react.dev/reference/react/useActionState) 和 [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)。函数 action 接收 FormData、Transition 上下文、正常完成后重置非受控字段；useActionState 先传 previousState 再传 payload，同 Hook 顺序排队，返回 result/dispatcher/isPending，手动调用需放在 Action 中；useFormStatus 只读最近上层 form，不能读同一组件返回的 form。原受控编辑表单保持 onSubmit。
- 同日：核对 [useOptimistic](https://react.dev/reference/react/useOptimistic) 和 [TanStack useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation)。预览仅在 Action 期间有效，完成后采用输入来源；来源变化时 reducer 可重新应用更新。项目使用绝对预计库存，等待 mutateAsync 与原精确失效/读回，业务写失败回退；写成功而读回失败继续由查询错误提示处理，不重复写入。原 C32 组件和实验保留。
- 同日：核对 [ref prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)、[Custom Elements](https://react.dev/reference/react-dom/components#custom-html-elements) 与 [use](https://react.dev/reference/react/use)。函数组件接收并传递 ref；先注册元素、构造时暴露对象 property、on 加完整大小写敏感事件名；use 读取跨渲染稳定的 Promise，配合 Suspense/错误边界，不能用 render 中新建 Promise 或首次挂载 useMemo 代替可靠缓存。固定单商品 Promise 仅作进阶身份实验。
- 同日：核对 [19.2](https://react.dev/blog/2025/10/01/react-19-2)（2025-10-01）、[19.3](https://react.dev/blog/2026/09/09/react-19-3)（2026-09-09）正式发布说明，记录 Activity/useEffectEvent/Performance Tracks/cacheSignal 与稳定 ViewTransition/Fragment refs、browser()/Trusted Types、Server Component 直接渲染 Context Provider 的更新索引；未把这些索引条目标成已运行的进阶实验。
- 同日：核对 [Server Functions](https://react.dev/reference/rsc/server-functions) 与 [RSC](https://react.dev/reference/rsc/server-components)。区分浏览器 Action、服务器函数及其 Action 用法、RSC 构建时/请求时执行；use server 是框架识别服务器函数的指令，普通 Vite 项目没有自动接入，Pages 不执行提交时服务器函数。沿用 Node 24/npm 11、React 19.3.1 和原独立锁，不加依赖或 D2；运行记录见 [examples/c33](../examples/c33/README.md)。

## C34 性能、加载与错误诊断

- 2026-10-18：核对 React 官方 [Profiler](https://react.dev/reference/react/Profiler)、[memo](https://react.dev/reference/react/memo)、[useMemo](https://react.dev/reference/react/useMemo)、[useCallback](https://react.dev/reference/react/useCallback) 与 [Compiler](https://react.dev/learn/react-compiler/introduction)。确认 actual/baseDuration、生产 profiling 默认关闭、逐 prop/依赖 Object.is、state/Context 更新、缓存可丢弃及构建时显式接入 Compiler；面板基本读法核对官方 [Profiler 介绍](https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)，不用旧文的实验 tracing API。
- 同日：核对 [useTransition](https://react.dev/reference/react/useTransition)、[lazy](https://react.dev/reference/react/lazy)、[Suspense](https://react.dev/reference/react/Suspense) 与 [Vite 动态导入](https://vite.dev/guide/features#dynamic-import)。回调立即执行、受控输入同步、更新可中断而同步 JS 不可抢占；lazy 在首次渲染加载并缓存 Promise/结果、要求 default，普通 Effect fetch 不触发 Suspense。本课只为报表代码拆分，不引入 Suspense 数据接口。
- 同日：核对[错误边界](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)，getDerivedStateFromError/componentDidCatch、组件堆栈、边界自身与普通事件/异步错误的范围及 Hook Transition 例外；区分重建渲染子树和重试已拒绝的 lazy。沿用阶段 4 的 React 19、npm 锁，不加依赖或 D2；放大数据只用于展示实验，运行与未运行范围见 [examples/c34](../examples/c34/README.md)。


## C35 React UT、集成测试与 E2E 地图

- 2026-10-18：核对 [RTL API](https://testing-library.com/docs/react-testing-library/api/)、[Vitest 清理配置](https://testing-library.com/docs/react-testing-library/setup/#auto-cleanup-in-vitest)、[查询类型与优先级](https://testing-library.com/docs/queries/about/)、[ByRole](https://testing-library.com/docs/queries/byrole/) 和 [user-event](https://testing-library.com/docs/user-event/intro/)。确认 render/screen/within、角色与可访问名称、get/query/find 的零/多匹配语义、每用例 setup 和 await 交互；沿用 happy-dom，测试 DOM 语义与业务行为，真实布局留浏览器。
- 同日：核对 [Vitest DOM 环境](https://vitest.dev/guide/environment.html)、[mock 函数](https://vitest.dev/guide/mocking/functions.html)、[RTL 异步等待](https://testing-library.com/docs/dom-testing-library/api-async/)、[jest-dom 的 Vitest 入口](https://github.com/testing-library/jest-dom#with-vitest)、[user-event 假时钟配置](https://testing-library.com/docs/user-event/options/#advancetimers)。显式 afterEach cleanup，测试 QueryClient 独立且 retry=false/gcTime=Infinity，结束清缓存、恢复 spy/global；失败与成功替换加载边界，真实组件/Query 保留。本课用例不启用假时钟。
- 同日：npm registry 查询 @testing-library/react 16.3.3（React/react-dom ^18 或 ^19、DOM ^10、Node >=18）、@testing-library/dom 10.4.2（Node >=18）、@testing-library/user-event 14.6.8（DOM >=7.21.4）、@testing-library/jest-dom 7.0.1（Node >=22）、@playwright/test 1.64.1（Node >=20）；精确锁入阶段 4 独立清单与锁，现有 Node 24/React 19 满足。正文使用主版本安装命令，当前仓库用 npm ci；根清单/锁不变。
- 同日：核对 [Playwright 测试](https://playwright.dev/docs/writing-tests)、[断言自动等待](https://playwright.dev/docs/test-assertions)、[webServer](https://playwright.dev/docs/test-webserver) 与[浏览器安装](https://playwright.dev/docs/browsers)。选择 Chromium，先构建后预览，独立端口、保留 /js_web/ 与 hash，不复用现有服务；关键路径为筛选→详情→刷新→返回，静态 JSON 真实读取。E2E 命令本地执行，未改变现有 Pages workflow。
- 同日：核对 [Jest 定位](https://jestjs.io/docs/getting-started)与 [Vitest 快照](https://vitest.dev/guide/snapshot.html)，区分运行器/组件辅助库/浏览器 E2E；小型序列化输出需审阅参考变更，整页 DOM 快照不能代替行为断言。无新语言特性或 D2。运行与正反实验记录见 [examples/c35](../examples/c35/README.md)。


## C36 React 项目复盘与故障排查、React Hooks 速查

- 2026-10-18：核对 React [状态结构](https://react.dev/learn/choosing-the-state-structure)、[开发者工具](https://react.dev/learn/react-developer-tools)、[Hooks 目录](https://react.dev/reference/react/hooks)与 [Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)。原创综合实验分别隔离派生统计、查询身份与外部存储；本地商品详情改读同一 Provider，六种初始商品的 Query/Action mock 继续作为独立学习来源。速查仅汇总已教 API，use 的条件调用单独说明；未新增 React API。
- 同日：核对 TanStack [查询键](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)、Chrome [Network](https://developer.chrome.com/docs/devtools/network/)、[source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps)、Vite [build.sourcemap](https://vite.dev/config/build-options#build-sourcemap)与 Vitest [测试筛选](https://vitest.dev/guide/filtering)。在新鲜期复现漏编号导致缓存复用/无新请求；沿用既有 sourcemap=true，生产断点检查构建源码对应；测试按文件和 -t 名称筛选。
- 同日：核对 MDN [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)。商品快照使用独立版本化键，只在明确按钮事件写入/清除；读取校验字段、重复编号和格式，失败保留原记录，合法 0 和空数组可恢复。初始化不写盘，未接入跨标签同步、真实后端或自动保存。沿用 Node 24/npm 11 与阶段 4 独立锁，无新依赖、安装命令或 D2。三个错误起点的先失败后修复与 Q3 记录见 [examples/c36](../examples/c36/README.md)。

## C37 组件生态与选择标准

- 2026-10-18：核对 [Ant Design](https://ant.design/docs/react/introduce/)、[Material UI](https://mui.com/material-ui/getting-started/)、[Mantine](https://mantine.dev/getting-started/)、[Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)、[shadcn/ui](https://ui.shadcn.com/docs) 与 [UI5 Web Components for React](https://github.com/UI5/webcomponents-react)。按交付方式比较成套样式/行为、无样式交互基础和本地代码分发；Radix Themes 与 Primitives 分开，shadcn 具体底层依所选条目判断，UI5 React 不等于经典 UI5。
- 同日：核对 [Ant Design Table](https://ant.design/components/table/)、[主题](https://ant.design/docs/react/customize-theme/)、[shadcn Data Table](https://ui.shadcn.com/docs/components/radix/data-table)、[TanStack Table 行模型](https://tanstack.com/table/latest/docs/guide/tables)与 [React Hook Form 官方仓库](https://github.com/react-hook-form/react-hook-form)。区分 UI、表格逻辑、请求缓存与表单管理；rowKey 不替代业务事件 id，显示文本与数字排序分离。TanStack Table introduction 网址返回 404，RHF 官网抓取 403，改用上述官方页面，不据失败页面推测 API。
- 同日：核对 [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) 和 [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)。原创原生 table/dialog 实验仅作操作基线：showModal/inert、可访问标题、字段/错误关联、取消草稿与关闭焦点；主题位于根元素，区分 DOM/CSS 继承和 React Portal/Context。第三方库未接入，不把资料核对写成组件运行通过。
- 同日：逐一核对官方仓库 LICENSE：[antd MIT](https://github.com/ant-design/ant-design/blob/master/LICENSE)、[Material UI MIT](https://github.com/mui/material-ui/blob/master/LICENSE)、[Mantine MIT](https://github.com/mantinedev/mantine/blob/master/LICENSE)、[Radix Primitives MIT](https://github.com/radix-ui/primitives/blob/main/LICENSE)、[shadcn/ui MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)、[UI5 React Apache-2.0](https://github.com/UI5/webcomponents-react/blob/main/LICENSE)；[MUI X 官方许可页](https://mui.com/x/introduction/licensing/) 区分 Community 与商业扩展，许可结论限定到所列项目/包，额外 registry、素材、依赖分别检查。
- 同日：官方 GitHub API 查询最新发布：antd 6.6.6（10-12）、Material UI v9.5.0（10-09）、Mantine 9.7.3（10-17）、shadcn helpers 0.3.0（10-16，仓库按包发布，不代表每个本地组件升级）、UI5 React v2.27.3（10-09）；[Radix 官方发布说明](https://www.radix-ui.com/primitives/docs/overview/releases) 最新章节为 2026-07-06，其 GitHub latest release API 404，不解释为停止维护。正文教授检查相关控件修复和迁移路径，不写市场排名或无证据的维护评分。
- 同日：实际运行 `npm view antd peerDependencies license --json`；含 version 的查询得到 6.6.6，peer 为 react/react-dom >=18.0.0、MIT；命令仅查询、不安装。核对 [Vitest globals](https://vitest.dev/config/globals)，独立配置复用阶段 4 已锁的 Vitest 运行器，无新依赖、安装命令或 D2；运行结果见 [examples/c37](../examples/c37/README.md)。

## C38 一个普通组件库的完整案例

- 2026-10-18：核对 Ant Design 官方 [Vite 接入](https://ant.design/docs/react/use-with-vite/)、[Getting Started](https://ant.design/docs/react/getting-started/) 与 [Table](https://ant.design/components/table/)。npm registry 查询 `npm view antd version engines peerDependencies license --json` 返回 6.6.6、React/react-dom >=18、MIT；阶段 5 精确锁入 6.6.6，沿用阶段 4 的 React 19.3.1、Vite 8.3.4、Vitest 5.0.5、Playwright 1.64.1。独立 package.json/lock 只属于阶段 5，根工程不加依赖。rowKey、dataIndex、render(value,record)、数值 sorter、局部横向滚动与空态按公开 API 实现。
- 同日：核对 [Form](https://ant.design/components/form/) 的 Form.Item 字段收集、valuePropName、Promise validator、initialValues、preserve 与 scrollToFirstError focus；[Modal](https://ant.design/components/modal/) 的 destroyOnHidden、afterOpenChange、afterClose、focusable、mask 对象和默认 Portal。关闭后卸载 ProductEditor 及内部 useForm 实例，逐次生成草稿；复用阶段 4 文本校验/整数分/标签保留/快照，不让库替代业务约束。浏览器发现首尾 Tab 可离开文档，应用通过 modalRender 在可见控件首尾直接循环；对照当前安装包 @rc-component/util 的焦点实现定位，没有改依赖文件。
- 同日：核对 [ConfigProvider](https://ant.design/components/config-provider/) 与[主题指南](https://ant.design/docs/react/customize-theme/)，使用中文 locale、主题算法和 token；声明式 Modal 保留 React Context，区分 DOM/CSS 继承。四项分类 Select 关闭虚拟化，直接保留对应选项语义。按 [MUI X 许可](https://mui.com/x/introduction/licensing/)对照 Community 与 Pro/Premium，未安装其他候选库；antd MIT 范围沿用 C37 官方 LICENSE 来源。
- 同日：核对 [React 状态保留与重置](https://react.dev/learn/preserving-and-resetting-state)与 [Playwright Chrome 通道](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge)，浏览器独立 headless profile，不操作用户窗口；开发实验和生产构建分开验证。无新 D2，遵守 PLAN 图清单。运行结果与未运行范围见 [examples/c38](../examples/c38/README.md)。

## C39 SAP Fiori 与 UI5 家族

- 2026-10-18：核对 [SAP Design System](https://www.sap.com/design-system/)、[SAP Fiori](https://www.sap.com/design-system/fiori-design-web/v1-120/discover/sap-design-system/sap-fiori)、[SAPUI5/OpenUI5 比较](https://ui5.github.io/docs/02_Read-Me-First/sapui5-vs-openui5-5982a97.html)及 [SAPUI5 库清单](https://ui5.sap.com/versioninfo.html)。Fiori 是设计系统；SAPUI5/OpenUI5 共享核心及常用库，交付库与使用条件分别核对；`sap.ui.comp` 不在 OpenUI5 中。没有把公开 CDN 的可访问性解释为任意产品的使用授权。
- 同日：核对 UI5 官方 [MVC](https://ui5.github.io/docs/04_Essentials/model-view-controller-mvc-91f2334.html)、[JSONModel](https://ui5.github.io/docs/04_Essentials/json-model-96804e3.html)、[Walkthrough JSON Model](https://ui5.github.io/docs/03_Get-Started/step-7-json-model-70ef981.html)、[CDN 引导](https://ui5.github.io/docs/04_Essentials/variant-for-bootstrapping-from-content-delivery-network-2d3eb2f.html)与 [JSONModel 当前源文件](https://github.com/UI5/openui5/blob/1.153.0/src/sap.ui.core/src/sap/ui/model/json/JSONModel.js)。使用 async bootstrap、模块初始化、XMLView.create、命名模型、getProperty/setProperty；直接修改 getData 对象绕过更新通知。实验无输入或服务写入，不把双向绑定等同于校验/提交。
- 同日：[OpenUI5 CDN 版本表](https://openui5.hana.ondemand.com/version.json)与 npm registry 查询 `@openui5/sap.ui.core` 均得到 1.153.0、Apache-2.0，固定此资源版本；sdk.openui5.org 在本次网络下 TLS/抓取失败，使用可访问的官方 openui5.hana.ondemand.com CDN，未混用 SAPUI5。核对固定版本 CDN 维护期限与 compat-version 的用途。
- 同日：核对 [UI5 Web Components](https://ui5.github.io/webcomponents/docs/)、[React 包装库官方仓库](https://github.com/UI5/webcomponents-react)与 [React 自定义元素](https://react.dev/reference/react-dom/components#custom-html-elements)。React 19 可原生处理 Custom Elements，包装库提供便利接口与组合组件；未采用已弃用 charts 包。registry 查询 Web Components 2.27.2、React 包装库 2.27.3，均 Apache-2.0；后者 peer React/react-dom ^18 或 ^19，相关 UI5 peers ~2.27.0，仅查询未安装。
- 同日：核对 [UI5 CLI 4](https://ui5.github.io/cli/v4/)、[命令职责](https://ui5.github.io/cli/v4/pages/CLI/)、[框架库配置](https://ui5.github.io/cli/v4/pages/OpenUI5/)与 [属性元数据绑定](https://ui5.github.io/docs/04_Essentials/property-metadata-binding-f5aa4bb.html)。CLI 已从 UI5 Tooling 更名，npm 查询 @ui5/cli 4.0.71、Node ^20.11.0 或 >=22、npm >=8、Apache-2.0；本课只执行查询，不安装。分清控件类型元数据、OData 服务元数据/注解与原创本地字段展示配置，未把本地配置写成 OData 格式或自动表单引擎。
- 同日：新增家族/MVC 共用 D2，一课一图，全站当前 14 张。沿用网站与阶段 4 已锁工具，无新依赖或工作流变更，阶段 6 留给 C40。纯 JS 与真实 UI5 浏览器回归记录见 [examples/c39](../examples/c39/README.md)。

## C40 OpenUI5 入门：MVC 与工程

- 2026-10-18：核对 [UI5 CLI 安装与接入](https://ui5.github.io/cli/v4/pages/GettingStarted/)、[配置格式](https://ui5.github.io/cli/v4/pages/Configuration/)、[OpenUI5 框架库](https://ui5.github.io/cli/v4/pages/OpenUI5/) 与 [Builder](https://ui5.github.io/cli/v4/pages/Builder/)。npm registry 查询 @ui5/cli 4.0.71，engines 为 Node ^20.11.0 或 >=22、npm >=8；@openui5/sap.ui.core 当前 1.153.0。阶段 6 精确锁 CLI，ui5.yaml 固定框架版本，根清单/锁与工作流不变；serve 提供 webapp 与框架资源，build --all 包括传递依赖，clean-dest 清理构建目标；根据 Builder 任务表与 CLI include-task 文档，额外生成默认未启用的 generateVersionInfo，补齐生产加载所需的 resources/sap-ui-version.json。
- 同日：核对 [Component 配置](https://ui5.github.io/docs/03_Get-Started/step-9-component-configuration-4cfa608.html)、[manifest 与 ComponentSupport](https://ui5.github.io/docs/03_Get-Started/step-10-descriptor-for-applications-8f93bf2.html) 与 [模块](https://ui5.github.io/docs/03_Get-Started/step-6-modules-f665d0d.html)。采用 async bootstrap、ComponentSupport、IAsyncContentCreation、manifest rootView/models、父类 init 与命名模型；ComponentSupport 的容器 autoPrefixId 实测令组件实例 ID 为 container-inventory。UI5 loader 模块、XML 点号名称、浏览器 URL 与 Node ESM 配置分开。
- 同日：沿用 C39 的 JSONModel 官方来源，建立 inventory 静态 JSON 模型和 ui 内存提示模型；本课只引入列表最小绝对/相对绑定，完整校验/编辑与模型作用域留 C41。真实 OpenUI5 1.153.0 加载 sap.m App/Page/VBox/HBox/Label/Input/Button/Text/List/StandardListItem，验证 aggregation、labelFor、事件接收者、View 局部 ID 与库存 0；不把 XML 当原生 HTML，也不把 JSONModel 当后端。
- 同日：动态初始化命令按 CLI 官方资料；固定框架资源与独立 npm 锁用于参考工程。构建产物包含应用预加载与 resources，相对 URL 用于子目录部署；没有把本地 UI5 练习写成已接入主站演示。无新 D2，遵守 PLAN 图范围；真实运行、故障与未运行范围见 [examples/c40](../examples/c40/README.md)。

## C41 UI5 Model、绑定与业务控件

- 2026-10-18：核对 UI5 官方 [JSONModel](https://ui5.github.io/docs/04_Essentials/json-model-96804e3.html)、[绑定模式](https://ui5.github.io/docs/04_Essentials/data-binding-68b9644.html)、[表达式绑定](https://ui5.github.io/docs/04_Essentials/expression-binding-daf6852.html)与[列表筛选](https://ui5.github.io/docs/03_Get-Started/step-23-filtering-5295470.html)。确认 JSONModel 默认属性双向绑定、setProperty 通知、默认非观察对象的直接修改、formatter 单向、%{} 原值、items 行上下文与 Application 类筛选；本课汇总当前完整匹配集合，不开启 growing。
- 同日：核对 [Dialog/Fragment](https://ui5.github.io/docs/03_Get-Started/step-16-dialogs-and-fragments-4da7298.html)与 [Controller.loadFragment API](https://ui5.github.io/typescript/api/openui5/1.120/sap.ui.core/sap/ui/core/mvc/Controller/classes/Controller.html)。loadFragment 默认传入 Controller、加入 View dependents、添加 View ID 前缀与依赖销毁；Promise 缓存、独立标量草稿、校验后按上下文路径保存是本课设计，不是自动事务。
- 同日：核对 [ResourceModel](https://ui5.github.io/docs/03_Get-Started/step-6-resource-models-9790d9a.html)、[本地化文案](https://ui5.github.io/docs/04_Essentials/use-of-localized-texts-in-applications-91f3859.html)与[运行配置/语言参数](https://ui5.github.io/docs/04_Essentials/configuration-options-and-url-parameters-91f2d03.html)。使用异步 ResourceModel、supportedLocales 空根/英文、fallbackLocale 空根、getResourceBundle/getText 参数替换；语言选择通过当前 URL 增加 sap-ui-language 后重载，界面提示恢复初始商品，不实现运行时无损切换。
- 同日：沿用 C40 锁定的 OpenUI5 1.153.0/UI5 CLI 4.0.71、Node 24/npm 11 与阶段 6 独立锁，无新依赖、根锁改动或 D2。回归复用阶段 4 的 Vitest/Playwright，C40 回归的取值适配 List 升级为 Table；运行、故障注入与静态子路径记录见 [examples/c41](../examples/c41/README.md)。

## C42 UI5 路由与 OData 起点

- 2026-10-19：核对 [Routing Configuration](https://ui5.github.io/docs/04_Essentials/routing-configuration-9023130.html)、[路由参数](https://ui5.github.io/tutorials/walkthrough/steps/31/index.html)与[历史导航](https://ui5.github.io/tutorials/walkthrough/steps/32/index.html)。App 根 View 提供 pages，targets 按 Component 前缀创建独立 View，Component 初始化 Router；route 使用业务 id，详情等待 JSONModel.dataLoaded 并检查数据，按 id 找当前路径。实际版本的 hasher 源码默认 prependHash 为 /，生成与直接打开地址统一用 #/products/P004，pattern 仍为 products/{id}。示例返回按钮明确回列表并 replace 历史项。
- 同日：核对 [OData V2 URI 约定](https://www.odata.org/documentation/odata-version-2-0/uri-conventions/)、[V2 Model](https://ui5.github.io/docs/04_Essentials/odata-v2-model-6c47b2b.html)、[V4 API 变化](https://ui5.github.io/docs/04_Essentials/changes-compared-to-odata-v2-model-abd4d7c.html)与[V4 读取 V2 的限制](https://ui5.github.io/docs/04_Essentials/consuming-odata-v2-services-with-the-odata-v4-model-365bdbd.html)。分清实体类型/实体集/键、缓存 getProperty 与 read，V2 回调集合已解包为 results；V4 基于绑定，不直接迁移 read；当前官方目录把 V4 读取 V2 的兼容模式标为 deprecated。查询使用显式复合 AND 避免同字段顶层 filters 被 OR 分组，实际有限查询为 P006、P004；样例只投影固定数据的五个标量字段，整数分均在 Edm.Int32 范围。
- 同日：核对 [MockServer 当前文档](https://ui5.github.io/docs/04_Essentials/mock-server-69d3cbd.html)、[启动教程](https://ui5.github.io/tutorials/walkthrough/steps/26/index.html)与[V2 支持清单](https://ui5.github.io/docs/04_Essentials/odata-features-supported-by-the-odata-v2-mock-server-3459c37.html)。浏览器替身拦截 XHR；使用同源站内路径作为 rootUri/serviceUrl，先启动再建 V2 模型，固定 Products.json、关闭随机补数据、batch 与只读实验 token handling。V4 本地 mock 指向 CAP；本课没有把 fetch、真实网络服务、鉴权或完整 CRUD 写成已验证。
- 同日：核对 [UI5 安全与认证职责](https://ui5.github.io/docs/05_Developing_Apps/secure-programming-aspects-91f3c40.html)、[SAP Application Router/Destination](https://help.sap.com/docs/btp/sap-business-technology-platform/application-routes-and-destinations)与[认证配置](https://help.sap.com/docs/btp/sap-business-technology-platform/application-router-configuration)。区分浏览器 Router 与服务端入口，认证、权限、CSRF/ETag 和 CORS 取决于真实部署；Pages 仅托管静态前端。
- 同日：沿用 OpenUI5 1.153.0/UI5 CLI 4.0.71 与阶段 6 独立锁，无新增依赖、安装命令、D2 或工作流改动。本次 shell 默认为 Node 23，验证工具切换到本地现有 Node 24.19.0；未改仓库原有 Node/npm 固定版本。运行与故障实验范围见 [examples/c42](../examples/c42/README.md)。

## C43 UI5 Web Components 原生使用

- 2026-10-19：核对 [First Steps](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/)、[组件 API](https://ui5.github.io/webcomponents/docs/getting-started/components-APIs/)、[Input](https://ui5.github.io/webcomponents/components/Input/) 与 [Card](https://ui5.github.io/webcomponents/components/Card/)。npm registry 所见 webcomponents/base/icons 均 2.27.2，Vite 8.3.4；实验目录精确锁定，按模块注册、布尔属性存在语义、Input.value 字符串、ui5-input 前缀事件、Card header slot 与 Input input part 实施，未改根锁与经典 UI5 工程。
- 同日：核对 [Assets](https://ui5.github.io/webcomponents/docs/advanced/using-assets/) 与 [配置](https://ui5.github.io/webcomponents/docs/advanced/configuration/)，Assets.js 用于打包器动态加载，主题/语言由 setTheme/setLanguage 设置；组件英文/default theme 内置，应用文字另行管理。Vite 实际主题文件名为 parameters-bundle.css-*.js，中文为 messagebundle_zh_CN-*.js，正文操作按实际命名说明。
- 同日：核对 [React 19 Custom Elements](https://react.dev/reference/react-dom/components#custom-html-elements)，已注册属性按 property 处理，事件用 on 加原名并保留大小写/连字符；React/ReactDOM 复用 19.3.1 精确版本，原生对照使用 onui5-input 和布尔 disabled，无包装依赖。Node 验证用现有 24.22.0/npm 11.7.0；记录与未运行范围见 [examples/c43](../examples/c43/README.md)。

## C44 UI5 Web Components for React

- 2026-10-19：核对 [React 包装库官方仓库](https://github.com/UI5/webcomponents-react)与[稳定版组件文档](https://ui5.github.io/webcomponents-react/v2/)。推荐安装 react 包装库、webcomponents、fiori；直接导入 base/icons 时列为直接依赖。npm registry 当前包装库 2.27.3，React/react-dom peers 为 ^18 或 ^19，UI5 peers ~2.27.0；原生/base/fiori/icons 为 2.27.2。本阶段精确锁定并独立安装，无网站根锁或其他阶段依赖改动；charts 已 deprecated，未安装。
- 同日：核对 [Form](https://ui5.github.io/webcomponents/components/Form/)、[FormItem](https://ui5.github.io/webcomponents/components/FormItem/)、[List](https://ui5.github.io/webcomponents/components/List/)与[Select](https://ui5.github.io/webcomponents/components/Select/)。Form 是布局容器，提交使用原生 form；labelContent 为命名 slot；List item-click 读取 detail.item，Select change 读取 detail.selectedOption。安装包 dist 中核对 Input/List/FormItem 的 withWebComponent 元数据、ThemeProvider 和 FlexBox 实现：camelCase 回调、slots、主题/语言监听与 React 布局，不把所有组件写成原生元素的一对一别名。
- 同日：核对 [React 自定义元素](https://react.dev/reference/react-dom/components#custom-html-elements)、[状态保留与重置](https://react.dev/learn/preserving-and-resetting-state)及[资源说明](https://ui5.github.io/webcomponents/docs/advanced/using-assets/)。React 19 直接元素入口继续有效；包装接口另提供便利功能。ThemeProvider 与 setTheme/setLanguage、Assets 职责分开；业务中文由应用管理；主题/翻译 chunks 随整个 dist 交付。本课不新增 D2，沿用 C39 家族图的概念；运行记录见 [examples/c44](../examples/c44/README.md)。

## C45 全链路 Debug 与交付前检查

- 2026-10-19：核对 Chrome [Network](https://developer.chrome.com/docs/devtools/network)、[source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps) 与 Vite [build.sourcemap](https://vite.dev/config/build-options#build-sourcemap)。沿用阶段 4 的 base=/js_web/、sourcemap=true、独立清单和锁；分别演示根路径资源 404、Accept: application/json 的数据 404、默认 Accept 触发 Vite SPA HTML 回退以及离线失败。新课使用现有 npm ci/build/preview，未修改网站配置、工作流或依赖版本。
- 同日：核对 MDN [URL 相对引用](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references)与 [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)，分清域名根、应用 base 与同源存储；核对 React [对象 state 更新](https://react.dev/learn/updating-objects-in-state)、Chrome [Performance](https://developer.chrome.com/docs/devtools/performance)、[Memory](https://developer.chrome.com/docs/devtools/memory-problems) 与 [Accessibility](https://developer.chrome.com/docs/devtools/accessibility/reference)。状态实验复用 C24，坏存储复用 C36；新的监听器实验在关闭后比较 window → 事件监听器 → updateProbe → 节点的保留链，正确版同时 removeEventListener。性能复用 C34 同规模列表，无关备注更新前后比较；采样值只记录到 examples README。
- 同日：本课新增开发实验，不增加生产入口。生产源码断点、真实布局/键盘/请求、堆快照与回归结果见 [examples/c45](../examples/c45/README.md)。沿用 Node 24/npm 11、React 19、Vite 8 与既有测试工具，无新依赖或 D2；Pages 发布教程正文，阶段 4 应用继续作为本地练习。

## C46 静态构建与 GitHub Pages

- 2026-10-19：核对 [Vite 静态部署](https://vite.dev/guide/static-deploy.html)、[base](https://vite.dev/guide/build.html#public-base-path)、[public 资源](https://vite.dev/guide/assets.html)与[环境值替换](https://vite.dev/guide/env-and-mode.html)。沿用 Vite 8、Node 24、独立阶段锁；构建后 preview 读已有 dist，动态 fetch 用 BASE_URL，public 文件按原相对路径复制；VITE_ 值进入客户端。新增严格文件预览和产物检查，无依赖或根工作流改动；Astro preview 的 --ignore-lock 按当前 CLI 帮助与[官方 CLI 文档](https://docs.astro.build/en/reference/cli-reference/#--ignore-lock)核对，用于独立预览实例。
- 同日：核对 [Astro Pages](https://docs.astro.build/en/guides/deploy/github/)、[GitHub 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)与现有 action 固定提交。模板复用仓库已用的 checkout v7/setup-node v6/configure-pages v5/upload-pages-artifact v4/deploy-pages v5，不追逐新版；区分阶段 run 工作目录、action path、根网站 dist 和阶段 dist，deploy needs build，环境 github-pages、pages/id-token 写权限；个人模板未实际部署。
- 同日：核对 [HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter)与 [MDN URL.hash](https://developer.mozilla.org/en-US/docs/Web/API/URL/hash)。hash 不随 HTTP 发送；普通路径依靠真实文件，开发 SPA 回退与 Pages 行为分开验证。新增 C46 D2，并按 PLAN 上限将 C16/C18 合并为共用图，总数保持 14；实际运行与 Pages 结果见 [examples/c46](../examples/c46/README.md)。


## C47 综合项目与测试选择

- 2026-10-19：核对 [Vitest](https://vitest.dev/guide/)、[RTL](https://testing-library.com/docs/react-testing-library/intro/)、[user-event](https://testing-library.com/docs/user-event/intro/) 与[异步查询](https://testing-library.com/docs/dom-testing-library/api-async/)。沿用现有 Vitest 5.0.5、RTL 16.3.3、user-event 14.6.8、happy-dom 21.0.3；运行器与测试范围分开，组件保留真实业务函数，fetch 为替身。独立 Query 客户端关闭自动重试并清理，生产规则不改。固定输出仅导入无宿主依赖的业务模块。
- 同日：核对 Playwright [最佳实践](https://playwright.dev/docs/best-practices)、[自动重试断言](https://playwright.dev/docs/test-assertions)与[浏览器安装](https://playwright.dev/docs/browsers)。沿用 1.64.1 与 C46 严格静态配置；新增键盘/快照/刷新主流程，每条上下文隔离；安装命令为已锁定 CLI 的 npx playwright install chromium，trace 命令按本地 CLI 提示。沿用 MDN [localStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage) 的同源行为，360px 视口和真机体验分开表述。
- 同日：键盘回归发现真实生产入口连续输入“鼠标”只剩“标”。核对 React [startTransition](https://react.dev/reference/react/startTransition) 对受控输入的限制、当前 React Router 8.4.0 [HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter) 文档和安装包 lib/dom/lib.js/d.ts：默认路由状态包裹 transition，useTransitions=false 同步提交。阶段 4 的搜索直接读 URL，六条数据使用同步导航，main.jsx 采用该选项并保留 StrictMode。用同一连续输入/刷新/返回回归验证修复，没有增加输入延迟。无新增依赖、根锁、D2、网站配置或工作流改动；运行与未运行范围见 [examples/c47](../examples/c47/README.md)。

## C48 总复盘与后续路线

- 2026-10-19：核对 MDN [语言概览](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Language_overview)、[toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) 与 [Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility)。复盘语言内建/宿主边界、对象身份、浅复制与数字比较；兼容决策分开记录标准状态、目标环境支持和项目采用方案。复制排序降级只覆盖本课稠密数字数组，语法转译与运行时 polyfill 分开。未引入新提案或版本依赖。
- 同日：核对 [TC39 已完成提案](https://github.com/tc39/proposals/blob/main/finished-proposals.md)、[React 版本入口](https://react.dev/versions)、[Node 维护阶段](https://nodejs.org/en/about/previous-releases)、[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)与 [Vite Pages 部署](https://vite.dev/guide/static-deploy.html#github-pages)。沿用现有锁、命令与阶段 4；Stage 4/年度标准/实际环境支持分别判断，选修方向是 CURRICULUM 既有 X01–X10。实例更新依据 [React state 快照](https://react.dev/learn/state-as-a-snapshot)，不把快照误写成对象自动冻结。
- 同日：本课七个固定输出、Node inspect、项目演示、Q4 周验收和 PLAN §10 核查的实际记录见 [examples/c48](../examples/c48/README.md)。未新增业务逻辑、依赖、D2、站点基础设施或工作流。网站学习进度 F1 仍为独立未完成项，最终核查保留该缺项。
