---
title: C09 Object、Map、Set 与弱集合
description: 按业务选择字典与集合，用 Map 建商品索引和分类分组，用 Set 去重标签，理解对象身份、迭代与弱引用。
sidebar:
  order: 9
---

> **第 1 周 · 第 5 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C05、C07、C08 · 运行：Node 24 · 示例已运行验证

## 这一课解决什么问题

C08 已经能筛选、排序和统计商品。现在库存页还要做三件事：点商品编号时取出对应记录，按分类显示商品，以及生成没有重复项的标签筛选器。

反复按同一字段查询、按数据中的分类分组时，换一种组织方式，代码会更直接。

你可能顺手写出 `new Set(products)`，以为同一商品会自动合并；也可能把 Map 当对象，写了 `byId["P001"] = product`，却发现 `byId.size` 还是 0。选对容器以后，还要弄清它怎样判断「同一个」。

学完你能：

- 区分记录对象、键值字典和唯一值集合，按用途选择 Object、Map、Set
- 用字符串 id 建索引，解释对象键为什么按身份匹配
- 按数据中的分类分组，并保持分类第一次出现的顺序
- 给标签去重，读懂 `for...of`、展开与迭代器的关系
- 说明弱集合适合保存哪类附属信息，以及为什么不能遍历

例子在 [examples/c09](https://github.com/socoo123/js_web/tree/main/examples/c09)。沿用 C06 的 Node，进入该目录运行 `node id-index.js` 等文件。共享商品数据仍从 `../shared/products.js` 导入，保留仓库目录结构即可。

## Java 程序员先看这里

| Java | JavaScript | 一句话差异 |
| --- | --- | --- |
| DTO / POJO 的字段 | 普通对象的属性 | 适合描述一条商品记录，属性键是字符串或 Symbol |
| `HashMap` / `LinkedHashMap` | `Map` | JS Map 保持插入顺序，对象键按身份匹配，不调用 `equals` |
| `HashSet` / `LinkedHashSet` | `Set` | JS Set 保持插入顺序，两个同内容对象仍是两个成员 |
| `Iterable` / `Iterator` | 可迭代对象 / 迭代器 | JS 的 `next()` 一次返回 `{ value, done }` |
| `WeakHashMap` | `WeakMap` | 都能让键被回收；JS 弱集合不提供遍历和大小查询 |

## 1. Object 适合记录，Map 适合动态字典

商品的 `id`、`name`、`stock` 是已知字段，用对象表达很自然。字典则是「根据一个键找一个值」：商品 id 对应记录、分类对应一组商品。对象也能当字典，但要理解它的属性规则。

**先猜一猜：** 数字 `12` 和字符串 `"12"` 能在普通对象里各占一个位置吗？先添加 `"12"` 再添加 `"3"`，遍历时谁在前？

```js title="object-dictionary.js"
const labels = {};
labels[12] = "数字键";
labels["12"] = "文本键";
console.log(Object.keys(labels).length, labels[12]); // → 1 文本键
console.log(Object.hasOwn(labels, "toString"), typeof labels.toString); // → false function

const counts = { "12": "十二件", "3": "三件", note: "单位：件" };
console.log(Object.keys(counts).join(", ")); // → 3, 12, note
const dictionary = Object.create(null);
dictionary.toString = "自定义标签";
console.log(Object.hasOwn(dictionary, "toString")); // → true
```

对象的属性键只有字符串和 Symbol。数字 `12` 转成 `"12"`，第二次赋值就覆盖第一次。[`Object.keys`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) 返回自身可枚举的字符串属性名；像数组下标的键先按数字升序排列，普通字符串键再按创建顺序排列，所以结果是 `3, 12, note`。

`toString` 来自 C07 的原型链。虽然 `Object.hasOwn` 返回 `false`，读取它仍能拿到函数。需要判断自己的字段时，用 [`Object.hasOwn`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)；`Object.create(null)` 则创建没有原型的字典，里面的名字全部由你添加。它仍遵守字符串 / Symbol 键的规则。

Java 的 `Map<Integer, String>` 能保留整数键；JS 对象会先把这个键变成字符串。

选型先看数据含义：

| 需求 | 容器 | 原因 |
| --- | --- | --- |
| 一条商品记录、配置、JSON 数据 | Object | 用命名字段表达一条记录 |
| 根据 id 查商品、根据分类取一组商品 | Map | 键动态增删，有明确的查询接口 |
| 唯一标签、已选中的商品 id | Set | 只关心某个值是否存在 |
| 展示商品列表并按位置排序 | Array | 位置、重复项和顺序都有业务意义 |

## 2. Map：键和值分开，按键直接查询

### 常用操作与插入顺序

[`Map`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map) 接收一组 `[key, value]`。`set` 保存条目，`get` 取值，`has` 判断键存在，`size` 读条目数。下面在 P001 原库存 12 的基础上模拟补货 3 件。

```js title="map-operations.js"
const stocks = new Map([["P001", 12], ["P002", 0]]);
stocks.set("P001", 15);
console.log(stocks.size, stocks.get("P001")); // → 2 15
console.log(stocks.has("P002"), stocks.get("P002")); // → true 0
console.log(stocks.has("P999"), stocks.get("P999")); // → false undefined
console.log([...stocks.keys()].join(", ")); // → P001, P002
console.log(stocks.delete("P001")); // → true
stocks.set("P001", 15);
console.log([...stocks.keys()].join(", ")); // → P002, P001
stocks.clear();
console.log(stocks.size); // → 0
```

第一次 `set("P001", 15)` 更新旧键，条目数仍是 2，位置也不变。删除后重新加入，P001 才排到末尾：顺序跟随当前条目的插入历史。Java 的普通 `HashMap` 不保证这个顺序，最接近这里的是默认按插入顺序维护的 `LinkedHashMap`。

`get` 查不到时返回 `undefined`。判断存在用 `has`，库存为 0 的 P002 也会返回 `true`。Map 允许把 `undefined` 存成值，这时 `get` 的结果与缺失相同，`has` 仍能区分。

[`set`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/set) 返回当前 Map，`delete` 返回是否确实删掉条目，`clear` 清空全部条目并返回 `undefined`。JS 用 `.size` 属性读大小，对应 Java 集合的 `size()`。

### 对象键按身份匹配

Map 可以用任何值作键，数字和字符串也能各占一个位置。对象键匹配的依据是引用身份。

**先猜一猜：** `copied` 的字段完全一样，能拿到原来的备注吗？

```js title="key-identity.js"
const keyboard = { id: "P001", stock: 12 };
const copied = { ...keyboard };
const notes = new Map([[keyboard, "待盘点"]]);
console.log(notes.get(keyboard)); // → 待盘点
console.log(notes.get(copied)); // → undefined
notes.set(copied, "另一个对象");
console.log(notes.size); // → 2
console.log(new Map([[12, "数字"], ["12", "文本"]]).size); // → 2
```

`keyboard` 和 `copied` 是两个对象，所以是两个键。即使给对象添加一个叫 `equals` 的方法，Map 也不会调用它。Java 的 `HashMap` 通过 `equals` / `hashCode` 确定键是否相同；JS Map 的对象键更接近 Java `IdentityHashMap` 的身份比较。

重新解析 JSON 得到的对象也无法命中原对象键。业务上找「同一件商品」用稳定的字符串 id；备注属于某个具体实例时，才用对象作键。

### 按 id 建一次索引

把商品列表变成 `[id, product]` 对，再交给 Map，就得到商品索引。索引负责查询，数组继续负责展示顺序。

```js title="id-index.js"
import { products } from "../shared/products.js";

const byId = new Map(products.map(product => [product.id, product]));
console.log(byId.size); // → 6
console.log(byId.get("P004").name); // → USB-C 扩展坞
console.log(byId.get("P999")); // → undefined
console.log(byId.get("P001") === products[0]); // → true
console.log(JSON.stringify(byId)); // → {}
console.log(JSON.parse(JSON.stringify([...byId])).length); // → 6
```

`map` 返回的每个二元数组都以 id 为键、商品为值。同一个 id 出现两次，后面的值覆盖前面的值，条目数会少于商品数。项目部分会在入口拒绝重复 id。

[`get`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/get) 返回保存的对象引用。改 `stock`，数组和索引都会看到变化；替换整个商品对象或更换 id，则要同步更新索引。项目这一阶段把 id 作为固定身份使用。

`find` 每次从头寻找；建索引需先遍历并额外存储关联，适合之后多次查询。标准要求 Map 的平均访问时间优于线性，具体实现可以不同。一次性查六条数据，用 `find` 也很清楚。

最后两行回到 JSON：默认 `JSON.stringify` 读取自身可枚举的字符串属性，Map 条目不在这一层，所以得到 `{}`。字符串 id 的索引可转成 `[...byId]` 保存，解析后用 `new Map(entries)` 重建。项目直接保存商品数组，加载后重新建索引。

### 分类分组：一个键对应一个数组

C08 是先列出四个分类，再逐类筛选。现在让分类从商品数据中产生：第一次遇到分类就建空数组，后面的同类商品追加到已有数组。

```js title="grouping.js"
import { products } from "../shared/products.js";

const groups = new Map();
for (const product of products) {
  if (!groups.has(product.category)) groups.set(product.category, []);
  groups.get(product.category).push(product);
}
for (const [category, group] of groups) {
  const stock = group.reduce((total, product) => total + product.stock, 0);
  console.log(`${category}：${group.length} 种，${stock} 件`);
}
// → 外设：2 种，12 件
// → 显示器：1 种，7 件
// → 配件：2 种，28 件
// → 音频：1 种，5 件
```

关键是 `has` 那个判断：每个分类只创建一次数组。`get` 返回这同一个数组，`push` 将商品放进去。P002 虽然售罄，仍是外设的一种商品，所以外设有 2 种、12 件。

分类顺序来自 P001、P003、P004、P006 的首次出现。列表里没有「其他」，Map 就没有这个键；需要显示空分类时，可先为固定分类建立空数组。

`for...of groups` 每次拿到一个键值对，再解构两项。Java 可对照 `entrySet()` 和 `computeIfAbsent`，这里用显式循环看清过程。

## 3. Set：保存唯一值，先选准去重的单位

[`Set`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set) 只存值，值本身就是判断是否重复的依据。生成标签筛选器时，要加入单个标签字符串。

```js title="tags.js"
import { products } from "../shared/products.js";

const tags = new Set();
for (const product of products) {
  for (const tag of product.tags) tags.add(tag);
}
tags.add("热销");
console.log(tags.size, tags.has("新品")); // → 2 true
console.log([...tags].join(", ")); // → 热销, 新品
console.log(tags.delete("新品")); // → true
console.log([...tags].join(", ")); // → 热销
tags.clear();
console.log(tags.size); // → 0
```

六件商品有五次标签记录，但只有「热销」「新品」两个值。重复 `add` 不增加成员，也不改变位置。第一次遇到热销在前，新品在后，展开成数组仍保持这个顺序。`delete`、`has`、`clear` 的含义与 Map 相似，`add` 返回当前 Set。

空的 `tags` 数组使内层循环执行零次，自然不会产生空标签。`[...tags]` 得到普通数组，接下来就能用 C08 的 `map` 或排序生成界面。

Java 的 `LinkedHashSet<String>` 与这个标签集合很接近。迁移到对象集合时，需要再检查相等规则。

### 相同 id 的两个对象仍然是两个成员

Set 与 Map 使用同一套相等规则：**SameValueZero**。可以把它记成 `===`，再补一条：`NaN` 和 `NaN` 也算相同；`0` 与 `-0` 和 `===` 一样，算相同。

```js title="set-equality.js"
const first = { id: "P001" };
const second = { id: "P001" };
console.log(new Set([first, first, second]).size); // → 2
console.log(new Set([first.id, second.id]).size); // → 1
console.log(new Set([NaN, NaN, 0, -0]).size); // → 2
console.log(new Map([[NaN, "无效输入"]]).get(NaN)); // → 无效输入
```

同一个 `first` 加两次，只占一个位置；新对象 `second` 另占一个。先投影为 `id`，才变成按业务编号去重。

Java 对象可覆盖 `equals` 按字段去重，JS 要显式选择 id 或比较字段。

## 4. 迭代协议：for...of 和展开怎样取到元素

数组、Map、Set 都能用 `for...of`，因为它们是**可迭代对象**：提供 `[Symbol.iterator]()` 方法，调用后得到**迭代器**。迭代器的 `next()` 返回本次的 `value` 和表示结束的 `done`。

```js title="iteration.js"
const tags = new Set(["热销", "新品"]);
const iterator = tags[Symbol.iterator]();
const first = iterator.next();
console.log(first.value, first.done); // → 热销 false
console.log([...iterator].join(", ")); // → 新品
console.log(iterator.next().done); // → true
console.log([...tags].join(", ")); // → 热销, 新品
const counts = { 外设: 2, 显示器: 1 };
for (const [category, count] of Object.entries(counts)) {
  console.log(category, count);
}
// → 外设 2
// → 显示器 1
```

第一次 `next()` 已取走「热销」，展开这个迭代器只剩「新品」，读完再调用得到 `done: true`。展开 `tags` 则获取新迭代器，两项都在：读取位置在移动，Set 成员没有被删除。

Java 的 `Iterator` 也有读取进度；JS 把 `hasNext()` 与 `next()` 的结果合在一个返回对象里。

[`迭代协议`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols) 把「怎样依次读取」统一起来，具体每次读什么由容器决定：

| 对象或方法 | 每次得到什么 |
| --- | --- |
| Array、Set | 一个元素值 |
| Map、`map.entries()` | `[key, value]` 二元数组 |
| `map.keys()` | 一个键 |
| `map.values()` | 一个值 |
| `Object.entries(object)` | 先返回键值对数组，再遍历数组 |

普通对象默认没有迭代方法，`for...of counts` 会抛 `TypeError`。用 [`Object.entries`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) 转成自身可枚举的字符串键值对数组即可。`for...in` 读属性名，还会沿原型链查找；Map / Set 的条目统一用 `for...of`。

## 5. WeakMap 与 WeakSet：给对象附加信息

弱集合适合保存「跟随某个对象存在的附属信息」。例如导入库存时，对一份固定商品快照只检查一次：WeakSet 记住检查过哪些对象，WeakMap 保存对应的检查结果。

```js title="weak-metadata.js"
const reasons = new WeakMap();
const checked = new WeakSet();
function checkOnce(product) {
  if (checked.has(product)) return reasons.get(product);
  const reason = product.stock === 0 ? "待补货" : "有货";
  reasons.set(product, reason);
  checked.add(product);
  return reason;
}
const mouse = { id: "P002", stock: 0 };
console.log(checkOnce(mouse)); // → 待补货
console.log(checkOnce(mouse)); // → 待补货
console.log(checked.has({ ...mouse })); // → false
console.log(checked.has(mouse)); // → true
```

`mouse` 没有增加业务字段，检查结果保存在它外面。第二次传入同一个对象直接取结果，复制对象则没有这个标记。这份快照保持不变；补货后若复用原对象，应先用 `checked.delete(mouse)` 和 `reasons.delete(mouse)` 清除记录，再检查。

[`WeakMap`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) 对键保持弱引用：当其他地方都不再持有这个对象时，这份附属记录不会阻止它被垃圾回收。[`WeakSet`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) 对成员也采用弱引用。本例的 `mouse` 仍被变量引用，当然仍可查询；回收时间由运行时决定。

它们只提供拿着某个键或成员进行查询的能力：WeakMap 用 `set/get/has/delete`，WeakSet 用 `add/has/delete`。它们没有 `size`、`keys()`、`values()`、`clear()`，也不支持 `for...of`。如果允许列出当前成员，程序就能观察到垃圾回收何时发生，结果会随回收时机变化，所以 API 隐藏了成员列表。

本课用对象作弱键或成员，标准也允许非注册 Symbol；字符串 id、数字、`null` 都不满足要求。按 id 建索引、列出商品、统计总数时，选 Map / Set。

Java 的 `WeakHashMap` 也允许弱键被回收，但有遍历接口，键的相等规则也不同。

## 常见错误与调试

### Map 展开看得到商品，size 却是 0

**现象**：运行 `node index-broken.js`，输出 `0 undefined` 和 `true`。调试器展开 `byId` 又能看见 P001，像是 Map 的查询坏了。

```js title="index-broken.js"
// 有问题的写法：把 Map 条目写成了普通对象属性
import { products } from "../shared/products.js";

const byId = new Map();
for (const product of products) byId[product.id] = product;
console.log(byId.size, byId.get("P001")); // → 0 undefined
console.log(Object.hasOwn(byId, "P001")); // → true
```

:::tip[自己尝试 · 本地网页]
1. 在**仓库根目录**运行 `python3 -m http.server 8000 --bind 127.0.0.1`。
2. 用 Chrome 打开 `http://127.0.0.1:8000/examples/c09/`，按 F12 打开 DevTools。
3. 按下面的断点步骤找原因，再修改 `index-broken.js` 并刷新。

预期：修复前输出 `0 undefined`、`true`；修复后输出 `6 机械键盘`、`false`。Node 中运行文件也得到相同结果。
:::

**工具**：在 Sources 文件树打开 `index-broken.js`，单击第一处 `console.log` 的行号设断点，再刷新。循环已经完成，暂停在读取索引之前。使用 [Scope 与暂停时的 Console](https://developer.chrome.com/docs/devtools/javascript/reference#scope) 检查 `byId`。

**证据**：在 Console 分别求值 `byId.size`、`byId.has("P001")`、`Object.hasOwn(byId, "P001")`，依次得到 `0`、`false`、`true`；`byId.P001.name` 却是 `"机械键盘"`。数据写进去了，但写在对象属性这一层。

**原因**：Map 实例本身也是对象，`byId[key] = value` 创建普通属性。Map 的键值条目由自己的接口管理，`get`、`has`、`size` 读取的是这一组条目。两种存放方式互不替代。

**修复**：写入改成 `byId.set(product.id, product)`，读取继续使用 `get`。参考文件如下：

```js title="index-fixed.js"
import { products } from "../shared/products.js";

const byId = new Map();
for (const product of products) byId.set(product.id, product);
console.log(byId.size, byId.get("P001").name); // → 6 机械键盘
console.log(Object.hasOwn(byId, "P001")); // → false
```

**确认**：删除断点，刷新网页，Console 显示 `6 机械键盘` 和 `false`；再运行 `node index-broken.js` 检查同一结果。新的 Map 里有六个条目，P001 已经作为键保存，普通属性层自然没有这个名字。

## 练习

### 练习 1：预测覆盖、顺序与身份

先写出四行输出，再在 `examples/c09` 运行 `node prediction.js`。验收：除了结果，还能解释第一次覆盖与删除后重加为什么顺序不同。

```js title="prediction.js"
const counts = new Map([["P001", 12], ["P002", 0]]);
counts.set("P001", 15);
console.log([...counts.keys()].join(", "));
counts.delete("P001");
counts.set("P001", 15);
console.log([...counts.keys()].join(", "));
console.log(new Set([{ id: "P001" }, { id: "P001" }]).size);
console.log(new Set([0, -0, NaN, NaN]).size);
```

<details>
<summary>提示</summary>

更新旧键保留原位置，删掉之后重加才是新插入。对象看身份，数字要单独考虑 `NaN` 与有符号的零。

</details>

<details>
<summary>参考答案</summary>

四行依次为 `P001, P002`、`P002, P001`、`2`、`2`。第三行创建了两个独立对象；第四行只有「零」和「NaN」两个不同成员。第一次 `set` 只改值，第二次删除后的 `set` 才改变位置。

</details>

### 练习 2：为什么标签去重后还是六项

复制 `tags-broken.js` 为 `tags-my-answer.js`。修成 `uniqueTags(items)` 函数，返回按首次出现顺序排列的字符串数组。

```js title="tags-broken.js"
// 有问题的写法：加入 Set 的是标签数组，而不是单个标签
import { products } from "../shared/products.js";

const tags = new Set(products.map(product => product.tags));
console.log(tags.size); // → 6
console.log(tags.has("热销")); // → false
```

验收：固定数据得到 `热销, 新品`，空商品数组得到空数组；重复调用不残留上一次的标签。尤其要解释 P002 与 P005 的空标签数组为什么也没合并。

<details>
<summary>提示</summary>

`map` 得到的是六个数组引用。Set 的一个成员应该是一条标签，逐个商品、逐个标签加入即可。Set 放在函数内部，每次创建新的结果。

</details>

<details>
<summary>参考答案</summary>

```js title="tags-answer.js"
import { products } from "../shared/products.js";

function uniqueTags(items) {
  const tags = new Set();
  for (const product of items) {
    for (const tag of product.tags) tags.add(tag);
  }
  return [...tags];
}
console.log(uniqueTags(products).join(", ")); // → 热销, 新品
console.log(uniqueTags([]).length); // → 0
```

原来的六个成员是六个独立数组，两个空数组也有不同身份。修复后加入的是字符串，内容相同就合并。空商品列表让外层循环执行零次，局部 Set 保持为空，因此返回空数组。

</details>

### 练习 3：给库存模块建立唯一索引

在项目阶段目录继续 C08，实现下一节的三个方法。先自己写，再对照参考实现。除了正常报告，还要满足：查询不存在的 id 返回 `undefined`；空库存返回空 Map 和空标签数组；同一个 id 出现两次时，构造函数抛出含有这个 id 的错误。

<details>
<summary>提示</summary>

索引在构造时建立。写入前用 `has` 查重；分类分组和标签结果则每次调用重新创建，避免调用方删掉结果后影响下一次查询。

</details>

<details>
<summary>参考答案</summary>

完整代码在 `examples/inventory/01-core/inventory.js`。进入 `examples/c09` 运行 `node project-check.js`，应打印「项目验收通过」。它还检查修改返回的分组和标签容器之后，下一次查询结果仍完整。

查重放在 `set` 前，因为 Map 允许覆盖，而库存要求一个 id 只对应一条记录。分组中的商品对象继续共享。

</details>

## 项目进度

从 C08 的 [examples/inventory/01-core](https://github.com/socoo123/js_web/tree/main/examples/inventory/01-core) 继续。在 `inventory.js` 的 `Inventory` 类中追加私有字段 `#byId`，替换构造函数，加入 `getById`。已有 `#products` 和其他方法保留：

```js
  #byId;
  constructor(products) {
    this.#products = [...products];
    this.#byId = new Map();
    for (const product of this.#products) {
      if (this.#byId.has(product.id)) throw new Error("重复商品 id：" + product.id);
      this.#byId.set(product.id, product);
    }
  }
  getById(id) {
    return this.#byId.get(id);
  }
```

固定数据构造出六条索引；重复 P001 时抛出 `Error: 重复商品 id：P001`。调用方通过 `getById` 拿商品，并处理缺失结果。

再在同一个类中加入分类分组和标签去重方法：

```js
  groupedByCategory() {
    const groups = new Map();
    for (const product of this.#products) {
      if (!groups.has(product.category)) groups.set(product.category, []);
      groups.get(product.category).push(product);
    }
    return groups;
  }
  uniqueTags() {
    const tags = new Set();
    for (const product of this.#products) {
      for (const tag of product.tags) tags.add(tag);
    }
    return [...tags];
  }
```

`groupedByCategory()` 返回 Map，值是商品数组；每次调用都新建 Map 和组数组。`uniqueTags()` 返回普通数组，方便展示。分类、标签来自当前数据，两个结果都不额外缓存。

`demo.js` 保留 C08 的全部输出，在末尾追加：按 P004 / P999 查询、遍历分类与种数、打印去重标签。完整追加代码已保存在阶段目录。

在终端进入 `examples/inventory/01-core`，运行 `node demo.js`，新增部分应得到：

| 输出 | 预期值 |
| --- | --- |
| 按 id 查找 | P004 USB-C 扩展坞 3 |
| 缺失商品 | undefined |
| 分类种数 | 4 |
| 分类与商品种数 | 外设 2、显示器 1、配件 2、音频 1，依次输出 |
| 去重标签 | 热销, 新品 |
| 空库存索引 / 分组 / 标签 | undefined 0 0 |

旧的报告仍有总库存 52、库存总价值 2634800 分、售罄 1 种、低库存 2 种。再运行 `node ../../c09/project-check.js`，检查空库存、重复 id 和返回容器被修改后的行为。

## 小结

- Object 描述命名字段；Map 保存动态键值关联；Set 保存唯一值；Array 管展示顺序。
- Map / Set 的对象按身份匹配。按同一件商品查询或去重，先选稳定的 id。
- 更新旧键保留位置，删除后重加进入末尾；分组时每类只创建一次数组。
- `for...of` 与数组展开读取迭代协议，迭代器有进度，普通对象用 `Object.entries` 转换。
- 弱集合适合跟随对象寿命的附属信息，只能拿已有对象查询，不能枚举或统计大小。

自测：

1. `byId["P001"] = product` 为什么不增加 Map 的大小？
2. 同样字段的两个对象，为什么能成为两个 Map 键、两个 Set 成员？
3. 商品已售罄时，判断它是否在 Map 中该用什么接口？
4. 为什么展开已经读过一项的迭代器，只能拿到剩余元素？
5. 库存索引为什么用 Map，检查标记为什么可以用 WeakSet？

下一课用 JS 写撤销栈、任务队列和分类树遍历，把这些容器用在操作历史与导航中。

## 延伸阅读

- [MDN：Map 的键、顺序与操作](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN：Set 与成员相等规则](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN：Object.entries](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
- [MDN：迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)
- [MDN：WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [MDN：WeakSet](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)
