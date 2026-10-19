---
title: C16 模块、依赖与组织代码
description: 用 ES 模块拆分库存页，理解导入导出、加载路径与循环依赖，复用浏览器和 Node 的业务代码。
sidebar:
  order: 16
---

> **第 2 周 · 第 8 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C07、C12–C15 · 运行：Node 24 或本地网页 · 示例已运行验证

## 这一课解决什么问题

库存页已经能筛选、编辑、保存和恢复，可请求、校验、存储、DOM 和事件全挤在 app.js 中。想把总库存计算拿去生成 Node 报表，却发现它连着 document；直接复制，以后修一处就得改两处。

这一课按职责拆分文件，复用上一阶段的 Inventory。同时弄清为什么同一个导入在 Node 能执行，在浏览器却找不到模块。

学完你能：

- 写出具名导出、默认导出、重命名导入和按需的动态导入
- 解释模块自己的作用域、活绑定、初始化顺序与循环依赖
- 区分浏览器的 URL 解析、Node 的包解析与 npm 安装依赖
- 读懂 require / module.exports，并复用同一份 ESM 库存逻辑
- 用标准状态、兼容表和目标运行时判断一个 API 能否使用

例子在 [examples/c16](https://github.com/socoo123/js_web/tree/main/examples/c16)。纯 JS 文件在该目录用 node 运行；浏览器实验沿用仓库根目录的静态服务。跟做时保留目录结构。

## Java 程序员先看这里

| Java | JavaScript | 差异 |
| --- | --- | --- |
| import 某个类 | import 模块导出的值 | 可导入函数、类、对象和原始值；模块还会执行顶层代码 |
| package 与 public | 文件作用域与 export | 文件名构成模块位置，是否导出决定外部能否导入 |
| Maven 下载 jar | npm 安装包，运行时或构建工具解析入口 | 安装与加载是两步；浏览器原生加载通常沿 URL 找文件 |
| 类路径上的库 | ESM / CommonJS 两种模块形式 | 文件形式和宿主决定加载规则，不能只看扩展名猜环境 |

## 1. 导出什么，外部才能导入什么

ESM 是 ECMAScript Modules，使用 [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) 与 [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) 建立文件之间的依赖。一个模块可以有多个**具名导出**，最多一个**默认导出**。

format.js 把整数分转成显示文本，没有使用宿主专属 API。

```js title="format.js"
export const currency = "CNY";

export default function formatMoney(priceCents) {
  return "¥" + (priceCents / 100).toFixed(2);
}
```

文件没有打印输出，提供 currency 和 default 两个出口。默认导出的函数叫 formatMoney。

```js title="imports.js"
import money, { currency as unit } from "./format.js";
import { products } from "../shared/products.js";

console.log(unit, money(products[0].priceCents)); // → CNY ¥399.00
console.log(products.length); // → 6
```

输出 `CNY ¥399.00` 和 `6`。money 接收默认导出，名称可自取；currency 要匹配具名导出，as 才能改名。花括号是导入语法，不是对象解构。

默认导出不自动创建具名导出；两种写法要分别声明。

Java 的 import 主要引入类型或静态成员名称，JS 导入的是运行时值，普通函数也能成为模块接口。

## 2. 模块有自己的作用域，导入的是活绑定

模块顶层的名字只属于当前模块，export 才能让外部导入。模块自动使用严格模式，顶层 this 是 undefined；不同文件各自声明 keyword 不会冲突。

counter.js 留一个私有名称，再导出一个可变化的访问次数：

```js title="counter.js"
console.log("counter 初始化");
const privateName = "库存计数器";
export let visits = 0;
export function visit() { visits += 1; }
export function name() { return privateName; }
```

**先猜一猜：** live.js 导入了同一文件两次，初始化会打印几次？snapshot 会不会跟着 visits 增加？

```js title="live.js"
import { visits, visit, name } from "./counter.js";
import * as counter from "./counter.js";

const snapshot = visits;
visit();
console.log(visits, counter.visits, snapshot); // → 1 1 0
console.log(name()); // → 库存计数器
console.log(typeof globalThis.privateName); // → undefined
console.log(this === undefined); // → true
```

输出依次为 `counter 初始化`、`1 1 0`、`库存计数器`、`undefined`、`true`。依赖的 counter.js 先初始化，再执行入口文件的顶层语句；两种导入形式解析到同一个模块实例，所以初始化只打印一次。

`visits` 是**活绑定**：导出方改变绑定的值，导入方再读取时能看到新值。`const snapshot = visits` 则进行了一次普通赋值，把当时的数字 0 存下来，所以保持 0。模块命名空间上的 counter.visits 也能看到当前值。

导入方只能读取绑定：readonly.js 中 `visits = 9` 抛 TypeError，调用 visit 则读到 1。对象字段仍可修改，导入并不冻结对象。

模块共享限于当前页面或进程，不同查询参数的 URL 可能产生不同实例。

### 静态导入和动态导入

静态 import 位于模块顶层，路径是字符串字面量。宿主在执行入口之前加载并连接依赖；把声明移到末尾也不会推迟依赖初始化。

[`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) 是表达式，运行到这里才发起导入，返回 Promise，成功值是模块命名空间。它适合点击导出后才需要的下载功能，或只在特定操作下打开的重型工具。

**先猜一猜：** dynamic.js 的「准备导入」和 report.js 的「report 初始化」，哪句先出现？第二次 import 会不会再次初始化？

```js title="dynamic.js"
import { products } from "../shared/products.js";

console.log("准备导入");
const report = await import("./report.js");
console.log(report.totalStock(products));
const again = await import("./report.js");
console.log(report === again);
```

输出为 `准备导入`、`report 初始化`、`52`、`true`。运行到 import() 后才加载并执行 report.js，await 等待这一步完成；同一模块再次导入复用已有实例。report.totalStock 是导出的函数，导入成功后才调用它。

动态导入失败会拒绝 Promise，可以用 try/catch 提示。静态依赖失败时，入口可能尚未执行，其普通语句中的 try/catch 接不到错误。Java 的 import 声明没有这种 Promise 加载结果。

## 3. 路径由谁解析，决定模块能否找到

### 浏览器按 URL 找文件

网页只需要加载入口脚本，依赖由入口里的 import 继续找到：

```html
<script type="module" src="./app.js"></script>
```

它替换原来的 defer 经典脚本。没有 async 的模块脚本默认等 HTML 解析完成后执行，依赖无需另写 script 标签。浏览器按 type 选择解析模式，不读取 package.json。

:::tip[自己尝试 · 本地网页]
在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c16/browser.html`。

预期显示 **6 种 · 52 件 · ¥26348.00**。用 HTTP 打开；file 地址可能受模块安全限制。
:::

import 的相对路径以**写下它的模块 URL**为基准，不以浏览器地址栏中的 HTML 为基准。api.js 想定位和自己放在一起的 JSON，可以使用 `new URL("./products.json", import.meta.url)`，再把 URL 交给 fetch。这里明确了文件归属；裸写 `fetch("./products.json")` 在网页里则按文档的 base URL 解析。

```js title="urls.js"
const base = "https://example.com/js_web/examples/inventory/02-web/app.js";
console.log(new URL("../01-core/inventory.js", base).pathname);
console.log(new URL("/inventory.js", base).pathname);
```

输出为 `/js_web/examples/inventory/01-core/inventory.js` 和 `/inventory.js`。前者保留项目子路径；后者以站点根目录起算，丢掉了 `/js_web/`。这正是 Pages 页面在本地根路径能打开，上线却 404 的常见原因。

相对导入写全 `./`、扩展名和大小写。浏览器不会自动补 .js 或尝试目录入口，部署环境还可能区分大小写。

### 裸名称和包解析

`import ... from "react"` 中的 react 叫**裸模块标识符**，它既不是相对 URL，也不是绝对 URL。Node 会按自己的包规则找到已安装依赖的入口；浏览器原生模块加载器需要 import map 把裸名称映射成 URL，或者由构建工具处理。

打开 c16 的 bare.html，会看到 Failed to resolve module specifier。mapped.html 在入口之前增加 import map，将 course-money 映射到 ./format.js，同样的 bare.js 就会显示 ¥399.00。import map 提供的是映射表，没有替你下载或安装一个包。

npm 安装依赖；Node 解析包入口；构建工具可解析和打包浏览器依赖；浏览器加载资源。ESM 规定语言形式，解析位置涉及宿主规则。Java 的 Maven 与类加载器也分工，浏览器还涉及 URL 和 HTTP。

### 看懂旧项目的 CommonJS

Node 还支持 CommonJS。下面两份 .cjs 文件分别提供计算函数和报告函数：

```js title="legacy-total.cjs"
function totalStock(products) {
  return products.reduce((sum, product) => sum + product.stock, 0);
}
module.exports = { totalStock };
```

```js title="legacy-report.cjs"
const { totalStock } = require("./legacy-total.cjs");
module.exports = products => "库存 " + totalStock(products) + " 件";
```

`require()` 在这里同步加载模块，返回 module.exports 的值；导出一个函数，导入方就得到函数。

在 Node 的 ESM 文件中，可以用默认导入接收这份 CommonJS 导出：

```js title="commonjs.js"
import report from "./legacy-report.cjs";
import { products } from "../shared/products.js";

console.log(report(products)); // → 库存 52 件
```

输出 `库存 52 件`。这是 Node 提供的互操作，浏览器原生模块里没有 require 和 module。一个 .cjs 文件即使能通过 HTTP 下载，也不会因此变成浏览器能运行的 ESM。

Node 中 .mjs 是 ESM，.cjs 是 CommonJS，.js 看最近的 package.json 等规则。本仓库已有 `"type": "module"`，所以 .js 使用 ESM。Java 没有这两套解释方式，迁移时要看项目声明。

## 4. 按职责组织依赖，让业务逻辑可以复用

先确定谁依赖谁。统计接收商品、返回结果；页面把输入交给业务，再显示结果。计算总价无需加载按钮。

![模块依赖图：app 静态导入阶段 1 的 inventory.js，点击导出后动态导入 download.js；箭头指向依赖方。](../../../assets/diagrams/c16-esm-dependencies.svg)

先读上半部：图画出业务复用与按需下载两条依赖，完整拆分见下表。虚线在点击导出后才加载，位置不表示请求的时间顺序。下半部的包安装流程在 npm 课使用。

本课把 C15 的 app.js 拆为以下职责：

| 文件 | 职责 |
| --- | --- |
| ../01-core/inventory.js | 库存查询与统计，无宿主专属 API |
| validation.js | 校验并复制商品，解析库存输入 |
| storage.js | 快照编解码，调用时读写 localStorage |
| api.js | fetch JSON 并校验 |
| view.js | 筛选、列表与汇总的 DOM 显示 |
| download.js | 将 JSON 发起为浏览器下载 |
| app.js | 事件与状态协调 |

纯业务模块的顶层也只处理数据。Inventory 因此可以在 Node 复用；validateProducts 复制商品与 tags，让候选修改独立于原库存。

```js title="project-report.js"
import { Inventory } from "../inventory/01-core/inventory.js";
import { products } from "../shared/products.js";
import { validateProducts } from "../inventory/02-web/validation.js";

const inventory = new Inventory(validateProducts(products));
console.log(inventory.count(), inventory.summary().totalStock);
console.log(inventory.summary().totalValueCents);
const next = new Inventory(validateProducts(inventory.select(() => true)));
next.setStock("P002", 3);
console.log(next.summary().totalStock, inventory.getById("P002").stock);
```

输出 `6 52`、`2634800`、`55 0`。候选库存把 P002 改成 3，原库存仍为 0。Inventory 构造器只复制数组，这里还复制每个商品对象，保持数据独立。

Java 也会分离业务与页面；JS 可以直接导出函数，无需每个模块都写一个类。

### 循环依赖为什么危险

若 a 导入 b，b 又导入 a，就形成循环。ESM 可以连接循环依赖，但在初始化时读取尚未初始化的 let/const/class 绑定，仍会遇到 C04 的暂时性死区。

```js
// cycle-a.js
import { suffix } from "./cycle-b.js";
export const title = "库存";
export const heading = title + suffix;

// cycle-b.js
import { title } from "./cycle-a.js";
export const suffix = title + "报表";
```

运行 `node cycle.js` 得到 ReferenceError，堆栈指向 cycle-b.js 读取 title 的一行。入口先进入 a 的依赖 b，b 又需要 a 的 title，可 a 的赋值还没执行。

将共用数据或函数提到第三个基础模块，让双方依赖它。例如 storage 与 api 都依赖 validation，后者无需反向导入 app。移动 import 行号不会改变依赖图。

## 5. 新特性能否使用，要分别回答三个问题

看到“最新 ES 的 API”，分别问：标准状态是什么、目标环境是否实现、项目是否允许依赖它。

**正式标准**是某个已经发布的 ECMAScript 年度版本。**Stage 4** 表示提案流程已完成，年度归属还需看实际出版版本；Stage 0、1、2、2.7、3 属于不同成熟度的在研提案。某个浏览器提前实现一个功能，也不会替所有环境作出保证。

用两个与你的库存项目直接相关的 API 跟做：toSorted 用来保留原数组顺序，Map.groupBy 用来按分类分组。它们分别属于 ES2023 与 ES2024，都已经进入正式标准。

```js title="support.js"
import { products } from "../shared/products.js";

console.log(typeof Array.prototype.toSorted === "function");
console.log(typeof Map.groupBy === "function");
console.log(products.toSorted((a, b) => a.stock - b.stock)[0].id);
console.log(Map.groupBy(products, product => product.category).get("配件").length);
```

本课的 Node 24 中输出 `true`、`true`、`P002`、`2`：API 存在，售罄鼠标排在第一，配件分组包含两个商品。groupBy 接收数据和分组函数，返回 Map；它是静态方法，写作 Map.groupBy，而不是 products.groupBy。

先查 [toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) 与 [Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy) 的 Browser compatibility，匹配目标浏览器和 Node 版本，再运行短例子确认行为；子功能限制也要看。

`typeof` 可检测方法，无法检测解析器是否认识新语法。解析失败时，后面的 if 无法执行，需要转换语法或换用支持的写法。方法缺失则可用兼容实现，或显式循环。

:::tip[自己尝试 · Node]
1. 在终端运行 `node --version`，确认你正在查哪个主版本。
2. 在 examples/c16 运行 `node support.js`，并在两个 MDN 页面的兼容表记录目标浏览器与 Node 的支持版本。
3. 改用一个实际项目还需要支持的旧浏览器版本，分别给出“可直接用”或“需要替代实现”的结论。

预期：为两个 API 各写一句选择理由。结论同时包含目标环境和 API 名称，不只写“ES2023 已发布”。
:::

需要按年份查功能时，打开[ES 版本速查](../../reference/es-versions/)。这份索引把年度归属与环境支持分开，正文继续按库存问题学习。

像 Java 要确认目标 JDK，JS 也要确认运行时，还要覆盖目标浏览器。

## 常见错误与调试

### 页面一直停在“等待脚本”

**现象**：打开 c16 的 classic.html，页面不更新，Console 出现 Cannot use import statement outside a module。

**工具**：F12 → Console 点错误旁的文件链接，在 Sources 查看 browser.js；回到 Elements 查看页面的 script 标签。

**证据**：browser.js 第一行有 import，标签却只有 defer，没有 type="module"。Network 中脚本即使返回 200，也没有按 ESM 解析。

**原因**：defer 控制经典脚本的执行时机，没有改变解析模式。

**修复**：把 classic.html 的 script 改成第 3 节的 type="module" 形式。browser.html 已保存正确版本，可用来对照。

**确认**：刷新同一个地址，Console 中这条错误消失，页面显示 6 种、52 件和 ¥26348.00；Network 能看到 Inventory 与共享数据两个依赖请求。

### 模块拿到了，却没有这个导出

**现象**：在 examples/c16 运行 `node wrong-export.js`，提示模块没有名为 formatMoney 的导出，最后的 console.log 没执行。

**工具**：读终端给出的文件名与导入名称，再打开 format.js。浏览器遇到同类错误时，在 Network 选中模块，先看 Headers 的状态与 Content-Type，再看 Response。

**证据**：文件存在，但只有 default 和 currency 两个导出；formatMoney 只是默认导出函数自己的名称。

**原因**：具名导入与默认导入没有匹配。若证据是 404，则应先修路径；若返回的是 HTML，则要修服务器返回的资源和内容类型。

**修复**：去掉花括号，改成 `import formatMoney from "./format.js";`。漏扩展名的另一例 path-error.js 则要把 ./format 改为 ./format.js。

**确认**：分别重新运行两个文件，都输出 ¥399.00。浏览器中还应确认依赖请求为 200、返回 JavaScript，入口能继续执行。

## 练习

### 练习 1：预测初始化与活绑定

先写出每行输出，再运行 prediction.js。验收：解释为什么“counter 初始化”出现在“入口”之前，以及最后两个数字为何相同。

```js title="prediction.js"
import { visits, visit } from "./counter.js";

console.log("入口");
const before = visits;
visit();
console.log(before, visits);
const same = await import("./counter.js");
same.visit();
console.log(visits, same.visits);
```

<details>
<summary>提示</summary>

静态依赖先初始化；before 保存数字的当前值；动态导入相同 URL 复用模块实例。

</details>

<details>
<summary>参考答案</summary>

依次输出 `counter 初始化`、`入口`、`0 1`、`2 2`。before 记录初始的 0；两次 visit 都修改同一个导出绑定，visits 和 same.visits 因此都读到 2。第二次导入没有再次打印初始化。

</details>

### 练习 2：修好三种加载错误

复制 classic.html、wrong-export.js 和 path-error.js 后修改副本。验收：网页显示固定库存汇总，两个 Node 文件各打印 ¥399.00；写下三处错误分别发生在解析模式、导出匹配还是路径解析。

<details>
<summary>提示</summary>

HTTP 200 只说明取到了资源；仍需检查解析模式和导出接口。文件路径既要相对位置正确，也要写全扩展名。

</details>

<details>
<summary>参考答案</summary>

classic.html 加 type="module"；wrong-export.js 用默认导入；path-error.js 补 .js 扩展名。依次是经典脚本解析不了 import、模块没有请求的具名导出、相对模块路径没有对应文件。修好后重新执行原来的操作，分别核对页面与终端输出。

</details>

## 项目进度

从 C15 的 [examples/inventory/02-web](https://github.com/socoo123/js_web/tree/main/examples/inventory/02-web) 开始；该目录现在保存本课完成后的原生页面 v1。

保留 index.html 的控件与响应式 CSS，把脚本标签改为 type="module"。把字段检查和 parseStock 移到 validation.js，把快照与存储函数移到 storage.js，把请求函数移到 api.js，把列表和汇总渲染移到 view.js；各文件用具名导出，app.js 按第 4 节依赖图导入。

app.js 直接导入 `../01-core/inventory.js` 的 Inventory。把原数组的 filter、find 与 reduce 分别换成 select、getById 与 summary；view.js 同时复用 createCategoryFilter。saveProducts 在调用时使用浏览器存储，纯编解码函数在 Node 中也能运行。

保存库存时采用以下顺序，完整的事件绑定见 app.js：

```js
const next = new Inventory(validateProducts(inventory.select(() => true)));
next.setStock(selectedId, stock);
commitInventory(next);
```

这段在保存处理函数的 try 中。commitInventory 先写存储，成功后才切换当前库存并渲染。若先修改当前对象，写入失败也无法保留旧库存。

下载函数移到 download.js，导出时先生成 JSON，再动态导入函数。根目录启动静态服务，打开 `/examples/inventory/02-web/`，确保兄弟目录 01-core 也可访问。

恢复初始数据后核对 6 种、52 件、26348.00 元。搜索 p002，库存改为 3 后应为 55 件、26735.00 元；刷新、导出再导入应保留编辑。用 Application 把本项目存储改成损坏 JSON，刷新应提示并读取初始商品；在 Network 禁用缓存后确认 download.js 首次导出才加载。最后检查 360、768、1280px 的 1、2、4 列布局。

## 小结

- 具名导入匹配导出名称，默认导入可自己命名；接口匹配发生在模块连接阶段。
- 模块有独立作用域；导入的是只读的活绑定，相同模块实例共享初始化结果。
- 静态 import 先建立依赖，动态 import() 运行时返回 Promise；路径解析涉及宿主规则。
- 业务模块保持独立，页面协调请求、存储和显示；循环依赖中的过早读取会触发暂时性死区。
- 标准年份、提案阶段、环境支持分别查；支持判断要落到实际部署环境。

自测：

1. 默认导出的函数叫 formatMoney，为什么花括号导入可能失败？
2. snapshot 为何保持 0，导入的 visits 却变成 1？
3. 浏览器为什么不能直接加载一个已经用 npm 安装的裸包名？
4. 先改当前 Inventory、再写 localStorage，失败时会留下什么问题？
5. Stage 4 是否说明所有浏览器都已支持？

下一课系统认识 Node：同样的库存模块怎样读取本地文件、接收命令行参数并用 inspect 调试。

## 延伸阅读

- [MDN：JavaScript 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN：import 声明](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [MDN：动态 import()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Node 24：ECMAScript modules](https://nodejs.org/download/release/latest-v24.x/docs/api/esm.html)
- [Node 24：CommonJS modules](https://nodejs.org/download/release/latest-v24.x/docs/api/modules.html)
- [TC39：提案流程](https://tc39.es/process-document/)
