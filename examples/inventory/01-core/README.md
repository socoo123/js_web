# 库存项目 · 阶段 1：纯 JS 核心

当前参考状态：C10 完成。在 C09 的索引、分组与去重上，加入库存撤销栈、头索引任务队列和分类树遍历。

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
| DFS 导航 | 库存分类 → 设备 → 外设 → 显示器 → 音频 → 配件，按深度缩进 |
| BFS | 库存分类 → 设备 → 配件 → 外设 → 显示器 → 音频 |

完整输出保存在 `demo.expected.txt`，仓库根目录 `npm run examples` 自动核对。

- `node ../../c09/project-check.js`：索引、分组、标签、重复 id 和空库存。
- `node ../../c10/project-check.js`：编辑校验、撤销顺序、历史独立、原数据不变、对象身份与三种遍历。
