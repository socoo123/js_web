# 48 课改版任务与验收

2026-10-29 · 本表保留 48 课知识范围与任务，执行队列统一为 [PLAN](PLAN.md) 的 A/B/C。Lab 起点与业务场景见 [Lab 设计](../labs/README.md)，逐章错误见 [DEBUG_TESTING](DEBUG_TESTING.md#revision-v2-errors)，页面规格见 [ARCHITECTURE](ARCHITECTURE.md#revision-v2-ui)。已上线情况以 STATUS 为准。

<a id="revision-v2-curriculum"></a>

## 怎么使用这张表

C01–C48 仍是稳定 ID，原课程标题、slug 和 24 个学习日保持。阶段内接上一课完成态，五个 Lab 可分别从 C00/C10/C20/C36/C44 固定起点补课或恢复。表中路径均相对 `labs/inventory/`；实际发布范围见 STATUS，未接入的课保留旧版入口。正常跟做使用自己的连续工作副本。

每行是一章的主要任务，选型/工具/复盘允许观察、实验或判断。预测、修 bug、项目步骤围绕同一任务。对照列是可用主题，不是强制卡片指标；无合适的 Java 类比时写短说明，不造等价 API。路径可按已有实现做必要调整，同时同步正文与 catalog。

表格前两列保留“学习日 / Cnn 标题”，供 `scripts/sync-roadmap.mjs` 识别；只出现下面连续的 48 行课程记录。额外实现元数据进入 `labs/catalog.json` 后由其生成，不重复手填多份命令。

## Lab 1 库存规则与数据

| 日 | 课号与标题 | 本课主任务与文件 | Java / JS 并排主题 | 完成标准 |
| --- | --- | --- | --- | --- |
| 1 | C01 JavaScript 的故事与生态地图 | 在 `src/core/inventory.js` 增加 P001 库存价值输出；在 `notes/runtime.md` 标明语言、宿主、工具；骨架已提供数据和启动方式 | `System.out.println` / `console.log`；同一库存运算在不同宿主运行 | P001 价值 478800 分；能区分 JS、浏览器、Node/Bun 与 npm；保留历史到年度标准及提案状态的阅读 |
| 1 | C02 Web 基础与第一个调试现场 | 修改 `src/vanilla/index.html`、`styles.css`、`app.js` 的单商品卡片、label 和脚本路径 | Java 输出字符串 / HTML 元素与 DOM；明确浏览器布局是新知识 | 卡片显示 P001/12；label 对应输入；Network 无脚本 404；360px 基本可读，断点可命中 |
| 2 | C03 值、类型、转换与比较 | 在 `src/core/inventory.js` 修复输入转换与默认值，接通卡片补货；覆盖 Number、空值、相等、整数分 | `Integer.parseInt` / `Number`；可空默认值 / `??`；对象身份与值 | 输入 3 后 P001 从 12 到 15；空白、3件、负数、小数不保存；合法库存 0 保留；解释 Number/BigInt 与精度 |
| 2 | C04 变量、作用域与控制流 | 在同一 `inventory.js` 写循环统计、异常分支，替换有问题的变量作用域 | Java 块作用域与 final / let、const、var；for-each / for-of | 总库存 52；空集合 0；不访问越界元素；能在 Scope 找到 TDZ/变量覆盖，解释 const 对象仍可变 |
| 3 | C05 对象、引用与数据交换 | 在 `inventory.js` 创建编辑草稿和导入转换，隔离 tags；从 JSON 还原业务数据 | 引用副本传参 / 引用副本传参；浅复制 / 展开；JSON 与对象 | 修改草稿 tags 后取消，原商品不变；非法 JSON 不替换数据；解释 JSON 对日期/undefined 等的表示边界 |
| 3 | C06 函数、闭包与高阶操作 | 在 `inventory.js` 增加分类筛选工厂与独立操作计数器；任务仍在库存入口执行 | Java Predicate/lambda 捕获 / 函数值、词法闭包；默认参数/rest 短对照 | 外设筛选得到 P001/P002；两个工厂/计数器互不影响；修复循环闭包并观察 Scope |
| 4 | C07 this、原型与 class | 在 `inventory.js` 把库存查询封装为 Inventory，修复作为回调的方法；保持业务数据可提取 | Java 方法引用 / 脱离对象的 JS 方法；class / 原型属性查找 | 直接查询与回调查询结果一致；解释 this 和箭头函数差异；能指出实例/原型各有何属性 |
| 4 | C08 Array 与业务数据处理 | 在 `inventory.js` 增加筛选、数值排序、汇总；从一次查询链解释数组 API | Stream 的 filter/map/reduce / Array；Comparator / sort 比较器 | 原数据总库存 52、总价值 2634800 分；按库存升序 P002/P004/P006/P003/P001/P005；原数组顺序不变 |
| 5 | C09 Object、Map、Set 与弱集合 | 在 `inventory.js` 增加 ID Map、分类分组、标签去重；弱集合只保留小范围机制对照 | HashMap 的 equals/hashCode / Map 身份键；HashSet / Set | P004 查到扩展坞；分类种数 2/1/2/1；标签热销/新品；重复 ID 拒绝；能解释弱键为何不可枚举 |
| 5 | C10 栈、队列、树与复杂度 | 在 `inventory.js` 增加撤销栈、任务队列、分类树 DFS/BFS；完成 L1 收尾 | Deque / Array 栈与头索引队列；树对象与遍历 | 补 P001 3 件后撤销回 12；多次撤销顺序正确；DFS/BFS 各节点恰访问一次；大数据计时只比较量级 |

写作边界：C01–C05 不要求学员先懂 npm/ESM，骨架的启动桥接明确为已提供部分。C07 的 class 是语言练习，不成为以后 React 的可变 state。C08 列约 12 个常用数组 API，覆盖稀疏、越界与修改性；C10 不重复讲 Java 学过的数据结构理论，图/链表只讲表达模型。每章检查读取独立副本，不让本章补货改变下一章的初始测试基准。

## Lab 2 可用的原生库存页

| 日 | 课号与标题 | 本课主任务与文件 | Java / JS 并排主题 | 完成标准 |
| --- | --- | --- | --- | --- |
| 6 | C11 DOM、事件、表单与页面调试 | 把 `src/vanilla/app.js` 扩为六商品列表、委托事件和库存编辑；语义结构在 index.html | Java 监听器 / addEventListener；对象标识 / DOM dataset.id | 筛选后编辑 P004 不改 P001；单击只补一次；商品名以文本渲染；用事件/DOM 断点找重复监听与意外删除 |
| 6 | C12 从回调到 Promise：执行顺序 | 在 `src/services/load-products.js` 加模拟异步加载，app.js 展示状态与收尾 | CompletableFuture 链 / Promise 链；线程与事件循环边界 | 成功有 6 项；失败可见；漏 return 用例能解释并修复；预测同步、微任务、任务顺序，完成第一周检查 |
| 7 | C13 async/await、请求与 Network | 把同一个 loader 改为静态 JSON 请求，在 app.js 增加取消和加载/空/错态 | Java Future 等待 / await 当前函数；HTTP 状态判断 | 404、非 JSON、离线分别可定位；快换筛选时前请求取消；串行/并发、forEach(async) 用页内对照说明 |
| 7 | C14 原生页面、存储与错误处理 | 新增 `src/services/storage.js`，接入 app.js 的保存、恢复、导入导出 | Java 序列化与异常处理经验 / localStorage + JSON | 刷新保留修改；坏 JSON 和字段错误不覆盖好副本；可恢复/导出；明确本浏览器状态不等于服务器数据 |
| 8 | C15 CSS 布局与响应式：排版库存页 | 只修改 `src/vanilla/styles.css` 和必要 HTML，用 Flex/Grid 排工具栏与卡片 | JavaFX/Swing 布局管理器经验 / CSS 布局声明，明确非 API 等价 | 360/768/1280px 分别单/双/四列；无整页横滚；键盘焦点可见；用 Computed 找固定宽度溢出 |
| 8 | C16 模块、依赖与组织代码 | 把已有 inventory.js 拆为 `src/core/{validation,stock,summary,filters,collections,history,tree}.js` 与 facade；更新 app.js 入口 | Java import/package / ESM 绑定与 URL；CommonJS 对照 | 拆分前后业务测试不变；无循环依赖与 404；给出文件搬移清单；查两个特性的标准阶段和环境支持 |
| 9 | C17 Node 与浏览器的边界 | 在 `src/cli/report.js` 复用 summary 读取 data/products.json 并输出报表 | Java Files/Path / fs/promises 与 URL/path；JVM / Node 宿主 | 从不同终端目录调用仍可找数据；6/52/2634800；inspect 断点可命中；能解释 process、Buffer/stream 的用途 |
| 9 | C18 npm：项目、版本与可复现安装 | 在练习根 package.json 补充 report/test scripts；统一入口启动隔离的锁不一致实验 | Maven pom/依赖树 / package.json、lock、scripts；类比边界 | 主工作区安装可复现；隔离副本的 npm ci 因清单/锁不一致失败；理解依赖类型/semver，不改站点根锁 |
| 10 | C19 Yarn、pnpm、Bun 的职责与选择 | 统一入口在 `.lab/sandboxes/` 比较两种工具，把结果写进 notes/tooling.md | Maven/Gradle 是构建工具的经验 / 运行时、包管理、测试、构建分别归位 | 同数据报告一致；记录锁/解析差异；主项目无额外管理器锁；覆盖 Yarn 两代、PnP、pnpm、Bun、Corepack 定位 |
| 10 | C20 构建工具与第一次 UT | 在 `tests/core/` 写统计/校验 UT；配置 Vite 构建原生页；TS 桥接使用提供的小片段 | JUnit AAA / Vitest；编译、转译、打包、类型检查边界 | 正常/空/非法用例能先红后绿；生产页可运行；source map 回源码；知道 TS 类型不会校验 JSON；L2 验收 |

写作边界：C12 仍讲浏览器事件循环，C17 才讲 Node 的宿主差异。C13 只做取消前请求，过期响应完整处理到 C30。C14 只实作 localStorage。C16 是一次有明确清单的重构，允许超过常规 1–3 个文件；不能每章搬目录。C18/C19 不把包管理器切换写进主项目。C20 TypeScript 是短桥接，深入仍选修。

## Lab 3 React 库存应用

| 日 | 课号与标题 | 本课主任务与文件 | Java / JS 并排主题 | 完成标准 |
| --- | --- | --- | --- | --- |
| 11 | C21 React 来由、JSX 与第一个组件 | 在 `src/react/{main,App,ProductCard}.jsx` 渲染同一固定库存；保留原生入口便于对照 | Java 拼文本/调用函数 / JSX 表达式和组件；声明式 UI 的新机制 | 六张卡片与原生数据一致；能解释 JSX 编译、createRoot、Fragment；不重建数据/校验规则 |
| 11 | C22 Props、组合与渲染模型 | 拆 `ProductList.jsx`、`Toolbar.jsx` 与 App；props 单向传递和 children 组合 | Java 方法参数 / props；函数返回 / render 与 commit 的边界 | 从 Components 定位传错 name；渲染不修改 props；商品卡与工具栏职责明确 |
| 12 | C23 useState：状态快照与更新队列 | 在 `StockActions.jsx` 和 App 接入 P001 连续补货、延迟补货；复用 core 的更新能力 | Java 连续可变赋值 / React 同一渲染快照、函数式更新 | 连点补三件从 12 到 15；延迟补三件期间立即补一件最终 16；解释闭包旧值及 Hooks 规则 |
| 12 | C24 数组更新、key 与派生数据 | App 将商品集合统一放 state，ProductList 用 id，添加增删/排序/筛选和派生汇总 | Java 集合操作 / 不可变更新；对象 ID / React key 的身份语义 | 任意商品补货都同步统计；删/排后草稿不串行；不存第二份过滤结果；第二周验收 |
| 13 | C25 表单、校验与可访问性 | 新增 `ProductEditor.jsx` 调用 core 校验，完成名称/库存/元输入与错误焦点 | Java DTO 校验 / 字符串表单边界与受控组件 | 空名称、空库存、负数、非法价格拒绝；0 合法；纯键盘能编辑、保存、看到错误并聚焦 |
| 13 | C26 状态提升、保留与重置 | 修改 App 与 ProductEditor，确立 selectedId/草稿归属、切换商品和取消行为 | Java 对象字段生命周期 / 组件位置、类型、key 的状态保留 | 改 P001 草稿后取消，再开 P002 看到库存 0；提交才改业务数据；列表/统计同步 |
| 14 | C27 useReducer 与 Context | 增加 `inventory-reducer.js`、`InventoryProvider.jsx`，收拢增删改 action | Java 命令分发/纯函数经验 / reducer action；Context 的订阅边界 | reducer 不改输入；未知 action 有明确策略和测试；跨层只共享必要数据，UI 草稿仍本地 |
| 14 | C28 useRef 与外部系统 | 在 StockActions 和 ProductEditor 增加聚焦、取消句柄与取消操作 | Java 可变句柄 / ref；ref 与 state 并列区分 | 保存后焦点正确；取消盘点后不再补货；ref 改动不作为 UI 渲染依据 |
| 15 | C29 useEffect 深入与清理 | 新增 `useInventoryShortcuts.js`，为当前库存页同步标题/键盘监听，补 setup/cleanup | Java 订阅/取消订阅 / Effect 生命周期；非构造器类比 | 挂载/切换/卸载后监听数量正确；StrictMode 开发检查下只执行一次业务动作；派生汇总不靠 Effect |
| 15 | C30 请求状态与竞态调试 | 新增 ProductDetail 与 `src/services/product-api.js`，完成手工详情请求状态机 | Java Future 取消经验 / AbortSignal 与过期响应守卫 | P001 慢→P002 快最终只显示 P002；卸载不回写；404/取消/失败/loading 状态准确 |
| 16 | C31 自定义 Hooks 与路由 | 提取 `useProductRequest.js`、本地快照 Hook，App 增加列表/详情 hash 路由与 URL 筛选 | Java 复用函数/实例 / Hook 复用逻辑；路径参数 / 浏览器 URL | 分享并刷新 P004 详情可用；不存在 ID 显示不存在；两个 Hook 实例状态独立；本地改动可恢复 |
| 16 | C32 认识 TanStack Query 与服务端状态 | 增加 query-options 与浏览器 mock repository，替换详情手工请求；一次明确数据归属迁移 | Java Map 缓存经验 / queryKey、失效与生命周期；不等同 HashMap | P001/P002 缓存隔离；修改后对应查询更新；默认重试策略可解释；持久化只由 repository 写 |
| 17 | C33 现代 React 19 与更新速查 | 在编辑/补货流程加入异步 Action、提交中与乐观反馈，保留失败回滚 | Java try/finally 的提交流程 / Action 状态；无一一对应 API | 防重复提交；成功更新、失败回滚且保留草稿；useActionState 参数正确；新 API 分级而非全量强制 |
| 17 | C34 性能、加载与错误诊断 | 用 Profiler 测库存筛选；按需加载 ReportPanel，增加局部错误边界 | Java 缓存经验 / useMemo 依赖；任务优先级 / transition 的边界 | 测量后再选优化；补货后统计不旧；区分 lazy fallback、请求状态与渲染错误，不能用 memo 掩盖逻辑 bug |
| 18 | C35 React UT、集成测试与 E2E 地图 | 在 `tests/react/` 补表单校验、创建、失败重试；在 tests/e2e 保留一条跨页冒烟 | JUnit / Vitest；UI 用户行为 / RTL；浏览器流程 / Playwright | 用角色/label 断言；await 用户操作和异步 UI；空库存 bug 真能被抓住；解释 Jest 定位，不再写第二套测试 |
| 18 | C36 React 项目复盘与故障排查 | 在当前应用定位派生统计、请求身份、存储边界三个故障，记录 notes/react-review.md | Java 分层排错经验 / Console→Components→Network→Profiler | 每个故障有证据/修复/复现结果；本地库存快照恢复、详情与统计一致；L3 和第三周验收 |

写作边界：C23、C29、C30 保留难点深度，以同一用户操作展示错误/正确及时间顺序。C24–C27 明确 state 放哪里、什么不用存。C31 先手写再抽 Hook，C32 再引缓存；不要一次引三种抽象。C33 的 RSC/Server Functions、use 的缓存前提放边界说明或选修，Pages 不运行服务端代码。C34 的 Compiler 与新版本索引仅作入口，版本/API 状态重新核查。

## Lab 4 组件库与 UI5 适配

| 日 | 课号与标题 | 本课主任务与文件 | Java / JS 并排主题 | 完成标准 |
| --- | --- | --- | --- | --- |
| 19 | C37 组件生态与选择标准 | 写 notes/components.md 的界面契约，并在 adapters/antd/select-product.js 按 id 连接排序后的商品 | Java 接口/适配经验 / UI 组件契约；库与业务数据分离 | 按可访问性、主题、维护、许可选型；比较整库/primitives/代码分发；同一个商品 id 贯穿排序与编辑 |
| 19 | C38 一个普通组件库的完整案例 | 在 `adapters/antd/` 替换列表与弹窗，调用同一 core/repository | Java Bean 初值经验 / Form initialValues 与受控更新边界 | 按库存排序后编辑 P002 仍是它；取消 P001 草稿不残留；校验、空/错态、主题与焦点可用 |
| 20 | C39 SAP Fiori 与 UI5 家族 | 写 notes/ui5-choice.md，对同一库存需求选择经典 UI5 或 Web Components；阅读现有 D2 | Java MVC 经验 / UI5 View/Controller/Model；Fiori 不等于框架 | 分清 SAPUI5、OpenUI5、原生 UI5 Web Components 和 React 包装库；说明静态 mock 的边界 |
| 20 | C40 OpenUI5 入门：MVC 与工程 | 在 `adapters/openui5/webapp/` 配 Component、manifest、XML View、Controller，接共享规则桥接 | Java 包/类路径 / UI5 namespace、模块与资源路径 | 列表加载 6 件；Console/Network 定位模块名错误；UI5 CLI 构建能生成静态产物；不手抄第二份业务规则 |
| 21 | C41 UI5 Model、绑定与业务控件 | 在 Inventory.view/controller、编辑 Fragment 和 i18n 中完成筛选、草稿、保存 | Java Bean/监听经验 / JSONModel.setProperty 与绑定通知 | 筛选 P004 后只改它；取消不污染源数据；汇总与语言切换正确；理解 model 名称、路径与 binding context |
| 21 | C42 UI5 路由与 OData 起点 | 增加 Detail View/Controller、manifest 路由、静态 metadata 和有限 V2 mock | Java DTO/Repository 经验 / OData 实体集、元数据、模型请求；不是接口等价 | P004 详情刷新/回退正常；有限过滤/排序/分页可观察；JSONModel/ODataModel、V2/V4 区分清楚 |
| 22 | C43 UI5 Web Components 原生使用 | 在 `adapters/web-components/` 沿用原生列表/筛选，替换小编辑表单的输入/按钮，监听真实事件 | Java listener 经验 / CustomEvent；字段值 / attribute 与 property | P004 草稿取消保留3，保存8仅改它；空白拒绝、0合法；布尔属性、slots、主题/i18n资源正确；理解 Shadow DOM 与 React 原生支持 |
| 22 | C44 UI5 Web Components for React | 在 `adapters/ui5-react/` 改列表和编辑表单，接共享规则/repository | Java adapter 经验 / React 包装 API；继续对照原生组件与经典 UI5 | 原生 form 提交链正确；事件取值/数字转换正确；P004 编辑场景通过；L4 验收，不再重写所有 CRUD |

写作边界：C37 不做市场排名，不安装全部候选库；C38 只完整用 Ant Design，其余短对照。C39 的运行接到 C40，模块桥接复用已验证原型。C42 仅有限 V2 浏览器 mock，不做真实 SAP 鉴权、完整 OData CRUD 或 V4 服务。C43/C44 按版本核对事件、属性、主题和资源。四种界面共同场景以 Lab 设计为准，不各写一套完整 CRUD。

## Lab 5 调试与静态交付

| 日 | 课号与标题 | 本课主任务与文件 | Java / JS 并排主题 | 完成标准 |
| --- | --- | --- | --- | --- |
| 23 | C45 全链路 Debug 与交付前检查 | 在当前 src/react 应用依次复现状态/资源/存储/布局问题，写 notes/debug.md | Java 堆栈/调试经验 / 浏览器跨层证据与 source maps | 每个修复可复现并回归；做键盘/手机检查；Performance/Memory 有前后证据，不凭一张快照断言泄漏 |
| 23 | C46 静态构建与 GitHub Pages | 修改构建 base、严格静态预览和交付说明；学习个人 Pages 流程 | Java 打包部署经验 / Node 构建与浏览器运行的边界 | `/js_web/` 及演示嵌套路径资源无 404；深层/hash 刷新可用；无开发服务器 fallback 掩盖错误，无服务端 API 假设 |
| 24 | C47 综合项目与测试选择 | 写 notes/test-plan.md，给目前项目补 3–5 条风险驱动回归 | JUnit 分层经验 / Vitest、RTL、Playwright 各自边界 | 至少覆盖非法快照保护、连续交互、请求失败恢复；不用快照数量充当覆盖；完成恢复与键盘验收 |
| 24 | C48 总复盘与后续路线 | 在 notes/final-review.md 记录十题自测、现场增量、排错记录和下一阶段 | Java/JS 本次最易错的对照回看；不新增业务框架 | 不看答案给当前应用加一条筛选并解释测试；现场定位一个已学故障；能说清语言→UI→工具→交付；L5/最终验收 |

## 不压缩掉的机制与参考页

每章保持主张→代码→输出→原因→一句 Java 对照。短机制代码留在页内；可选深入实验有明确入口，默认必做任务不离开工作区。原有四张速查页随迁移更新：ES 版本、Java ↔ JS、React Hooks、UI5 家族。

| 领域 | 必修机制 | 深入边界 |
| --- | --- | --- |
| 语言 | 原始值/对象、动态类型、null/undefined、truthy、比较、Number/BigInt、闭包、this/原型、异常、ESM/CommonJS | 新特性逐项分标准/提案/支持；规范仅延伸阅读 |
| 数据 | Array/Object/Map/Set、WeakMap/WeakSet、迭代、栈/队列/树、复杂度与 JSON | 图/链表模型短讲；完整图算法、二进制结构选修 |
| 浏览器 | HTML 语义、DOM/事件、XSS 的 textContent/innerHTML 差异、CSS/响应式、HTTP、请求、存储 | CORS 讲现象/原因；不通过关闭安全策略解决；不写完整后端 |
| 工具 | Node 的 fs/path/process/inspect、Buffer/stream 概览；npm/锁；Yarn/pnpm/Bun；Vite/UT | 运行时/包管理分开；网站 npm 锁不混用 |
| React | 16 课原有核心深度，含状态快照、身份、Effect、竞态、路由、缓存与测试 | Compiler/RSC/新 API 有入口但不挤占核心任务 |
| UI5 | 四个名称、经典 MVC/绑定/路由、有限 OData mock、原生组件、React 包装 | 共享业务规则，分别学习运行机制；真实 SAP 后端选修 |

## 选修与慢速版

8 周路线按课号一天一课；不是增加必做课。X01 CSS/可访问性深化，X02 TypeScript，X03 Generator/Proxy/TypedArray/GC，X04 高级数据结构，X05 Node HTTP/流/worker，X06 包发布/workspaces，X07 React 复杂表单与状态库，X08 Compiler/新 API/RSC，X09 OData CRUD/V4/CAP/BTP，X10 Jest 迁移/MSW/Playwright 进阶。用户指定后另开任务，不在本次改版顺手扩写。

## 周验收衔接

C12：L1 完整＋L2 事件/异步已接上，固定统计仍可复现。C24：L2 完整＋React 列表状态。C36：L3 完整。C48：L4/L5 完整与最终交付。Lab 收尾点 C10/C20/C36/C44/C48 与周检查点不是同一概念，不要额外增加一套重复作业。
