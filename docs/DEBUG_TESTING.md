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
