---
title: C34 性能、加载与错误诊断
description: 用 Profiler 找到渲染成本，按测量结果使用缓存和 Transition，分清代码加载、请求状态与错误边界。
sidebar:
  order: 34
---

> **第 3 周 · 第 17 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C22、C29、C30、C33 · 运行：Node 24 与本地 React · 部分示例未运行，已在对应位置标注

## 这一课解决什么问题

库存页能用了，但输入备注时，下面的大列表也跟着计算。有人给所有函数加 useCallback，页面仍然卡；有人在请求外面套 Suspense，却一直看不到 fallback。后来报表出错，整个页面又消失了。

先确认问题：计算慢看渲染记录，代码下载慢看 Network，渲染抛错看组件堆栈。

学完你能：

- 用 React DevTools Profiler 找出某次交互里耗时的组件
- 解释 memo、useMemo、useCallback 各自缓存什么，保留完整依赖
- 把输入回显和耗时结果分开更新，理解 Transition 的调度范围
- 按需加载分类报表，区分 Suspense 与已有请求状态
- 用错误边界隔离报表失败，并选择正确的恢复方式

[Node 示例](https://github.com/socoo123/js_web/tree/main/examples/c34)位于 examples/c34。React 实验在[阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)：进入该目录，执行 `npm ci`、`npm run dev -- --host 127.0.0.1`，打开 `/js_web/labs/performance.html`。下文路径均接在开发服务地址后。

## Java 程序员先看这里

| Java 经验 | React 对应 | 差异 |
| --- | --- | --- |
| 用性能分析器找热点 | Profiler 按提交查看组件成本 | 组件渲染耗时和整个页面的响应时间是不同指标 |
| 给计算做缓存 | useMemo | 缓存属于组件实例，依赖用 Object.is 比较 |
| 保留一个回调对象 | useCallback | 保留函数身份，函数闭包仍必须跟随依赖更新 |
| 把重任务交给线程池 | Transition | 调整 React 更新优先级，JS 仍在原线程执行 |
| 调用栈上的 try/catch | 错误边界 | 根据组件树隔离后代的渲染失败，不靠 JSX 外层的 try |

## 1. 先测量：是哪一次交互，带动了谁

**优化对象是具体交互。** 先写下“在备注框输入一个字时，列表重新执行很慢”，再录制这一次操作。把页面所有操作混在一段记录里，很难解释改动为何有效。

实验重复展示六件固定商品为 1200 行，每行增加纯计算，放大渲染成本；这些展示样本不会加入业务库存。真实项目的六张卡片继续使用直接计算。

实验入口用 [`Profiler`](https://react.dev/reference/react/Profiler) 包住内容，onRender 指向 labs/performance-main.jsx 中的函数：

```jsx
function recordRender(id, phase, actualDuration, baseDuration) {
  console.log("渲染测量", { id, phase, actualDuration, baseDuration });
}
```

加载打印 mount，改备注打印 update。actualDuration 是本次提交对应的子树渲染耗时；baseDuration 估计整棵子树重新渲染的成本。数值随机器变化，比较同条件下同操作的前后差异。

> 未运行验证：下面 Profiler 面板的手动录制路径未逐项操作；程序化 Profiler 测量见配套实验。

:::tip[自己尝试 · 本地 React]
1. 打开 `/js_web/labs/performance.html?case=before`，按 F12，在 DevTools 顶部选择 **Profiler**；被折叠时从 `»` 菜单找。没有该面板时，先安装 [React Developer Tools](https://react.dev/learn/react-developer-tools) 并刷新。
2. 点击录制圆点，在“实验备注”输入一个字，停止录制。选择这次更新的提交，查看 Flamegraph 或 Ranked，定位 SlowListView 和 SlowRow。
3. 用相同输入，依次录制 `?case=memo` 和 `?case=after`。也可在 Console 比较“渲染测量”日志。

预期：before 的无关备注带动整份列表；memo 版本仍带动列表；after 中备注保留，列表通常跳过这次渲染。改变“筛选名称”时，after 的列表仍会更新。
:::

Profiler 中组件耗时包含后代成本，先向下找承担计算的节点，再用 Components 检查 props。保持 StrictMode 开启，在同条件下比较；正式结论还应在生产环境复测。普通生产构建默认关闭 profiling，需要专用构建才能录制。

React Profiler 回答“哪些组件在渲染”；布局、绘制和长事件处理看浏览器 Performance，下载看 Network。

先改善结构：局部 state 放回使用它的组件，筛选与统计直接计算，事件结果在事件中更新，减少 Effect 引起的连锁更新。纯渲染才能安全跳过或重做。

## 2. 缓存：组件、计算结果和函数身份

**memo 让输入相同的组件有机会跳过父节点带来的重渲染；useMemo 缓存计算结果；useCallback 缓存函数身份。** 它们解决不同的一段成本，按热点组合使用。

### 为什么只包 memo 仍然没用

labs/SlowList.jsx 导出 `memo(SlowListView)`。父组件每次调用 filterRows 都返回新数组，每次写箭头函数都得到新函数。即使内容相同，props 的身份也变了。

**先猜一猜：** 两次筛选结果内容一样，Object.is 会认为它们相等吗？在 examples/c34 运行 `node identity.js`：

```js title="identity.js"
import { products } from "../shared/products.js";
const filter = () => products.filter((product) => product.stock > 0);
console.log(Object.is(filter(), filter()));
const rows = filter();
console.log(Object.is(rows, rows));
const firstChoose = (id) => id;
const nextChoose = (id) => id;
console.log(Object.is(firstChoose, nextChoose));
console.log(Object.is(products[0], { ...products[0] }));
```

输出依次是 false、true、false、false。memo 默认逐个 prop 用 Object.is 比较。一个总是新建的数组或函数，就足以让这次比较发现变化。Java 里内容相等也不会让对象的 `==` 成立。

### 让两个真正的输入稳定下来

labs/PerfFixed.jsx 的完整组件如下，SlowList 是已经包过 memo 的组件：

```jsx
import { useCallback, useMemo, useState } from "react";
import { filterRows } from "./performance-data.js";
import SlowList from "./SlowList.jsx";

export default function PerfFixed() {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState("");
  const rows = useMemo(() => filterRows(query), [query]);
  const choose = useCallback((id) => setSelected(id), []);
  return <>
    <label>筛选名称 <input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <label>实验备注 <input value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <p role="status">{rows.length} 行 · 已选 {selected || "尚无"}</p>
    <SlowList rows={rows} onChoose={choose} />
  </>;
}
```

只改 note，query 没变，rows 复用上次数组，choose 也复用上次函数；SlowList 的两项输入都相同。输入“鼠标”，query 改变，重新筛选为 200 行，点击任一“查看 P002”仍能选中商品。这是需要的变化。

useMemo 首次计算，依赖改变后重算；useCallback 缓存函数，点击时才执行 choose。choose 只读稳定的 setSelected，所以空依赖成立；也可直接传 setSelected。

filterRows 使用模块级固定样本，只依赖 query；若改用 props 中的 products，也要列入依赖。空数组表示没有响应式依赖。

[`memo`](https://react.dev/reference/react/memo) 只针对父节点带来的输入检查。组件自己的 state 改变、读取的 Context 改变，仍会更新。把 product 原地改掉也会破坏身份判断，所以不可变更新继续适用。不要为了跳过渲染，在自定义比较器里忽略函数 prop：旧函数可能捕获了旧 state。

普通按钮的 onClick 先写普通函数；没有昂贵消费者时，缓存未必值得。React 还可能丢弃缓存，删掉优化后业务仍应正确；需要持续保存的数据用 state、ref 或数据层。

### Compiler 在哪里

[React Compiler](https://react.dev/learn/react-compiler/introduction) 在构建时自动优化符合规则的组件与计算，减少手动缓存。它需要接入构建流程；安装 React 19 不会自动启用，本项目也未接入。采用后仍须遵守纯渲染规则并测量效果。

## 3. Transition：输入先回显，结果稍后跟上

**Transition 标记可以让位的 React 更新。** 输入框的回显应立即更新，耗时列表可以稍后跟上；新输入到来时，React 可以放弃尚未提交的旧结果，优先处理新输入。

**先猜一猜：** startTransition 中的日志会最后出现吗？在 examples/c34 运行 `node transition-order.js`：

```js title="transition-order.js"
import { startTransition } from "../inventory/04-react/node_modules/react/index.js";
console.log("开始");
startTransition(() => {
  console.log("回调执行");
});
console.log("结束");
```

输出是“开始”“回调执行”“结束”。这个 Node 例子调用真实 API，只观察回调顺序；页面更新由下面的组件演示。运行前要在阶段 4 执行 npm ci。

回调立即执行，被标记的是其中安排的 state 更新。如果把耗时循环直接写进回调，当前 JS 调用仍会阻塞。Transition 不会把循环搬到线程池，也不是固定等待几百毫秒的防抖。

labs/TransitionFilter.jsx 从 react 导入 useMemo、useState、useTransition，组件主体是：

```jsx
export default function TransitionFilter() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [pending, startTransition] = useTransition();
  const rows = useMemo(() => filterRows(query), [query]);
  function handleChange(event) {
    const next = event.target.value;
    setText(next);
    startTransition(() => setQuery(next));
  }
  return <>
    <label>筛选名称 <input value={text} onChange={handleChange} /></label>
    <p role="status">{pending ? "正在更新结果…" : "结果已更新"}</p>
    <p>当前结果：{query || "全部"} · {rows.length} 行 · 已选 {selected || "尚无"}</p>
    <div aria-busy={pending}><SlowList rows={rows} onChoose={setSelected} /></div>
  </>;
}
```

打开 `?case=transition` 输入“鼠标”：输入框先回显，旧列表暂时保留，最后结果变成 200 行。pending 和 aria-busy 提示更新尚未完成；快机器上可能一闪而过。

text 是当前输入，query 是安排给列表的条件；它们允许暂时不同。受控 input 的更新仍在 Transition 外。

useMemo 让输入回显那次渲染先复用旧 rows，memo 列表随后也能跳过；真正处理 query 时才更新列表。1200 个 SlowRow 把工作分布到多个组件，React 有调度机会。一个组件函数内的超长同步计算仍须先返回，必要时应改善算法、减少展示数量，或把纯重计算移到 Worker。

[useTransition](https://react.dev/reference/react/useTransition) 调整响应顺序，重做工作还可能增加总计算量；Java 的线程池类比到这里就失效了。

## 4. lazy 与 Suspense：等待哪一种东西

**lazy 延迟获取组件代码，Suspense 给会挂起的后代提供等待界面。** 分类报表平时收起，第一次展开才需要模块，适合用这两个 API。

阶段 4 新增 src/ReportPanel.jsx，在组件外声明：

```jsx
const InventoryReport = lazy(() => import("./InventoryReport.jsx"));
```

首次渲染时，[lazy](https://react.dev/reference/react/lazy) 调用加载函数，等待模块的 default 组件。声明放在模块顶层保持身份稳定；收起再展开复用加载结果。

Panel 的关键结构如下。完整文件还管理 open、attempt，并提供错误提示 fallback：

```jsx
    <div id="inventory-report">{open && <ReportErrorBoundary key={attempt} fallback={fallback}>
      <Suspense fallback={<p role="status">正在加载报表代码…</p>}>
        <Report products={products} />
      </Suspense>
    </ReportErrorBoundary>}</div>
```

Report 默认是 InventoryReport，实验可传其他组件。等代码时显示加载提示，成功后显示分类表；盘点、编辑和列表继续可用。

:::tip[自己尝试 · 本地 React]
1. 打开 `/js_web/labs/performance.html?case=lazy`，点击“查看分类报表”。实验加载器额外等待约一秒，便于观察 fallback。
2. 在等待时点击“记录 1 次”。报表出现后，盘点仍为 1；收起再展开，报表直接显示。
3. 换成 `?case=request`。它把 C30 的手工请求组件放进 Suspense，观察初次加载，随后可在 Network 开启 Offline，再点“选择 P002”。

预期：lazy 实验先等代码再显示表；request 实验显示自己的“正在加载 P001…”或请求失败提示，不会显示“Suspense 正在等待…”。恢复网络后可重试详情。
:::

Effect 中的 fetch 在提交后启动，组件已返回加载状态的 JSX，Suspense 不会追踪这个 Promise。普通 useQuery 同样沿用自己的状态接口；支持 Suspense 的数据接口需明确采用。

[`Suspense`](https://react.dev/reference/react/Suspense) 配合 lazy、use 的稳定 Promise 或支持它的数据层。fallback 表示等待；失败交给错误边界或请求状态。

Vite 把动态导入分成单独 chunk，减少首次所需代码，也增加以后一次等待。类似 Java 按需取代码的思路；这里通过 URL 获取模块，Network 能看到。

## 5. 错误边界：一个区域失败，其他区域继续工作

**错误边界捕获后代渲染失败，用替代界面换掉这个区域。** 创建 `<InventoryReport />` 只是创建元素，React 稍后才调用组件；在父函数返回 JSX 的外层写 try/catch，接不到后代那时抛出的异常。

src/ReportErrorBoundary.jsx 是本课唯一的 class 组件。React 目前通过 class 的相关生命周期实现自定义错误边界：

```jsx
import { Component } from "react";

export default class ReportErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error, info) {
    console.error("报表区域失败", error, info.componentStack);
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
```

打开 `?case=render-error`，展开报表。CrashReport 抛错后，Panel 显示“报表暂时无法显示”，盘点按钮仍可用。getDerivedStateFromError 让边界改为渲染 fallback；componentDidCatch 获得错误和组件堆栈，本例记录在 Console，真实项目可在这里接错误上报。

边界自身失败时要由更上层边界接住。普通事件处理函数、setTimeout 回调和普通请求 Promise 的异常，在各自入口用 try/catch、catch 或请求状态处理；React Action/Hook 返回的 Transition 是有专门错误处理支持的路径，参见[错误边界文档](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)。这样不会把“包一层边界”误当成处理所有异步错误。

### 重试之前，先弄清失败对象

Panel 通过改变 attempt 作为 key 重建错误边界。渲染输入已修正时，子树可以重新渲染；外面的盘点与草稿身份保持。

lazy 加载函数一旦拒绝，React 会把拒绝原因交给错误边界。同一个 lazy 组件保留这份结果，只重建边界会再遇到同一个错误。生产 chunk 下载失败时，先恢复网络、确认资源已可用，再刷新页面。刷新会清掉当前内存库存和草稿，操作前先考虑未保存内容；更完善的按需重载策略留给具体应用设计。

三类界面可以这样区分：

| 情况 | 本项目由谁显示 | 恢复操作 |
| --- | --- | --- |
| 报表 JS 模块正在下载 | Suspense fallback | 等代码加载 |
| 商品 JSON 请求中或失败 | 请求组件自己的 state / Query 状态 | 取消、重读或重试请求 |
| 报表渲染抛错，或 lazy 拒绝 | ReportErrorBoundary | 修复渲染原因后重建子树；模块失败则检查资源并刷新 |

Java 的异常处理沿调用栈；这里按组件树划分恢复区域。

## 常见错误与调试

### 补货成功，价值仍停在旧数字

**现象**：打开 `?case=stale`，点“补 1 件”，库存变成 13，价值仍是 4788.00 元。

**工具**：DevTools → Components 选择 StaleMemoBroken，查看商品 state；再在 Sources 打开同名文件，搜索 useMemo。**证据**：state 中 stock 为 13，代码却把依赖写成空数组：

```jsx
  const valueCents = useMemo(() => product.stock * product.priceCents, []);
```

**原因**：计算读取库存和单价，但没有声明依赖，后续继续使用首次结果。

**修复**：改为 StaleMemoFixed.jsx 的依赖；这么便宜的一次乘法，直接计算也可以：

```jsx
  const valueCents = useMemo(() => product.stock * product.priceCents, [product.stock, product.priceCents]);
```

**确认**：刷新后补货，13 件对应 5187.00 元。在阶段 4 执行 `npm run lint:c34-bug`，原文件会报缺依赖；`npm run test:bug -- labs/performance-bugs.test.jsx` 的业务断言也失败。修复后两项通过。正常 tests/performance.test.jsx 同时保护正确实现。

### 报表加载失败，点重试仍然失败

**现象**：`?case=chunk-error` 展开后提示报表不可用；点击“重试报表渲染”，仍然报错。

**工具**：Console 展开“报表区域失败”的 Error 与组件堆栈；Sources 打开 LazyReportLab.jsx，在 `throw new Error` 处设断点，刷新后再展开。**证据**：首次加载进入拒绝分支，点击重试不会再次进入加载函数。此实验用明确抛错模拟模块失败；生产环境还要在 Network 筛选 JS，核对失败 URL、状态码与响应内容。

**原因**：重置边界仍遇到缓存的失败结果。**修复**：实验去掉 chunk-error 参数并刷新；真实环境修复网络或缺失资源后刷新。**确认**：显示四类统计。正常回归也覆盖局部失败与 lazy 拒绝。

## 练习

### 练习 1：是哪一个 prop 变了

在 examples/c34 运行 `node prediction.js` 前，写出三行结果，并判断把这两个对象的字段分别传给 memo 子组件，能否凭这次输入跳过渲染。

```js title="prediction.js"
const previous = { query: "鼠标", onChoose: (id) => id };
const next = { query: "鼠标", onChoose: (id) => id };
console.log(Object.is(previous.query, next.query));
console.log(Object.is(previous.onChoose, next.onChoose));
console.log(Object.is(previous, next));
```

<details>
<summary>提示</summary>

字符串按值比较，函数和普通对象按身份比较。memo 检查每项 prop，不会调用函数来比较返回值。

</details>

<details>
<summary>参考答案</summary>

依次为 true、false、false。query 相同，但 onChoose 是新函数，memo 会看到输入变化。只有消费者的重渲染值得跳过时，才考虑稳定回调；若函数读取 query 等响应式值，useCallback 也要声明依赖。

</details>

### 练习 2：修好依赖，再证明业务仍正确

从 labs/StaleMemoBroken.jsx 开始修复。验收：首次为 12 件、4788.00 元；补两次后为 14 件、5586.00 元；Hooks lint 与 performance-bugs.test.jsx 通过。比较删除 useMemo 和保留完整依赖两种实现，说明你更愿意留下哪种。

<details>
<summary>提示</summary>

列出计算读取的字段；价值必须随库存更新。

</details>

<details>
<summary>参考答案</summary>

完整依赖是 `[product.stock, product.priceCents]`；也可直接写 `const valueCents = product.stock * product.priceCents`。一次乘法开销很小，直接计算更清楚。Fixed 文件保留 useMemo 是为了展示正确依赖，项目分类报表采用直接计算。

</details>

## 项目进度

从 C33 的 examples/inventory/04-react 继续。新增 ReportPanel、InventoryReport、ReportErrorBoundary 与 report-summary.js。在 App 的 InventoryPage 中，InventorySummary 后加入 `<ReportPanel />`。完整源码已保存在阶段目录，原 Action 详情与 Query 缓存继续工作。

报表读取同一个 ProductsContext，按本地商品统计，不使用详情 mock 的副本。汇总函数的核心循环是：

```js
  for (const product of products) {
    const group = groups.get(product.category) ?? {
      category: product.category, count: 0, stock: 0, valueCents: 0,
    };
    group.count += 1;
    group.stock += product.stock;
    group.valueCents += product.stock * product.priceCents;
    groups.set(product.category, group);
  }
```

groups 是本次新建的 Map，局部记录更新保留输入。`report.js` 复用函数，总库存 52、总价值 2634800 分。React 显示带表头与 caption 的表格。

在阶段 4 执行 `npm run lint`、`npm test`、`npm run build`，再运行 `npm run preview -- --host 127.0.0.1`，打开 `/js_web/#/products`。在 Network 选 Disable cache 并刷新，筛选 InventoryReport：展开之前没有报表 chunk 请求，第一次展开才加载。第二次展开复用模块。

验收：外设 2 种、12 件、4788.00 元；P002 补 1 件后，外设变为 13 件、4917.00 元。编辑鼠标名称时展开、收起报表，草稿与盘点次数都保留。源文件很小，拆分用于练习加载边界；六件商品的筛选和汇总维持直接计算。labs 只用于开发服务，课程 Pages 发布静态正文。

## 小结

- 先录制具体交互，确认渲染、计算、布局或下载的成本。
- memo 检查组件输入，useMemo 缓存结果，useCallback 缓存函数身份；完整依赖保证数据跟得上。
- Transition 给 React 更新安排优先级，输入回显立即更新，同步 JS 仍在当前线程。
- Suspense 等待支持挂起的后代；普通 Effect 请求继续管理自己的状态。
- 错误边界隔离失败区域，恢复方式取决于渲染原因还是模块加载原因。

自测：

1. 为什么只给 SlowList 包 memo，修改备注仍可能带动整份列表？
2. 删除 useMemo 后业务结果变错，首先应该检查什么？
3. 为什么把重循环放进 startTransition 的回调仍然阻塞？
4. 给 Effect 请求组件套 Suspense，哪个机制负责显示 HTTP 错误？
5. lazy 拒绝后，为什么重建错误边界不等于重新下载模块？

下一课把这些交互变成行为测试，系统学习 React UT、集成测试与 E2E 的分工。

## 延伸阅读

- [React：Profiler 与测量字段](https://react.dev/reference/react/Profiler)
- [React：memo 与减少输入变化](https://react.dev/reference/react/memo)
- [React：useMemo 与 useCallback 的区别](https://react.dev/reference/react/useMemo#memoizing-a-function)
- [React：useTransition](https://react.dev/reference/react/useTransition)
- [React：Suspense 的触发条件](https://react.dev/reference/react/Suspense#what-activates-a-suspense-boundary)
- [React：错误边界](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
