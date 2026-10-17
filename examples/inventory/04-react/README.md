# 库存项目 · 阶段 4：React

当前参考状态：C26 完成。App 保存商品、筛选条件与 editingId，协调列表、统计和单一编辑区；ProductForm 保存草稿与错误，按商品 key 切换时重置。支持新增、补货、删除、编辑与键盘操作；InventoryCounter 独立记数。

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
| npm test | 卡片、组合、状态、数组、表单与状态归属回归，49 条通过；不包含故意失败的 labs |
| npm run build | 应用首页构建到本目录 dist，包含 source maps |
| npm run preview -- --host 127.0.0.1 | 读取已有 dist，通常为 http://127.0.0.1:4173/js_web/ |
| npm run test:bug -- labs/props.test.jsx | C22 传错商品的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/tags.test.jsx | C22 孤立 0 的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/name.test.jsx | C21 JSX 文字错误的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/state-bugs.test.jsx | C23 连续/延时补货的两项回归，原始版本失败；参数累加后通过 |

## 文件与边界

- index.html → src/main.jsx → App → InventoryToolbar / ProductForm / ProductList → ProductCard。StrictMode 保留，Fragment 不增加 DOM 包装。
- src/App.jsx 从 `../../../shared/products.js` 复制固定起点，保存 state 后向下传递；ProductCard 只读 product prop，标题 id 按商品编号区分。
- InventoryCounter 的 count 是独立 UI 状态，不修改商品库存；两个实例各自记数。三个按钮分别提交一次加一、三次加一及定时器中的一次加三。
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
