---
title: C24 数组更新、key 与派生数据
description: 用不可变更新完成商品增删改与筛选，解释 key 如何关联组件状态，避免草稿错位和筛选结果滞后。
sidebar:
  order: 24
---

> **第 2 周 · 第 12 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C05、C08、C22、C23 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

机械键盘原有 12 件。你写下 products[0].stock += 1，再调用 setProducts(products)，页面仍显示 12。改成复制数组后看似能刷新，上一份数据里的库存却也变成了 13。

接着做行内编辑：第一行写「键盘待盘点」，第二行写「鼠标待盘点」。删除第一行后，第二行商品编号正确，输入框却留下了「键盘待盘点」。

最后给列表加搜索。补货后总库存增加了，搜索结果里的无线鼠标仍是 0 件。这三个问题分别要检查**引用、组件身份和数据来源**，都发生在同一份商品列表上。

学完你能：

- 用新数组和新商品对象更新 state，保留旧快照
- 用展开、map、filter 实现新增、修改和删除
- 解释索引 key 为什么会让编辑草稿跟错商品
- 从商品与筛选条件计算可见列表、排序和统计
- 判断哪些数据需要 state，哪些可以在渲染时算出来

例子在 [examples/c24](https://github.com/socoo123/js_web/tree/main/examples/c24)，完整 React 文件在[库存项目阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)。纯 JS 在 examples/c24 中用 node 运行；React 在阶段 4 目录执行 npm ci，再执行 `npm run dev -- --host 127.0.0.1`，打开终端给出的 /js_web/ 地址。

## Java 程序员先看这里

| Java 经验 | React 中的对应 | 差异 |
| --- | --- | --- |
| final List 仍能 add | const 数组仍能 push | React state 额外遵守只读约定，修改靠替换 |
| new ArrayList<>(old) | [...old] | 两者都是浅复制，元素对象仍然共享 |
| Stream.map/filter | 数组 map/filter | 新数组中的元素仍可能是旧对象，要复制被改的记录 |
| 数据库主键识别记录 | 列表 key 识别同级组件 | key 关联组件状态，不是数组位置，也不作为 prop 传入 |
| DTO 字段和查询结果 | 源 state 和派生数据 | 能从当前数据算出的结果，通常直接算，减少同步负担 |

## 1. 更新对象：保留旧快照，提交新引用

把 state 中已有的对象当作只读值。修改库存时创建一个新商品，再用 setter 提交它。[更新对象 state](https://react.dev/learn/updating-objects-in-state)

先在普通 JS 中观察一次对象替换：

```js title="object-copy.js"
import { products } from "../shared/products.js";

const before = products[0];
const after = { ...before, stock: before.stock + 1 };
console.log(before.stock, after.stock); // → 12 13
console.log(before === after); // → false
console.log(before.tags === after.tags); // → true
```

展开语法先复制旧字段，后面的 stock 覆盖同名字段。结果是两份不同的商品对象；旧商品仍是 12，新商品是 13。顺序要写对：`{ stock: 13, ...before }` 会被旧 stock 覆盖回 12。

tags 仍是同一个数组，因为展开只复制一层。这没有问题：本次只改 stock，tags 保持只读即可。以后改 tags 时，再为那一层创建新数组。

在组件中，对象 state 可以写 `setProduct(pending => ({ ...pending, stock: pending.stock + 1 }))`。箭头函数返回对象时，外层圆括号让花括号按对象表达式解析。setter 接收完整下一值，useState 不会自动把你传入的少数字段合并进去；只传 `{ stock: 13 }` 会把 name、id 等字段丢掉。

### 为什么直接改字段，页面可能没反应

labs/MutationBroken.jsx 中的处理函数是：

```jsx
// 有问题的写法：直接修改 state，再提交同一个数组。
function handleRestock() {
  products[0].stock += 1;
  setProducts(products);
}
```

从 12 件点「给键盘补 1 件」，页面仍是 **12 件**。字段确实被改成了 13，但传给 setter 的仍是原数组。React 用 Object.is 比较前后 state；引用相同，便可以跳过这次界面更新。[useState 的相同值检查](https://react.dev/reference/react/useState#ive-updated-the-state-but-the-screen-doesnt-update)

即使稍后另一个操作触发渲染，让 13 显示出来，旧数据被修改的问题仍然存在。修复要同时满足「用 setter 提交」和「保留旧数据」。

Java 对照：给可变对象赋字段在语言层面完全合法；React 额外要求把已经存入 state 的值当作只读，后续改动以新值表达。

## 2. 数组更新：复制到真正变化的那一层

只复制数组外壳，保护不了其中的商品。**先猜一猜：** 下面 before 中的键盘，最后是 12 还是 13？

```js title="shallow-broken.js"
// 有问题的写法：只复制数组，商品对象仍与原数组共享。
import { products } from "../shared/products.js";

const before = structuredClone(products);
const after = [...before];
after[0].stock += 1;
console.log(before === after); // → false
console.log(before[0] === after[0]); // → true
console.log(before[0].stock, after[0].stock); // → 13 13
```

after 是新数组，after[0] 却仍然指向 before[0]。改字段影响的是同一个商品。

正确更新需要两层新引用：**数组是新的，被修改的商品也是新的**。没改的商品可以继续共享。

```js title="immutable-update.js"
import { products } from "../shared/products.js";

const after = products.map((product) => product.id === "P001"
  ? { ...product, stock: product.stock + 1 }
  : product);
console.log(products[0].stock, after[0].stock); // → 12 13
console.log(products === after); // → false
console.log(products[0] === after[0]); // → false
console.log(products[1] === after[1]); // → true
```

map 创建新数组；匹配 P001 时创建新记录，其余位置原样返回。

给 P002 加标签时，复制「商品数组 → P002 对象 → tags 数组」。只复制外层再对 tags 调用 push，仍会修改共享数组。

对照 Java：复制集合后修改某个元素，也会影响原集合持有的同一对象。Java Stream 返回新集合，同样不自动复制元素。

### 把增、改、删写成数组变换

C08 的方法在这里直接派上用场。已有 state 使用左边的操作意图，返回右边的新值：[更新数组 state](https://react.dev/learn/updating-arrays-in-state)

| 意图 | 推荐表达式 | 结果 |
| --- | --- | --- |
| 追加商品 | [...pending, newProduct] | 新数组，末尾多一个元素 |
| 按 id 修改 | pending.map(...) | 匹配的记录返回新对象 |
| 按 id 删除 | pending.filter(p => p.id !== id) | 新数组，去掉匹配项 |
| 调整顺序 | [...pending].sort(compare) | 排序副本，保留原顺序 |

项目的补货函数在 src/product-state.js 中。它返回数据，事件函数再把它接到 setter：

```js
export function restockProduct(items, id) {
  return items.map((product) => product.id === id
    ? { ...product, stock: Math.min(product.stock + 1, 99999) }
    : product);
}
```

P002 从 0 变成 1，P001 仍是 12，旧数组里的 P002 仍是 0。上限沿用 99,999，页面到达上限时禁用补货按钮。接线是 `setProducts(pending => restockProduct(pending, id))`，沿用 C23 的待处理状态；函数内部保持纯粹。

删除也按 id，而不是按「当前第几行」。列表一排序，位置就会改变；用户点的是鼠标，更新条件就应该是鼠标的 id。map 的回调要返回每个位置的新值，遗漏未匹配分支会制造 undefined 元素。

新增商品先确定 id 和字段，再放进数组。项目使用当前编号最大值加一、补齐三位数字，初次新增得到 P007；新记录默认是「新商品」、配件、0 件、0 分、空标签。本地练习删除末尾后可复用编号；真实业务的长期标识通常由后端分配。id 在创建记录时确定，后续渲染继续使用它。

## 3. key：组件状态跟随身份，而不是显示位置

React 在两次渲染之间需要匹配「哪一行还是之前那一行」。同一父节点下，稳定的 key 配合组件类型，让 React 在列表位置变化时关联原来的组件状态。[渲染列表](https://react.dev/learn/rendering-lists)

用有草稿的行才能看清差别。labs/EditableRow.jsx 中每一行都有自己的 draft：

```jsx
import { useState } from "react";

export default function EditableRow({ product, onDelete }) {
  const [draft, setDraft] = useState(product.name);
  return (
    <article className="product-card">
      <p>商品：{product.id} · {product.name}</p>
      <label>草稿 {product.id}
        <input value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <button type="button" onClick={() => onDelete(product.id)}>删除 {product.id}</button>
    </article>
  );
}
```

输入框显示 draft，输入事件写回 draft；初始商品名只用于初始化。草稿是尚未保存的用户输入，与已保存商品名分开有意义。

错误列表把索引当成 key：

```jsx
// 有问题的写法：删除第一行后，相同索引对应了另一件商品。
products.map((product, index) =>
  <EditableRow key={index} product={product} onDelete={handleDelete} />
);
```

**先猜一猜：** 初始三行是 P001、P002、P003。第一行草稿改为「键盘待盘点」，第二行改为「鼠标待盘点」。删除 P001，第一行输入框里还剩什么？

答案是 **键盘待盘点**。现在这一行明明显示 P002 无线鼠标，draft 却来自旧第一行。对 React 来说，key=0 的 EditableRow 仍然存在，只是它的 product prop 换成了 P002。旧 draft 因此留在这个组件中。

| 时刻 | 第一行的 key | 第一行 product.id | 第一行 draft |
| --- | --- | --- | --- |
| 删除前 | 0 | P001 | 键盘待盘点 |
| 删除后 | 0 | P002 | 键盘待盘点 |
| 改用 id 后，删除 P001 | P002 | P002 | 鼠标待盘点 |

正确列表用商品本身的稳定编号：

```jsx
products.map((product) =>
  <EditableRow key={product.id} product={product} onDelete={handleDelete} />
);
```

P001 被移除时，它的组件和草稿一起移除；P002 移到第一行，仍对应原来的 key=P002，草稿保留为「鼠标待盘点」。

:::tip[自己尝试 · 本地 React]
1. 启动阶段 4 dev 服务，打开 /js_web/labs/arrays.html?case=keys。
2. 修改 P001、P002 的草稿，分别写「键盘待盘点」「鼠标待盘点」，再删除 P001。
3. 打开同路径的 case=keys-answer，重复输入和删除。

预期：错误版 P002 的草稿变成「键盘待盘点」；正确版仍是「鼠标待盘点」。
:::

key 放在 map 直接返回的元素上。外面多包一层 div，就应给那个 div 设置 key。key 只需在同级列表中唯一；另一个列表可以有相同 key。组件里需要编号时，从 product.id 或独立 id prop 读取，key 本身不会作为普通 prop 传入。

每次渲染生成随机 key 会重建组件，输入随之重置。即使业务 id 稳定，某行被筛选移出渲染树后也会卸载，再显示时重新建立局部 state；key 不是跨卸载保存草稿的仓库。

Java 对照：可以用主键匹配记录来理解 key；React 用它进一步匹配界面组件的状态。数组下标只描述此刻的位置，排序、插入、删除都会改变这个位置。

## 4. 派生数据：保存来源，在渲染时计算结果

商品数组和用户输入的条件需要记住；可见列表、总库存、总价值可以直接从它们算出来。这些计算结果叫**派生数据**。[选择 state 结构](https://react.dev/learn/choosing-the-state-structure)

下面这个错误让无线鼠标补货后仍显示 0：

```jsx
// 有问题的写法：筛选结果另存一份 state，只在首次渲染初始化。
const [products, setProducts] = useState(() => structuredClone(initialProducts));
const [visibleProducts] = useState(() => products.filter((product) => product.name.includes("鼠标")));
```

补货函数正确地产生了新的 P002 对象。但 visibleProducts 还指向第一次筛选得到的旧 P002，两份 state 已经分开。labs/DerivedBroken.jsx 中点一次「给鼠标补 1 件」，原始库存是 **1 件**，筛选库存仍是 **0 件**。

直接计算能让列表始终来自当前这一份商品：

```jsx
const [products, setProducts] = useState(() => structuredClone(initialProducts));
const [query, setQuery] = useState("");
const [category, setCategory] = useState("全部");
const [order, setOrder] = useState("id");
const visibleProducts = selectProducts(products, { query, category, order });
const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
const totalCents = products.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
```

初始总库存为 **52 件**、总价值 **26348.00 元**。搜索「鼠标」后只有一个可见商品，总库存仍是 52，因为统计来自全部 products。给鼠标补一件，可见库存立即为 1，总库存为 53，总价值为 26477.00 元。

「当前筛选统计」也能做，只需明确改为从 visibleProducts 计算。关键是统一口径，而不是看到数字变化就认为统计正确。visibleProducts、totalStock、totalCents 都无需 setter。

### 排序副本，保留源数组

src/product-state.js 的 selectProducts 先按名称、分类 filter，再复制结果并排序。库存和价格用数字比较，数值相同再按 id 排序；源 products 的顺序保持原样。

直接在渲染中写 products.sort(...)，会改动 state 原数组。默认 sort 还按字符串比较，库存 12 可能排在 3 前面；这里要传 `(a, b) => a.stock - b.stock`。filter 产生的也是浅数组，排序这个数组不会修改商品字段，但在结果上继续改 product.stock 仍然会碰到共享对象。

计算每次随渲染执行，对于六件商品很直接。为这些结果再加 Effect 和 setter，会增加一次同步过程；当前渲染已经拥有全部输入，可以当场算完。[可能不需要 Effect](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

Java 对照：像用当前输入得到局部查询结果，省去维护长期缓存字段的同步责任。

## 常见错误与调试

### 补货调用了 setter，页面仍是 12

**现象**：打开 /js_web/labs/arrays.html?case=mutation，点「给键盘补 1 件」，页面仍是 12。

**工具**：DevTools → Sources，找到 labs/MutationBroken.jsx，在 products[0].stock += 1 那一行设断点。点击按钮，Step over 到 setProducts 前；暂停时打开 Console 求值。

**证据**：products[0].stock 已是 13，页面仍是 12。再逐步执行 setter，它接收的就是当前 products，引用没有变。若只复制数组再改元素，比较新旧数组第一个元素会得到 true。

**原因**：相同数组引用可能跳过更新；浅复制后的字段赋值又会破坏旧快照。

**修复**：把两行替换为 `setProducts(pending => restockProduct(pending, "P001"))`，并从 ../src/product-state.js 导入函数。case=mutation-answer 是正确对照。

**确认**：刷新后连点两次，显示 13、14。阶段 4 中运行 npm run test:bug -- labs/arrays-bugs.test.jsx，第一项应通过；另外两项要修好各自问题后才通过。

### 删除后，商品名称和草稿不属于同一件商品

**现象**：按第 3 节输入草稿并删除 P001，P002 留下了键盘草稿。

**工具**：React DevTools → Components，搜索 EditableRow，选中删除后的第一行；展开 props 的 product 和 Hooks 中的 State。再到 Sources 查看 labs/IndexKeysBroken.jsx 的 map。

**证据**：product.id 是 P002，State 是「键盘待盘点」；商品 prop 正确，草稿 state 的身份关联出了错。

**原因**：删除后 key=0 继续存在，React 把旧第一行组件用于了鼠标。

**修复**：只把 key={index} 改成 key={product.id}，然后刷新再重做输入和删除。state 的初始值只执行初始化，给它加一个新的默认商品名并不能修正身份。

**确认**：P002 保留「鼠标待盘点」。上面的回归命令第二项通过；第三项则要把 DerivedBroken 的 visibleProducts 改为普通 filter 表达式。

## 练习

### 练习 1：新数组里的对象是谁

先写出三个输出，再运行 examples/c24/prediction.js 核对。它浅复制数组后替换 tags，再筛出售罄商品。

验收：写出对象身份、标签文本和两个数组长度，并解释哪一步修改了旧数据。

<details>
<summary>提示</summary>

数组复制、对象字段赋值和 filter 分别看。tags 换成了新数组，但对「把新数组写到哪个商品对象上」这一点，要继续追踪引用。

</details>

<details>
<summary>参考答案</summary>

输出是 true、待盘点、2 1。after 只复制外壳，after[1] 和 before[1] 是同一个 P002；给 after[1].tags 赋值也改了 before[1]。filter 创建一份长度为 1 的新数组，留下的仍是原商品对象。

保护旧数据要从商品数组、目标商品到 tags 逐层创建新值，见 tags-answer.js。未修改的 P001 可以继续共享。

</details>

### 练习 2：把三组错误修到回归全通过

起点为 labs/MutationBroken.jsx、IndexKeysBroken.jsx、DerivedBroken.jsx。先运行上面的 bug 回归，观察三项失败；按本课规则修复。

验收：键盘补货后显示 13；删除键盘后鼠标保留自己的草稿；鼠标补货后筛选库存为 1。另在浏览器输入两份不同草稿再删除，连续补货确认 0 → 1 → 2。

<details>
<summary>提示</summary>

三个修复点分别是：提交新数组及新记录；key 改用业务 id；删除多余 state，让筛选结果直接来自 products。

</details>

<details>
<summary>参考答案</summary>

MutationFixed、StableKeys、DerivedFixed 是对应完整答案。第一处使用 restockProduct，第二处用 product.id，第三处用 `const visibleProducts = products.filter(...)`。

修好后原命令三项通过。

</details>

### 练习 3：增加「仅看售罄」条件

从阶段 4 的 src/App.jsx 和 src/product-state.js 开始，新增布尔 state onlySoldOut；工具栏加一个切换按钮，筛选时组合这个条件。

验收：初始仅显示 P002；补一件后列表立即为空，总库存为 53；关闭条件恢复六件，P002 仍是 1。不要另存 soldOutProducts 数组。

<details>
<summary>提示</summary>

只保存用户选择的开关，商品是否售罄由 product.stock === 0 判断。按钮事件可以用 setOnlySoldOut(value => !value)。

</details>

<details>
<summary>参考答案</summary>

给 selectProducts 的选项增加 onlySoldOut=false，在原 filter 的条件末尾加 `&& (!onlySoldOut || product.stock === 0)`。App 调用时传入该开关，按钮文字根据开关显示「显示全部库存」或「仅看售罄」。

用户改变开关，或补货改变 products，都会重新计算同一个派生列表。没有第二份数组需要手动清空，隐藏商品也不会从源数据中丢失。

</details>

## 项目进度

从 C23 的 examples/inventory/04-react 继续。src/App.jsx 保存 products、query、category、order 四份来源状态，盘点计数仍由 InventoryCounter 自己保存；商品业务更新集中在新文件 src/product-state.js。

src/ProductList.jsx 继续使用 product.id 作为 key，并把 onRestock、onDelete 传给 ProductCard。卡片点击时回传 id，App 通过函数式更新修改整份商品数组。首页展示全部库存统计，工具栏展示匹配商品数量；

新增按钮使用固定默认字段，补货改库存，删除移除记录，名称搜索与分类完成查询，排序仅改变显示顺序。完整商品编辑表单在下一课加入。所有变化目前只在内存中，刷新恢复初始六件商品。

:::tip[自己尝试 · 本地 React]
1. 刷新首页，确认 6 种、52 件、26348.00 元。
2. 搜索「鼠标」，补 1 件；清空搜索，切到「外设」，再按库存升序排列。
3. 删除 P001，切回全部分类；新增两次，观察 P007、P008。

预期：补货后总库存 53、总价值 26477.00 元；删除键盘后为 41 件、21689.00 元；两次新增后为 7 种商品，库存和总价值保持 41、21689.00。清空搜索和分类后才能看到全部七件。
:::

阶段 4 中执行 npm test、npm run build，再用 npm run preview -- --host 127.0.0.1 查看生产预览。实验页只由 dev 服务提供。

第二周结束时，分别运行阶段 1 的 node demo.js、阶段 3 的 npm run report 和 npm test，确认固定业务统计与测试结果。再回到原生库存页，完成一次编辑、刷新和坏存储恢复。配合[Java ↔ JS 速查](../../reference/java-js/)检查自己仍会带入哪些 Java 习惯。

## 小结

- state 中的对象和数组按只读处理；更新时创建新值，保留旧快照。
- map 修改目标记录，filter 删除记录；复制数组不会自动复制商品。
- 稳定 key 关联同级组件身份；索引会随删除、插入、排序改变含义。
- 只保存商品和用户条件，列表、排序结果与统计从当前来源计算。
- 业务操作按商品 id 定位；筛选负责显示，商品数组负责保存完整数据。

自测：

1. 为什么 [...products] 后修改 next[0].stock 仍会改到旧快照？
2. 给商品 tags 加一项，需要在哪几层创建新值？
3. 删除第一行后，索引 key 为什么会保留错误的 draft？
4. 为什么商品名草稿可以有 state，过滤后的商品列表通常无需 state？
5. 为什么只看鼠标时，总库存仍可以显示全部六件商品的统计？

下一课把商品编辑做成表单，处理文本到数字的转换、字段校验和键盘操作。

## 延伸阅读

- [React：更新对象 state](https://react.dev/learn/updating-objects-in-state)
- [React：更新数组 state](https://react.dev/learn/updating-arrays-in-state)
- [React：渲染列表与 key](https://react.dev/learn/rendering-lists)
- [React：选择 state 结构](https://react.dev/learn/choosing-the-state-structure)
- [React：保留和重置 state](https://react.dev/learn/preserving-and-resetting-state)
- [React：可能不需要 Effect](https://react.dev/learn/you-might-not-need-an-effect)
