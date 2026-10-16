# 库存项目 · 阶段 1：纯 JS 核心

当前参考状态：C07 完成。`inventory.js` 保留 C06 的分类工厂，新增组合商品数组与筛选规则的 `Inventory` 类。

| API | 作用 |
| --- | --- |
| `createCategoryFilter(category)` | 返回按分类判断商品的函数 |
| `new Inventory(products)` | 保存商品数组的浅复制，各实例有独立的数组 |
| `inventory.count()` | 返回商品条目数 |
| `inventory.select(predicate)` | 返回符合规则的新数组，商品对象仍共享引用 |

## 运行

需要 Node 24。在本目录执行 `node demo.js`，没有第三方依赖，也不需要安装网站依赖。

```text
外设： P001, P002
配件： P004, P005
原始商品数： 6
回调筛选配件： 2
实例自有 select： false
独立空库存： 0
```

`demo.js` 从 `../../shared/products.js` 读取固定数据，创建 `Inventory`，用工厂生成分类规则。分类筛选包含库存为 0 的 P002；演示只读取商品。`select` 通过原型共享，传作独立回调时用 `bind` 或箭头回调保留接收者。

课程中的修改只展示增量。当前完整 demo 比 C06 多打印三行，其余数据与筛选结果一致。

仓库根目录的 `npm run examples` 会用 `demo.expected.txt` 核对输出。
