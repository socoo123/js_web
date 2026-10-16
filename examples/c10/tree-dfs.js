import { categoryTree } from "../inventory/01-core/tree.js";

export function walkDepthFirst(node, visit, depth = 0) {
  if (node === null) return;
  visit(node, depth);
  for (const child of node.children) walkDepthFirst(child, visit, depth + 1);
}

const names = [];
walkDepthFirst(categoryTree, node => names.push(node.name));
console.log(names.join(" → "));
