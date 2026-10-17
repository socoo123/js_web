---
title: C20 构建工具与第一次 UT
description: 用 Vite 构建原生库存页，从 source map 回到源码，用 Vitest 检查统计、边界和错误输入。
sidebar:
  order: 20
---

> **第 2 周 · 第 10 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C08、C16–C19 · 运行：Node 24、Chrome · 示例已运行验证

## 这一课解决什么问题

库存页已经能筛选、编辑和保存。现在你想把它交给别人：要复制哪些文件？浏览器下载的 JS 被压成一行以后，断点设在哪里？同事改了低库存统计，又怎样尽早发现「售罄也被算进低库存」？

这三件事分别需要构建产物、源码映射和测试。

学完你能：

- 分清开发服务、生产构建和本地预览，找到能交给静态服务器的目录
- 区分转译、打包、类型检查和运行测试
- 在构建后的库存页中，通过 source map 对源码设断点
- 用 Vitest 写正常、空集合、非法值和边界测试，读懂失败信息
- 解释为什么 TypeScript 类型写错了，Vite 仍可能构建成功

材料在 [examples/c20](https://github.com/socoo123/js_web/tree/main/examples/c20)，工程在 [库存项目阶段 3](https://github.com/socoo123/js_web/tree/main/examples/inventory/03-tooling)。Vite、Vitest、TypeScript 都是阶段 3 的开发依赖；进入该目录执行 npm ci 按锁安装。

## Java 程序员先看这里

| Java 经验 | 本课对应 | 差异 |
| --- | --- | --- |
| Maven 启动开发插件 | npm run dev 调用 Vite | npm 读取 scripts，具体工作由 Vite 完成 |
| 编译和打包 | 转译、打包、输出 dist | 浏览器最终执行 JS；构建不等于类型检查 |
| JUnit 的测试方法与断言 | it、expect | 测试也是 JS，Vitest 负责发现、执行和汇总 |
| 调试字节码时看源码 | source map | 把生成代码的位置映射回原文件，需要对应的映射文件 |
| Java 类型检查 | TypeScript 的 tsc | TS 类型会被擦除，JSON 仍需要运行时校验 |

## 1. Vite：开发时服务源码，交付时生成产物

[Vite](https://vite.dev/guide/) 提供开发服务和生产构建。开发时，它处理浏览器请求的模块、更新页面；构建时，它从 HTML 入口追踪 import 和资源引用，生成静态文件。

阶段 3 的 package.json 保留 report、versions，并增加这些 scripts：

```json
{
  "dev": "vite --config vite.config.js",
  "build": "vite build --config vite.config.js",
  "preview": "vite preview --config vite.config.js",
  "test": "vitest run",
  "test:watch": "vitest --watch"
}
```

这是 scripts 对象的一部分。Node 执行 Vite，浏览器执行页面业务 JS。

在 examples/inventory/03-tooling 执行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

打开终端给出的地址，通常是 `http://127.0.0.1:5173/js_web/`。无本地副本时，页面显示 6 种商品、52 件、26348.00 元。修改 CSS 并保存，开发服务会把变化送到浏览器；其他文件的更新可能触发整页刷新。

对照 Java：开发插件启动后，交付物还需要另行构建。

### 四种动作分别检查什么

| 动作 | 输入与结果 | 能回答的问题 |
| --- | --- | --- |
| 转译 | TS、JSX 或某些 JS 语法 → 浏览器可执行的 JS | 语法怎样变成目标形式？ |
| 打包 | 沿依赖图合并、拆分模块并处理资源 | 页面运行需要哪些文件？ |
| 类型检查 | 分析类型关系，报告不匹配 | 声明接收数字的参数，是否传了字符串？ |
| 测试 | 实际执行选定输入并断言结果 | 这批业务情形是否符合约定？ |

**先猜一猜：** 把低库存条件误写为 stock <= 5，代码语法完全合法，npm run build 会因此失败吗？

通常不会。打包器能处理这段代码，却不知道「低库存排除售罄」的业务约定。测试要用输入 0 和预期结果 0 把约定写出来。

转译也有边界：改写语法与补上内建 API 是两回事。默认构建不会自动为旧浏览器补出 Array.prototype.toSorted，也不会让浏览器获得 node:fs。目标浏览器仍要支持业务代码使用的 API。[Vite 的兼容说明](https://vite.dev/guide/build#browser-compatibility)

## 2. 静态产物和 source map：从生成文件回到源码

本课直接构建阶段 2 的页面，保持一份业务源码。阶段 3 的 vite.config.js 指定入口、产物和映射：

```js
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("../02-web/", import.meta.url)),
  base: "/js_web/",
  server: { fs: { allow: [fileURLToPath(new URL("../../", import.meta.url))] } },
  build: {
    outDir: fileURLToPath(new URL("./dist/", import.meta.url)),
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0,
  },
});
```

root 指向阶段 2，所以入口是它的 index.html；outDir 指向阶段 3 专用的 dist。路径按配置文件的位置计算，沿用 C17 的模块 URL 写法。emptyOutDir 让每次构建清理这个产物目录；自己的源码应放在目录外。server.fs.allow 允许开发服务读取 examples 内的兄弟模块。

base 表示页面部署在 /js_web/ 下，Vite 会调整它能识别的 HTML、CSS 和 JS 资源引用。assetsInlineLimit 为 0 让小资源也输出为文件，方便在 Network 观察库存 JSON 请求。阶段 2 的 `new URL("./products.json", import.meta.url)` 保持原样，构建会处理这个静态资源引用。[资源处理](https://vite.dev/guide/assets)

在阶段 3 执行 npm run build，再执行 npm run preview。打开终端地址，通常是 `http://127.0.0.1:4173/js_web/`，会看到同一个库存页面。产物大致如下，摘要随内容变化：

```text
dist/
  index.html
  assets/index-摘要.js、index-摘要.css
  assets/download-摘要.js
  assets/products-摘要.json
  assets/对应的.js.map
```

download 是动态 import 的下载模块，所以仍可能单独输出。dist 内的 HTML、JS、CSS 和 JSON 才是这次构建的交付物；运行页面不需要把 node_modules 一起复制。用 HTTP 服务预览产物，浏览器就能加载模块和资源。

preview 读取已有 dist。它适合本地检查构建结果，官方将它定位为预览工具；真正部署时由静态托管服务提供这些文件。[Vite 静态部署说明](https://vite.dev/guide/static-deploy)

### source map 保存位置关系

[build.sourcemap](https://vite.dev/config/build-options#build-sourcemap) 默认为 false。本课设为 true，生成独立 .map，并在 JS 中留下映射引用。Chrome 根据它把压缩代码的位置还原到原文件的行列；浏览器仍在执行生成的 JS。

:::tip[自己尝试 · 本地网页]
1. 在阶段 3 运行 npm run build、npm run preview，打开带 /js_web/ 的预览地址。
2. Chrome 按 F12。Settings → Preferences → Sources 中确认 Enable JavaScript source maps 已勾选。
3. 回到 Sources，按 Ctrl+P（macOS 用 Command+P），搜索 inventory.js，打开映射出的原文件。
4. 在 setStock 方法的 `product.stock = stock;` 行设断点。页面搜索 p002，编辑无线鼠标，把库存改为 3 并保存。
5. 暂停时在 Scope 查看 id 和 stock，再继续运行。

预期：断点停在可读的 inventory.js 中，id 为 P002、stock 为 3；继续后汇总变为 55 件、26735.00 元。可在 Application 删除 js_web:inventory:v1 后刷新，回到初始数据。
:::

源码和 .map 必须来自同一次构建。DevTools 的临时改动通常不会写回项目，修复要保存到源文件。

## 3. 第一条 UT：让业务规则成为可执行的断言

UT 是单元测试。这里选 Inventory.summary 作为单元：给它已校验的商品，检查统计结果。测试直接 import 业务模块，省去页面、点击和网络。

tests/summary.test.js 从这个用例开始：

```js
import { describe, it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { Inventory } from "../../01-core/inventory.js";

describe("Inventory.summary", () => {
  it("统计固定商品的库存、金额和状态", () => {
    const inventory = new Inventory(structuredClone(products)); // Arrange
    const summary = inventory.summary(); // Act
    expect(summary).toEqual({ // Assert
      totalStock: 52,
      totalValueCents: 2634800,
      soldOutCount: 1,
      lowStockCount: 2,
    });
  });
});
```

在阶段 3 执行 `npm test -- tests/summary.test.js`。参考文件还包括空数组、边界和输入不变测试，结果是 7 个用例通过。

AAA 是 Arrange、Act、Assert：准备输入，执行业务，断言结果。每个修改库存的测试都建自己的商品副本，避免上一条测试把固定数据改掉。断言里的 52 和 2634800 来自业务样例的独立参考值；若把实际结果复制成预期值，就失去了发现错误的机会。

describe 给相关测试分组；it 定义一个用例，也可写作 test；expect 把实际结果交给断言。[Vitest 入门](https://vitest.dev/guide/)会自动发现常见的 .test.js、.spec.js 文件。本工程在 vitest.config.js 中把正常入口明确限定为 tests/**/*.test.js。

对照 JUnit：it 类似测试方法，expect 类似 Assertions。修改测试时运行 npm run test:watch，保存后自动重跑；按 q 退出。npm test 只运行一轮，适合交付检查。

### 数字用 toBe，对象内容用 toEqual

**先猜一猜：** 两次空库存统计的字段都为 0，下面两行分别打印什么？在 examples/c20 执行 node identity.js 核对。

```js title="identity.js"
import { Inventory } from "../inventory/01-core/inventory.js";

const first = new Inventory([]).summary();
const second = new Inventory([]).summary();
console.log(first === second);
console.log(JSON.stringify(first) === JSON.stringify(second));
```

输出依次为 false、true。两个对象内容相同，身份不同。测试里用 `expect(first).toBe(second)` 会失败，因为 toBe 使用 Object.is；用 `expect(first).toEqual(second)` 才会递归比较内容。[断言参考](https://vitest.dev/api/expect)

JSON.stringify 这里只用于观察；正式断言用 toEqual，能获得字段差异。它接近 Java 值对象内容比较的意图，JS 对象没有自动生成 equals。

### 先让测试失败，再修业务

labs/low-stock.js 保留一个容易漏掉的错误：

```js
// 有问题的写法：把售罄商品也计入低库存
export function countLowStock(products) {
  return products.filter(product => product.stock <= 5).length;
}
```

labs/low-stock.test.js 用固定业务约定检查它：

```js
import { it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { countLowStock } from "./low-stock.js";

it("低库存有两种，售罄另算", () => {
  expect(countLowStock(products)).toBe(2);
});
```

在阶段 3 执行 npm run test:bug，结果非零退出，报告 Expected 为 2、Received 为 3，并指向断言所在行。报错说明实际执行得到 3；接下来检查筛选条件为什么多收了一条。

:::tip[自己尝试 · Node]
1. 运行 npm run test:bug，读 Expected、Received 和文件行号。
2. 按下面的修复修改 labs/low-stock.js，保持测试中的预期值 2。
3. 再运行同一命令，然后运行 npm test。

预期：实验从 1 条失败变成 1 条通过，正常测试也全部通过。仓库保留错误起点，便于你重新练习。
:::

修复后的函数如下，参考文件在 examples/c20：

```js title="low-stock-fixed.js"
export function countLowStock(products) {
  return products.filter(product => product.stock > 0 && product.stock <= 5).length;
}
```

先红后绿验证的是：测试确实能抓到这个错误，然后修复恢复约定。把预期改成 3 也会变绿，却改坏了规则。

## 4. 选边界数据，让测试发现真正的错

正常样例只能覆盖它经过的分支。低库存要求是 1–5 件，因此最有价值的四个数字是 0、1、5、6：下边界外、下边界、上边界、上边界外。

tests/summary.test.js 用 it.each 复用同一个测试体，products 和 Inventory 沿用前面的导入：

```js
it.each([[0, 0], [1, 1], [5, 1], [6, 0]])(
  "库存为 %i 时低库存计数为 %i", (stock, expected) => {
    const row = { ...products[3], stock };
    expect(new Inventory([row]).summary().lowStockCount).toBe(expected);
  },
);
```

四行数据生成四个独立用例。只测 3，就发现不了 `< 5` 把 5 漏掉，也发现不了 `<= 5` 把 0 算进去。

### 空集合和非法输入是两种契约

空数组表示当前没有商品，统计字段都应为 0；null、undefined 或字符串库存表示输入不符合结构或字段要求。它们应在入口校验时失败。

Inventory.summary 接收已经建立好的库存。外部 JSON 的非法输入测试放在 createReport 的入口，因为它会先调用 validateProducts。tests/report.test.js 中有：

```js
it.each([null, undefined, {}])("非数组 %s 抛出错误", rows => {
  expect(() => createReport(rows)).toThrow("商品数据应为数组");
});
```

三条都通过。传给 expect 的是函数，Vitest 调用它时才能捕获异常。如果写成 `expect(createReport(null))`，错误会在创建断言之前抛出。

tests/stock.test.js 还检查库存 0、99999 合法，负数、小数、字符串和超上限值被拒绝，并确认拒绝后原库存、撤销栈都不变。这比只测试「抛过一个错」更接近实际业务要求。

这相当于 JUnit 参数化测试，用表格集中表达边界。

### 异步结果要等待

测试 Promise 时，返回或 await 异步工作，运行器才会等结果。tests/async.test.js 包括成功和失败两条：

```js
it("等待加载成功再读取统计", async () => {
  const inventory = await loadInventory(products, { delayMs: 0 });
  expect(inventory.summary().totalStock).toBe(52);
});

it("加载失败向调用方传递错误", async () => {
  await expect(loadInventory(products, { fail: true, delayMs: 0 }))
    .rejects.toThrow("库存加载失败");
});
```

两条通过。rejects 检查 Promise 拒绝；toThrow 在这里继续检查错误信息。漏掉 await，测试体可能先结束，异步断言和失败就无法按预期归属于当前用例。

这里用 C12 的可控加载，不请求网络，不用固定 sleep。纯逻辑直接测试，外部服务再考虑注入或 mock；mock 掉统计函数，会绕过要检查的代码。

阶段 3 使用 Node 测试环境，所以这些测试能验证统计与校验，不会测出 CSS 溢出、浏览器请求路径或真实点击错误。这些行为仍要在页面检查；需要组件交互时再选择相应测试层级。

## 5. TypeScript 短桥接：能转成 JS，不等于类型正确

TypeScript 在 JS 上增加类型描述。参数名后的 `: number` 表示这里应接收数字；返回括号后的 `: number` 描述返回值。看 type-bridge/broken.ts 的关键部分：

```ts
// 有问题的写法：把字符串传给声明接收 number 的参数
function restock(stock: number, amount: number): number {
  return stock + amount;
}

const incoming: string = "3";
const result = restock(12, incoming);
console.log(result);
```

类型检查会报告 incoming 是 string，不能传给 number 参数。[Vite 的 TS 支持](https://vite.dev/guide/features#typescript)只做转译，把类型语法擦掉；没有额外检查步骤时，上述代码仍会变成 JS，并打印 123。

在阶段 3 执行下面的独立实验，预览使用另一个端口：

```sh
npm run build:bridge
npm run check:bridge
npm run preview:bridge -- --port 4174
```

预期：build:bridge 成功，check:bridge 报 TS2345 并非零退出；预览地址 /js_web/ 中显示「补货后库存：123」。构建成功只说明它生成了产物。

check:bridge 调用 tsc，配置里的 noEmit 为 true，意思是只检查、不输出 JS。把调用改为 `restock(12, Number(incoming))` 后，检查通过；重新构建并刷新，显示 15。真实表单仍要保留 C03 的非空、整数和范围校验。

TS 的类型不会留在运行时，所以也不会替你检查后端 JSON。[TypeScript 的类型擦除说明](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types)解释了这条边界。业务项目继续使用 JS；这份小实验只帮助你识别工具职责。

## 常见错误与调试

### 低库存测试多出一种商品

**现象**：npm run test:bug 报 expected 3 to be 2。

**工具**：在终端先读 labs/low-stock.test.js 的失败行，再打开 labs/low-stock.js；用固定数据逐项套进筛选条件。

**证据**：P002 为 0，P004 为 3，P006 为 5，三条都满足 stock <= 5。

**原因**：只写了上界，遗漏低库存须有货的下界。

**修复**：把条件改成 stock > 0 && stock <= 5，保留预期值 2。

**确认**：原失败用例通过；再运行 npm test，其中 0、1、5、6 的参数化回归测试检查两端边界。

### 源码保存了，preview 仍显示旧页面

**现象**：修改阶段 2 的页面或业务源码后刷新 preview，仍看到旧行为。

**工具**：Network 关闭缓存并刷新，查看实际加载的 /js_web/assets/ 文件；在 Sources 查看映射出的源码。

**证据**：请求来自已有 dist，映射内容也还是上次构建的代码。

**原因**：preview 服务构建目录，保存源码不会自动重建它。

**修复**：回到阶段 3 运行 npm run build，再刷新预览。

**确认**：新产物包含改动，映射源码与编辑器一致，原断点仍能命中。开发中需要保存即更新时，使用 npm run dev。

## 练习

### 练习 1：预测四种检查的结果

从 type-bridge/broken.ts 的原始版本开始，预测 build:bridge、check:bridge、浏览器输出。再回答：如果给这个补货函数加一条「输入数字 3，结果为 15」的测试，它能发现调用处传字符串的问题吗？

验收：先写预测再运行，解释为什么几项观察可以同时成立。

<details>
<summary>提示</summary>

分别看语法转换、类型关系、运行时值、测试选用的输入。

</details>

<details>
<summary>参考答案</summary>

构建成功；类型检查失败；浏览器显示 123。类型被擦掉后仍是数字加字符串，运行时发生拼接。

只测数字 3 的单测会通过，因为函数对这条输入正确。要发现调用处的问题，可由类型检查指出参数不符，再用输入边界或调用链测试覆盖真实数据。单测结果受所选输入和边界限制。

</details>

### 练习 2：修复并守住低库存边界

从 labs/low-stock.js 开始，先复现失败再修复。在 labs/low-stock.test.js 加入空数组，以及库存 0、1、5、6 的参数化测试。

验收：修复后 6 条实验测试通过；临时去掉 > 0，0 的用例失败；临时把 <= 5 改成 < 5，5 的用例失败。最后恢复正确实现。

<details>
<summary>提示</summary>

原有固定样例 1 条，加空数组 1 条，再加四行边界数据。每行只需一件商品。

</details>

<details>
<summary>参考答案</summary>

函数采用第 3 节的修复。空数组断言 `expect(countLowStock([])).toBe(0)`；边界表使用第 4 节的数据，把断言对象换成 countLowStock([{ ...products[3], stock }])。

两个临时改动分别破坏下界和上界，测试应指出对应输入。恢复后再运行 npm test，保持实验和正常回归都通过。

</details>

### 练习 3：从构建产物回到补货源码

按第 2 节构建和预览，在映射后的 setStock 源码设断点，把 P002 从 0 改成 3。验收：能说出暂停时两个参数的值；继续后是 55 件、26735.00 元；解释页面为什么没有请求源目录中的 app.js。

<details>
<summary>提示</summary>

看 Network 的 JS 请求与 Sources 展示的文件，两者可以有不同名称。

</details>

<details>
<summary>参考答案</summary>

id 是 P002，stock 是数字 3。页面请求构建出的 JS 文件，source map 让工具展示对应源文件，并把源码断点换算到生成代码位置。执行对象仍是构建产物；业务源码改变后需要重新构建。

</details>

## 项目进度

从 C18 的 examples/inventory/03-tooling 继续。package.json 和本目录锁文件增加 Vite、Vitest、TypeScript 开发依赖；新增构建配置、测试配置、tests、labs 和 type-bridge。report、versions 与 Node 报表继续保留。

构建入口复用 ../02-web/index.html，业务仍复用 ../01-core/inventory.js。无需复制或改写阶段 2 页面。正常回归在 tests，故意失败的起点在 labs；两个测试配置分别选择各自目录。TypeScript 实验也使用独立入口。

在阶段 3 依次执行：

```sh
npm ci
npm run report
npm test
npm run build
npm run preview
```

预期：报告仍为 52 件、2634800 分；4 个测试文件、38 条用例通过；dist 生成页面、资源和映射文件；预览可筛选、编辑、刷新恢复，初始值与报告一致。若当前浏览器有保存的库存，先恢复初始数据再对照。

正常交付检查使用 npm test、npm run build。test:bug 和 check:bridge 是留给你观察失败的实验入口，原始版本会非零退出。网站工程仍使用根目录自己的 npm 清单和锁；阶段 3 依赖在本目录安装，测试单独运行。

## 小结

- dev 服务开发源码；build 输出静态产物；preview 读取已生成的 dist。
- 转译、打包、类型检查和测试各有职责，构建成功不说明业务规则正确。
- source map 让生成代码的位置对应到源码，源码和映射要与产物匹配。
- Vitest 用 AAA 组织测试，数字用 toBe，对象内容用 toEqual，异常与异步结果要正确捕获和等待。
- 选择正常、空集合、非法输入和边界用例；先看失败，再修业务并保留回归。

自测：

1. 保存源码后，为什么 preview 仍可能显示旧版本？
2. 两个统计对象字段相同，为什么 toBe 会失败？
3. 为什么低库存要测试 0、1、5、6？
4. 为什么 toThrow 要接收函数，rejects 前通常要 await？
5. Vite 构建 TS 成功，为什么 tsc 仍会报错？

下一课开始 React：用 JSX 和函数组件表达商品卡片，把原生页面中的界面结构交给 React 管理。

## 延伸阅读

- [Vite：入门与开发命令](https://vite.dev/guide/)
- [Vite：构建与公共基础路径](https://vite.dev/guide/build)
- [Chrome DevTools：source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps)
- [Vitest：入门与运行测试](https://vitest.dev/guide/)
- [Vitest：expect 断言](https://vitest.dev/api/expect)
- [TypeScript：基础类型与类型擦除](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
