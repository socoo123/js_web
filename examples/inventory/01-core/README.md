# 库存项目 · 阶段 1：纯 JS 核心

当前参考状态：C12 完成，第一周交付。保留筛选、类、排序统计、索引分组、标签去重、撤销栈与分类树，加入模拟异步加载。

| API | 作用 |
| --- | --- |
| `createCategoryFilter(category)` | 返回按分类判断商品的函数 |
| `new Inventory(products)` | 保存商品数组的浅复制；遇到重复 id 抛 Error |
| `inventory.count()` | 返回商品条目数 |
| `inventory.select(predicate)` | 返回符合规则的新数组 |
| `inventory.sorted(compareFn)` | 返回排序后的新数组，内部顺序不变 |
| `inventory.summary()` | 总库存、库存总价值（分）、售罄种数、低库存种数 |
| `inventory.getById(id)` | 从私有 Map 索引返回商品，缺失为 undefined |
| `inventory.groupedByCategory()` | 返回按分类首次出现顺序排列的 Map，值为商品数组 |
| `inventory.uniqueTags()` | 返回按首次出现顺序排列的去重标签数组 |
| `inventory.setStock(id, stock)` | 接受 0–99999 整数，保存旧库存后修改；有变化返回 true，无变化 false |
| `inventory.undo()` | 恢复最近一次旧库存，成功 true，空历史 false |
| `loadInventory(source, { fail = false, delayMs = 20 } = {})` | 返回 Promise；模拟等待后交付独立 Inventory，或以 Error 拒绝 |
| `categoryTree` | 导出分类树：库存分类 → 设备（外设、显示器、音频）、配件 |
| `walkDepthFirst(root, visit)` | 递归前序 DFS，回调为 `(node, depth)` |
| `walkBreadthFirst(root, visit)` | 头索引队列 BFS，同样回调 |
| `walkDepthFirstIterative(root, visit)` | 数组栈 DFS，和递归版顺序相同 |

## 数据与编辑边界

构造器只复制数组，商品对象仍共享。`getById`、`select`、`sorted` 和分组结果中的商品也保持同一个引用。id 在本阶段固定，替换商品或改 id 时需要同步维护索引。

`setStock` 校验后保存 `{ id, stock }`，仅记录库存的有效变化；缺失 id 抛 Error，非法库存抛 RangeError。`undo` 直接恢复字段，不新增历史。每个实例有独立历史；直接改返回商品的字段会绕过历史。

编辑演示使用 `products.map(product => ({ ...product, tags: [...product.tags] }))` 创建独立副本。多个编辑实例需要分别复制商品，才能同时隔离字段和历史。

分组 Map、组数组、标签数组与统计对象每次创建；低库存为 1–5 件。空库存四个统计字段为 0，分组和标签为空。

树节点统一包含 `name`、`children`，叶子为 `children: []`，null 为空树。遍历函数用于无环树，回调只读数据；函数不修改孩子数组。根深度为 0。BFS 清除已处理节点的引用，但其底层数组长度仍增长到节点总数；循环 DFS 反向压入孩子以保留左到右顺序。

异步加载在定时器回调中复制 source 的商品对象与 tags 数组，每次有独立的索引与历史；输入应在等待期间保持只读。`fail: true` 模拟库存加载失败；复制与构造异常在回调内捕获并 reject。加载器只使用传入数组，不发 HTTP 请求；delayMs 是等待门槛，不是精确完成时间。

## 运行与预期

需要 Node 24，在本目录运行 `node demo.js`，无需安装第三方依赖。固定数据来自 `../../shared/products.js`。

| 报告 | 预期 |
| --- | --- |
| 总商品数 / 总库存 / 总价值（分） | 6 / 52 / 2634800 |
| 售罄 / 低库存 | 1 / 2 |
| 分类商品种数 | 外设 2、显示器 1、配件 2、音频 1 |
| 标签 | 热销、新品 |
| 按 id 查 P004 | USB-C 扩展坞，库存 3 |
| 编辑任务顺序 / 新库存 | P002、P004 / 3、6 |
| 撤销两次 / 再撤销 | 先恢复 P004 的 3，再恢复 P002 的 0 / false |
| 撤销后总库存 | 52 |
| 异步交付 / 副本编辑 P002 | 6 种、52 件、2634800 分 / 副本 55 件，原模块 52 件 |
| 模拟失败 / 收尾 | 库存加载失败 / 异步加载结束 |
| DFS 导航 | 库存分类 → 设备 → 外设 → 显示器 → 音频 → 配件，按深度缩进 |
| BFS | 库存分类 → 设备 → 配件 → 外设 → 显示器 → 音频 |

完整输出保存在 `demo.expected.txt`，仓库根目录 `npm run examples` 自动核对。

- `node ../../c09/project-check.js`：索引、分组、标签、重复 id 和空库存。
- `node ../../c10/project-check.js`：编辑校验、撤销顺序、历史独立、原数据不变、对象身份与三种遍历。
- `node ../../c12/project-check.js`：Promise 异步交付、全部固定业务参考值、副本与历史隔离、空数据、模拟失败、复制异常与重复 id 拒绝。
