---
title: C28 useRef 与外部系统
description: 分清 ref 与 state，用 DOM ref 安排焦点、保存定时器取消句柄，并认识 Effect 的同步起点。
sidebar:
  order: 28
---

> **第 3 周 · 第 14 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C23、C25–C27 · 运行：Node 24 与本地 React · 示例已运行验证

## 这一课解决什么问题

库存页已经能保存商品，现在要照顾连续操作：补货提交以后，光标回到数量框，方便继续输入；点了「2 秒后记录 3 次」，又改变主意，要能取消。

你把定时器句柄写成组件里的 `let timer`，取消却失效了。于是改用 state，又发现界面根本不需要显示那串句柄。React 提供的 `useRef` 正适合保存这类值，但如果把库存件数也放进去，商品卡片又不会刷新。

学完你能：

- 在普通变量、state 和 ref 之间选择正确的存放位置
- 解释修改 `current` 为什么立即可读，却不触发渲染
- 取得真实 DOM 节点，在合适的时机聚焦输入
- 跨渲染保存定时器句柄，实现替换、取消和卸载时清理
- 判断外部操作放进事件还是 Effect，保持渲染过程纯粹

纯 JS 例子在 [examples/c28](https://github.com/socoo123/js_web/tree/main/examples/c28)，在该目录运行 `node 文件名.js`。React 实验沿用 [examples/inventory/04-react](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)：在该目录运行 `npm ci`、`npm run dev -- --host 127.0.0.1`，打开终端给出的 /js_web/ 地址。

实验路径是在该地址后加 `labs/refs.html?case=…`，完整入口表见阶段 README。

## Java 程序员先看这里

| Java 经验 | React 中对应的选择 | 一句话差异 |
| --- | --- | --- |
| 方法局部变量每次调用重新创建 | 组件函数里的普通变量 | 组件再次渲染，就是又执行一次函数 |
| 对象实例字段保存句柄 | `useRef(null)` 的 `current` | 在同一组件身份内保留，修改不会通知 React |
| 改字段后更新界面 | state 的 setter 或 dispatch | 用新状态请求渲染，ref 没有这一步 |
| 持有 Swing 控件并调用焦点方法 | DOM ref 加 `focus()` | 要等 React 提交节点后才能操作 |
| 取消定时任务的句柄 | `setTimeout` 返回值 | 浏览器返回编号，Node 返回对象；都交给 `clearTimeout` |

ref 像实例字段，但没有 `AtomicReference` 的线程同步含义。保存值和通知界面变化是两件事。

## 1. ref 保存的是一个稳定容器

[`useRef(initialValue)`](https://react.dev/reference/react/useRef) 返回带 `current` 属性的对象。对同一组件实例的后续渲染，React 继续返回同一个对象；初始参数只决定最初的值。Hook 仍在组件顶层调用，每个实例拿到自己的容器。

先用普通 JS 看对象别名；跨渲染的保留由后面的 React 组件演示。

```js title="ref-object.js"
const handleRef = { current: null };
const sameRef = handleRef;
handleRef.current = "待取消的任务";
console.log(sameRef === handleRef);
console.log(sameRef.current);
sameRef.current = null;
console.log(handleRef.current);
```

输出依次是 `true`、`待取消的任务`、`null`。两个名字指向同一个对象，`const` 限制变量重新赋值，和 C05 的别名规则一致。

### 普通变量为什么撑不过下一次渲染

**先猜一猜：** 打开 `case=probe`，连点两次「只记录日志」，再点「更新界面版本」，最后再记录一次。局部变量、ref 和 state 的日志分别是什么？

```jsx
import { useRef, useState } from "react";

export default function RefProbe() {
  const visitsRef = useRef(0);
  const [revision, setRevision] = useState(0);
  let visits = 0;
  function handleRead() {
    visits += 1;
    visitsRef.current += 1;
    console.log("局部 / ref / state", visits, visitsRef.current, revision);
  }
  return <section aria-label="ref 观察">
    <p>界面版本 {revision}</p>
    <button onClick={handleRead}>只记录日志</button>
    <button onClick={() => setRevision((n) => n + 1)}>更新界面版本</button>
  </section>;
}
```

```text
局部 / ref / state 1 1 0
局部 / ref / state 2 2 0
局部 / ref / state 1 3 1
```

前两次事件使用同一次渲染创建的处理函数，闭包中的 `visits` 能从 1 累计到 2。修改 ref 没请求渲染，所以界面仍显示「界面版本 0」。局部变量不是每点一次就重置，而是在组件下一次执行时重建。

点「更新界面版本」后，state 变成 1，React 再次调用组件。新的执行把 `visits` 设回 0，新处理函数读到的 `revision` 是 1；`visitsRef` 仍是原来的对象，所以继续加到 3。这正是局部变量和 ref 的分界。

换成 Java 类比：局部变量像方法栈里的变量，ref 更像当前实例保留的字段。组件卸载后再挂载，或 key 变化导致新身份，ref 也从初始值开始；它不承担跨刷新存储。

## 2. 要在界面显示的值用 state

[`ref` 与 `state` 的区别](https://react.dev/learn/referencing-values-with-refs)不在于能存什么类型，而在于变化以后，界面是否需要据此重新计算。库存、输入草稿、等待提示属于 state；节点和取消句柄属于 ref。

**先猜一猜：** 打开 `case=count`，点三次「盘点一次」，界面显示多少？再在备注框输入一个字，会怎样？

```jsx
// 有问题的写法：把需要显示的盘点数放进 ref
import { useRef, useState } from "react";

export default function RefCountBroken() {
  const countRef = useRef(0);
  const [note, setNote] = useState("");
  return <section>
    <p role="status">已盘点 {countRef.current} 次</p>
    <button onClick={() => { countRef.current += 1; }}>盘点一次</button>
    <label>备注<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
  </section>;
}
```

点三次仍显示「已盘点 0 次」。输入备注触发 state 更新后，才突然显示「已盘点 3 次」。第一次提交到 DOM 的文字是 0，修改对象属性不会让 React 再调用组件。后来备注引起渲染，JSX 才读到了 3。

正确版 `case=count-answer` 把可见次数交回 state：

```jsx
import { useState } from "react";

export default function RefCountFixed() {
  const [count, setCount] = useState(0);
  const [note, setNote] = useState("");
  return <section>
    <p role="status">已盘点 {count} 次</p>
    <button onClick={() => setCount((n) => n + 1)}>盘点一次</button>
    <label>备注<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
  </section>;
}
```

每次点击立即显示 1、2、3，备注独立保留。Java 字段能保存次数，React 还需要 setter 这条通知路径。

按用途做选择：

| 值 | 放哪里 | 原因 |
| --- | --- | --- |
| 筛选后的数组、库存合计 | 渲染时局部计算 | 由已有 state 推导 |
| 商品库存、草稿、是否正在等待 | state / reducer | 要影响下一次 JSX |
| 输入节点、定时器句柄 | ref | 事件或 Effect 要用，界面不显示它本身 |

`useRef(products)` 也不会复制商品。若 `current` 和 state 指向同一份数组，通过 ref 修改里面的商品，仍会污染旧 state。ref 的可变规则只适用于它独立保存的非渲染数据。

## 3. DOM ref：拿到节点，再调用浏览器方法

给原生元素写 `ref={quantityRef}`，React 会在提交 DOM 时把节点放进 `quantityRef.current`，移除节点时再设回 `null`。传给 `ref` 属性的是容器本身，事件里取节点才用 `.current`。这套对应关系见[操作 DOM 的官方说明](https://react.dev/learn/manipulating-the-dom-with-refs)。

下面的 `case=focus` 让补货后光标回到数量框。数量和库存仍是 state，ref 只负责找到节点。完整例子的校验和提交部分如下：

```jsx
  function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(quantity);
    if (quantity.trim() === "" || !Number.isInteger(amount) || amount < 1 || amount > 99999 - stock) {
      quantityRef.current?.focus();
      return;
    }
    setStock((n) => n + amount);
    setQuantity("");
    quantityRef.current?.focus();
  }
  return <form onSubmit={handleSubmit}>
    <p role="status">P001 机械键盘：{stock} 件</p>
    <label>补货数量<input ref={quantityRef} value={quantity}
      onChange={(event) => setQuantity(event.target.value)} /></label>
    <button>确认补货</button>
  </form>;
```

默认 12 件，提交 3 后显示 15，数量框清空并获得焦点。按 Enter 继续提交 2，显示 17。`setQuantity("")` 决定输入值，`focus()` 决定键盘输入送到哪个节点，各有职责。

这里能够立即聚焦，是因为输入框在点击之前已经存在，提交以后仍是同一个节点。`?.` 让没有节点时跳过调用；它只防止空值异常，不保证焦点一定成功。[`focus()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus) 是浏览器方法，不是 React 的状态更新。

### 「提交表单」和「React 提交 DOM」是两件事

表单的 `onSubmit` 是用户事件；React 的提交阶段，是把渲染结果应用到 DOM。两者都叫提交，但先后关系要按具体代码判断。

例如 `case=early` 把输入框放在条件分支中，第一次点打开按钮时，下面这段会打印 `点击时节点 null`：

```jsx
// 有问题的写法：刚请求显示表单，就读取尚未挂载的节点
import { useRef, useState } from "react";

export default function FocusMountBroken() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  function handleOpen() {
    setOpen(true);
    console.log("点击时节点", inputRef.current);
    inputRef.current?.focus();
  }
  return <section>
    <button onClick={handleOpen}>打开名称输入</button>
    {open && <label>商品名称<input ref={inputRef} defaultValue="机械键盘" /></label>}
  </section>;
}
```

`setOpen(true)` 请求下一次渲染，当前事件继续执行时，节点还没有挂上去。按钮点完虽然能看到输入框，焦点却仍在按钮上。也不能把 `focus()` 放进组件函数主体：渲染阶段负责计算 JSX，此时节点可能尚不存在，重复渲染还会把光标从用户正在输入的地方抢走。

Java 中拿到控件引用后就能调用方法；React 额外需要确认这个控件对应的节点已经提交。第五节用挂载后的 Effect 修复这个时机问题。

## 4. 可变句柄：保存到 ref，取消时读出来

C23 的延时回调已经会用函数式更新，避免旧 count 覆盖新操作。现在加上取消功能，还需要保存浏览器交回的定时器句柄。取消需要的是句柄；界面需要的是「有无等待任务」这条状态。

阶段 4 的 InventoryCounter 增加 `const timerRef = useRef(null)` 与 `const [pending, setPending] = useState(false)`。下面两个事件约定同一时刻最多有一条延时记录，再次安排会替换上一条：

```jsx
  function handleLater() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPending(false);
      setCount((n) => n + 3);
    }, 2000);
    setPending(true);
  }
  function handleCancel() {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setPending(false);
  }
```

从 0 开始安排，立即记录 1 次，再取消，等满两秒仍是 1。安排后过一秒再安排，第一条被取消，计数在第二条安排满两秒时才加 3。每个实例有独立 ref，取消盘点区甲的任务不会影响盘点区乙。

清除定时器与写回 `null` 含义不同：[`clearTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout) 告诉宿主撤销尚未执行的任务；赋 `null` 只是让组件记住「已经没有等待句柄」。只写 `null`，原定时器仍会执行。计时器已经到期执行过的加三，则不属于取消范围。

`pending` 控制提示和按钮禁用，使用 state；句柄不给用户看，使用 ref。两者随安排、到期、取消一起更新。C23 的函数式 `setCount` 继续保留，因为句柄的稳定性和 count 的快照是两个不同问题。

### 用普通变量保存，会丢在哪一步

错误版 `case=timer` 在组件主体写 `let timer = null`，安排后又调用 `setPending(true)`。重新渲染产生了新的局部变量，新取消处理函数读到的已经是 `null`，而旧定时器仍在浏览器中排队。

把变量移到组件外面虽然能跨渲染保存，却会让两个实例共享一个句柄，相互取消。Java 的对应问题是把实例资源误放到 `static` 字段。ref 把资源保留在当前组件身份内，刚好符合这项需求。

在 examples/c28 运行 `node cancel-handle.js`，立即清除零延迟任务，输出只有 `任务已取消 null`。React 跨渲染取消则看本节实验。

## 5. Effect：在提交后同步外部系统

外部系统不一定是网络。浏览器的焦点、计时器、原生事件监听，也在 React 的 JSX 计算之外。先按触发原因分两类：点了哪个按钮就执行的操作放进事件；组件出现在页面后需要建立的同步，用 [Effect](https://react.dev/learn/synchronizing-with-effects) 表达。

修复条件输入框时，把输入框拆成一个挂载时聚焦的子组件。`case=early-answer` 的完整实现如下：

```jsx
import { useEffect, useRef, useState } from "react";

export function NameInput() {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return <label>商品名称<input ref={inputRef} defaultValue="机械键盘" /></label>;
}

export default function FocusMountFixed() {
  const [open, setOpen] = useState(false);
  return <section>
    <button onClick={() => setOpen(true)}>打开名称输入</button>
    {open && <NameInput />}
  </section>;
}
```

点击打开后，React 先渲染 NameInput，再提交节点和 ref，然后执行 Effect，光标进入「机械键盘」输入框。Effect 在提交以后执行；这里无需假定它和浏览器绘制的精确先后。

这里 `[]` 表示不依赖随渲染变化的值。普通重新渲染不会重复这段 setup；子组件被移除后重新挂载，就会再次执行。开发环境保留 StrictMode，可能额外执行 setup 检查；重复聚焦同一个输入节点不会增加业务数据。它不等于“整个应用永远只运行一次”。

对于打开即聚焦这类简单需求，C25 的 `autoFocus` 也可以完成。这里显式使用 Effect，是为了看清「DOM ref 什么时候已经可用」，以及之后接外部 API 的位置。

### ref 不会替你释放外部资源

组件卸载只会结束它的界面身份。浏览器中已经安排的定时器需要主动撤销。InventoryCounter 在顶层增加：

```jsx
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
```

传给 Effect 的函数负责 setup，它返回的函数叫 cleanup。这里没有挂载时要启动的计时器，真正的安排来自用户事件；cleanup 负责在这个盘点区移除时撤销当前任务。清理时读取的是 ref 容器里当时的句柄，而不是初次渲染时的一个空值副本。细节见 [`useEffect` 参考](https://react.dev/reference/react/useEffect)。

试 `case=timer-answer`：安排后隐藏盘点区，等两秒再显示，计数从 0 重新开始。新实例的 state/ref 全部重新创建，旧任务在隐藏时清除。保持纯渲染意味着组件函数只计算界面，启动定时器、聚焦和写浏览器存储这类操作放在事件或 Effect 中；具体规则见[组件与 Hook 的纯度要求](https://react.dev/reference/rules/components-and-hooks-must-be-pure)。

Java 类比是界面对象的资源生命周期：持有句柄解决“怎样找到它”，cleanup 解决“什么时候释放它”。下一课再系统展开依赖变化和 setup/cleanup 的配对顺序。

## 常见错误与调试

### 盘点数要等输入备注才跳动

**现象**：`case=count` 点三次盘点仍显示 0；输入备注后突然显示 3。

**工具**：Chrome 打开 Sources，通过文件搜索打开 RefCountBroken.jsx，在 `countRef.current += 1` 所在行设断点，再点盘点。

**证据**：在 Scope 展开闭包中的 countRef，连续点击可看到 current 已从 0 增到 1、2；恢复执行后，Elements 中 status 段落仍是旧文字。输入备注后，该段落才改变。

**原因**：对象确实改了，React 没收到渲染请求。读取 ref 来生成 JSX 也让显示结果依赖其他更新。

**修复**：按 RefCountFixed.jsx 改成 state，按钮用 `setCount((n) => n + 1)`；备注仍保留自己的 state。

**确认**：重新载入，每点一次立即更新，不需要碰备注。阶段目录运行 `npm run test:bug -- labs/refs-bugs.test.jsx`，第一项回归从失败变为通过。

### 点了取消，盘点仍在两秒后增加

**现象**：`case=timer` 安排后点取消，等满两秒，计数仍从 0 变成 3。

**工具**：Sources 打开 LocalTimerBroken.jsx，在 `clearTimeout(timer)` 那一行设断点；先安排，再取消。

**证据**：暂停时 Scope 的 timer 为 `null`。原先安排的任务已经被新一轮组件执行创建的局部变量隔开了。

**原因**：`setPending(true)` 触发重新渲染，取消按钮的新事件闭包拿到了新的 timer，旧句柄没有保存下来。

**修复**：使用 InventoryCounter 的 timerRef 设计，同时复制卸载清理；pending 继续用 state，渲染从 pending 读取等待提示。

**确认**：安排、立即记录一次、取消，等两秒仍为 1。上述测试命令的第二项回归也应通过；源码仓库保留两个错误起点供练习。

:::tip[自己尝试 · 本地 React]
1. 在阶段 4 启动 dev 服务，分别打开 `labs/refs.html?case=count` 和 `?case=timer`。
2. 按上面步骤复现两个问题，再修改对应的 Broken 文件。
3. 在阶段 4 运行 `npm run test:bug -- labs/refs-bugs.test.jsx`。

预期：原始文件两项失败，修复后两项通过；分别与 `?case=count-answer`、`?case=timer-answer` 对照页面行为。
:::

## 练习

### 练习 1：回调读到的是什么

在 examples/c28 运行前，先预测 prediction.js 的三行输出。这里用普通 JS 研究闭包，和 React 中“保存快照”与“持有可变容器”的差异对应起来。

```js title="prediction.js"
const stock = 12;
const stockRef = { current: stock };
const readSnapshot = () => stock;
const readCurrent = () => stockRef.current;
stockRef.current += 3;
console.log(readSnapshot());
console.log(readCurrent());
console.log(stock);
```

<details>
<summary>提示</summary>

一个回调读 stock 这个数字，另一个回调每次都去对象里读 current。改属性没有改 stock。

</details>

<details>
<summary>参考答案</summary>

依次是 12、15、12。`readSnapshot` 始终返回 stock 的值 12；`readCurrent` 在调用时读 current，得到 15。React 的旧事件也能通过稳定 ref 对象读到后来写入的 current，但这不改变旧 state 快照，更不会自动刷新界面。需要显示的库存仍交给 reducer。

</details>

### 练习 2：把“取消成功”变成可观察的测试

修复 LocalTimerBroken.jsx，使等待状态更新后仍能取消。再加一项回归：安排后等待一秒，重新安排，旧截止时间不加三，新截止时间只加一次三。

验收：原先两项失败测试通过；新回归在第一次到期点为 0，第二次到期点为 3。完整正常版本可对照 tests/refs.test.jsx。

<details>
<summary>提示</summary>

替换 ref 中的句柄以前，先清除旧任务。用可控时钟推进两个一秒；state-harness 的 advance 已经把时钟更新包在 act 中。

</details>

<details>
<summary>参考答案</summary>

取消逻辑按第四节实现，卸载按第五节清理。测试的关键部分如下，前面按现有测试导入 vi、expect、InventoryCounter 与 mount/click/advance：

```jsx
  vi.useFakeTimers();
  const host = await mount(<InventoryCounter />);
  await click("2 秒后记录 3 次");
  await advance(1000);
  await click("2 秒后记录 3 次");
  await advance(1000);
  expect(host.textContent).toContain("已记录 0 次盘点操作");
  await advance(1000);
  expect(host.textContent).toContain("已记录 3 次盘点操作");
```

这项测试同时检查旧任务撤销与新任务保留。只检查最终为 3，可能漏掉错误时机；只检查取消按钮变成禁用，也证明不了浏览器任务真的被清除。

</details>

## 项目进度

从 C27 的 examples/inventory/04-react 继续。本课改 src/App.jsx、ProductForm.jsx、InventoryCounter.jsx：分别负责返回标题的 ref、编辑区挂载焦点、盘点定时器。业务 reducer 和 Context 沿用上一课。

App 在 InventoryPage 顶层声明 `const headingRef = useRef(null)`，标题接入 ref：

```jsx
      <h1 id="inventory-heading" ref={headingRef} tabIndex={-1}>库存管理</h1>
```

保存和删除当前商品后调用 `headingRef.current?.focus()`。取消仍优先回到那件商品的编辑按钮，列表筛选使按钮不存在时回标题。标题持续存在，允许在事件里直接聚焦；保存以后编辑表单关闭，则不再聚焦已经移除的名称框。

ProductForm 增加 nameRef，在名称 input 上写 `ref={nameRef}`，用第五节的挂载 Effect 替换原来的 autoFocus。按商品 key 切换仍然创建新表单并聚焦名称；同一商品输入草稿引起的重新渲染保留当前焦点。首次错误字段继续通过表单 elements 定位，不需要给每个字段都加 ref。

InventoryCounter 使用第四、五节的句柄与清理。按钮显示等待信息；再次安排替换旧任务，取消只影响尚未执行的延时记录，立即记录的次数保留。盘点数与商品 stock 仍是两套独立数据。

:::tip[自己尝试 · 本地 React]
1. 刷新首页，确认 6 种、52 件、26348.00 元。编辑 P002，光标进入名称框；切到单价输入 129.90，确认焦点没有跳回名称。
2. 把库存改为 3 并保存，确认总库存 55、总价值 26737.70 元，焦点回标题。重新编辑应读到保存值，取消回编辑按钮。
3. 安排延时盘点，立即记录一次，再取消。两秒后仍显示记录 1 次，库存统计保持上一步数值。
4. 分别检查 `case=focus` 的提交回焦点和 `case=early-answer` 的挂载回焦点；在阶段 4 运行 `npm test`、`npm run build`，再用 `npm run preview -- --host 127.0.0.1` 检查生产首页。

预期：表单、标题和盘点各自按上面的策略工作；刷新恢复固定六件商品与盘点 0 次。所有交互只存在于当前页面。
:::

tests/refs.test.jsx 检查句柄保留、取消、替换、实例隔离、卸载与焦点；生产首页构建库存应用，课程正文静态输出。

## 小结

- ref 在同一组件身份内保留同一个容器；事件中改 current 立即可读，界面不会因此刷新。
- 渲染要用的数据进 state，派生值用普通计算，DOM 与取消句柄用 ref。
- DOM ref 在提交后连接节点；已经存在的节点可以在事件中聚焦，条件新建的节点先等提交。
- 取消外部任务要调用相应 API；清空 ref 属性本身不会撤销浏览器任务。
- 事件表达用户操作，Effect 表达提交后的外部同步；组件移除时清理仍持有的资源。

自测：

1. 普通局部变量为什么能在连续两次点击中累计，却撑不过 state 更新？
2. ref 的 current 已变成 3，页面为什么还显示 0？
3. `setOpen(true)` 后直接 focus，为什么第一次读到 null？
4. 为什么定时器句柄放 ref、等待提示放 state？
5. 保存后编辑表单关闭，焦点应该交给哪个仍存在的节点？

下一课深入 useEffect 的依赖、清理和开发检查，用完整时序修复重复监听与循环更新。

## 延伸阅读

- [React：useRef 参考](https://react.dev/reference/react/useRef)
- [React：使用 ref 引用值](https://react.dev/learn/referencing-values-with-refs)
- [React：使用 ref 操作 DOM](https://react.dev/learn/manipulating-the-dom-with-refs)
- [React：与 Effect 同步](https://react.dev/learn/synchronizing-with-effects)
- [React：useEffect 参考](https://react.dev/reference/react/useEffect)
- [MDN：clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout)
