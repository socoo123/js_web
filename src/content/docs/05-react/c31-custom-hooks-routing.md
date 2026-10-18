---
title: C31 自定义 Hooks 与路由
description: 提取可复用的请求与存储 Hook，用 hash 路由连接商品列表、详情和筛选 URL，让刷新、分享与后退都有明确结果。
sidebar:
  order: 31
---

> **第 3 周 · 第 16 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C26、C29、C30 · 运行：Node 24 与本地 React · 示例已运行验证

## 这一课解决什么问题

上一课已经能安全切换商品详情。现在你想把同样的请求行为放进另一个区域，却发现要复制 state、Effect、取消和重试一整套代码。

另一个问题来自地址栏：你选了无线鼠标，把网址发给同事，他打开仍是默认页面；刷新后，你的选择也消失了。详情只存在于组件 state 中，URL 没有描述它。

这课做两件事：把重复的行为提取为自定义 Hook，把值得刷新和分享的页面位置放进 URL。学完你能：

- 提取一个返回请求状态、取消和重试入口的 Hook，保留上一课的清理规则
- 解释为什么调用同一个 Hook 两次，各自拥有独立的 state
- 设计输入、返回值和依赖明确的 Hook，并处理本地记录损坏
- 用 React Router 连接列表、详情、嵌套路由和不存在页
- 通过 hash 中的参数恢复筛选，让分享、刷新与后退可用

示例在 [examples/c31](https://github.com/socoo123/js_web/tree/main/examples/c31)，进入目录运行 `node 文件名.js`。React 在 [阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)：执行 `npm ci`、`npm run dev -- --host 127.0.0.1`。

## Java 程序员先看这里

| Java 经验 | React / 浏览器对应 | 差异 |
| --- | --- | --- |
| 把重复行为提取成方法 | 自定义 Hook 调用其他 Hooks | Hook 仍遵守顶层调用规则，不能在事件里临时调用 |
| 复用类的定义 | 多个组件调用同一个 Hook | 复用定义，各次调用的 state 仍独立 |
| 单例 Service 保存共享数据 | 共同父节点或 Context 拥有 state | Hook 文件本身不会成为共享状态容器 |
| Spring 路径参数 | `useParams()` 读取路由参数 | 本课由浏览器匹配，参数仍需校验 |
| HTTP 请求的 query 参数 | 路由中的搜索参数 | hash 路由的参数在 # 后，服务器收不到它们 |

## 1. 自定义 Hook：复用行为，各自保存状态

自定义 Hook 以 `use` 加大写字母开头，内部调用其他 Hooks，可以返回任意值。先看两个盘点按钮：

```js
import { useState } from "react";

export function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount((n) => n + 1) };
}
```

调用方不用再重复状态更新方式：

```jsx
import { useCounter } from "./useCounter.js";

export default function HookCounters() {
  const first = useCounter();
  const second = useCounter();
  return <>
    <button onClick={first.increment}>盘点 A：{first.count}</button>
    <button onClick={second.increment}>盘点 B：{second.count}</button>
  </>;
}
```

**先猜一猜：** 连点两次 A，B 会不会跟着变？打开 `labs/hooks.html?case=counters`，结果是 A 为 2、B 为 0。

每次调用 useCounter 都相当于在对应位置声明一份 useState。React 按组件身份和调用位置保存状态。这个小 Hook 用来观察规则，实际提取通常封装请求启停等完整行为。

[复用 Hook 逻辑](https://react.dev/learn/reusing-logic-with-custom-hooks)和共享某份 state 是两件事。两次 useProductRequest 会各自保存状态、各自发请求。共享库存仍读 ProductsContext，共用请求结果也要找到共同拥有者。

Java 的类定义可以供多个对象复用，实例字段仍各有一份；Hook 的状态归属由 React 的组件树和调用位置决定。

## 2. 把请求生命周期提取出来，依赖仍要完整

C30 的 ProductDetails 同时做两件事：维护请求生命周期，渲染 RequestView。将 state、Effect、取消 ref 和重试计数原样移进 `src/useProductRequest.js`，返回 `{ request, cancel, retry }`，组件就能只描述视图：

```jsx
import { useProductRequest } from "./useProductRequest.js";
import RequestView from "./RequestView.jsx";

export default function ProductDetails({ productId, loadProduct }) {
  const { request, cancel, retry } = useProductRequest(productId, loadProduct);
  return <RequestView request={request} onCancel={cancel} onRetry={retry} />;
}
```

打开 `labs/hooks.html?case=request`：加载、切换、取消和重试的行为与上一课一致，原有回归测试继续适用。

| Hook API | 本课约定 |
| --- | --- |
| productId | string 或 null；null 表示不请求 |
| loadProduct | 默认使用模块级 fetchProduct；接收 id 与 signal，返回 Promise |
| request | idle / loading / success / error / cancelled 之一，带对应编号与结果 |
| cancel | 使当前操作失效并取消资源，界面进入 cancelled |
| retry | 改变 attempt，启动一次新操作 |

useProductRequest 的结尾如下，完整的请求和清理代码与 C30 相同：

```js
    return () => { stop(); cancelRef.current = null; };
  }, [productId, attempt, loadProduct]);
  const visible = productId === null ? { status: "idle", id: null }
    : request.id === productId ? request : { status: "loading", id: productId };
  return { request: visible, cancel: () => cancelRef.current?.(),
    retry: () => setAttempt((n) => n + 1) };
}
```

productId、attempt、loadProduct 改变时，旧 cleanup 先失效旧请求，新 setup 再启动。组件渲染会将新参数传进 Hook。

默认 fetchProduct 放在模块顶层，函数身份稳定。若传入 `(id, options) => fetchProduct(id, options)`，每次父组件渲染都会新建函数，loadProduct 依赖也随之变化，可能反复重新加载。直接传 fetchProduct 就能表达同一个意思。依赖应跟着实际读取的值走，删依赖只会掩盖问题。

按[Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)在顶层调用 Hook，null 分支放进内部 Effect。事件只调用返回的 cancel 等函数。Java 中提取方法不会消除捕获关系，提取 Hook 也保留闭包与依赖。

## 3. 存储 Hook：先约定范围，再封装读写

再做一个有实际用途的抽象：把本机备注存进 localStorage。这里的 `useLocalStorage(key, initialValue)` 专门保存**文本**：输入和返回值都是 string，以 JSON 字符串写入；key 在这个组件实例存活期间固定。它返回 `[value, save, error]`。

先把读取和数据检查写成普通函数。它没有调用 Hooks，所以用普通名字，在 Node 中也能测试：

```js
export function readStoredText(storage, key, initialValue) {
  const raw = storage.getItem(key);
  if (raw === null) return initialValue;
  const value = JSON.parse(raw);
  if (typeof value !== "string") throw new Error("记录应为文本");
  return value;
}
```

运行 `node storage-recovery.js`，缺失记录得到“默认备注”，合法 JSON 文本得到“先盘点鼠标”，损坏 JSON 抛 SyntaxError，数字 0 抛 Error。JSON 语法正确，还要满足“这里应该是文本”的约定。

接下来写浏览器专用的 Hook：

```js
import { useState } from "react";
import { readStoredText } from "./storage-text.js";

export function useLocalStorage(key, initialValue) {
  const [record, setRecord] = useState(() => {
    try { return { value: readStoredText(localStorage, key, initialValue), error: "" }; }
    catch { return { value: initialValue, error: "本地记录无法读取，正在使用默认文本。" }; }
  });
  function save(value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setRecord({ value, error: "" });
    } catch {
      setRecord({ value, error: "本地记录保存失败，当前文本只保留在页面中。" });
    }
  }
  return [record.value, save, record.error];
}
```

挂载时读取，用户输入时调用 save。保存成功后刷新仍能读回；失败也保留当前输入，并显示错误。

写入由输入事件触发。在 StrictMode 开发检查中，初始化可能读取两次，但不会写入；损坏记录保留到用户再次输入，随后合法写入并清除错误。

[`localStorage`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)的读取与写入都可能抛异常，两处分别捕获，由 error 告知界面。

InventoryNote 的接法如下：

```jsx
import { useLocalStorage } from "./useLocalStorage.js";

export default function InventoryNote() {
  const [note, saveNote, error] = useLocalStorage("js_web:inventory:note:v1", "");
  return <aside aria-label="本机备注">
    <label>本机备注 <input value={note} onChange={(event) => saveNote(event.target.value)} /></label>
    <p>备注保存在当前浏览器；商品编辑仍在刷新后恢复。</p>
    {error && <p role="alert">{error}</p>}
  </aside>;
}
```

initialValue 只参与初始化。切换存储 key 时，用 key 属性重建组件，重新读取记录。

两个实例即使用同一个存储 key，也不会自动同步 React state。要共用一份备注，让共同父节点只调用一次，再向下传 value 和 save。当前库存继续由 reducer/Context 管理。

Java 的磁盘数据和内存对象也有两层状态，写入磁盘不会自动更新所有对象。

:::tip[自己尝试 · 本地 React]
1. 打开 `labs/hooks.html?case=storage`，在备注 A 输入“先盘点鼠标”，备注 B 留空；刷新。
2. 在 Application → Local storage 选择当前站点，把 `js_web:c31:note:A` 的值改成 `broken`，再刷新。
3. 在 A 输入“重新记录”，再看存储值并刷新。

预期：第一次刷新只恢复 A；损坏后 A 为空并提示读取失败；重新输入后保存为 JSON 字符串，提示消失，刷新仍能恢复。
:::

## 4. 路由：把 URL 映射成组件树

现在让无线鼠标详情拥有可分享的位置：`/js_web/#/products/P002`。hash 是 # 以及后面的片段，[浏览器不会把它发给服务器](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment)。刷新时服务器只收到 /js_web/，先返回应用首页，React 再读取 hash 匹配详情。

课程正文继续使用真实静态路径，例如 `/js_web/05-react/c31-custom-hooks-routing/`；独立库存演示使用 hash。

本课选 React Router 的声明式模式。按[官方安装入口](https://reactrouter.com/start/declarative/installation)，从 `react-router` 导入路由 API。在自己的 C30 阶段目录中安装并启动：

```sh
npm install --save-exact react-router@8
npm run dev -- --host 127.0.0.1
```

已经拉取本课完整仓库时，依赖在本阶段的锁文件中，执行 npm ci 即可。网站根目录的依赖清单不用改。

src/main.jsx 在 StrictMode 内、App 外放 `<HashRouter><App /></HashRouter>`。这里用 [HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter)接管 # 后的位置，Vite 的 base 仍为 /js_web/，负责 # 前的真实资源路径。HashRouter 使用默认根路径，无需再加 /js_web/ 的 basename。

App 中配置以下路由；外层 InventoryProvider 包住它们，所以切换页面不会重建库存：

```jsx
export default function App({ loadProduct }) {
  return <InventoryProvider><Routes>
    <Route element={<InventoryLayout />}>
      <Route index element={<Navigate to="/products" replace />} />
      <Route path="products">
        <Route index element={<InventoryPage />} />
        <Route path=":productId" element={<ProductDetailRoute loadProduct={loadProduct} />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes></InventoryProvider>;
}
```

首页转到 #/products，#/products/P002 显示详情，#/missing 显示不存在页。Navigate 的 replace 替换空入口，避免后退时多停一次。

[嵌套路由](https://reactrouter.com/start/declarative/routing)描述的是 URL 与界面结构：products 只增加路径前缀，index 是这个路径的默认子页，`:productId` 匹配一个动态片段。无 path 的 InventoryLayout 提供公共界面，子页面渲染到它的 Outlet：

```jsx
import { Link, Outlet } from "react-router";
import InventoryTitle from "./InventoryTitle.jsx";

export default function InventoryLayout() {
  return <>
    <InventoryTitle />
    <nav aria-label="库存导航"><Link to="/products">全部商品</Link></nav>
    <Outlet />
  </>;
}
```

[Link](https://reactrouter.com/api/components/Link) 生成 a 元素，普通点击交给路由器导航，仍支持复制和新标签打开。内部写 /products，生成入口下的 hash 地址。

详情页把路径参数交给已经提取的请求组件：

```jsx
import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router";
import { products } from "../../../shared/products.js";
import ProductDetails from "./ProductDetails.jsx";
import NotFound from "./NotFound.jsx";

export default function ProductDetailRoute({ loadProduct }) {
  const { productId } = useParams();
  const { search } = useLocation();
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, [productId]);
  if (!products.some((product) => product.id === productId)) {
    return <NotFound message="没有该编号的初始快照，请从六种初始商品中选择。" />;
  }
  return <>
    <h1 ref={headingRef} tabIndex={-1}>商品详情 {productId}</h1>
    <Link to={{ pathname: "/products", search }}>返回筛选列表</Link>
    <nav aria-label="切换初始商品">
      {products.map(({ id }) => <Link key={id} to={{ pathname: `/products/${id}`, search }}>{id}{" "}</Link>)}
    </nav>
    <p>以下是发布时的初始快照；列表中的补货与编辑保留在本次页面会话中。</p>
    <ProductDetails productId={productId} loadProduct={loadProduct} />
  </>;
}
```

[`useParams()`](https://reactrouter.com/api/hooks/useParams)得到 P002 这个字符串，还要确认商品存在。本课只有六份初始 JSON，其他编号（包括本地新增的 P007）显示没有初始快照；文件请求失败仍提供重试。

`path="*"` 处理没有匹配路线的情况；参数校验处理路线匹配但商品不存在的情况。它们是客户端的“不存在”界面，入口 HTML 的 HTTP 状态仍可能是 200。HTTP 404 和页面显示什么要分别判断。

详情编号变化和返回列表时聚焦对应标题，为键盘用户提供起点。Provider 跨页保留库存；列表页的草稿随卸载丢弃，回去编辑读取已保存值。

Java 的控制器路由在服务端选择处理方法；这份 Route 配置在浏览器里选择要渲染的组件。

## 5. 筛选放进 URL，只保留一个来源

编号放路径，筛选放搜索参数：`#/products?q=鼠标&category=外设&order=stock`。草稿、表单错误和盘点次数继续放本地 state。

**先猜一猜：** 打开 `/js_web/#/products/P002?q=鼠标`，`location.search` 能拿到 q 吗？运行下面的普通 JS：

```js title="url-parts.js"
const url = new URL("https://socoo123.github.io/js_web/#/products/P002?q=鼠标");
console.log(url.pathname);
console.log(url.search || "外层无查询参数");
console.log(decodeURI(url.hash));
const route = new URL(url.hash.slice(1), url.origin);
console.log(route.pathname, route.searchParams.get("q"));
```

依次输出 `/js_web/`、“外层无查询参数”、`#/products/P002?q=鼠标`、`/products/P002 鼠标`。q 位于 hash 内，原生 URL 的外层 search 是空字符串。在 React 中让 Router 解析，使用 useLocation 和 useSearchParams 读取路由位置即可。

`src/useCatalogFilters.js` 把读取和更新筛选的约定集中在一起：

```js
import { useSearchParams } from "react-router";
import { readCatalogParams } from "./catalog-url.js";

export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();
  const filters = readCatalogParams(params);
  function changeFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value === "" || (key === "category" && value === "全部") || (key === "order" && value === "id")) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }
  const search = params.size === 0 ? "" : `?${params.toString()}`;
  return { ...filters, changeFilter, search };
}
```

readCatalogParams 校验外部输入：q 默认空文本，category 限四类、否则“全部”，order 限 stock、price、否则 id。运行 `node catalog-params.js` 核对正常值与默认值。

[`setSearchParams`](https://reactrouter.com/api/hooks/useSearchParams) 才会导航。复制 params 后修改可保住其他字段。一次事件汇总改动、调用一次 setter；它的回调没有 useState 的连续排队累加语义。

InventoryCatalog 删除三份筛选 useState，改用 Hook 返回值。搜索框调用 `changeFilter("q", event.target.value)`，分类和排序同理。selectProducts 计算列表，让 URL 成为唯一筛选来源。只把 URL 读进 useState 初始值，会让后退后的地址与列表脱节。

筛选用 replace，打字不新增历史；点详情则新增历史，后退可回筛选列表。卡片链接将 search 带到详情，返回链接再带回列表。用明确的列表地址，直接分享进入的用户也能返回；navigate(-1) 可能退到别的网站。

:::tip[自己尝试 · 本地 React]
1. 从首页进入 #/products，搜索“鼠标”，分类选外设，排序选库存升序。
2. 给 P002 补 1 件，点“查看初始详情”，复制完整地址，在新标签打开并刷新。
3. 在原标签后退，再前进，再点“返回筛选列表”；最后打开 #/missing 和 #/products/P999。

预期：分享地址仍显示 P002 初始详情 0 件；原标签返回后筛选保留、列表为 1 件，总库存 53；新标签是新会话，库存从 52 开始。两个未知地址都有返回入口。
:::

## 常见错误与调试

### Hook 提取后只记得第一件商品

**现象**：打开 `labs/hooks.html?case=stale`，等 P001 加载完成，再选择 P002。选择文字是 P002，详情却一直是 P001。

**工具**：Network → 勾选 Disable cache → 清空记录，再切换。Sources → 打开 `labs/useStaleRequest.js`，在 loadProduct 调用行设断点；终端在阶段 4 执行 `npm run lint:c31-bug`。

**证据**：切换 P002 没有新文件请求，也没有再命中加载断点；lint 指出 Effect 缺少 productId 依赖。完整错误起点在 useStaleRequest.js，问题在结尾的依赖：

```js
// 有问题的写法：隐藏在 Hook 中的 Effect 漏掉商品编号依赖
import { useEffect, useState } from "react";
import { fetchProduct } from "../src/product-api.js";

export function useStaleRequest(productId, loadProduct = fetchProduct) {
  const [request, setRequest] = useState({ status: "idle", id: null });
  useEffect(() => {
    let ignore = false;
    setRequest({ status: "loading", id: productId });
    loadProduct(productId).then((data) => {
      if (!ignore) setRequest({ status: "success", id: productId, data });
    }).catch((error) => {
      if (!ignore) setRequest({ status: "error", id: productId, error: error.message });
    });
    return () => { ignore = true; };
  }, [loadProduct]);
  return { request, cancel: () => {}, retry: () => {} };
}
```

错误文件的 Effect 只列 `[loadProduct]`。**原因**：加载器函数没变，Effect 就保持第一次的闭包。把代码移进 Hook 不会使空缺依赖自动补齐。

**修复**：把依赖改成 `[productId, loadProduct]`。产品代码中的 useProductRequest 还包括用于重试的 attempt，并保留取消、失效和显示归属检查。

**确认**：刷新后重复选择 P002，Network 出现 P002.json，断点里的 productId 为 P002，最后显示无线鼠标。执行 `npm run test:bug -- labs/hooks-bugs.test.jsx`：错误起点会在“应该请求 P002”处失败，补上依赖后同一项通过。`npm run lint:c31-bug` 也应通过。

### 地址变了，页面只剩公共导航

**现象**：嵌套的详情 URL 已经正确，页面却没有详情内容。**工具**：Sources 打开 InventoryLayout.jsx，对照 App 中匹配的路由。**证据**：Layout 只返回导航，没有 Outlet。**原因**：子路由需要父布局提供渲染位置。**修复**：补回导航后的 `<Outlet />`。**确认**：直接刷新详情地址能显示编号；`npm test -- tests/routes.test.jsx` 中的直接进入详情用例通过。

## 练习

### 练习 1：预测参数复制

先写输出，再运行 `node prediction.js`：

```js title="prediction.js"
const current = new URLSearchParams("q=鼠标&order=stock");
const next = new URLSearchParams(current);
next.set("q", "键盘");
console.log(current.get("q"), next.get("q"));
console.log(next.get("order"));
console.log(typeof next.get("order"));
```

<details>
<summary>提示</summary>

new URLSearchParams 复制当前键值；set 修改的是 next。URL 中的值按文本读取。

</details>

<details>
<summary>参考答案</summary>

依次为“鼠标 键盘”、stock、string。current 保持原值；next 修改 q，同时保留 order。在 React 中改完 next，还需要 setSearchParams 才会更新地址和界面。

</details>

### 练习 2：修复不更新的详情

从 `labs/useStaleRequest.js` 开始，只修好编号切换后的同步。验收：P001 加载后选 P002，必须出现新的 P002 请求，最后显示 P002；前一请求晚返回不能覆盖新结果。执行上文的 lint 和 bug 回归命令核对。

<details>
<summary>提示</summary>

Effect 中读取了什么响应式输入？依赖改变后，原有的 ignore 清理才会执行。

</details>

<details>
<summary>参考答案</summary>

将 `[loadProduct]` 改成 `[productId, loadProduct]`。切换编号会先令旧 ignore 为 true，再启动新请求，旧闭包的成功与失败都放弃写回。完整产品 Hook 还负责主动取消和重试，可以对照 src/useProductRequest.js 理解 API 的差别。

</details>

### 练习 3：让排序跟着分享地址走

从 #/products 开始，搜索“鼠标”、选外设、选库存升序，打开 P002 详情并返回。验收：排序、分类、搜索均保留；复制详情地址到新标签也有可用的返回筛选列表入口。

<details>
<summary>提示</summary>

沿 ProductCard → Link → ProductDetailRoute → 返回 Link 检查 search，而不是在详情中另存一份筛选 state。

</details>

<details>
<summary>参考答案</summary>

useCatalogFilters 返回当前 search，InventoryCatalog 经 ProductList 传给卡片；详情链接同时传 pathname 和 search。详情用 useLocation 取得这段 search，再带回 /products。完整参考实现已在阶段 4 中；去掉任一段 search 传递，返回链接就会恢复默认筛选。

</details>

## 项目进度

从 C30 的 examples/inventory/04-react 继续。新增请求、文本存储和 URL 筛选 Hook，完整文件在 src；ProductDetails 连接 Hook 与 RequestView。

main.jsx 接入 HashRouter，App 配置 Routes，新增 Layout、详情和不存在页。InventoryDetails 保留作旧课示例，首页改用详情链接。Provider 跨页保留，补货、删除、编辑沿用原 reducer。

Catalog 改读 URL，List 与 Card 传递 search，InventoryNote 保存备注。

在阶段 4 执行 `npm run lint`、`npm test`、`npm run build`，再执行 `npm run preview -- --host 127.0.0.1`。直接打开生产预览地址的 `#/products/P002?q=鼠标`，刷新，点“返回筛选列表”。

预期：详情请求仍为 /js_web/data/products/P002.json；初始鼠标为 0 件、129.00 元。返回只见鼠标，清空搜索后共 6 种、52 件、26348.00 元。补货后往返详情总库存仍为 53，刷新才恢复为 52。本课只构建并本地预览独立应用，线上课程继续发布静态正文。

## 小结

- 自定义 Hook 复用有状态的行为，每次调用仍有独立的 state 和 Effect。
- 提取以后依赖、闭包和清理规则保持不变，API 要明确输入与返回入口。
- 存储读取、写入和页面 state 分别处理；损坏与失败应有可观察结果。
- HashRouter 读取 # 后的位置，Routes 匹配页面，Outlet 放置子页，params 仍需检查。
- 可分享的筛选由 URL 提供单一来源；Provider 保留会话库存，路由卸载会清掉页面局部状态。

自测：

1. 两次 useCounter 调用为什么不会自动共享次数？
2. 自定义 Hook 中漏掉 productId 依赖，会保留哪次渲染的输入？
3. # 前的 /js_web/ 与 # 后的 /products/P002 分别由谁处理？
4. URL 匹配到 P999，为什么还需要判断商品是否存在？
5. 返回列表、整页刷新，哪些状态分别保留，为什么？

下一课从已有的手工请求出发，认识请求缓存、查询标识和失效更新。

## 延伸阅读

- [React：使用自定义 Hook 复用逻辑](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React：Hooks 调用规则](https://react.dev/reference/rules/rules-of-hooks)
- [React Router：声明式路由与嵌套](https://reactrouter.com/start/declarative/routing)
- [React Router：HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter)
- [React Router：URL 中的值](https://reactrouter.com/start/declarative/url-values)
- [MDN：localStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)
