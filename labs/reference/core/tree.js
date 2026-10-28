import { groupByCategory } from "./collections.js";
// region category-tree
export function buildCategoryTree(products) {
  const children = [];
  for (const [name, items] of groupByCategory(products)) {
    const leaves = items.map((product) => ({ name: product.id, children: [] }));
    children.push({ name, children: leaves });
  }
  return { name: "全部商品", children };
}
// endregion category-tree

// region dfs
export function walkDepthFirst(node, visit) {
  if (!node) return;
  visit(node);
  for (const child of node.children ?? []) walkDepthFirst(child, visit);
}
// endregion dfs

// region bfs
export function walkBreadthFirst(root, visit) {
  if (!root) return;
  const queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    visit(node);
    queue.push(...(node.children ?? []));
  }
}
// endregion bfs
