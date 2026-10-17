---
title: C21 React 来由、JSX 与第一个组件
description: 用 Vite 建立 React 练习，以函数组件表达商品卡片，分清 JSX、React 元素与浏览器 DOM。
sidebar:
  order: 21
---

> **第 2 周 · 第 11 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C11、C15、C16、C20 · 运行：Node 24、Chrome、本地 React · 示例已运行验证

## 这一课解决什么问题

原生库存页已经能筛选、编辑和保存。每加一个字段，你就得找到节点、填入文本，还要保证加载、编辑、恢复时都更新它。假如名称更新了，价格却留着旧值，用户看到的就是一张互相矛盾的卡片。

React 把界面的组织单位换成组件：你用函数描述「这份数据应该显示成什么」，由 React 把描述落实到 DOM。HTML、CSS 和 JS 仍然都在，只是更新页面的分工变了。

学完你能：

- 说明声明式 UI 解决了哪一类重复工作，解释 React 为什么会出现
- 用 Vite 创建 JavaScript 版 React 项目，找到入口和根节点
- 写出函数组件，正确使用 JSX、Fragment、表达式和样式
- 分清函数、React 元素和 DOM 节点，查看 JSX 编译后的结构
- 从页面文字和断点证据定位 JSX 错误，保留一条回归测试

材料在 [examples/c21](https://github.com/socoo123/js_web/tree/main/examples/c21)，React 工程从 [库存项目阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react) 开始。JSX 文件交给 Vite 处理，在浏览器看结果。

## Java 程序员先看这里

| Java 经验 | React 对应 | 差异 |
| --- | --- | --- |
| Swing/JavaFX 创建控件后设置属性 | 函数组件描述界面 | 通常由 React 创建、更新节点，组件返回的是描述 |
| 方法返回一个值 | 函数组件返回 JSX | 组件通过 `<ProductCard />` 交给 React 使用，无需 new |
| JSP 等模板中的变量插值 | JSX 的 `{expression}` | 表达式在浏览器 JS 中求值，不是服务端模板 |
| Java 方法的 return | JS 的 return | return 后直接换行会结束语句，导致返回 undefined |

## 1. 从逐项改节点，到描述界面

React 于 2013 年开源。随着列表、筛选、详情等交互增长，「这次要改哪些节点」容易分散到多处。它选择把渲染逻辑和界面结构放进组件，共同表达一个区域。[React 的设计来由](https://legacy.reactjs.org/blog/2013/06/05/why-react.html)

先回看熟悉的原生写法。examples/c21/dom.html 已经放好标题和两个段落，dom.js 负责填内容：

```js title="dom.js"
import { products } from "../shared/products.js";

const product = products[0];
const nameNode = document.querySelector("#name");
const stockNode = document.querySelector("#stock");
const priceNode = document.querySelector("#price");

function renderProduct() {
  nameNode.textContent = product.name;
  stockNode.textContent = `库存：${product.stock} 件`;
  priceNode.textContent = `单价：¥${(product.priceCents / 100).toFixed(2)}`;
}

renderProduct();
```

页面显示「机械键盘」「库存：12 件」「单价：¥399.00」。

它仍要维护 HTML 节点和 JS 查询、赋值。React 组件把结构写在返回值里，再次渲染时根据新的描述更新页面。声明式指的是**写出结果应该是什么**，具体节点操作交给库。

这也不是「改任何变量，页面都自动刷新」。React 需要收到更新的触发；本课先完成第一次显示，交互更新在 C23 引入 state 时展开。

对照 JavaFX：这里的函数返回界面描述，节点交给 React 管理。[你的第一个组件](https://react.dev/learn/your-first-component)

## 2. Vite 建项目，createRoot 连接浏览器

用 Node 24 和 npm，在仓库外一个自己的练习目录打开终端，运行：

```sh
npm create vite@latest inventory-react -- --template react --no-interactive
cd inventory-react
npm install
npm run dev -- --host 127.0.0.1
```

预期：创建 inventory-react 目录，安装后给出开发地址，通常是 `http://127.0.0.1:5173/`，打开可见模板欢迎页。以终端实际地址为准。

`--template react` 选 JavaScript + JSX，react-ts 选 TypeScript。npm create 执行 create-vite；新项目用 install 安装，已有锁的参考工程用 npm ci。[Vite 创建命令与模板](https://vite.dev/guide/#scaffolding-your-first-vite-project)

React 官方已[弃用 Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)，新练习从 Vite 开始。[从零构建指南](https://react.dev/learn/build-a-react-app-from-scratch)也列出 Vite；本课用它学习纯浏览器应用。

### HTML 保留容器，JS 启动 React

参考工程 index.html 的 body 包含下面两部分，容器也可用 div：

```html
<main id="root"></main>
<script type="module" src="/src/main.jsx"></script>
```

root 是容器 id，拼写要与 JS 一致。src/main.jsx：

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

在自己的模板跟做时，把 src/index.css 改名为 src/styles.css，用上面代码替换 main.jsx；下一节替换 App.jsx 并新增 ProductCard.jsx。也可直接运行仓库参考工程。

运行后，App 的内容出现在 main 内。getElementById 找容器，createRoot 连接容器，root.render 把界面描述交给 React。root 变量是 React 根对象，root 这个 id 则用于查 DOM。[createRoot 用法](https://react.dev/reference/react-dom/client/createRoot)

react 提供组件能力，react-dom/client 连接浏览器 DOM。Vite 负责开发服务、转换和构建，浏览器执行最终 JS。对照 Java：开发插件和 UI 库的工作分属两层。

保留 [StrictMode](https://react.dev/reference/react/StrictMode)，它增加开发检查，本身不生成 DOM 包装。入口通常创建一个根、渲染一次 App，后续由组件更新机制继续工作。

:::tip[自己尝试 · 本地 React]
1. 在参考工程 examples/inventory/04-react 执行 npm ci，再执行 npm run dev -- --host 127.0.0.1。
2. 打开终端给出的带 /js_web/ 的地址，通常是 `http://127.0.0.1:5173/js_web/`。
3. 在 Elements 展开 main#root，找到 h1、说明段落和 article。

预期：页面显示机械键盘、P001、外设、库存 12 件和单价 ¥399.00。参考工程配置了 base，所以地址比刚创建的模板多一段 /js_web/。
:::

## 3. 函数组件和 JSX：结构与计算写在一起

函数组件是一个由 React 使用的 JS 函数。本课从固定数据里取 P001，把它的界面放进 src/ProductCard.jsx：

```jsx
import { products } from "../../../shared/products.js";

const product = products[0];

export default function ProductCard() {
  const priceLabel = (product.priceCents / 100).toFixed(2);
  return (
    <article className="product-card" aria-labelledby="product-name">
      <h2 id="product-name">{product.name}</h2>
      <p>编号：{product.id} · {product.category}</p>
      <p>库存：<strong>{product.stock}</strong> 件</p>
      <p className="price">单价：¥{priceLabel}</p>
    </article>
  );
}
```

输出就是前面的卡片。名称、库存和价格来自同一记录；金额按分存储，只在显示时除以 100，保留两位小数。

return 后的标记是 **JSX**：JS 的语法扩展，长得像 HTML。组件里可以先用普通 JS 算出 priceLabel，再把结果填进标记。export default 和 import 沿用 C16 的 ESM 规则。[JSX 写法](https://react.dev/learn/writing-markup-with-jsx)

### 大写名字代表组件，小写名字代表标签

src/App.jsx 使用刚定义的组件：

```jsx
import ProductCard from "./ProductCard.jsx";

export default function App() {
  return (
    <>
      <h1>库存管理</h1>
      <p>先把一件商品表达清楚。</p>
      <ProductCard />
    </>
  );
}
```

ProductCard 首字母大写，`<ProductCard />` 表示组件；`<article>`、`<h2>` 是浏览器标签。若写 `<productCard />`，React 按标签名处理它。

通过 `<ProductCard />` 让 React 调用组件，应用中采用这种写法。它没有 Java 对象那种先 new 再调用实例方法的要求。

`<>...</>` 是 [Fragment](https://react.dev/reference/react/Fragment) 简写，将相邻元素分组而不增加 DOM 包装。在 Elements 看 main 的直接子节点：h1、p、article。需要布局容器时，使用真实的 section、div 等元素。

### 从 HTML 迁移时记住这些改动

| HTML 习惯 | JSX 写法 | 原因或结果 |
| --- | --- | --- |
| class="product-card" | className="product-card" | 用 React 的 DOM 属性名 |
| label 的 for="name" | htmlFor="name" | 关联输入框的 id |
| 单独写 br、img | `<br />`、`<img ... />` | 标签必须闭合，成对标签也要闭合 |
| 返回两个并排标签 | 外层包 Fragment 或真实元素 | 一次返回一个表达式 |
| aria-label、data-id | 保持带连字符 | 这两类属性沿用 HTML 名称 |

JSX 仍要求合理的 HTML 嵌套。试着删掉 ProductCard.jsx 中一个 `</p>` 并保存，Vite 的错误遮罩会指出文件和附近位置。找回对应标签、补上结束标签，错误消失；解析器可能到后面的标签才发现结构对不上。

## 4. 大括号放表达式，样式接收对象

JSX 的引号表示字面文本，`{}` 内执行 JS 表达式。表达式能算出值，例如字段访问、函数调用、加减和 `??`；if、for 属于语句，放在 return 前组织逻辑。

**先猜一猜：** P002 库存为 0，下面会显示什么？两个 title 的值相同吗？代码在阶段 4 的 labs/Expressions.jsx。

```jsx
import { products } from "../../../shared/products.js";

const product = products[1];

export default function Expressions() {
  return (
    <section id="expressions">
      <h2 title="product.name">{product.name}</h2>
      <p title={product.name}>库存：{product.stock ?? 12} 件</p>
      <p>单价：¥{(product.priceCents / 100).toFixed(2)}</p>
      <p>布尔值：{false}；空值：{null}；数字：{0}</p>
    </section>
  );
}
```

输出：标题「无线鼠标」，库存「0 件」，单价「¥129.00」；最后一行是「布尔值：；空值：；数字：0」。h2 的 title 是字面文本 product.name，p 的 title 才是无线鼠标。[JSX 中的 JS 表达式](https://react.dev/learn/javascript-in-jsx-with-curly-braces)

`{product.name}` 先读取字段，再把字符串放到页面。`stock ?? 12` 保住 0，规则和 C03 完全相同。false、null、undefined 作为子内容不显示文字，数字 0 会显示。若要显示布尔值本身，用 String(false)。

对象不能直接当文字子节点，例如 `{product}` 会报 Objects are not valid as a React child。应选出 name 等字段；确实要观察整份数据时，可在 pre 中显示 JSON.stringify(product, null, 2) 得到的字符串。

和 JSP 的服务端求值不同，本例的表达式由浏览器运行。

### className 管常规样式，style 传动态值

布局、边框等常规样式继续写 CSS，通过 className 关联。某个值由 JS 决定时，可传 style 对象。labs/StylePreview.jsx：

```jsx
export default function StylePreview() {
  const accent = "#176b3a";
  return (
    <p className="status" style={{ color: accent, marginTop: 8 }}>
      库存文字用了动态颜色
    </p>
  );
}
```

结果是绿色文字，顶部外边距 8px。`style={{ ... }}` 的外层大括号进入 JS，内层大括号创建普通对象。marginTop 用驼峰式，很多长度属性的数字按 px 处理；lineHeight 等无单位属性按自身规则解释。百分比可写成字符串，例如 width: "100%"。[React DOM 样式](https://react.dev/reference/react-dom/components/common#applying-css-styles)

:::tip[自己尝试 · 本地 React]
1. 保持阶段 4 的 dev 服务运行，打开 `http://127.0.0.1:5173/js_web/labs/jsx.html`；端口按终端调整。
2. 在 Elements 选中 h2，核对 title 属性，再选中库存段落比较。
3. 选中最后的绿色段落，在 Styles、Computed 查看 color 和 margin-top。

预期：两个 title 分别为 product.name 和无线鼠标；库存是 0，margin-top 为 8px。改 accent 并保存，文字颜色随开发服务更新。
:::

## 5. JSX 转成 JS，React 再更新 DOM

JSX 先变成创建 React 元素的 JS。**React 元素是描述对象**，记录要用什么类型、传什么属性与子内容；DOM 节点是浏览器中的实际节点，有 appendChild 等 DOM 方法。

**先猜一猜：** 下面创建的 element 能调用 appendChild 吗？在阶段 4 执行 npm run inspect，对照 labs/inspect-elements.js：

```js
import { createElement, isValidElement } from "react";

const element = createElement("h2", { className: "name" }, "机械键盘");
console.log(typeof element);
console.log(element.type);
console.log(element.props.className);
console.log(element.props.children);
console.log(isValidElement(element));
console.log(typeof element.appendChild);
```

依次输出 object、h2、name、机械键盘、true、undefined。createElement 来自 React，构造描述；C11 的 document.createElement 来自 DOM，创建真实节点。名称相似，返回值用途不同。[React createElement](https://react.dev/reference/react/createElement)

等价的 JSX 是 `<h2 className="name">机械键盘</h2>`。当前模板采用自动 JSX 转换，生成 jsx 或 jsxDEV 一类调用，自动加入运行时导入；具体名称看实际响应。

这里的 type 是字符串 h2；`<ProductCard />` 对应的类型则是组件函数。props 保存属性与子内容。product 是业务数据，React 元素描述它如何显示。

:::tip[自己尝试 · 本地 React]
1. 打开阶段 4 首页的 DevTools → Network，选择 JS 过滤，刷新页面。
2. 点开 ProductCard.jsx 对应请求，查看 Response，搜索 article、className 和 jsx。
3. 在 Sources 中打开原 ProductCard.jsx，对照 return 后的结构。
4. 运行 npm run build，查看 dist/assets 中生成的 JS；再运行 npm run preview 打开 /js_web/。

预期：开发响应已是 JS 函数调用，article、className、子内容能与 JSX 对上；生产产物也可显示同一张卡片。Sources 能借助映射显示原始 JSX，浏览器执行的是转换后的 JS。
:::

本课使用的浏览器和 Node 默认都不直接解析 JSX；把整段 JSX 粘进 Console，或直接 node ProductCard.jsx，会遇到语法或扩展名相关错误。使用 Vite 提供的入口就完成了转换。[Vite 的 JSX 支持](https://vite.dev/guide/features#jsx)

从源文件到页面的顺序是：Vite 处理 JSX 和模块，浏览器执行 JS 得到元素描述，React 据此创建或更新 DOM，浏览器执行布局和绘制。HTML 标签、CSS、DevTools 仍然有用。React 也能只管理页面中的一部分，根节点以外仍可保留原有界面。[在现有页面中加入 React](https://react.dev/learn/add-react-to-an-existing-project)

## 常见错误与调试

### 商品标题变成了 product.name

**现象**：阶段 4 的 `/js_web/labs/jsx.html?case=name` 显示 product.name，鼠标悬停提示却是机械键盘。Console 没有异常。

**工具**：在 Elements 选中 h2，看文本与 title；再到 Sources 打开 labs/ProductCardBroken.jsx，在 return 行设断点并刷新。[Chrome 断点操作](https://developer.chrome.com/docs/devtools/javascript/breakpoints)

```jsx
// 有问题的写法：把字段访问写成了普通文字
import { products } from "../../../shared/products.js";

const product = products[0];

export default function ProductCardBroken() {
  return <h2 title={product.name}>product.name</h2>;
}
```

**证据**：Elements 中 title 为机械键盘，文本为 product.name；暂停时在 Scope 或 Console 求值 product.name，得到机械键盘。

**原因**：数据正确，标签之间却写了普通文字。JSX 只在大括号里执行字段访问。

**修复**：保留 title，把标签里的 product.name 改为 `{product.name}`。

**确认**：同一地址刷新后，标题和提示都显示机械键盘。阶段 4 还有一条针对这个错误的 Vitest 回归，位于 labs/name.test.jsx：

```jsx
import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProductCardBroken from "./ProductCardBroken.jsx";

it("标题显示商品名称", () => {
  const html = renderToStaticMarkup(<ProductCardBroken />);
  expect(html).toContain(">机械键盘</h2>");
});
```

在阶段 4 执行 npm run test:bug，原版失败，修复后通过。这里用 React 静态标记生成函数在 Node 执行组件，检查标题内容；浏览器布局和交互仍需单独检查。

正常 npm test 选择 tests，检查卡片名称、库存与元金额；错误起点保留在 labs。

## 练习

### 练习 1：预测文字与属性

先不打开浏览器，读第 4 节的 Expressions.jsx，写下 h2 的可见文字和 title、库存段落的可见文字和 title、最后一行的完整文字。再把 product 换成 products[0]，预测库存和单价。

验收：预测后按实验地址核对，能解释引号、大括号与 0 各起什么作用。examples/c21/prediction.js 可帮助你先在 Node 核对业务值。

<details>
<summary>提示</summary>

引号中的 product.name 是固定文本，花括号中的才求值。先判断 JS 表达式的结果，再判断 React 怎样显示这个结果。

</details>

<details>
<summary>参考答案</summary>

P002：h2 显示无线鼠标，title 为 product.name；库存段落显示库存：0 件，title 为无线鼠标。最后一行是布尔值：；空值：；数字：0，false 和 null 没有生成可见文字。

改为 P001 后，库存为 12 件、单价 ¥399.00。`??` 只在 null 或 undefined 时取默认值；JSX 里的规则和普通 JS 一样。

</details>

### 练习 2：卡片没有出现，哪里丢了返回值

打开阶段 4 的 `/js_web/labs/jsx.html?case=return`，只看到「JSX 实验」。起点是 labs/ReturnBroken.jsx：

```jsx
// 有问题的写法：return 后换行，JS 自动结束了返回语句
export default function ReturnBroken() {
  return
    <h2>机械键盘</h2>;
}
```

目标：让标题机械键盘出现。验收：在 Sources 的 return 行设断点，单步确认为什么没走到 JSX；修复后同一地址出现 h2，Elements 能找到对应节点。

<details>
<summary>提示</summary>

JS 会在 return 后的换行处结束返回语句。检查函数真正返回的值，而不是只看后面有没有标签。

</details>

<details>
<summary>参考答案</summary>

labs/ReturnFixed.jsx：

```jsx
export default function ReturnFixed() {
  return (
    <h2>机械键盘</h2>
  );
}
```

左括号与 return 放同一行，使后面的 JSX 成为返回表达式。原函数提前返回 undefined，React 将它作为空内容显示，所以可能没有异常可追。修复后返回元素描述，React 才有内容可显示。

可先访问 `?case=answer` 对照结果，再自己修改错误文件重做。

</details>

### 练习 3：给卡片补上库存价值

从 src/ProductCard.jsx 开始，新增一段「库存价值：¥4788.00」，继续用固定的 P001 数据。验收：结果由 stock × priceCents 算出；原有名称、12 件、¥399.00 保持正确；生产构建与预览也能看到新段落。

<details>
<summary>提示</summary>

先在 return 前计算文本，单位仍然先用分相乘，显示时除以 100。examples/c21/view-data.js 中有同一业务计算。

</details>

<details>
<summary>参考答案</summary>

在 priceLabel 后加 `const valueLabel = (product.stock * product.priceCents / 100).toFixed(2);`，在 article 末尾加 `<p>库存价值：¥{valueLabel}</p>`。

12 × 39900 为 478800 分，显示为 4788.00 元。计算写在函数体里，返回的结构只负责放置它；不要把结果另写成一个与商品数据无关的固定数字。

</details>

## 项目进度

从 C20 的阶段 3 往前走：保留 examples/inventory/03-tooling 的 Node 报表、原生页构建和测试，新建 examples/inventory/04-react，开始同一库存业务的 React 版本。

阶段 4 沿用 react 模板入口，清理欢迎页，新增 ProductCard，让 App 组合它。参考代码从 shared/products.js 取 P001。若在仓库外的模板里跟做，把 shared/products.js 复制为 src/products.js，将组件 import 改为 `./products.js`。

styles.css 保留普通 CSS 排版。vite.config.js 启用 React 插件，base 为 /js_web/，允许读取 examples 内共享模块。labs 保存实验，tests 保存正常回归。本目录有独立的 package.json 和锁文件。

在阶段 4 目录执行：

```sh
npm ci
npm run inspect
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

预期：元素观察输出与第 5 节一致，卡片回归通过，dist 生成静态产物，预览 /js_web/ 显示机械键盘、12 件、¥399.00。开发实验页由 npm run dev 提供；正常生产构建只有应用首页入口。

React 是运行依赖，构建与测试工具是开发依赖。正文仍由 Astro 静态生成。

## 小结

- React 用组件描述界面，再把描述落实为 DOM，减少分散的手工节点更新。
- 函数组件首字母大写，通过 JSX 标签使用；Fragment 分组但不增加 DOM 节点。
- JSX 是 JS 的语法扩展，引号写字面量，大括号计算表达式；CSS 继续负责样式与布局。
- React 元素是描述对象，DOM 节点是浏览器节点；JSX 由工具转换后才执行。
- 从数据、表达式和实际 DOM 找证据；文字插值、返回换行等错误都能通过具体观察确认。

自测：

1. React、react-dom/client、Vite 分别负责什么？
2. `<ProductCard />` 和 `<productCard />` 为什么含义不同？
3. `title="product.name"` 和 `title={product.name}` 分别得到什么？
4. `style={{ marginTop: 8 }}` 两层大括号各表示什么？
5. 创建 React 元素后，为什么还没有真实 DOM 节点？

下一课用 props 和组合把数据从卡片中移出去，进一步拆分列表、卡片和工具栏。

## 延伸阅读

- [React：你的第一个组件](https://react.dev/learn/your-first-component)
- [React：使用 JSX 书写标签](https://react.dev/learn/writing-markup-with-jsx)
- [React：在 JSX 中通过大括号使用 JavaScript](https://react.dev/learn/javascript-in-jsx-with-curly-braces)
- [React DOM：createRoot](https://react.dev/reference/react-dom/client/createRoot)
- [React：createElement](https://react.dev/reference/react/createElement)
- [Vite：开始](https://vite.dev/guide/)
