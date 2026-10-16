import assert from "node:assert/strict";
import { products } from "../shared/products.js";
import { Inventory } from "../inventory/01-core/inventory.js";
import { categoryTree, walkDepthFirst, walkBreadthFirst, walkDepthFirstIterative } from "../inventory/01-core/tree.js";

const copy = () => products.map(product => ({ ...product, tags: [...product.tags] }));
const inventory = new Inventory(copy());
const other = new Inventory(copy());
const keyboard = inventory.getById("P001");
assert.equal(inventory.undo(), false);
assert.equal(inventory.setStock("P001", 15), true);
assert.equal(inventory.setStock("P001", 15), false);
assert.equal(inventory.setStock("P002", 3), true);
assert.equal(inventory.summary().totalStock, 58);
assert.equal(inventory.undo(), true);
assert.equal(inventory.getById("P002").stock, 0);
assert.equal(inventory.undo(), true);
assert.equal(keyboard.stock, 12);
assert.equal(inventory.getById("P001"), keyboard);
assert.equal(inventory.undo(), false);
assert.equal(other.undo(), false);
assert.equal(products[0].stock, 12);
for (const stock of [-1, 100000, 1.5, NaN, Infinity, "3", undefined]) {
  assert.throws(() => inventory.setStock("P001", stock), RangeError);
}
assert.throws(() => inventory.setStock("P999", 3), /商品不存在：P999/);
assert.equal(inventory.undo(), false);
assert.equal(inventory.setStock("P001", 0), true);
assert.equal(inventory.setStock("P001", 99999), true);
assert.equal(inventory.undo(), true);
assert.equal(keyboard.stock, 0);
assert.equal(inventory.undo(), true);
assert.deepEqual(inventory.summary(), { totalStock: 52, totalValueCents: 2634800, soldOutCount: 1, lowStockCount: 2 });
const collect = walk => {
  const result = [];
  walk(categoryTree, (node, depth) => result.push([node.name, depth]));
  return result;
};
const dfs = [["库存分类", 0], ["设备", 1], ["外设", 2], ["显示器", 2], ["音频", 2], ["配件", 1]];
assert.deepEqual(collect(walkDepthFirst), dfs);
assert.deepEqual(collect(walkDepthFirstIterative), dfs);
assert.deepEqual(collect(walkBreadthFirst), [dfs[0], dfs[1], dfs[5], ...dfs.slice(2, 5)]);
const leaves = collect(walkDepthFirst).map(([name]) => name).filter(name => inventory.groupedByCategory().has(name));
assert.deepEqual(leaves.toSorted(), [...inventory.groupedByCategory().keys()].toSorted());
for (const walk of [walkDepthFirst, walkBreadthFirst, walkDepthFirstIterative]) {
  let calls = 0;
  walk(null, () => calls++);
  assert.equal(calls, 0);
  walk({ name: "单节点", children: [] }, (_, depth) => { assert.equal(depth, 0); calls++; });
  assert.equal(calls, 1);
}
console.log("项目验收通过：撤销顺序、边界校验、引用一致、数据隔离、DFS/BFS 与空树。");
