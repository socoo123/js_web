import { categoryTree } from "../inventory/01-core/tree.js";

export function walkDepthFirstIterative(root, visit) {
  if (root === null) return;
  const stack = [{ node: root, depth: 0 }];
  while (stack.length > 0) {
    const { node, depth } = stack.pop();
    visit(node, depth);
    for (let index = node.children.length - 1; index >= 0; index--) {
      stack.push({ node: node.children[index], depth: depth + 1 });
    }
  }
}

const names = [];
walkDepthFirstIterative(categoryTree, node => names.push(node.name));
console.log(names.join(" → "));
