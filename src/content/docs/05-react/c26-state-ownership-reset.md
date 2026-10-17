---
title: C26 状态提升、保留与重置
description: 找到共享状态的共同父节点，用回调协调列表与统计，按组件位置、类型和 key 决定商品草稿何时保留或重置。
sidebar:
  order: 26
---

> **第 3 周 · 第 13 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C22–C25 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

给鼠标补 1 件，卡片显示 1，总库存却还是 52。你把库存放进了卡片自己的 state，统计读的仍是父组件里的商品。

把编辑表单移到列表旁边后，又出现一个问题：先改键盘名称，再选择鼠标，标题变成「编辑 P002」，输入框却还是键盘的草稿。props 已经更新，表单的 state 为什么没跟着更新？

这两件事分别要回答：一份状态由谁保存，以及 React 在什么情况下继续使用原来的状态。

学完你能：

- 找到需要协调的组件，把共享状态放在最近的共同父节点
- 用 props 向下传值，用事件回调上报操作，避免两个组件各存一份业务数据
- 只保存商品 id，计算当前商品与统计，分清草稿和已保存记录
- 根据树中的位置、组件类型与 key，预测状态何时保留或重置
- 为单一编辑区实现明确的草稿策略，并解释此时为何直接传 props 就够用

纯 JS 示例在 [examples/c26](https://github.com/socoo123/js_web/tree/main/examples/c26)，组件和实验在[库存项目阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)。在阶段 4 目录运行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

打开终端给出的 /js_web/ 地址。实验页在后面加 labs/ownership.html?case=实验名；每次重新预测先刷新页面。

## Java 程序员先看这里

| Java 经验 | React 中的对应 | 差异 |
| --- | --- | --- |
| 多个界面读取同一模型 | 共同父节点保存业务 state | 子组件通过回调请求更新，setter 安排重新渲染 |
| 选中对象存一个引用 | 保存 selectedId，再查当前记录 | 不可变更新会替换记录，旧引用可能停在旧快照 |
| 构造时给字段初值 | useState 的初始值 | 组件继续保留时，新的 props 不会重新初始化 state |
| new 一个对象得到新实例 | 在树中挂载组件 | 每次执行组件函数不等于重新挂载 |
| Map 按商品编号保存草稿 | 在父节点保存按 id 索引的草稿 | key 负责组件身份，草稿缓存要单独设计 |

## 1. 状态提升：让卡片和统计读同一份商品

**两个组件需要一起变化，就把它们依赖的状态交给最近的共同父节点。** 子组件获得当前值，也获得一个可以调用的事件函数。[共享组件间的 state](https://react.dev/learn/sharing-state-between-components)

先看 labs/LocalStockBroken.jsx。它能补货，却让卡片和统计分开了：

```jsx
// 有问题的写法：子组件复制业务库存，父组件统计仍读旧记录。
import { useState } from "react";
import { products } from "../../../shared/products.js";

function StockRow({ product }) {
  const [stock, setStock] = useState(product.stock);
  return <div><p>鼠标库存：{stock} 件</p>
    <button onClick={() => setStock(stock + 1)}>给鼠标补 1 件</button></div>;
}
export default function LocalStockBroken() {
  const [items] = useState(products);
  return <><StockRow product={items[1]} />
    <p role="status">总库存 {items.reduce((sum, product) => sum + product.stock, 0)} 件</p></>;
}
```

**先猜一猜：** 打开 case=local，点一次「给鼠标补 1 件」，两处分别显示多少？

结果是 **鼠标库存：1 件，总库存 52 件**。子组件的 stock 从 0 变成 1，父组件的 items 从未更新。这里不是统计公式错了，而是两处的来源已经分开。

修复版 labs/SharedStock.jsx 删除子组件的库存 state，让父组件执行更新：

```jsx
import { useState } from "react";
import { products } from "../../../shared/products.js";
import { restockProduct } from "../src/product-state.js";

function StockRow({ product, onRestock }) {
  return <div><p>鼠标库存：{product.stock} 件</p>
    <button onClick={() => onRestock(product.id)}>给鼠标补 1 件</button></div>;
}
export default function SharedStock() {
  const [items, setItems] = useState(products);
  function handleRestock(id) {
    setItems((pending) => restockProduct(pending, id));
  }
  return <><StockRow product={items[1]} onRestock={handleRestock} />
    <p role="status">总库存 {items.reduce((sum, product) => sum + product.stock, 0)} 件</p></>;
}
```

打开 case=shared，点一次后是 **鼠标库存：1 件，总库存 53 件**；再点一次是 2 和 54。restockProduct 沿用数组课的新数组、新目标记录写法，统计在父组件每次渲染时计算。

调用顺序是：点击 → onRestock(id) → 父节点调用 setter → 重新渲染 → 传回新 product。回调本身也是 props；调用回调把操作意图交还给拥有状态的组件。

“提升”强调所有权，不要求把状态搬到整个应用最顶层。这里 StockRow 和统计都是 SharedStock 的后代，放在 SharedStock 就够了。Java 对照：类似多个视图共用一个模型；React 通过替换 state 和重新渲染反映变化。

## 2. 受控设计与最小 state：一份事实，一个所有者

**一个组件可以让父节点控制选择，同时自己管理编辑草稿。** “受控”可以描述组件的某项行为，不只用于 input。

C25 的每张卡片各有 editing 布尔值，可以同时展开多个表单。本课改成单一编辑区：App 保存 editingId，卡片只接收 editing 和 onEdit。ProductCard 的编辑按钮改为：

```jsx
        {onEdit && <button id={editButtonId} type="button" aria-expanded={editing} aria-controls="product-editor" onClick={() => onEdit(product.id)}>编辑</button>}
```

点 P001 后，只有这张卡片收到 editing=true；再点 P002，P001 收到 false，P002 收到 true。一个 id 表达“最多选一个”，六个布尔值则需要额外维护彼此排斥。

### 保存编号，从当前数组查记录

App 已保存 products，就用 editingId 查编辑商品：

```jsx
  const [editingId, setEditingId] = useState(null);
  const editingProduct = products.find((product) => product.id === editingId) ?? null;
```

editingProduct 直接计算。若再用 state 保存一份选中对象，每次商品更新、删除都要同步它，漏一次就会读到旧值。[选择 state 结构](https://react.dev/learn/choosing-the-state-structure)

下面在 examples/c26 运行 node selected-id.js，展示旧引用和按 id 重新查找的差别：

```js title="selected-id.js"
import { products } from "../shared/products.js";
import { updateProduct } from "../inventory/04-react/src/product-state.js";

const selectedId = "P002";
const selectedCopy = products.find((product) => product.id === selectedId);
const updated = updateProduct(products, selectedId, { stock: 3 });
const selectedNow = updated.find((product) => product.id === selectedId);
console.log(selectedCopy.stock, selectedNow.stock); // → 0 3
console.log(updated.reduce((sum, product) => sum + product.stock, 0)); // → 55
```

selectedCopy 仍指向更新前的 P002；selectedNow 从新数组取到库存 3。编号连接的是业务身份，不依赖对象是否被复制。Java 对照：类似用主键从当前模型查记录；两种语言里的旧引用都不会自动转向新对象。

### 草稿值得保存，统计直接计算

当前状态分工如下：

| 信息 | 保存位置 | 原因 |
| --- | --- | --- |
| products | App | 列表、编辑与统计都需要 |
| query/category/order | App | 控制列表筛选和排序 |
| editingId | App | 卡片与编辑区需要协调选择 |
| draft、errors | ProductForm | 表单独有的未提交输入与反馈 |
| editingProduct、visibleProducts、总库存/总价值 | 渲染时计算 | 都能从当前来源状态得到 |

草稿与业务记录有不同含义。名称输入一半、库存清空时，draft 可以暂时不合法；products 始终保存已确认记录。输入鼠标库存 3 时总库存仍是 52，保存后才变成 55。

在 examples/c26 运行 node draft-boundary.js，可核对同一条保存路径：

```js title="draft-boundary.js"
import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";
import { updateProduct } from "../inventory/04-react/src/product-state.js";

const draft = { ...toDraft(products[1]), stock: "3", price: "129.90" };
console.log(products[1].stock, draft.stock); // → 0 3
const { value } = validateDraft(draft, products[1].tags);
const saved = updateProduct(products, "P002", value);
console.log(saved.reduce((sum, product) => sum + product.stock, 0)); // → 55
const cents = saved.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
console.log((cents / 100).toFixed(2)); // → 26737.70
```

draft.stock 是字符串，校验通过后才产生数字。Java 对照：草稿像待校验的 DTO，汇总像随当前集合计算的查询结果。

## 3. 状态保留：看树中的位置和类型

**父组件重新执行，会产生新的 JSX 描述；相同位置、相同类型、相同 key 的组件通常继续使用已有 state。** React 把 state 与渲染树中的组件身份关联，函数调用次数与挂载次数是两件事。[保留和重置 state](https://react.dev/learn/preserving-and-resetting-state)

用 labs/IdentityProbe.jsx 观察三种变化：

```jsx
import { useState } from "react";

function Count({ tone }) {
  const [count, setCount] = useState(0);
  return <button className={tone} onClick={() => setCount(count + 1)}>盘点 {count} 次</button>;
}
export default function IdentityProbe() {
  const [highlight, setHighlight] = useState(false);
  const [boxed, setBoxed] = useState(false);
  const [visible, setVisible] = useState(true);
  return <>
    <button onClick={() => setHighlight(!highlight)}>切换强调</button>
    <button onClick={() => setBoxed(!boxed)}>更换容器类型</button>
    <button onClick={() => setVisible(!visible)}>显示或隐藏计数器</button>
    {visible && (boxed
      ? <section>{highlight ? <Count tone="status" /> : <Count tone="" />}</section>
      : <div>{highlight ? <Count tone="status" /> : <Count tone="" />}</div>)}
  </>;
}
```

**先猜一猜：** 打开 case=identity，先点计数器到 1，再点「切换强调」，计数会回到 0 吗？接着更换容器类型呢？

切换强调后仍是 **盘点 1 次**。条件表达式的两个分支都在相同父节点的相同位置返回 Count，只改变 tone。React 看最终的树，不把源码中两个 JSX 标签当成必然不同的实例。

更换容器后是 **盘点 0 次**。div 变成 section，原来的容器及其子树被替换，里面的 Count 重新挂载。祖先身份变化也会让后代丢失状态。

再点到 1，隐藏后重新显示，结果也是 0。条件让 Count 从树中消失，它的 state 随卸载结束；重新显示时初始化新状态。CSS 的 display:none 只是视觉隐藏，组件仍在树中，state 会保留。

### 位置不等于屏幕坐标

两个并排 Count 各自记数。修改 CSS 布局或滚动页面不会改变组件身份。列表的稳定 key 帮助 React 识别同一父节点内排序前后的子项。

key 的范围是同一父节点下的兄弟。把组件搬到另一个父节点，即使写相同 key，也会重新挂载。移出树后再放回来，相同 key 也不会找回已销毁的 state。

组件函数放在模块顶层定义。若在父组件函数内部定义子组件，每次父组件执行都会创建新函数，React 可能把它当成新类型，输入就会反复重置。

Java 对照：局部变量每次调用重新建立，而 React 的 state 由 React 跨渲染保存。决定它是否延续的是组件在树中的身份。

## 4. 用 key 表达“这次是另一件商品”

**props 改变会重新渲染，但 useState 的初始值只用于初始化。** 草稿从 prop 创建，就意味着“挂载时取一次起点”。

ProductForm 沿用上一课的开头：

```jsx
export default function ProductForm({ product, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const [errors, setErrors] = useState({});
  const prefix = `edit-${product.id}`;
```

重新渲染时 prefix 会随 product.id 改变，draft 却继续使用已有 state。这能解释为什么标题和输入可能属于两件商品。

错误起点 labs/SwitchProductBroken.jsx 如下：

```jsx
// 有问题的写法：相同位置的表单没有按商品身份区分。
import { useState } from "react";
import { products } from "../../../shared/products.js";
import ProductForm from "../src/ProductForm.jsx";

export default function SwitchProductBroken() {
  const [selectedId, setSelectedId] = useState("P001");
  const product = products.find((item) => item.id === selectedId);
  return <>
    <button onClick={() => setSelectedId("P001")}>选择 P001</button>
    <button onClick={() => setSelectedId("P002")}>选择 P002</button>
    <ProductForm product={product} onSave={() => {}} onCancel={() => {}} />
  </>;
}
```

打开 case=switch，把名称改成「键盘待盘点」，再选择 P002：标题是 **编辑 P002**，名称却仍是 **键盘待盘点**，库存仍是 12。相同位置、相同 ProductForm 类型、没有变化的 key，React 保留了整份草稿。

实验的保存回调为空；实际业务若直接保存，会把键盘草稿交给 P002 的保存回调。

本项目选择“切换商品时丢弃草稿”。labs/SwitchProductFixed.jsx 只需给表单加稳定的业务 key：

```jsx
    <ProductForm key={product.id} product={product} onSave={() => {}} onCancel={() => {}} />
```

打开 case=switch-answer，重复操作，得到 **编辑 P002、无线鼠标、0、129.00**。切回 P001，名称是已保存的机械键盘。商品 key 变化，旧表单卸载，新表单从新商品初始化；draft 和 errors 都一起重置，名称获得焦点。

反复点击同一商品的编辑按钮，id 不变，草稿继续保留。key 取稳定 id；随机数、时间戳或正在编辑的名称会让普通渲染也重建表单，出现输入中断。

key 是 React 使用的身份标记，ProductForm 仍通过 product.id 读取业务编号。给外层列表卡片写 key，只区分那一组卡片；独立编辑区里的表单要在自己的位置表达身份。

用 Effect 监听 product 再清空草稿，会先提交带旧草稿的新商品界面，再安排更新。整份表单都应随商品更换时，key 直接表达这个边界。[按 key 重置状态](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)

Java 对照：初始化像创建新编辑会话时建立 DTO；同一个会话的输入需要保留，换商品则建立新会话。

## 5. 把草稿策略写成可观察的行为

**状态放在哪里，取决于它要活多久、被谁使用。** 本项目让 ProductForm 拥有当前草稿，App 拥有选中编号；编辑区放在筛选列表之外。

App 中的新增部分如下，完整代码在 src/App.jsx：

```jsx
      <section id="product-editor" aria-labelledby="editor-heading">
        <h2 id="editor-heading">商品编辑区</h2>
        <p>切换商品、取消或删除当前商品会丢弃未保存草稿；筛选和排序保留草稿。</p>
        {editingProduct
          ? <ProductForm key={editingProduct.id} product={editingProduct} onSave={handleSave} onCancel={handleCancel} />
          : <p>点击商品的编辑按钮开始。</p>}
      </section>
      <ProductList products={visibleProducts} editingId={editingId} onEdit={setEditingId} onRestock={handleRestock} onDelete={handleDelete} />
```

编辑商品从完整 products 查找，列表从 visibleProducts 渲染。搜索鼠标时，键盘卡片可以消失，但编辑区仍能显示键盘草稿。排序只改变卡片顺序，编辑区的位置与 key 都没变。

| 操作 | 草稿结果 | 页面结果 |
| --- | --- | --- |
| 输入字段 | 保留在表单 | 列表与统计仍读已保存值 |
| 筛选、排序、点击同一商品编辑 | 保留 | 编辑区保持当前商品 |
| 点击另一商品编辑 | 丢弃旧草稿 | 读取新商品起点，清空错误 |
| 保存 | 校验通过后写入 products，再关闭 | 列表和统计更新，焦点到页面标题 |
| 取消 | 丢弃并关闭 | 焦点回编辑按钮；按钮被筛选隐藏时回标题 |
| 删除正在编辑的商品 | 丢弃并关闭 | 提示编辑结束，焦点到标题 |

编辑期间当前商品的补货按钮禁用，避免另一条操作修改库存后，再被旧草稿覆盖。其他商品仍可补货或删除，它们的变化不会重置当前表单。刷新页面仍恢复固定样例。

取消的焦点由 App 安排，因为只有 App 同时知道选择和列表条件：

```jsx
  function handleCancel() {
    setEditingId(null);
    const target = document.getElementById(`open-editor-${editingId}`)
      ?? document.getElementById("inventory-heading");
    target?.focus();
  }
```

### 如果要求“切回来继续写”

这时草稿的生命期要跨越表单卸载，应提升到稳定存在的父节点，按商品 id 保存 draftById，表单接收 draft/onDraftChange。切换只改变 editingId，保存或取消时删除对应条目。保留多个已挂载表单并用 CSS 隐藏也能保留 state，但会同时维护多个表单实例。

key 只决定当前子树身份，草稿存储要单独设计。

App、ProductList、ProductCard 之间只有短距离传递，props 和回调已经把归属写清楚。Context 可以帮助跨多层提供数据，却不会替你决定谁拥有 state，也不会自动同步复制出来的两份状态。Java 对照：类似把会话数据放在生命周期足够长的对象里；存储范围由业务决定。

## 常见错误与调试

### 鼠标补货了，总库存没动

**现象**：打开 case=local，点一次补货，鼠标 1 件，总库存仍是 52。

**工具**：打开 DevTools → Components，选 StockRow，查看 Hooks 中的 State；再选 LocalStockBroken，查看它的商品数组。若未显示组件名称，用组件选择工具点击页面中的补货区域。

**证据**：子组件的 stock 是 1，父组件 items 中 P002.stock 仍是 0。两处显示各自正确读取了自己的来源。

**原因**：子组件从 props 初始化出第二份业务库存，后续更新没有回到拥有商品数组的父节点。

**修复**：按 SharedStock.jsx 删除子组件 stock，显示 product.stock，并调用 onRestock(product.id)。父节点使用 setItems 更新数组；把 LocalStockBroken.jsx 改成这一设计。

**确认**：重复点击一次显示 1 和 53，再点一次显示 2 和 54。在阶段 4 运行 `npm run test:bug -- labs/ownership-bugs.test.jsx`，第一项回归应通过，切换草稿的第二项仍等待修复。

### 选中鼠标，输入框里还是键盘

**现象**：打开 case=switch，修改键盘名称，再选 P002，表单标题与输入内容不一致。

**工具**：Components → ProductForm，对照 props.product 与 Hooks 的 draft。也可在 Sources → ProductForm.jsx 的 const prefix 行设置断点，切换商品后查看 product.id 和 draft.name。

**证据**：product.id 是 P002、product.name 是无线鼠标，而 draft.name 仍是键盘待盘点。props 已经传到，旧草稿被保留了。

**原因**：表单身份没变，初始化函数没有重新用于建立 state。复制 props 得到的草稿本来就可以与 props 不同。

**修复**：在 SwitchProductBroken.jsx 的 ProductForm 上增加 key={product.id}，保留 product prop。

**确认**：刷新后重复操作，P002 名称为无线鼠标、库存 0、单价 129.00；切回 P001 也从已保存值开始。两处修完后，同一条 bug 回归命令应为 2 条通过；仓库保留错误起点，正常测试覆盖修复版。

## 练习

### 练习 1：key 与草稿存储各负责什么

先预测下面三行输出，再在 examples/c26 运行 node prediction.js。Map 模拟父节点按商品编号保存的草稿。

```js title="prediction.js"
import { products } from "../shared/products.js";
import { toDraft } from "../inventory/04-react/src/product-form.js";

const drafts = new Map();
drafts.set("P001", { ...toDraft(products[0]), name: "键盘待盘点" });
console.log(drafts.get("P001").name);
console.log((drafts.get("P002") ?? toDraft(products[1])).name);
drafts.delete("P001");
console.log((drafts.get("P001") ?? toDraft(products[0])).name);
```

<details>
<summary>提示</summary>

有条目时读草稿，没有条目时从固定商品创建起点。删除 Map 条目与 React key 改变是两种操作。

</details>

<details>
<summary>参考答案</summary>

依次是键盘待盘点、无线鼠标、机械键盘。Map 承担显式存储，key 承担组件身份。若把这套方案接入 React，父节点的草稿也要通过 state 的 setter 更新，并创建新 Map；普通局部 Map 本身不会触发渲染。

</details>

### 练习 2：保留该保留的，重置该重置的

先完成上面两个 bug 的修复。再打开 case=identity：计数到 1，切换强调、更换容器、隐藏后显示。验收：依次保留 1、回到 0、重新初始化为 0，并解释发生重置的边界。

<details>
<summary>提示</summary>

看返回树中的父节点类型、Count 的位置与类型，别只看源码中出现了几个 Count 标签。隐藏前再点到 1，才能观察重新显示的差别。

</details>

<details>
<summary>参考答案</summary>

切换强调只改同一个 Count 的 tone，所以保留；div 变 section 会替换子树；条件移除 Count 后，重新显示建立新状态。tests/ownership.test.jsx 对这三种行为做回归，和两个修复版一起进入正常 npm test。

</details>

### 练习 3：检查隐藏卡片的编辑会话

从项目首页打开 P001 编辑，把名称改为键盘待盘点。搜索鼠标，再取消；清空搜索后重新编辑键盘。验收：搜索时草稿保留，取消时焦点到标题，再次打开为机械键盘。

<details>
<summary>提示</summary>

编辑商品来自完整 products；编辑按钮可能已经不在 DOM 中。重新打开读取的是已保存记录。

</details>

<details>
<summary>参考答案</summary>

筛选只移除列表卡片，独立编辑区保持相同位置和 key。取消清空 editingId，表单卸载；找不到编辑按钮时聚焦持续存在的标题。再次编辑初始化新草稿，因此丢弃的名称不会回来。

</details>

## 项目进度

从 C25 的 examples/inventory/04-react 继续。src/App.jsx 增加 editingId、当前商品查找、统一编辑区和取消处理，保存与删除当前商品时结束编辑。src/ProductList.jsx 传递 editingId/onEdit，src/ProductCard.jsx 删除本地 editing 和内嵌表单，改为接收 editing 并上报 id。

ProductForm 和校验函数继续复用，草稿仍由表单自己保存。既有表单测试改从统一编辑区操作，新增 tests/ownership.test.jsx 覆盖同步、重置、筛选保留、删除和焦点；labs/ownership.html 提供五个实验。

:::tip[自己尝试 · 本地 React]
1. 刷新首页，确认 6 种、52 件、26348.00 元。打开 P001，改名称为键盘待盘点，然后点击 P002 的编辑。
2. 确认只显示一个表单，名称为无线鼠标、库存 0、单价 129.00；填库存 3、单价 129.90，先不保存，再切换排序。
3. 确认草稿保留、总库存仍为 52；保存后检查列表与统计，再次打开 P002。
4. 修改名称但不保存，删除 P001，确认草稿保留；再删除正在编辑的 P002，确认编辑关闭、焦点到标题。

预期：第 1 步键盘草稿丢弃；第 3 步为 55 件、26737.70 元，重新打开读取 3 和 129.90；第 4 步已保存的 P002 被删除，统计只保留剩余商品。刷新恢复固定六件商品。
:::

在阶段 4 目录执行 npm test 和 npm run build，再用 `npm run preview -- --host 127.0.0.1` 检查生产预览；实验页使用 dev 服务。

## 小结

- 共享业务状态放在最近的共同父节点，向下传值、通过回调更新。
- 选择保存 id，当前商品、筛选结果与统计直接计算；草稿表达尚未确认的输入。
- 相同树位置、类型和 key 会保留 state；替换祖先、移除组件或改变 key 会重置。
- useState 初始化不会随 props 自动重做；商品 key 可以让整份表单重新初始化。
- 草稿是否跨商品保留是业务选择；本项目切换即丢弃，筛选与排序继续保留。

自测：

1. 子组件调用父节点传下来的回调，为何仍符合单向数据流？
2. 保存 editingId 比保存选中商品对象少了哪些同步工作？
3. 为什么改变 tone 保留计数，改变容器类型却会重置？
4. key 相同的表单卸载后再挂载，为什么不能找回旧草稿？
5. 如果要求离开商品后回来继续编辑，草稿应由谁保存？

下一课用 useReducer 与 Context 组织复杂更新和跨层共享，继续沿用清楚的状态归属。

## 延伸阅读

- [React：共享组件间的 state](https://react.dev/learn/sharing-state-between-components)
- [React：选择 state 结构](https://react.dev/learn/choosing-the-state-structure)
- [React：保留和重置 state](https://react.dev/learn/preserving-and-resetting-state)
- [React：按 key 重置全部 state](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)
- [React：useState 初始值与更新](https://react.dev/reference/react/useState)
