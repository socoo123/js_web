---
title: C27 useReducer 与 Context
description: 用纯 reducer 组织库存 action，通过 Context 连接跨层消费者，分清业务数据、界面状态与服务端状态。
sidebar:
  order: 27
---

> **第 3 周 · 第 14 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C23–C26 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

要找出「哪些操作改变库存」，你得在 App 的几个事件函数之间来回找。拆开目录、统计、编辑区之后，它们又都要读取 products，中间层开始只为转交数据而接收 props。

reducer 集中描述数据怎样变化，Context 让后代读取共同的数据。C26 的草稿归属和重置策略继续适用。

学完你能：

- 把补货、删除、保存、新增写成 action，交给纯 reducer 计算
- 解释 dispatch 后的旧快照和连续 action 的处理结果
- 用 Vitest 检查不可变更新、业务边界和非法 action
- 建立 Provider，并找到消费者实际读取的那一份库存
- 按业务数据、界面状态、服务端状态的职责安排数据

纯 JS 例子在 [examples/c27](https://github.com/socoo123/js_web/tree/main/examples/c27)。以下其他相对文件名属于 [库存项目阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)。

## Java 程序员先看这里

| Java 经验 | React 对应 | 一句话差异 |
| --- | --- | --- |
| 按命令类型执行 switch | 按 action.type 选择更新 | reducer 返回新数据，不修改当前对象 |
| Service 修改对象字段 | dispatch 请求一次状态更新 | 事件中的旧 state 仍是原来的快照 |
| 把参数逐层传到下游 | props；跨层时可用 Context | Context 按组件树向上找最近的 Provider |
| 容器按作用域提供实例 | Provider 为后代提供 value | Context 对象本身不保存某份应用库存 |
| 单测业务方法 | 直接测试 reducer | 纯计算可以脱离 React 和浏览器执行 |

## 1. action 说发生了什么，reducer 算下一份数据

reducer 接收当前 state 和 action，返回下一份 state。库存 state 是商品数组；action 是普通对象，例如 `{ type: "restocked", id: "P002" }`。type 由你命名，id 指明操作对象。

先只处理补货。下面是 labs/MutationReducerFixed.js 的完整内容：

```js
export function restockReducer(products, action) {
  if (action.type === "restocked") {
    return products.map((product) => product.id === action.id
      ? { ...product, stock: Math.min(product.stock + 1, 99999) }
      : product);
  }
  throw new Error(`未知 action：${action.type}`);
}
```

给它固定六件商品和 P002 的补货 action，无线鼠标从 0 到 1，总库存由 52 到 53。函数没有调用 Hook，在 Node 中直接调用同样成立。

**先猜一猜：** 先给鼠标补 1 件，再删掉库存 12 件的键盘，总库存是多少？原数组里的鼠标会变化吗？在 examples/c27 运行 `node action-flow.js`：

```js title="action-flow.js"
import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const afterRestock = productsReducer(products, { type: "restocked", id: "P002" });
const afterDelete = productsReducer(afterRestock, { type: "removed", id: "P001" });
console.log("原始鼠标", products[1].stock);
console.log("补货后鼠标", afterRestock[1].stock);
console.log("删除后种类", afterDelete.length);
console.log("删除后总库存", afterDelete.reduce((sum, product) => sum + product.stock, 0));
```

依次输出：原始鼠标 0、补货后鼠标 1、删除后种类 5、删除后总库存 41。第二次调用把 afterRestock 作为输入，所以删除建立在补货之后。原始 products 作为旧快照保留。

补货 action 只需 id；保存 action 带通过表单校验的 changes。把整份旧 products 塞进 action 再替换，会让旧快照覆盖新结果。

Java 中可把 action 类比成命令对象，reducer 类比处理命令的 switch；区别是这里的处理结果是一份新值，而不是对 Service 持有的对象执行原地修改。

## 2. useReducer 把纯计算接到 React 上

[`useReducer`](https://react.dev/reference/react/useReducer) 返回当前 state 和 dispatch。React 收到 action 后，让 reducer 根据待处理的 state 计算下一份数据，再渲染界面。useReducer 和 useState 一样在组件顶层调用。

下面是 labs/ReducerQueue.jsx。初始鼠标库存为 0，按钮在同一个事件里派发两次补货：

```jsx
import { useReducer } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import { productsReducer } from "../src/products-reducer.js";

export default function ReducerQueue() {
  const [products, dispatch] = useReducer(productsReducer, initialProducts, structuredClone);
  const stock = products.find((product) => product.id === "P002").stock;
  function handleClick() {
    console.log("点击时", stock);
    const result = dispatch({ type: "restocked", id: "P002" });
    dispatch({ type: "restocked", id: "P002" });
    console.log("派发后", stock, result);
  }
  return <button type="button" onClick={handleClick}>鼠标库存 {stock} 件，连续补两次</button>;
}
```

**先猜一猜：** 第一次点击后，两个日志、按钮上的数字分别是多少？先写答案再运行。

第一次 Console 输出「点击时 0」和「派发后 0 undefined」，按钮变成 2；第二次日志里的快照都是 2，按钮变成 4。dispatch 没有返回值；旧事件函数里的 stock 仍属于点击时那次渲染。

两次 action 都表达「在待处理库存上加一」。第二次接到第一次的结果，从 0 到 1 再到 2；没有拿闭包里的旧 stock 构造替换值，和 C23 函数式更新同理。

第三个参数 structuredClone 是初始化函数：接收 initialProducts，产生本实例的独立起点。后续渲染沿用 state，初始参数变化也不会自动重置库存。dispatch 与 Java 的同步业务方法不同，返回值不是保存结果。

:::tip[自己尝试 · 本地 React]
1. 进入 examples/inventory/04-react，首次准备依赖运行 `npm ci`，再运行 `npm run dev -- --host 127.0.0.1`。
2. 打开终端给出的 /js_web/ 地址，在后面加 `labs/reducer-context.html?case=queue`。
3. 按 F12 打开 Console，点击两次按钮，对照上面的快照预测。

预期：界面依次为 2、4；第一次派发后日志仍为 0，返回值为 undefined。刷新后重新从 0 开始。
:::

## 3. 复杂更新集中，边界也集中

实际项目的 src/products-reducer.js 组织四种 action，继续调用 C24、C25 已有的更新函数。下面展示它的导出函数；同文件的 checkedChanges 负责保存数据校验。

```js
export function productsReducer(products, action) {
  const type = action?.type;
  if (["restocked", "removed", "saved"].includes(type)
    && (typeof action.id !== "string" || !/^P\d{3}$/.test(action.id))) {
    throw new TypeError("商品编号无效");
  }
  switch (type) {
    case "sampleAdded":
      return addSampleProduct(products);
    case "restocked":
      return restockProduct(products, action.id);
    case "removed":
      return removeProduct(products, action.id);
    case "saved":
      return updateProduct(products, action.id, checkedChanges(action.changes));
    default:
      throw new Error(`未知 action：${type}`);
  }
}
```

四种操作现在有一个入口：

| type | 其余字段 | 结果 |
| --- | --- | --- |
| sampleAdded | 无 | 按当前最大编号生成新商品，默认 0 件、0 分 |
| restocked | id | 对应商品补 1 件，上限 99999 |
| removed | id | 删除对应商品 |
| saved | id、changes | 用已校验字段更新商品，保留原 id |

ProductForm 先把输入校验为业务数据；reducer 再检查名称、分类、整数库存、整数分和字符串标签数组。保存字段按白名单取出，并复制 tags；多带一个 id 也改不了商品身份。

正常输错由表单显示字段错误；未知 type、缺失 id 或把库存字符串传进 reducer，属于调用代码的问题。在 examples/c27 运行 `node invalid-action.js`，依次得到未知 action 的 Error、编号无效与保存数据无效的 TypeError，鼠标仍为 0。

编号格式正确但记录已不存在时，本项目保留数据内容，例如商品删除后又收到旧操作。这条规则由应用定义。

### 纯函数让规则可重复计算

纯 reducer 相同输入得到相同结果，保留原有 state 和 action。请求、存储、焦点、定时器会改变外部世界，放在事件或同步外部系统的位置。

新增编号从输入数组计算，同一输入两次都产生 P007。模块级 `nextId++` 却会消耗两个编号。业务需要时间或随机结果时，先在事件里确定，再放进 action。

开发环境的 StrictMode 可能重复调用 reducer 和初始化函数来检查纯度，采用其中一次的结果。纯 reducer 仍只让一次补货增加一件；看到错误倍增时应查输入有没有被修改。

这类似 Java 中「旧值 + 命令 → 新值」的业务方法，可以脱离 React 和浏览器测试。

## 4. Context 让后代读取同一份库存

[`createContext`](https://react.dev/reference/react/createContext) 创建一个通道的标识；Provider 在组件树中提供 value，后代用 useContext 读取。库存依然由 useReducer 保存，Context 负责传递。

src/InventoryContext.jsx 的完整内容如下：

```jsx
import { createContext, useReducer } from "react";
import { products as initialProducts } from "../../../shared/products.js";
import { productsReducer } from "./products-reducer.js";

export const ProductsContext = createContext(null);
export const ProductsDispatchContext = createContext(null);

export function InventoryProvider({ children }) {
  const [products, dispatch] = useReducer(productsReducer, initialProducts, structuredClone);
  return (
    <ProductsContext value={products}>
      <ProductsDispatchContext value={dispatch}>
        {children}
      </ProductsDispatchContext>
    </ProductsContext>
  );
}
```

React 19 支持直接用 `<ProductsContext value={products}>` 提供值；旧项目常见的 `<ProductsContext.Provider value={products}>` 表达同样的提供关系。这里把库存和 dispatch 拆成两个 Context：只负责派发操作的组件可以只读取 dispatch。

消费端 src/InventorySummary.jsx 不再接收 products prop：

```jsx
import { useContext } from "react";
import { ProductsContext } from "./InventoryContext.jsx";

export default function InventorySummary() {
  const products = useContext(ProductsContext);
  if (products === null) throw new Error("InventorySummary 需要 InventoryProvider");
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalCents = products.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
  return <p>全部：{products.length} 种 · 总库存 {totalStock} 件 · 库存总价值 ¥{(totalCents / 100).toFixed(2)}</p>;
}
```

初始显示 6 种、52 件、26348.00 元。给鼠标补货后，Provider 的 products 改变，Summary 读取新数组，显示 53 件、26477.00 元。统计值每次从来源计算，仍不另存 state。

[`useContext`](https://react.dev/reference/react/useContext) 从调用组件向上找**最近的同一个 Context 的 Provider**，中间隔多少层都可以。同一组件返回的 Provider 只能覆盖它的后代，覆盖不到该组件自身调用的 useContext。提供与消费必须 import 同一个 Context 对象；在消费者文件里另写 createContext 会建立另一个通道。

没有 Provider 时返回默认 null；明确提供 undefined 时读到 undefined。库存页将缺少 Provider 视为结构错误并抛异常，missing 实验则显示默认值。

Context 的 value 按 Object.is 比较，值变化会通知消费者。一个大对象里的任意字段变化，都会通知读取该 Context 的组件。dispatch 身份稳定，单独提供可减少订阅范围；组件仍可能随父组件渲染。

Java 依赖注入可类比「按作用域提供值」。React 的作用域由组件树决定，两个 InventoryProvider 实例各有自己的库存。

## 5. 哪些数据放进去，由谁需要它决定

这次让 InventorySummary、InventoryCatalog 和编辑所在的 InventoryPage 读取同一份库存。App 只负责建立屏幕级的共享范围：

```jsx
export default function App() {
  return <InventoryProvider><InventoryPage /></InventoryProvider>;
}
```

初始库存仍为 52。Catalog 补货后，Summary 和编辑区都读取新值；状态仍归 InventoryProvider 所有，中间层省去转交 products。

按用途划分，当前项目的数据放在这些位置：

| 数据 | 归属 | 原因 |
| --- | --- | --- |
| products | Provider 中的 reducer | 多个业务区域共同使用的已保存数据 |
| query、category、order | InventoryCatalog 的 useState | 只控制目录怎样显示 |
| editingId、notice | InventoryPage 的 useState | 协调单一编辑区、成功提示和焦点 |
| draft、errors | ProductForm 的 useState | 代表本次未提交的输入 |
| visibleProducts、总库存、总价值 | 渲染时计算 | 可以由现有来源推导 |
| 后端商品、缓存新旧、请求状态 | 接入请求时单独管理 | 由外部服务拥有，需要加载、失败与刷新规则 |

最后一行是**服务端状态**。本课 products 是本地业务数据，刷新恢复样例。接入服务后，Context 可以传递读取入口；缓存、重试和过期策略需要另行实现。

同一次补货，卡片本地复制 stock 会让卡片变成 1、统计仍是 52；共同读取 Provider 的 products 才能得到 1 和 53。把总库存另存 state 又需要同步，所以 reducer 管来源、派生值直接算。

鼠标草稿改成 3 时，已保存库存仍为 0，总库存仍为 52。saved 才把它们变为 3 和 55；每次输入都派发 saved 会让取消失去意义。

ProductList、ProductCard、ProductForm 继续接收 props，便于独立使用。editingId/onEdit 的传递关系短而明确，继续用 props。Context 只共享多个区域需要的业务来源。组件本地状态可类比 Java 界面对象自己的字段，更新则遵守 React 快照规则。

## 常见错误与调试

### 补货函数跑了，页面还显示 0

**现象**：打开 `labs/reducer-context.html?case=mutation`，点击「给鼠标补 1 件」，页面仍显示鼠标 0 件、总库存 52 件。这个 reducer 修改了旧数组里的商品：

```js
// 有问题的写法：改坏旧快照，再返回同一个数组
export function restockReducer(products, action) {
  if (action.type === "restocked") {
    const product = products.find((item) => item.id === action.id);
    product.stock += 1;
    return products;
  }
  throw new Error(`未知 action：${action.type}`);
}
```

**工具**：在 DevTools → Sources 找到 labs/MutationReducerBroken.js，在 `product.stock += 1` 的行号上设断点，点击补货。暂停时看 Scope，或在 Console 求值 `product.stock`；单步执行后再看一次。

**证据**：第一次进入时 product.stock 为 0，执行后变成 1，返回的仍是入参 products。旧输入已被改坏。

**原因**：返回同一引用时，React 可以跳过界面更新；而旧快照已经被污染。开发纯度检查再次计算，还会继续修改同一对象。

**修复**：换成第 1 节的 MutationReducerFixed：map 返回新数组，对象展开复制目标商品。仅写 `[...products]` 仍共享商品对象。

**确认**：打开 case=mutation-answer，连续点击后鼠标为 1、2，总库存为 53、54。在 examples/c27 运行 `node immutable-update.js`，依次得到 false、false、true、0 1：容器与目标商品变了，未改的键盘继续共享，旧鼠标保留 0。

为这个 bug 写进 labs/reducer-context-bugs.test.jsx 的回归如下，使用本文件已导入的 products、restockReducer、it、expect：

```js
it("补货必须保留调用前的旧快照", () => {
  const before = structuredClone(products);
  const after = restockReducer(before, { type: "restocked", id: "P002" });
  expect(before[1].stock).toBe(0);
  expect(after[1].stock).toBe(1);
  expect(after).not.toBe(before);
});
```

这项测试既查新结果，也查旧输入。只断言 after 为 1，会放过原地修改的错误。正常 tests/reducer.test.jsx 还冻结起点及 tags，让修改旧数据的代码直接失败。

### 按钮和统计用了两份库存

**现象**：打开 case=split，补货后统计仍为 52，但 reducer 已经使用不可变更新。labs/ContextSplitBroken.jsx 的结构是：

```jsx
// 有问题的写法：按钮和统计最近的 Provider 不是同一个
import { InventoryProvider } from "../src/InventoryContext.jsx";
import InventorySummary from "../src/InventorySummary.jsx";
import RestockMouse from "./RestockMouse.jsx";

export default function ContextSplitBroken() {
  return (
    <InventoryProvider>
      <RestockMouse />
      <InventoryProvider><InventorySummary /></InventoryProvider>
    </InventoryProvider>
  );
}
```

**工具**：打开 React DevTools → Components，搜索 InventoryProvider。依次选中外层和内层，在 Hooks 中查看保存商品的 Reducer；点击补货后再比较 P002。Sources 中也可以在两个消费者的 useContext 之后设断点检查值。

**证据**：外层 P002 的 stock 已是 1，内层仍为 0。RestockMouse 读取外层 dispatch；Summary 最近的 Provider 却是内层，所以总库存继续是 52。

**原因**：新增一个带 useReducer 的 Provider，就新增了一份库存状态。内层值遮住外层值；名称相同不代表状态实例相同。

**修复**：删掉只包着 Summary 的那层 InventoryProvider。正确结构见 labs/ContextJoined.jsx：

```jsx
import { InventoryProvider } from "../src/InventoryContext.jsx";
import InventorySummary from "../src/InventorySummary.jsx";
import RestockMouse from "./RestockMouse.jsx";

export default function ContextJoined() {
  return (
    <InventoryProvider>
      <RestockMouse />
      <InventorySummary />
    </InventoryProvider>
  );
}
```

**确认**：case=split-answer 点击后为 53。在阶段 4 运行 `npm run test:bug -- labs/reducer-context-bugs.test.jsx`，两项测试开始都会失败；修好两个 Broken 文件后应全部通过。

打开 case=scope，给库存 A 补货，A 为 53、B 仍为 52，是有意隔离。case=missing 无 Provider，显示「尚未连接库存」。

## 练习

### 练习 1：算一组 action

先写出三个输出，再在 examples/c27 运行 `node prediction.js`。验收：能逐步说明每次 reducer 接到哪份商品数组。

```js title="prediction.js"
import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const actions = [
  { type: "restocked", id: "P002" },
  { type: "restocked", id: "P002" },
  { type: "removed", id: "P001" },
];
const result = actions.reduce(productsReducer, products);
console.log(result.find((product) => product.id === "P002").stock);
console.log(result.reduce((sum, product) => sum + product.stock, 0));
console.log(products[1].stock);
```

<details>
<summary>提示</summary>

reduce 的累加值是整份库存 state。每次用上一次返回的数组继续算，最后才读取库存和总数。

</details>

<details>
<summary>参考答案</summary>

输出 2、42、0。总数从 52 到 53、54，删除键盘后减去 12，得到 42。原始 products 从未被修改，原始鼠标仍为 0。这里用数组 reduce 演示连续计算；真实 React 的 dispatch、渲染和批处理由 React 负责。

</details>

### 练习 2：修 bug，再验证非法 action

修好上面两个 Broken 文件，让两项 bug 回归通过。再向 tests/reducer.test.jsx 补一个专门检测 type 拼错的测试。验收：把 restocked 写成 restokced 时明确报错，旧库存保留 0。

<details>
<summary>提示</summary>

检查副作用和 Provider 范围是两条排查路线。测试异常时把调用包在函数里，交给 expect 执行；直接调用会在断言之前抛出。

</details>

<details>
<summary>参考答案</summary>

两个修复分别使用 MutationReducerFixed 的不可变更新和 ContextJoined 的共享范围。可在测试文件中使用已有导入补上：

```js
it("拼错 type 时明确失败并保留旧数据", () => {
  const before = structuredClone(products);
  expect(() => productsReducer(before, { type: "restokced", id: "P002" }))
    .toThrow("未知 action：restokced");
  expect(before[1].stock).toBe(0);
});
```

default 抛异常能暴露拼写错误；静默返回原 state 会让按钮看似无响应。现有测试还覆盖缺失编号和非法保存数据，可一起运行检查。

</details>

## 项目进度

从 C26 的 examples/inventory/04-react 继续。本课新增 src/products-reducer.js、InventoryContext.jsx、InventorySummary.jsx、InventoryCatalog.jsx，App 用 Provider 包住 InventoryPage。Catalog 接管筛选、排序和目录渲染；Summary 直接读取库存；Page 保留编辑协调。

原来的 setProducts 更新改为 dispatch。保存仍通过 ProductForm 的回调到达 Page，输入校验、关闭编辑和焦点安排继续各司其职：

```js
  function handleSave(id, changes) {
    dispatch({ type: "saved", id, changes });
    setEditingId(null);
    setNotice(`已保存 ${id}。如未见卡片，请检查筛选条件。`);
    document.getElementById("inventory-heading")?.focus();
  }
```

保存后表单关闭，焦点回标题，reducer 只处理商品计算。Page 删除当前商品时结束编辑；Catalog 直接派发新增和补货。三个展示与表单组件无需修改。

:::tip[自己尝试 · 本地 React]
1. 刷新首页，确认 6 种、52 件、26348.00 元；给 P002 补 1 件，确认 53 件、26477.00 元。
2. 编辑 P002，填库存 3、单价 129.90，保存；重新打开应读到保存值，再取消。
3. 新增两次，确认出现 P007、P008；搜索鼠标后删除 P002，清空搜索，检查统计。
4. 在阶段 4 运行 `npm test` 和 `npm run build`，再运行 `npm run preview -- --host 127.0.0.1` 检查生产首页。

预期：第 2 步总库存 55、总价值 26737.70 元；第 3 步剩余 7 种、52 件、26348.00 元。所有操作仍只保存在当前页面，刷新恢复固定六件商品。
:::

tests/reducer.test.jsx 检查业务与非法 action，tests/context.test.jsx 检查共享、隔离、队列和本地状态保留。七个实验的入口见阶段 README。

## 小结

- action 描述发生的业务操作；reducer 根据当前待处理 state 返回新 state。
- dispatch 请求下一次更新，旧事件仍读取旧快照；连续 action 依次使用前一次结果。
- reducer 保持纯计算，用测试同时检查新结果、旧输入和非法 action。
- Context 读取最近 Provider 的 value；不同 Provider 实例可以各自持有库存。
- 共享业务来源进 Context，本地草稿与筛选留在所属组件，派生值直接计算。

自测：

1. reducer 可以直接在 Node 中调用，useReducer 多做了什么？
2. 为什么两次 restocked 能加二，派发后打印 stock 却还是旧值？
3. 为什么复制数组后直接改里面的商品仍会污染旧快照？
4. 按钮和统计使用同一个 Context，为何仍可能读到两份库存？
5. 哪些问题应在表单提示，哪些问题应该让 reducer 抛异常？

下一课用 useRef 保存 DOM 与可变句柄，继续区分哪些变化需要重新渲染。

## 延伸阅读

- [React：把状态逻辑提取到 reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [React：useReducer 参考](https://react.dev/reference/react/useReducer)
- [React：使用 reducer 和 Context 扩展应用](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [React：useContext 与最近的 Provider](https://react.dev/reference/react/useContext)
- [React：createContext 与默认值](https://react.dev/reference/react/createContext)
- [React：通过 Context 深层传递数据](https://react.dev/learn/passing-data-deeply-with-context)
