---
title: C08 Array 与业务数据处理
description: 用数组方法筛选、排序和统计商品，分清修改与复制，把库存模块推进成可用的报表。
sidebar:
  order: 8
---

> **第 1 周 · 第 4 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C05、C06、C07 · 运行：Node 24 · 示例已运行验证

## 这一课解决什么问题

C07 的库存模块已经能按分类筛选商品。现在运营要一张报表：列出低库存商品，按库存从少到多排序，再算总件数和库存价值。

你写了 `stocks.sort()`，结果 12 排在 3 前面；给商品列表排序后，另一个地方的「原始顺序」也跟着变了。把循环改成 `map`，又得到六个 `undefined`。

选数组方法先看三件事：回调应该返回什么，方法返回什么，它会不会修改输入。

学完你能：

- 按返回结果选择 `map`、`filter`、`find`、`some`、`every`
- 给数字和商品对象写正确的排序比较器，解释稳定排序
- 分清修改原数组与返回新数组，以及新数组为什么仍共享商品对象
- 用带初始值的 `reduce` 统计库存，处理没有商品的情况
- 复用 `Inventory`，输出排序、统计和简单的分类报告

例子在 [examples/c08](https://github.com/socoo123/js_web/tree/main/examples/c08)。沿用 C06 的 Node，进入该目录运行 `node pipeline.js` 等文件；保留仓库结构，`import` 即可读到共享商品数据。

## Java 程序员先看这里

| Java | JavaScript | 一句话差异 |
| --- | --- | --- |
| 数组定长，`ArrayList` 可变长 | `Array` 可变长，也能留空位 | 数字下标越界读取返回 `undefined` |
| `stream().filter().map().toList()` | `filter().map()` | 两步立即执行，各自返回数组 |
| `findFirst()` 返回 Optional | `find()` 返回元素或 `undefined` | 找到后读字段前先处理缺失 |
| `Comparator` 的负数、零、正数 | `sort` 的比较器遵循同样约定 | JS 默认排序先转字符串 |
| `List.sort` 与 Stream 的 `sorted` | `sort` 与 `toSorted` | 前者改原数组，后者返回新数组 |

## 1. Array 是可变长的对象

JS 的数组从下标 0 开始，用 `length` 读长度。它更像可变长的列表：元素类型可以不同，业务代码仍应让一组数据保持同一种结构。

```js title="array-basics.js"
import { products } from "../shared/products.js";

const ids = ["P001", "P002", "P003", "P004", "P005", "P006"];
console.log(ids.length); // → 6
console.log(ids[0], ids[5]); // → P001 P006
console.log(ids[6]); // → undefined
ids[0] = "待复核";
console.log(ids[0], products[0].id); // → 待复核 P001
let totalStock = 0;
for (const product of products) totalStock += product.stock;
console.log(totalStock); // → 52
```

`ids` 存的是字符串，替换一个位置只影响这个数组。`const` 仍允许修改数组内容。

越界读取得到 `undefined`，继续读取它的 `.id` 才抛 `TypeError`；Java 数组或 `List.get` 会在越界时直接抛异常。有效下标满足 `index >= 0 && index < products.length`。

需要累加外部变量、提前 `break` 或 `continue` 时，继续用 `for...of`。后面的方法则把常见循环的意图起了名字。

## 2. 筛选、变换和查询，各自返回什么

### `filter` 留下商品，`map` 生成结果

[`filter`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) 的回调回答「保留吗」，返回布尔判断；[`map`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map) 的回调回答「变成什么」，返回新元素。低库存定义为 1–5 件，库存 0 单独归到售罄。

```js title="pipeline.js"
import { products } from "../shared/products.js";

const lowStock = products.filter(product => product.stock > 0 && product.stock <= 5);
const labels = lowStock.map(product => `${product.id}：${product.stock} 件`);
console.log(labels.join("；")); // → P004：3 件；P006：5 件
console.log(products.length, lowStock.length); // → 6 2
console.log(lowStock[0] === products[3]); // → true
```

先挑出扩展坞和耳机，再转成两个字符串。`join` 将它们拼成一行，数组仍是两项。

`filter` 返回新的数组，选中的商品对象仍是原来的对象，所以最后一行是 `true`。`map` 返回的元素则由回调决定：这里是新字符串；写成 `product => product` 就仍是同一批对象引用。

回调一般接收 `(element, index, array)`，只用元素时写一个参数就够了。链式调用里，下一步的 `index` 从它收到的数组重新计算；筛出两项后再 `map`，下标是 0 和 1。

Java Stream 的 `filter`、`map` 等终止操作才执行；JS 则立即遍历并返回数组，两步就有两次遍历和一个中间数组。库存这六项数据，优先写清业务意图。

### `find` 找一个，`some` 和 `every` 回答真假

只想知道有没有售罄商品，用 `some`；需要那件商品，才用 `find`。`every` 检查所有元素是否符合规则。这三者一旦能确定结果，就会停止检查。

```js title="queries.js"
import { products } from "../shared/products.js";

const soldOut = products.find(product => product.stock === 0);
console.log(soldOut?.id); // → P002
console.log(products.find(product => product.id === "P999")); // → undefined
console.log(products.some(product => product.stock === 0)); // → true
console.log(products.every(product => product.stock > 0)); // → false
console.log([].some(() => true), [].every(() => false)); // → false true
```

`find` 返回第一项或 `undefined`，可用 `?.` 读取。它解决 Java `findFirst` 那样的问题，返回值却没有 Optional 外壳。

空数组的 `some` 是 `false`，因为找不到一个满足条件的元素；[`every`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/every) 是 `true`，因为也找不到反例，回调一次都没运行。这和 Java Stream 的 `anyMatch`、`allMatch` 相同。若业务要求「至少有一件商品，而且全部有货」，条件应是 `products.length > 0 && products.every(product => product.stock > 0)`。

遍历只是为了打印时用 `forEach`，它丢弃回调返回值，自己的返回值也是 `undefined`；生成下一步要用的数组时用 `map`。`forEach` 回调里的 `return` 只结束本次回调，提前结束整个遍历仍用普通循环。

:::tip[自己尝试 · Node]
1. 在 `examples/c08` 运行 `node pipeline.js` 和 `node queries.js`。
2. 将 `pipeline.js` 的条件改成 `product.stock <= 5`，再运行。
3. 把下界 `product.stock > 0` 加回去，恢复低库存定义。

预期：去掉下界后，结果会多出售罄的 `P002：0 件`。恢复后仍只有 P004 和 P006，原商品数组长度保持 6。
:::

## 3. 排序：默认按字符串，数字要给比较器

### `sort()` 为什么把 12 排在 3 前面

**先猜一猜：** 库存是数字，下面会按数值从小到大排吗？`result` 和 `stocks` 是不是同一个数组？

```js title="default-sort.js"
import { products } from "../shared/products.js";

const stocks = products.map(product => product.stock);
const result = stocks.sort();
console.log(result.join(", ")); // → 0, 12, 25, 3, 5, 7
console.log(result === stocks); // → true
```

[`sort`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) 默认把元素转成字符串，按 UTF-16 码元顺序比较。`"12"` 的第一个字符是 `"1"`，排在 `"3"` 前面。这里改变的是比较方式，数组元素仍然是数字。

`sort` 原地调整顺序并返回同一个数组，`result` 只是别名。保留旧顺序需要副本。

### 比较器返回负数、零或正数

数字升序用 `(a, b) => a - b`，降序用 `(a, b) => b - a`；商品按库存排序则比较 `.stock`。[`toSorted`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) 使用同样的比较规则，返回新数组。

```js title="sorted-copy.js"
import { products } from "../shared/products.js";

const stocks = products.map(product => product.stock);
const ascending = stocks.toSorted((a, b) => a - b);
console.log(ascending.join(", ")); // → 0, 3, 5, 7, 12, 25
console.log(stocks.join(", ")); // → 12, 0, 7, 3, 25, 5
const byStock = products.toSorted((a, b) => a.stock - b.stock);
console.log(byStock.map(product => product.id).join(", "));
// → P002, P004, P006, P003, P001, P005
```

和 Java `Comparator` 一样：负数表示 a 在前，0 表示排序地位相同，正数表示 a 在后。差值即可，无需压成 -1、0、1。

`(a, b) => a > b` 只返回布尔值，转成 0 或 1 后缺了负数，破坏比较器约定。交换参数应交换正负，同值应返回 0；比较过程保持数据不变。

`toSorted` 已纳入 ES2023，Node 24 支持；浏览器目标环境查 MDN 的兼容表。已有数组还可写 `[...stocks].sort((a, b) => a - b)`，先浅复制再排序。

### 稳定排序保留相同排序地位的先后关系

需求换成「有货在前，售罄在后」，有货商品之间仍按原列表顺序排列。把售罄判断转成 0 或 1，就能分成两组。

```js title="stable-sort.js"
import { products } from "../shared/products.js";

const availableFirst = products.toSorted(
  (a, b) => Number(a.stock === 0) - Number(b.stock === 0),
);
console.log(availableFirst.map(product => product.id).join(", "));
// → P001, P003, P004, P005, P006, P002
console.log(availableFirst === products); // → false
console.log(availableFirst[0] === products[0]); // → true
```

五件有货商品两两比较得到 0，所以保持 P001、P003、P004、P005、P006 的顺序，售罄的 P002 排到最后。这就是**稳定性**：比较结果为 0 的元素保留排序前的相对顺序。`sort` 从 ES2019 起要求稳定，`toSorted` 也遵循这个规则。

Java 对象列表排序也有稳定性约定。稳定性与是否修改输入分别判断；上例新的是数组容器，商品对象仍共享。

## 4. 先分清方法是否修改输入

下面这张表覆盖本课常用操作。「不修改」指方法自身的操作；回调里写 `product.stock = 0`，仍会修改商品对象。

| 方法 | 得到什么 | 方法自身修改原数组吗 |
| --- | --- | --- |
| `forEach(fn)` | `undefined`，用于执行操作 | 否 |
| `map(fn)` | 每项变换后的新数组 | 否 |
| `filter(fn)` | 符合条件的新数组 | 否 |
| `find(fn)` | 第一项或 `undefined` | 否 |
| `some(fn)` / `every(fn)` | 布尔值 | 否 |
| `reduce(fn, initial)` | 累积结果 | 否 |
| `slice(start, end)` | 指定区间的新数组 | 否 |
| `splice(start, count, ...items)` | 被删除元素组成的数组 | **是**，删除或插入 |
| `sort(compareFn)` | 同一个数组 | **是**，排序 |
| `toSorted(compareFn)` | 排序后的新数组 | 否 |
| `reverse()` | 同一个数组 | **是**，反转 |

### `slice` 是截取，`splice` 是修改

`slice(0, 2)` 取下标 0 和 1，终点 2 不包含在内；`splice(1, 1)` 则从下标 1 起删除 1 项，原数组会缩短。

```js title="slice-splice.js"
const ids = ["P001", "P002", "P003"];
const firstTwo = ids.slice(0, 2);
console.log(firstTwo.join(", ")); // → P001, P002
console.log(ids.join(", ")); // → P001, P002, P003
const removed = ids.splice(1, 1);
console.log(removed.join(", ")); // → P002
console.log(ids.join(", ")); // → P001, P003
```

Java 的 `subList` 是原列表的视图，而 JS `slice` 返回独立数组容器。名字接近不代表共享关系也相同。

需要保留原数组的反转或增删时，ES2023 还提供 `toReversed()` 和 `toSpliced(start, count, ...items)`。后者返回的是**修改后的完整新数组**，与 `splice` 返回删除项不同。它们和 `toSorted` 一样都已定稿，Node 24 可用。

### 复制数组以后，改对象仍要复制那一项

C05 讲过浅复制：新数组里保存原对象的引用。给 P002 补货，又希望保留旧数据时，用 `map` 替换目标商品，目标对象再用展开复制。

```js title="update-copy.js"
import { products } from "../shared/products.js";

const updated = products.map(product => product.id === "P002"
  ? { ...product, stock: product.stock + 3 }
  : product);
console.log(updated[1].stock, products[1].stock); // → 3 0
console.log(updated[1] === products[1]); // → false
console.log(updated[0] === products[0]); // → true
```

数组和 P002 对象是新的，其余商品继续共享。Java 新建 `ArrayList` 也仍共享元素；复制容器只隔离增删和顺序。

### 空位与显式的 `undefined` 不一样

**先猜一猜：** `new Array(3)` 是否相当于三个已初始化的元素？下面的回调会调用几次？

```js title="sparse.js"
const slots = new Array(3);
const mapped = slots.map(() => 0);
console.log(slots.length); // → 3
console.log(mapped[0], Object.hasOwn(mapped, 0)); // → undefined false
console.log(Object.hasOwn([undefined], 0)); // → true
console.log([...slots].map(() => 0).join(", ")); // → 0, 0, 0
```

`new Array(3)` 只有长度，三个下标位置都不存在，叫**空位**。`map` 跳过空位，回调调用 0 次，结果也留下空位；`[undefined]` 则确实有下标 0，只是值为 `undefined`。

展开或 `for...of` 读取空位时得到 `undefined`，所以 `[...slots]` 先得到三个真正的元素，接着 `map` 才执行三次。

Java 的 `new int[3]` 已填入三个 0，JS 的 `new Array(3)` 没做这件事。库存列表保持连续即可：从数据生成数组、用筛选移除商品。`delete products[1]` 只留下空位、长度仍为 6；移除元素用 `filter` 或 `splice`。

## 5. reduce：让上一步的结果进入下一步

[`reduce`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) 把一组元素累积成一个结果。回调前两个参数是「到目前为止的结果」和「当前元素」，返回值会成为下一次的累积结果。

```js title="totals.js"
import { products } from "../shared/products.js";

const totalStock = products.reduce((total, product) => total + product.stock, 0);
const totalValueCents = products.reduce(
  (total, product) => total + product.stock * product.priceCents, 0,
);
console.log(totalStock); // → 52
console.log(totalValueCents); // → 2634800
console.log((totalValueCents / 100).toFixed(2)); // → 26348.00
console.log([].reduce((total, product) => total + product.stock, 0)); // → 0
```

最后那个 `0` 是初始值。总件数依次经过 `0 → 12 → 12 → 19 → 22 → 47 → 52`。P002 的库存为 0，这一步也照常执行，只是总数不变。

库存价值是每件商品的「库存 × 单价」之和，单位一直是分；全部相加完成后才除以 100，显示为 `26348.00` 元。方法只负责累积，金额的单位由数据约定决定。

初始值还定义了空列表的答案：没有商品，总件数就是 0。如果省略初始值，`reduce` 会取第一个元素当累积结果，从第二项开始执行；商品数组的第一个元素是对象，并不是数字 0，空数组则直接抛 `TypeError`。这种统计统一显式给初始值，返回的类型和空列表行为都清楚。

Java 中可写 `mapToInt(Product::getStock).sum()`；JS 靠回调选择字段。需要多步分支时，也可回到普通循环。

## 常见错误与调试

### 商品有六项，map 后却只剩分隔符

**现象**：运行 `node labels-broken.js`，第一行打印 `6 undefined`，下一行只有五个 `|` 分隔符。程序正常结束。

:::tip[自己尝试 · 本地网页]
1. 在**仓库根目录**运行 `python3 -m http.server 8000 --bind 127.0.0.1`，让网页能读取共享数据目录。
2. 用 Chrome 打开 `http://127.0.0.1:8000/examples/c08/`，打开 DevTools。
3. 按下面的断点步骤看清回调，再修复 `labels-broken.js`，刷新网页。

预期：修复后第一行是 `6 P001：机械键盘`，第二行有六段商品文字。Node 中重新运行文件也得到相同结果。
:::

**工具**：在 Sources 文件树打开 `labels-broken.js`，单击模板字符串那一行的行号设断点，再刷新。浏览器会在第一次 `map` 回调中暂停。

```js title="labels-broken.js"
// 有问题的写法：带大括号的箭头函数漏了 return
import { products } from "../shared/products.js";

const labels = products.map(product => {
  `${product.id}：${product.name}`;
});
console.log(labels.length, labels[0]); // → 6 undefined
console.log(labels.join(" | ")); // →  |  |  |  |  |
```

**证据**：Scope 的 Local 中 `product.id` 为 `"P001"`，`product.name` 为 `"机械键盘"`。暂停时在 Console 求值模板字符串，得到正确文字；继续运行到回调结束，再在后面的 `console.log` 处暂停，`labels[0]` 却是 `undefined`。数据正常，丢的是回调返回值。

**原因**：箭头后面用了大括号，就进入函数体，必须显式 `return`。模板字符串表达式虽然算出了结果，却被丢弃。六次回调都返回 `undefined`，于是数组有六项，`join` 又把这些值显示成空字符串。

**修复**：在模板字符串前加 `return`，完整参考是 `labels-fixed.js`。也可以去掉大括号，写成表达式箭头函数。

```js title="labels-fixed.js"
import { products } from "../shared/products.js";

const labels = products.map(product => {
  return `${product.id}：${product.name}`;
});
console.log(labels.length, labels[0]); // → 6 P001：机械键盘
console.log(labels.join(" | "));
// → P001：机械键盘 | P002：无线鼠标 | P003：27 英寸显示器 | P004：USB-C 扩展坞 | P005：显示器支架 | P006：降噪耳机
```

**确认**：移除断点，刷新网页，Console 中出现六段商品文字；在终端重新运行修复后的文件，第一行也是 `6 P001：机械键盘`。

Java 的带代码块 lambda 同样要写 `return`，但目标返回类型常能让编译器发现遗漏。JS 的函数可以正常返回 `undefined`，因此还要核对回调输出。

## 练习

### 练习 1：预测数组与顺序

先写出四行输出，再在 `examples/c08` 运行 `node prediction.js`。验收时解释：为什么第二行不是数字升序，第三行为什么没有跟着变化。

```js title="prediction.js"
const stocks = [12, 0, 7];
const selected = stocks.filter(stock => stock > 0);
const labels = selected.map((stock, index) => `${index}:${stock}`);
console.log(labels.join(", "));
console.log(selected.sort().join(", "));
console.log(stocks.join(", "));
console.log([].every(stock => stock > 0));
```

<details>
<summary>提示</summary>

`filter` 给出新数组，下一步的下标从 0 开始。检查 `sort` 是否传了比较器，再看被排序的究竟是哪一个数组。

</details>

<details>
<summary>参考答案</summary>

四行依次是 `0:12, 1:7`、`12, 7`、`12, 0, 7`、`true`。默认排序比较 `"12"` 和 `"7"`，所以 12 在前；`selected` 和 `stocks` 是两个数组，排序只改变前者。最后一行没有遇到反例，因此为真。

</details>

### 练习 2：修好标签并保留原顺序

复制 `labels-broken.js` 为 `labels-answer.js`。先修回调，再让标签按库存升序输出。验收：第一段是 `P002：无线鼠标`，最后一段是 `P005：显示器支架`；额外打印原始 `products` 的 id，仍按 P001 到 P006 排列。

<details>
<summary>提示</summary>

先排序商品，再生成标签。变成字符串之后就读不到 `.stock` 了。保留原顺序用 `toSorted`，回调是否返回结果则单独检查。

</details>

<details>
<summary>参考答案</summary>

先用 `const ordered = products.toSorted((a, b) => a.stock - b.stock);`，再把 `labels-fixed.js` 中的 `products.map` 换成 `ordered.map`。打印 `products.map(product => product.id).join(", ")` 核对原始顺序。

排序后标签对应顺序为 P002、P004、P006、P003、P001、P005。复制排序保护数组顺序，显式 `return` 保证每次回调提供标签，这是两个独立的修复。

</details>

### 练习 3：按分类输出小报表

新建 `category-answer.js`，使用固定分类 `外设、显示器、配件、音频`，每类打印商品种数和库存件数。参考文件是 `category-report.js`，先自己写再打开。

验收：外设 2 种 / 12 件，显示器 1 种 / 7 件，配件 2 种 / 28 件，音频 1 种 / 5 件。增加分类「其他」时，输出 0 种 / 0 件。

<details>
<summary>提示</summary>

先遍历分类，每次用 `filter` 收集该组商品，`length` 得种数，带初始值的 `reduce` 得件数。售罄的 P002 仍是一种商品。

</details>

<details>
<summary>参考答案</summary>

```js title="category-report.js"
import { products } from "../shared/products.js";

const categories = ["外设", "显示器", "配件", "音频"];
const report = categories.map(category => {
  const group = products.filter(product => product.category === category);
  const stock = group.reduce((total, product) => total + product.stock, 0);
  return `${category}：${group.length} 种，${stock} 件`;
});
report.forEach(line => console.log(line));
```

输出依次是 `外设：2 种，12 件`、`显示器：1 种，7 件`、`配件：2 种，28 件`、`音频：1 种，5 件`。每个分类都筛出一个数组，这就是最直接的分组；分类很少时很容易读。空组的 `length` 和累加初始值都是 0，所以「其他」也自然得到正确结果。

</details>

## 项目进度

从 C07 的 [examples/inventory/01-core](https://github.com/socoo123/js_web/tree/main/examples/inventory/01-core) 继续。分类工厂、构造函数和 `count()` 保留，把 `Inventory` 的 `select` 换成 `filter`，再追加两个方法。下面只展示本次改动：

```js
  select(predicate) {
    return this.#products.filter(predicate);
  }
  sorted(compareFn) {
    return this.#products.toSorted(compareFn);
  }
  summary() {
    return this.#products.reduce((result, product) => {
      result.totalStock += product.stock;
      result.totalValueCents += product.stock * product.priceCents;
      result.soldOutCount += Number(product.stock === 0);
      result.lowStockCount += Number(product.stock > 0 && product.stock <= 5);
      return result;
    }, { totalStock: 0, totalValueCents: 0, soldOutCount: 0, lowStockCount: 0 });
  }
```

`summary` 一次遍历累计四个字段。每次调用创建新的初始对象，只修改本地结果；`return result` 把它交给下一次。布尔值经 `Number` 变成 0 或 1，用来计数。

`count()` 是商品种数，`summary().totalStock` 是件数。`select` 与 `sorted` 都返回新数组并保留对象引用，增删或排序不影响内部数组，改商品字段则仍共享变化。

在 `demo.js` 中保留已有导入、`inventory`、两个分类规则和六行输出。把原来收集分类 id 的空数组与循环替换为下面前两行，再把其余代码追加到文件末尾：

```js
const peripherals = inventory.select(isPeripheral).map(product => product.id);
const accessories = inventory.select(isAccessory).map(product => product.id);

const byStock = inventory.sorted((a, b) => a.stock - b.stock);
console.log("库存升序：", byStock.map(product => product.id).join(", "));
console.log("原始顺序：", inventory.select(() => true).map(product => product.id).join(", "));
const summary = inventory.summary();
console.log("总库存：", summary.totalStock);
console.log("库存总价值（分）：", summary.totalValueCents);
console.log("售罄 / 低库存：", summary.soldOutCount, summary.lowStockCount);
console.log("空库存统计：", JSON.stringify(new Inventory([]).summary()));
```

在终端进入 `examples/inventory/01-core`，运行 `node demo.js`。已有六行保持原结果，新增输出按下表核对：

| 输出 | 预期值 |
| --- | --- |
| 库存升序 | P002, P004, P006, P003, P001, P005 |
| 原始顺序 | P001, P002, P003, P004, P005, P006 |
| 总库存 | 52 |
| 库存总价值（分） | 2634800 |
| 售罄 / 低库存 | 1 2 |
| 空库存统计 | 四个字段均为 0 的 JSON 对象 |

阶段目录保存了完整文件。验收时再把比较器改成 `b.stock - a.stock`：第一项应变成 P005，原始顺序和统计仍保持一致。

## 小结

- 先看所需结果：变换用 `map`，筛选用 `filter`，找一个用 `find`，判断用 `some` / `every`。
- `sort` 默认按字符串排序且修改原数组；数字用比较器，保留输入顺序用 `toSorted`。
- 新数组只隔离容器，商品对象仍可能共享；修改某一项时再复制那个对象。
- 空位是下标不存在，`map` 会跳过；库存数据保持连续数组。
- `reduce` 把回调返回值传到下一步，显式初始值保证空数组也有明确结果。

自测：

1. 只想知道有没有低库存，为什么选 `some` 而不是先筛出全部？
2. 比较器为什么不能只返回 `a.stock > b.stock`？
3. 稳定排序和是否修改原数组，各自描述什么？
4. `toSorted` 后修改某件商品的库存，原数组为什么也可能看到变化？
5. 为什么 `new Array(3).map(() => 0)` 不能初始化三个 0？

下一课比较 Object、Map 和 Set，为库存建立 id 索引、按分类分组，并给标签去重。

## 延伸阅读

- [MDN：Array，复制方法与修改方法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN：map 与回调返回值](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN：sort、比较器与稳定性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN：toSorted](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [MDN：reduce 与初始值](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [Chrome DevTools：暂停后检查变量](https://developer.chrome.com/docs/devtools/javascript/reference#scope)
