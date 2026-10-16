# 库存项目 · 阶段 1：纯 JS 核心

当前参考状态：C08 完成。在 C07 的 Inventory 类上，把筛选改成数组方法，加入保留原顺序的排序和统计。

| API | 作用 |
| --- | --- |
| `createCategoryFilter(category)` | 返回按分类判断商品的函数 |
| `new Inventory(products)` | 保存商品数组的浅复制，各实例有独立的数组 |
| `inventory.count()` | 返回商品条目数 |
| `inventory.select(predicate)` | 返回符合规则的新数组 |
| `inventory.sorted(compareFn)` | 返回按比较器排序的新数组，内部顺序不变 |
| `inventory.summary()` | 返回总库存、库存总价值（分）、售罄种数、低库存种数 |

`select` 和 `sorted` 都保留商品对象引用。增删或排序结果数组不会影响内部数组，改商品字段仍会共享变化。`summary` 每次返回独立的统计对象，空库存的四个统计字段均为 0；低库存定义为 1–5 件。

## 运行

需要 Node 24。在本目录执行 `node demo.js`，没有第三方依赖，也不需要安装网站依赖。

```text
外设： P001, P002
配件： P004, P005
原始商品数： 6
回调筛选配件： 2
实例自有 select： false
独立空库存： 0
库存升序： P002, P004, P006, P003, P001, P005
原始顺序： P001, P002, P003, P004, P005, P006
总库存： 52
库存总价值（分）： 2634800
售罄 / 低库存： 1 2
空库存统计： {"totalStock":0,"totalValueCents":0,"soldOutCount":0,"lowStockCount":0}
```

`demo.js` 从 `../../shared/products.js` 读取固定数据。前六行保留 C07 的结果；后六行检查排序副本、固定业务统计和空库存。商品种数与库存件数分别是 6 和 52。

方法通过原型共享，传作独立回调时沿用 C07 的 `bind` 或箭头回调。分类工厂仍可复用，筛选包含库存为 0 的 P002。

仓库根目录的 `npm run examples` 会用 `demo.expected.txt` 核对输出。
