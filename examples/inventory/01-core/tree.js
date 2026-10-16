export const categoryTree = {
  name: "库存分类", children: [
    { name: "设备", children: [
      { name: "外设", children: [] },
      { name: "显示器", children: [] },
      { name: "音频", children: [] },
    ] },
    { name: "配件", children: [] },
  ],
};

export function walkDepthFirst(node, visit, depth = 0) {
  if (node === null) return;
  visit(node, depth);
  for (const child of node.children) walkDepthFirst(child, visit, depth + 1);
}

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
