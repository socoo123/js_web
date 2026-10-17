# 库存项目 · 阶段 2：原生页面

当前参考状态：C16 完成，原生页面 v1。沿用请求、筛选编辑、localStorage、备份恢复与响应式布局，拆为 ES 模块并复用阶段 1 的 Inventory。

## 运行

在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/inventory/02-web/`。无需安装依赖。

| 文件 | 作用 |
| --- | --- |
| index.html | 搜索、分类、列表、库存表单、请求状态、数据来源与备份控件 |
| products.json | 与 `../../shared/products.json` 一致的固定数据 |
| app.js | 事件与状态协调、候选库存保存、失败提示和焦点恢复 |
| ../01-core/inventory.js | 复用 Inventory 的 select/getById/summary/setStock 与筛选工厂 |
| validation.js | 完整字段校验与独立复制、库存文本解析 |
| storage.js | 版本快照编解码、读取和保存；localStorage 仅在调用时使用 |
| api.js | 模块相邻 products.json 的 URL、请求与校验 |
| view.js | 商品筛选与列表、汇总渲染 |
| download.js | 首次导出时动态加载的浏览器下载功能 |
| style.css | border-box、CSS 变量、Flex 工具栏与备份区、Grid 卡片、媒体查询、错误与焦点样式 |

index.html 通过 type="module" 加载 app.js，依赖自动加载。静态服务须从仓库根目录启动，确保兄弟目录 01-core 可访问。加载状态为 loading、ready、error；ready 时再区分两类空态。

首次没有副本时读取相对路径 `./products.json`，失败后可重试；有效副本优先，筛选只处理内存数据。只编辑 stock，接受 0–99999 整数。

## 存储规则

- 键为 `js_web:inventory:v1`，内容为 `{ "version": 1, "products": [...] }`，导出文件用同一格式。
- 有效副本包括空数组；读取失败时提示并尝试初始 JSON，保留坏原文，不自动写回。
- 保存、导入和恢复均先校验并写入成功，才替换内存和渲染。恢复会重新请求初始 JSON，成功后保存为新副本。
- 编辑时将当前商品经过 validateProducts 复制后构造候选 Inventory，setStock 只改候选。存储写入失败时，当前 Inventory 的对象也保持旧值。
- 导入整份替换，验证后确认；取消、坏文件、请求或存储失败都保留原数据。读取文件与恢复期间禁用相关控件，finally 恢复。
- localStorage 依源隔离，同源路径共享；本页用一个标签操作，多标签并发以最后一次写入为准。不写回静态 JSON。

## 布局规则

- 根字号默认 16px 时，360px 单列、768px 两列、1280px 四列；main 最大边框盒宽 75rem，含左右各 1rem 的内边距。
- 48rem 与 75rem 两个 min-width 查询按从小到大排列；Grid 使用 minmax(0, 1fr)，gap 为 1rem。
- 工具栏的 label/控件按 field 包装后一起换行；字段 min-width: 0，控件 width: 100%。
- 卡片用纵向 Flex，按钮的 margin-block-start: auto 吸收多余空间；名称允许任意处换行。
- 键盘顺序沿用 DOM 顺序，保留 :focus-visible、label、状态提示和 editor 的 hidden。

## 验收

- 检查 360/768/1280px 的 1/2/4 列与无横向滚动；筛选、编辑、错误和空态时也成立。

- 无副本或恢复初始数据后：6 种、52 件、总价值 2634800 分（26348.00 元）。
- 慢网且禁用缓存：先显示加载提示，列表为空，搜索/分类/重试禁用，结束后恢复；列表 aria-busy 从 true 变 false。
- 分类配件有 P004、P005，再搜键盘为空态；汇总始终统计全部商品。
- 恢复全部，搜索 p002，编辑 0 为 3：55 件、26735.00 元；再筛选和刷新均保留编辑。
- 空值、-1、3.8、100000 无法保存；0 与 99999 可保存；保存和取消恢复焦点。
- 在 Application 删除本项目键，再暂时改名 products.json，刷新产生 404：显示失败和重试，Console 保留详细错误；恢复文件名，点重试恢复原始数据。
- 失败后输入筛选词，错误提示保留；重试成功后应用当前筛选条件。
- 没有本地副本时，临时将 products.json 改成 `[]`：暂无商品、汇总 0、不显示重试；语法错误或 `{ "products": [] }` 则进入失败分支。实验后恢复固定文件。
- 导出后恢复初始数据，回导下载文件，刷新仍保留编辑；导入取消或坏文件时两份数据不变，支持反复选择同一文件。
- 在 Application 把键值改成 `{` 后刷新：提示读取失败，显示初始商品，存储仍为 `{`；确认恢复后才变成有效快照。
- 导入 c14/empty.json 后刷新仍为空；c14/valid.json 恢复固定数据。语法、版本、重复 id、字符串库存均被拒绝。
- 存储拒绝读取时降级到初始 JSON；写入失败时，编辑、导入与恢复均提示失败并保留原数据。

DOM/编辑验证见 [examples/c11](../../c11/README.md)，请求见 [examples/c13](../../c13/README.md)，存储见 [examples/c14](../../c14/README.md)，布局见 [examples/c15](../../c15/README.md)，模块拆分与写入失败验证见 [examples/c16](../../c16/README.md)。
