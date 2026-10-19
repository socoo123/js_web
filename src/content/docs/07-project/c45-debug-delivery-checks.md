---
title: C45 全链路 Debug 与交付前检查
description: 从资源、请求、状态、布局和存储寻找故障证据，用生产源码映射、性能与键盘检查完成交付记录。
sidebar:
  order: 45
---

> **第 4 周 · 第 23 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C30、C35、C36、C44 · 运行：Node 24、本地 React 与 Chrome · 示例已运行验证

## 这一课解决什么问题

库存页在开发电脑上能打开，同事却反馈：图没了、详情加载失败、补货数字没变、手机按钮跑到屏幕外。

修复之前先找证据：浏览器请求了什么、事件有没有执行、传给 React 的值是否改变、哪个元素超出了容器。

这一课回到 C36 的 React 库存应用，用同一份六件商品练习交付排错。

学完你能：

- 分清资源 404、HTTP 失败、网络失败与 JSON 内容错误。
- 沿“事件 → 更新函数 → 新引用 → 页面”定位库存不更新。
- 用尺寸和存储原文解释手机溢出、刷新后数据异常。
- 在生产构建中通过 source maps 回到源码断点。
- 完成性能、内存、键盘与移动检查，留下别人能重现的排错记录。

配套文件在 [examples/c45](https://github.com/socoo123/js_web/tree/main/examples/c45)，网页实验沿用 examples/inventory/04-react。在这个阶段目录执行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

打开 `/js_web/labs/delivery.html?case=asset`，端口通常是 5173。导航中带 answer 的是对照版，先记录现象，再点答案。

## Java 程序员先看这里

| Java 经验 | 浏览器里的对应工作 | 关键差异 |
| --- | --- | --- |
| 看服务日志与请求链 | Console、Network、Initiator | HTML、脚本、样式、数据分别加载，失败可以发生在不同层 |
| 在业务方法设断点 | Sources 的事件与源码断点 | 浏览器执行构建后的 JS，源码位置由 map 关联 |
| 修改对象字段 | React 提交新的 state 引用 | 字段变化本身不会通知 React 渲染 |
| 查看数据库记录 | Application 查看当前 origin 的存储 | 本地记录属于浏览器，页面路径不是存储隔离边界 |
| GC 与堆转储 | Memory 的快照与 Retainers | DOM 移除以后，监听器闭包仍可能把节点留在堆中 |

## 1. 先确认失败的是哪一种资源

### URL 从域名根还是应用目录开始

以 `/` 开头的 [URL 从域名根解析](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references)。应用位于 `/js_web/` 时，`/media/inventory.svg` 请求的仍是域名根的 media。

**先猜一猜：** 下面前两行的结果相同吗？在 examples/c45 运行 `node paths.js`：

```js title="paths.js"
const page = new URL("https://socoo123.github.io/js_web/");
const base = "/js_web/";
console.log(new URL("/media/inventory.svg", page).pathname);
console.log(new URL(`${base}media/inventory.svg`, page).pathname);
console.log(new URL(`${base}data/products/P002.json`, page).pathname);
```

依次打印 `/media/inventory.svg`、`/js_web/media/inventory.svg`、`/js_web/data/products/P002.json`。第一条绕过了应用目录。

在 asset 实验打开 Network，勾选 Disable cache 后刷新。点失败的 inventory.svg，检查 Headers 的 Request URL，再看 Initiator 找到 img 的来源。对照 asset-answer，请求路径增加了 `/js_web/`，图片恢复。

Vite 工程中的修复使用 `import.meta.env.BASE_URL`，它来自当前构建的 base；图片 src 是这个值加上 `media/inventory.svg`。

### 404、断网、错误正文分别判断

request 故意请求 missing.json，页面提示 HTTP 404；request-answer 恢复 P002 无线鼠标、库存 0、单价 129.00 元。html-response 去掉 JSON 的 Accept 请求头，触发 Vite 页面回退：状态 200，正文却是 HTML。

正确请求沿用 src/product-api.js，关键代码是：

```js
const url = `${import.meta.env.BASE_URL}data/products/${encodeURIComponent(productId)}.json`;
const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
return readProductResponse(response, productId);
```

预期：请求命中应用目录下的 P002.json；校验通过后才进入成功状态。readProductResponse 先检查 response.ok，再解析 JSON，最后校验商品字段与请求编号。

按这三个边界读证据：

| Network / Console 证据 | 到了哪一步 | 应检查什么 |
| --- | --- | --- |
| 明确的 404、503 | 服务器已经返回 HTTP 响应 | URL、服务器状态与错误提示 |
| `(failed)`、Failed to fetch | 没有拿到可用响应 | 是否断网、连接失败，或被浏览器策略拦截 |
| 状态 200，Response 以 HTML 开头 | 响应到了，正文不是预期数据 | 是否进入了静态服务器的页面回退 |
| JSON 可解析，商品编号却不符 | 内容格式能读，业务身份错误 | 请求参数、缓存键、字段校验 |

fetch 收到 HTTP 404 时仍能返回 Response；断网时通常直接拒绝。状态 200 也只说明响应成功，不能替代 JSON 和业务校验。CORS 问题还应结合 Console 的具体说明判断。

Network 的 [Initiator、Response 与 Timing](https://developer.chrome.com/docs/devtools/network)分别回答“谁发的”“收到了什么”“时间花在哪里”。没有请求时，再查事件和查询缓存。

:::tip[自己尝试 · 本地 React]
1. 打开 request-answer，确认 P002 详情成功。
2. 在 Network 把 No throttling 改为 Offline，点页面“重新加载”。
3. 观察失败请求与页面提示，再恢复联网，点“重试详情”。
4. 改为慢网后重新加载，观察加载提示，再恢复 No throttling。

预期：离线时提示加载失败，恢复后能重试；慢网等待期间显示正在加载，成功后显示库存 0。它与 request 入口的 HTTP 404 有不同的网络证据。
:::

## 2. 事件执行了，React 仍需要新的状态

按四步检查状态：事件、业务值、提交引用、视图来源。找到断点，再修代码。

state 实验复用 C24 的错误起点。点击“给键盘补 1 件”，页面仍显示库存 12。处理函数的错误是：

```js
// 有问题的写法：修改旧对象，再提交同一个数组
function handleRestock() {
  products[0].stock += 1;
  setProducts(products);
}
```

字段变成 13，数组身份没变。React 用 Object.is 比较新旧 state，相同引用可以让更新被跳过。旧快照也被污染，后续无关渲染可能改变错误表现。

state-answer 用已学过的纯函数，替换数组及被修改的商品：

```js
function handleRestock() {
  setProducts((pending) => restockProduct(pending, "P001"));
}
```

预期：一次点击后立刻显示库存 13。函数式更新从待处理状态计算下一份值，restockProduct 负责生成新引用。Java 中对普通对象的字段赋值是数据修改；React 的渲染调度还需要显式提交状态。

**先猜一猜：** 为 P002 补货时，要把没变的 P001 也复制一遍吗？在 examples/c45 运行 `node identity.js`：

```js title="identity.js"
import { products } from "../shared/products.js";
import { restockProduct } from "../inventory/04-react/src/product-state.js";

const next = restockProduct(products, "P002");
console.log(Object.is(products, next));
console.log(Object.is(products[1], next[1]));
console.log(Object.is(products[0], next[0]));
console.log(products[1].stock, next[1].stock);
```

依次输出 false、false、true、0 1。数组和 P002 换身份，P001 继续共享；旧数组的 P002 仍为 0。[React 的对象更新指南](https://react.dev/learn/updating-objects-in-state)把这种更新理解为创建下一份状态，而不是修补上一份快照。

实际库存页的列表、详情上方读本地 Provider，详情下方的缓存实验读初始 JSON 和浏览器 mock。本地补货后，下方仍显示初始库存 0，符合这两套来源的设计。用 React DevTools 的 Components 看 props/state，用 Network 确认请求来源。

## 3. 布局看尺寸，恢复看存储原文

### 从溢出的元素反查 CSS

overflow 实验的面板有一条最小宽度约束：

```css
/* 有问题的写法：手机容器无法满足这个最小宽度 */
.broken-panel { min-width: 44rem; }
```

在 360px 视口下，面板比屏幕宽，保存按钮可能落到可见范围外。打开设备工具栏设置宽度 360，在 Elements 选中面板，切 Computed 查 min-width 和实际 width，再回 Styles 找到规则来源。

overflow-answer 移除了 broken-panel 类，保留的规则是：

```css
.delivery-panel {
  min-width: 0;
  width: 100%;
  padding: 1rem;
  border: 1px solid #bccadd;
}
```

预期：面板和按钮在屏幕内，无页面横向滚动。全局 box-sizing 已是 border-box，所以这里的 width 包括边框与内边距。JavaFX 的布局约束也会影响最终尺寸；浏览器还需要看盒模型、层叠和 Flex/Grid 的最小尺寸。

给 body 加 overflow-x: hidden 只会裁掉内容，按钮仍可能不可达。修复应作用于产生溢出的尺寸约束。

### 存储损坏时先保留现场

storage 实验使用独立键 `js_web:c45:products:v1`。点“写入损坏副本并读取”，初始化读取会失败，页面复制固定初始商品并显示原因，原记录继续保留。

在 examples/c45 运行 `node recovery.js`，同一行为也能在 Node 观察：

```js title="recovery.js"
import { initializeInventory, readInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const raw = "{";
const storage = { getItem: () => raw };
const result = initializeInventory(() => readInventorySnapshot(storage));
console.log(result.products.reduce((sum, product) => sum + product.stock, 0));
console.log(result.products.find((product) => product.id === "P002").stock);
console.log(storage.getItem(), result.message.includes("原记录保留"));
```

输出为 52、0、`{ true`。恢复了可用页面，保住了合法的售罄库存，也保住了坏 JSON 原文。像读取外部文件一样，存储内容要先经过 JSON 与字段校验。

在 Application → Storage → Local Storage 选择当前 origin，检查键名和 Value。复制需要保留的原文后，再点“清除实验副本”。同协议、主机和端口下的不同路径共享 [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)；换 localhost、127.0.0.1 或端口，读到的可能是另一份记录。

正式快照键仍是 `js_web:inventory:products:v1`。恢复时只处理目标键，保住同 origin 下的其他数据。

## 4. 在生产产物里回到业务源码

交付的是构建后的 HTML、CSS、JS 和数据文件，需要重新检查压缩、拆包后的实际产物。

在 examples/inventory/04-react 停下先前服务，执行：

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 8145 --strictPort
```

打开 `http://127.0.0.1:8145/js_web/`。本阶段 build 只包含正常应用首页，labs 继续由开发服务提供。vite.config.js 已有：

```js
build: { sourcemap: true },
```

预期：dist/assets 中生成 JS 和配套 map。按 [Vite 的 sourcemap 配置](https://vite.dev/config/build-options#build-sourcemap)，true 生成独立映射文件并在 JS 中留下关联入口。它帮助工具显示源码，浏览器运行的仍是构建后的代码。

在 Settings → Preferences → Sources 勾选 JavaScript source maps。Sources 搜索 product-state.js，在 restockProduct 的 return 行设断点，给 P002 点“补 1 件”：

- 暂停时 id 为 P002，原 stock 是 0。
- 单步经过返回表达式，生成新的数组与 P002 对象。
- 继续执行后，页面显示库存 1，总库存 53、库存总价值 26477.00 元。

这条链确认“构建资源 → map → 源码位置 → 输入值 → 页面结果”，类似 Java 调试器关联字节码与源码行。map 不参与业务执行。

如果只能看到压缩文件，打开命令菜单，搜索并进入 Developer Resources，查看 map 是否成功加载。常见原因是 map 404、映射被关闭，或 JS 与 map 来自不同次构建。重新构建后整体替换产物；只复制一个旧 map 无法修复版本错位。

## 5. 最后检查性能、内存与操作可达性

### Performance 看一段操作的时间花在哪里

“慢”需要绑定到一个动作。记录库存页首次、再次打开分类报表的差别：首次可能包含模块请求。Network 看下载，Performance 的 Main 看脚本、样式、布局与绘制。

想得到更明显的练习信号，可在开发服务打开 `/js_web/labs/performance.html?case=before`。这个 C34 实验把六件商品重复展示为 1200 行，并加入行计算。打开 [Performance](https://developer.chrome.com/docs/devtools/performance)，点 Record，在“实验备注”输入一个字符，停止记录。选中这次交互附近的 Main 区间，用 Bottom-up 找累计耗时较多的函数，再点调用位置回源码。

切到 case=after，用相同窗口、相同行数和节流设置重做。预期：无关备注更新不再执行整张慢列表的行计算。观察函数调用和时间分布，不把某次毫秒数当成固定标准。

React DevTools Profiler 看 React 子树渲染，Performance 还包括其他脚本和布局。和 Java 一样，先定位热点，再决定怎样优化。

### Memory 找到谁还保留着对象

memory 实验每次开启都会创建探针节点，并在 window 注册事件。关闭时节点被移除，错误版却留下监听器。关键实现位于 labs/stock-probe.js：

```js
export function attachStockProbe(target, doc, { leaky = false } = {}) {
  const node = doc.createElement("aside");
  node.className = "c45-stock-probe";
  node.textContent = "库存探针已挂载";
  doc.body.append(node);
  function updateProbe() { node.textContent = "库存 52"; }
  target.addEventListener("c45-stock-probe", updateProbe);
  return () => {
    node.remove();
    if (!leaky) target.removeEventListener("c45-stock-probe", updateProbe);
  };
}
```

leaky 为 true 时，关闭以后页面里没有 aside，window 仍持有 updateProbe，函数闭包又持有 node。这条引用链让脱离 DOM 的节点继续存活。memory-answer 关闭时同时移除监听器，引用链随之断开。

:::tip[自己尝试 · 本地 React]
1. 打开 memory，依次开启、关闭探针三次。
2. 打开 Memory，选择 Heap snapshot，点 Take snapshot；在 Class filter 输入 Detached。
3. 找到探针节点，查看 Retainers，沿保留关系追到 updateProbe 与 window 的事件监听器。
4. 切到 memory-answer，先刷新，再重复同样的三轮操作并取快照。

预期：错误版节点离开页面后仍被监听器保留；答案版解除监听器。比较两次采样中该引用链，不要求浏览器的总堆大小完全相等。
:::

采样前避免在 Console 保存节点，调试工具也可能保留它。GC 后堆大小涨跌很常见；[Memory 的保留关系](https://developer.chrome.com/docs/devtools/memory-problems)比一张“内存上升”的截图更能解释问题。它和 Java 的堆分析一样，需要找到仍可达的对象来自哪条引用链。

### 键盘和手机检查落到真实任务

回到正常库存页，设为 360px。用 Tab 找到搜索、商品操作和编辑字段，Shift+Tab 反向移动；焦点应可见，按钮应在屏幕内。编辑 P002，把库存留空提交，预期无法保存、错误文字可见且库存框获得焦点；改成 0 后能保存。

Elements 选中库存输入，打开 Accessibility，核对角色、可访问名称和错误说明关联。视觉相邻的标签也需要正确关联。

再检查 1280px。设备模式模拟视口，真实触摸、虚拟键盘和屏幕阅读器仍需相应设备验收。每次都走完“找到商品 → 编辑 → 出错 → 修正 → 保存”。

## 常见错误与调试

### 补货点了，数字一直停在 12

**现象**：state 入口点击“给键盘补 1 件”，库存仍为 12；Console 没有异常。

**工具**：Sources 打开 labs/MutationBroken.jsx，在 setProducts(products) 那一行设断点，再点补货。React DevTools 的 Components 找到 MutationBroken 查看当前 state。

**证据**：断点命中，products[0].stock 已为 13，事件确实执行；传给 setProducts 的仍是同一个 products 数组。渲染输出停留在先前的 12。

**原因**：原地修改污染旧 state，提交时引用相同。问题断在“状态提交”这一步。

**修复**：将处理函数换成第 2 节的函数式更新，使用 restockProduct 生成下一份数组。

**确认**：刷新后重做一次点击，库存立即从 12 变 13。阶段目录运行 `npm test -- tests/delivery.test.jsx`，其中真实点击回归断言可见库存；只断言对象字段等于 13 会漏掉这个故障。

## 练习

### 练习 1：请求之前发生了什么

先预测 paths.js 与 identity.js 的全部输出，再解释：为什么改成相对字符串 media/inventory.svg，直接放到 labs/delivery.html 的 img 上，也可能找不到图片？

验收：能写出两个脚本的结果，并明确相对 URL 的基准目录。

<details>
<summary>提示</summary>

浏览器里的普通相对 URL 跟随文档地址；Vite BASE_URL 跟随应用配置。对象身份则与路径解析无关。

</details>

<details>
<summary>参考答案</summary>

paths.js 为 /media/inventory.svg、/js_web/media/inventory.svg、/js_web/data/products/P002.json；identity.js 为 false、false、true、0 1。相对路径放在实验文档中，会解析到 /js_web/labs/media/inventory.svg。用 BASE_URL 拼公开资源地址，才能明确以应用目录为起点。

</details>

### 练习 2：修复一次更新，留下一份证据

修复 labs/MutationBroken.jsx，并运行本课回归。

验收：刷新后一次点击，键盘库存从 12 到 13；再次刷新，连续点两次为 14。

<details>
<summary>提示</summary>

沿用纯函数，从待处理状态生成下一份数组。

</details>

<details>
<summary>参考答案</summary>

setProducts 改为接收 pending 并返回 restockProduct(pending, "P001")。新数组触发更新；旧数组和未修改商品保持原值。连续点击也从最新待处理状态累加。

</details>

### 练习 3：完成一份交付检查记录

从 asset、overflow、storage、memory 中选一个，填写配套 README 的记录格式，再对正常库存页走完下面的交付清单。

验收：记录包含入口、初始条件、操作、预期与实际、证据、根因、修复和复验；另一位同事按记录能得到相同现象。

<details>
<summary>提示</summary>

“清了缓存好了”缺少根因。“请求 /media/inventory.svg 为 404，补齐应用 base 后返回 200”才把修复和证据连起来。

</details>

<details>
<summary>参考答案</summary>

例如 overflow：360px 打开指定入口，预期按钮可见，实际面板宽于视口；Computed 找到 min-width: 44rem；移除错误类后，无横向滚动且焦点可到保存按钮；恢复错误类能复现。同样记录 1280px 复验。Memory 案例应记录保留链与解除监听器，不能只写堆大小下降。

</details>

## 项目进度

在 examples/inventory/04-react 继续：labs/delivery.html 与 delivery-main.jsx 串联故障，stock-probe.js 处理监听器；public/media 添加库存标识。tests/delivery.test.jsx 与 labs/e2e/delivery.spec.js 检查修复效果。

在阶段目录运行：

```sh
npm run lint
npm test
npm run test:e2e:delivery
npm run test:e2e
```

依次检查应用 Hooks、业务回归、开发实验和生产应用。排错记录保存在 examples/c45/README.md。

逐项操作并记录结果：

| 检查 | 可观察的通过条件 |
| --- | --- |
| 固定数据 | 初始六件商品、52 件库存、26348.00 元；有快照时先说明起点 |
| 资源与数据 | 生产预览资源成功；P002 请求路径、HTTP、JSON 与编号都正确 |
| 失败恢复 | 断网可见错误且可重试；坏存储可读出原因并按键恢复 |
| 更新与刷新 | 补货后列表和统计同步；显式保存快照后刷新恢复 |
| 布局与键盘 | 360/1280px 可用；编辑、报错、纠正、保存均可完成 |
| 诊断证据 | 生产源码断点可用；性能热点有对应动作，监听器按生命周期释放 |

## 小结

- 先确定资源、请求、状态、布局还是存储失败，再挑能提供证据的面板。
- 响应成功、数据正确、React 更新与最终可操作，是连续的几个检查点。
- 生产排错使用同次构建的 JS 和 map，断点最后要连到页面结果。
- 性能看特定操作的耗时，内存看仍在保留对象的引用链。
- 一份排错记录应让别人重现问题、理解根因并重复验证修复。

自测：

1. 请求状态 200，为什么解析 JSON 仍会失败？
2. state 字段已经变了，页面为什么可能还保持旧数字？
3. 清除坏存储前，应该保存哪些现场信息？
4. 节点移出 DOM 后，window 监听器怎样继续保留它？
5. 生产断点、手机尺寸和键盘检查分别证明了哪一段链路？

下一课把已检查的静态产物发布到 GitHub Pages，验证资源路径、刷新和演示路由。

## 延伸阅读

- [Chrome：Network 的请求、响应与发起来源](https://developer.chrome.com/docs/devtools/network)
- [Chrome：使用 source maps 调试原始代码](https://developer.chrome.com/docs/devtools/javascript/source-maps)
- [Vite：生产 source maps 配置](https://vite.dev/config/build-options#build-sourcemap)
- [Chrome：Performance 记录与分析](https://developer.chrome.com/docs/devtools/performance)
- [Chrome：内存问题、脱离 DOM 的节点与保留关系](https://developer.chrome.com/docs/devtools/memory-problems)
- [Chrome：Accessibility 检查参考](https://developer.chrome.com/docs/devtools/accessibility/reference)
