import { walkDepthFirstIterative } from "../inventory/01-core/tree.js";

const root = { name: "终点", children: [] };
let current = root;
for (let index = 0; index < 20_000; index++) {
  const child = { name: "下一层", children: [] };
  current.children.push(child);
  current = child;
}
let count = 0;
walkDepthFirstIterative(root, () => count++);
console.log(count); // → 20001
