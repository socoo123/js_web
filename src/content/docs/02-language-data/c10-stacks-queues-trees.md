---
title: C10 栈、队列、树与复杂度
description: 用 Array 保存可撤销的库存操作，用头索引处理任务队列，遍历分类树生成导航，并看清 JS 写法的时间与空间代价。
sidebar:
  order: 10
---

> **第 1 周 · 第 5 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟> 前置：C05、C07–C09 · 运行：Node 24 · 示例已运行验证

## 这一课解决什么问题

库存模块已经能查商品、分组和统计。现在你要给编辑操作加「撤销」，批量处理待盘点任务，再把分类显示成有层级的导航。

你在 Java 里写过这些结构。换到 JS，要留意数组接口的返回值、从头删除的代价，以及递归的调用深度。

学完你能：

- 用 `push` / `pop` 保存修改前的库存，按相反顺序撤销
- 用头索引处理任务，分清底层数组长度与剩余任务数
- 用嵌套对象表示分类树，写出递归 DFS 与队列 BFS
- 把 DFS 改成显式栈循环，保持同样的访问顺序
- 根据实际操作估算代价，用计时比较量级

例子在 [examples/c10](https://github.com/socoo123/js_web/tree/main/examples/c10)。沿用 C06 的 Node，进入该目录运行 `node stack.js` 等文件；保留仓库目录结构，树的例子会读取项目阶段目录中的分类数据。

## Java 程序员先看这里

| Java | JavaScript | 一句话差异 |
| --- | --- | --- |
| `Deque.push` / `pop` | 数组 `push` / `pop` | 本课在数组尾部进出；`push` 返回新长度，空数组 `pop` 得到 undefined |
| `ArrayDeque` 的队列接口 | 数组加头索引 | JS 没有同名内建队列，自己维护待处理区间 |
| `Node` 类和 `List<Node>` | `{ name, children: [] }` | 对象和数组即可表达树，字段结构由代码约定 |
| 递归调用 / `StackOverflowError` | 递归调用 / `RangeError` | Node、Chrome 调用过深时报 Maximum call stack size exceeded |
| `Map<K, List<K>>` | `Map` 的值保存数组 | 适合邻接表；键的匹配规则沿用 C09 |

## 1. 撤销栈：保存旧值，再改当前值

栈用数组尾部做栈顶：[`push`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/push) 入栈，[`pop`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/pop) 出栈。撤销时取出最近一次修改前的值，恢复到商品上。

**先猜一猜：** 补货后再撤销，库存回到多少？再取一次空栈会抛异常吗？

```js title="stack.js"
const product = { id: "P001", stock: 12 };
const history = [];
history.push({ id: product.id, stock: product.stock });
product.stock += 3;
console.log(product.stock); // → 15

const previous = history.pop();
if (previous !== undefined) product.stock = previous.stock;
console.log(product.stock, history.length); // → 12 0
console.log(history.pop()); // → undefined
```

依次输出 `15`、`12 0`、`undefined`。保存的记录是 `{ id: "P001", stock: 12 }`；随后商品变成 15，这条记录里的数字仍是 12。`pop` 取走记录，恢复字段后栈长变成 0。

只改库存，就保存 id 和旧库存。两次编辑要各存一次，恢复时才会先撤销第二次、再撤销第一次。

`push` 返回加入后的数组长度，`pop` 返回被移除的值。判断历史是否为空，用 `history.length === 0`，或者像例子一样检查出栈结果是否为 `undefined`。本课历史记录始终是对象，因此可以用 `undefined` 表示没有记录。

Java 的 `ArrayDeque.pop()` 空时会抛异常，JS 的数组 `pop()` 空时返回 `undefined`，调用方要决定怎样提示「没有可撤销的操作」。

:::tip[自己尝试 · Node]
1. 在 `examples/c10` 运行 `node stack.js`。
2. 在第一次补货之后，再保存一次当前库存，并把库存加 2。
3. 连续出栈两次，每次都把记录中的旧库存写回商品。

预期：两次修改后是 17，两次撤销后依次是 15、12；第三次出栈得到 `undefined`。
:::

## 2. 任务队列：移动头索引，保留处理顺序

数组尾部 `push`、头部 `shift` 能组成先进先出队列。小列表这样写很直观；任务多时，用头索引记录「下一项在哪里」，就能避免逐次删除首项。

[`shift()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/shift) 的可见行为是把后面的值向前调整，并缩短数组。头索引则让底层数组保持位置，只移动一个数字。

```js title="queue-head.js"
const tasks = [{ id: "P001", amount: 3 }, { id: "P002", amount: 2 }];
let head = 0;
while (head < tasks.length) {
  const task = tasks[head];
  tasks[head] = undefined; // 释放队列对已处理任务的引用
  head++;
  console.log(task.id, task.amount);
}
console.log("剩余任务", tasks.length - head); // → 0
console.log("底层长度", tasks.length); // → 2
// 本批已处理完，下一批从空数组开始。
tasks.length = 0;
head = 0;
console.log(tasks.length, head); // → 0 0
```

先输出 `P001 3`、`P002 2`，再输出 `剩余任务 0`、`底层长度 2`，重置后是 `0 0`。`head` 左侧已处理，区间 `[head, tasks.length)` 才是剩余任务。因此剩余数是 `tasks.length - head`，处理结束时数组长度也可能大于 0。

把已处理位置写成 `undefined`，会释放队列对任务对象的引用。这是赋值，数组长度仍是 2；对象如被其他变量引用，仍然存在。

本例在整批处理完后重置。长期不空的队列，可以累计较多已处理位置后，用一次 `slice(head)` 保留剩余项并把 `head` 置 0。复制适合偶尔整理；每出队就复制，又会反复搬动剩余元素。长期高频排队可考虑环形缓冲区。

Java 的 `ArrayDeque` 已把这些管理封装在容器内部；这里用一个数组和一个索引把机制展开了。

### 比较十万次出队

下面让两种写法处理完全相同的 0–99999，并累加结果，确保两段循环都做了实际工作。数组创建放在计时之前，循环内没有日志。

```js title="queue-bench.js"
const count = 100_000;
const shifted = Array.from({ length: count }, (_, index) => index);
const indexed = [...shifted];
let shiftSum = 0;
let headSum = 0;
console.time("shift");
while (shifted.length > 0) shiftSum += shifted.shift();
console.timeEnd("shift");
console.time("head");
for (let head = 0; head < indexed.length; head++) headSum += indexed[head];
console.timeEnd("head");
console.log(shiftSum, headSum); // → 4999950000 4999950000
```

运行会先显示 `shift: …ms`、`head: …ms`，最后一行固定为 `4999950000 4999950000`。[`console.time` 与 `console.timeEnd`](https://nodejs.org/api/console.html#consoletimelabel) 用相同标签配对，打印这段操作经过的时间。

:::tip[自己尝试 · Node]
1. 在 `examples/c10` 运行 `node queue-bench.js`，连续运行三次。
2. 把 `count` 改为 `10_000`，再改回 `100_000`，分别观察耗时。
3. 确认每次两个和相同：一万项时是 `49995000`，十万项时是 `4999950000`。

预期：十万项下，反复 `shift` 通常明显慢于头索引；具体毫秒数和倍数会随机器、引擎和预热变化。重点看数据变大后哪种写法增长得快。
:::

## 3. 分类树：同一份对象，DFS 和 BFS 两种顺序

树节点用普通对象表示，`children` 数组保存按展示顺序排列的子节点。项目中的 `tree.js` 使用这份数据：

```js
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
```

`设备` 是导航分支，`外设`、`显示器`、`音频`、`配件` 是固定商品数据中的四个分类。给导航增加一个父分支，不需要修改商品的 `category` 字段。

叶节点统一写 `children: []`，循环到这里自然结束。和 Java 节点类相比，省去了类声明，但节点仍须遵守同样的字段结构。

### DFS：先访问自己，再完成一个子树

下面是前序、从左到右的深度优先遍历（DFS）。回调 `visit` 决定访问时做什么，遍历函数负责顺序和深度。

```js title="tree-dfs.js"
import { categoryTree } from "../inventory/01-core/tree.js";

export function walkDepthFirst(node, visit, depth = 0) {
  if (node === null) return;
  visit(node, depth);
  for (const child of node.children) walkDepthFirst(child, visit, depth + 1);
}

const names = [];
walkDepthFirst(categoryTree, node => names.push(node.name));
console.log(names.join(" → "));
```

输出为 `库存分类 → 设备 → 外设 → 显示器 → 音频 → 配件`。进入设备后，先访问它的全部子节点，返回根节点以后才轮到配件。

`visit(node, depth)` 复用 C06「函数作为值」的写法。收集名称、输出缩进、筛选叶节点，都能换一个回调完成。递归调用传 `depth + 1`，同一层的兄弟节点深度相同；根节点从 0 开始。

传入 `null` 表示空树，直接返回；叶节点的空数组执行零次循环。Java 中递归遍历的逻辑相同，这里省去了参数和节点的类型声明。

### BFS：当前层先出队，下一层排到尾部

广度优先遍历（BFS）使用队列。队列中的每项同时保存节点和深度，节点出队时把它的孩子依次追加到队尾。

**先猜一猜：** `配件` 会排在 `外设` 前面还是后面？

```js title="tree-bfs.js"
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
```

输出为 `库存分类 → 设备 → 配件 → 外设 → 显示器 → 音频`。访问根节点后，队列里是设备、配件；设备出队时，它的孩子排在配件后面。因此先访问深度 1 的两个节点，再访问深度 2 的三个节点。

循环条件每次读取当前的 `queue.length`，新加入的节点也会被处理。如果事先固定成最初的长度 1，循环只会访问根节点。队列的顺序决定层次，头索引让取出下一项无需反复 `shift`。

![分类树：库存分类下有设备和配件，设备下有外设、显示器和音频。节点同时标注 DFS 前序与 BFS 逐层访问的序号，显示配件在两种遍历中的位置不同。](../../../assets/diagrams/c10-category-traversal.svg)

箭头表示父子关系，按节点上的 DFS 或 BFS 序号分别读一遍。DFS 适合把一个分支连同子项放在一起生成导航；BFS 适合按层处理，例如先展示所有一级分类。

## 4. 数据很深时，把递归换成显式栈

递归会使用运行时的调用栈。数据是一条很长的单链时，每访问一层，上一层函数还在等它返回。Node 和 Chrome 在调用过深时会抛出 [`RangeError: Maximum call stack size exceeded`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors/Too_much_recursion)；可承受的层数取决于环境和函数写法。

把「稍后访问的节点」存进自己的数组栈，就可以用循环推进：

```js title="tree-iterative.js"
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
```

输出仍为 `库存分类 → 设备 → 外设 → 显示器 → 音频 → 配件`。`pop` 取最后一项，所以孩子要从右向左入栈，最左边的孩子才先出栈。这里读下标即可，直接对 `node.children.reverse()` 会改掉原树的顺序。

循环保存待访问节点，递归保存未返回的函数调用。两者都需要空间；显式栈使用普通数组，避免挤满调用栈。Java 里用 `Deque` 代替递归也是这个思路。

在 `examples/c10` 运行 `node deep-tree.js`：它用循环创建一棵两万条边的单链，再用循环版 DFS 计数，输出 **20001**。根节点也算一个节点。你可以把文件中的函数名改成 `walkDepthFirst`，并修改导入；递归版在调用深度超过环境上限时会报错。

区分两个问题：树很深，是数据带来的调用深度；忘了结束条件，或者把祖先放回孩子数组，是永远走不完。改成循环解决深度问题；有环的数据还需要访问标记，单纯换循环会持续重复访问。

## 5. 复杂度跟着操作走

估算代价时，把方法调用展开：是否遍历、复制，是否反复处理同一批元素。下面按本课的普通数组和树估算。

| 写法 | 时间代价 | 需要关注的空间 |
| --- | --- | --- |
| 数组尾部 `push` / `pop` | 常见实现下，入栈均摊 O(1)，出栈 O(1) | n 条撤销记录占 O(n) |
| 反复 `shift` 清空 n 项 | 按逐项前移估算，总共 O(n²) | 在原数组上修改 |
| 头索引完整扫描 n 项 | 总共 O(n) | 本课底层数组仍占 O(n) |
| 递归 DFS 访问 n 个树节点 | O(n)，假设回调只做常数工作 | 调用栈 O(h)，h 为树高 |
| 本课循环 DFS / BFS | O(n)，每个节点入容器一次 | 待访问项最坏 O(n)；BFS 数组保留已用位置 |

第二行来自 `n−1 + n−2 + … + 1`：每删一次首项，剩余元素都可能需要调整。引擎能对某些数组做优化，因此实测不一定严格按这个公式增长；头索引写法在算法层面直接消除了反复调整首部的需求。

空间也要看完整实现。BFS 的有效待访问节点最多约为树宽，但本课数组只把已处理槽位赋成 `undefined`，底层长度依然增长到 n，所以这份实现的辅助数组空间按 O(n) 估算。循环 DFS 会一次压入所有孩子，一棵很宽的树也可能留下 O(n) 项。收集完整导航结果，还要另外保存 n 个结果。

业务回调的工作同样算进代价：遍历六个分类时，每个回调再扫描全部商品，和先建分组 Map、按分类取结果，所做的工作不同。先按 C09 分组，再把叶节点名称当键查询，更容易控制重复扫描。

### 从树到图：邻接表只多一个约定

如果分类之间还有「相关分类」关系，一个节点可能通向多个已有节点，用 Map 保存邻接表即可：

```js title="graph.js"
const related = new Map([
  ["外设", ["配件", "音频"]],
  ["配件", ["外设"]],
  ["音频", []],
]);
console.log(related.get("外设").join(", ")); // → 配件, 音频
console.log(related.get("配件").includes("外设")); // → true
```

输出 `配件, 音频` 和 `true`。每个键是节点，数组列出从它出发能走到的节点；例子存在外设到配件、配件到外设的环。遍历这类数据时，用 C09 的 `Set` 保存已访问 id，在再次入栈或入队前检查并标记，才能避免重复走环。Java 的 `Map<String, List<String>>` 表达的是同一关系。

## 常见错误与调试

### 为什么撤销以后还是 15

下面的代码能运行，却恢复不了旧库存：

```js title="undo-broken.js"
// 有问题的写法：把正在修改的对象本身存进历史
const product = { id: "P001", stock: 12 };
const history = [];
history.push(product);
product.stock += 3;
const previous = history.pop();
product.stock = previous.stock;
console.log(product.stock); // → 15，撤销没有回到 12
```

**现象**：P001 原库存 12，补货 3，再撤销，仍然打印 15。

**工具**：在**仓库根目录**运行 `python3 -m http.server 8000 --bind 127.0.0.1`，用 Chrome 打开 `http://127.0.0.1:8000/examples/c10/`。按 F12，在 Sources 的文件树打开 `undo-broken.js`，单击 `product.stock += 3` 的行号设断点，再刷新。暂停时在 Console 求值 `history[0] === product`，然后点 Step over 执行补货。

**证据**：比较得到 `true`。Scope 的 Module 区域中，`product.stock` 和 `history[0].stock` 从 12 一起变成 15。历史数组没有留下一个独立的旧库存值。

**原因**：`history.push(product)` 保存的是对象引用。C05 讲过，数组里的元素和变量可以指向同一个对象；后来修改字段，两处看到的是同一个新值。

**修复**：把入栈那行改成 `history.push({ id: product.id, stock: product.stock });`。这条记录只含原始值，修改商品字段不会修改它。出栈和恢复那两行保持原样。

**确认**：刷新重跑。断点处比较变成 `false`，单步补货后商品库存是 15、历史库存仍是 12；继续运行最终打印 12。

:::tip[自己尝试 · 本地网页]
按上面的断点步骤各跑一次错误版与修复版。每次都在补货前、补货后比较商品和历史的库存。

预期：修复前两个位置一起变成 15，修复后历史保留 12；暂停查看引用关系，解释结果的原因。
:::

## 练习

### 练习 1：预测栈接口的返回值

先写下六行输出，再在 `examples/c10` 运行 `node prediction.js`。验收时特别核对前两行的类型。

```js title="prediction.js"
const history = [];
console.log(history.push("P001"));
console.log(history.push("P002"));
console.log(history.pop());
console.log(history.length);
console.log(history.pop());
console.log(history.pop());
```

<details>
<summary>提示</summary>

`push` 的返回值是长度，不是被加入的元素；`pop` 取走尾部元素，空时返回 `undefined`。

</details>

<details>
<summary>参考答案</summary>

依次为数字 `1`、数字 `2`、字符串 `P002`、数字 `1`、字符串 `P001`、`undefined`。第一次 `pop` 后只剩 P001；后两次出栈先取 P001，再遇到空数组。

</details>

### 练习 2：任务值为 0 时也要继续

`queue-broken.js` 模拟按顺序处理三件商品的盘点库存。第一件是售罄商品，库存 0 也是有效任务：

```js title="queue-broken.js"
// 有问题的写法：用任务值是否为 truthy 判断队列是否结束
const quantities = [0, 12, 3];
const processed = [];
let quantity;
while ((quantity = quantities.shift())) {
  processed.push(quantity);
}
console.log(processed.join(", ")); // → 空行
console.log(quantities.length); // → 2
```

改成头索引循环。验收：默认输入打印 `0, 12, 3` 和 `3`，原数组保留；换成空数组时打印空行和 `0`；换成 `[0, 0]` 时打印 `0, 0` 和 `2`。

<details>
<summary>提示</summary>

原循环把出队值直接当条件，0 是 falsy。判断还有没有任务应该看位置与长度，数据值本身可以是 0、false 或空字符串。

</details>

<details>
<summary>参考答案</summary>

```js title="queue-answer.js"
const quantities = [0, 12, 3];
const processed = [];
for (let head = 0; head < quantities.length; head++) {
  processed.push(quantities[head]);
}
console.log(processed.join(", ")); // → 0, 12, 3
console.log(quantities.length); // → 3，按下标读取保留了原数组
```

条件只检查 `head < quantities.length`，所以每个有效位置都会处理。按下标读取保留原数组；`processed.length` 表示处理了多少项。空数组第一次判断就结束。

</details>

### 练习 3：给项目加可撤销编辑与分类导航

从 C09 的阶段 1 继续，按下一节完成代码。验收：P002、P004 按队列顺序改成 3、6；连续撤销后先恢复 P004 的 3，再恢复 P002 的 0；空历史返回 `false`，总库存回到 52。分类导航缩进正确，BFS 先输出设备、配件，再输出三个二级分类。

<details>
<summary>提示</summary>

修改前记录旧库存，撤销时通过 id 找到原商品，恢复同一个对象的字段。复制一份商品给编辑演示使用，避免改动共享起始数据。导航回调用 `"  ".repeat(depth)` 生成缩进。

</details>

<details>
<summary>参考答案</summary>

下一节给出修改位置，阶段目录保留完整实现。进入 `examples/c10` 运行 `node project-check.js` 核对行为，包括库存 0、上限 99999、非法输入、两次撤销、空历史、空树和单节点树。

关键是每次有效修改只入栈一次；校验失败和库存未变化时均不增加历史。撤销直接恢复旧字段，不再次调用会记录历史的 `setStock`，否则撤销操作本身又会变成一条新历史。

</details>

## 项目进度

从 [examples/inventory/01-core](https://github.com/socoo123/js_web/tree/main/examples/inventory/01-core) 的 C09 状态开始。改 `inventory.js`、`demo.js`，新增 `tree.js`；原有筛选、排序、统计、索引、分组与去重方法保留。

在 `Inventory` 类中增加私有字段 `#history = [];`，再增加库存编辑方法：

```js
  setStock(id, stock) {
    const product = this.getById(id);
    if (product === undefined) throw new Error("商品不存在：" + id);
    if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
      throw new RangeError("库存须为 0–99999 的整数");
    }
    if (product.stock === stock) return false;
    this.#history.push({ id, stock: product.stock });
    product.stock = stock;
    return true;
  }
```

商品必须存在，库存必须是 0–99999 的整数；校验完成后才保存历史。相同库存返回 `false`，实际修改返回 `true`。写回的是索引和列表共享的那个商品对象，因此后续 `summary()` 和分组查询都能看到变化。

然后增加撤销方法：

```js
  undo() {
    const previous = this.#history.pop();
    if (previous === undefined) return false;
    this.getById(previous.id).stock = previous.stock;
    return true;
  }
```

空历史返回 `false`；成功恢复返回 `true`。当前项目的 id 固定，只编辑库存，因此记录 id 和旧库存足够。调用方通过 `setStock` 编辑，才能让修改进入撤销历史；直接修改 `getById()` 返回的对象会绕过这一步。

新增的 `tree.js` 保存本课的分类树和三个遍历函数。把上面代码中的函数原样放进去并保留 `export`，`demo.js` 在顶部导入 `categoryTree`、`walkDepthFirst`、`walkBreadthFirst`。生成导航的部分如下：

```js
const navigation = [];
walkDepthFirst(categoryTree, (node, depth) => navigation.push("  ".repeat(depth) + node.name));
console.log("分类导航：\n" + navigation.join("\n"));
```

输出的根分类不缩进，设备与配件缩进两格，设备下的三个分类缩进四格。`depth` 来自遍历函数；把访问结果变成怎样的导航文本，由回调决定。

`demo.js` 还会创建独立的商品副本执行编辑任务：用 `products.map(product => ({ ...product, tags: [...product.tags] }))` 给新的 `Inventory` 传数据。这沿用 C05 的复制规则，保护共享的起始商品；只复制外层数组仍会共享商品对象。完整任务循环已保存在阶段目录。

在 `examples/inventory/01-core` 运行 `node demo.js`，旧报告之后应出现：

| 输出 | 预期 |
| --- | --- |
| 任务执行 | P002, P004 |
| 修改库存 | 3 6 |
| 撤销一次 / 两次 | true 3 / true 0 |
| 历史耗尽 | false |
| 撤销后总库存 | 52 |
| DFS 分类导航 | 库存分类、设备、外设、显示器、音频、配件，按深度缩进 |
| 逐层分类 | 库存分类 → 设备 → 配件 → 外设 → 显示器 → 音频 |

原报告仍是总库存 52、库存总价值 2634800 分、售罄 1 种、低库存 2 种。再运行 `node ../../c10/project-check.js`，应打印「项目验收通过」。

## 小结

- 数组尾部 `push` / `pop` 组成栈，撤销保存修改前的独立值。
- 头索引队列按 `[head, length)` 处理；剩余数与底层数组长度是两回事。
- 分类树用对象加 `children` 数组表示；DFS 完成分支，BFS 逐层访问。
- 循环 DFS 从右到左压入孩子，保持从左到右的访问顺序，避免递归调用过深。
- 估算复杂度要数重复遍历和复制，也要算容器、调用栈与结果数组的空间。

自测：

1. 为什么把商品对象直接放进撤销栈，会丢掉旧库存？
2. 头索引已经走到末尾，为什么数组长度还大于 0？
3. 同一棵分类树，配件在 DFS 与 BFS 中为什么位置不同？
4. 把递归换成循环后，为什么仍需要考虑内存和环？
5. 为什么计时程序还要打印两个累加和？

下一课把库存逻辑接到网页上：查询 DOM、处理事件与表单，并用断点定位页面变化。

## 延伸阅读

- [MDN：Array.push](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [MDN：Array.pop](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [MDN：Array.shift](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
- [MDN：递归过深错误](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors/Too_much_recursion)
- [Node：console.time 与 console.timeEnd](https://nodejs.org/api/console.html#consoletimelabel)
- [Chrome DevTools：Scope 与单步调试](https://developer.chrome.com/docs/devtools/javascript/reference#scope)
