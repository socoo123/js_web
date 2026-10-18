---
title: C32 认识 TanStack Query 与服务端状态
description: 从手工详情请求引出查询缓存，选对 query key，处理后台更新与重试，并在模拟保存成功后使对应查询失效。
sidebar:
  order: 32
---

> **第 3 周 · 第 16 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C29、C30、C31 · 运行：Node 24 与本地 React · 示例已运行验证

## 这一课解决什么问题

上一课提取了 useProductRequest。键盘切到鼠标再切回来，又要加载；另一个组件也要键盘详情，又发一次请求。Hook 复用了流程，各次调用仍有自己的 state。

保存成功后，已经打开的详情又该怎样更新？再加上过期判断与重试，手工 Hook 很快就变成一套缓存工具。

TanStack Query 管理异步数据的读取、复用和更新。这课给库存详情接入它。学完你能：

- 分清查询缓存、请求函数与本地 UI state 的职责
- 用 query key 区分商品，让重复访问复用成功结果
- 解释新鲜、过期、后台更新与缓存回收之间的关系
- 区分首次加载失败和后台更新失败，读懂重试次数
- 用 mutation 执行模拟保存，成功后只使对应详情查询失效

示例在 [examples/c32](https://github.com/socoo123/js_web/tree/main/examples/c32)。先进入 [阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)，执行 `npm ci`、`npm run dev -- --host 127.0.0.1`。本课 Node 示例复用该目录安装的依赖；安装完成后，在 examples/c32 中运行 `node 文件名.js`。

## Java 程序员先看这里

| Java 经验 | 本课对应 | 差异 |
| --- | --- | --- |
| Service 方法返回 CompletableFuture | queryFn 返回 Promise | 请求函数负责取数据，Query 负责结果的生命周期 |
| Map 或缓存框架的键 | 数组形式的 query key | 可序列化内容决定身份，不按数组对象的引用区分 |
| 缓存过期时间 | staleTime | 到时表示需要更新，不等于立即删除或定时请求 |
| 保存后清理读缓存 | mutation 后 invalidateQueries | 默认保留旧数据，活跃查询在后台重新读取 |
| 表单中的未提交字段 | useState 保存草稿 | 草稿属于当前操作，不随查询缓存一起管理 |

## 1. 手工 Hook 已经解决什么，还缺什么

C30 解决请求竞态，C31 将它提取成 Hook。旧 ProductDetails 仍保留在项目中：

```jsx
import { useProductRequest } from "./useProductRequest.js";
import RequestView from "./RequestView.jsx";

export default function ProductDetails({ productId, loadProduct }) {
  const { request, cancel, retry } = useProductRequest(productId, loadProduct);
  return <RequestView request={request} onCancel={cancel} onRetry={retry} />;
}
```

打开 `labs/hooks.html?case=request`，P001 切到 P002 再切回来，仍会重新加载。Hook 正确清理了旧请求，却没保存各编号已经读到的结果。

服务端状态指的是**来源在页面之外、页面持有其副本的数据**。其他用户也能改变后端库存，页面需要知道何时再次询问来源。

TanStack Query 把结果保存在 QueryClient 中。多个组件订阅同一个查询，就能共用结果与进行中的请求。组件用 React 渲染，HTTP 请求由 fetch 完成。库也能调用其他异步函数。[查询函数](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions)应返回数据，失败时抛异常或返回被拒绝的 Promise。

fetchProduct 继续检查 response.ok、解析 JSON、校验字段。Query 不会自动把 fetch 的 HTTP 404 变成异常。

| 数据 | 放在哪里 | 理由 |
| --- | --- | --- |
| 从异步来源读取的详情 | QueryClient | 需要复用、过期判断与重新读取 |
| 搜索、分类、排序 | 路由 URL | 需要分享、刷新与后退 |
| 当前编辑编号、表单草稿 | React state | 描述用户当前操作 |
| 本机备注 | 原有存储 Hook | 用户希望在当前浏览器恢复文本 |

类似 Java 的 Service 缓存与调用方编辑 DTO，这里也按职责分开。浏览器缓存刷新后默认重新开始。

## 2. 用一个稳定的 QueryClient 连接组件

本课用 TanStack Query 5。若从上一课的项目开始，在 examples/inventory/04-react 中按[官方安装说明](https://tanstack.com/query/latest/docs/framework/react/installation)执行：

```sh
npm install --save-exact @tanstack/react-query@5
```

已有本课清单与锁时，执行前面的 npm ci 即可。

先在 src/query-client.js 建立工厂：

```js
import { QueryClient } from "@tanstack/react-query";

export function createInventoryQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: 300_000, retry: 1, retryDelay: 300 },
      mutations: { retry: false },
    },
  });
}
```

在 App.jsx 导入 QueryClientProvider 和工厂，用客户端连接原有路由：

```jsx
export default function App({ loadProduct = mockProductService.getProduct, saveProduct = mockProductService.restock }) {
  const [client] = useState(createInventoryQueryClient);
  return <QueryClientProvider client={client}><InventoryProvider><Routes>
    <Route element={<InventoryLayout />}>
      <Route index element={<Navigate to="/products" replace />} />
      <Route path="products">
        <Route index element={<InventoryPage />} />
        <Route path=":productId" element={<ProductDetailRoute loadProduct={loadProduct} saveProduct={saveProduct} />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes></InventoryProvider></QueryClientProvider>;
}
```

useState 让后续渲染继续使用同一个客户端。StrictMode 开发检查可以额外调用初始化；若普通 render 每次都 new QueryClient，则会不断换掉缓存。

路由切换会卸载详情，外层 QueryClient 继续保存结果。实验页有独立的 Provider 和缓存。

查询 Hook 位于 src/product-query.js：

```js
import { useQuery } from "@tanstack/react-query";

export const productKey = (id) => ["products", "detail", id];

export function useProductQuery(productId, loadProduct) {
  return useQuery({
    queryKey: productKey(productId),
    queryFn: ({ signal }) => loadProduct(productId, { signal }),
  });
}
```

调用 `useProductQuery("P001", loadProduct)` 后，最初没有数据，状态为 pending；函数成功返回，data 保存键盘，状态为 success。productId 改变时，key 也改变，组件切换查询。

signal 从查询上下文传入，沿着 loadProduct 交给原来的 fetch。消费 signal 后，查询失去最后一个观察者且请求尚未完成时，可以取消传输并恢复先前状态。取消语义见[官方说明](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)。

类似 Java 依赖注入的对象作用域，客户端实例决定哪些组件共用缓存。

## 3. query key 和缓存：先问“是不是同一份数据”

query key 是顶层数组，应包含决定结果的输入。商品详情用 `["products", "detail", productId]`：前两项说明资源和用途，最后一项区分具体商品。

**先猜一猜：** 下面创建的两个数组是不同对象，第一次读取能否得到 12？对象里的字段换序后，最后一行又会怎样？

```js title="keys.js"
import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
client.setQueryData(["products", "detail", "P001"], { stock: 12 });
console.log(client.getQueryData(["products", "detail", "P001"]).stock);
console.log(client.getQueryData(["products", "detail", "P002"]));
client.setQueryData(["products", { category: "外设", order: "stock" }], 2);
console.log(client.getQueryData(["products", { order: "stock", category: "外设" }]));
client.clear();
```

依次输出 **12、undefined、2**。Query 按可序列化内容确定键的身份；对象字段的顺序不影响匹配，数组元素的顺序有意义。这与 JS Map 按对象身份匹配的规则不同。

编号换成 P002，key 就改变，因此没有读到 P001 的库存。若查询函数读 productId，key 却只有 `["products", "detail"]`，两件商品会挤进同一个查询。

服务端按分类、页码取列表时，可以用 `["products", "list", { category, page }]`。本课分类只筛选本地数组，继续放 URL。

Java 的缓存 key 也需包含业务参数；[query key](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)按内容匹配，与 JS Map 的引用比较不同。

### 复用请求与复用成功结果

**先猜一猜：** 同时调用两次 fetchQuery，再等它们成功后调用第三次，queryFn 一共执行几次？

```js title="cache-reads.js"
import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";
import { products } from "../shared/products.js";

const client = createInventoryQueryClient();
let calls = 0;
const options = {
  queryKey: ["products", "detail", "P001"],
  queryFn: async () => { calls++; return structuredClone(products[0]); },
};
await Promise.all([client.fetchQuery(options), client.fetchQuery(options)]);
console.log("同时读取", calls);
await client.fetchQuery(options);
console.log("再次读取", calls);
console.log("缓存库存", client.getQueryData(options.queryKey).stock);
client.clear();
```

依次输出“同时读取 1”“再次读取 1”“缓存库存 12”。同时进行的同键读取共用一个请求；第三次发生在 30 秒的新鲜期内，直接读取成功结果。

QueryClient 的方法可以直接观察缓存；useQuery 在此基础上订阅变化并触发渲染。共享来源是客户端里的查询。

### staleTime 和 gcTime 管两件事

| 设置 | 本课值 | 描述 |
| --- | --- | --- |
| staleTime | 30 秒 | 成功结果在这段时间内视为 fresh；之后视为 stale |
| gcTime | 5 分钟 | 查询没有观察者后，保留多久再回收 |

stale 表示“值得更新”，缓存中的值仍可显示。30 秒过去不会自动发一条请求；之后重新挂载观察者、窗口重新可见或网络恢复等触发条件，才可能让过期查询后台读取。主动 refetch 与手动失效也能要求更新。

最后一个观察者卸载后，gcTime 才开始计时。回收前重进详情仍可读旧值；若已过期，再后台读取新值。整页刷新则重新创建客户端，本课没有将 Query 缓存持久化。

[默认规则](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)中 staleTime 为 0，浏览器中的非活跃查询通常保留 5 分钟。DevTools 的“Disable cache”控制浏览器 HTTP 缓存，无法关闭 QueryClient 的内存缓存。

:::tip[自己尝试 · 本地 React]
1. 打开 `labs/query.html`，在 Network 勾选 Disable cache，用 `products/` 过滤请求。
2. 等键盘成功后，选择 P002，再立即选回 P001。点击“切换第二个观察者”。
3. 将“响应速度”选为“慢”，点击其中一个“重新读取详情”。

预期：立即返回键盘和增加第二个观察者均复用缓存；两个详情区域显示相同库存。主动重读时保留键盘内容，并显示后台更新提示，成功后提示消失。速度选项增加的是 mock 等待时间，Network 记录的仍是实际 JSON 请求。
:::

## 4. 重试与界面状态：有旧结果时继续显示

读取失败可以重试。本课 `retry: 1` 的意思是首次失败后**再试一次**，总共最多两次尝试。retryDelay 控制两次尝试之间的等待。

```js title="retries.js"
import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
let attempts = 0;
try {
  await client.fetchQuery({
    queryKey: ["products", "detail", "P001"],
    queryFn: async () => { attempts++; throw new Error("模拟读取失败"); },
    retry: 1,
    retryDelay: 0,
  });
} catch (error) {
  console.log(error.message);
}
console.log("实际尝试", attempts);
client.clear();
```

输出“模拟读取失败”和“实际尝试 2”。这里用 0 等待观察次数；项目中为 300 毫秒。浏览器中的查询默认失败后重试三次，本课改为一次，方便在实验中看清过程。

临时故障适合有限重试；权限错误、确定不存在的资源，应按错误信息决定是否继续。Query 不会从 HTTP 404 这段错误文本推断业务策略。

重复读取通常只增加请求，重复“补 1 件”可能产生额外修改，所以本课的 mutation 明确关闭自动重试。真实系统可以通过幂等请求设计支持安全重试。

### pending、fetching 与 error

查询同时描述“有没有可用结果”和“现在是否正在执行”。本课用下面几个字段决定视图：

| 情况 | 字段与界面 |
| --- | --- |
| 初次读取，还没有数据 | isPending 为 true，显示加载提示 |
| 已有数据，正在重新读取 | isFetching 为 true，保留详情，显示后台更新 |
| 首次读取最终失败 | data 为 undefined，显示错误和重试入口 |
| 后台读取最终失败 | data 仍存在，保留旧详情，显示更新失败 |
| 离线暂停 | fetchStatus 为 paused，提示等待网络或正在显示缓存 |

CachedProductDetails 中保留数据的部分如下：

```jsx
    {query.isFetching && <p role="status">正在后台更新，保留上次结果。</p>}
    {query.fetchStatus === "paused" && <p role="status">网络已离线，当前显示缓存。</p>}
    {query.isError && <p role="alert">更新失败：{query.error.message}，当前显示上次结果。</p>}
    <button type="button" disabled={query.isFetching || mutation.isPending}
      onClick={() => query.refetch()}>重新读取详情</button>
```

后台失败时不会把已经读到的库存抹掉。点 refetch 会主动重读当前 key；它不是改变参数的入口，切换商品要改变 productId 和 key。

类似 Java 异步操作，分开保存上次结果与本次执行状态，失败时才有旧内容可显示。

:::tip[自己尝试 · 本地 React]
1. 在 `labs/query.html` 等详情成功，把速度改回“快”。点击“下次读取失败一次”，再点“重新读取详情”。
2. 观察 Console 的“查询尝试”：这次操作应增加两次尝试，最后仍成功。
3. 勾选“持续读取失败”，再重读。看到更新失败后，取消勾选，再重读一次。

预期：持续失败时保留已有库存，出现错误提示；恢复读取后错误提示消失。首次加载前就离线时显示等待连接；已有缓存时离线重读会继续显示缓存。
:::

## 5. mutation 与失效：先写成功，再更新读结果

query 用来读；mutation 表达一次由用户触发的写操作。点击保存时调用 mutate，mutationFn 执行异步保存，成功后 onSuccess 才处理读缓存。

本课 mock 用 GET 静态 JSON 取得初始字段，补货写进内存 Map，后续读取用新记录覆盖初始值。**修改只存在于当前页面，刷新恢复，其他用户也读不到它。** Network 中只有静态 JSON 的 GET，模拟写入没有 HTTP 请求。

这份 mock 详情与列表中的本地库存各有明确标签，作为两种状态的对照。真实应用接入后端时，应让列表与详情都查询同一服务，保存后同时更新受影响的查询。

先写 src/useRestockMutation.js：

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productKey } from "./product-query.js";

export function useRestockMutation(saveProduct) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id) => saveProduct(id),
    retry: false,
    onSuccess: async (saved) => {
      await client.invalidateQueries({ queryKey: productKey(saved.id), exact: true });
    },
  });
}
```

点击时调用 `mutation.mutate(productId)`。mock 返回保存后的商品，onSuccess 用 saved.id 确定受影响的查询。等待期间即使切换了商品，完成时仍失效原编号。

`exact: true` 只匹配这个完整键。默认的前缀匹配也很有用：`["products"]` 可以匹配整个商品查询族。项目中当前只更新一份详情，因此使用精确范围。

### 失效保留旧值，活跃查询会重新读取

看一个没有 React 观察者的短例子：

```js title="invalidation.js"
import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
let remoteStock = 12;
const options = {
  queryKey: ["products", "detail", "P001"],
  queryFn: async () => ({ stock: remoteStock }),
};
await client.fetchQuery(options);
remoteStock = 13;
console.log("写入后缓存", client.getQueryData(options.queryKey).stock);
await client.invalidateQueries({ queryKey: options.queryKey, exact: true });
console.log("失效后缓存", client.getQueryData(options.queryKey).stock);
console.log("是否失效", client.getQueryState(options.queryKey).isInvalidated);
console.log("重新读取", (await client.fetchQuery(options)).stock);
client.clear();
```

输出依次是“写入后缓存 12”“失效后缓存 12”“是否失效 true”“重新读取 13”。改变来源的 remoteStock 不会主动改缓存；invalidateQueries 先做过期标记，也没有把库存删除。

页面中正在被 useQuery 观察的详情默认会立即后台重新读取。inactive 查询则保留数据和失效标记，等再次使用时再更新。失效会覆盖本课 30 秒的新鲜期。

onSuccess 返回并等待 invalidateQueries 的 Promise，mutation 在这段更新期间继续保持 pending。按钮显示“正在保存并更新…”，等活跃查询的重新读取结束后再恢复。若写入成功、重新读取失败，旧详情保留，查询错误提示负责说明更新失败；用户可以再点“重新读取详情”。保存成功和读回成功是两个结果。

库还提供 setQueryData，能用保存响应直接写缓存；本课选择重新读取，让你先看清来源、缓存和界面三者如何衔接。[失效更新](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)由业务明确安排，库无法从保存函数的名字推断影响范围。

Java 保存后清理缓存也是相同的读写协调；浏览器还要呈现保存和读回状态。

## 常见错误与调试

### 选了鼠标，详情仍显示键盘

**现象**：打开 `labs/query.html?case=key-bug`，等键盘成功后选 P002，“当前选择”改变了，详情仍是 P001。

**工具**：打开 Network，用 products/ 过滤；再到 Sources 打开 QueryKeyBroken.jsx，检查查询参数。文件如下：

```jsx
// 有问题的写法：不同商品共用了同一个缓存键
import { useQuery } from "@tanstack/react-query";

export default function QueryKeyBroken({ productId, loadProduct }) {
  const query = useQuery({
    queryKey: ["products", "detail"],
    queryFn: ({ signal }) => loadProduct(productId, { signal }),
  });
  return <p>{query.data ? `详情已加载：${query.data.id}` : "正在加载…"}</p>;
}
```

**证据**：选择 P002 后，没有新的 P002.json 请求；productId 已经是 P002，但 queryKey 与键盘那次相同。**原因**：30 秒内该 key 的结果仍新鲜，新的组件实例直接读到了键盘缓存。

**修复**：在 queryKey 最后加入 productId，与 productKey 工厂保持一致。**确认**：刷新实验页，重复切换，Network 出现 P002.json，最终显示 P002；立即返回键盘仍能复用它自己的缓存。

在阶段 4 执行 `npm run test:bug -- labs/query-bugs.test.jsx`，错误起点会在“应该请求 P002”处失败；加入编号后同一测试通过。正常测试中的 query.test.jsx 同时验证了正确 Hook 的商品隔离与重复访问。

### 保存成功了，详情还是旧库存

**现象**：修改 useRestockMutation，去掉 onSuccess 后，模拟保存完成，库存仍是 12。**工具**：Sources 在 mock-product-service.js 的 overrides.set 行设断点，再检查保存后的记录与详情文字。**证据**：mock 已保存 13，界面仍显示缓存中的 12。**原因**：mutation 只执行写入，没有要求读查询更新。**修复**：恢复 onSuccess 中对 productKey(saved.id) 的失效。**确认**：再次补货，出现一条详情读取，两个观察者都显示新库存；query.test.jsx 中“成功后仅对应详情重新读取”用例通过。

## 练习

### 练习 1：失效以后，库存会消失吗

先写输出，再运行 `node prediction.js`。这里没有挂载 React 观察者：

```js title="prediction.js"
import { createInventoryQueryClient } from "../inventory/04-react/src/query-client.js";

const client = createInventoryQueryClient();
const key = ["products", "detail", "P002"];
client.setQueryData(key, { stock: 0 });
await client.invalidateQueries({ queryKey: key, exact: true });
console.log(client.getQueryData(key).stock);
console.log(client.getQueryState(key).isInvalidated);
client.clear();
```

<details>
<summary>提示</summary>

失效修改的是查询是否需要更新；现有数据、是否正在执行请求是另外两件事。

</details>

<details>
<summary>参考答案</summary>

依次打印 0、true。售罄库存仍保存在缓存里，查询被标为失效。此时没有活跃观察者，所以不会立即重新读取。下一次 fetchQuery 或挂载可用的 useQuery，才会向来源取新值。

</details>

### 练习 2：修复串用缓存

从 labs/QueryKeyBroken.jsx 开始，只修改查询身份。验收：从键盘切到鼠标后请求 P002，显示鼠标；立即返回键盘显示 P001，并复用各自缓存。运行上面的 bug 回归核对。

<details>
<summary>提示</summary>

queryFn 的结果依赖哪个业务输入？React 的组件 key 与查询 key 各自负责什么？

</details>

<details>
<summary>参考答案</summary>

把 queryKey 改成 `["products", "detail", productId]`。React key 决定组件是否重建；query key 决定从客户端读哪份数据。前者即使变化，后者相同仍会读到同一条缓存。正式代码统一调用 productKey，保存失效也用同一工厂，避免拼写漂移。

</details>

### 练习 3：让两个详情一起更新

在 labs/query.html 显示第二个观察者，给键盘模拟补货一次，再勾选“保存失败”补一次。验收：成功后两个区域都从 12 变成 13，只触发一次读回；失败后两个区域仍是 13，并显示保存错误。

<details>
<summary>提示</summary>

让两个观察者使用相同 key 和客户端。成功处理位于 useMutation 的 onSuccess，失败不触发失效。

</details>

<details>
<summary>参考答案</summary>

沿用 useRestockMutation 的实现即可。两个 useQuery 订阅同一个查询，失效后共用一次读回；成功结果会通知两处。失败时 mock 没修改 Map，onSuccess 也不执行，所以已有缓存继续可用。无需在两个组件之间互相调用刷新函数。

</details>

## 项目进度

从 C31 的 examples/inventory/04-react 继续。新增 query-client、product-query、useRestockMutation、CachedProductDetails 和 mock-product-service；App 用稳定的客户端提供缓存，ProductDetailRoute 改接新详情。旧 ProductDetails 与 useProductRequest 保留，供前两课实验对照。

详情组件按 productId 设置 React key，让切换商品时局部保存提示重置；查询数据继续由外层客户端保存。

在阶段 4 执行 `npm run lint`、`npm test`、`npm run build`，再运行 `npm run preview -- --host 127.0.0.1`。打开预览地址的 `#/products/P002?q=鼠标`，首次为无线鼠标、0 件、129.00 元。模拟远端补货后，详情为 1 件；返回列表仍是本地库存 0 件、总库存 52 件、总价值 26348.00 元。

列表继续由 reducer 管理；草稿、URL 和本机备注沿用原来源。查询结果直接读取缓存。

重新进入详情可复用缓存；刷新后 mock 和缓存都恢复起点。本课构建并本地预览独立应用，课程 Pages 发布静态正文。

## 小结

- TanStack Query 管理异步数据副本的生命周期，queryFn 仍负责请求、错误和业务校验。
- query key 包含决定结果的输入；同键查询共享结果和进行中的读取。
- staleTime 管新鲜度，gcTime 管闲置缓存回收；过期不等于删除，也不是定时请求。
- 区分首次加载和后台更新；更新失败时保留旧结果，重试次数要与首次尝试分开算。
- mutation 负责写入，成功后的失效范围由业务指定；本地草稿和 UI state 继续放在 React。

自测：

1. 两个组件都调用 useProductQuery，什么条件下能共用一次读取？
2. productId 改变而 query key 没变，为什么新鲜缓存会显示错商品？
3. 30 秒新鲜期结束时，是否立刻发请求、删除缓存？
4. 为什么 retry 为 1 会尝试两次，而补货写入默认不自动重试？
5. mock 保存成功后，为什么还要安排查询更新，整页刷新又会怎样？

下一课认识现代 React 的异步提交 API，继续区分浏览器内交互与需要服务器的能力。

## 延伸阅读

- [TanStack Query：查询函数](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions)
- [TanStack Query：查询键](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query：缓存默认规则](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [TanStack Query：查询重试](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries)
- [TanStack Query：mutation](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [TanStack Query：保存后的查询失效](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
