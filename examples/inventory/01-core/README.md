# 库存项目 · 阶段 1：纯 JS 核心

当前参考状态：C06 完成。`inventory.js` 先提供 `createCategoryFilter(category)`，后续课程逐步加入类、统计、索引等功能。

## 运行

需要 Node 24。在本目录执行 `node demo.js`，没有第三方依赖，也不需要安装网站依赖。

```text
外设： P001, P002
配件： P004, P005
原始商品数： 6
```

`demo.js` 从 `../../shared/products.js` 读取固定数据，从 `./inventory.js` 读取筛选工厂。分类筛选包含库存为 0 的 P002；演示只读取商品。

仓库根目录的 `npm run examples` 会用 `demo.expected.txt` 核对输出。
