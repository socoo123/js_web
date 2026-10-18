---
title: C33 现代 React 19 与更新速查
description: 用 Actions 组织异步补货，处理提交状态与乐观预览，查阅 React 更新并分清服务器能力。
sidebar:
  order: 33
---

> **第 3 周 · 第 17 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C25、C28、C32 · 运行：Node 24 与本地 React · 示例已运行验证

## 这一课解决什么问题

上一课点击补货，先等待 mock 保存，再使详情查询失效。现在产品希望按钮立即显示“正在提交”，库存先出现预计结果，保存失败时恢复原值。

你可以继续手写 pending、结果和临时 state。React 19 也提供了围绕异步操作的一组 API：Actions、useActionState、useFormStatus、useOptimistic。名字里出现 Action，并不意味着代码自动跑到服务器上。

学完你能：

- 把异步函数接到 form action，正确读取 FormData
- 用 useActionState 保存操作结果，用 useFormStatus 控制提交按钮
- 区分乐观预览、已保存结果与查询缓存，处理失败回退
- 看懂函数组件的 ref prop 和 Custom Elements 的属性、事件
- 判断 use 需要什么样的 Promise，辨认哪些能力需要服务器或框架

核心跟做是前 3 节与项目步骤，后两节的进阶实验可跳过。[Node 示例](https://github.com/socoo123/js_web/tree/main/examples/c33)在 examples/c33；在[阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)执行 `npm ci`、`npm run dev -- --host 127.0.0.1`，打开 `/js_web/labs/actions.html`。

## Java 程序员先看这里

| Java 经验 | React 对应 | 差异 |
| --- | --- | --- |
| 调用返回 CompletableFuture 的服务 | Action 中 await 异步操作 | React 跟踪 UI 的等待过程，执行位置仍取决于函数实现 |
| reducer 根据旧值计算新值 | useActionState 接收上次结果 | 这里允许异步和副作用，useReducer 的 reducer 仍必须纯 |
| 提交按钮读取任务状态 | useFormStatus 读取所属表单 | 通过 React 组件树找上层 form，和源码里写在哪一行无关 |
| 本地先显示预计库存 | useOptimistic | 临时显示不等于保存；Action 完成后重新采用来源值 |

## 1. Actions：让 React 跟踪异步提交

**Action 是在 Transition 中执行的操作函数。** Transition 协调更新与等待，不会另开线程。React 19 的 [`form action`](https://react.dev/reference/react-dom/components/form) 可以接收函数，React 会为这个入口建立 Action 上下文。

先看 labs/SimpleActionForm.jsx。它只演示收集编号和异步完成：

```jsx
import { useState } from "react";

export default function SimpleActionForm() {
  const [receipt, setReceipt] = useState("");
  async function save(formData) {
    const id = formData.get("productId");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setReceipt(`收到 ${id}`);
  }
  return <form action={save}>
    <label>商品编号 <input name="productId" defaultValue="P001" /></label>
    <button type="submit">提交编号</button>
    <p role="status">{receipt}</p>
  </form>;
}
```

在 `labs/actions.html?case=simple` 把编号改成 P002，提交后显示“收到 P002”，输入框回到 P001。函数直接接收 FormData，字段通过 name 查找，省去了 onSubmit 里的 preventDefault 和手动收集数据。

函数正常完成后，React 会重置**非受控字段**；受控输入仍由 value 对应的 state 决定。之前的商品编辑表单可以继续使用 onSubmit。

FormData 的文本字段仍是字符串，缺少字段返回 null。新 API 沿用之前的转换和校验规则。

## 2. 两种状态：本次结果与所属表单的等待

### useActionState 多传一个“上次结果”

[`useActionState`](https://react.dev/reference/react/useActionState) 返回三个值：当前结果、提交函数、isPending。把它生成的提交函数交给 form action，React 就会把表单数据转交给你写的操作。

labs/SignatureFixed.jsx 是最小例子：

```jsx
import { useActionState } from "react";

export default function SignatureFixed() {
  async function save(previousState, formData) {
    return `收到 ${formData.get("productId")}`;
  }
  const [message, submitAction, pending] = useActionState(save, "尚未提交");
  return <form action={submitAction}>
    <input type="hidden" name="productId" value="P001" />
    <button disabled={pending}>提交编号</button>
    <p role="status">{message}</p>
  </form>;
}
```

打开 `labs/actions.html?case=signature-answer`，提交后从“尚未提交”变为“收到 P001”。第一个参数依次是初始值、上次返回值；第二个才是 FormData。没用到 previousState 也要保留参数位置。

同一 Hook 的提交按顺序执行，每次接到前一次结果。操作允许副作用，useReducer 的 reducer 仍须纯。

结果可写成 `{ status, message }`。catch 后返回错误对象用于显示业务失败；未处理异常进入最近的错误边界。返回错误对象仍是正常完成，也会触发表单重置；需要保留的草稿用受控字段管理。

isPending 表示这个 Hook 是否还有待完成的操作。这里让 React 从 form action 调用 submitAction。若改成普通按钮手动触发，应在 `startTransition(() => submitAction(payload))` 中调用；普通的 onClick 并不会因为函数名含 Action 就自动建立上下文。

### useFormStatus 给按钮读取最近的上层 form

[`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus) 来自 react-dom，适合写可复用的提交按钮。项目新增 src/RestockSubmit.jsx：

```jsx
import { useFormStatus } from "react-dom";

export default function RestockSubmit({ disabled = false }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending}>
    {pending ? "正在提交并更新…" : "Action 模拟补 1 件"}
  </button>;
}
```

把 `<RestockSubmit />` 放在目标 form 内，提交时按钮禁用并显示“正在提交并更新…”，完成后恢复，无需逐层传 pending。Hook 还返回本次提交的 data、method、action。

useActionState 管自己的操作结果，useFormStatus 读最近上层表单。Java 里可能显式传任务状态；这里利用表单上下文，归属看组件树。

## 3. useOptimistic：临时显示预计结果

**乐观更新是在操作完成前，先显示预计结果。** [`useOptimistic`](https://react.dev/reference/react/useOptimistic) 接收当前来源值，返回一个显示值和临时更新函数。临时值只在 Action 进行中有效；结束后，显示重新采用传入的来源值。

详情区标“缓存库存”，保留上次读到的值；表单区显示“预览库存”，先预计多 1 件。两处文字区分临时结果与已读取结果。

先写 src/restock-action.js 的操作工厂。它沿用固定商品数据：

```js
export function createRestockAction({ product, saveProduct, showOptimistic }) {
  return async function restock(previousState, formData) {
    if (formData.get("productId") !== product.id) {
      return { status: "error", message: "商品编号不匹配，请重新打开详情。" };
    }
    if (product.stock >= 99999) {
      return { status: "error", message: "库存已到上限。" };
    }
    showOptimistic(product.stock + 1);
    try {
      const saved = await saveProduct(product.id);
      return { status: "success", message: `模拟保存成功：${saved.id} 已保存 ${saved.stock} 件。` };
    } catch (error) {
      return { status: "error", message: `保存失败：${error.message}` };
    }
  };
}
```

真实后端仍需再次校验权限与业务数据。

src/RestockActionForm.jsx 将三个 Hook 接起来：

```jsx
import { useActionState, useOptimistic } from "react";
import { useRestockMutation } from "./useRestockMutation.js";
import { createRestockAction, initialRestockResult } from "./restock-action.js";
import RestockSubmit from "./RestockSubmit.jsx";

export default function RestockActionForm({ product, saveProduct, disabled = false }) {
  const mutation = useRestockMutation(saveProduct);
  const [optimisticStock, showOptimistic] = useOptimistic(product.stock);
  const [result, submitAction, isPending] = useActionState(createRestockAction({
    product, saveProduct: mutation.mutateAsync, showOptimistic,
  }), initialRestockResult);
  return <form action={submitAction} aria-label="Action 补货" aria-busy={isPending}>
    <input type="hidden" name="productId" value={product.id} />
    <p role="status">预览库存 {optimisticStock} 件{isPending ? "（等待确认）" : "（当前缓存）"}</p>
    <RestockSubmit disabled={disabled || product.stock >= 99999} />
    {!isPending && result.message && <p role={result.status === "error" ? "alert" : "status"}>{result.message}</p>}
  </form>;
}
```

initialRestockResult 为 `{ status: "idle", message: "" }`。从 P001 的 12 件开始：

| 阶段 | 缓存库存 | 表单预览 | 提示 |
| --- | --- | --- | --- |
| 尚未提交 | 12 | 12 | 可以补货 |
| 已提交，保存未完成 | 12 | 13 | 等待确认，按钮禁用 |
| 保存、读回均成功 | 13 | 13 | 已保存 13 件 |
| 保存失败 | 12 | 12 | 保存失败，可再次尝试 |

showOptimistic 在 Action 中传入绝对值 13，避免缓存更新时再加一次。

### 与 Query 的分工

这里使用 C32 的 `mutation.mutateAsync`，因为它返回 Promise，可以 await。`mutate` 适合事件入口，但不返回用于等待保存完成的 Promise；直接 await mutate 会过早结束本次 Action。

useRestockMutation 仍在成功后等待对应详情查询失效并读回。Action 负责表单流程，Query 负责读写和缓存协调，useOptimistic 只负责这一个表单的显示。失败时来源库存没变，临时预览结束，自然显示原值；这并没有撤销已经发生的服务端操作。

还有一种情况：mock 已保存 13 件，但读回失败。页面会同时显示“已保存 13 件”和“更新失败”，缓存与预览暂时仍为 12。此时应该**重新读取详情**，让缓存追上来源。再次补货会执行另一笔业务操作。

:::tip[自己尝试 · 本地 React]
1. 打开 `labs/actions.html`，等 P001 详情成功后补 1 件。观察等待时预览 13、缓存 12，完成后两处均为 13。
2. 勾选“保存失败”，再补一次。等待时预览 14，失败后恢复 13，并显示错误。
3. 取消“保存失败”，勾选“读回失败”，再补一次。等“已保存 14 件”和更新失败都出现后，取消勾选，点击“重新读取详情”。

预期：最后缓存与预览均为 14。打开 Network，能看到静态 JSON 的 GET；补货只更新当前页面的内存 Map，没有保存 POST。刷新后回到固定起点。
:::

## 4. 读懂现代组件接口：ref prop 与 Custom Elements

### 函数组件可以直接接收 ref

React 19 的函数组件可以把 ref 当作 prop 接收，再交给真正的 DOM 节点。labs/RefPropInput.jsx 的关键部分是：

```jsx
function ProductInput({ ref }) {
  return <label>商品名称 <input ref={ref} defaultValue="机械键盘" /></label>;
}

export default function RefPropInput() {
  const inputRef = useRef(null);
  return <><ProductInput ref={inputRef} />
    <button onClick={() => inputRef.current.focus()}>聚焦名称</button></>;
}
```

完整文件从 react 导入 useRef。在 `labs/actions.html?case=ref` 点击按钮，焦点进入名称框。ref 指向的是 input 节点；函数组件必须把它继续传下去，单纯接收参数不会自动找到内部节点。

新函数组件直接用 ref prop，旧 forwardRef 仍可使用，见 [React 19 更新说明](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)。

### Custom Elements：属性传对象，事件读 detail

标签名带连字符，如 stock-badge，表示浏览器自定义元素。React 19 支持向已定义的 Custom Element 传属性和监听自定义事件。实验先导入 stock-badge.js 注册元素，再渲染：

```jsx
import { useState } from "react";
import { products } from "../../../shared/products.js";
import "./stock-badge.js";

export default function CustomElementStock() {
  const [selected, setSelected] = useState("");
  return <><stock-badge product={products[0]}
    onstock-check={(event) => setSelected(event.detail.id)} />
    <p role="status">已检查：{selected || "尚无"}</p></>;
}
```

在 `labs/actions.html?case=element`，浏览器元素显示“机械键盘：12 件”。点击后，React 区域显示“已检查：P001”。元素发出的事件名为 stock-check，JSX 用 on 加上完整事件名；大小写和连字符都需要匹配。

HTML attribute 是文本，DOM property 可以保存对象。元素在构造时定义 `this.product`，React 便把对象赋给这个 property；没提供对应 property 时，复杂值可能变成字符串 attribute。事件用 CustomEvent.detail 携带编号。

这是后面 UI5 Web Components 的基础，详见[官方规则](https://react.dev/reference/react-dom/components#custom-html-elements)。接口仍有数据和事件契约，事件由浏览器派发。

## 5. 更新附录：use、服务器能力与版本索引

### use 读取 Promise，Promise 身份需要稳定

[`use`](https://react.dev/reference/react/use) 可以在渲染中读取 Promise，也能读取 Context。Promise 等待时由 Suspense 显示 fallback，成功后返回值；拒绝时由错误边界处理。它本身不创建请求，也不提供按商品编号缓存的策略。

**先猜一猜：** 内容相同的两个 Promise，是同一份等待任务吗？运行 `node promise-identity.js`：

```js title="promise-identity.js"
const load = () => Promise.resolve({ id: "P001", stock: 12 });
console.log(load() === load());
const productPromise = load();
const read = () => productPromise;
console.log(read() === read());
console.log((await read()).stock);
```

输出 false、true、12。load 每次新建 Promise，read 返回同一对象。use 需要跨重试渲染复用 Promise；render 中直接 `use(fetch(url))` 可能出现 uncached promise 警告。首次挂载的 useMemo 也不能充当可靠请求缓存。

进阶实验 labs/PromiseProduct.jsx 在组件外创建一次 productPromise，模拟 1.2 秒读取，再把它传进以下组件：

```jsx
function Product({ promise }) {
  const product = use(promise);
  return <p>{product.id} {product.name}：{product.stock} 件</p>;
}

export default function PromiseProduct() {
  return <Suspense fallback={<p>等待读取商品…</p>}>
    <Product promise={productPromise} />
  </Suspense>;
}
```

打开 `labs/actions.html?case=use`，等待后显示“P001 机械键盘：12 件”。本例只固定一份 Promise；项目详情仍用 useQuery。

use 可放在条件和循环中，但须在组件或 Hook 内；useState 等仍遵守原规则。Java Future.get 可能阻塞线程，这里暂缓区域渲染，由边界显示等待内容。

### 浏览器 Action、Server Function、RSC 各在哪里执行

| 能力 | 执行位置与需要的支持 | 当前静态项目 |
| --- | --- | --- |
| 普通异步 Action、三个表单 Hook | 浏览器中的 React | 可以运行，保存函数使用浏览器 mock |
| 浏览器 Action 调用已有 HTTP API | 浏览器发请求，外部服务执行写入 | 可以接外部 API，本课只用 mock |
| Server Function / Server Action | 支持 RSC 的框架建立调用连接，服务器执行函数 | Pages 没有执行用户提交的服务器进程 |
| React Server Components（RSC） | 专门的构建或服务器环境先运行组件 | 可以在支持它的工具中构建静态结果；普通 Vite React 项目没有自动启用 |

[Server Function](https://react.dev/reference/rsc/server-functions) 是在服务器执行、可从客户端调用的函数；用于 Action 场景时才称 Server Action。`"use server"` 是相关框架识别服务器函数的指令，给浏览器函数加这一行不会把它搬去服务器。Server Component 则是组件的执行方式，并没有用 `"use server"` 标记组件的规则。

[RSC](https://react.dev/reference/rsc/server-components) 可以在构建时运行一次，也可以在请求时运行，因此“用了 RSC”并不等于必须一直开服务器。需要用户点击后查询数据库、保存数据的 Server Function，则需要可处理该请求的服务。本课课程正文由 Astro 静态构建；库存练习是 Vite 客户端应用，两者都没有引入 RSC 框架。

### React 19 更新索引

下面按正式版本列索引，按需查阅。

| 版本 | 代表更新 | 什么时候查 |
| --- | --- | --- |
| React 19 | Actions、useActionState、useFormStatus、useOptimistic、use；ref prop、Custom Elements、Context 直接作 Provider | 本课提交与组件接口；Context 写法前面已用 |
| React 19.2 | Activity、useEffectEvent、React Performance Tracks；服务器侧 cacheSignal 与预渲染改进 | 保留隐藏界面状态、区分 Effect 的响应逻辑、分析性能；服务器 API 按架构选择 |
| React 19.3 | 稳定的 ViewTransition、Fragment refs；react-dom 的 browser()、Trusted Types 支持；Server Component 中直接渲染 Context Provider | 转场、多节点操作、服务器渲染中的浏览器专属区域等进阶需求 |

官方入口：[19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2)、[19.3 发布说明](https://react.dev/blog/2026/09/09/react-19-3)。

ViewTransition 和 Fragment refs 在 19.3 已稳定，转场仍要检查目标浏览器支持。

## 常见错误与调试

### formData.get is not a function

**现象**：打开 `labs/actions.html?case=signature`，提交编号后显示“formData.get is not a function”。

**工具**：DevTools → Sources → 打开 SignatureBroken.jsx，在 `formData.get` 那行设断点，再次提交。**证据**：Local 中 formData 是字符串“尚未提交”，并非 FormData。**原因**：把普通 form action 的单参数函数直接交给 useActionState，参数向后移动了一位。

**修复**：把 `save(formData)` 改成 `save(previousState, formData)`，函数体保持原样。**确认**：刷新并提交，显示“收到 P001”。在阶段 4 执行 `npm run test:bug -- labs/actions-bugs.test.jsx`，对应测试会从失败变为通过；仓库保留原始错误起点，signature-answer 提供可运行对照。

### 请求还没结束，按钮一直显示空闲

**现象**：`labs/actions.html?case=status` 点击提交，等待的一秒多里按钮始终可点。错误文件的关键结构是：

```jsx
// 有问题的写法：Hook 读不到同一组件返回的 form
import { useFormStatus } from "react-dom";

export default function StatusScopeBroken({ save = () => new Promise((resolve) => setTimeout(resolve, 1200)) }) {
  const { pending } = useFormStatus();
  return <form action={save}>
    <p role="status">{pending ? "正在提交" : "空闲"}</p>
    <button type="submit" disabled={pending}>提交表单</button>
  </form>;
}
```

**工具**：Sources 在 save 内的 setTimeout 行设断点。**证据**：操作尚未结束，页面仍显示“空闲”，按钮未禁用。**原因**：useFormStatus 向上读取上下文，这个组件返回的 form 在它下面，pending 一直为 false。

**修复**：把读取 Hook 和按钮提取成 SubmitStatus 子组件，再在 form 内渲染它，参考 StatusScopeFixed.jsx。**确认**：打开 status-answer 提交，出现“正在提交”，按钮禁用，完成后恢复。actions-bugs.test.jsx 有对应回归。

## 练习

### 练习 1：上次结果是谁

**先猜一猜：** 第二次调用的 previousState 是什么？在 examples/c33 运行 `node prediction.js` 核对：

```js title="prediction.js"
const initialState = "尚未提交";
const formData = new FormData();
formData.set("productId", "P002");
async function save(previousState, data) {
  console.log("上次结果", previousState);
  return `收到 ${data.get("productId")}`;
}
const result = await save(initialState, formData);
console.log("本次结果", result);
await save(result, formData);
```

<details>
<summary>提示</summary>

区分函数的两个参数：一个是之前返回的状态，一个是这次提交的数据。await 返回的是函数的返回值。

</details>

<details>
<summary>参考答案</summary>

三行依次为“上次结果 尚未提交”“本次结果 收到 P002”“上次结果 收到 P002”。useActionState 会替你保存并传递上次结果；本题手动传参，方便看清它不是 FormData 本身。

</details>

### 练习 2：修好两个提交入口

从 SignatureBroken.jsx 和 StatusScopeBroken.jsx 开始。验收：前者提交显示“收到 P001”；后者在等待中禁用按钮，完成后恢复。运行 actions-bugs.test.jsx，两条断言都应通过。

<details>
<summary>提示</summary>

第一处检查函数签名；第二处画出 form 与调用 Hook 的组件的父子关系。

</details>

<details>
<summary>参考答案</summary>

第一处增加 previousState 参数。第二处把 Hook 和按钮提取成子组件，再放进 form。只移动按钮而不移动 Hook，读到的上下文不会改变。

</details>

## 项目进度

从 C32 的 examples/inventory/04-react 继续。新增上面的操作工厂、表单和按钮；ProductDetailRoute 改接 ActionProductDetails，按商品编号设置 key。旧 query 实验保留。

新详情外层复用同一查询，让读取视图和表单共享缓存：

```jsx
export default function ActionProductDetails({ productId, loadProduct, saveProduct }) {
  const query = useProductQuery(productId, loadProduct);
  return <>
    <CachedProductDetails productId={productId} loadProduct={loadProduct} />
    {query.data && saveProduct && <RestockActionForm key={productId} product={query.data}
      saveProduct={saveProduct} disabled={query.isFetching} />}
  </>;
}
```

完整文件含 import。切换商品重置表单，缓存继续保留；补货期间离开详情，完成后仍按保存响应 id 失效原商品。

在阶段 4 执行 `npm run lint`、`npm test`、`npm run build`，再执行 `npm run preview -- --host 127.0.0.1`。打开 `/js_web/#/products/P002?q=鼠标`，鼠标起点为 0 件，Action 补货后详情变为 1；返回筛选列表，总库存仍为本地数据的 52。刷新后 mock 与缓存恢复起点。

labs 仅用于开发服务，生产入口仍是应用首页；课程 Pages 发布静态正文。

## 小结

- Action 可在浏览器执行异步函数，执行位置看具体实现。
- useActionState 先收上次结果，再收本次数据。
- useFormStatus 从子组件读取上层表单。
- 乐观预览是临时值，保存失败与读回失败需分别处理。
- ref prop 和 use 各有接口规则，Server Function 需要服务器。

自测：

1. 普通 form action 与 useActionState 的操作函数，参数为什么不同？
2. 为什么同一组件里调用 useFormStatus，读不到自己返回的 form？
3. mock 已保存 13，读回失败时为什么预览可能仍显示 12？
4. 每次 render 都新建 fetch Promise，use 为什么难以复用？
5. 给 Vite 项目的函数加上“use server”，Pages 会运行它吗？

下一课先测量渲染成本，再讨论性能优化、加载边界与错误诊断。

## 延伸阅读

- [React：form action](https://react.dev/reference/react-dom/components/form)
- [React：useActionState](https://react.dev/reference/react/useActionState)
- [React DOM：useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React：useOptimistic](https://react.dev/reference/react/useOptimistic)
- [React：use](https://react.dev/reference/react/use)
- [React：Server Functions](https://react.dev/reference/rsc/server-functions)
