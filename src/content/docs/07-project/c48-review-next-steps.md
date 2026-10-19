---
title: C48 总复盘与后续路线
description: 用十个机制自测、库存项目演示和个人补缺表串起整门课，学会阅读版本更新并选择下一阶段。
sidebar:
  order: 48
---

> **第 4 周 · 第 24 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C01–C47 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

库存应用能编辑、能恢复快照，测试也通过了。关掉教程，你能解释为什么补货要创建新对象、旧请求为什么需要清理，以及同一份代码为什么在 Node 能跑、在浏览器却报错吗？

最后一课把这些问题接起来。你会先预测几段代码，再用项目证明自己能做什么，最后把仍需翻答案的部分写成下一周的任务。

学完你能：

- 用语言、宿主、工具和 UI 四个层次解释一路学过的技术。
- 不看答案讲清十个核心机制，并用输出或调试证据支撑解释。
- 展示库存项目的业务、排错、测试和静态交付过程。
- 区分标准状态与环境支持，按实际薄弱点选择后续路线。

本课文件在 [examples/c48](https://github.com/socoo123/js_web/tree/main/examples/c48)。下面带文件名的例子都在该目录用 `node 文件名.js` 运行；项目命令另标目录。

## Java 程序员先看这里

| Java 经验 | 迁移到 JS 时抓住什么 | 最容易误判的地方 |
| --- | --- | --- |
| 变量类型、集合泛型 | 值的类型与入口校验 | JSON 能解析，只说明语法合法 |
| 对象引用、equals/hashCode | 身份、业务 id、共享引用 | Map 的对象键不会调用自定义 equals |
| 实例方法、lambda | 调用方式决定 this，闭包保留绑定 | 从对象取出方法后，接收者可能丢失 |
| Future、线程池 | Promise、微任务、宿主 I/O | await 暂停当前 async 函数，不自动开线程 |
| Maven、JUnit、应用服务器 | 包管理器、测试运行器、静态托管各有职责 | 构建时有 Node，页面打开后仍由浏览器运行 |

需要逐项查语法时用 [Java ↔ JS 速查](../../reference/java-js/)。复盘的重点是解释行为并找到证据。

## 1. 从历史到生态：先说清代码在哪里运行

JavaScript 从 1995 年的浏览器脚本起步，后来有了 ECMAScript 标准、现代模块与异步能力，也进入 Node、Bun 等运行时。ES2015 是现代语法的重要转折，此后标准持续按年演进。历史留下的兼容行为仍在，例如 `typeof null`、宽松相等和字符串加法。

把一个技术名称放回它负责的层次，很多选择就清楚了：

| 层次 | 本课程中的技术 | 回答的问题 |
| --- | --- | --- |
| 语言与内建结构 | ECMAScript、函数、Promise、Array/Map/Set | 一段程序的值和执行规则是什么？ |
| 引擎与宿主 | V8；浏览器、Node、Bun | 谁执行语言，谁提供 DOM、文件和 I/O？ |
| 工程工具 | npm/Yarn/pnpm、Vite、Vitest | 怎么安装依赖、构建和运行测试？ |
| UI 与业务 | HTML/CSS、React、Ant Design、UI5 家族 | 怎样把业务状态变成可操作的页面？ |

`Array` 属于语言内建能力，`document` 属于浏览器 DOM。某个 API 在两个宿主里都存在，也要查看各自提供的功能。在 Node 运行：

```js title="runtime-boundary.js"
console.log("内建数组", typeof Array);
console.log("页面节点", typeof document);
console.log("Node 进程", typeof process);
console.log("请求能力", typeof fetch);
```

```text
内建数组 function
页面节点 undefined
Node 进程 object
请求能力 function
```

这里没有页面，所以没有 `document`；Node 自己提供 `process` 和 `fetch`。语言与宿主的区别见 [MDN 语言概览](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Language_overview)。

Java 可以把 JVM 和外部库分开理解，前端还要区分引擎和宿主 API。

Node、Bun 能运行 JS；Bun 还集成包管理、测试和构建工具。npm、Yarn、pnpm 主要负责包与工程任务。网站和各阶段练习各用自己的清单与锁，执行命令先确认目录。

UI 层也有各自边界：SAPUI5 是 SAP 交付的 UI5 产品，OpenUI5 是开源发行版，两者库范围不同；UI5 Web Components 是自定义元素组件，UI5 Web Components for React 在其上提供 React 接口。Fiori 提供设计体系。完整对照见 [UI5 家族速查](../../reference/ui5-family/)。

## 2. Java 经验继续用，值与身份重新判断

复习默认值、对象身份和更新方式。先分清“同一条业务记录”与“同一个对象”。

**先猜一猜：** 复制出来的鼠标能命中以原对象为键的 Map 吗？库存 0 会被默认值替换吗？

```js title="identity.js"
const mouse = { id: "P002", stock: 0 };
const copy = { ...mouse };
const index = new Map([[mouse, "已选中"]]);
console.log(mouse === copy);
console.log(mouse.id === copy.id);
console.log(index.has(copy));
console.log(mouse.stock ?? 12);
```

```text
false
true
false
0
```

`copy` 是新对象，所以对象比较为 false，Map 也找不到这个新键；两个 id 字符串按值比较，所以为 true。`??` 只替换 null 和 undefined，保住售罄的 0。以业务编号索引商品时，用字符串 id 作键，写作 `new Map([[mouse.id, mouse]])`。

Java 的对象 `==` 同样看身份，但 HashMap 通常走 equals/hashCode；JS Map 对象键按身份匹配。Java 字符串用 equals，JS 字符串直接用 `===`。比较前先说明你比较的是身份还是业务字段。

其余差异可用下面四个问题快速复查：

| 看到的代码 | 应该问自己 | 项目中的处理 |
| --- | --- | --- |
| 表单中的 `"0"`、空字符串 | 转换前有没有判空？范围允许 0 吗？ | 字符串草稿在入口解析，金额转整数分 |
| `const product`、`[...products]` | 限制的是重新赋值，还是对象修改？ | 更新目标商品时创建新记录 |
| `array.sort()` | 改原数组吗？比较的是数字吗？ | 数字比较器；需要保留来源时用复制排序 |
| `save(product)` | 改字段还是给参数换了对象？ | 参数传的是引用的副本，重新赋值不替换调用方变量 |

`map` 返回新数组，也可能在回调里修改旧商品；还要检查容器里的对象。

## 3. 十个机制自测：解释规则，再拿出证据

先口述再执行。每题记分：0 是解释不清，1 是提示后能做，2 是能独立解释并重现证据。十题都到 2 分，说明主线已连起来。

**先猜一猜：** `load()` 返回后，哪一句先打印？

```js title="async-order.js"
async function load() {
  console.log("开始读取");
  await Promise.resolve();
  console.log("读取完成");
}
console.log("同步开始");
const pending = load();
console.log("继续执行");
await pending;
console.log("收尾");
```

```text
同步开始
开始读取
继续执行
读取完成
收尾
```

async 函数先同步执行到 await；后续通过 Promise 的机制继续，所以调用方先打印“继续执行”。最外层 await 等 load 完成后才打印“收尾”。这份文件是 ESM，Node 可以在模块顶层使用 await。

Java Future 表示未来结果；本例没有工作线程，顺序来自同步执行与 Promise 的继续安排。

关闭答案，逐题解释并准备证据：

| 题 | 要讲清的机制 | 可重做的证据 |
| --- | --- | --- |
| 1 | `"0"`、0、空字符串为何不同？转换为何还要校验？ | C03 补货与 C25 空库存表单 |
| 2 | const、对象别名、浅复制分别限制或共享了什么？ | 本课 review-broken / review-fixed |
| 3 | 闭包保留什么？两个工厂调用为何有独立计数？ | C06 Scope 面板中的绑定 |
| 4 | 方法取出后 this 为何会变？class 方法在哪里查找？ | C07 调用方式与原型链 |
| 5 | 数组排序、Map 键、Set 去重分别按什么规则？ | C08 数字排序、C09 对象键实验 |
| 6 | await 暂停谁？fetch 的 HTTP 404 为何要自己检查？ | 上面的输出与 C13 Network |
| 7 | React state 为何是快照？更新队列和 key 改变什么？ | C23 连续更新、C24 编辑错位 |
| 8 | Effect 什么时候清理？怎样防旧请求覆盖新商品？ | C29/C30 快速切换与请求时间线 |
| 9 | 浏览器 import、包解析、npm ci 和构建各负责什么？ | C16 模块路径、C18 锁不一致实验 |
| 10 | Pages 怎样找到文件？base、hash 和服务器能力有什么边界？ | C46 静态路径检查与深层刷新 |

:::tip[自己尝试 · Node]
1. 先预测 `identity.js` 和 `async-order.js`，写下每行输出的原因。
2. 在 `examples/c48` 分别运行两份文件，再回到十题表口述答案。
3. 在自己的笔记给每题填分数和证据位置，留到练习 3 安排补缺。

预期：能解释对象键未命中、库存 0 保留和 await 前后顺序；解释不清的题有对应的重做入口。
:::

## 4. 阅读新版本：把标准状态与环境支持分开

评估一个新特性时，先写出它解决的具体问题，再查 API 文档、兼容表与目标环境。最后用小例子和已有业务回归检查行为。升级依赖时还要读对应版本的变更及迁移说明。

以保留原数组的排序为例，问题是“排序时不改变来源顺序”。[`toSorted`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) 返回新数组，旧环境可以先复制再 sort：

```js title="feature-check.js"
const stocks = [12, 0, 7];
const sorted = typeof stocks.toSorted === "function"
  ? stocks.toSorted((a, b) => a - b)
  : [...stocks].sort((a, b) => a - b);
console.log("排序", sorted.join(","));
console.log("原数组", stocks.join(","));
```

```text
排序 0,7,12
原数组 12,0,7
```

两条分支都使用数字比较器，并保留原顺序。它们只复制数组，元素如果是对象仍会共享引用。Java 中也要分清复制集合与复制集合内的可变对象。

检测方法是否存在，适合这种运行时 API。新的语法可能在执行判断前就解析失败，需要构建目标和转译方案；polyfill 补运行时能力，转译处理语法，两者职责不同。Vite 的构建成功也不等于目标浏览器具备每一个 API。

判断更新时保留三列信息：

| 查什么 | 从哪里查 | 记下什么 |
| --- | --- | --- |
| 是否进入正式标准、是否 Stage 4 | 本站 [ES 版本速查](../../reference/es-versions/)指向的官方来源 | 所属标准年份或提案阶段 |
| 目标环境能否使用 | MDN 兼容表、Node 文档、目标设备 | 浏览器与运行时的支持范围 |
| 当前项目怎样采用 | 已锁定版本、迁移说明、实际回归 | 是否需要降级方案、哪些测试要重跑 |

Stage 4 是已完成提案，进入哪一年度标准再看正式收录信息；较早阶段的提案仍可能改变。[Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) 概括主流浏览器支持，老设备、WebView 与项目指定浏览器仍需单独检查。

React 更新另看 [React Versions](https://react.dev/versions) 及对应发布说明。客户端 Hook、Server Functions 和框架集成要分开确认；Node 选维护中的版本并对照项目 engines。你的目标是能说明“为什么这次升级对这个项目合适”，并保留失败时可恢复的提交和锁文件。

## 5. 后续路线：用补缺结果安排一周

先补经常导致业务错误的机制，再选择一条深化方向。一个可执行任务同时有触发场景、操作和通过条件。

下面的分数是虚构样例，只演示排序方式：

```js title="gap-priority.js"
// 三项虚构自评，只演示如何从证据安排复习
const gaps = [
  { topic: "请求清理", score: 0, next: "重做 C30 快速切换详情" },
  { topic: "对象身份", score: 1, next: "重做 C05 浅复制实验" },
  { topic: "静态路径", score: 2, next: "保留 C46 深层刷新记录" },
];
const pending = gaps.filter((gap) => gap.score < 2)
  .toSorted((a, b) => a.score - b.score);
for (const gap of pending) {
  console.log(gap.topic + "：" + gap.next);
}
console.log("待补", pending.length);
```

```text
请求清理：重做 C30 快速切换详情
对象身份：重做 C05 浅复制实验
待补 2
```

0 分先补，1 分独立重做，2 分留下证据。Java Stream 的筛选排序经验可直接迁移；这里返回新数组。

将十题中未到 2 分的项目填入笔记，前两行是填写示例：

| 薄弱机制与分数 | 下一次实际操作 | 通过条件 | 重测日 |
| --- | --- | --- | --- |
| 请求竞态 · 0 | 慢网下从 P001 快速切到 P002 | 最后只显示 P002，旧响应不改当前视图 | 明天 |
| 对象身份 · 1 | 修复本课浅复制故障，解释每个比较 | 旧库存 0、新库存 1，目标换身份，其他记录共享 | 后天 |
| 按十题自测填写 | 写到文件、按钮或面板 | 写具体值或用户可见结果 | 写日期 |

下一周：前两天补 0 分项，第三天重做 1 分项，第四天独立演示，第五天尝试扩展，第六天回归重测。每天留 15 分钟复述易错题；8 周路线采用相同通过条件。

基础稳定后，从以下方向选一条，用现有库存业务做一个小交付：

| 目标 | 下一步内容 | 可展示的交付 |
| --- | --- | --- |
| 写稳前端页面 | CSS/可访问性 X01，再补 TS X02 | 键盘可编辑、窄屏可用；类型检查与 JSON 校验分别存在 |
| 深入 React | 表单与状态 X07、Compiler/框架 X08 | 先测量一个慢操作，再保留优化前后结果和回归 |
| 连接自己的后端 | Node 服务与 I/O X05 | 分页查询和错误响应；说明鉴权与服务部署在哪里 |
| 面向 SAP 业务 | OData/CAP/Fiori Elements X09 | 有 metadata 的本地服务，分清 mock 与真实写入 |
| 提高测试与工程能力 | 依赖治理 X06、测试深化 X10 | 一份可复现安装记录和能发现具体回归的测试 |

X01–X10 是大纲中的选修方向。先交付一个小目标，再扩大范围；每周保留一条修过的故障记录。

## 常见错误与调试

### 数组换了，旧库存却跟着变了

**现象**：补货后旧库存也变成 1，日志让你误以为 React 的旧快照会自动变化。在 `examples/c48` 运行：

```js title="review-broken.js"
// 有问题的写法：只复制数组，商品对象仍与旧状态共享
import { products } from "../shared/products.js";

const before = structuredClone(products);
const after = [...before];
after.find((product) => product.id === "P002").stock += 1;
console.log("旧库存", before[1].stock);
console.log("新库存", after[1].stock);
console.log("同一商品对象", before[1] === after[1]);
```

输出依次是 `旧库存 1`、`新库存 1`、`同一商品对象 true`。

**工具**：在该目录运行 `node --inspect-brk review-broken.js`，Chrome 打开 `chrome://inspect`，选择对应 Node 目标的 inspect。在 Sources 给 `stock += 1` 那行设断点，继续执行到它，再在暂停时的 Console 比较 `before === after`、`before[1] === after[1]`，最后单步越过修改。

**证据**：两个数组比较为 false，两个鼠标对象比较为 true；单步之后，before 与 after 的鼠标都成了 1。起点先做了 structuredClone，所以共享数据未被改。

**原因**：展开语法只复制数组槽位里的引用。新数组里面仍是原来的商品对象，通过任意别名改字段，另一边就能看到。

**修复**：调用阶段 4 已有的 reducer；它只替换目标记录，完整验证还复用阶段 1 的统计：

```js title="review-fixed.js"
import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";
import { Inventory } from "../inventory/01-core/inventory.js";

const before = structuredClone(products);
const after = productsReducer(before, { type: "restocked", id: "P002" });
console.log("旧库存", before[1].stock);
console.log("新库存", after[1].stock);
console.log("同一商品对象", before[1] === after[1]);
console.log("未改商品共享", before[0] === after[0]);
console.log("总库存", new Inventory(after).summary().totalStock);
console.log("原始总库存", new Inventory(before).summary().totalStock);
```

输出为旧库存 0、新库存 1、目标对象比较 false、未改商品比较 true；新总库存 53、原始总库存 52。共享未修改的记录减少复制，后续更新继续遵守只读旧状态的规则。React 的[快照](https://react.dev/learn/state-as-a-snapshot)语义需要你保留旧数据，而不是靠 React 冻结每个对象。

**确认**：运行 `node review-fixed.js`；再到阶段 4 运行 `npm test -- tests/reducer.test.jsx`，其中已有的不可变更新回归应通过。只检查新库存是 1 会漏掉这个 bug，检查旧值与身份才能发现它。

## 练习

### 练习 1：关闭教程，讲清十个机制

重做第 3 节的十题，每题先用两三句话解释，再指出一个可运行文件或具体操作。至少预测 identity 与 async-order 两份文件，运行后解释差异。验收：十题都有分数与证据入口，解释能对应看到的值。

<details>
<summary>提示</summary>

按“规则、结果、原因”回答。例如第 6 题先解释暂停谁，再解释输出顺序，最后说明何时检查 HTTP 状态。

</details>

<details>
<summary>参考答案</summary>

1. 输入值先是字符串；空字符串转 Number 会得到 0，先判空再校验整数和范围。
2. const 限制绑定重新赋值；浅复制保留内部引用；修改目标商品要创建新对象。
3. 闭包保留词法环境里的绑定；两次工厂调用建立不同环境，各自计数。
4. 普通函数的 this 取决于调用方式，箭头函数取外层 this；class 实例通常沿原型找到方法。
5. sort 默认按字符串排序且修改原数组；Map 对象键看身份；Set 对原始值去重、对对象按身份区分。
6. await 暂停当前 async 函数；fetch 得到 404 响应仍可兑现 Promise，需要检查 response.ok。
7. 每次渲染有自己的 state；函数式更新依次计算待处理值，key 参与组件身份和状态保留。
8. 依赖变化后先清理旧 Effect 再建立新同步，卸载也清理；取消旧请求，并阻止过期结果提交。
9. 浏览器按 URL 加载模块；包工具处理包依赖；npm ci 按锁安装并检查清单一致；构建生成静态产物。
10. base 约束应用子路径；hash 留在浏览器；Pages 按路径返回静态文件，服务器业务需另行部署。

identity 输出 false、true、false、0；async-order 的五行顺序见第 3 节。答案用于核对，分数来自你能否独立讲解和重做。

</details>

### 练习 2：补货正确，也要保住旧状态

起点是 `review-broken.js`。修成与 review-fixed 相同的业务结果，可以先自己用 map 和对象展开实现，再对照 reducer。

验收：P002 从 0 到 1，旧商品仍为 0；两个数组不同，目标对象不同，P001 对象仍相同；新旧总库存为 53 和 52。解释为什么“每次完整深复制”可以隔离数据，却不是这个更新所必需的。

<details>
<summary>提示</summary>

沿着被修改的路径复制：列表数组 → P002 记录。库存是数字，替换这个字段不需要复制其他商品，也没有修改 tags。

</details>

<details>
<summary>参考答案</summary>

map 中仅对 `product.id === "P002"` 返回 `{ ...product, stock: product.stock + 1 }`，其他分支返回原 product。map 提供新数组，对象展开提供新目标记录，旧状态没有写入。

完整深复制会创建所有记录和 tags 的新对象；这个更新只改变库存，按路径复制就足够。实际项目继续调用 reducer，使库存上限等规则集中管理。对应的已有回归同时检查旧值与身份。

</details>

### 练习 3：演示项目，交一张个人补缺表

用阶段 4 做一次不看源码的演示：说明初始值，编辑 P002，保存快照并刷新，进入详情再返回。拿出 C45 的一条排错记录、C47 的风险计划及一条测试结果，说明它们分别证明了什么。

然后把十题中低于 2 分的项目填进第 5 节补缺表，给最弱的两项安排具体日期；选择一条深化路线，写出一周内可展示的小交付。

<details>
<summary>提示</summary>

项目演示里要说明“本地商品”和“模拟远端副本”各来自哪里。补缺任务写到操作和可见结果，例如“快速切换详情最后保持 P002”，而不是“继续学习异步”。

</details>

<details>
<summary>参考答案</summary>

演示示例：初始 6 种、52 件、26348.00 元；把 P002 库存改为 3、单价改为 0.29 元，保存后为 55 件、26348.87 元；保存本地快照再刷新仍保持。上部本地详情为 3 件，下部 mock 仍从 0 件、129.00 元起步。

排错记录包含复现、根因、修复和确认；风险计划把后果映射到测试层级；运行结果说明具体断言通过。补缺表示例见第 5 节，但你的分数和日期应来自自己的操作。后续小交付可以是“给分页响应增加字段校验并补一条失败重试测试”。

</details>

## 项目进度

从 `examples/inventory/04-react/` 的 C47 状态开始，保留现有工程、锁文件和业务实现。本课用独立示例复用阶段 1 与阶段 4，不新增项目阶段。先在阶段目录运行 `npm ci`，再运行：

```sh
npm run lint
npm test
npm run test:e2e:pages
npm run preview:pages
```

前三项结束后，最后一项启动严格静态预览。打开 `http://127.0.0.1:4179/js_web/#/products`，按练习 3 演示。初次缺少浏览器时，在该目录执行 `npx playwright install chromium` 后重试；预览与 E2E 共用端口，先结束预览再重跑测试。

:::tip[自己尝试 · 本地 React]
1. 确认自己的快照已备份后，用应用的“清除本地快照”并刷新，检查初始 6 种、52 件、26348.00 元。
2. 按练习 3 修改 P002、保存商品与本地快照，再刷新、进入本地详情并返回。
3. 以键盘完成一次编辑，在 360px 视口检查错误说明、焦点与保存按钮；记录当前环境及结果。

预期：修改后为 55 件、26348.87 元，刷新可恢复；本地详情与独立 mock 的来源讲得清，列表无整体横向滚动。
:::

保留运行入口、风险计划、故障记录、回归结果和补缺表。七阶段运行方法见各自 README；课程 Pages 发布静态正文，阶段应用本地运行，个人部署沿用 C46。

## 小结

- 先分清语言、引擎、宿主、工具与 UI，再判断 API 和命令应该在哪里用。
- 默认值、对象身份、闭包、this、异步与 React 更新都能用具体结果检查。
- 项目演示、排错记录和测试计划一起说明你能解释、修复并交付什么。
- 读更新时分别检查标准状态、环境支持和项目采用方案。
- 个人补缺表把薄弱机制变成有日期、可重做的任务，后续只选一条深化路线。

自测：

1. 为什么 Node 有 fetch，仍不能用 document 渲染页面？
2. 为什么一个新数组仍可能破坏 React 的旧状态？
3. 怎样证明一个新 API 适合自己的目标环境？
4. 你的两个最弱机制是什么，下次怎样证明已补上？

48 课主线结束，带着补缺表继续改进库存项目。

## 延伸阅读

- [MDN：面向其他语言使用者的 JavaScript 概览](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Language_overview)
- [React：state 是一份快照](https://react.dev/learn/state-as-a-snapshot)
- [MDN：Baseline 与浏览器兼容范围](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility)
- [Node：发行与维护阶段](https://nodejs.org/en/about/previous-releases)
- [React：版本与发布说明入口](https://react.dev/versions)
- [TC39：已完成提案与预计收录年份](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
