---
title: C13 async/await、请求与 Network
description: 用 async/await 组织串行与并发请求，处理 HTTP 和 JSON 错误，并用 Network 排查库存页的加载问题。
sidebar:
  order: 13
---

> **第 2 周 · 第 7 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C11、C12 · 运行：Node 24 与本地网页 · 示例已运行验证

## 这一课解决什么问题

库存页改用 await 读取 `products.json`，又碰到三个问题：两个独立请求一个接一个等，遍历结束结果仍为空，路径拼错却只报 JSON 解析错误。

写起来像同步代码，等待关系仍需你决定。这一课把 Promise 与 async/await 对上，再给 C11 的库存页接入请求。

学完你能：

- 解释 async 函数的返回值，以及 await 暂停和恢复的位置。
- 按数据依赖选择串行或并发，用 allSettled 保留部分成功结果。
- 修复 forEach(async) 提前结束的问题。
- 分清 HTTP、网络和 JSON 错误，为页面安排加载、空数据和失败提示。
- 取消上一次搜索，在 Network 中查状态码、响应内容和等待时间。

示例在 [examples/c13](https://github.com/socoo123/js_web/tree/main/examples/c13)。纯 JS 文件在该目录用 `node await-order.js` 这样的命令运行；前半课的 `loadStock` 沿用固定库存数据，用定时器模拟等待。后半课在本地网页发出 HTTP 请求，无需后端或新依赖。

## Java 程序员先看这里

| Java 经验 | JavaScript 对应 | 差异 |
| --- | --- | --- |
| `CompletableFuture<Integer>` | async 函数返回 Promise | `return 0` 的成功值是 0，函数调用本身仍得到 Promise |
| `future.get()` 等待线程 | `await promise` 暂停当前函数 | 浏览器主线程可以处理其他工作，恢复后的 JS 仍在主线程执行 |
| `try/catch/finally` | 相同结构 | 要在 try 内 await 失败的 Promise，catch 才能接到这次失败 |
| `allOf` 组合多个 Future | `Promise.all` | 返回按输入顺序排列的成功值；任一失败，整组失败 |
| Java HTTP 客户端 | 浏览器 fetch | 404 是一个 HTTP 响应；跨源读取还受浏览器 CORS 规则约束 |

## 1. async 返回 Promise，await 取成功值

[`async`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function) 把函数的结果交付方式统一成 Promise：`return value` 表示成功，未捕获的异常表示失败。调用者依然可以用 `then/catch` 接收。

```js title="async-value.js"
async function getStock() {
  return 0;
}
async function fail() {
  throw new Error("库存加载失败");
}

const result = getStock();
console.log(result instanceof Promise);
result.then(stock => console.log("库存", stock));
fail().catch(error => console.log("错误", error.message));
console.log("继续执行");
```

输出依次是 `true`、`继续执行`、`库存 0`、`错误 库存加载失败`。`getStock()` 没写 await，函数体当场运行完，返回的也是 Promise；`throw` 让 `fail()` 返回的 Promise 失败。两个处理器都在当前同步脚本结束后运行。

这里的调用交付 Promise，参与库存加法前要先拿到数字。

### await 让出的是当前函数

**先猜一猜：** Promise 已经成功，`库存 0` 会排在「结束」前面吗？

```js title="await-order.js"
async function showStock() {
  console.log("读取前");
  const stock = await Promise.resolve(0);
  console.log("库存", stock);
}

console.log("开始");
showStock();
console.log("结束");
```

输出是 `开始` → `读取前` → `结束` → `库存 0`。

[`await`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await) 先求右边表达式的值，启动那里调用的操作，再暂停当前 async 函数。外面的代码继续执行；等待成功后，await 表达式得到成功值，后半段通过微任务恢复。即使等的是已成功的 Promise 或普通值，也会把恢复安排到以后。

它和 C12 的 `Promise.resolve(0).then(stock => …)` 表达相同的结果依赖，局部变量和分支则能从上到下写。普通脚本里 await 放在 async 函数内；模块中的顶层 await 留到拆模块时使用。

await 不会新开线程。它只暂停当前函数；恢复后的一百万次同步计算照样占用主线程。Java 的阻塞式 `get()` 会占住调用线程，不能拿这个行为解释浏览器里的 await。

### 把失败放回 try/catch 的控制流

await 等到失败时，会在等待的位置抛出失败原因。于是条件、异常和收尾都能使用熟悉的语法：

```js title="await-flow.js"
import { loadStock } from "./mock-api.js";

async function showStock() {
  let loading = true;
  try {
    const stock = await loadStock("P002", { fail: true });
    console.log("库存", stock);
  } catch (error) {
    console.log("错误", error.message);
  } finally {
    loading = false;
    console.log("加载中", loading);
  }
}
showStock();
```

输出 `错误 库存加载失败`，然后是 `加载中 false`。失败跳过了 `console.log("库存", stock)`，进入 catch，再执行 finally。删掉 `{ fail: true }` 后输出 `库存 0`、`加载中 false`；库存 0 是合法成功值。

catch 正常返回表示恢复，继续抛错表示把失败留给调用者，这和上一课的规则相同。finally 适合关闭加载提示、恢复按钮；把业务结果放在 try/catch 的 return 中，避免 finally 的 return 覆盖结果。

## 2. 依赖决定串行，独立操作可以并发

两个 await 是否串行，要看**第二个操作何时启动**。先等第一个，再调用第二个，就是串行：

```js title="serial.js"
import { loadStock } from "./mock-api.js";

async function readBoth() {
  console.log("启动 P001");
  const first = await loadStock("P001");
  console.log("启动 P002");
  const second = await loadStock("P002");
  console.log("库存", first, second);
}
readBoth();
```

输出 `启动 P001`，等待后才输出 `启动 P002`，再等待后输出 `库存 12 0`。第二次 `loadStock` 的调用在第一个 await 后面，所以第二个定时器也要到那时才创建。

若第二步要用第一步的结果，例如先读订单再用订单里的商品编号读库存，这样的先后是必要的数据依赖。两个独立编号的库存读取互不依赖，可以先都启动，再一起等：

```js title="concurrent.js"
import { loadStock } from "./mock-api.js";

async function readBoth() {
  const requests = ["P001", "P002"].map(id => {
    console.log("启动", id);
    return loadStock(id);
  });
  console.log("两个读取均已启动");
  const [first, second] = await Promise.all(requests);
  console.log("库存", first, second);
}
readBoth();
```

前三行是 `启动 P001`、`启动 P002`、`两个读取均已启动`，然后才出现 `库存 12 0`。map 同步调用两次 `loadStock`，得到两个正在等待的 Promise；[`Promise.all`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) 把它们的结果组合起来。

all 本身不负责启动操作。把两个函数放进数组而不调用，得到的是函数数组，不会发请求；在数组里先写 `await loadStock(...)`，又会提前变回串行。先调用得到 Promise，再交给组合器，才表达了想要的等待关系。

串行有两段连续等待，并发的等待可以重叠；成功后的 JS 代码仍依次执行。Java 的 allOf 同样组合已启动的 Future，组合动作本身不是线程池。

### all 和 allSettled：整组成功，还是保留部分成功

all 的结果顺序按**输入顺序**，即使 P002 先完成，解构出来的 first 仍对应 P001。任意一项失败，all 就以该原因失败，可以由外面的 try/catch 统一处理。其他已经启动的操作仍会继续；`all-failure.js` 会先打印整组失败，再打印另一个操作完成，组合失败和取消操作是两件事。

批量读取允许「P001 有结果、P002 显示失败」时，用 [`Promise.allSettled`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)：

```js title="settled.js"
import { loadStock } from "./mock-api.js";

async function readAvailable() {
  const ids = ["P001", "P002"];
  const results = await Promise.allSettled([
    loadStock("P001"),
    loadStock("P002", { fail: true }),
  ]);
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(ids[index], "库存", result.value);
    } else {
      console.log(ids[index], "失败", result.reason.message);
    }
  });
}
readAvailable();
```

输出 `P001 库存 12`、`P002 失败 库存加载失败`。allSettled 等到全部输入都有结论，结果仍按输入顺序排列。成功项有 `status: "fulfilled"` 和 `value`；失败项有 `status: "rejected"` 和 `reason`。输入 Promise 的失败变成了结果记录，需要你逐项处理。

一份报告必须数据齐全才用 all；多个商品可以各自展示就用 allSettled。失败保留失败状态，避免把「未知库存」显示为「确认售罄」。

## 3. forEach 不会收集异步回调的结果

**先猜一猜：** 回调是 async，外面也加了 await，`完成数量` 是 2 吗？

```js title="foreach-broken.js"
// 有问题的写法：forEach 丢弃回调返回的 Promise
import { loadStock } from "./mock-api.js";

async function report() {
  const stocks = [];
  await ["P001", "P002"].forEach(async id => {
    stocks.push(await loadStock(id));
  });
  console.log("完成数量", stocks.length);
}
report();
```

输出 `完成数量 0`。两个读取已经启动，但 [`forEach`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) 总是返回 undefined，并丢弃回调返回值。外面的 `await undefined` 很快恢复，根本没等回调里的定时器完成。稍后 stocks 才会被写入，报告已经打印完了。

修复要改变遍历结构：独立读取用 map 收集 Promise，再交给 all。

```js title="foreach-fixed.js"
import { loadStock } from "./mock-api.js";

async function report() {
  const stocks = await Promise.all(
    ["P001", "P002"].map(id => loadStock(id))
  );
  console.log("完成数量", stocks.length);
  console.log("总库存", stocks.reduce((sum, stock) => sum + stock, 0));
}
report();
```

输出 `完成数量 2`、`总库存 12`。等待结束时，stocks 已是结果数组；其中的数字来自成功值，和回调何时完成无关。若一项失败，report 返回的 Promise 就会失败，调用入口应加 catch 或在函数内处理。

需要依次执行时，换成 `for (const id of ids) { const stock = await loadStock(id); … }`。这里 await 属于外层函数的循环体，下一轮确实等上一轮结束。Java 的 `forEach` 回调也不能凭空让外层等待一个 Future；看清遍历 API 的返回值，比给每个函数都加 async 更有用。

:::tip[自己尝试 · Node]
1. 在 `examples/c13` 运行 `node foreach-broken.js` 和 `node foreach-fixed.js`。
2. 在错误版回调的 push 后加一行日志，观察完成数量与回调日志的先后。
3. 把修复版改成 for…of，每轮 await 后打印编号。

预期：错误版先打印完成数量 0，再出现回调日志；map + all 得到 2 项；for…of 依次完成 P001、P002，总库存仍是 12。
:::

## 4. fetch：拿到响应，再读取 JSON

浏览器的 fetch 默认发 GET 请求，返回 Promise。它成功时交付 [`Response`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)，里面有状态码、响应头和响应体读取方法，尚不是商品数组。读取 JSON 需要第二个异步步骤：

```js title="fetch-json.js"
async function fetchProducts(url, { signal } = {}) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("商品数据应为数组");
  return rows;
}
```

这个函数先检查 [`response.ok`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response/ok)，再等待 [`response.json()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response/json)。ok 表示状态码在 200–299；404、500 也能被 fetch 正常交付为 Response，需要你主动转成失败。json 则等待响应体读完并解析，得到 JS 值。两次 await 各有工作，并非重复等待。

合法 JSON 也可能是 `{ "products": [] }`，与约定的顶层数组不同。最后一行检查数组形状；字段名和数值范围仍应遵守业务契约，本课先使用固定商品文件。

fetchProducts 只负责读取和检查，失败交给调用者；页面层决定向用户显示什么。页面里的处理器如下：

```js title="fetch-demo.js"
const output = document.querySelector("#output");
const run = document.querySelector("#run");
run.addEventListener("click", async () => {
  run.disabled = true;
  output.textContent = "正在加载商品…";
  try {
    const rows = await fetchProducts(document.querySelector("#source").value);
    output.textContent = rows.length === 0 ? "暂无商品。" : "商品数 " + rows.length;
  } catch (error) {
    output.textContent = "加载失败：" + error.message;
  } finally {
    run.disabled = false;
  }
});
```

正常文件显示 `商品数 6`；空数组显示 `暂无商品。`；不存在的文件显示 `加载失败：HTTP 404`。按钮在等待期间禁用，在 finally 恢复；这是一个很小但完整的加载流程。

相对 URL 以**当前网页地址**为基准解析，而非 JS 文件所在目录。本例 `fetch.html` 在 `examples/c13/`，所以 `../shared/products.json` 才会指向共享数据。项目里用 `./products.json` 读取同目录文件，也能适应部署到 `/js_web/` 这样的子路径。

### 三种失败，三个排查入口

| 失败 | 程序看到什么 | 首先查什么 |
| --- | --- | --- |
| HTTP 404 / 500 | fetch 得到 Response，ok 为 false | Network 的 Status、Request URL |
| 断网、连接失败或 CORS 阻止读取 | fetch 的 Promise 失败，常见为 TypeError | Network 的失败标记、Console 的具体原因 |
| 响应不是合法 JSON | json 的 Promise 失败，解析错误为 SyntaxError | Response 中是不是 HTML、截断文本或空响应体 |

一次响应体通常只读一次。先 `await response.text()` 打印，再对同一个响应 `await response.json()` 会因为响应体已读而失败；查看原文直接用 Network 的 Response，代码里保留一次解析即可。

和 Java HTTP 客户端一样，拿到响应后还要解析内容并校验业务结构。

:::tip[自己尝试 · 本地网页]
1. 在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c13/fetch.html`。
2. 分别选择正常商品、空数组、404、错误 JSON、对象而非数组，点击「加载」。
3. 保持 DevTools 的 Network 打开，对照每次的状态码和 Response。

预期：正常为 6，空数组显示暂无商品；404 提示 HTTP 404；错误 JSON 产生解析错误；对象提示商品数据应为数组。所有分支结束后按钮都可再点。
:::

### CORS：浏览器能发出请求，不等于允许脚本读取

[源由协议、主机和端口共同确定](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/CORS)。从 `http://127.0.0.1:8000` 读取另一个端口或域名的数据，就是跨源。浏览器按服务器响应中的 CORS 许可决定是否把内容交给页面脚本；有时 Network 已看到响应，JS 仍读取失败，Console 会显示 CORS 原因。部分请求还会先发预检。

本课页面与文件放在同一个静态服务中，保持同源即可。真正跨源时由数据服务配置允许的来源；`mode: "no-cors"` 得到的不透明响应无法让脚本读取 JSON。Java 后端请求通常不受浏览器这层限制，所以「Java 能调通」只能说明服务可达。

## 5. AbortController：取消上一次搜索

搜索词从「键」变成「鼠」后，前一次正在等待的请求已经没用了。为每次请求创建一个 [`AbortController`](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController/abort)，把 signal 传给 fetch；下一次输入先取消上一份。

```js title="search.js"
const search = document.querySelector("#search");
const output = document.querySelector("#output");
let activeController;

search.addEventListener("input", async () => {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const keyword = search.value.trim().toLowerCase();
  output.textContent = "正在搜索…";
  try {
    const rows = await fetchProducts("../shared/products.json", { signal: controller.signal });
    const matches = rows.filter(product => product.name.toLowerCase().includes(keyword));
    output.textContent = matches.length === 0 ? "没有匹配的商品。"
      : matches.map(product => product.id + " " + product.name).join("\n");
  } catch (error) {
    if (error.name === "AbortError") return;
    output.textContent = "搜索失败：" + error.message;
  }
});
```

打开 `search.html`，输入「键」，结果为 `P001 机械键盘`；再输入「鼠」，结果为 `P002 无线鼠标`。空输入匹配全部 6 种商品。每次请求的是同一份静态 JSON，筛选在浏览器中进行；这个示例用重复读取来观察取消，不把查询参数当成真实搜索服务。

abort 会让仍在等待的 fetch 或响应体读取失败，默认错误名是 `AbortError`。这是用户输入触发的正常取消，所以直接结束旧处理器；真正失败才显示搜索失败。每次新建 controller，是因为已取消的 signal 不能复用为新的正常请求。

旧 catch 若再写失败提示会盖掉新搜索的状态，取消时直接结束。完整的响应先后与清理留到 C30。

取消让浏览器停止这次读取，服务器可能早已开始工作；若上一份响应早就读完，它也不会被倒回。这和 Java 中「发出取消请求」不必然等于「所有工作已回滚」相似。

## 6. Network：把页面现象对应到一次请求

页面说加载失败时，Network 告诉你请求到了哪里、收到了什么；Console 告诉你哪一步产生了错误。

在 `fetch.html` 按 F12，选择 **Network**，勾选 **Disable cache**，选 **Fetch/XHR** 过滤，再点击加载。点开 `products.json`，按下面顺序读：

| 位置 | 看什么 | 这份商品文件的正常结果 |
| --- | --- | --- |
| 请求列表 / Headers | Request URL、Method、Status Code | URL 指向 shared/products.json，GET，200 |
| Preview / Response | 解析预览与原始响应体 | 顶层数组，6 个固定商品，P002 库存为 0 |
| Initiator | 哪段代码发起 | fetchProducts 中的 fetch 调用，可回到源码 |
| Timing / Waterfall | 排队、连接、等待响应、内容下载 | 区分耗时花在哪一段；本地小文件通常很快 |

Timing 中的 Waiting for server response（TTFB）包含往返与服务器准备响应等时间，不能直接当成「后端方法执行了多久」。Content Download 才是接收响应体的阶段；若 fetch 已交付 Response 而 json 还没完成，代码仍在等数据读完或解析。

再把工具栏的网络限速从 No throttling 切成 **Slow 3G**；若预设名称不同，选一个较慢预设即可。加载时会先看到「正在加载商品…」，随后才是结果。打开 `search.html`，先输入「键」，在请求完成前改成「鼠」，前一行通常标记为 `(canceled)`，最后页面只显示无线鼠标。观察完切回 No throttling。

断网实验：页面打开后在 Network 切到 **Offline**，再点加载应显示失败；恢复网络后再点应成功。勾选 Disable cache，避免命中缓存影响观察。

面板入口见 [Chrome Network 参考](https://developer.chrome.com/docs/devtools/network/reference/)。查请求用 Network，查代码分支用 Sources 断点。

## 常见错误与调试

### 404 最后却报 JSON 解析错误

**现象**：打开本课 `fetch-broken.html`，页面与 Console 显示 `错误 SyntaxError`。文件明明不存在，错误却像 JSON 写坏了。

```js title="fetch-broken.js"
// 有问题的写法：直接解析 404 页，掩盖了 HTTP 错误
async function load() {
  try {
    const response = await fetch("./missing.json");
    const rows = await response.json();
    console.log("商品数", rows.length);
  } catch (error) {
    console.log("错误", error.name);
  }
}
load();
```

**工具**：Network 选 Fetch/XHR，刷新，点击 `missing.json`。在 Headers 看状态码，在 Response 看内容；再到 Sources，在 `const rows = await response.json()` 的行号设断点并刷新。

**证据**：Network 的状态是 404，Response 是静态服务器的 HTML 错误页。暂停时在 Console 读取 `response.status` 和 `response.ok`，分别为 404、false；fetch 这一行已经正常结束。

**原因**：HTTP 失败状态也能产生 Response。代码跳过状态检查，直接把 HTML 当 JSON 解析，解析错误盖住了最先出现的路径问题。

**修复**：使用第 4 节的 fetchProducts：在解析前检查 ok，并抛出带状态码的错误。`fetch-fixed.html` 已接上这份函数。

**确认**：打开修复页，同一条 404 请求现在显示 `错误 HTTP 404`。把地址改成 `../shared/products.json` 后显示商品数 6。Network 中的请求记录和页面结果能一一对应。

### try 里面 return Promise，catch 却没有执行

**现象**：在本课目录运行 `node catch-broken.js`，只输出 `外部处理 库存加载失败`，本来打算返回默认值的内部 catch 没有运行。

```js title="catch-broken.js"
// 有问题的写法：try 只包住启动，失败发生在稍后的 Promise 中
import { loadStock } from "./mock-api.js";

async function read() {
  try {
    return loadStock("P002", { fail: true });
  } catch (error) {
    console.log("内部处理", error.message);
    return 0;
  }
}
read().then(stock => console.log("库存", stock))
  .catch(error => {
    console.log("外部处理", error.message);
  });
```

**工具**：在本课 `index.html` 的 Console 输入 `import("./catch-broken.js")`。到 Sources → Page 打开刚加载的文件，在内部 catch 和外部 catch 的日志行设断点；刷新页面后再次导入，等待读取失败。

**证据**：内部断点没有命中；外部断点命中，error.message 为库存加载失败。回到源码，try 中只返回了一个 Promise，失败要等定时器运行后才出现。

**原因**：try 执行期间没有抛错。async 函数返回的 Promise 跟随了内部 Promise 的失败，把失败交给调用者；函数内部 catch 没有等待那个失败。

**修复**：在 try 中写 `return await loadStock(...)`，等待期间的失败才会在这里抛出。完整修复如下：

```js title="catch-fixed.js"
import { loadStock } from "./mock-api.js";

async function read() {
  try {
    return await loadStock("P002", { fail: true });
  } catch (error) {
    console.log("内部处理", error.message);
    return 0;
  }
}
read().then(stock => console.log("库存", stock))
  .catch(error => {
    console.log("外部处理", error.message);
  });
```

**确认**：运行 `node catch-fixed.js`，输出 `内部处理 库存加载失败`、`库存 0`。浏览器刷新后导入修复文件，这次命中内部断点，外部 catch 不再命中。此例按约定降级为 0；库存页则提示错误并允许重试。

## 练习

### 练习 1：await 普通值以后，谁先继续

先写下所有输出的顺序，再在 `examples/c13` 运行 `node prediction.js`。验收：解释为什么返回的 6 要经过 Promise 才交给 then。

```js title="prediction.js"
async function count() {
  console.log("计数开始");
  await 0;
  console.log("计数结束");
  return 6;
}

const result = count();
result.then(value => console.log("商品数", value));
console.log("页面继续");
```

<details>
<summary>提示</summary>

函数先同步运行到 await；外层拿到 Promise 后继续。await 后半段恢复、函数成功、then 运行，是三个有依赖的步骤。

</details>

<details>
<summary>参考答案</summary>

`计数开始` → `页面继续` → `计数结束` → `商品数 6`。

await 右边虽然只是 0，恢复仍通过微任务安排。`return 6` 完成的是 async 函数返回的 Promise，注册的 then 要等它成功后才能得到 6。

</details>

### 练习 2：让批量报告真正等完

复制 `foreach-broken.js`，修复报告。验收：打印完成数量 2、总库存 12；再让 P002 读取失败，要求保留 P001 的库存 12，并为 P002 显示失败原因，而非把它当成库存 0。

<details>
<summary>提示</summary>

第一步用 map 收集 Promise；第二步从「整组必须成功」换成「每项分别交付结论」，根据 status 选择 value 或 reason。

</details>

<details>
<summary>参考答案</summary>

完整成功版是 `foreach-fixed.js`。允许部分失败时使用 `settled.js` 的结构：allSettled 收到两个 Promise，遍历返回的两条记录，P001 走 fulfilled 分支，P002 走 rejected 分支。

失败后的验收输出是 `P001 库存 12`、`P002 失败 库存加载失败`。商品库存 0 和请求失败是两种不同的事实，应该在结果结构与界面上保持区别。

</details>

## 项目进度

从 C11 留下的 [examples/inventory/02-web](https://github.com/socoo123/js_web/tree/main/examples/inventory/02-web) 开始。本课保持原来的列表、组合筛选、库存编辑和汇总，改掉数据入口：

1. 把共享固定数据复制成同目录 `products.json`，移除 `data.js` 及 HTML 里的对应 script，保留 `defer` 加载 app.js。
2. app.js 的初始数据改为 `let inventory = []`，增加 `let loadState = "loading"`。等待成功后才写入商品数组。
3. 在结果提示后加入初始隐藏的「重试加载」按钮，id 为 retry；app.js 查询它，并把点击绑定到 loadProducts。
4. 沿用第 4 节的 fetchProducts 读取函数。setLoading 统一禁用或恢复搜索框、分类和重试按钮，并设置列表的 aria-busy。

加载函数的主体如下，完整的 DOM 查询和辅助函数在阶段目录中：

```js
async function loadProducts() {
  loadState = "loading";
  setLoading(true);
  retry.hidden = true;
  editor.hidden = true;
  selectedId = null;
  list.replaceChildren();
  document.querySelector("#summary").textContent = "";
  document.querySelector("#result-count").textContent = "正在加载商品…";
  try {
    inventory = await fetchProducts("./products.json");
    loadState = "ready";
    renderProducts();
    renderSummary();
  } catch (error) {
    loadState = "error";
    inventory = [];
    document.querySelector("#result-count").textContent = "加载失败，请检查网络后重试。";
    console.error("商品加载失败", error);
    retry.hidden = false;
  } finally {
    setLoading(false);
  }
}
```

`renderProducts` 开头加 `if (loadState !== "ready") return;`，这样失败后的筛选事件不会用一个空列表盖掉错误。ready 时若整个 inventory 为空显示「暂无商品」；有数据但筛选结果为空则显示「没有匹配的商品」。错误分支显示稳定的用户提示，详细错误留在 Console。

页面初次调用 loadProducts；只有加载失败才显示重试按钮。成功以后搜索和分类都在内存中筛选，所以改过的库存不会因为一次搜索又被静态文件覆盖。页面刷新后重新读取起始数据；本次编辑仍只保存在当前页面。

:::tip[自己尝试 · 本地网页]
1. 保持仓库根目录的静态服务运行，打开 `http://127.0.0.1:8000/examples/inventory/02-web/`。
2. Network 选 Slow 3G 并禁用缓存，刷新，观察加载提示和筛选框，再等请求结束。
3. 恢复正常网速；选配件再搜键盘，看筛选空态。清空筛选，把 P002 库存从 0 改为 3。
4. 把同目录 products.json 暂时改名，刷新产生 404；恢复文件名后点击「重试加载」。

预期：加载时列表为空、控件禁用；正常有 6 种、52 件、总价值 26348.00 元；编辑后为 55 件、26735.00 元；404 显示失败和重试按钮，恢复路径后能重新加载。
:::

把 products.json 暂时改成 `[]`，刷新应显示「暂无商品」，且没有重试按钮；实验后恢复固定数据。

## 小结

- async 函数总返回 Promise；await 暂停当前函数，成功时给值，失败时在等待处抛出。
- 数据有依赖就串行；独立操作先启动，再用 all 或 allSettled 表达整组或逐项的结果规则。
- forEach 丢弃回调返回值；异步结果用 map + all 收集，需要顺序时用 for…of。
- fetch 的 Response 和 JSON 是两步；检查 ok，再解析并校验结构。取消请求使用每次新建的 AbortController。
- 页面明确区分加载、成功、空数据和失败；Network 对照地址、状态、响应体和耗时定位原因。

自测：

1. await 一个已成功的 Promise，后面的代码会当场接着执行吗？
2. all 里面一个请求失败，其余请求会自动取消吗？
3. 为什么 `await array.forEach(async …)` 等不到结果？
4. Network 显示 200，json 为什么仍可能失败？
5. 取消旧搜索后，为什么旧 catch 应直接结束？

下一课把当前浏览器里的修改保存到 localStorage，并处理损坏数据与导入导出。

## 延伸阅读

- [MDN：async 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)与 [await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await)
- [MDN：Promise.all](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) 与 [Promise.allSettled](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN：AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController/abort)
- [MDN：CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/CORS)
- [Chrome DevTools：检查网络活动](https://developer.chrome.com/docs/devtools/network/)
