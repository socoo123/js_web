---
title: C22 Props、组合与渲染模型
description: 拆分库存列表、卡片和工具栏，用 props 与 children 组织界面，分清渲染计算、DOM 提交与浏览器绘制。
sidebar:
  order: 22
---

> **第 2 周 · 第 11 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C05、C08、C21 · 运行：Node 24、Chrome、本地 React · 示例已运行验证

## 这一课解决什么问题

C21 的卡片自己读取 P001，能显示机械键盘。现在要显示六件商品，复制六份组件会让结构和数据一起重复。把组件放进 map 以后，还有一种更隐蔽的错误：六张卡片都出来了，却全是机械键盘。

我们要把职责分开：App 准备数据，列表安排商品，卡片描述一件商品，工具栏容纳数量和说明。每一层都能说明自己收到了什么、返回了什么，页面出错时才有清楚的排查路径。

学完你能：

- 通过 props 传对象、数字和 JSX，读懂解构与默认值
- 用 children 组合界面，按职责拆分工具栏、列表和卡片
- 正确显示售罄、标签和空列表，解释页面上多出来的 0
- 保持渲染纯粹，解释为何重新调用组件不该改变库存
- 区分 render、commit 和绘制，用 React DevTools 找到传错 props 的父组件

例子在 [examples/c22](https://github.com/socoo123/js_web/tree/main/examples/c22)。React 部分接着 [库存项目阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)，在该目录执行 npm ci，再运行 `npm run dev -- --host 127.0.0.1`，打开终端给出的 /js_web/ 地址。纯 JS 在 examples/c22 中用 node 运行。

## Java 程序员先看这里

| Java 经验 | React 对应 | 差异 |
| --- | --- | --- |
| 方法参数或 DTO | props 对象 | 函数组件接收一个 props 参数，属性名由调用方约定 |
| 对象参数传递引用的副本 | 对象作为 prop 传入 | React 要求组件只读输入；嵌套对象不会自动深冻结 |
| 组合控件、注入内容 | children | 父组件提供 JSX，容器决定把它放在哪里 |
| 调方法立即修改控件 | 渲染与提交 | 组件先计算描述，React 再把需要的变化落实到 DOM |

## 1. Props：让卡片描述传进来的商品

卡片接收 product，由使用它的组件决定显示谁。把 src/ProductCard.jsx 改成下面的版本，移除原来读取共享数据的 import 和模块变量：

```jsx
export default function ProductCard({ product }) {
  const priceLabel = (product.priceCents / 100).toFixed(2);
  const headingId = `product-${product.id}`;
  return (
    <article className="product-card" aria-labelledby={headingId}>
      <h2 id={headingId}>{product.name}</h2>
      <p>编号：{product.id} · {product.category}</p>
      <p>库存：<strong>{product.stock}</strong> 件</p>
      <p className="status">{product.stock === 0 ? "已售罄" : "有货"}</p>
      <p className="price">单价：¥{priceLabel}</p>
      {product.tags.length > 0 && <p>标签：{product.tags.join("、")}</p>}
    </article>
  );
}
```

调用方写 `<ProductCard product={products[0]} />`，显示机械键盘、12 件、¥399.00；换成 products[1]，显示无线鼠标、0 件、已售罄、¥129.00，并隐藏标签段落。卡片结构保持一致，内容由输入决定。条件的写法在第 3 节展开。

[`props`](https://react.dev/learn/passing-props-to-a-component) 是组件接收的那一个对象。这里的 `{ product }` 是参数解构，等价于先接收 props，再读取 props.product。调用方的 `product=` 和接收方的属性名需要一致；写成 item=，接收方读 product 就会得到 undefined。

`product={products[0]}` 传的是对象，`count={6}` 传数字，`label="全部商品"` 传字符串。大括号求值，双引号表示字面量，沿用 C21 的 JSX 规则。

headingId 也跟着商品编号变化。若六张卡片都使用同一个 product-name，HTML 会出现重复 id，aria-labelledby 的标题关联就含糊了。

### 默认值只补缺失和 undefined

参数解构的默认值遵守普通 JS 规则。先用一个不含 JSX 的函数看清楚：

**先猜一猜：** 最后两次调用分别使用「库存」还是传入值？

```js title="props.js"
import { products } from "../shared/products.js";

function stockLabel({ product, prefix = "库存" }) {
  return `${product.name} ${prefix}：${product.stock} 件`;
}

console.log(stockLabel({ product: products[0] }));
console.log(stockLabel({ product: products[1], prefix: "剩余" }));
console.log(stockLabel({ product: products[1], prefix: undefined }));
console.log(stockLabel({ product: products[1], prefix: null }));
```

依次输出「机械键盘 库存：12 件」「无线鼠标 剩余：0 件」「无线鼠标 库存：0 件」「无线鼠标 null：0 件」。null 是明确传入的值，默认值不会接管；数字 0、false、空字符串也会保留。

它和 `??` 的触发条件不同：解构默认值只处理 undefined，`??` 还处理 null。默认值适合说明「参数省略时怎么显示」，必需的 product 则由父组件提供。

对照 Java：props 像一次调用的参数集合；JS 组件通过属性名读取，没有编译器帮你检查这一层的字段契约。

## 2. 组合：数据向下传，内容通过 children 放进去

按业务职责拆分组件，比按每个标签拆函数更容易维护。列表负责从多件商品得到多张卡片，卡片负责一件商品的显示；工具栏负责安排数量和旁边的内容。

新增 src/InventoryToolbar.jsx：

```jsx
export default function InventoryToolbar({ count, children }) {
  return (
    <header className="inventory-toolbar">
      <p>共 {count} 种商品</p>
      <div>{children}</div>
    </header>
  );
}
```

src/App.jsx 准备数据，组合工具栏与列表：

```jsx
import { products } from "../../../shared/products.js";
import InventoryToolbar from "./InventoryToolbar.jsx";
import ProductList from "./ProductList.jsx";

export default function App() {
  return (
    <>
      <h1>库存管理</h1>
      <InventoryToolbar count={products.length}>
        <span>本次盘点：全部分类</span>
      </InventoryToolbar>
      <ProductList products={products} />
    </>
  );
}
```

输出的顶部是「库存管理」「共 6 种商品」「本次盘点：全部分类」。InventoryToolbar 标签中间的 span 作为 **children prop** 传入，在工具栏的 div 中显示。它也可以是链接、多个元素或另一组件。

工具栏无须判断内容是说明还是链接，只负责留出位置。调用方知道业务内容，容器知道排版位置，这就是这里的组合。children 也是普通 prop，容器如果没有返回 `{children}`，嵌套内容就不会出现在页面里。

新增 src/ProductList.jsx，把数组交给 map：

```jsx
import ProductCard from "./ProductCard.jsx";

export default function ProductList({ products, emptyMessage = "没有匹配的商品。" }) {
  if (products.length === 0) return <p role="status">{emptyMessage}</p>;
  return (
    <section className="product-list" aria-label="商品列表">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </section>
  );
}
```

输出六张卡片，分别对应 P001–P006。数组为空时只显示提示段落，role="status" 让动态状态提示有合适的语义。

map 的回调每次拿到一个 product，再用同名 prop 交给卡片。key 用稳定的业务 id，帮助 React 区分同级列表项；它供 React 使用，卡片的数据仍要通过 product 传入。组件身份和列表更新会在 C24 展开。

这里的数据流可以顺着参数逐层读：

| 组件 | 收到什么 | 决定什么 |
| --- | --- | --- |
| App | 导入固定数据 | 组合哪些区域，把数据交给谁 |
| InventoryToolbar | count、children | 数量和内容放在哪里 |
| ProductList | products、emptyMessage | 显示空提示，或为每件商品生成卡片 |
| ProductCard | product | 这一件商品显示哪些文字 |

这叫**单向数据流**：父组件向下提供输入，子组件根据输入描述界面。以后用户操作要改变数据时，由拥有数据的组件更新，再向下传新值。

对照 Java 的组合：容器接收别的内容来完成界面；React 通过 JSX 和 props 表达这层关系，不需要卡片继承工具栏。

:::tip[自己尝试 · 本地 React]
1. 启动阶段 4 开发服务，打开 /js_web/，核对六件商品和工具栏数量。
2. 打开 /js_web/labs/props.html，观察 count 为 0，children 却是一条链接的工具栏。
3. 打开 /js_web/labs/props.html?case=empty，观察空列表。

预期：工具栏显示「共 0 种商品」和「查看盘点说明」；空列表显示「配件分类暂时没有商品。」，没有卡片。数量与内容是独立输入。
:::

## 3. 条件渲染：返回什么，页面就显示什么

JSX 的条件靠普通 JS 表达。整块内容二选一时用三元表达式，整个组件无需显示时可以 return null，某块内容可选时常用布尔条件配合 &&。[条件渲染](https://react.dev/learn/conditional-rendering)

**先猜一猜：** 无线鼠标没有标签，下面的 div 是空的，还是会显示一个字符？

```jsx
// 有问题的写法：把可能为 0 的数放在 && 左侧
export default function TagsBroken({ product }) {
  return <div>{product.tags.length && <p>标签：{product.tags.join("、")}</p>}</div>;
}
```

传入 P002，div 中会显示 **0**。`0 && JSX` 的结果是数字 0；React 会显示数字，false、null 和 undefined 则在这里不显示内容。&& 返回操作数这条 JS 规则，在 JSX 中仍然成立。

把左侧变成明确的布尔值，或者直接写出两种状态：

```jsx
// ProductCard 中的两个独立片段
{product.tags.length > 0 && <p>标签：{product.tags.join("、")}</p>}
<p className="status">{product.stock === 0 ? "已售罄" : "有货"}</p>
```

P002 隐藏标签并显示已售罄；P004 显示「标签：热销、新品」和有货。这里比较的是业务含义：标签数量大于 0 才显示，库存等于 0 才售罄。

只看 JS 运算，下面几行已经能预测界面：

```js title="conditions.js"
import { products } from "../shared/products.js";

const mouse = products[1];
console.log(mouse.stock && "有货");
console.log(mouse.stock > 0 && "有货");
console.log(mouse.stock === 0 ? "已售罄" : "有货");
console.log(mouse.tags.length > 0 ? mouse.tags.join("、") : "无标签");
```

依次输出 0、false、已售罄、无标签。Console 会打印 false，React 把它放在子内容的位置时则不显示文字。

`products` 是空数组时仍然是 truthy，所以空列表判断要用 products.length。ProductList 的提前 return 把这种情况单独处理，下面的 map 就只处理有商品的情况。对照 Java：Java 的 && 只接受 boolean，JS 容许数字参加，因而需要你写清判断条件。

## 4. 纯渲染：描述库存时，库存保持原样

渲染是一次计算：相同输入应得到相同界面，计算过程保持外部数据原样。组件接收的 props，包括里面的对象和数组，都当作只读输入。[保持组件纯粹](https://react.dev/learn/keeping-components-pure)

先离开 JSX，看一个显示函数。它的错误会在组件中原样出现：

```js title="purity-broken.js"
// 有问题的写法：显示库存的函数修改了调用方传入的对象
import { products } from "../shared/products.js";

const product = { ...products[0] };
function stockLabel(product) {
  product.stock += 1;
  return `${product.name}：${product.stock} 件`;
}

console.log(stockLabel(product));
console.log(stockLabel(product));
console.log("输入库存", product.stock);
```

输出「机械键盘：13 件」「机械键盘：14 件」「输入库存 14」。只是调用两次显示函数，商品库存就增加两次。若把它写在组件函数体中，React 多调用一次组件，业务数据就多变一次。



```js title="purity-fixed.js"
import { products } from "../shared/products.js";

const product = { ...products[0] };
function stockLabel(product) {
  return `${product.name}：${product.stock} 件`;
}

console.log(stockLabel(product));
console.log(stockLabel(product));
console.log("输入库存", product.stock);
```

输出两次「机械键盘：12 件」，最后是「输入库存 12」。ProductCard 也采用同样规则：可以算 priceLabel、拼 headingId，始终读取 product。

对象作为 prop 传入时没有自动深复制。`product.stock += 1` 改字段、`product.tags.push(...)` 改嵌套数组、`products.sort(...)` 改调用方数组，都会影响其他使用者。需要排序显示时，用 C08 学过的 toSorted 得到新数组。

在这次调用里新建局部数组，再往里面 push 计算结果则可以：它没有改输入，也没有把结果留给下一次调用。[纯渲染规则](https://react.dev/reference/rules/components-and-hooks-must-be-pure)约束的是可观察的外部变化，不是禁止函数里出现赋值。

请求、写存储、修改 DOM 这类工作有外部效果，安排在渲染之外。补货是用户发起的业务动作，应由事件触发数据更新，然后再显示新的库存；组件被调用本身不构成一次补货。

对照 Java：引用传递的行为相近，但 React 对显示函数加了只读约定。Java 的 final 引用也不会让对象字段自动变成只读。

## 5. Render 与 commit：算出界面，再更新 DOM

把页面更新分成三步，更容易理解为什么纯渲染是必要条件：[渲染与提交](https://react.dev/learn/render-and-commit)。

| 步骤 | 谁负责 | 在这里发生什么 |
| --- | --- | --- |
| 触发 | 入口或 React 更新机制 | 初次 root.render，或状态更新等触发后续计算 |
| render，渲染 | React 调用组件 | 根据输入计算下一份界面描述 |
| commit，提交 | React 操作 DOM | 让 DOM 对应这份描述，应用需要的变化 |

提交以后，浏览器负责样式计算、布局和绘制，屏幕才呈现结果。「React 渲染了组件」说的是组件参与计算；它和浏览器把像素画出来是不同的步骤。

相同输入可以再次参与 render，得到相同描述；已有 DOM 无需因此全部重建。开发入口保留的 [StrictMode](https://react.dev/reference/react/StrictMode) 会额外调用组件来检查纯粹性。

labs/RenderProbe.jsx 留下一个诊断日志，用来观察调用：

```jsx
export default function RenderProbe({ label }) {
  console.log("RenderProbe render", label); // 仅用于观察调用，实验后删除
  return (
    <section>
      <h2>{label}</h2>
      <label htmlFor="note">盘点备注</label>
      <input id="note" />
    </section>
  );
}
```

labs/render-main.jsx 让根外的两个原生按钮分别提交相同输入和新标题：

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RenderProbe from "./RenderProbe.jsx";
import "../src/styles.css";

const root = createRoot(document.getElementById("root"));
let label = "库存清单";
function show() {
  root.render(<StrictMode><RenderProbe label={label} /></StrictMode>);
}
document.getElementById("same").addEventListener("click", show);
document.getElementById("change").addEventListener("click", () => {
  label = label === "库存清单" ? "本次盘点" : "库存清单";
  show();
});
show();
```

初次显示「库存清单」和一个输入框。「相同输入」再次计算相同界面；「更换标题」更新 h2，输入框位置与类型保持原样。这个独立实验用 root.render 明确发起新计算；项目里的交互随后用 state 更新。

:::tip[自己尝试 · 本地 React]
1. 打开 /js_web/labs/render-commit.html，在「盘点备注」中输入「先核对外设」。
2. 打开 DevTools → Console，输入 `window.noteBefore = document.querySelector("#note")` 保存节点。
3. 点「相同输入」，观察新日志；再点「更换标题」。
4. 在 Console 输入 `document.querySelector("#note") === window.noteBefore`。

预期：有新的 RenderProbe render 日志，开发检查可能让日志重复；标题变成「本次盘点」，备注仍在，节点比较为 true。
:::

输入框由 React 管理，但本例没有通过 value prop 指定文本。用户输入留在该 DOM 节点中。更新 h2 时，React 复用了输入框，所以文字保留。组件重算和 DOM 重建之间没有一一对应关系；

对照 JavaFX：一个方法可以直接调用控件 setter；React 组件先返回描述，由 React 在提交阶段更新节点。把 DOM 修改塞进组件函数体，会打乱这层分工。

## 常见错误与调试

### 六张卡片全是机械键盘

**现象**：开发服务打开 /js_web/labs/props.html?case=wrong，六张卡片都显示 P001 和 12 件；原始 products 数组里却有六件商品。

**工具**：从 [React 官方安装入口](https://react.dev/learn/react-developer-tools)安装 React Developer Tools 扩展，刷新本地 React 页，再打开 Chrome DevTools。选择 **Components ⚛**；窄窗口里先点标签栏右侧的 `»`。Elements 展示 DOM，Components 展示 React 组件和 props。

**证据**：在树中展开 PropsPreview → ProductListBroken，选择第二个 ProductCard。树上能看到 key="P002"，右侧 props.product 却是 id="P001"、name="机械键盘"、stock=12。回到 ProductListBroken，查看 products 数组，第二项仍是 P002、无线鼠标、0。

**原因**：商品在父组件中是对的，传给卡片时选错了对象。labs/ProductListBroken.jsx 如下：

```jsx
// 有问题的写法：遍历每件商品，却总把第一件交给卡片
import ProductCard from "../src/ProductCard.jsx";

export default function ProductListBroken({ products }) {
  return (
    <section className="product-list" aria-label="商品列表">
      {products.map((product) => <ProductCard key={product.id} product={products[0]} />)}
    </section>
  );
}
```

**修复**：把 `product={products[0]}` 改成 `product={product}`，传 map 本轮拿到的对象。key 只负责列表身份，没有替你选择业务数据。

**确认**：保存后第二张卡片显示无线鼠标、0 件、¥129.00；Components 中该卡片的 product.id 也变成 P002。切换查看父子组件，把「哪层第一次传错」作为排查目标，能避免在正确的卡片中加补丁。

在阶段 4 目录运行 `npm run test:bug -- labs/props.test.jsx`，错误起点失败，修复后通过。核心断言如下，完整文件已导入需要的组件和固定数据：

```jsx
it("列表中的无线鼠标保留自己的名称和库存", () => {
  const html = renderToStaticMarkup(<ProductListBroken products={products.slice(0, 2)} />);
  expect(html).toContain("无线鼠标");
  expect(html).toContain(">0</strong>");
});
```

这里用 React 的静态输出验证组件组合的文字结果，足以抓住本次传错对象。浏览器中的输入保留和按钮行为仍按上一节观察。正常 tests/composition.test.jsx 也覆盖正式列表的 P002、空列表、children 和重复渲染不改输入。

### 空标签旁边多出一个 0

**现象**：打开 /js_web/labs/props.html?case=zero，页面标题下面出现 0。

**工具**：Components 选中 TagsBroken，展开 product.tags；再到 Elements 查看 div 的文本内容。

**证据**：tags 是空数组，div 中是文本节点 0。Console 求值 `0 && "标签"` 也得到 0。

**原因**：&& 的左值为 0，表达式返回它，React 按数字显示。

**修复**：在 labs/TagsBroken.jsx 把 product.tags.length 改成 product.tags.length > 0。

**确认**：保存后只剩实验标题。在阶段 4 运行 `npm run test:bug -- labs/tags.test.jsx`，原始版本失败，修复后通过。它专门检查空标签产生的孤立 0。

## 练习

### 练习 1：预测默认值与条件

先写出四行输出，再在 examples/c22 运行 `node prediction.js`。验收：能解释 0、undefined、null 三种输入分别怎样处理。

```js title="prediction.js"
import { products } from "../shared/products.js";

function summary({ count = 6, children = "待盘点" }) {
  return `${count} 种 / ${children}`;
}

console.log(summary({ count: 0 }));
console.log(summary({ count: undefined, children: "已盘点" }));
console.log(summary({ count: null, children: "" }));
console.log(products[1].stock && "已售罄");
```

<details>
<summary>提示</summary>

默认值检查 undefined，&& 返回操作数。这里 children 只是一个普通对象属性；React 使用同样的名称接收嵌套内容。

</details>

<details>
<summary>参考答案</summary>

依次是「0 种 / 待盘点」「6 种 / 已盘点」「null 种 / 」（斜线后内容为空）和数字 0。0、null、空字符串都是明确传入的值；只有 undefined 使用对应默认值。若把最后的结果作为 JSX 子内容，页面会显示 0。

</details>

### 练习 2：修复父组件，再保护输入

从 labs/ProductListBroken.jsx 开始，完成上面的 props 调试；再检查 ProductCard 是否满足只读要求。验收：六张卡片各显示自己的商品；鼠标为 0 件；正常 npm test 全部通过。尝试在卡片函数中加入 product.stock += 1，观察正常测试怎样失败，随后删除这行。

<details>
<summary>提示</summary>

先修父组件中传入的对象，再看卡片是否改动参数。tests/composition.test.jsx 对输入商品和 tags 分别使用 Object.freeze，帮助捕获意外写入。

</details>

<details>
<summary>参考答案</summary>

父组件传本轮 product，卡片只读取字段。在卡片中加入库存写入后，冻住输入的用例会抛 TypeError，其他内容断言也可能暴露错误库存。删除写入后恢复通过。freeze 用于这个测试，组件的只读约定仍然由代码遵守；它也需要分别覆盖嵌套数组。

</details>

### 练习 3：换内容，保持工具栏通用

从 src/App.jsx 开始，把工具栏的 span 换成 strong，文字改为「优先盘点售罄商品」。验收：工具栏仍显示共 6 种，说明变成加粗文字；InventoryToolbar.jsx 无需修改，六张卡片内容不变。

<details>
<summary>提示</summary>

保留 InventoryToolbar 的 count prop，只替换它的开始和结束标签之间的内容。

</details>

<details>
<summary>参考答案</summary>

将 span 那行换成 `<strong>优先盘点售罄商品</strong>`。工具栏依旧安排位置，业务措辞由 App 决定，因此无需给工具栏新增一个「加粗说明」开关。

</details>

## 项目进度

从 C21 的 examples/inventory/04-react 继续。修改 ProductCard，让它接收 product；新增 InventoryToolbar 与 ProductList；修改 App，在这里导入共享数据并向下传。正文第 1、2 节就是这四个文件的完整内容。

styles.css 增加工具栏的 Flex 和列表的 Grid：窄屏一列，较宽时两列。继续沿用 C15 的普通 CSS。

labs 新增 props 与 render-commit 实验，保留错误起点；tests 新增组合回归，并把原卡片测试改为显式传入 P001。

在阶段 4 目录执行：

```sh
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

预期：6 条正常测试通过；预览 /js_web/ 显示六种商品，库存依次为 12、0、7、3、25、5，只有无线鼠标显示已售罄。labs 仍由 dev 服务提供，教程正文由网站静态构建发布。

## 小结

- props 是一次渲染的输入对象；参数解构读取属性，默认值只接管 undefined。
- 父组件向下传数据，children 让调用方提供内容，容器安排内容的位置。
- 条件渲染先遵守 JS 求值规则；&& 左侧写布尔判断，保住有业务含义的 0。
- 渲染只计算界面，保持输入原样；共享对象和嵌套数组都按只读处理。
- render 计算描述，commit 更新 DOM，浏览器负责绘制；Components 查输入，Elements 查节点。

自测：

1. `<ProductCard product={mouse} />` 中传入的对象在哪里被读取？
2. 工具栏没有返回 children 时，嵌套 JSX 会显示在哪里？
3. 为什么空数组需要检查 length，数字 0 却会直接显示？
4. 为什么组件多被调用一次，库存也应该保持不变？
5. 组件重新渲染后，怎样证明输入框 DOM 节点被复用了？

下一课引入 useState，解释事件如何发起更新，以及每次渲染为什么只能读到自己的状态快照。

## 延伸阅读

- [React：向组件传递 props](https://react.dev/learn/passing-props-to-a-component)
- [React：条件渲染](https://react.dev/learn/conditional-rendering)
- [React：保持组件纯粹](https://react.dev/learn/keeping-components-pure)
- [React：渲染与提交](https://react.dev/learn/render-and-commit)
- [React：StrictMode](https://react.dev/reference/react/StrictMode)
- [React：React Developer Tools](https://react.dev/learn/react-developer-tools)
