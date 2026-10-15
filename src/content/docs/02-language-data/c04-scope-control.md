---
title: C04 变量、作用域与控制流
description: 从 Java 库存统计迁移到 JavaScript，分清 let、const、var 与 TDZ，掌握分支和循环，并用断点查出越界后的 NaN。
sidebar:
  order: 4
---

> **课号 C04 · 第 1 周 / 第 2 天 · 必修**  
> 前置：[C03 值、类型、转换与比较](../c03-values-types/)，以及 C02 的 Console、Sources 基础；熟悉 Java 的变量、分支和循环。  
> 时间：阅读与跟做约 50 分钟，独立练习约 40 分钟。4 周路线与 C03 同一天，8 周路线单独一天。  
> 资料核查：2026-10-15。正文例子为标准语言能力，不要求提前安装 Node 或包管理器；逐项验证见课尾。

## 1. Java 代码看起来能照搬，为什么总数变成了 NaN？

现在要统计四种商品的库存 `[12, 0, 7, 3]`，正确总数是 22。你把 Java 的 `for` 循环迁过来，却把边界写成 `index <= quantities.length`：程序没有像 Java 数组那样立即抛出越界异常，最后只得到 `NaN`。与此同时，写在 `if` 里的消息变量在块外读不到，改成 `var` 虽然能读到，又掩盖了变量应该属于哪一段代码的问题。

这节把三件事连起来：**名字绑定到什么值、在哪一段代码能访问、下一条执行什么**。学完应能：

1. 为不需要重新赋值的绑定选 `const`，为累计量选 `let`；看懂旧代码中的 `var`。
2. 用代码的嵌套关系解释块作用域、遮蔽和暂时性死区 TDZ。
3. 选择 `if`、`switch`、普通 `for` 或 `for...of`，避免用 `for...in` 累加数组元素。
4. 在循环断点中找到第一个错误值，区分 `undefined`、`NaN` 和真正抛出的异常。
5. 顺着错误堆栈定位触发点，并用原输入与边界输入确认修复。

| Java 经验 | 可以借用的部分 | JS 中要重新确认的边界 |
| --- | --- | --- |
| 局部变量与 `final` | 先明确变量是否需要重新赋值 | `const` 限制绑定重新赋值，不冻结对象；变量没有 Java 的声明类型 |
| 花括号与局部变量 | `let` / `const` 在块内建立局部绑定 | `var` 不以普通 `if` / `for` 块为作用域边界 |
| 数组下标从 0 开始 | 普通 `for` 的有效下标同样小于 length | 本课普通数组缺失下标读到 `undefined`，不会自动抛 Java 式越界异常 |
| `try` / `catch` / `finally` | 捕获异常、查看调用链、必要时收尾 | JS 没有 Java 的受检异常声明；`NaN` 本身也不是异常 |

## 2. let、const、var：先分清绑定与值

**操作方式：自己尝试 · 浏览器 Console，S01。**  
**验证状态：已验证；Node 24.22.0 与 Chrome 155 的实际结果见课尾。**

在自己的空白页或 C02 本地网页打开 Console，**每次运行前先刷新页面，或使用新的独立页面**，再把下面整段复制执行。也可取得[仓库 examples/c04](https://github.com/socoo123/js_web/tree/main/examples/c04) 的 `bindings.js`。示例中的块隔离 `let` / `const`，但不会隔离 `var`；不重建页面上下文就再次运行，原来的 `legacy` 仍为 12，`var-before` 就会打印 12，而不是下面首次运行的 `undefined`。清空日志不会重置绑定。Console 最后显示的额外 `undefined` 可能是本次输入的求值结果，不是额外一条日志。

```js title="bindings.js"
// S01：每次运行前刷新页面；块隔离 let/const，不隔离 var。
{
  let stock = 12;
  const sold = 3;
  stock = stock - sold;
  console.log("binding", stock, sold);

  const product = { stock: 12 };
  product.stock = 9;
  console.log("property", product.stock);
  try {
    product = { stock: 0 };
  } catch (error) {
    console.log("reassign", error.name);
  }
}

{
  console.log("var-before", legacy);
  var legacy = 12;
  if (true) {
    var visibleOutsideIf = legacy;
  }
  console.log("var-block", visibleOutsideIf);
}

try {
  console.log(early);
  let early = 12;
} catch (error) {
  console.log("tdz", error.name);
}

{
  const warehouse = "默认仓";
  {
    const warehouse = "杭州仓";
    const stock = 12;
    console.log("inner", warehouse, stock);
  }
  console.log("outer", warehouse);
}

try {
  const label = "外层";
  {
    console.log(label);
    const label = "内层";
  }
} catch (error) {
  console.log("shadow-tdz", error.name);
}

try {
  console.log(typeof waiting);
  let waiting;
} catch (error) {
  console.log("typeof-tdz", error.name);
}

{
  let pending;
  console.log("initialized", pending);
}
```

预期日志，顺序如下；`try/catch` 暂且理解为“记录预期错误后继续”，第 8 节再讲它的结构：

```text
binding 9 3
property 9
reassign TypeError
var-before undefined
var-block 12
tdz ReferenceError
inner 杭州仓 12
outer 默认仓
shadow-tdz ReferenceError
typeof-tdz ReferenceError
initialized undefined
```

### 2.1 const 约束名字，不约束整个对象

`const sold = 3` 建立一个不能重新赋值的绑定；`let stock = 12` 允许之后执行 `stock = 9`。两者都没有给变量加上 Java 的 `int` 类型。即使 `let` 允许换成字符串，业务上也应保持清楚的类型约定，避免统计中无意出现字符串拼接。

`const product = { stock: 12 }` 把名字 `product` 绑定到一个对象值。`product.stock = 9` 修改该对象的属性，**没有重新给 product 赋值**；`product = { stock: 0 }` 才是在替换绑定，所以抛 `TypeError`。这与 Java 的 `final` 引用不能重新指向另一对象、字段仍可能可变有相似之处；`const` 不是深层不可变，也不等于 Java 的编译期常量。

本课先看清“重新赋值”和“修改属性”两种操作。对象别名、浅复制在 C05 展开；不要因此把对象传参叫作“按引用传参”：JS 传的是值，传入对象引用值的副本可能仍指向同一个对象，重新给形参赋值不会替换调用者的绑定。

### 2.2 选择规则与旧代码

| 声明 | 本课使用的作用域规则 | 声明前读取 | 适合本课的用途 |
| --- | --- | --- | --- |
| `const` | 块作用域 | 初始化前为 TDZ，读取抛 `ReferenceError` | 输入数组、当前元素、固定配置；普通声明必须给初始值 |
| `let` | 块作用域 | 初始化前为 TDZ，读取抛 `ReferenceError` | 累计总数、循环下标、需要在分支中赋值的结果 |
| `var` | 函数作用域；函数外属于相应的脚本或模块环境 | 绑定通常已初始化为 `undefined`，初始化表达式仍在原处执行 | 读懂旧代码；本课新实现不用它 |

`var visibleOutsideIf` 在 `if` 结束后仍能读到，因为 `if` 不是它的作用域边界。它仍会受到外层函数或模块等边界限制，不能概括成“var 到处可见”。浏览器普通脚本顶层、模块顶层和 Node 文件的顶层规则也不同；C16 学模块时再细分，不把任何顶层变量都等同于 `window` 属性。

同一块中重复写两个 `let stock` 或两个 `const stock` 会产生 `SyntaxError`。嵌套块中的同名声明则建立另一个绑定。这一点与 Java 局部变量的重声明限制不同；Console 对多次独立输入还可能有专门行为，练习应以完整代码块或源文件为准。

## 3. 作用域查找、提升与 TDZ

![读取 warehouse 时从当前块开始查找名字；当前块没有才继续查外层；到最外层仍找不到，读取抛出 ReferenceError。找到绑定即停止向外查找，尚未初始化的绑定触发 TDZ 错误。](../../../assets/diagrams/c04-scope.svg)

图的箭头表示**查找外层绑定**，不表示代码执行顺序。实际在哪一层建立绑定，取决于声明的种类和代码结构。对本课 `let` / `const` 的块嵌套，先找当前块，再逐层找包含它的外层；外层不能反过来读取只在内层声明的局部变量。JS 采用词法作用域：代码写在哪里形成的嵌套关系决定这条查找路径，不是每次调用时临时按调用者拼出路径。函数和闭包在 C06 继续。

S01 的两个 `warehouse` 是两个绑定：内层打印“杭州仓”，离开内层块后外层仍是“默认仓”，称为**遮蔽**。遮蔽容易让读者误判修改了哪一个值；业务代码通常应优先用更有意义的不同名字。

再看 `label`：内层已经声明了同名绑定，所以内层 `console.log(label)` 找到的就是内层绑定；但它的 `const label = "内层"` 还没执行到，因此抛 `ReferenceError`，**不会退回去读取外层的“外层”**。图中“找到绑定即停止外查”包含这个限制。

### “提升”不代表把源码搬到最前面

进入相应环境时，JS 会先建立声明对应的绑定，再执行语句。`var` 的绑定会先初始化为 `undefined`，所以 `var-before` 能打印它；`legacy = 12` 的赋值仍在原来的执行位置。不能把 `var legacy = 12` 整条都想象成提前执行了。

`let` / `const` 的绑定也会先建立，但在执行到声明初始化前不可读取，这段时间叫 **Temporal Dead Zone，暂时性死区**。因此不要用“let/const 完全没有提升”解释它们；更有用的是问“绑定是否存在、是否已初始化”。

- `console.log(early); let early = 12;`：声明初始化之前读取，抛 `ReferenceError`。
- `let pending; console.log(pending);`：已经执行声明，无显式初始值的 `let` 初始化为 `undefined`。
- `typeof waiting` 遇到本块尚未初始化的 `let waiting`，同样抛 `ReferenceError`。C03 中 `typeof` 对未声明名字的特殊行为，不能推广成“typeof 永不报错”。

这些基础规则已对照 [ECMAScript 2026 的声明](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-let-and-const-declarations)与[环境记录](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html#sec-environment-records)核对。这里不依赖未完成提案。

## 4. if、switch 和循环：让每条执行路径都有理由

**操作方式：自己尝试 · 浏览器 Console，S02。验证状态：已验证。** 先预测每个块的输出，再执行完整 `controls.js`；两个块也可以分开复制。

```js title="controls.js"
// S02：条件与循环；每块可以单独复制到 Console。
{
  const stock = 0;
  if (stock === 0) {
    console.log("if", "售完");
  } else if (stock < 5) {
    console.log("if", "库存偏低");
  } else {
    console.log("if", "可售");
  }

  const action = "restock";
  let message;
  switch (action) {
    case "sell": {
      message = "执行售出";
      break;
    }
    case "restock": {
      message = "执行补货";
      break;
    }
    default: {
      message = "未知操作";
    }
  }
  console.log("switch", message);

  switch ("0") {
    case 0:
      console.log("case-number");
      break;
    default:
      console.log("case-default");
  }
}

{
  const quantities = [12, 0, 7];
  for (const quantity of quantities) {
    console.log("of", quantity);
  }
  for (const key in quantities) {
    console.log("in", key, typeof key);
  }

  let attempts = 0;
  while (attempts < 2) {
    attempts = attempts + 1;
  }
  console.log("while", attempts);

  let checks = 0;
  do {
    checks = checks + 1;
  } while (false);
  console.log("do", checks);

  let firstAvailable = 0;
  for (const quantity of [0, 7, 3]) {
    if (quantity === 0) {
      continue;
    }
    firstAvailable = quantity;
    break;
  }
  console.log("first", firstAvailable);
}
```

预期日志：

```text
if 售完
switch 执行补货
case-default
of 12
of 0
of 7
in 0 string
in 1 string
in 2 string
while 2
do 1
first 7
```

### 4.1 分支：判条件与匹配固定值

`if` / `else if` 依次检查条件；第一个成立的分支执行后，不再检查后面的分支。JS 会把条件转换为布尔值，Java 则要求条件本身是 boolean。这里写 `stock === 0`，明确表达“库存等于 0”，而不是让 `if (stock)` 同时承担类型、有效性和业务含义。

`switch` 适合按固定值分派，`case` 的匹配不做 `==` 那样的隐式转换，所以字符串 `"0"` 不匹配数字 `0`。匹配后从该处向下执行；忘记 `break` 会贯穿到后续分支，即使后面 `case` 的值不同。`default` 处理没有匹配的情形，应该明确输出或处理未知操作。

`case` 标签本身不创建独立的块；例子在每个分支写 `{ ... }`，以后需要局部 `const` 时也各有块作用域。不要在同一个 switch 作用域的多个 case 中随意重复声明同名 `let` / `const`。

### 4.2 循环：先选元素值，再决定是否需要下标

| 写法 | 每轮拿到什么 / 何时判断 | 本课建议 |
| --- | --- | --- |
| `for (let index = 0; index < length; index = index + 1)` | 初始化一次；每轮先判条件，执行体后更新下标 | 需要观察下标或控制边界时使用 |
| `for (const quantity of quantities)` | 数组按迭代规则给出的元素值 | 只需顺序读取元素时优先使用；类似 Java 的增强 for |
| `for (const key in quantities)` | 可枚举的字符串属性名，可能包括继承来的属性 | 不是数组值循环，不用于本课库存累计 |
| `while (condition)` | 每轮执行前判断 | 次数由过程决定时，确保有走向终止的变化 |
| `do { ... } while (condition)` | 先执行一次，再判断 | 确实要求至少一次才用 |

`for...in` 本例拿到字符串 `"0"`、`"1"`、`"2"`；如果直接把 key 加到数字总数，容易变成字符串拼接。数组还能附加属性，原型也会影响枚举；C05/C08/C09 再展开对象和集合。这里先避免把 `in` 当成 Java 增强 for 的对应物。

`for (const quantity of quantities)` 能遍历多个值，并不违反 `const`：每轮是新的绑定，不是对同一个 `const` 反复赋值。普通计数循环中的 `index` 却需要更新，因此使用 `let`，不能把 `for (let index...)` 机械替换为 `const`。

`continue` 跳过当前这轮剩余部分，进入下一轮；`break` 退出最内层循环或 switch。本例跳过 0，找到 7 后退出，所以 `first` 是 7。`return` 则是离开当前函数，范围不同。[ECMAScript 的循环与跳转语句](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-iteration-statements)

## 5. 从 Java 统计方法迁移一份可运行的 JS

**操作方式：讲解示例 · Java 对照 J01；验证状态：已用 JDK 21.0.2 执行。** 会 Java 的读者先看这份熟悉的代码；本课浏览器练习不要求安装 JDK。

```java title="StockStats.java"
public class StockStats {
    static int sumStock(int[] quantities) {
        int total = 0;
        for (int index = 0; index < quantities.length; index++) {
            int quantity = quantities[index];
            total = total + quantity;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println("total " + sumStock(new int[] {12, 0, 7, 3}));
        System.out.println("empty " + sumStock(new int[] {}));
    }
}
```

以下是完整 JS 文件，不需要定义类，也不需要 `public static void main`：

**操作方式：自己尝试 · 浏览器 Console，S03；验证状态：已验证。** 这份文件有顶层 `const quantities`，在 Console 重复复制前先刷新页面重建上下文；清空日志不会删除原来的绑定。

```js title="stats.js"
// S03：本文件可在浏览器普通脚本或 Node 中直接运行。
function sumStock(quantities) {
  let total = 0;
  for (let index = 0; index < quantities.length; index = index + 1) {
    const quantity = quantities[index];
    total = total + quantity;
  }
  return total;
}

const quantities = [12, 0, 7, 3];
console.log("total", sumStock(quantities));
console.log("empty", sumStock([]));
```

两份程序都输出：

```text
total 22
empty 0
```

这里提前使用最少的函数语法：`function sumStock(quantities) { ... }` 定义一段有名字的计算，`quantities` 是接收输入的形参，`sumStock([12, 0, 7, 3])` 调用它，`return total` 返回结果并离开函数。没有写 `return` 的路径会返回 `undefined`。函数表达式、箭头函数、参数细节与闭包留到 C06，不在这节预设你已学完它们。

`[12, 0, 7, 3]` 是数组字面量，`.length` 是长度 4，`quantities[0]` 是第一个值 12，最后一个有效下标是 3。`[]` 的长度为 0，循环一次都不执行，所以保留初始总数 0。`total` 必须在循环外初始化；放到循环体内会每轮清零。当前元素 `quantity` 每轮只读取、不重新赋值，所以是 `const`。

与 Java 的关键差别不是少写了几个类型名：Java 方法的 `int[]` 限定元素类型，JS 这份入门实现**假定输入是装有非负整数的普通数组**。如果传入字符串、缺失项或其他类型，需要另设验证策略；第 8 节先练一种明确拒绝无效值的异常。它还不是能接收任意外部 JSON 的完整业务接口。

## 6. 自己尝试：在循环的同一行连续停住

**操作方式：自己尝试 · 本地网页 / Sources，D01。**  
**验证状态：循环断点与变量已通过 Chrome 调试协议实际验证；面板点击路径已对照官方资料核对。**

把前面的 `stats.js` 与下面的 `index.html` 放进同一目录 `c04-lab`，或使用仓库 `examples/c04`。不需要 CSS、npm 或构建工具。

```html title="index.html"
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>C04 循环断点</title>
    <link rel="icon" href="data:,">
    <script src="./stats.js" defer></script>
  </head>
  <body>
    <main>
      <h1>循环统计库存</h1>
      <p>打开 DevTools，查看 Console；在 Sources 的 stats.js 中设置循环断点后刷新。</p>
      <p>正常输出 total 22、empty 0。修改并保存源文件后刷新，重新验证。</p>
    </main>
  </body>
</html>
```

沿用 C02 已有的本地文件服务：终端进入这个目录，运行 `python3 -m http.server 8000 --bind 127.0.0.1`，然后访问 `http://127.0.0.1:8000/`。Python 只提供文件，浏览器执行 JS；若已经有编辑器的静态预览服务，也可按它显示的 HTTP 地址访问。没有 Python 时不必为本课先装 Node。Windows 命令与服务解释见 [C02 准备步骤](../../01-history-web/c02-web-debugging/#2-准备编辑器终端浏览器各做一件事)。

1. Console 先确认 `total 22` 与 `empty 0`，再到 Sources 打开 `stats.js`。
2. 在 `total = total + quantity;` 所在行点击行号设断点，然后刷新。暂停在这行时，本行还没有执行。
3. Scope 或暂停上下文的 Console 应能读到 `index=0`、`quantity=12`、`total=0`；Call Stack 顶部是 `sumStock`。
4. 单步跳过一次，`total` 变为 12。继续运行到同一断点，观察下表；值为 0 的商品也占一次循环，但不增加总数。
5. 继续到结束，删除断点。空数组调用不会进入这个循环体断点，日志仍得到 `empty 0`。

| 本轮下标 | 本行执行前 quantity | 执行前 total | 本行执行后 total |
| --- | --- | --- | --- |
| 0 | 12 | 0 | 12 |
| 1 | 0 | 12 | 12 |
| 2 | 7 | 12 | 19 |
| 3 | 3 | 19 | 22 |

这里只读取当前暂停调用帧中的局部变量；函数结束后在普通全局 Console 输入 `total`，不能读取已经离开的局部绑定。调试器显示的 Scope 和 Call Stack 是两件事：一个看当前可访问的绑定，一个看这次执行如何调用到这里。[Chrome 断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)、[作用域与单步参考](https://developer.chrome.com/docs/devtools/javascript/reference)

## 7. 必做修错：错误从哪一轮开始？

**操作方式：自己尝试 · 本地网页或 Console，E01 / A01；验证状态：故障和参考修复已验证。**

在自己的 `stats.js` 里只把循环条件改为 `index <= quantities.length`，保存并刷新。预期 `total NaN`，空数组调用也变成 `empty NaN`。正常文件和故障要分清；仓库保留正确 `stats.js`，单独的 `faults.js` 用日志复现这次错误。

你的任务：保留断点，找到**第一个不正确的 quantity**，记录它的下标、`quantities.length` 和加法前后的 total。不要先加 `?? 0` 或 `|| 0` 把结果补成 0。修复后用 `[12, 0, 7, 3]`、`[]`、`[0]` 三种输入验收，应分别返回 22、0、0。

故障的关键证据：

```text
index 4：quantity 为 undefined；加法前 total 为 22
执行 total = total + quantity 后：total 为 NaN
Number.isNaN(total) 为 true
```

对本课未修改原型的普通数组，缺失的下标属性读取得到 `undefined`；`22 + undefined` 经数字转换得到 `NaN`。读取 `quantities[4]` 本身没有抛出异常，所以包一层 `try/catch` 也不会自动报告这次越界。若后续对 `undefined` 读取属性，才可能另抛 `TypeError`；本课先查到第一次越界，不等错误传远了再猜。

<details>
<summary>提示 A：长度与最后下标不是同一个数</summary>

长度为 4，合法下标是 0、1、2、3。循环条件在每轮开始前判断；当 index 变成 4，`4 <= 4` 仍成立，多执行了一轮。空数组长度为 0，错误条件让它也执行了 index=0 的一轮。

</details>

<details>
<summary>参考答案 A01：恢复正确边界，并保留累计量作用域</summary>

把条件改回 `index < quantities.length`，得到第 5 节完整 `stats.js`。`let total = 0` 保留在循环外；每轮的 `const quantity` 留在循环内。通过正确边界证明没有多读元素，比把错误读取静默替换成 0 更能解释这个故障。

如果业务只需加元素值，也可以选 `for...of`，不必自己维护下标；它仍需要明确输入数据是否合法，不会自动把坏数据变成好数据。参考验证已额外调用空数组与 `[0]`，均返回 0。

</details>

### 再修一个作用域错误

**操作方式：自己尝试 · Console，E02 / A02；验证状态：故障与两条路径的答案均已验证。** 把下面整块运行后会抛 `ReferenceError`。目标是既能在 `if` 后读消息，也能在 stock=3 时输出“可售”，不要改用 `var`。

```js
{
  const stock = 0;
  if (stock === 0) {
    const message = "售完";
  }
  console.log(message);
}
```

<details>
<summary>提示 B：消息需要被哪两段代码共享？</summary>

消息既要被分支赋值，又要被分支后的日志读取。应该在包含这两处的外层块里建立绑定；每条业务分支都要给出结果。把内层 const 改成内层 let，并不会扩大作用域。

</details>

<details>
<summary>参考答案 A02：外层 let，分支赋值</summary>

```js
{
  for (const stock of [0, 3]) {
    let message;
    if (stock === 0) {
      message = "售完";
    } else {
      message = "可售";
    }
    console.log("fixed-message", stock, message);
  }
}
```

预期依次为 `fixed-message 0 售完`、`fixed-message 3 可售`。这段与仓库 `answers.js` 的 A02 一致。只处理 stock=0 而漏掉 else，另一条路径会留下 `undefined`；“不报错”不等于业务结果完整。

</details>

## 8. 异常和错误堆栈：从触发点读回调用者

**操作方式：自己尝试 · Console，E03；验证状态：已验证错误类型、消息、调用顺序与 finally。** 完整故障演示见仓库 `faults.js`；以下是可单独复制的异常段。

```js
function requireNonNegative(quantity) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError("库存必须是非负整数");
  }
  return quantity;
}

function readStock() {
  return requireNonNegative(-1);
}

try {
  console.log(readStock());
} catch (error) {
  console.log("caught", error.name, error.message);
  console.log(error.stack);
} finally {
  console.log("finally", "本次检查结束");
}
```

预期先打印 `caught RangeError 库存必须是非负整数`，再打印堆栈，最后打印 `finally 本次检查结束`。堆栈的函数顺序大致如下，文件 URL、行列号和 Console 的 `VM...` 编号取决于运行位置，不要逐字匹配：

```text
RangeError: 库存必须是非负整数
    at requireNonNegative (...)
    at readStock (...)
    at ...调用处...
```

`throw` 中止当前正常执行，沿调用链寻找能处理它的 `catch`。这里 `readStock()` 没有正常返回，外层那次 `console.log(readStock())` 不会打印正常结果。`catch (error)` 建立一个 catch 块局部绑定；它在本例是我们抛出的 `RangeError` 对象，但 JS 允许抛出其他值，不能泛化成“所有 catch 都收到 Error”。新业务代码应优先抛 `Error` 或合适的子类，保留明确消息。

阅读堆栈先看类型与消息，再看靠上的业务函数与行号：本例真正触发 `throw` 的是 `requireNonNegative`，`readStock` 是它的调用者。`error.stack` 的存在与格式不要当作跨引擎逐字稳定的业务协议；本课 Chrome/Node 的堆栈按 V8 行为实际观察。[V8 堆栈说明](https://v8.dev/docs/stack-trace-api)

`finally` 在这类正常完成或异常传播过程中执行，可承担必要收尾；不要在 finally 再写 return 或 throw 覆盖原结果，也不要把它误读为“页面或进程被外部强行终止时仍保证执行”。业务上只有明确能处理的错误才应恢复；捕获后什么都不做，会把证据丢掉。SyntaxError、ReferenceError、TypeError、RangeError 是不同线索，不能只凭“出红字”统一加 try/catch。[ECMAScript 的 throw 与 try](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-try-statement)

## 9. 必做预测：先解释，再运行

**操作方式：自己尝试 · 阅读预测 / Console；验证状态：下列现象与 A03 答案均已验证。** 不看前文输出，独立回答：

1. `const product = { stock: 12 }` 后能否执行 `product.stock = 9`？能否执行 `product = { stock: 9 }`？
2. `var` 声明前读取与 `let` 声明前读取为什么不同？`typeof` 能否绕过 TDZ？
3. 内层在后面声明了同名 `label`，为什么前面的读取不使用外层值？
4. 为什么 `for...of` 可以用 `const quantity`，普通计数循环的下标却使用 `let`？
5. 把 `for...of [12, 0, 7]` 改成 `for...in [12, 0, 7]`，每轮拿到的值和类型怎样变化？

再自己写一个循环：输入 `[12, 0, 7, 3]`，跳过库存 0 的项，累计其余库存，输出 `available-total 22`。累计量与当前元素分别用什么声明？写好后再展开。

<details>
<summary>参考答案 A03：绑定、查找与循环对象</summary>

1. 修改属性可以；替换 const 绑定抛 TypeError。const 约束绑定，不冻结对象。
2. var 绑定预先初始化为 undefined；let 初始化前在 TDZ，读取或对它使用 typeof 都抛 ReferenceError。
3. 当前块已有同名绑定，查找在这里停止；未初始化就是 TDZ，不会去读取外层值。
4. for...of 的 const 每轮建立新绑定；计数循环同一个下标需要更新，使用 let。
5. 从数字值 12、0、7 变成字符串属性名 "0"、"1"、"2"；不能直接拿来累计库存。

```js
{
  let availableTotal = 0;
  for (const quantity of [12, 0, 7, 3]) {
    if (quantity === 0) {
      continue;
    }
    availableTotal = availableTotal + quantity;
  }
  console.log("available-total", availableTotal);
}
```

这段是仓库 `answers.js` 的 A03。当前输入下跳过 0 不会改变总数，但它练习了 continue 的控制流。不要把条件改为“遇到 0 就 break”：那会过早结束，只累计到 12。

</details>

## 10. 接回库存项目与验证记录

C02 的单商品库存已经能修改和展示，C03 明确了输入值与转换；这节进一步明确累计量的生命范围、循环边界与异常证据。下一步将把多个商品表示成对象记录，处理属性与 JSON，再把这些计算接到页面。对象传参与复制的边界见下一课 [C05 对象、引用与数据交换](../c05-objects-json/)；完整函数与闭包在 C06。

离开前应能独立解释：为什么 const 对象仍能改属性；为什么内层同名 let 尚未初始化也会遮蔽外层；为什么总数出现 NaN 却没有异常；怎样用最后一次正常的断点值和第一次错误值证明越界是根因。练习后的正确 `stats.js` 应保留 `<` 条件；故障代码另存，不要把错误版混入下一课。

核查日期 **2026-10-15**。标准依据使用 [ECMAScript 2026 固定版](https://tc39.es/ecma262/2026/multipage/)，没有把滚动编辑草案或未完成提案当成新课必需能力。规范用于确认语义，不要求初学者通读：

- [声明、块、分支、循环、throw 与 try](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)。
- [环境记录与绑定查找](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html#sec-environment-records)。
- [普通对象的属性读取](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver)，对应普通数组缺失下标的读取；不要外推到所有代理对象或改过原型的环境。
- [Chrome 断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)、[调试参考](https://developer.chrome.com/docs/devtools/javascript/reference)、[V8 堆栈](https://v8.dev/docs/stack-trace-api)。

| ID | 操作方式 | 验证状态与实际结果 |
| --- | --- | --- |
| S01 | Console / 讲解例子 | 已验证绑定、const 属性修改与赋值错误、var、TDZ、遮蔽、typeof TDZ、声明后的 undefined |
| S02 | Console / 讲解例子 | 已验证 if、switch 严格匹配、for-of 值与 for-in 字符串键、while/do、continue/break |
| S03 / J01 | Console；Java 对照为选做 | JS 与 Java 均输出 22、0；JS 另验 `[0]` 为 0 |
| D01 | 本地网页 / Sources | Chrome 协议命中正常循环四轮断点，检查每轮 index/quantity/total；手动面板路径已核对 |
| E01 / A01 | 修改循环边界 / 修复 | 已复现第五轮 undefined→NaN 与空数组故障；恢复 `<` 后正常、空数组、单个0均正确 |
| E02 / A02 | Console / 修复 | 已复现块外读取 ReferenceError；外层 let 两条路径分别为“售完”“可售” |
| E03 / A03 | Console / 异常及预测答案 | 已验证 RangeError 消息、堆栈函数顺序、finally；跳过0累计为22 |

实际环境：macOS arm64，Node **24.22.0**、Chrome **155.0.8059.40**、JDK **21.0.2**。浏览器协议自动化只负责作者验证，学习者用浏览器即可。正常文件、故障文件、答案、运行命令与实际输出见[仓库练习说明](https://github.com/socoo123/js_web/tree/main/examples/c04)。手动点击面板、Edge、Windows、真实手机未执行；不同引擎的错误文案、堆栈行号与格式不承诺逐字一致。
