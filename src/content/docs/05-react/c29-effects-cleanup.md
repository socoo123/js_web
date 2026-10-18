---
title: C29 useEffect 深入与清理
description: 用订阅时序理解 Effect 的依赖、闭包与清理，修复重复监听、旧值和循环更新，保留 StrictMode 检查。
sidebar:
  order: 29
---

> **第 3 周 · 第 15 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C23、C26–C28 · 运行：Node 24 与本地 React · 示例已运行验证

## 这一课解决什么问题

库存页要监听通知，你在 Effect 里注册了一个回调。刚打开页面，发一条通知，计数却加了两次。切到无线鼠标，日志里还在打印机械键盘的编号。

你把依赖数组改成空数组，重复执行少了，旧编号却留下来；为了更新筛选结果，又在 Effect 里设置数组 state，页面开始连续刷新。这几种现象都来自同一个问题：没有说清这段同步依赖什么、何时结束。

学完你能：

- 按时间顺序解释 setup、旧 cleanup、新 setup 和卸载
- 从 Effect 读取的值推导依赖，用闭包解释旧编号
- 成对建立和移除监听，用函数式更新避免计时器读取旧计数
- 读懂 StrictMode 的开发检查，修资源管理而不是关检查
- 将派生值留在渲染、用户操作留在事件，用 lint 辅助检查依赖

普通 JS 例子在 [examples/c29](https://github.com/socoo123/js_web/tree/main/examples/c29)，在该目录运行 `node 文件名.js`。React 继续使用 [examples/inventory/04-react](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)：进入该目录，执行 `npm ci`、`npm run dev -- --host 127.0.0.1`。

打开终端给出的 /js_web/ 地址，在后面加 `labs/effects.html?case=lifecycle`。下文只写 case 的值。实验用浏览器内的 `inventory-pulse` 事件模拟通知，不连接服务器，也不修改商品库存。每换一个实验都重新打开对应地址，清空上一页留下的监听与日志。

## Java 程序员先看这里

| Java 经验 | React 对应 | 一句话差异 |
| --- | --- | --- |
| 初始化资源、关闭资源 | setup 返回 cleanup | 依赖改变也要先关闭旧资源，组件还可能留在页面上 |
| lambda 捕获局部变量 | Effect 与其回调保留本次渲染的闭包 | 新渲染产生新值，已注册的旧回调继续读旧闭包 |
| equals 比较内容 | 依赖逐项用 `Object.is` 比较 | 新建对象和函数每次都有新身份 |
| 循环任务更新字段 | interval 回调更新 state | 用纯 updater 接收队列中的最新值 |
| 编译器检查变量使用 | Hooks lint 检查调用和依赖 | 能找漏写的依赖，资源是否清理还需要行为验证 |

Effect 更像一段可以反复启动和停止的同步过程，不是 Java 构造器与析构器的配对。React 组件的渲染和外部资源的生命周期分别管理。

## 1. 每次 setup 都有自己的 cleanup

[`useEffect(setup, dependencies)`](https://react.dev/reference/react/useEffect) 表达“让外部系统与当前渲染中的值保持同步”。React 提交界面后运行 setup；setup 可以返回一个函数，交给 React 在这段同步结束时调用。传给 useEffect 的函数在渲染时只是被登记，此时还没有执行监听操作。

下面是 `case=lifecycle` 使用的完整 ProductWatch。父组件可以切换 P001/P002、发通知、显示或隐藏它；productId 作为 prop 传进来。

```jsx
import { useEffect, useState } from "react";

export default function ProductWatch({ productId }) {
  const [hits, setHits] = useState(0);
  useEffect(() => {
    function handlePulse() {
      console.log("收到", productId);
      setHits((n) => n + 1);
    }
    console.log("setup", productId);
    window.addEventListener("inventory-pulse", handlePulse);
    return () => {
      console.log("cleanup", productId);
      window.removeEventListener("inventory-pulse", handlePulse);
    };
  }, [productId]);
  return <p role="status">当前 {productId} · 收到 {hits} 次通知</p>;
}
```

**先猜一猜：** 页面显示 P001 时点「切换商品」，再发一条通知。先清理哪个编号，收到的又是哪个编号？切换会把通知次数重置吗？

忽略首次打开的开发检查，切换产生的日志依次为 `cleanup P001`、`setup P002`；发通知再打印 `收到 P002`，次数加一。组件仍在同一树位置、类型和 key 下，hits 保留。Effect 换了一次订阅，不等于组件换了身份。

执行顺序按这张表理解：

| 时刻 | 这个 Effect 做什么 |
| --- | --- |
| 首次提交 P001 | setup P001，建立它的监听 |
| 备注输入导致重渲染，productId 仍是 P001 | 比较依赖后保留原监听 |
| 提交 P002 | cleanup P001，然后 setup P002 |
| 隐藏监听组件 | cleanup P002，结束最后一次同步 |

新界面提交时，React 会在运行该 Effect 的新 setup 前先运行旧 cleanup。cleanup 不只在卸载时执行，它也负责依赖变化时交接资源。这里关注同一个 Effect 的配对顺序，无需把它理解成所有组件之间的全局执行顺序。

![共用机制图：左栏展示 P001 的 setup、StrictMode 检查、切换 P002 时的 cleanup 和新 setup、卸载清理；右栏将清理规则应用于请求竞态，失效的 P001 不能覆盖 P002。](../../../assets/diagrams/c29-effect-lifecycle.svg)

先看左栏，从上往下读，每个 cleanup 清理的是与自己配对的 setup。蓝色区域是首次挂载的开发检查，生产路径直接跳过它；右栏的请求应用在下一课展开。

### 为什么旧清理知道旧编号

cleanup 是 setup 那次执行创建的函数，它和 handlePulse 都保留那次渲染的 productId。P002 的新渲染没有把旧闭包里的 P001 改掉。

用普通 JS 单独观察闭包。在 examples/c29 运行：

```js title="cleanup-closure.js"
function subscribe(productId) {
  console.log("setup", productId);
  return () => console.log("cleanup", productId);
}
const stopKeyboard = subscribe("P001");
stopKeyboard();
const stopMouse = subscribe("P002");
stopMouse();
```

依次打印 `setup P001`、`cleanup P001`、`setup P002`、`cleanup P002`。这里是手动调用函数，没有运行 React；真正的提交与清理由前面的组件完成。Java lambda 同样能保留捕获值，区别是 React 每次渲染都会产生一批新的局部绑定与回调。

## 2. 依赖由读取的值决定

Effect 读取的 props、state、组件内声明的变量和函数，都可能随渲染变化，称为响应式值。依赖列表描述这些读取，不是挑选几个值来安排执行次数。React 的[响应式 Effect 生命周期](https://react.dev/learn/lifecycle-of-reactive-effects)正是以同步所需的值为中心。

第一节读取 productId，所以写 `[productId]`；hits 只出现在 JSX，回调用 updater 接收 n，没有读取渲染中的 hits，所以不用把 hits 放进去。setHits 的身份稳定，React 知道它不随渲染改变。

### 少一个依赖，就是留住了一段旧同步

`case=stale` 保留了清理函数，却把依赖改成空数组。完整错误起点在 StaleSubscriptionBroken.jsx：

```jsx
// 有问题的写法：监听读取 productId，却用空依赖保留旧闭包
import { useEffect, useState } from "react";

export default function StaleSubscriptionBroken({ productId }) {
  const [hits, setHits] = useState(0);
  useEffect(() => {
    function handlePulse() {
      console.log("收到", productId);
      setHits((n) => n + 1);
    }
    console.log("setup", productId);
    window.addEventListener("inventory-pulse", handlePulse);
    return () => {
      console.log("cleanup", productId);
      window.removeEventListener("inventory-pulse", handlePulse);
    };
  }, []);
  return <p role="status">当前 {productId} · 收到 {hits} 次通知</p>;
}
```

切到 P002，文字已经显示 P002，发通知却打印 `收到 P001`。JSX 来自新渲染，监听还是初次挂载留下的函数。空数组告诉 React，这段同步没有会变的输入，所以 React 没有机会用新回调替换旧回调。补上 productId 后，旧清理与新 setup 才会发生。

三种依赖写法的区别：

| 写法 | 普通提交后的行为 | 适用条件 |
| --- | --- | --- |
| 不传第二个参数 | 每次提交后重新运行，先做已有的清理 | 确实需要每次重新同步 |
| `[]` | 普通重渲染保留原同步 | 没读取会变的响应式值 |
| `[productId]` | productId 变化才重新同步 | 订阅取决于当前商品 |

首次挂载都要 setup；带 cleanup 的 Effect 在组件移除时都要清理。`[]` 也会在重新挂载时执行，另有第四节的开发检查。

### 比较的是身份，不是“看起来一样”

React 用 [`Object.is`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 逐项比较依赖，并不深比较对象内容。依赖数组每次都是新的字面量没关系，比较的是其中每个位置的值。

**先猜一猜：** 两份配置都写 P001，下面哪一行得到 true？

```js title="deps-identity.js"
const previous = { productId: "P001" };
const current = { productId: "P001" };
console.log(Object.is(previous.productId, current.productId));
console.log(Object.is(previous, current));
console.log(Object.is(() => 12, () => 12));
console.log(Object.is(["P001"], ["P001"]));
```

依次为 `true`、`false`、`false`、`false`。每次渲染都创建 `const options = { productId }`，再依赖 `[options]`，输入备注也会触发重新订阅。组件内声明的新函数同理。Java 中两个普通对象的 `==` 也有身份区别；JS 对象的 Object.is 不会调用业务 equals。

修复优先改变代码结构：Effect 只需要 productId，就在 Effect 内创建配置并依赖 productId；真正不随渲染变化的常量可以移到模块顶层。需要某个函数只给 setup 使用，也可在 setup 内定义。具体方法见[移除不必要的依赖](https://react.dev/learn/removing-effect-dependencies)，先让依赖准确，再判断是否需要性能工具。

当前组件自己创建的 ref 容器身份稳定，但改 `.current` 不触发渲染，把 `.current` 写进列表也建立不了订阅。如果 ref 通过 prop 传入，父组件可能换容器，Effect 读取这个 prop 时仍列出容器本身。项目步骤中的 inputRef 就属于这种情况。

## 3. 监听和计时器都要成对释放

注册监听会把函数交给浏览器。重新渲染并不会让浏览器自动忘掉旧函数；清理时要把同一个函数对象交回 [`removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)，事件类型和 capture 标志也要对应。

`case=missing` 的完整起点缺了 return cleanup：

```jsx
// 有问题的写法：建立监听却没有返回清理函数
import { useEffect, useState } from "react";

export default function SubscriptionBroken({ productId }) {
  const [hits, setHits] = useState(0);
  useEffect(() => {
    function handlePulse() {
      console.log("收到", productId);
      setHits((n) => n + 1);
    }
    console.log("setup", productId);
    window.addEventListener("inventory-pulse", handlePulse);
  }, [productId]);
  return <p role="status">当前 {productId} · 收到 {hits} 次通知</p>;
}
```

本项目根部保留 StrictMode，初次开发检查后已有两个不同的 handlePulse。发一条通知显示收到 2 次；切到 P002 再发一条，又多出第三个监听，累计变成 5。旧监听仍打印 P001，新监听打印 P002。重复的 setup 每次创建新函数，所以浏览器把它们视为不同监听。

第一节的 cleanup 使用同一次 setup 中的 handlePulse，正好移除对应资源。如果清理时重新写一个箭头函数，即使函数体一模一样，身份也不同，原监听仍在。React 不会根据代码文本推断哪两个函数应该配对。

Java 里注册一个 listener 后也需要保留相应对象来注销。这里把 setup 和 cleanup 写在同一个词法作用域，能直接配对，通常比另放一个 ref 更清楚。

### 计时器清理正确，也可能读到旧值

`case=interval` 每秒检查一次，但第三秒界面仍显示“已检查 1 次”：

```jsx
// 有问题的写法：回调一直读取初次渲染的 count
import { useEffect, useState } from "react";

export default function IntervalBroken() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount(count + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p role="status">已检查 {count} 次</p>;
}
```

清理与 timer 配对没有问题，错在回调始终读取初次的 count=0，每秒都请求把值替换成 1。按读取规则补 `[count]` 能修复旧值，但每次增加计数又会清理并重建计时器。

这里的意图只是“在最新次数上加一”。`case=interval-answer` 用函数式更新表达它：

```jsx
import { useEffect, useState } from "react";

export default function IntervalFixed() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p role="status">已检查 {count} 次</p>;
}
```

现在第一、二、三秒依次显示 1、2、3。setup 不再读取 count，空依赖与代码相符；浏览器只保留一个活动 interval，移除组件时清除它。函数式更新接收 React 更新队列中的待处理值，解决的是快照问题，和创建新线程无关。

## 4. StrictMode 检查的是“能否清理后重新开始”

根部启用 [StrictMode](https://react.dev/reference/react/StrictMode) 时，开发环境首次挂载会额外做一次 setup → cleanup，然后正常 setup。因此打开 lifecycle 会依次看到 `setup P001`、`cleanup P001`、`setup P001`，最终只有一个活动监听。

这三行日志是第一节 ProductWatch 的同一段 Effect 产生的。点击发通知只打印一次 `收到 P001`；切换商品还是一对旧清理和新 setup；隐藏后再发通知没有收到日志。资源数与通知结果，比只数 setup 的日志更能说明代码是否正确。

有些代码用 ref 跳过第二次 setup，看起来能让日志少一行。`case=guard` 的 GuardedSubscriptionBroken 在 setup 开头做这个判断：

```js
// 有问题的写法：拦住重新 setup，掩盖清理是否正确
if (startedRef.current) return;
startedRef.current = true;
```

这个实验发通知后仍显示 0：第一次 setup 注册监听，cleanup 移除了它，第二次被挡住后，界面上反而没有监听。如果第一次没清理，泄漏依然存在。应修好每次建立与释放的配对，让任意一次重新启动都成立。

生产构建没有这轮额外检查；用户离开区域再回来、依赖变化、开发热更新，仍可能让同步停止后重启。开发检查让这类缺陷更早出现。严格模式下的额外渲染也不是点击事件被自动执行两次。

:::tip[自己尝试 · 本地 React]
1. 在阶段 4 启动 dev，打开 `labs/effects.html?case=lifecycle`；清空 Console 后重新载入，观察三行初始日志。
2. 输入备注，确认没有新 setup；切到 P002，确认先 cleanup P001 再 setup P002。
3. 发一条通知，隐藏监听，再发一条，重新显示后再发一条。
4. 换到 `?case=missing`，重新载入后先发一条，再切换并发一条，对比累计次数。

预期：正确版第一次只收到一次，隐藏期间无日志，重挂载次数从 0 开始；错误版第一次为 2，切换再发后累计为 5。保留 StrictMode 完成比较。
:::

本课实验把 StrictMode 放在整个根部。只包裹局部子树时，首次额外 Effect 检查有不同边界，按官方说明理解；这不改变依赖变化时旧清理先于新 setup 的规则。

## 5. 派生值直接算，用户操作放在事件里

库存列表由 products 和筛选条件决定，渲染时计算就能得到结果。[不需要 Effect 的场景](https://react.dev/learn/you-might-not-need-an-effect)有一个共同点：用已有输入就能完成工作，不需要和外部系统建立同步。

`case=loop` 把有货商品复制成另一份 state，并在 Effect 中更新它。LoopBroken 的完整错误起点加了实验停止条件，连续运行超过六次就抛错，避免持续占用页面资源：

```jsx
// 有问题的写法：每次都生成新数组，更新自身依赖
import { useEffect, useRef, useState } from "react";

export default function LoopBroken({ products }) {
  const [visible, setVisible] = useState([]);
  const runsRef = useRef(0);
  useEffect(() => {
    console.log("筛选 setup", ++runsRef.current);
    // 仅供实验止损：让循环变成可观察的错误，避免页面持续占用资源。
    if (runsRef.current > 6) throw new Error("实验已停止：Effect 连续更新自己的依赖");
    setVisible(products.filter((product) => product.stock > 0));
  }, [products, visible]);
  return <p role="status">有货 {visible.length} 种</p>;
}
```

页面最终显示“实验已停止”，Console 中 setup 的编号连续增长。链条是：setup 更新 visible → 新 state 请求渲染 → 依赖 visible 身份变了 → 再次 setup。filter 每次创建新数组，即使每份里面都是相同的五件有货商品，也不会通过 Object.is 比较。

循环需要同时存在两件事：Effect 设置了 state；这个更新又让它的依赖改变。新对象依赖可能导致频繁运行，但只有它本身还不足以形成更新循环。删除 visible 依赖能打断这里的环，却仍留下不必要的重复 state 和一次额外提交。`case=loop-answer` 直接计算：

```jsx
export default function LoopFixed({ products }) {
  const visible = products.filter((product) => product.stock > 0);
  return <p role="status">有货 {visible.length} 种</p>;
}
```

固定数据立即显示“有货 5 种”。父组件给 P002 补货后，新的 products 传进来，同一轮渲染便算出 6 种，无需第二份 state。Java 里能从集合即时计算的统计，也不必维护一个需要手动同步的副本。

同样，保存按钮的处理函数知道用户刚提交了哪个商品，校验、dispatch、成功提示可以直接在事件里完成。若用 Effect 观察 products 再猜用户是不是保存了商品，补货、新增、初始化也会混进同一套逻辑。按触发原因选择位置：

| 需求 | 放哪里 |
| --- | --- |
| 筛选数组、总库存、价格显示文本 | 渲染时计算 |
| 点击保存、取消延时盘点、保存成功后聚焦标题 | 事件处理函数 |
| 总库存变化时更新浏览器标签页标题 | 依赖总库存的 Effect |
| 组件存在时响应全局快捷键 | Effect 注册，cleanup 注销 |

### lint 帮你核对读取关系

本课在阶段 4 接入官方 [eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks)，开启 `rules-of-hooks` 与 [`exhaustive-deps`](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps)。前者检查 Hook 调用位置，后者检查依赖是否覆盖读取的响应式值。

在阶段 4 运行 `npm run lint`，检查应用和正确实验；`npm run lint:bug` 专门检查两个教学错误，分别指出 productId、count 缺失。先按提示修缺失的读取，若依赖太多，就调整代码结构，而不是加关闭规则的注释。

这套配置只启用两条教学相关规则。依赖齐全仍可能缺 cleanup，LoopBroken 也已经把依赖写齐；lint 不能证明资源管理和业务设计正确。接着通过日志、断点与行为测试找证据。

## 常见错误与调试

### 一条通知处理多次，切换后还出现旧编号

**现象**：missing 初次发一条收到 2 次；stale 切到 P002 后，通知日志仍为 P001。

**工具**：Chrome 打开 Sources，通过文件搜索打开 SubscriptionBroken.jsx，在 `setHits((n) => n + 1)` 行号上设断点。点发通知，每次暂停后按 Resume；再在 stale 地址对 StaleSubscriptionBroken.jsx 的同一行设断点。

**证据**：missing 一条通知会停两次，Scope 中两次的 productId 都是 P001。stale 先切商品再发通知，只停一次，但闭包里的 productId 仍是 P001，Elements 中当前文字却已是 P002。

**原因**：前者少 cleanup，留下多个不同函数；后者少依赖，保留了旧函数。现象相近，修复位置不同。

**修复**：missing 按 ProductWatch 返回移除同一 handlePulse 的函数；stale 把 productId 加回依赖列表。两者都采用第一节的设计。

**确认**：重新打开正确版，切换后发一条只停一次，闭包编号是 P002；隐藏后再发，不再停。阶段 4 的 `npm run test:bug -- labs/effects-bugs.test.jsx` 中前两项从失败变为通过。

### 有货列表触发连续更新

**现象**：loop 页面出现实验停止提示，筛选 setup 的日志连续增长。

**工具**：Sources 打开 LoopBroken.jsx，在 setVisible 所在行设断点，连续恢复几次，查看 Scope 中 visible；Console 保留筛选日志。随后打开 LoopFixed.jsx 对照。

**证据**：products 没变，visible 每次都是包含相同商品的新数组。第二节的 deps-identity.js 已证明内容相同的新数组仍有不同身份，Effect 又把它写回自己依赖的 state。

**原因**：派生值进入 Effect 后形成了更新环。实验停止条件只负责保护页面，业务代码的问题在它前后的读写关系。

**修复**：删除 visible 的 useState 和整个筛选 Effect，像 LoopFixed 一样直接计算。

**确认**：正确版显示有货 5 种；给 P002 补货后为 6 种，不再出现筛选 setup 日志。上面的 bug 测试第四项变为通过；tests/effects.test.jsx 还覆盖来源数据变化后的结果。

## 练习

### 练习 1：旧回调会读到新库存吗

先写下 prediction.js 的三行输出，再在 examples/c29 运行核对。验收：解释为什么第一份 stop 没有打印 15。

```js title="prediction.js"
function createSession(stock) {
  return { read: () => stock, stop: () => console.log("清理库存快照", stock) };
}
const first = createSession(12);
const second = createSession(15);
console.log(first.read(), second.read());
first.stop();
second.stop();
```

<details>
<summary>提示</summary>

两次函数调用各有自己的 stock 绑定。第二次调用不会进入第一次调用的作用域修改它。

</details>

<details>
<summary>参考答案</summary>

依次是 `12 15`、`清理库存快照 12`、`清理库存快照 15`。每个回调保留各自那次调用的绑定。React 的旧 cleanup 同理，清理 P001 的订阅时仍应持有 P001 的句柄，而不是拿新界面的 P002 代替。

</details>

### 练习 2：把四项失败变成通过

从阶段 4 的 SubscriptionBroken、StaleSubscriptionBroken、IntervalBroken、LoopBroken 开始修复。先运行 bug 测试观察 4 项失败，再运行 lint:bug 观察 2 项依赖错误。

验收：切换后只处理一次新商品通知；三秒检查 3 次；有货显示 5 种且没有循环；bug 测试四项通过，lint:bug 也通过。完整对照分别是 ProductWatch、IntervalFixed、LoopFixed；仓库保留错误起点供重复练习。

<details>
<summary>提示</summary>

先区分三件事：资源是否释放、闭包有没有随输入替换、这项工作是否需要 Effect。计时器只依赖前一个次数时，用 updater；派生数组直接计算。

</details>

<details>
<summary>参考答案</summary>

两个通知组件都按 ProductWatch 改：保留 productId 依赖，返回匹配的 removeEventListener。计时器改为 `setCount((n) => n + 1)`，保留空依赖与 clearInterval；它不再读取 count。筛选组件按 LoopFixed 删除 Effect 和重复 state。

回归不仅检查最终文字，还要检查停止以后不会继续接收事件。tests/effects.test.jsx 中已有关键步骤，前面按该文件导入 mount、click、vi 和 expect：

```jsx
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const host = await mount(<WatchControls />);
  await click("显示或隐藏监听");
  expect(log.mock.calls.at(-1)).toEqual(["cleanup", "P001"]);
  log.mockClear();
  await click("发一条通知");
  expect(log).not.toHaveBeenCalled();
  await click("显示或隐藏监听");
  await click("发一条通知");
  expect(host.querySelector('[role="status"]').textContent).toContain("收到 1 次通知");
```

隐藏后没有收到日志，证明浏览器中的回调被注销；重新显示只收到一次，证明重新启动没有积累监听。仅断言“组件已经不显示”无法验证这两点。

</details>

## 项目进度

从 C28 的 examples/inventory/04-react 继续。本课新增两个负责外部同步的组件：InventoryTitle 同步 document.title，InventorySearchShortcut 注册全局键盘监听。两项互不依赖的同步各用自己的 Effect；库存来源继续由 reducer/Context 管理。

InventoryTitle 读取全部库存并同步标签页标题，完整文件如下：

```jsx
import { useContext, useEffect } from "react";
import { ProductsContext } from "./InventoryContext.jsx";

export default function InventoryTitle() {
  const products = useContext(ProductsContext);
  if (products === null) throw new Error("InventoryTitle 需要 InventoryProvider");
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `库存管理 · ${totalStock} 件`;
    return () => { document.title = previousTitle; };
  }, [totalStock]);
  return null;
}
```

总库存先在渲染时计算，Effect 只负责浏览器标题这个外部目标。初次为“库存管理 · 52 件”，P002 补一件后为 53；筛选不会改全部库存，所以不重新同步标题。每次 setup 先保存接管前的标题，cleanup 恢复；依赖变化时旧 cleanup 先恢复，新 setup 再接管，最终卸载也能恢复进入应用前的标题。这里约定当前页面由这一个组件管理标题。

App.jsx 导入它，在 InventoryPage 返回的片段中、h1 前放 `<InventoryTitle />`。它不生成页面节点，仍通过上层 Provider 读取库存。

Catalog 在顶层增加 `const searchRef = useRef(null)`，搜索 input 连接 `ref={searchRef}`，并在返回的片段里放 `<InventorySearchShortcut inputRef={searchRef} />`，同时导入 useRef 和新组件。后者完整实现如下：

```jsx
import { useEffect } from "react";

export default function InventorySearchShortcut({ inputRef }) {
  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey
        || event.defaultPrevented || event.isComposing) return;
      if (target instanceof HTMLElement
        && (target.closest("input, textarea, select") || target.isContentEditable)) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputRef]);
  return null;
}
```

这个 Effect 负责订阅生命周期，真正的焦点变化发生在按键回调中。当前 Catalog 的 ref 稳定，普通筛选输入不会重建监听；如果父组件换了 ref prop，则先移除旧监听，再使用新容器。输入框、可编辑区中的 `/` 留给用户输入；修饰键、输入法合成与已处理事件也保持原行为。

:::tip[自己尝试 · 本地 React]
1. 刷新首页，确认总库存 52、价值 26348.00 元，浏览器标签页标题为“库存管理 · 52 件”。
2. 点击页面标题再按 `/`，确认搜索框获焦点；输入键盘，列表只剩 P001，标签页仍为 52 件。
3. 清空搜索，给 P002 点「补 1 件」，确认总库存 53、价值 26477.00 元，标签页标题更新为 53 件。
4. 编辑 P002，在名称框输入 `/`，确认斜线留在名称里、焦点不跳到搜索框；取消编辑。
5. 在阶段 4 运行 `npm run lint`、`npm test`、`npm run build`，再用 `npm run preview -- --host 127.0.0.1` 检查生产首页。

预期：开发和生产的库存、标题、快捷键行为一致；刷新恢复固定数据。生产首页没有实验页入口，课程 Pages 发布的仍是静态正文。
:::

tests/effects.test.jsx 覆盖旧清理与新 setup 的顺序、无关渲染保留订阅、移除后停止通知、interval、派生值、标题恢复和快捷键。C28 的表单焦点与延时取消继续保留。

## 小结

- Effect 是一段外部同步：setup 建立，返回的 cleanup 停止，依赖改变也要清理旧同步。
- 回调与 cleanup 保留各自渲染的闭包；把响应式读取列进依赖，才能在输入变化后换成新同步。
- 依赖逐项按 Object.is 比较；对象、数组、函数的新身份会影响是否重新执行。
- 根 StrictMode 的开发检查暴露缺清理问题；目标是最终只保留需要的资源，并能安全重新启动。
- 派生值直接计算，用户操作留在事件；lint 检查读取关系，行为测试检查资源和结果。

自测：

1. 切到 P002 后，为什么先执行的 cleanup 仍应读取 P001？
2. 输入备注没有改变 productId，ProductWatch 为什么不重新订阅？
3. 每秒 setCount(count + 1) 为什么可能永远停在 1？
4. setup 日志出现两次，怎样判断最终是否真的有重复监听？
5. 依赖已经写齐，为什么依然可能出现 Effect 循环？

下一课把这套清理时序用于请求状态，处理慢网、失败、取消和旧响应覆盖新内容的竞态。

## 延伸阅读

- [React：与 Effect 同步](https://react.dev/learn/synchronizing-with-effects)
- [React：响应式 Effect 的生命周期](https://react.dev/learn/lifecycle-of-reactive-effects)
- [React：移除 Effect 依赖](https://react.dev/learn/removing-effect-dependencies)
- [React：你可能不需要 Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React：exhaustive-deps](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps)
- [React：StrictMode](https://react.dev/reference/react/StrictMode)
