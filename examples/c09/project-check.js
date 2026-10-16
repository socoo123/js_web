import assert from "node:assert/strict";
import { products } from "../shared/products.js";
import { Inventory } from "../inventory/01-core/inventory.js";

const inventory = new Inventory(products);
assert.equal(inventory.getById("P004"), products[3]);
assert.equal(inventory.getById("P999"), undefined);
const groups = inventory.groupedByCategory();
assert.deepEqual([...groups].map(([category, group]) => [category, group.length]), [
  ["外设", 2], ["显示器", 1], ["配件", 2], ["音频", 1],
]);
assert.equal(groups.get("外设")[0], products[0]);
groups.get("外设").pop();
groups.clear();
assert.equal(inventory.groupedByCategory().get("外设").length, 2);
const tags = inventory.uniqueTags();
assert.deepEqual(tags, ["热销", "新品"]);
tags.pop();
assert.deepEqual(inventory.uniqueTags(), ["热销", "新品"]);
assert.throws(() => new Inventory([...products, products[0]]), /重复商品 id：P001/);
const empty = new Inventory([]);
assert.equal(empty.getById("P001"), undefined);
assert.equal(empty.groupedByCategory().size, 0);
assert.deepEqual(empty.uniqueTags(), []);
console.log("项目验收通过：索引、分组、去重、重复 id、空库存与结果容器独立。");
