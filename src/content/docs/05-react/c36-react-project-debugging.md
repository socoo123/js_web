---
title: C36 React 项目复盘与故障排查
description: 画清库存应用的数据归属，用开发工具定位三个故障，补齐本地快照、详情与第三周验收。
sidebar:
  order: 36
---

> **第 3 周 · 第 18 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C25–C35 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

库存应用已经能编辑商品、切换详情、缓存请求、显示提交结果，还能跑测试。代码变多以后，难题也变了：鼠标卡片已经补到 1 件，统计为什么还是 52？地址明明切到了 P002，详情为什么仍是键盘？昨天还正常，今天打开却在读取本地记录时出错？

这三种表现都像「React 没更新」，原因却分别在派生数据、缓存身份和外部输入。

学完你能：

- 从组件树指出商品、草稿、URL、缓存和本地快照各由谁管理
- 按 Console → Components → Network → Profiler 的顺序缩小范围
- 从生产文件借助 source maps 回到 JSX 与业务函数
- 修复三个预置故障，并用测试保护修复后的行为
- 说明刷新、跨路由和保存快照分别保留什么

例子在 [examples/c36](https://github.com/socoo123/js_web/tree/main/examples/c36)，完整应用和故障实验在 [阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)。查 API 时可配合[React Hooks 速查](../../reference/react-hooks/)。

## Java 程序员先看这里

| Java 经验 | React 项目里的对应 | 差异 |
| --- | --- | --- |
| 沿调用栈查入参和返回值 | 沿组件树查 props、state 和 Context | 组件可能已经重新执行，旧闭包仍属于较早的一次渲染 |
| 数据库主键区分记录 | 业务 id、组件 key、query key | 三者各管一个身份，给组件加 key 不会补全查询键 |
| 内存对象和持久化记录 | reducer 数据和 localStorage 快照 | 改页面中的商品不会自动写浏览器存储 |
| JUnit 先跑失败的方法 | Vitest 按文件和名称筛选 | 先复现一个合同，再检查附近层级，避免在整页输出中猜原因 |
| 调试信息对应源码行 | source maps 对应构建前源码 | 浏览器执行构建文件，映射帮助显示源码位置 |

## 1. 先找数据的主人，再追更新

**一次业务事实只设一个来源，其余地方读取或计算。** 在本地库存这条路径上，商品数组属于 InventoryProvider；列表、统计和本地详情都读同一个 ProductsContext。

子组件用回调或 dispatch 上报意图，reducer 返回下次数据。[状态结构原则](https://react.dev/learn/choosing-the-state-structure)可以浓缩成一个问题：「它能由已有数据直接算出来吗？」

| 数据 | 主人 | 跨路由与刷新时怎样变化 |
| --- | --- | --- |
| 本地 products | InventoryProvider / reducer | 路由切换保留；刷新读取已保存的快照，否则用固定起点 |
| editingId、成功提示 | InventoryPage | 离开列表卸载，回列表重新开始 |
| draft、errors | ProductForm | 同商品编辑保留；切换商品按 key 重建；保存前不改商品 |
| q、category、order | hash URL | 返回、刷新、分享都能恢复筛选 |
| 可见列表、总库存、分类报表 | 渲染时计算 | 跟随来源变化，不单独存一份 state |
| 详情请求、缓存、mutation | QueryClient | 同一次应用内跨路由复用；刷新重建 |
| 本机备注、商品快照 | localStorage 不同键 | 写入成功后跨刷新保留；各有自己的格式与恢复逻辑 |

本地商品负责增删改查；「模拟远端补货」在浏览器内 Map 演示请求、失效和 Action，刷新恢复初始 JSON。先读「本地库存」「缓存库存」标签，再追相应来源。

### 用对象身份检查更新链

**先猜一猜：** 鼠标补一件后，新旧数组、鼠标对象和键盘对象的身份分别相同吗？

```js title="sources.js"
import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const before = structuredClone(products);
const after = productsReducer(before, { type: "restocked", id: "P002" });
const total = (items) => items.reduce((sum, product) => sum + product.stock, 0);
console.log(before[1].stock, after[1].stock);
console.log(total(before), total(after));
console.log(before === after, before[1] === after[1]);
console.log(before[0] === after[0]);
```

输出依次为 `0 1`、`52 53`、`false false`、`true`。新数组里鼠标是新记录，未修改的键盘继续共享只读对象。旧库存仍是 0，旧总数仍是 52。

卡片显示 1、统计显示 52，先比较数据来源与统计初始化。这份例子已证明 reducer 和汇总函数能得到 53。

Java 复制 List 也会共享元素；React 更新目标记录时创建新对象，保住上一份快照。

## 2. 让每个面板回答一个问题

**先确认正确性，再测性能。** Console → Components → Network → Profiler 是逐步缩小范围的入口；某一步已拿到根因，就修复并确认，不必把每个面板都打开一遍。

| 顺序 | 具体操作 | 要拿到的证据 |
| --- | --- | --- |
| Console | F12 → Console，清空旧日志，重复最短操作；有异常时点第一个业务源码位置 | 错误类型、值的类型、组件堆栈；没有异常也是观察结果 |
| Components | React DevTools → Components，用选择器选中异常区域，定位组件，再看 props、Hooks 与父级 Provider | 当前商品 id、输入数组是否变化、草稿和实际商品是否分开 |
| Network | 保持面板打开，筛选 Fetch/XHR，操作后点请求的 Headers、Response、Timing | 有没有请求、完整 URL、状态码、响应内容、传输耗时 |
| Profiler | React DevTools → Profiler，开始录制，只做一次目标操作，再停止，选择对应提交 | 哪些组件渲染、哪一块耗时；与同样操作的基线比较 |

[React DevTools](https://react.dev/learn/react-developer-tools)负责查看 React 树；Sources 负责暂停 JS 执行。ProductForm 的 prop 仍是旧商品，draft 已是新文本，在保存前属于预期行为。

[Network](https://developer.chrome.com/docs/devtools/network/)只记录面板打开期间的网络活动。进入实验前就打开它；需要跨刷新观察时勾 Preserve log。Disable cache 处理 HTTP 缓存，QueryClient 里的内存结果要通过查询键和新鲜时间解释。

P001 已读入且仍新鲜，P002 又使用同一 query key，切换后可能没有新请求。此时先查缓存身份，服务器没有收到这次鼠标读取。

在 `examples/c36` 运行 `node keys.js`，检查实际缓存：

```js title="keys.js"
import { QueryClient } from "../inventory/04-react/node_modules/@tanstack/react-query/build/modern/index.js";

const client = new QueryClient();
client.setQueryData(["products", "detail", "P001"], { id: "P001", stock: 12 });
console.log(client.getQueryData(["products", "detail", "P002"]));
console.log(client.getQueryData(["products", "detail", "P001"]).stock);
client.clear();
```

依次输出 `undefined`、`12`。键内容包含编号，它们就是两份记录。

### 慢和错分别留证据

打字卡顿时，用相同搜索词比较 C34 的 `labs/performance.html?case=before` 与 `?case=after`。实验有 1200 行，记录时带上数据规模。

React 提交很短而页面仍慢，再查 Network 或 Performance 中的传输、脚本和布局成本。

:::tip[自己尝试 · 本地 React]
1. 在 `examples/inventory/04-react` 执行 `npm ci`，再执行 `npm run dev -- --host 127.0.0.1`。
2. 打开终端地址下的 `/js_web/labs/review.html?case=summary`，点击「给鼠标补 1 件」。用 Components 分别查看 ReviewSummaryCase 和 ReviewSummaryBroken。
3. 打开 `?case=query`，先等键盘出现，再打开 Network、点击「选择鼠标」。记录当前编号、详情编号和新增请求。
4. 用相应的 `summary-answer`、`query-answer` 重复操作。

预期：统计错误页是鼠标 1、总数 52，正确页为 53；请求错误页在新鲜期保留 P001，正确页读取并显示 P002。
:::

## 3. 本地快照也要经过输入边界

**localStorage 是另一份外部输入，读取时要解析和校验。** JS 字符串能变成 JSON，只说明语法正确；它仍可能是旧版本格式、重复 id 或字符串库存。

本课保存 `{ version: 1, products: [...] }`，键是 `js_web:inventory:products:v1`。解析器检查 id 唯一、名称、分类、整数库存、整数分和标签数组，再提取业务字段。空商品数组和库存 0 都合法。

**先猜一猜：** 合法快照中的售罄库存会保留吗？损坏的 `"{"` 会让恢复函数抛错吗？

```js title="recovery.js"
import { products } from "../shared/products.js";
import { initializeInventory, parseInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const raw = JSON.stringify({ version: 1, products });
console.log(parseInventorySnapshot(raw)[1].stock);
const result = initializeInventory(() => parseInventorySnapshot("{"));
console.log(result.products.reduce((sum, product) => sum + product.stock, 0));
console.log(result.message);
```

先输出 `0`，再输出 `52`，最后提示「本地库存无法读取，已使用初始商品；原记录保留，可清除本地快照。」`parseInventorySnapshot` 会抛出格式错误；外层 initializeInventory 把读取失败转换成可操作的初始商品和提示。

### 读、写、恢复分别发生在什么时候

| 动作 | 数据行为 | 页面能观察到什么 |
| --- | --- | --- |
| Provider 首次挂载 | 只读快照；不存在就复制固定起点 | 已保存的商品恢复，或显示初始 6 种、52 件 |
| 编辑、补货、删除 | reducer 更新内存 | 列表、统计、本地详情一起更新 |
| 点击「保存本地快照」 | 把当前 products 校验后序列化写入 | 成功提示；此后修改需再次保存 |
| 快照损坏或读取受限 | 用固定起点启动，保留原记录 | 可以继续操作，并看到恢复提示 |
| 点击「清除本地快照」 | 删除这个键，保留当前内存商品 | 提示刷新后回到初始商品 |
| 写入或清除失败 | 保留当前操作状态，显示失败 | 用户知道旧快照可能仍在，下次刷新仍可能恢复旧值 |

写入由按钮事件触发，所以挂载与开发环境重复初始化都不会覆盖坏记录。若刚补了鼠标但没有点击保存，刷新后仍恢复上一次快照。这是应用选定的手动保存规则。

快照仅含已经保存到商品数组的记录。草稿、盘点次数和 QueryClient 缓存不写入快照；筛选由 URL 保存，备注用自己的键。

[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)按源保存，因此同一站点下的路径共享存储空间；使用明确的键前缀区分课程实验和商品数据。它类似你读磁盘上的 DTO：即使是自己的程序上次写出的文件，这次读进来也要检查格式。

## 4. 从构建文件和失败测试回到源码

**source maps 把构建后的位置映射回源码，执行的仍是构建后的 JS。** 阶段 4 的 `vite.config.js` 已有这项配置：

```js
build: { sourcemap: true },
```

在阶段 4 运行 `npm run build`，再运行 `npm run preview -- --host 127.0.0.1`。打开预览地址的 `/js_web/`，进入 Chrome DevTools → Settings → Preferences → Sources，确认启用 JavaScript source maps。在 Sources 用文件搜索打开 `src/product-state.js`，在 restockProduct 的映射更新处设断点，再给鼠标补一件。

暂停时应能看到 id 是 P002、输入数组中的鼠标库存是 0，继续后页面显示 1。Network 中真正下载的是 `assets/index-….js`，Sources 可以显示映射后的源码。压缩文件的「美化」只调整排版，恢复不到 JSX 结构；原始文件需要匹配的映射。

找不到源码时，在 Network 看 `.map` 是否可读取，再在 DevTools 的 More tools → Developer Resources 查看映射加载情况。细节见 [Chrome source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps)和 [Vite 构建配置](https://vite.dev/config/build-options#build-sourcemap)。

### 读测试失败，也按输入到输出追一遍

在 `examples/inventory/04-react` 执行：

```sh
npm run test:bug -- labs/review-bugs.test.jsx
npm test -- tests/review.test.jsx -t "补货后"
```

第一条对三个错误起点失败；第二条对正确实现通过。错误实验与正常回归分开运行，正常发布门禁继续只收集 tests 目录。

读失败报告时先找用例名，再看 Expected、Received 或没找到的元素，最后点第一个业务文件位置。比如「统计库存 53 件」没找到，但同页能找到「鼠标库存 1 件」，说明点击与商品更新已经发生，调查范围可以缩到统计的数据来源。

鼠标库存也没变，先检查按钮、await 和回调。请求结果用 findBy 等待可观察条件。[Vitest 的文件与名称筛选](https://vitest.dev/guide/filtering)能让你先反复运行一条，再跑相关文件和全量回归。

## 常见错误与调试

### 鼠标变成 1 件，统计仍是 52

**现象**：打开 `labs/review.html?case=summary`，点击补货，鼠标数量更新，统计不动，Console 没有异常。

**工具**：在 Components 找 ReviewSummaryBroken，查看 products prop 和它的 state；再看父组件 ReviewSummaryCase 的商品数组。

**证据**：父组件与子组件的 products 中 P002 都已是 1，而子组件保存的 totalStock 仍为 52。问题在统计组件内部。

**原因**：它把派生结果放进 state，初始化只执行于挂载；新的 prop 不会重新初始化这份 state。

```jsx
// 有问题的写法：把派生统计只初始化一次
import { useState } from "react";

export default function ReviewSummaryBroken({ products }) {
  const [totalStock] = useState(() => products.reduce((sum, product) => sum + product.stock, 0));
  return <p>统计库存 {totalStock} 件</p>;
}
```

**修复**：删掉统计 state，在渲染时从 products 计算，完整答案是 ReviewSummaryFixed：

```jsx
export default function ReviewSummaryFixed({ products }) {
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  return <p>统计库存 {totalStock} 件</p>;
}
```

**确认**：补一次为 53、再补为 54。修改时保留 Broken 的导出名；运行 `npm run test:bug -- labs/review-bugs.test.jsx -t "补货后"`，原先失败的断言应通过。

### 编号切到 P002，内容仍是 P001

**现象**：打开 `?case=query`，等键盘详情成功，再在 30 秒的新鲜期内选择鼠标，当前编号是 P002，详情仍是键盘。

**工具**：Components 查看 ReviewQueryBroken 的 productId；Network 筛选 `products`；在 Sources 打开这个组件，检查 useQuery 参数。

**证据**：prop 已是 P002，切换时没有 P002 的 GET，而 queryKey 始终是 `['products', 'detail']`。

**原因**：缓存用键区分数据，查询函数闭包改变没有为它建立新身份；新鲜的旧键仍可复用已有结果。

```jsx
// 有问题的写法：不同商品共用同一个新鲜缓存键
import { useQuery } from "@tanstack/react-query";
import ReviewQueryView from "./ReviewQueryView.jsx";

export default function ReviewQueryBroken({ productId, loadProduct }) {
  const query = useQuery({
    queryKey: ["products", "detail"],
    queryFn: ({ signal }) => loadProduct(productId, { signal }),
  });
  return <ReviewQueryView query={query} />;
}
```

**修复**：把读取变量放进查询键，或者直接接回已完成这件事的 useProductQuery。组件 `key={productId}` 不会清除 QueryClient 的旧键缓存。[TanStack 查询键规则](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)解释了变量为什么应进入键。

```jsx
import { useProductQuery } from "../src/product-query.js";
import ReviewQueryView from "./ReviewQueryView.jsx";

export default function ReviewQueryFixed({ productId, loadProduct }) {
  const query = useProductQuery(productId, loadProduct);
  return <ReviewQueryView query={query} />;
}
```

**确认**：新打开实验，在新鲜期内切换，Network 出现 P002 请求，详情显示鼠标 0 件。修复 Broken 文件后，按名称运行「切换鼠标」回归；测试同时保护新编号读取和最终内容。

## 练习

### 练习 1：说明每一次保留发生在哪里

先给本地鼠标补一件并保存快照，再补一件，进入详情后返回列表，最后刷新。逐项预测：列表的鼠标库存、详情的本地库存、初始 mock 缓存库存、刷新后的鼠标库存。写清对应的数据主人。

<details>
<summary>提示</summary>

保存快照发生在第二次补货之前。路由切换保留 Provider，但刷新会重建它；mock 副本的起点是固定 JSON。

</details>

<details>
<summary>参考答案</summary>

进入详情前列表是 2；详情「本地库存」也是 2，二者都来自 Provider。没有做模拟远端补货时，缓存区域是 0。回列表仍是 2；刷新后恢复快照中的 1，总库存 53、价值 26477.00 元。

草稿随列表卸载丢弃，筛选由 URL 恢复。

</details>

### 练习 2：修复第三个故障——损坏记录

打开 `labs/review.html?case=storage`，点击「写入损坏副本并重新加载实验」。实验键为 `js_web:c36:broken:v1`，与项目快照键分开。

修复 ReviewStorageBroken：坏 JSON 回退为库存 52，提示原记录保留，键值仍是 `"{"`；清除后重载正常。三个故障的回归应全部通过。

<details>
<summary>提示</summary>

按六步记录：现象、工具、证据、原因、修复、确认。Console 查看 SyntaxError 与 parseInventorySnapshot 的堆栈；Application → Storage → Local storage → 当前源，查看实验键。外部记录读取失败，需要在初始化边界转换成恢复状态。

</details>

<details>
<summary>参考答案</summary>

现象是读取区域显示失败；Console 的 SyntaxError 来自 JSON.parse，Application 里对应值只有左花括号，证据指向损坏输入。组件没有接住解析异常，直接信任了本地记录。修改 Broken 文件的初始化与输出，采用下列答案逻辑并保留原导出名：

```jsx
import { useState } from "react";
import { initializeInventory, readInventorySnapshot } from "../src/inventory-storage.js";

export default function ReviewStorageFixed({ storage, storageKey }) {
  const [record] = useState(() => initializeInventory(() => readInventorySnapshot(storage, storageKey)));
  return <><p>本地库存 {record.products.reduce((sum, product) => sum + product.stock, 0)} 件</p>
    <p role="status">{record.message}</p></>;
}
```

打开 `?case=storage-answer` 对照；修好后重写损坏副本，页面应仍可用，再清除并重载实验。测试检查 52、恢复提示和原文，防止初始化覆盖证据。

</details>

### 练习 3：第三周库存 v2 验收

从阶段 4 首页开始，先清除本地快照再刷新，确认初始 6 种、52 件、26348.00 元。依次完成下表，每项记下实际结果和数据来源。

| 操作 | 验收标准 |
| --- | --- |
| 新增 P007，编辑为「随身转接头 / 配件 / 3 件 / 0.29 元」 | 7 种、55 件、26348.87 元；本地详情为 3 件 |
| 编辑 P002，清空库存后保存，再输入 0 保存 | 空白阻止提交并聚焦；0 合法 |
| 保存本地快照，刷新并进入 P007 详情 | 新商品与数值保留，P007 没有静态 JSON 请求 |
| 筛选鼠标、进入详情、刷新、返回 | hash 地址可用，筛选保留；缓存实验能加载 |
| 清除快照并刷新 | 回到固定起点，备注保持独立 |
| 运行正常回归与 E2E | 正常测试和两条生产冒烟通过 |

<details>
<summary>提示</summary>

数字错查 reducer 和计算；刷新错查快照；详情错先区分数据来源。生产预览再检查源码断点。

</details>

<details>
<summary>参考答案</summary>

P007 增加 3 × 29 = 87 分，因此总价值是 26348.87 元。本地详情从同一数组查编号，保存快照后新记录可跨刷新恢复；它没有对应的初始请求文件。

恢复异常时检查源、键与版本。写入失败时看页面提示，内存商品仍可操作。验收结束清除快照再刷新，还原为六种商品。

留下一次故障的复现步骤、证据、根因、修复和回归用例，供下次排查。

</details>

## 项目进度

从 C35 的 `examples/inventory/04-react` 继续：

- `inventory-storage.js` 负责版本化快照、字段检查、初始化恢复和写入。
- InventoryProvider 增加快照读取与保存/清除事件，InventoryPersistence 显示按钮和结果；
- ProductDetailRoute 增加本地商品区域，支持新增编号，并保留六种初始商品的独立缓存实验。
- `labs/review.html` 提供三个错误起点及答案；`tests/review.test.jsx` 保护正确行为，E2E 增加快照恢复与新增详情冒烟。

在阶段 4 目录执行：

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

预期正常回归 190 条、生产 E2E 2 条通过。E2E 需要先按 C35 安装 Chromium；故意失败的 labs 用 test:bug 单独运行。项目产物供本地学习，课程 Pages 发布的是静态正文。

## 小结

- 先确定数据主人：商品、草稿、URL、缓存和快照分别管理；派生结果直接计算。
- 用 Console、Components、Network、Profiler 分别收集异常、数据、请求和渲染证据。
- 本地快照先校验再恢复，按钮事件负责写入，失败时保留可操作页面和明确提示。
- source maps 连接构建位置与源码，调试时确认源码和当前产物匹配。
- 用最短失败测试定位，再跑相关和全量回归，生产冒烟检查路由与持久化连接。

自测：

1. 卡片更新而统计不动，为什么应先看两者的数据来源？
2. Components 里的编号正确，Network 却没有新请求，应检查什么？
3. 为什么挂载时自动覆盖损坏快照会妨碍排查？
4. 组件 key、query key 和商品 id 分别控制什么身份？
5. 浏览器展示原始 JSX 时，实际执行的是哪份文件？

下一课比较开源组件的职责和选择标准，把同一个库存业务迁移到组件库。

## 延伸阅读

- [React：选择 state 结构](https://react.dev/learn/choosing-the-state-structure)
- [React：开发者工具](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools：用 source maps 调试源码](https://developer.chrome.com/docs/devtools/javascript/source-maps)
- [TanStack Query：查询键](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [MDN：localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Vitest：筛选测试](https://vitest.dev/guide/filtering)
