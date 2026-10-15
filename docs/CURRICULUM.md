# 48 课课程大纲

适用读者：会 Java、初学前端。主节奏为每天 3–4 小时、每日 2 课、每周 6 天；8 周路线每天 1 课。

课号 C01–C48 是稳定 ID，网站网址和学习进度均应与之对应。下面是写作大纲，尚不是已写完的课程。

所有需要操作的任务在正式课程中标注 **「自己尝试 · 环境」**，并给出完整必要文件、命令、操作步骤、预期结果和常见失败原因。无需将所有例子变成在线应用。

贯穿业务：库存管理。采用同一组商品数据，在 JS、React、普通组件库、OpenUI5 和 UI5 React 中复用。

## 第 1 周：历史、语言、结构与浏览器

| 日 | 课号与标题 | 必须讲清的内容 | 自己尝试与验收 |
| --- | --- | --- | --- |
| 1 | C01 JavaScript 的故事与生态地图 | 1995 浏览器脚本背景、1997 ECMAScript、浏览器兼容、ES5、Node/npm、ES2015 与年度标准、现代框架；语言/引擎/宿主/工具；为什么与 Java 名字相近却是不同语言 | 用自己的话解释浏览器/Node/Bun/npm/React 的职责；把旧代码的 var/回调/CommonJS 放回历史背景 |
| 1 | C02 Web 基础与第一个调试现场 | HTML 语义、表单和 DOM；CSS 选择器/盒模型/Flex/Grid/响应式；URL/HTTP 与页面加载；编辑器、终端、Console、Elements、Sources；脚本加载 | 建立商品卡片 HTML/CSS/JS，调整手机布局；在 Console 查看变量，在断点处观察值，修复一个路径错误 |
| 2 | C03 值、类型、转换与比较 | 7 种原始类型与对象；typeof；Number/BigInt、浮点数、整数精度；null/undefined；truthy；===、==、Object.is；?? 与 || | 预测并解释输出；修复价格、库存与默认值处理；比较 Java 整数除法/BigDecimal 与 JS Number |
| 2 | C04 变量、作用域与控制流 | let/const/var、块作用域、提升与 TDZ；const 不冻结对象；if/switch、循环、for-of/for-in；异常与错误堆栈入门 | 改写 Java 统计函数；断点观察循环；修复越界访问和作用域问题，不用“对象按引用传参”的错误说法 |
| 3 | C05 对象、引用与数据交换 | 对象字面量、属性/可选链、解构与展开；别名与浅复制；JSON 解析/序列化边界；日期/时区与字符串常见操作 | 实现商品记录转换、深层字段读取与 JSON 导入；证明浅复制仍共享内层对象 |
| 3 | C06 函数、闭包与高阶操作 | 函数是值、声明/表达式/箭头函数、参数/默认值/rest；词法作用域、闭包；高阶函数；Java lambda 类比及边界 | 写库存筛选工厂与独立计数器；用 Scope 面板观察闭包；修复循环闭包捕获错误 |
| 4 | C07 this、原型与 class | this 由调用方式决定；箭头函数的词法 this；call/apply/bind；属性查找与原型链；class/private 字段、组合；与 Java 类/继承的不同 | 预测方法脱离对象后的结果；用函数和 class 两种方式建模；解释实例为何能访问原型方法 |
| 4 | C08 Array 与业务数据处理 | 遍历、map/filter/find/some/every/reduce；sort 默认规则、比较器、稳定性；修改/非修改 API；toSorted 等现代写法；稀疏数组 | 商品筛选、数字排序、统计库存、分组；避免修改输入，比较 Java Stream 和数组操作 |
| 5 | C09 Object、Map、Set 与弱集合 | 字典选择、键类型、插入顺序、对象身份；Map/Set 操作；WeakMap/WeakSet 的用途与不可枚举性；分组与去重；迭代协议入门 | 去重标签、建立商品 ID 索引、按分类分组；解释两个内容相同对象为何是不同 Map 键 |
| 5 | C10 栈、队列、树与复杂度 | Big O 入门；Array 与 Java ArrayList 的类比边界；栈、带头索引队列、链表概览；树 DFS/BFS；图的邻接表概览；递归深度 | 栈实现撤销、队列处理任务、树生成分类导航；比较 shift 和头索引方案；复杂度不承诺所有引擎内部实现 |
| 6 | C11 DOM、事件、表单与页面调试 | 查询/更新节点、文本与 HTML；冒泡/捕获/委托；表单与基础校验；DOM/CSS 调试、事件断点、可访问性；最小化直接操作 | 为商品列表增加筛选和编辑；用事件断点定位重复触发；用 DOM 断点定位意外删除 |
| 6 | C12 从回调到 Promise：执行顺序 | 同步调用栈、任务/微任务、渲染概念；Promise 状态/链、异常传播、finally；异步不等于线程；浏览器与 Node 的宿主差异 | 预测一段输出顺序并用断点/日志验证；修复嵌套回调和漏 return；本周库存数据模块验收 |

第 1 周验收：能解释类型/闭包/原型的常见错误，并独立处理库存数据。Web 基础只要求够理解与调试，后续持续补充 CSS、布局与可访问性。

## 第 2 周：现代 JS、运行时、工具与 React 起步

| 日 | 课号与标题 | 必须讲清的内容 | 自己尝试与验收 |
| --- | --- | --- | --- |
| 7 | C13 async/await、请求与 Network | 串行/并发、Promise.all/allSettled/race/any；forEach(async) 陷阱；fetch 状态与 HTTP 错误、AbortController、竞态；Network 看 Headers/Payload/Response/Timing；CORS | 请求静态商品 JSON，显示加载/空/错态；模拟慢网和失败；旧结果不能覆盖新搜索 |
| 7 | C14 原生页面、存储与错误处理 | localStorage/JSON、防损坏、导入导出；事件与渲染组织；try/catch 与用户错误提示；Application 面板、浏览器存储和刷新行为 | 完成原生库存页面 v1；损坏存储时可恢复；区分服务器数据与当前浏览器本地状态 |
| 8 | C15 ES2015 到 ES2026：如何读更新 | ES2015 核心转折；async/await、可选链、空值合并、现代集合/数组、迭代能力；年度速查；规范/提案/实际支持；TC39 0/1/2/2.7/3/4 | 将旧写法迁移为现代写法；检查两个新 API 的目标环境支持；不把所有 Stage 4 都写成同一年度特性 |
| 8 | C16 模块、依赖与组织代码 | ESM import/export、静态/动态导入、模块作用域、循环依赖概念；浏览器 URL 解析 vs 包解析；CommonJS require/module.exports 与边界 | 将库存逻辑拆为 ESM 文件；修复导出/路径/加载错误；读懂一个 CommonJS 示例 |
| 9 | C17 Node 与浏览器的边界 | Node 运行 JS 的模型、V8、系统 I/O 与线程池概览；process/path/fs/promises/Buffer/基础 stream；环境变量、ESM；Node --inspect | 本地读取库存 JSON 并生成报告；调试文件路径/异步异常；解释为何浏览器没有 fs，而 Node 没有 DOM |
| 9 | C18 npm：项目、版本与可复现安装 | package.json、scripts、dependencies/devDependencies/peerDependencies；semver、registry、install/ci、exec/npx；lockfile；Maven 类比的边界 | 建立两个脚本、阅读依赖树和锁文件；在独立练习目录验证清单/锁不一致时 npm ci 失败 |
| 10 | C19 Yarn、pnpm、Bun 的职责与选择 | Yarn Classic/Modern、PnP/node-modules linker、workspaces；pnpm 存储/链接与隐藏依赖；Bun runtime/package manager/test/bundler；Corepack 状态；兼容性 | 选两种工具在隔离目录尝试同一小项目，记录锁文件与解析差异；主站继续只用 npm |
| 10 | C20 构建工具与第一次 UT | Vite、转译/打包/类型检查区别、开发服务与静态产物、source maps；Vitest 基本用法、describe/it/expect、AAA、边界数据；TS 桥接概要 | 给库存统计写正常/空值/非法输入测试，先观察失败再修复；构建页面并从映射回源码；TS 深入选修 |
| 11 | C21 React 来由、JSX 与第一个组件 | 声明式 UI；函数组件、createRoot、JSX/Fragment、表达式/样式；React 与 DOM 的关系；Vite 练习项目；不用 CRA 开新项目 | 手写商品卡片组件，比较原生 DOM 更新；检查 JSX 的报错与编译后结构 |
| 11 | C22 Props、组合与渲染模型 | props、children、组件拆分、单向流、纯渲染；render/commit 区分；条件渲染；React DevTools Components 查看树/props | 拆分列表/卡片/工具栏；从组件树定位错误 props；避免修改输入 props |
| 12 | C23 useState：状态快照与更新队列 | Hooks 调用规则；事件函数；每次 render 的 state 快照、批处理、函数式更新、闭包；连续更新与延时回调；状态不等于 Java 可变字段 | 修复“加三次只加一次”和延时读取旧值；解释修复而非只背函数式写法 |
| 12 | C24 数组更新、key 与派生数据 | 不可变对象/数组更新、map/filter；列表 key 与组件身份；派生数据/排序/过滤；状态最小化 | 商品增删改查与过滤；证明索引 key 导致编辑错位；不把过滤结果另存一份 state |

第 2 周验收：原生页面与 Node 工具可自行完成；读懂 npm 工程；React 列表/状态能正确变化；能写一个发现业务 bug 的单测。

## 第 3 周：详细 React

| 日 | 课号与标题 | 必须讲清的内容 | 自己尝试与验收 |
| --- | --- | --- | --- |
| 13 | C25 表单、校验与可访问性 | 受控/非受控、input/select/checkbox；label、错误信息、提交、焦点；表单值字符串与业务数字；原生校验 | 建立商品编辑表单；空名称、负库存、非法价格不能提交；纯键盘可操作 |
| 13 | C26 状态提升、保留与重置 | 找到共同父节点、事件回调向上；受控设计、最小 state；位置/类型/key 与状态保留；props/state 边界 | 列表和统计同步；切换商品时编辑表单按预期重置；解释何时不需要 Context |
| 14 | C27 useReducer 与 Context | reducer 纯函数、action、复杂更新；Context 消费/Provider；业务状态、UI 状态与服务端状态；避免 Context 泛滥 | 给库存操作写 reducer，并测更新与非法 action；只共享确实跨层的数据 |
| 14 | C28 useRef 与外部系统 | ref 与 state 的区别；DOM 焦点、可变句柄；不在 render 中产生副作用；Effect 作为外部同步的起点 | 提交后聚焦输入；用 ref 保存取消句柄；解释 ref 改变为何不触发 render |
| 15 | C29 useEffect 深入与清理 | 依赖、闭包、setup/cleanup、订阅与监听；StrictMode 开发验证；不需要 Effect 的派生值与事件处理；lint 规则 | 修复重复监听、缺清理和循环更新；用日志解释开发环境的验证过程；不靠关闭 StrictMode 解决 |
| 15 | C30 请求状态与竞态调试 | fetch 手工请求状态机；HTTP/网络错误；AbortController、过期响应、取消与资源清理；Network 对照 | 快速切换商品详情，模拟失败和慢网；保证旧请求不覆盖新内容；正确恢复加载状态 |
| 16 | C31 自定义 Hooks 与路由 | 复用逻辑、不共享独立实例状态；useLocalStorage 等；Hook API/依赖设计；React Router 参数/嵌套/404/URL 状态；Pages 演示用 hash 路由 | 提取一个 Hook；实现列表/详情路由；刷新/分享演示 URL 可用；正文仍是普通静态路径 |
| 16 | C32 认识 TanStack Query 与服务端状态 | 手工请求和缓存库职责；query key、缓存、重试、失效、mutation；本地 UI 状态仍留在 React；模拟服务不等于真实后端 | 对已有详情请求加缓存；改变商品后使相应查询失效；比较快网/慢网与重复访问 |
| 17 | C33 现代 React 19 与更新速查 | Actions、useActionState/useFormStatus/useOptimistic、ref prop、Custom Elements；use 的缓存要求；19.2/19.3 更新索引；Server Functions/RSC 边界 | 浏览器异步 mock 演示提交中/成功/失败；辨认哪些代码需要服务器；新特性进阶实验可跳过 |
| 17 | C34 性能、加载与错误诊断 | React DevTools Profiler；纯渲染与避免无意义更新；memo/useMemo/useCallback、transition；lazy/Suspense 的实际边界、错误边界；Compiler 简介 | 测量筛选列表再优化；按需加载一个区域；区分加载 fallback、请求状态和渲染错误 |
| 18 | C35 React UT、集成测试与 E2E 地图 | Vitest、Testing Library、user-event、角色查询；render/screen、用户行为断言；异步/mock/cleanup；Jest 与 Playwright 职责；快照测试边界 | 测表单校验、创建商品、失败重试；不用只断言内部 state；认识一条跨页 E2E，不要求重复测试所有分支 |
| 18 | C36 React 项目复盘与故障排查 | 组件/状态/请求架构复盘；Console→Components→Network→Profiler 的排查顺序；source maps；测试失败的定位 | 完成 React 库存 v2 核心练习；修复三个预置 bug，并为适合的 bug 加回归测试 |

React 16 课的写作深度要求：

- C23 必须用多段预测输出代码讲透状态快照、函数式更新和闭包，不只列 API。
- C24–C27 用同一数据变化对比错误/正确设计，说明状态放哪里、哪些数据不该存储。
- C29–C30 给完整错误例子、触发步骤、清理时序和修复依据。
- C31–C32 先有手工实现，再引出抽象与工具，避免同时学习过多库。
- C33 拆为核心现代用法与更新附录；不强迫初学者掌握所有新 API。
- C34 先测量，再优化；不能讲成每个函数都需要 useCallback。
- C35 至少包括一个真实业务回归和一个异步失败用例，解释为什么要选这个测试层级。

## 第 4 周：开源组件、SAP UI5 与交付

| 日 | 课号与标题 | 必须讲清的内容 | 自己尝试与验收 |
| --- | --- | --- | --- |
| 19 | C37 组件生态与选择标准 | 完整组件库、无样式 primitives、组件代码分发；Ant Design/MUI/Mantine/shadcn/ui/Radix/UI5 React；主题、可访问性、维护、许可；UI 库与 Query/Table/Form/状态工具的区别 | 对“商品表格+编辑弹窗”写选择理由；比较三类方案；不背市场排名 |
| 19 | C38 一个普通组件库的完整案例 | 主练习选 Ant Design：Table/Form/Modal、数据与回调、校验、主题；MUI 等短对照；区分社区功能与收费扩展 | 将库存页改成组件库版；处理空/错态、验证与焦点；不要求把所有候选库都装进工程 |
| 20 | C39 SAP Fiori 与 UI5 家族 | Fiori 设计系统；SAPUI5/OpenUI5 交付与库范围；经典 MVC；Web Components 与 React 包装关系；Tooling/CLI；为何企业应用需要绑定/元数据 | 用一张 D2 图解释家族；根据需求选择经典 UI5 或 React + UI5 路线 |
| 20 | C40 OpenUI5 入门：MVC 与工程 | bootstrap、模块、XML View、Controller、Component、manifest、UI5 CLI 与静态构建；常见 Layout/List/Button/Input 控件 | 本地建立商品列表最小应用；在 Sources/Console 定位模块或绑定错误 |
| 21 | C41 UI5 Model、绑定与业务控件 | JSONModel、属性/列表/表达式绑定、格式化；事件、表单校验；i18n；Table/List、Dialog/Fragment 与模型作用域 | 完成筛选、编辑 Dialog、汇总、语言切换；检查绑定路径错误；理解 Controller 与 Model 的职责 |
| 21 | C42 UI5 路由与 OData 起点 | manifest 路由、列表/详情；OData 实体/元数据/查询、V2/V4；ODataModel vs JSONModel；V2 浏览器 MockServer；真实 SAP 鉴权与服务边界 | 做详情导航；阅读 metadata；自己尝试一个有限 V2 mock 请求；完整 OData CRUD/V4/CAP 深入选修 |
| 22 | C43 UI5 Web Components 原生使用 | Custom Elements、Shadow DOM、slots、属性/事件、主题与 i18n 资源；npm 导入/打包；与经典 UI5 不同；React 19 原生支持 | 原生页面使用两个组件，监听事件；检查资源请求、主题和 slots；不套用旧 React 自定义事件限制 |
| 22 | C44 UI5 Web Components for React | 包装库的 React API、事件、表单/列表/布局与高层组件；资源与主题；不采用已废弃的 charts 包 | 用 UI5 React 改写同一编辑表单与列表；比较普通组件库版、经典 UI5 版的数据流 |
| 23 | C45 全链路 Debug 与交付前检查 | 真实故障排查：资源 404、请求失败、布局异常、状态不更新、存储损坏、生产 source maps；Performance/Memory 入门、无障碍/移动检查 | 用 Debug 清单排查综合项目；保存一份包含复现步骤、根因、修复与验证的记录 |
| 23 | C46 静态构建与 GitHub Pages | 构建环境与浏览器运行区别；base /js_web/、真实静态页面、资源路径；Actions、产物、Pages；React 演示路由边界 | 构建并预览；自己尝试部署个人练习；验证首页、深层刷新、资源与 hash 路由 |
| 24 | C47 综合项目与测试选择 | 补齐库存应用；以风险选择 UT/集成/E2E；Vitest 核心函数与 reducer、RTL 表单/请求、Playwright 冒烟 | 写测试计划并补 3–5 个有价值的回归用例；完成键盘/手机/数据恢复手工检查 |
| 24 | C48 总复盘与后续路线 | 从历史到生态回顾；Java↔JS 常见差异；语言→数据→UI→工具→静态交付；阅读新版本的方法；个人补缺表 | 不看答案讲清 10 个核心机制；展示项目与排错/测试记录；选择下一阶段学习方向 |

## 数据结构覆盖边界

| 层次 | 内容 | 学习深度 |
| --- | --- | --- |
| 语言内建 | Array/Object/Map/Set、WeakMap/WeakSet、迭代器 | 必修：选择、常用操作、引用身份、业务数据变换 |
| 常见抽象结构 | 栈、队列、树、图、链表 | 栈/队列/树遍历必做；图/链表理解模型与简短代码 |
| 二进制数据 | Buffer、ArrayBuffer/TypedArray/DataView | Node Buffer 基础必修，完整二进制处理选修 |
| 算法深化 | 双向链表、堆、图搜索、LRU、复杂分析 | 选修；不能挤掉语言、异步和 React 核心 |

复杂度讲抽象操作和示例算法；例如标准并不承诺 Map 总是某一种具体哈希表实现。

## 现代标准附录

设置一页按 ES2015→ES2026 的“解决了什么问题”速查，再设目标环境支持列。ES2026 查询所见新增组包括 Map/WeakMap Upsert、JSON 源文本访问、Iterator Sequencing、Uint8Array Base64/Hex、Math.sumPrecise、Error.isError、Array.fromAsync；正式写课前逐项核对规范、API 名称和目标环境。

TC39 完成提案表查询所见将 Temporal、Explicit Resource Management 列为预计进入 2027，不能标成 ES2026。规范年份、提案阶段与环境支持是三件事；以 [来源文件](SOURCES.md) 指向的官方资料为准。

## 8 周或提前完成时的选修

选修不计入 48 课必修进度，优先补自己容易出错的内容：

- X01：CSS 布局深化、响应式、可访问性与浏览器兼容。
- X02：TypeScript：对象/联合类型、泛型、组件 props、类型检查与运行时校验。
- X03：Generator、Proxy、TypedArray、GC/WeakRef；支持情况与实际用途。
- X04：链表、堆、图与 LRU；用 Java 已知结构迁移思路。
- X05：Node HTTP API、流、worker_threads；本地服务与静态站的边界。
- X06：包发布、workspaces/monorepo、依赖治理与不同管理器实验。
- X07：React 复杂表单、React Hook Form、Zustand 的适用场景；不要为使用库而使用库。
- X08：React Compiler、Activity/useEffectEvent/ViewTransition/Fragment refs 的经验证实验；RSC/SSR 架构。
- X09：OData 完整 CRUD、V4 本地 CAP mock、Fiori Elements、SAP BTP/ABAP 接入概览。
- X10：Jest 现有工程迁移、MSW 请求 mock、测试覆盖率解读、Playwright 多浏览器和故障追踪。

## 每周自检题

1. 第一周：为什么空数组是真值？为什么 const 对象能变？Map 键为何不用 Java equals？闭包保留了什么？
2. 第二周：await 暂停谁？fetch 遇到 404 是否自动抛异常？锁文件固定什么？Node/npm/Bun 为什么不属于同一层？
3. 第三周：state 为什么是快照？key 改变了什么？何时不需要 Effect？怎样防请求竞态？这个测试在验证用户能做什么？
4. 第四周：UI5 的四个名称有何关系？JSONModel/ODataModel 区别是什么？Pages 能执行服务器代码吗？如何定位资源 404 并防回归？
