import { categoryTree } from "../inventory/01-core/tree.js";

export function walkBreadthFirst(root, visit) {
  if (root === null) return;
  const queue = [{ node: root, depth: 0 }];
  for (let head = 0; head < queue.length; head++) {
    const { node, depth } = queue[head];
    queue[head] = undefined;
    visit(node, depth);
    for (const child of node.children) queue.push({ node: child, depth: depth + 1 });
  }
}

const names = [];
walkBreadthFirst(categoryTree, node => names.push(node.name));
console.log(names.join(" → "));
