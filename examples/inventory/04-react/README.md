# 库存项目 · 阶段 4：React

当前参考状态：C45 完成。InventoryProvider 用纯 reducer 保存商品，通过 Context 连接目录、统计与编辑区；URL 保存筛选，Page 保存 editingId，ProductForm 保存草稿与错误，按商品 key 切换时重置。支持新增、补货、删除、编辑与键盘操作；InventoryCounter 支持取消和替换延时记录，Effect 同步标签页标题与搜索快捷键。C31 接入 hash 路由、请求 Hook 与本机备注；C32/C33 给详情加入 Query 缓存、可写 mock 与 Action，列表仍是本地 reducer 数据。C34 加入按需加载的分类报表与局部错误边界；C35 加入 RTL/user-event 行为测试和 Playwright 跨页冒烟；C36 增加本地商品快照、恢复提示、本地详情和综合故障实验。

## 运行

需要 Node 24、npm 11。在本目录执行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

打开终端给出的地址，通常是 `http://127.0.0.1:5173/js_web/`。预期：盘点计数从 0 开始；共 6 种商品，库存依次为 12、0、7、3、25、5；P002 显示已售罄、¥129.00，P001 显示 ¥399.00。先安排两秒后记录三次，再立即记录三次与一次，计数先为 4，随后为 7；刷新归零。

其他命令也在本目录执行：

| 命令 | 作用与结果 |
| --- | --- |
| npm run inspect | 不使用 JSX，在 Node 中观察 React 元素的 type、props 和 DOM 方法缺失 |
| npm test | 卡片、状态、表单、请求、Action 与报表等回归，195 条通过；不包含故意失败的 labs |
| npm run lint | 应用与正确的 Effect 实验通过两条 Hooks 规则检查 |
| npm run build | 应用首页构建到本目录 dist，包含 source maps |
| npm run preview -- --host 127.0.0.1 | 读取已有 dist，通常为 http://127.0.0.1:4173/js_web/ |
| npm run test:bug -- labs/props.test.jsx | C22 传错商品的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/tags.test.jsx | C22 孤立 0 的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/name.test.jsx | C21 JSX 文字错误的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/state-bugs.test.jsx | C23 连续/延时补货的两项回归，原始版本失败；参数累加后通过 |

## 文件与边界

- index.html → src/main.jsx → HashRouter → App → QueryClientProvider → InventoryProvider → Routes → InventoryLayout / Outlet → 列表 InventoryPage 或 ProductDetailRoute / NotFound。列表继续用 InventorySummary / InventoryCatalog → ProductList → ProductCard。编辑区作为 Catalog 的 children，独立于筛选列表；StrictMode 保留。
- src/InventoryContext.jsx 从 `../../../shared/products.js` 复制固定起点，products-reducer.js 统一更新业务数据；ProductCard 只读 product prop，标题 id 按商品编号区分。
- InventoryCounter 的 count 是独立 UI 状态，不修改商品库存；两个实例各自记数。按钮分别记录一次、连续三次、安排延时与取消；新安排替换上一条延时记录，卸载时清除任务。
- vite.config.js 使用 /js_web/ 基础路径，开发服务允许读取 examples 内的共享模块；本阶段的锁与网站根锁独立。
- 普通 CSS 保留盒模型与移动端空间；React 组件描述结构，浏览器继续负责布局。
- npm run build 的正常入口只有首页。labs 的 HTML 是本地 dev 实验页，不进入生产构建。
- 本阶段产物未部署到课程 Pages；网站发布的是静态教程正文。

## JSX 实验

使用 dev 服务，打开下表路径；端口以终端输出为准。

| 地址（在 /js_web/ 后） | 起点与预期 |
| --- | --- |
| labs/jsx.html | Expressions 与 StylePreview：P002 为 0 件，两个 title 不同，动态 style |
| labs/jsx.html?case=name | ProductCardBroken：文字 product.name、title 机械键盘；修复后两处都是机械键盘 |
| labs/jsx.html?case=return | ReturnBroken：只见实验标题，组件返回 undefined |
| labs/jsx.html?case=answer | ReturnFixed：用括号保留返回表达式，显示机械键盘 |

错误起点保留在仓库，练习后可自行恢复。验证细节见 [examples/c21](../../c21/README.md)。

## Props 与渲染实验（C22）

| 地址（在 /js_web/ 后） | 起点与预期 |
| --- | --- |
| labs/props.html | count=0、链接 children、P001/P002 各自内容 |
| labs/props.html?case=empty | 自定义空提示，无卡片 |
| labs/props.html?case=wrong | 六张 P001；修复 ProductListBroken 后各自显示商品 |
| labs/props.html?case=zero | 空标签显示孤立 0；修复 TagsBroken 后隐藏 |
| labs/render-commit.html | 两个根外按钮触发 render；备注文字和输入节点在标题变化后保留 |

渲染实验用 root.render 显式触发相同/不同输入，项目交互随后使用 state。正常 tests 使用静态输出验证内容与只读输入，浏览器步骤验证 DOM 保留。详细记录见 [examples/c22](../../c22/README.md)。

## 状态与更新实验（C23）

打开 labs/state.html?case= 后接 basic、snapshot、queue、queue-answer、delay、delay-answer、mixed、rules 或 independent。每次重新预测先刷新，补货起点统一为 P001 的 12 件。

queue 和 delay 保留错误起点；对应 answer 提供正确结果。snapshot 的旧日志是有意保留的点击时快照。完整地址、操作与结果见 [examples/c23](../../c23/README.md)。

tests/state.test.jsx 使用 happy-dom 和 React act 检查真实组件事件；辅助文件在每个用例结束后卸载根、清理定时器并恢复时钟。它不替代 Chrome 对页面与断点的验证。RTL 的系统用法留到测试课。

## 数组、key 与派生数据（C24）

- src/product-state.js 提供 restockProduct、removeProduct、addSampleProduct 与 selectProducts；返回新数组和被修改的新记录，未变商品共享只读引用。
- App 的 products/query/category/order 是来源状态；visibleProducts/totalStock/totalCents 在渲染时计算。ProductCard 上报 id，App 使用待处理数组更新，ProductList 用 product.id 作 key。
- 新增默认「新商品 / 配件 / 0 件 / 0 分 / 空标签」，从当前最大编号加一。到 P999 禁用新增，删除末尾可复用编号；不承担后端长期编号职责。补货上限 99999，所有改动刷新后恢复。
- 浏览器验收：搜索鼠标后补 1 件为 53 件、26477.00 元；切外设，删除 P001 后为 41 件、21689.00 元。清空条件再新增两次，P007/P008 出现，共 7 种，总库存与价值不变。
- labs/arrays.html?case= 后接 mutation / mutation-answer、keys / keys-answer、derived / derived-answer，对比同引用跳过、索引 key 草稿错位与重复 state 过期。
- labs/arrays-bugs.test.jsx 三项预期失败，修复三个对应 Broken 文件后原命令通过：`npm run test:bug -- labs/arrays-bugs.test.jsx`。仓库保留教学错误起点，正常 tests/arrays.test.jsx 验证正确行为。
- 课程练习「仅看售罄」的修改是可选跟做，不在默认首页中。运行与第二周验收细节见 [examples/c24](../../c24/README.md)。

## 表单、校验与可访问性（C25）

- src/ProductForm.jsx 保存独立字符串草稿和错误；src/product-form.js 提供库存/价格解析、精确单价格式化与 validateDraft。名称 trim 后为 1–40 字符，分类限四种，库存 0–99999 整数，价格最多两位小数并转非负安全整数分。
- 表单采用 noValidate 与统一业务校验，字段保留 required，库存仍有 min/max/step；独立 NativeForm 实验演示原生阻止提交的时机。
- 点击编辑挂载表单并聚焦名称；输入不改变商品。保存经 App 的回调按 id 替换记录，关闭表单，成功区域保留提示，焦点移到持续存在的页面标题。取消不保存，焦点回编辑按钮；当前 C26 入口在统一编辑区。
- 热销 checkbox 只管理热销标签，保留新品等其他标签。保存后筛选/排序/统计立即重算；若改名或分类使商品移出筛选，成功提示与标题焦点仍保留。
- C25 的卡片内独立展开已在 C26 替换为单一编辑区，当前筛选与切换策略见下文。当前改动不持久化，刷新恢复初始值。
- labs/forms.html?case=controlled / locked / uncontrolled / native / blank / blank-answer 提供六个实验。两项故意失败的回归使用 npm run test:bug -- labs/forms-bugs.test.jsx，按正文修复两个 Broken 文件后通过。
- tests/forms.test.jsx 包含 22 条回归，与既有用例合计 42 条。浏览器键盘、原生校验、错误关联与实际结果见 [examples/c25](../../c25/README.md)。

## 状态提升、保留与重置（C26）

- App 保存 editingId，从完整 products 查 editingProduct；ProductList 传递 editing/onEdit，ProductCard 不再拥有编辑开关。ProductForm 是独立于筛选列表的兄弟区域，key=商品 id。
- 选择同一商品、筛选和排序保留草稿；切换商品会丢弃旧草稿并重置错误。保存、取消和删除当前商品都关闭编辑；删除其他商品不影响草稿。编辑期间禁用当前商品补货，避免旧草稿覆盖另一条库存更新。
- 隐藏当前卡片后仍可编辑或保存。取消时若编辑按钮存在则返回按钮，否则聚焦页面标题；保存或删除当前商品后聚焦标题。
- labs/ownership.html?case=local / shared 对比重复库存和共享父节点；switch / switch-answer 对比同位置表单和按商品 key 重置；identity 观察 props、容器类型和移除后的状态。
- 两项教学错误：npm run test:bug -- labs/ownership-bugs.test.jsx，保留错误起点；分别按 SharedStock 与 SwitchProductFixed 的设计修改 Broken 文件后通过。
- tests/ownership.test.jsx 新增 7 条，正常回归累计 49 条。运行和断点记录见 [examples/c26](../../c26/README.md)。

## useReducer 与 Context（C27）

- src/products-reducer.js 处理 sampleAdded/restocked/removed/saved；沿用 product-state.js 的纯更新，保存时检查字段、固定 id、复制标签；未知 type、无效编号和非法保存数据明确抛错，合法但不存在的编号保留数据内容。
- src/InventoryContext.jsx 提供 ProductsContext 与 ProductsDispatchContext；每个 InventoryProvider 实例拥有独立库存。InventoryPage、InventoryCatalog、InventorySummary 使用同一个屏幕级 Provider，展示组件继续接收 props。
- Catalog 管 query/category/order，Page 管 editingId/notice，Form 管 draft/errors；派生值渲染时计算。C26 的切换、取消、保存、删除、焦点和筛选保留策略延续。
- labs/reducer-context.html?case=queue / mutation / mutation-answer / split / split-answer / scope / missing 分别演示 action 队列、旧快照污染、错接 Provider、独立实例与静态默认值；实验页仅 dev 可用。
- npm run test:bug -- labs/reducer-context-bugs.test.jsx 预期两项失败；分别按 MutationReducerFixed 与 ContextJoined 修复两个 Broken 文件后通过。仓库保留错误起点。
- tests/reducer.test.jsx 新增 22 条，tests/context.test.jsx 新增 6 条，正常回归累计 77 条。详细运行和浏览器证据见 [examples/c27](../../c27/README.md)。

## useRef 与外部系统（C28）

- App 的持续标题用 headingRef 取得节点；保存/删除当前商品后回标题，取消优先回列表编辑按钮，筛选隐藏按钮时回标题。
- ProductForm 用 nameRef 与挂载 Effect 聚焦名称，按商品 key 重建时重新聚焦；修改草稿不重新聚焦，首次错误仍由 form.elements 定位。
- InventoryCounter 用 timerRef 保存当前句柄，pending state 显示等待信息；重复安排替换上一条，取消保留已有次数，到期加三，卸载清除未完成任务。各实例独立，句柄不参与渲染。
- labs/refs.html?case= 后接 probe / count / count-answer / focus / early / early-answer / timer / timer-answer，分别观察跨渲染保留、ref 显示错误、提交焦点、条件挂载焦点与取消句柄；timer-answer 可隐藏再挂载。
- npm run test:bug -- labs/refs-bugs.test.jsx 两项预期失败；按 RefCountFixed 与 InventoryCounter 修复两个 Broken 文件后通过。仓库保留错误起点。
- tests/refs.test.jsx 新增 9 条，正常回归累计 86 条；含 ref/局部变量、可见计数、两种焦点时机、跨渲染取消、替换时序、实例隔离和卸载清理。运行证据见 [examples/c28](../../c28/README.md)。

## useEffect 深入与清理（C29）

- InventoryTitle 依赖全部商品的 totalStock，同步 document.title；每次 cleanup 恢复接管前的标题，整个应用移除后恢复原页面标题。当前页面只使用这一个标题管理组件。
- Catalog 的 searchRef 传给 InventorySearchShortcut；全局 keydown 的 / 聚焦搜索。编辑控件、contenteditable、修饰键、合成输入、已处理事件保持原行为；移除时注销同一函数，ref prop 更换时重新同步。
- 本阶段新增独立开发依赖 eslint 与 eslint-plugin-react-hooks，并锁入本阶段 package-lock；两条规则只检查 Hook 调用位置和依赖读取，不将未启用的规则说成已通过。根工程不增加依赖。
- labs/effects.html?case= 后接 lifecycle / missing / stale / guard / interval / interval-answer / loop / loop-answer，分别观察正确生命周期、缺清理、旧闭包、ref 阻止重启、计时器快照和派生值循环。loop 加停止条件，由实验边界显示错误，避免持续更新；实验页仅 dev 提供。
- npm run lint:bug 预期报两项缺依赖；npm run test:bug -- labs/effects-bugs.test.jsx 预期四项失败。两个通知组件按 ProductWatch、计时器按 IntervalFixed、筛选按 LoopFixed 修复后，两项命令都通过；仓库保留错误起点。
- tests/effects.test.jsx 新增 11 条，正常回归累计 97 条；覆盖清理顺序、无关重渲染、卸载/重挂载、interval、派生值、标题更新/恢复、快捷键单次处理/编辑保留/注销。运行证据见 [examples/c29](../../c29/README.md)。

## 请求状态与竞态（C30）

- src/InventoryDetails.jsx 选择六件初始商品；ProductDetails 手工管理 idle/loading/success/error/cancelled、取消和重试。每次 Effect 独立的 ignore 保护所有异步更新，cleanup 先失效再 abort；清空选择恢复 idle。
- src/product-api.js 使用 BASE_URL 和 Accept: application/json 请求 public/data/products 下的固定 JSON；read-product.js 检查 HTTP、JSON 与字段。详情是发布时初始快照，本地 reducer 的补货、删除和编辑不会被请求覆盖，也不会写回静态文件。
- labs/requests.html?case= 后接 race / abort-only / answer / finally / finally-answer / http / invalid / network。固定延时位于 fetch 后续处理，Network 的传输耗时与 Console 的处理时间分别观察；network 模式只使用真实传输。
- npm run test:bug -- labs/requests-bugs.test.jsx 预期三项失败。按 ProductDetails 的完整设计修复三个 Broken 默认导出后，三项通过；仓库保留错误起点。FinallyFixed 仅用于正常文件的 finally 时序对照，完整失败处理见 ProductDetails。
- tests/requests.test.jsx 新增 13 条，正常回归累计 110 条。开发、生产、慢网/断网与暂停帧记录见 [examples/c30](../../c30/README.md)。

## 自定义 Hooks 与路由（C31）

- src/useProductRequest.js 原样接过 C30 的请求状态、清理、取消与重试，ProductDetails 只连接 Hook 和 RequestView；多个调用各自拥有状态，不自动去重或缓存。
- main.jsx 的 HashRouter 包住 App；App 的 InventoryProvider 在 Routes 上方，InventoryLayout 通过 Outlet 放置列表/详情/不存在页。首页重定向 #/products，详情为 #/products/:productId；六个固定编号以外显示没有初始快照，未知路径显示不存在页，不向静态数据发请求。
- URL 参数 q/category/order 是筛选的唯一来源；useCatalogFilters 每次复制参数再 replace，不新增打字历史。卡片和详情的返回 Link 传递 search；全部商品导航清空筛选。标题焦点在页面进入/详情参数变化时安排。
- 进入详情卸载列表页，会丢弃编辑草稿与盘点次数；Provider 保留已补货/保存的库存，回列表从 URL 恢复筛选。刷新/新标签重建库存为固定起点，详情始终读取初始静态快照。
- src/useLocalStorage.js 专门保存 string，以 JSON 字符串存储；key 固定于组件生命周期，改变 key 时应 key 重挂载。挂载只读，输入事件写入；损坏记录显示默认值和提示，成功输入后修复，权限/容量失败保留页面文本并提示。没有跨实例/跨标签同步。
- InventoryNote 使用 js_web:inventory:note:v1，仅持久化备注；商品数据保持刷新恢复行为。labs/hooks.html?case=counters / storage / request / stale 提供四个 dev 实验。
- npm run lint:c31-bug 与 npm run test:bug -- labs/hooks-bugs.test.jsx 对 useStaleRequest 的缺依赖起点预期失败；补上 productId 依赖后通过，仓库保留错误起点。
- tests/hooks.test.jsx 新增 11 条，tests/routes.test.jsx 新增 10 条，共 131 条；原 App 测试统一通过 MemoryRouter 的 TestApp 提供路由上下文。生产构建仍仅首页入口，本阶段未部署到课程 Pages。详细记录见 [examples/c31](../../c31/README.md)。

## 查询缓存与服务端状态（C32）

- App 初始化稳定的 QueryClient，跨路由保存结果；productKey(id) 为 products/detail/id。useProductQuery 传递 signal；CachedProductDetails 负责首次/后台加载、失败旧值、离线暂停与主动重读，旧 ProductDetails 和 useProductRequest 供 C30/C31 labs 对照。
- staleTime 30 秒、gcTime 5 分钟，读取 retry 1、retryDelay 300ms，mutation 不自动重试。成功结果在新鲜期复用，同键进行中请求共用；这些是 QueryClient 缓存，与 HTTP 缓存不同。
- mock-product-service 用静态 GET 与浏览器 Map 模拟来源。详情“模拟远端补货”只改这份副本，刷新恢复；列表的 reducer 库存、草稿、URL 和本机备注不变。真实应用应统一列表/详情的数据源。本阶段没有真实写 API。
- useRestockMutation 成功后精确失效 saved.id 的详情，等待活跃查询读回；保存过程中切换商品仍失效原编号。读回失败保留旧值并显示更新错误，写失败不触发失效。
- labs/query.html 可切快慢响应、失败一次/持续失败、写失败、显示/隐藏详情和双观察者；case=key-bug 保留漏编号的错误起点。query-bugs.test.jsx 原始起点失败，加编号后通过，仓库保留错误起点。
- 正常测试新增 13 条，累计 144 条；CI 安装本阶段锁，执行 lint/test/build 后供网站全量示例使用。运行明细见 [examples/c32](../../c32/README.md)。


## 现代 React 提交与乐观预览（C33）

- ProductDetailRoute 改接 ActionProductDetails，复用 CachedProductDetails 的读取视图与同一 query key。RestockActionForm 使用 useActionState/useOptimistic，RestockSubmit 在 form 内读取 useFormStatus；saveProduct 仍由原 mutation 执行并精确失效 saved.id。query.html 保留 C32 的原始 mutation 按钮。
- restock-action.js 导出操作工厂，校验编号与库存上限，显示预计绝对库存并 await mutateAsync。保存失败结束临时预览；保存成功而读回失败时分别提示，点击“重新读取详情”恢复，不重复补货。预览只在表单区域，读取视图继续显示缓存值。
- labs/actions.html 默认提供保存失败、读回失败、商品切换；case=simple / signature / signature-answer / status / status-answer / ref / element / use 分别演示基础 action、参数错位/修复、上下文归属/修复、ref prop、对象 property 与自定义事件、稳定 Promise 的 use 读取。实验只用于 dev。
- npm run test:bug -- labs/actions-bugs.test.jsx 的两个原始起点先失败；用对应 Fixed 文件修复后通过，仓库保留错误起点。tests/actions.test.jsx 新增 10 条，正常回归共 154 条；包含保存失败恢复、写成功读回失败、等待读回、切换商品、字段边界、签名与状态归属。
- 生产预览的 P002 详情 Action 补货后为 1；列表仍是本地库存 0、总数 52，刷新恢复 mock 与缓存。没有真实写 API、Server Functions 或 RSC 框架。运行记录见 [examples/c33](../../c33/README.md)。

## 性能、加载与错误（C34）

- InventoryPage 在统计后增加 ReportPanel；组件外声明 lazy，首次展开才 import InventoryReport，生产构建生成独立 chunk。普通六件商品继续直接筛选/汇总，不额外加 memo。
- report-summary.js 只派生本地分类统计，InventoryReport 用 caption 与行列表头显示。P002 补货后外设 13 件、4917.00 元，编辑草稿与盘点不因展开/收起而重置。
- ReportErrorBoundary 仅替换报表后代，记录 error 与 componentStack；修正渲染原因后以 key 重建。相同 lazy 的失败结果仍缓存，模块加载失败需恢复网络、确认资源可用后刷新，内存库存与未保存草稿会随刷新丢失。
- labs/performance.html 的 before/memo/after 对照放大列表；transition 调整结果更新优先级；lazy/request/render-error/chunk-error 分开观察代码等待、普通请求与局部异常。实验没有启用 Compiler。
- stale/stale-answer 演示缺依赖；npm run lint:c34-bug 与 npm run test:bug -- labs/performance-bugs.test.jsx 先失败，补完整依赖后通过，仓库保留错误起点。
- tests/performance.test.jsx 新增 9 条，累计 163 条。浏览器测量、生产 chunk、异常与业务验证记录见 [examples/c34](../../c34/README.md)。


## React UT、集成测试与 E2E（C35）

- 阶段独立 devDependencies 加入 RTL、DOM Testing Library、user-event、jest-dom 与 Playwright Test；已有锁时 npm ci，不改网站根锁。
- tests/testing-forms.test.jsx 与 testing-async.test.jsx 新增 8 条行为回归，累计 171 条。真实组件保留，只以加载函数控制外部结果；tests/rtl-support.jsx 显式清理 DOM、QueryClient 与替换资源。
- labs/testing-bugs.test.jsx 是空库存错误起点的 RTL 回归，npm run test:bug -- labs/testing-bugs.test.jsx 原始版本预期失败；按 parseStock/null 判断修复后通过，完整答案 BlankStockFixed。
- 在本目录执行 npx playwright install chromium，再运行 npm run test:e2e：自动构建、在独立 4178 端口预览并用 Chromium 检查筛选→详情→刷新→返回。测试保持 /js_web/ 和 hash；不复用其他正在运行的服务。失败 trace 写入忽略的 test-results。
- 运行证据、练习的先失败后修复和浏览器范围见 [examples/c35](../../c35/README.md)。课程 Pages 仍只发布静态教程。


## 项目复盘与第三周验收（C36）

- inventory-storage.js 定义 js_web:inventory:products:v1 / version=1 快照。初始化只读，字段校验与重复 id 检查失败时复制固定起点并提示；损坏原文保留。无快照时初始参考值仍是 6 种、52 件、26348.00 元。
- InventoryPersistence 的「保存本地快照」写入当前已提交商品；其后修改需再次保存。清除快照保留当前内存商品，刷新回固定起点；写/删失败明确提示。筛选由 URL 保存，草稿/盘点/Query 不写快照，备注独立。
- ProductDetailRoute 上部直接读 ProductsContext，新增 P007 也可查看本地详情，且不请求不存在的静态 JSON；下部六种初始商品仍可做独立 Query/Action mock。C21–C35 各节描述的是当课推进状态，C36 的快照规则以此节为准。
- labs/review.html?case=summary / query / storage 保留三个错误起点；对应 summary-answer / query-answer / storage-answer 提供答案。存储实验仅写 js_web:c36:broken:v1，不改商品快照。
- npm run test:bug -- labs/review-bugs.test.jsx 原始起点三项失败，按正文修好三个 Broken 文件后通过；仓库保留错误起点。正常 tests/review.test.jsx 新增 19 条，共 190 条；生产 E2E 共 2 条，覆盖新增详情、快照恢复与损坏清除。
- Q3 的业务、浏览器、source maps 与全站周验收记录见 [examples/c36](../../c36/README.md)；本阶段产物仍供本地使用，课程 Pages 发布静态正文。


## 全链路 Debug 与交付前检查（C45）

- labs/delivery.html?case=asset / asset-answer 对比域名根与应用 base 的资源路径；request / request-answer 对比数据 404 与正确请求；html-response 演示默认 Accept 下的 Vite HTML 回退。请求视图复用 ProductDetails、readProductResponse 与正常 fetchProduct。
- state / state-answer 复用 C24 的同引用更新故障；overflow / overflow-answer 在 360px 对照最小宽度约束；storage 使用独立 js_web:c45:products:v1，复用库存快照恢复逻辑并保留坏原文。
- memory / memory-answer 用 MemoryProbe 与 stock-probe.js 对比 window 监听器是否在卸载时释放；错误版故意留下引用，每次比较先刷新页面。此实验页不包 StrictMode，以便三轮开启/关闭与三个监听器直接对应；正常应用继续保留 StrictMode。
- tests/delivery.test.jsx 新增 5 条业务回归，正常测试共 195 条；npm run test:e2e:delivery 启动独立 8045 开发服务，以 Chrome 运行 3 条综合浏览器回归。原 npm run test:e2e 仍只检查正常生产应用的两条路径。
- public/media/inventory.svg 是资源路径实验的图标。生产 build 继续只包含首页；生产源码断点、Memory 堆快照、Performance 与键盘检查、排错记录见 [examples/c45](../../c45/README.md)。无新依赖，原应用业务逻辑沿用 C36。
