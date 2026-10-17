---
title: C23 useState：状态快照与更新队列
description: 用盘点与补货实验解释事件、状态快照、批处理、函数式更新和延时闭包，修复连续更新丢失的问题。
sidebar:
  order: 23
---

> **第 2 周 · 第 12 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C06、C12、C22 · 运行：Node 24、Chrome、本地 React · 示例已运行验证

## 这一课解决什么问题

库存页已经能显示六件商品，现在要让它响应点击。你给机械键盘加了「补 3 件」按钮，连续写三次 setStock(stock + 1)，库存却只从 12 变成 13。

换一种试法：先安排两秒后补 3 件，等待期间立即补 1 件。页面先显示 13，最后却停在 15，那一件像被吃掉了。再看日志，页面明明已经显示 15，回调还在打印 12。

这些现象来自同一条规则：**每次渲染拿到自己的 state 快照，setter 提交的是后续更新。** 用 Java 可变字段的思路理解它，就容易把「这次读到的值」和「下一次要算的值」混在一起。

学完你能：

- 用 useState 记住组件状态，通过事件函数发起更新
- 逐行预测 setter 前后、连续更新和延时回调中的值
- 区分批处理、替换值与函数式更新，按顺序算出结果
- 根据业务意图选择点击时的快照，或基于待处理状态计算
- 遵守 Hooks 调用规则，用断点和行为测试定位丢失的补货

例子在 [examples/c23](https://github.com/socoo123/js_web/tree/main/examples/c23)，React 实验在[库存项目阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)。在阶段 4 目录执行 npm ci，再运行 `npm run dev -- --host 127.0.0.1`，打开终端给出的 /js_web/ 地址。实验页在该地址后接 labs/state.html；每次换实验或重新预测，都先刷新，把起点恢复为固定值。

## Java 程序员先看这里

| Java 经验 | React 对应 | 关键差异 |
| --- | --- | --- |
| 对象字段跨方法调用保留 | state 跨渲染保留 | state 由 React 记住，每次组件调用读取一份快照 |
| setter 改完字段后立即读新值 | setStock 请求更新 | 当前事件函数里的 stock 仍来自本次渲染 |
| this.stock += 1 读取当下字段 | setStock(n => n + 1) | 参数 n 接收队列中待处理的状态，不靠外层快照累加 |
| lambda 捕获局部值或对象引用 | 事件函数与延时闭包 | 捕获本次数字绑定，与稍后读取可变对象字段的行为不同 |
| 实例字段属于各自对象 | state 属于各自组件实例 | 两处使用同一个组件，各有自己的状态 |

## 1. 事件发起更新，useState 记住状态

[`useState`](https://react.dev/learn/state-a-components-memory) 返回两个东西：本次渲染的值，以及请求更新的 setter。先打开 /js_web/labs/state.html?case=basic，看 labs/BasicCounter.jsx：

```jsx
import { useState } from "react";

export default function BasicCounter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
  }
  return <button type="button" onClick={handleClick}>核对 {count} 次</button>;
}
```

初次显示「核对 0 次」。点一下变成 1，再点一下变成 2。方括号是数组解构，count 和 setCount 是你取的名字；惯例是值叫 count，setter 叫 setCount。

第一次渲染用初始值 0。点击请求变为 1，React 再调用组件时，useState 返回记住的 1。虽然代码又执行到了 useState(0)，初始值也不会把已有状态重置为 0。

普通局部变量 `let count = 0` 缺少这两个能力：修改它不会通知 React 更新界面，下次组件调用又会重新声明它。挪到模块顶部虽然能保留变量，却让多处使用组件时共享同一个值，也没有自动触发渲染。

count 写成 const 很合适。每次调用组件都会创建新的局部绑定；下一次绑定可以是 1，这次的 0 无需重新赋值。把 const 改成 let 再写 count += 1，仍然只是改局部变量。

### onClick 接收函数

`onClick={handleClick}` 把函数交给 React，点击时再调用。`onClick={() => setCount(count + 1)}` 也可以，箭头函数包住了要在事件里执行的工作。[响应事件](https://react.dev/learn/responding-to-events)

写成 `onClick={handleClick()}`，括号会让它在渲染时执行。若它又调用 setter，就可能反复触发更新，报 Too many re-renders。检查 JSX 中传进去的是函数，还是执行函数后得到的结果，往往就能找到原因。

对照 Java：onClick 像注册监听器；state 的保存和触发界面更新则由 React 提供，普通字段赋值没有这份约定。

## 2. 状态快照：setter 后面读到的还是本次值

**先猜一猜：** 初始库存 12。点一次「补 3 件并观察日志」，页面和下面三条日志分别是什么？

labs/SnapshotProbe.jsx 的事件函数如下：

```jsx
function handleSnapshot() {
  console.log("点击时", stock);
  setStock(stock + 3);
  console.log("调用 setter 后", stock);
  setTimeout(() => console.log("两秒后", stock), 2000);
}
```

页面显示 **15 件**；日志依次是「点击时 12」「调用 setter 后 12」「两秒后 12」。即使两秒已经足够完成界面更新，最后的日志仍是 12。

本次组件调用得到 stock=12，据此生成 JSX 和 handleSnapshot。事件执行时，stock + 3 先按普通 JS 计算为 15，再交给 setter。这个调用的含义是「请求后续状态为 15」，当前函数里的 stock 绑定保持原样。[state 如同一张快照](https://react.dev/learn/state-as-a-snapshot)

后续渲染拿到 stock=15，并生成新的事件函数。旧的 handleSnapshot 和它创建的定时器依旧使用旧绑定。这里的「快照」表达一次渲染看到的状态；对象和数组仍要遵守只读约定，它不会自动深复制数据。

![React 状态快照与数据流：本次渲染的 stock 为 12，事件排入三个函数式更新，待处理值依次从 12 到 13、14、15；后续渲染拿到 15 并提交 DOM，本次创建的延时回调仍读取旧绑定 12。](../../../assets/diagrams/c23-state-snapshot.svg)

沿主线读更新队列和新界面，再看旁边的延时分支。新界面使用新快照，旧回调继续保留创建它的那次绑定。

:::tip[自己尝试 · 本地 React]
1. 打开 /js_web/labs/state.html?case=snapshot，并打开 DevTools → Console。
2. 点「补 3 件并观察日志」，页面从 12 变成 15。
3. 两秒内再点「补 1 件」，页面变成 16，等待最后一条日志。

预期：三条实验日志的数字都是 12，页面最后是 16。页面上的新状态和旧回调中的旧快照可以同时存在。
:::

setter 没有返回一个「等待本次提交完成」的 Promise，写 await setStock(...) 也没有这种保证。解决办法是先确定需要什么：同一事件里要使用自己算出的 15，可以用局部变量 nextStock 保存计算结果；要知道页面最后显示多少，就查看后续渲染的结果。单纯等一会儿不会改变旧闭包的绑定。

Java 的 `this.stock` 在回调执行时读取对象字段，可能读到字段的新值；这里闭包读取的是某次调用的局部数字绑定，更接近 Java lambda 捕获一个局部 int。

## 3. 批处理：三次替换为何只加一次

React 会把同一事件函数中的多项更新集中处理。事件先完成，后续渲染再根据更新计算界面，这叫**批处理**。页面因此可以在一次操作完成后呈现连贯结果。[更新队列](https://react.dev/learn/queueing-a-series-of-state-updates)

**先猜一猜：** 刷新到 12 件，下面的按钮处理函数执行一次、两次后，库存分别是多少？

```jsx
// 有问题的写法：三次计算都读取同一份 stock 快照。
function handleThree() {
  setStock(stock + 1);
  setStock(stock + 1);
  setStock(stock + 1);
}
```

结果是 **13、14**。第一次点击时，三行等价于 setStock(13)、setStock(13)、setStock(13)。第二次点击使用后续渲染生成的新函数，读到 stock=13，三行又都要求替换为 14。

用下面这个 Node 例子手算。applyUpdates 是 examples/c23/update-queue.js 中的短函数：依次取出更新，遇到函数就把待处理值传进去，遇到普通值就用它替换。它帮助核对**单个 state 的队列计算**；实际 React 的调度与 DOM 提交由浏览器实验观察。

```js title="queue-values.js"
import { products } from "../shared/products.js";
import { applyUpdates } from "./update-queue.js";

const stock = products[0].stock;
const updates = [stock + 1, stock + 1, stock + 1];
console.log("排入的值", updates.join("、")); // → 排入的值 13、13、13
console.log("下一次库存", applyUpdates(stock, updates)); // → 下一次库存 13
console.log("本次快照", stock); // → 本次快照 12
```

三次调用都已经执行，只是它们提交了相同的替换值。把原因背成「React 把重复调用删掉了」，遇到混合更新就解释不通。

批处理说的是更新何时一起处理，快照说的是这段代码读到什么，两者要分开理解。即使稍后才运行定时器，它拿到的外层数字也由闭包决定。

React 分别处理用户有意发起的每次点击，两个点击不会永远共用最初的 12。所以 BasicCounter 中一次点击只更新一次时，setCount(count + 1) 能正常从 0、1、2 往上走。排查时先问「这些更新来自同一次事件，还是不同次事件」。

Java 中连续三次字段自增，每次都会读取已经改变的字段；这里三次表达式都读取同一个局部值。问题与线程抢占或 volatile 无关。

## 4. 函数式更新：把计算交给队列

下一值依赖前一个待处理值时，给 setter 传一个函数。这叫**函数式更新**，函数也叫 updater。React 依次把队列中计算到的状态传给它，再把返回值交给下一项。

```jsx
function handleThree() {
  setStock((pending) => pending + 1);
  setStock((pending) => pending + 1);
  setStock((pending) => pending + 1);
}
```

12 件点一次变成 **15 件**，再点一次变成 18。pending 只是参数名，写 n、previousStock 都可以；它表达的是轮到这项更新时的待处理值。

| 队列中的更新 | 接收到的 pending | 返回值 |
| --- | --- | --- |
| 第一个 pending => pending + 1 | 12 | 13 |
| 第二个 pending => pending + 1 | 13 | 14 |
| 第三个 pending => pending + 1 | 14 | 15 |

函数内部要使用参数参与计算。即使外面套了箭头函数，写成 `setStock(() => stock + 1)`，仍然读取外层旧 stock，三次也只能得到 13。函数式更新解决的是计算所用值的来源，语法形状本身并不保证正确。

### 替换值和 updater 混用，顺序仍然有效

**先猜一猜：** 每次都从 12 开始，下面两个事件函数分别得到什么？labs/MixedQueue.jsx 提供了对应按钮。

```jsx
function replaceThenAdd() {
  setStock(stock + 3);
  setStock((pending) => pending + 1);
}
function addThenReplace() {
  setStock((pending) => pending + 1);
  setStock(stock + 3);
}
```

第一个得到 **16**：先替换为 15，再在 15 上加 1。第二个得到 **15**：先由 12 加到 13，随后被早已算好的 15 替换。

一项替换不会取消后面的更新；它只决定队列走到这里时的值。再往后排一个 setStock(0)，结果就归零。用 Node 把几种顺序放在一起核对：

```js title="queue-updaters.js"
import { products } from "../shared/products.js";
import { applyUpdates } from "./update-queue.js";

const stock = products[0].stock;
const addOne = (pending) => pending + 1;
console.log(applyUpdates(stock, [addOne, addOne, addOne])); // → 15
console.log(applyUpdates(stock, [stock + 3, addOne])); // → 16
console.log(applyUpdates(stock, [addOne, stock + 3])); // → 15
console.log(applyUpdates(stock, [addOne, 0])); // → 0
```

选择写法时看意图：「增加一件」是基于前值的变换，用 updater；「清空记录」是明确的目标值，直接设 0。一次事件只加一件，两种写法通常都能得到结果；涉及连续更新或延时累计时，参数所提供的待处理值尤其关键。

### updater 保持纯粹

updater 只根据输入返回下一值。在其中发送请求、写存储、再调用其他 setter，会让业务动作依赖 React 何时调用这段计算。[useState 参考](https://react.dev/reference/react/useState)

开发环境的 StrictMode 可能额外调用 updater 检查纯粹性，其中一次计算结果会被忽略。纯粹的 n => n + 1 不会因此让一次补货加两件。事件函数属于用户动作，不会因为这项检查自动执行两遍；日志条数也不能当成库存事务数。

对照 Java：可以把 updater 理解成接收旧值并返回新值的纯函数。它没有提供跨组件、跨请求的数据库事务或线程同步语义。

## 5. 延时回调：先确定要保留哪个时刻的值

闭包会保留创建它时所在的词法环境。先运行一个普通 JS 例子，观察两次函数调用产生的回调：

```js title="closure.js"
import { products } from "../shared/products.js";

function createReader(stock) {
  return () => stock;
}
const readBefore = createReader(products[0].stock);
const readAfter = createReader(products[0].stock + 3);
setTimeout(() => {
  console.log("旧回调", readBefore()); // → 旧回调 12
  console.log("新回调", readAfter()); // → 新回调 15
}, 0);
```

输出「旧回调 12」「新回调 15」。第二次调用创建了另一份参数绑定，没有修改第一次那份。零延时也只是安排稍后执行，旧回调读哪份绑定并未改变。这就是 C06 的闭包规则在状态快照中的延续。

快照有实际用途。例如日志需要记录「用户点击补货时看见 12 件」，保留 12 正合适。若业务意思是「两秒后，在那时的库存上再补 3 件」，则应把累加操作留到队列中计算。

下面是 labs/DelayBroken.jsx 的错误起点，初始库存 12：

```jsx
// 有问题的写法：延时补货用旧快照算出替换值。
function handleLater() {
  setTimeout(() => setStock(stock + 3), 2000);
}
```

先点延时补货，再立即补 1 件：页面先变成 13。两秒后旧回调读取 stock=12，算出替换值 15，于是页面从 13 变成 **15**，期间补的那一件丢了。

把延时操作改为基于待处理值的变换：

```jsx
function handleLater() {
  setTimeout(() => setStock((pending) => pending + 3), 2000);
}
```

同样操作得到 **13 → 16**。定时器触发后，把 updater 交给 React；处理它时，pending 能接上已经补过一件的状态。连续安排两次延时补货，从 12 出发最终得到 18，两次都保留下来。

这里改的是「计算下一值的依据」。如果还在定时器中打印外层 stock，它仍然是创建回调那次的快照。函数式更新没有把整个闭包变成随时读取最新数据的对象。

把 stock 复制成局部变量、把延时改得更长，都仍然保留同一份旧数字。也无需为这个由点击发起的补货增加一个监听 stock 的 Effect：更新意图直接写在事件及其回调中就清楚了。

Java lambda 捕获局部数字同样能保留旧值；如果它捕获对象并稍后读字段，则可能观察到对象的后续修改。比较两段代码时，要先看捕获的究竟是哪个值。

## 6. Hooks 的顺序固定，状态才有稳定位置

useState 在函数组件顶层调用，放在条件返回之前；条件放在调用之后。下面是 labs/CountPanel.jsx：

```jsx
import { useState } from "react";

export default function CountPanel({ visible }) {
  const [count, setCount] = useState(0);
  if (!visible) return null;
  return <button type="button" onClick={() => setCount((n) => n + 1)}>核对 {count} 次</button>;
}
```

visible 为 true 时，输出「核对 0 次」；为 false 时，输出为空。无论哪条路径，useState 都在同一位置调用。React 才能在这个组件后续渲染时，把相应状态交还给这一处 Hook。[Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)

如果把 useState 挪进 if、循环或事件函数，调用序列就会随路径改变。常见报错有 Rendered more hooks than during the previous render、Rendered fewer hooks than expected 或 Invalid hook call。修复方向是整理调用位置，让 useState 始终在组件顶层执行。

普通工具函数中也不直接调用 useState。复用带 Hook 的逻辑可以写自定义 Hook；需要渲染有独立状态的区域时，把它写成组件并通过 JSX 使用。组件由 React 调用，普通 helper 则由你调用。

:::tip[自己尝试 · 本地 React]
1. 打开 /js_web/labs/state.html?case=independent。
2. 只点第一个区域的「记录 1 次」。
3. 再点第二个区域的「连续记录 3 次」。

预期：两处分别显示 1 次和 3 次。相同的组件函数被用于两个位置，各自有自己的 state；没有一个模块级 count 让它们一起变化。
:::

对照 Java：两份实例字段分别保存各自数据，这个结果相似；React 通过组件位置和稳定的 Hooks 调用关联状态，无须你 new 一个组件对象。

## 常见错误与调试

### 连续补三件只增加一件

**现象**：打开 /js_web/labs/state.html?case=queue，从 12 件点「补 3 件」，显示 13；再点显示 14。

**工具**：DevTools → Sources，在左侧找到 labs/QueueBroken.jsx。在 handleThree 中第一行 setStock 前单击行号设断点，再点击按钮。通过 Step over 逐行执行；React DevTools → Components 可以查看组件的 Hooks。

**证据**：第一次暂停时 stock=12；走过第一、第二个 setter 后，当前作用域中的 stock 仍为 12。Console 在暂停时求值 stock + 1，每次都是 13。恢复运行后，组件的 state 和页面才显示 13。

**原因**：三项更新都是替换为 13，当前事件中的快照没有变化。

**修复**：三行都改为 setStock(pending => pending + 1)。完整正确组件是 labs/QueueFixed.jsx，也可以通过 case=queue-answer 直接比较。

**确认**：刷新后两次点击依次为 15、18。在阶段 4 运行下面的回归命令，原始错误文件对应的两项断言会失败；修好两个文件后，原命令通过。

```sh
npm run test:bug -- labs/state-bugs.test.jsx
```

### 延时补货覆盖刚刚新增的一件

**现象**：打开 /js_web/labs/state.html?case=delay，点「2 秒后补 3 件」，两秒内点「立即补 1 件」。库存先为 13，最后为 15，正确结果应为 16。

**工具**：Sources 打开 labs/DelayBroken.jsx，在 setTimeout 的箭头回调上设置断点。Chrome 可点击该行的内联断点位置，选中回调中的 setStock，避开外层安排定时器的调用。

**证据**：回调执行时，Scope 中闭包保存的 stock=12，而页面已经是 13。恢复运行后，setStock 收到的是 15；界面的 13 被这个替换值覆盖。

**原因**：延时动作需要在执行时累计，却使用点击时的快照计算了目标值。

**修复**：在定时器里传 pending => pending + 3。正确版本是 labs/DelayFixed.jsx，对照入口为 case=delay-answer。

**确认**：刷新并重复操作，库存为 13 → 16；只连续安排两次延时补货，最终为 18。自动回归也覆盖等待期间的新操作，核心断言如下，完整测试负责创建组件、点击和清理：

```jsx
it("延时补货应保留期间新增的一件", async () => {
  vi.useFakeTimers();
  const host = await mount(<DelayBroken />);
  await click("2 秒后补 3 件");
  await click("立即补 1 件");
  await advance(2000);
  expect(host.textContent).toContain("库存：16 件");
});
```

测试使用可控时钟推进两秒，检查用户最终看见的库存。它挂载真实 React 组件并触发事件，因此能发现闭包覆盖问题；只测一个 add(12, 3) 函数无法发现它。项目中的测试辅助函数已经准备好，组件测试的组织方式会在后面的测试课系统学习。

## 练习

### 练习 1：手算混合队列

先写出下面四行结果，再在 examples/c23 运行 node prediction.js。验收：能指出哪一步替换了前面的计算，以及为什么最后的 stock 仍然是 12。

```js title="prediction.js"
import { products } from "../shared/products.js";
import { applyUpdates } from "./update-queue.js";

const stock = products[0].stock;
console.log(applyUpdates(stock, [stock + 3, (n) => n + 1, (n) => n * 2]));
console.log(applyUpdates(stock, [(n) => n + 3, stock + 1]));
console.log(applyUpdates(stock, [(n) => n + 3, (n) => n + 3]));
console.log(stock);
```

<details>
<summary>提示</summary>

先把普通表达式 stock + 3、stock + 1 算成数字，再依次走队列。箭头函数的参数取前一步结果；它外面的 stock 始终是起点。

</details>

<details>
<summary>参考答案</summary>

依次是 **32、13、18、12**。第一行先替换为 15，再加 1 得 16，最后乘 2 得 32。第二行先加到 15，再被预先算好的 13 替换。第三行两次依次累加，12 → 15 → 18。最后一行仍然读取局部常量 stock，队列计算没有给它重新赋值。

手算器体现的是更新的先后关系；在 React 中还要通过 setter 请求更新，再由后续渲染拿到结果。

</details>

### 练习 2：修复延时覆盖，并解释旧日志

从 labs/DelayBroken.jsx 开始修复。验收：延时补三件加上期间立即补一件得到 16；两次延时补三件得到 18；修复后的延时回归通过。再回答：SnapshotProbe 的「两秒后 12」需要一起改掉吗？

<details>
<summary>提示</summary>

分别给动作写一句需求：「基于当时待处理的库存增加 3」和「记录点击时的库存」。需要保留的时刻不同，正确写法也不同。

</details>

<details>
<summary>参考答案</summary>

将 setStock(stock + 3) 改为 setStock(pending => pending + 3)，让更新接上期间发生的补货。两次定时器各自提交一次累加，最终是 12 + 3 + 3。

SnapshotProbe 专门记录点击时的快照，12 是符合需求的结果，无须改掉。函数式更新也不会改变它捕获的 stock；只要页面和日志各自符合定义，就没有矛盾。

</details>

### 练习 3：增加「清空记录」

从 src/InventoryCounter.jsx 开始，加一个「清空记录」按钮。验收：连续记录三次显示 3，清空后显示 0，再记录一次显示 1。测试这条路径时先让已安排的延时操作执行完毕。

<details>
<summary>提示</summary>

归零指定一个目标值，不依赖前面的数字。给 onClick 传函数，在事件里调用 setter。

</details>

<details>
<summary>参考答案</summary>

新增按钮，写 `onClick={() => setCount(0)}`，按钮文字为「清空记录」。记录动作采用基于前值的变换，清空采用明确的替换值，各自表达业务意图。

清空只更新计数，已经安排的定时器仍会执行。若在它到期前清空，两秒后还会增加三次；取消定时器是另一项需要明确设计的行为。

</details>

## 项目进度

从 C22 的 examples/inventory/04-react 继续。新增 src/InventoryCounter.jsx，在 src/App.jsx 导入并把 `<InventoryCounter />` 放在工具栏与商品列表之间。工具栏、列表、卡片保持之前的 props 组合。

计数器只有一份 count state，初始为 0。「记录 1 次」提交一次累加，「连续记录 3 次」提交三个 updater，「2 秒后记录 3 次」在定时器中提交一次加三。完整文件在阶段目录，关键处理函数与上面的补货示例采用相同规则。

这里记录的是**本次盘点操作次数**，与商品库存分开显示。刷新后回到 0；下面六件商品仍使用共享固定数据，库存依次为 12、0、7、3、25、5。这样可以先把标量状态学清楚，再推进商品数组的编辑。

labs/state.html 保留错误起点和正确对照。tests/state.test.jsx 保护正常交互，labs/state-bugs.test.jsx 留作先失败再修复的练习；其余课程的实验入口继续可用。

:::tip[自己尝试 · 本地 React]
1. 启动阶段 4 开发服务，刷新首页，确认初始记录为 0。
2. 点「2 秒后记录 3 次」，立即点「连续记录 3 次」和「记录 1 次」。
3. 等待两秒，再刷新页面。

预期：计数先为 4，再为 7；刷新后为 0。六张商品卡片的库存没有被盘点计数修改。
:::

在阶段 4 目录执行：

```sh
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

预期：14 条正常回归通过，预览 /js_web/ 可执行盘点操作。状态测试使用 happy-dom 提供 DOM、React act 等待更新和可控时钟验证延时；依赖已锁在本阶段清单中，运行 npm ci 即可准备。labs 仍由 dev 服务提供；课程正文通过网站静态构建发布。

## 小结

- useState 让 React 保存状态；setter 发起后续更新，普通变量赋值没有这份行为。
- 一次渲染的 state 是快照。当前事件和它创建的延时回调继续读取自己的绑定。
- 批处理集中处理更新；三次从 12 计算出的替换值都是 13，结果仍是 13。
- updater 接收队列中的待处理值；连续累计用参数计算，明确目标值可以直接替换。
- useState 放在组件顶层，保持调用顺序；updater 保持纯粹，各个组件实例的状态分别保存。

自测：

1. 为什么 const count 能在下一次渲染中变成另一个数字？
2. 为什么等两秒或写 await setter，都不能让旧闭包读到新快照？
3. setStock(() => stock + 1) 连写三次为什么仍会出错？
4. 「先替换再累加」与「先累加再替换」的结果为什么不同？
5. 记录点击时的库存和延时累计补货，分别应该依据哪个时刻的值？

下一课把状态推进到对象和数组，完成商品更新、列表 key 与筛选后的派生数据。

## 延伸阅读

- [React：组件的记忆](https://react.dev/learn/state-a-components-memory)
- [React：响应事件](https://react.dev/learn/responding-to-events)
- [React：state 如同一张快照](https://react.dev/learn/state-as-a-snapshot)
- [React：把一系列 state 更新加入队列](https://react.dev/learn/queueing-a-series-of-state-updates)
- [React：useState](https://react.dev/reference/react/useState)
- [React：Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)
