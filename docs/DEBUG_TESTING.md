# 前端调试与 UT 学习路线

这是必修内容，贯穿 48 课，不等到项目结束才补。借用 Java IDE 调试与 JUnit 的已有经验，但解释浏览器、异步和 UI 测试的区别。

用户不要求所有例子站内运行。本专题以 **「自己尝试」** 操作任务为主，给出故意带错的代码、复现步骤、观察证据、修复方法与回归验证。

## 调试的通用顺序

1. 固定输入与操作，可靠复现问题。
2. 判断发生在哪层：资源加载、JS 执行、DOM/CSS、网络、React 状态、浏览器存储或构建部署。
3. 收集错误堆栈、断点变量、实际请求或性能记录，建立可验证的假设。
4. 缩小到最小失败案例，修改源文件。
5. 复现原操作验证修复；适合自动化的业务 bug 增加回归测试。

不要把“刷新后好了”“加一条日志”当成已确定根因。调试记录包含复现、证据、根因、修复和验证。

## 浏览器工具：以 Chrome 为基准，补充 Edge 对照

| 工具/面板 | 需要教的能力 | 课程位置与自己尝试 |
| --- | --- | --- |
| Console | 运行表达式；错误/堆栈；日志过滤、console.table；观察对象与快照的区别 | C02/C03/C12：预测输出、检查变量、区分语法错误和运行错误 |
| Sources | 行/条件/异常断点、logpoint；step over/into/out；Scope/Watch/Call Stack；异步堆栈 | C04/C06：观察循环与闭包；找到非法库存输入的路径 |
| Sources 进阶 | 事件监听、DOM、XHR/fetch 断点；source maps 和生产源码映射 | C11/C13/C20/C45：重复事件、请求触发来源、压缩代码定位 |
| Elements/CSS | DOM 树、Computed、盒模型、选择器覆盖、Flex/Grid、临时修改、事件监听 | C02/C11：手机溢出、样式被覆盖、节点被意外移除 |
| Network | Headers/Payload/Response/Initiator/Timing；状态码、缓存、慢网/离线、取消 | C13/C30：资源路径错、HTTP 失败、CORS、JSON 解析错误和竞态 |
| Application | localStorage/sessionStorage、Cookies、存储清理；Cache/Service Worker 了解项 | C14/C45：损坏进度数据、刷新恢复、区分缓存与持久化 |
| Performance | 录制交互、长任务、JS/布局/绘制、主线程热点；分离网络耗时 | C34/C45：先测列表筛选，再修改导致卡顿的工作 |
| Memory | Heap Snapshot、保留引用、脱离 DOM；重复挂载/卸载前后对照 | C29/C45：检查漏清理监听；不能靠单张快照宣布内存泄漏 |

DevTools 的临时修改通常不会自动保存到源文件，课程必须说明。Edge 与 Chrome 操作类似处共用解释，不重复一套课程；界面名称随版本更新，截图与步骤实施时核查。

官方依据：[Chrome DevTools 总览](https://developer.chrome.com/docs/devtools/overview)、[Console](https://developer.chrome.com/docs/devtools/console)、[断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)、[DOM](https://developer.chrome.com/docs/devtools/dom)、[CSS](https://developer.chrome.com/docs/devtools/css)、[Network](https://developer.chrome.com/docs/devtools/network)、[source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps/)、[Application](https://developer.chrome.com/docs/devtools/application)、[Performance](https://developer.chrome.com/docs/devtools/performance)、[Memory](https://developer.chrome.com/docs/devtools/memory)、[Edge 总览](https://learn.microsoft.com/en-us/microsoft-edge/devtools/overview)。

## React 与 Node 调试

**React DevTools Components**：查看组件树、props/state/hooks，先判断值是否正确传到目标组件，再判断 UI 如何产生。C22 起使用，C23–C30 每个故障题都有对应观察点。

**Profiler**：检查提交与渲染耗时，先获得测量证据，再考虑 memo/useMemo/useCallback。说明开发模式、StrictMode 与生产表现的差异；不要把开发额外检查解释成生产必然重复执行。[React DevTools](https://react.dev/learn/react-developer-tools)、[Profiler](https://react.dev/reference/react/Profiler)。

**Node**：C17 教 `node --inspect` / `node --inspect-brk`，连接 Chrome/Edge inspect 页或 VS Code；断点观察文件路径、异步堆栈、模块作用域。示例使用默认本地监听，不需要外网调试服务。[Node 调试](https://nodejs.org/learn/getting-started/debugging)。

**编辑器**：介绍源码断点、调试配置、source maps、异常中断与终端测试；教学以任务为中心，不要求安装大量插件。

## 测试层级与工具角色

UT 即 Unit Test（单元测试）。先确定要验证的边界，再选工具；使用哪个框架不自动决定测试层级。

| 层级 | 例子 | 推荐工具与理由 |
| --- | --- | --- |
| 单元测试 | 价格转换、库存统计、数据校验、reducer 状态转换 | Vitest：在本课程 Vite 工程中运行 JS/TS 用例 |
| 组件/集成测试 | 填写表单、校验失败、提交成功、请求失败重试 | Vitest + React Testing Library + user-event：观察组件协作和用户能看到的结果 |
| 端到端测试 | 真实浏览器打开站点、导航、填写、刷新恢复 | Playwright：少量关键流程，用浏览器执行并支持故障追踪 |
| 手工检查 | 阅读、视觉、键盘、手机、图与复杂性能判断 | DevTools 与人工审阅；不强行把所有判断写成测试 |

| 工具 | 它是什么 | 本课程深度 |
| --- | --- | --- |
| Vitest | 测试运行器、断言、mock、覆盖率等工具 | UT 主线：实际编写和修复用例 |
| Jest | 同类测试框架，已有项目中常见 | 理解基础用法及与 Vitest 的环境/config/mock 差异；不维护两套重复测试 |
| React Testing Library | 渲染/查询 React 界面的辅助工具 | 组件行为测试主线；搭配运行器使用 |
| user-event | 模拟用户点击、输入、键盘等交互 | 与 RTL 配合，异步操作正确等待 |
| Playwright | 浏览器自动化与测试工具 | E2E 起步、自动等待、定位器和 trace；高级矩阵选修 |
| Node 内建 node:test | Node 自带测试运行器 | Node 选修认识；与 Vitest 不重复教学整套 API |

官方依据：[Vitest](https://vitest.dev/guide/)、[Jest](https://jestjs.io/docs/getting-started)、[RTL](https://testing-library.com/docs/react-testing-library/intro/)、[user-event](https://testing-library.com/docs/user-event/intro/)、[Playwright](https://playwright.dev/docs/intro)、[Node test runner](https://nodejs.org/api/test.html)。实施时核对版本和 Node/Vite 兼容性。

## UT 必须教到的内容

C20 从一个库存函数开始：

1. describe/it 或 test/expect 的职责，Arrange/Act/Assert。
2. 正常输入、空集合、边界、非法值、异常与 Promise 成功/失败。
3. 参数化用例，避免复制相同测试体。
4. 失败信息、堆栈、watch 模式、最小失败用例；先红后绿。
5. 隔离依赖的必要性；mock/spy 不替代真实业务逻辑。
6. 不依赖当前日期、随机值或不稳定网络；必要时注入可控值。

对照 Java/JUnit：测试命名、生命周期和断言可以类比；浏览器 DOM 环境、模块 mock 和异步等待需要新解释。

C27 测 reducer：把状态转换作为纯函数验证，而非通过点击覆盖所有分支。

## React Testing Library 必须教到的内容

C35 用商品表单与请求页面示范：

- 优先 `getByRole(..., { name })` 和 label，测试可访问的用户界面。
- 同步存在用 getBy，不存在用 queryBy，异步出现用 findBy；理解查询失败信息。
- `userEvent.setup()` 后正确 `await` 点击/输入操作。
- 测创建商品、校验阻止提交、加载/空/失败态和失败后重试。
- 请求 mock、fake timers 的使用边界；测试后恢复 mock、real timers、DOM 和外部监听。
- 用条件等待，不写固定 sleep 来掩盖竞态。
- jsdom 不是真实布局引擎；尺寸、真实导航/资源等用浏览器检查。
- 快照可用于合适的小范围结果，不能替代行为断言。

依据：[查询](https://testing-library.com/docs/queries/about/)、[异步工具](https://testing-library.com/docs/dom-testing-library/api-async/)、[RTL API/cleanup](https://testing-library.com/docs/react-testing-library/api/)、[Vitest mocking](https://vitest.dev/guide/mocking.html)。

## Playwright 入门与综合验收

C46/C47 给一条完整流程即可：打开部署子路径 → 导航课程或练习 → 操作表单/进度 → 刷新 → 检查结果。

教稳定 locator、自动等待、用户可见结果和 trace 定位失败；不靠长 sleep，也不重复 UT 已覆盖的全部数据分支。[Playwright 最佳实践](https://playwright.dev/docs/best-practices)。

## 自己尝试任务清单

| 任务 | 操作与预期结果 | 对应课程 |
| --- | --- | --- |
| D01 错误价格 | 条件断点停在非法价格，修复转换并解释堆栈 | C03/C04 |
| D02 闭包捕获 | Scope 观察旧变量，修复计数器行为 | C06 |
| D03 重复事件 | 事件断点找到重复绑定，修复后只触发一次 | C11 |
| D04 请求失败 | 慢网/离线/错误 URL，区分失败层次并正确显示错误 | C13 |
| D05 存储损坏 | 手动修改 localStorage，页面可恢复 | C14 |
| D06 第一条 UT | 让库存统计测试失败，修复后通过，说明断言价值 | C20 |
| D07 旧状态与 Effect | Components/日志确认快照与清理行为，修复而不禁用检查 | C23/C29 |
| D08 组件行为测试 | 用角色定位、输入、提交、错误重试，不读取内部 state | C35 |
| D09 生产问题 | 从 404/构建代码回到源码，写完整故障记录 | C45 |
| D10 交付回归 | 少量 UT/集成/E2E 与手工检查共同覆盖关键风险 | C47 |

本专题的完成标准是能解释定位证据、选择合适的测试层级、写出有价值的回归用例。无需为了“测试完整”给每段教程示例写一套测试。

<a id="revision-v2-errors"></a>

## V2 逐章错误与改版回归矩阵

2026-10-29 · 下表保留每章主错误与回归风险，按 [PLAN](PLAN.md) 的 A/B/C 范围执行，具体 Lab 场景见 [Lab 设计](../labs/README.md)。不是宣称线上 48 课当前都存在这些 bug；已有 L1/L2 记录有效，未改动部分不重新制造全部故障。具体文件见 [CURRICULUM](CURRICULUM.md#revision-v2-curriculum)。

每章正文选一个主要错误深入走完“现象→工具→证据→原因→修复→确认”，表中的边界再进入验收。实现者需把错误入口、正确入口、输入、预期输出和实际执行结果写进该课验证 README；不能将本表当作已经运行的证据。

故障练习在学员当前目标文件进行，不默认另开 demo。正文明确指出故意改错的行，先保存有效数据，修复后重复同一操作。C20 前以输出/手工证据为主，检查器可以自动核对但不要求学员提前写 Vitest；C20 起按风险增加单元/组件测试，浏览器行为仍用实际浏览器。检查不得删除学员数据或自动改源码。

### L1 库存规则与数据

| 章 | 可能错误与触发 | 定位工具与证据 | 修复方向与验收 | 改版时防止的回归 |
| --- | --- | --- | --- | --- |
| C01 | 在 Node 里访问 document，或把 npm 当成执行 JS 的语言；运行宿主探测 | Console/终端：document 未定义，而浏览器中有 DOM；查看实际启动命令 | 把浏览器 API 留在界面层；纯库存计算两端结果一致；P001 价值 478800 分 | 初始骨架要求先学 npm/React 才能打印；把 Bun 只归为包管理器；沿用过时标准年份 |
| C02 | app.js 拼成 ap.js，卡片出现但按钮不工作；页面用固定宽度撑破手机 | Network 的脚本请求 404；Elements/Computed 显示超出可用宽度 | 改正确相对路径、流式宽度；刷新有脚本执行，360px 无整页横滚；断点能命中 | 开发服务 fallback 用 HTML 200 掩盖脚本错误；省略 label、语义结构与脚本加载解释 |
| C03 | 输入框的 3 是字符串，12 + "3" 得 123；Number(空白) 得 0；`stock \|\| 12` 把售罄复活 | Sources：amount 的 typeof 为 string，空文本 trim 后为空；观察默认值操作数 | 先非空检查、显式转换、整数与范围校验；12+3=15；空白/3件/负数/小数拒绝；0 保留 | Java parseInt 与 JS parseInt 被说成完全等价；页面、core、参考解三种校验不一致 |
| C04 | 循环写 `i <= products.length`，读取最后一个 undefined 导致异常/NaN；var 覆盖外层变量 | 条件断点停在 i=length；Scope 显示 product 未定义或共享变量 | 改 for-of 或 `< length`；总库存 52、空列表 0；let/const 作用域正确 | 为了防报错每处塞默认值，掩盖真正越界；将 const 写成冻结对象 |
| C05 | `{...product}` 复制后修改 draft.tags，取消也改变原商品；解析成功即信任 JSON | Sources 比较 draft.tags===product.tags 得 true；查看导入字段类型 | 复制被修改的嵌套路径；解析后校验结构；取消不改 tags；坏数据不替换好数据 | 用最终复杂深克隆库掩盖引用教学；把 Java/JS 参数描述成按引用传参 |
| C06 | 用 var 循环创建函数，点击三个操作都读到最后一个值；复用外部计数器导致实例共享 | Scope/Watch：回调捕获同一绑定；分别调用两个工厂 | 用每次迭代的 let 绑定或显式参数；计数器输出 1/2 与独立的 1；筛选工厂不串分类 | 把闭包说成创建时复制值；正文机制实验正确，实际库存入口仍读共享全局变量 |
| C07 | `run(inventory.getById)` 丢失 this，直接调用却正常；箭头方法 this 指向外层 | Sources 看 this 和 Call Stack，普通回调中的 this 为 undefined（ESM/严格模式） | bind 或保留调用接收者；两种调用都查到 P004；能解释箭头函数无自己的 this | 为修回调全改成箭头而不解释；将 Inventory 可变实例直接带入 React state |
| C08 | sort 未传比较器按文本排序；map 的大括号体漏 return；sort 修改源列表 | Console 看结果与原数组顺序；断点见回调得到商品却返回 undefined | 数值比较器与副本排序；数组映射有返回；库存升序为 P002/P004/P006/P003/P001/P005；总值不变 | 只测“列表长度是 6”漏掉顺序/身份；参考解偷偷修改固定数据 |
| C09 | 写 `byId[id]=product`，Map 展开似乎有数据但 size=0；用新对象键查询旧对象 | Console：size=0、has=false、Object.hasOwn=true；两个内容相同键不相等 | 使用 set/get；身份键语义单独对照 Java；P004 查到库存3、去重两标签、重复 ID 拒绝 | 错把 Map 说成按 Java equals 比内容；把弱集合做成可枚举业务索引 |
| C10 | 历史栈保存商品引用，补货后旧值也变了；空队列/空树未处理 | 断点比较 history[0] 与商品的身份，单步观察同时改变 | 存旧字段值或独立快照；连续补货可逆序撤销至12；空栈返回明确结果；三种遍历节点完整 | 撤销又记录一次历史导致来回振荡；用一次时间结果承诺算法快固定倍数 |

### L2 可用的原生库存页

| 章 | 可能错误与触发 | 定位工具与证据 | 修复方向与验收 | 改版时防止的回归 |
| --- | --- | --- | --- | --- |
| C11 | 每次 render 添加监听，第二次点击补两次；按可见索引编辑错商品；innerHTML 插入商品名 | Event Listener Breakpoints 多次命中不同回调；dataset.id 与数组索引不一致；观察生成节点 | 稳定祖先上委托一次，按 id 更新，文本用 textContent；两次各补1；过滤后只改P004；恶意标签只显示文本 | 故障修在示例里，主 app 仍重复绑定；事件委托忽略嵌套点击的 closest 边界 |
| C12 | then 中启动异步却漏 return，下一步先得到 undefined；抛错后 loading 不结束 | Sources/日志显示下一步先执行；Promise 链未包含内层任务 | return 内层 Promise，末端统一错误/收尾；成功6项、失败可见、finally执行；顺序可解释 | 靠长 setTimeout 让假流程“看起来正确”；把 Promise 说成新建线程 |
| C13 | fetch 404 不检查 ok，最后报 JSON 解析错；forEach(async) 后统计先执行 | Network 的404与HTML响应；断点见 response.ok=false；异步项尚未结束 | 先检查HTTP再解析；并发用 Promise.all 等待；取消前次请求；404/空/离线均退出loading | 用公共 API 的偶然可用性验收；把所有错误都显示成“网络差”；越级写完整竞态课程 |
| C14 | 损坏 JSON 导致白屏；保存前未校验，先覆盖好副本再报错 | Application 看原始坏文本；Sources 看 parse/validate/setItem 顺序 | try/catch、结构校验、成功后再替换；保留可恢复备份；拒绝非法导入且旧数据不变 | 检查脚本清空真实localStorage；新存储格式迁移破坏用户学习进度键 |
| C15 | 卡片或长文字 min-width 撑破360px；只删outline让键盘焦点不可见 | Elements→Computed/Flex/Grid，比较 scrollWidth 与视口；Tab检查 | minmax/min-width/换行与盒模型按来源修复；360/768/1280布局正常，焦点清楚 | 只隐藏overflow遮住内容；并排代码加入后整页横滚；亮暗主题对比不足 |
| C16 | 未设 module、命名/默认导出混用、路径漏扩展名；循环引用初始化过早 | Console首个语法/导出错误；Network真实URL；依赖链与初始化位置 | 明确ESM入口和导入名；按单向依赖拆模块；重构前后同一业务向量通过 | 一次拆分同时改业务行为导致难定位；生成器引用最终路径，早期快照无法运行 |
| C17 | fs按process.cwd找文件，从别的目录启动失败；浏览器代码打入fs | Node inspect 看cwd、import.meta.url和目标路径；ENOENT堆栈 | 按模块URL定位固定数据；隔离宿主适配；不同cwd得到6/52/2634800 | 只在作者目录成功；report偷偷读参考解而不是学员模块；输出混入环境路径无法固定核对 |
| C18 | 清单版本与锁不一致，npm ci失败；随手改主锁或误把npm ci当升级命令 | 隔离副本的npm错误；对照清单与锁；git diff确认修改范围 | 在隔离副本解释install/ci的不同；主工程可复现安装；两个scripts可用 | 让教学故障破坏站点根package-lock；使用未提供锁文件的起点却要求npm ci |
| C19 | 依赖未声明，靠某种安装布局偶然可用；把Bun运行成功等同所有Node API兼容 | 读package.json及解析路径；两工具隔离运行同一报告并记录差异 | 显式依赖、分别核验运行时API；至少两工具得到相同业务值；锁只留在隔离目录 | 静默重写主锁；把Corepack当固定内置事实；为了比较装遍所有工具而拖慢主线 |
| C20 | 只测正常值让空白库存被当0；Vite构建通过就以为类型检查也通过 | Vitest边界断言先失败；独立类型检查显示与构建不同结果；source map断点 | 写正常/空/非法用例，修业务边界；build与typecheck职责分清；用当前学员文件先红后绿 | test脚本实际上导入教师答案；为满足通过率删失败断言；TS变成先修课 |

### L3 React 库存应用

| 章 | 可能错误与触发 | 定位工具与证据 | 修复方向与验收 | 改版时防止的回归 |
| --- | --- | --- | --- | --- |
| C21 | 组件小写、JSX表达式写错、每次渲染重新createRoot | Console组件/语法信息；Elements与Components对照；检查入口调用次数 | 组件大写、表达式正确、入口建root一次；六商品文字正确 | 用新建脚手架重复覆盖L2；从全功能App开始让JSX课已经依赖Query/Context |
| C22 | 修改props商品或render时写存储，父组件数据被污染；条件表达式渲染多余0 | Components看props变化来源；断点命中render副作用；观察DOM文本 | 纯渲染、事件回调更新；明确条件比较；重渲染不改原数据 | Java普通方法与React生命周期混为一谈；提前引Context绕过props教学 |
| C23 | 三次setStock(stock+1)只加1；延迟回调覆盖中途的补货 | Components与Sources：同一次回调stock一直12，三次都提交13 | 用函数式更新；12→15；延迟+3期间立即+1最终16；当前回调仍读旧快照可解释 | 示例错误/正确没有相同起始值；拿Java可变字段断言React setter应同步改局部变量 |
| C24 | 原地改数组再set同一引用；index key导致排序后草稿错位；派生列表另存state | Components状态身份；输入草稿后排序观察商品id与UI错配 | 不可变更新、业务id作为key、渲染时派生；筛选/统计和库存一致 | 为保证每次重建用随机key丢掉全部状态；只测文本数量未测商品身份 |
| C25 | Number空文本变0；元乘100留下小数误差；错误提示未关联输入 | RTL填空/非法价格；Sources看原始文本；Accessibility/label检查 | 调用core转换、字段错误和焦点；0合法、空白拒绝、合法价格存整数分；键盘完成保存 | UI自己的校验与core分叉；只设input min/required就假设导入数据也安全 |
| C26 | 从props初始化state后切P002仍显示P001草稿；关闭弹窗未重置 | Components：product.id变化而draft仍旧；按取消→换商品复现 | 明确选中id和草稿所有者，按业务切换重建/重置；P002初始0且取消不改源数据 | 不分“关闭再打开同一件”和“切换另一件”；Effect双向同步造成循环与草稿丢失 |
| C27 | reducer修改原state；未知action返回undefined；所有UI草稿进Context | 单元测试冻结/保留before引用并比较；检查Provider值与action分支 | 纯函数返回新值；明确未知action错误；有变化才改业务状态，草稿留局部 | 将用例只写成点击UI而无规则测试；引入Context后形成第二份商品来源 |
| C28 | 用ref保存可见库存，改变后UI不刷新；取消后定时任务仍回写 | Components的state没变；Sources看ref与timer/abort句柄；取消后观察 | 可见数据放state，ref放DOM/句柄；取消后不更新；提交后焦点正确 | 每次render建外部资源；误把ref当“绕过渲染”的通用state替代品 |
| C29 | Effect缺cleanup造成重复快捷键；依赖每次新对象引发循环；闭包用旧值 | setup/cleanup日志、事件断点、React Hooks lint；观察挂载/卸载计数 | 稳定必要依赖、对称清理；一次操作一次业务变化；保留StrictMode | 以禁用StrictMode或忽略lint作为修复；把按钮保存与派生汇总塞入Effect |
| C30 | P001慢响应在P002快响应后覆盖；旧请求finally关掉新loading | Network看静态文件读取；Sources看读取后处理与闭包归属；受控Promise指定完成顺序 | Abort与过期守卫覆盖成功/失败/finally；最终P002，取消不报业务失败，卸载不回写 | 把读取后的人工延时写成HTTP Timing；只mock最终值；固定sleep偶然通过；复用同一个AbortController |
| C31 | 两次调用Hook误以为共享状态；依赖漏id；Pages详情刷新404 | Components看两个实例；URL/Network与Hook入参；严格静态刷新 | Hook复用逻辑不共享实例；参数依赖齐全；hash详情/回退/未知id可用 | 抽Hook同时改变行为而无基准；用dev history fallback冒充Pages支持任意路由 |
| C32 | queryKey不含id，切商品读旧缓存；mutation后未失效；UI与repository双写 | Sources看repository.get读次数及实际queryKey；比较UI/repository值；浏览器mock不发HTTP | key含必要参数、精确失效，repository单一数据源；两ID隔离、编辑后更新 | 以Network无GET代替缓存证据；用数组索引当身份；迁入Query后旧请求Effect仍运行；未控制自动重试 |
| C33 | 把form action单参数函数交给useActionState，formData实际是prevState；失败未回滚 | Sources看参数类型；提交失败后乐观行仍存在 | 正确签名与状态边界；pending防重复、成功提交、失败回滚且保留草稿 | 把浏览器Action写成服务器持久化；未缓存Promise直接交use；未经官方核对批量展示新API |
| C34 | useMemo空依赖留下旧总价；到处memo但卡顿仍在；用Suspense包普通fetch | Profiler定位实际提交；补货后state变而memo值不变；观察加载边界 | 先正确计算再测量，声明依赖；lazy和错误边界各司其职；当前总价随库存变化 | 用固定毫秒阈值验收不同电脑；性能优化吞掉正确性；把渲染错、网络错、加载混成一种 |
| C35 | 测试不await事件/异步；只断言内部state或mock调用，空输入bug仍绿 | 失败堆栈/act警告；RTL角色查询显示真实错误；故意引入业务回归 | await user-event、findBy等条件等待；用户可见行为断言；非法输入和失败重试真的红→绿 | mock了被测校验函数；用timeout掩盖问题；把DOM模拟器当真实布局浏览器 |
| C36 | 商品改为1但汇总仍52；缓存串id；坏快照覆盖有效库存 | 顺序查Components→Network→Application与存储调用次序 | 删除冗余统计state、修缓存身份、校验后持久化；对应三故障重放与回归通过 | 复盘又新开三个demo；只展示最终绿测，不提供原始证据和定位路径 |

### L4 组件库与 UI5 适配

| 章 | 可能错误与触发 | 定位工具与证据 | 修复方向与验收 | 改版时防止的回归 |
| --- | --- | --- | --- | --- |
| C37 | 根据排名选库，忽略表格/弹窗契约；排序后用row.index回查原数组 | 对照需求矩阵；断点显示row.id=P002但取到P001 | 写明输入/输出/维护/许可依据；以id作身份；排序后选中与编辑同一商品 | 将“选型”变成安装六个库；比较缺日期或把付费扩展写成基础功能 |
| C38 | Form initialValues被当成实时值，P001改8取消后P002仍8 | Components中product=P002/0，输入DOM值仍8；检查表单挂载生命周期 | 按编辑会话设置/重置草稿；取消→换商品→保存行为回归；表格rowKey为id | 新增AntD专属规则覆盖共享校验；只测首次打开，不测连续开关 |
| C39 | 把UI5 React当作OpenUI5的React皮肤；认为直接改JSON对象会自动通知绑定 | 家族/导入名对照；读Model更新契约，后续C41在真实adapter验证通知 | 按库与运行机制选路线；说明setProperty/绑定职责；能正确分类四个名称 | 为概览再建必做独立demo；复制旧React自定义事件限制；把Fiori当单一JS包 |
| C40 | namespace/module名不匹配导致404；在sap.ui.define内直接粘ESM | Network找失败模块URL；Console首个解析/加载错误；检查bridge产物 | manifest、命名空间与路径一致；使用已验证的构建桥；六商品加载且静态构建可用 | 共享纯函数变成手工复制的第二份；本地CDN缓存掩盖离线/版本问题 |
| C41 | 筛选后可见第一行指向P004，却按索引0写P001；直接改getData对象UI不更新；取消已污染Model | Sources看binding context `/products/3` 与id；Model值和控件值对照 | 使用context/id和setProperty；草稿单独Model；P004改动只影响它，取消不写入，汇总/i18n正确 | 把XML绑定的模型名/相对路径写错；提前把正式Model双向绑定到可取消草稿 |
| C42 | 用可见索引拼路由；把当前分页子集统计当全量；混用V2/V4接口 | hash参数、binding context、Network查询及metadata命名 | 路由传稳定id、未知id有结果；明确页数据与全量；有限V2读取/过滤/分页可观察 | 声称浏览器mock等于真实SAP服务；部署缺metadata/json；静态站承诺完整OData写服务 |
| C43 | `disabled="false"`仍禁用；拿错事件字段；全局CSS无法穿透Shadow DOM | Elements看属性存在；Console看disabled/property与event.detail；检查shadow树/slots | 按当前属性/事件契约取值；用主题接口；P004草稿取消保留3、保存8只改它，非法输入拒绝 | 漏打包主题/i18n资源；把attribute字符串与property类型混为一谈 |
| C44 | UI5布局Form被当原生form，保存未触发；包装事件沿用AntD签名 | Sources提交断点不命中；Elements没有HTML form祖先；查看实际事件对象 | 建正确原生表单链，按包装API取值/转换；键盘Enter与按钮均保存一次，错误阻止提交 | 把经典UI5绑定语法混入React props；使用废弃组件包；只通过鼠标点击验收 |

### L5 调试与静态交付

| 章 | 可能错误与触发 | 定位工具与证据 | 修复方向与验收 | 改版时防止的回归 |
| --- | --- | --- | --- | --- |
| C45 | 补货改同一state引用所以UI不动；资源404被误当JS错；重挂载保留监听 | Console/Components/Network按层收证；source map映射；Memory前后对照 | 从最早可见错误定位，修引用/路径/清理；原操作复测，写证据与修复；布局/键盘一起检查 | 以清缓存、刷新、加日志当根因；测脚本破坏学员快照；只保存最终截图 |
| C46 | base写 `/`，部署后入口JS404；嵌套演示仍用站点base；hash前路径不存在 | 严格静态预览Network实际请求；dist/index.html引用；直接打开深层地址 | 站点与各演示分别配置真实base；资源、字体、图、下载和刷新可用；构建时Node与运行时浏览器分清 | dev返回index.html掩盖404；Actions成功就宣称上线；发布包漏掉数据与生成规则 |
| C47 | 先setItem再校验导致坏快照替换好数据；大量快照断言遗漏连续输入与重试 | UT保存前后原文比较；RTL与生产浏览器逐字输入；浏览器内repository失败→人工重试 | 校验成功再持久化；3–5条对具体风险有用的测试；拒绝非法值后旧副本逐字不变 | 只增加测试数量；E2E重复全部纯函数分支；假等待让竞态消失 |
| C48 | `[...products]`后改内层对象，旧快照也改变；能运行答案却解释不了修复 | 断点比较数组不同、商品对象相同；现场增加筛选与故障定位 | 复制修改路径、补回归并解释；给同项目增加一项小需求，不看参考解完成 | 用总测试绿替代独立操作；把完成课程/检查通过/理解机制混成一个完成标记 |

## 实施者使用矩阵的验收方式

1. 在 catalog 中把每课主错误绑定到对应工作文件、可控输入和检查项；正文用自然的故障标题，不显示内部故障编号。
2. 先从该课参考起点走到可复现错误，保留具体证据，再修复到完成态。每个自动回归必须能在错误版本上失败、正确版本上通过。
3. “改版回归”列用于代码与内容审查，不照搬进学员正文。特别检查答案串入起点、校验重复、状态多来源、路径错误和覆盖作业。
4. 自动化只覆盖稳定行为；Profiler、Memory、键盘、布局和真实Network需要相应手工/浏览器检查。未执行的环境或Java例子按实标注。
