---
title: C03 值、类型、转换与比较
description: 从输入框里的字符串出发，理解 JavaScript 的原始类型、Number 精度、显式转换、真假判断与相等比较，并修复库存和金额计算。
sidebar:
  order: 3
---

> **课号 C03 · 第 1 周 / 第 2 天 · 必修**  
> 前置：[C02 Web 基础与第一个调试现场](../../01-history-web/c02-web-debugging/)；能打开浏览器 Console，理解 Java 的变量、算术与条件判断。  
> 时间：阅读与跟做约 45–50 分钟，独立练习约 35–45 分钟。4 周路线与 C04 同一天，8 周路线单独一天。  
> 资料核查：2026-10-15。语言规则对照 ECMAScript 2026 固定版本；示例文件已在 Node 24.22.0 与 Chrome 155.0.8059.40 实际执行；手动 Console 路径已核对。各项边界见课尾。

## 1. 为什么售出能算对，补货却成了 123？

C02 特意写了 `Number(quantityInput.value)`。`type="number"` 是 HTML 输入控件的类型，**读取它的 `.value` 仍得到字符串**。页面上的数字、JS 的数字值和数字组成的文本需要分开。

**操作方式：自己尝试 · 浏览器 Console，V01；验证状态：同一文件已在 Node 与 Chrome 独立页面执行；手动粘贴步骤已核对。**

打开一个空白页的 Console，把下面完整代码一次粘贴执行。它不依赖 C02 页面。先预测第 2、3 行日志，再运行。

```js title="input.js"
// C02 的输入 value 是字符串；这里固定输入，专注观察类型。
const rawQuantity = "3";
const currentStock = 12;

console.log(typeof rawQuantity);
console.log(currentStock + rawQuantity);
console.log(currentStock - rawQuantity);

const quantity = Number(rawQuantity);
console.log(typeof quantity);
console.log(currentStock + quantity);
```

预期日志：

```text
string
123
9
number
15
```

`+` 既用于数字相加，也用于字符串拼接；这里一边是字符串，所以得到字符串 `"123"`。减法对这里的字符串执行数值转换，因此得到数字 `9`。**减法碰巧成功，不能证明输入本来就是数字。** 调试时同时看值和 `typeof`，不要只看日志里显示的字符。

这节要建立三步习惯：先确定值的类型，再按业务规则转换和检查，最后计算与比较。学完应能解释 `0` 为什么被默认值覆盖、金额为什么出现长尾、两个同内容对象为什么不相等。

### 怎么运行后面的例子？

主线仍是浏览器 Console，不要求安装 Node、npm 或任何依赖。所有 `.js` 文件都可在[仓库 examples/c03](https://github.com/socoo123/js_web/tree/main/examples/c03)找到。

1. 每次选择一个完整文件，在空白页 Console 执行；**运行下一个完整文件前刷新页面**。不同文件会重复声明 `const` 名称，同一作用域直接粘贴可能触发重复声明错误。
2. 先在纸上记录值与类型，再运行核对；不要把 Console 最后显示的 `undefined` 误当成日志输出。`console.log` 本身返回 `undefined`。
3. 比较失败时，用 `typeof`、`Number.isNaN`、`Number.isSafeInteger` 检查中间值，避免仅凭最终字符串猜原因。

如果已经有 Node，可在终端进入仓库根目录运行 `node examples/c03/input.js`，或进入下载的 `c03` 文件夹后运行 `node input.js`。作者执行基线为 Node **24.22.0**，安装和运行时选择留到 C17；这里不让工具安装阻碍语言入门。[Chrome Console 执行 JS](https://developer.chrome.com/docs/devtools/console/javascript)

## 2. 值有类型，变量不写 Java 式类型声明

Java 的 `int stock = 12` 把变量限定为相应类型；JS 的 `let stock = 12` 没有这样的静态声明。值始终有类型，`let` 绑定后续可以接收另一种类型的值。这不等于“JS 没有类型”。`let`、`const` 与作用域在 C04 系统讲。

ECMAScript 的语言类型包含 **7 种原始类型与 Object**。先把常见业务值放进表格：

| 类型 | 示例 | 库存业务中的含义或边界 |
| --- | --- | --- |
| Undefined | `undefined` | 例如已声明但尚未赋值的变量；不代表库存 0 |
| Null | `null` | 可约定为“明确没有选中的商品”；它是单独的原始类型 |
| Boolean | `true`、`false` | 是否允许售出；字符串 `"false"` 不是布尔值 |
| String | `"键盘"`、`"12"` | 商品名称、编号、输入文本；没有单独的 char 类型 |
| Number | `12`、`19.9`、`NaN` | 普通数字统一使用此类型，包括整数形式的值 |
| BigInt | `12n` | 任意精度整数，受实际内存等资源限制；不能表达小数 |
| Symbol | `Symbol("product")` | 可用作唯一标记；本课只认识，不用它做商品业务 ID |
| Object | `{ name: "键盘" }`、`[]` | 对象和数组；函数也属于对象 |

原始值不可在内部修改。例如拼接字符串会产生新字符串；变量重新赋值是另一件事。对象可以有可修改的属性。C05 会再解释对象、别名和复制，现在先认清“值的类型”与“变量名”是两个问题。[ECMAScript 2026 类型定义](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types)

### `typeof` 很有用，但结果不等于上表的类型名称

**操作方式：自己尝试 · 浏览器 Console，V02；验证状态：types.js 已在 Node 与 Chrome 执行。**

```js title="types.js"
console.log("Undefined:", typeof undefined);
console.log("Null:", typeof null);
console.log("Boolean:", typeof true);
console.log("String:", typeof "键盘");
console.log("Number:", typeof 12);
console.log("BigInt:", typeof 12n);
console.log("Symbol:", typeof Symbol("product"));
console.log("Object:", typeof { name: "键盘" });
console.log("Array:", typeof []);
console.log("Function:", typeof console.log);

let incomingStock = "12";
console.log(typeof incomingStock);
incomingStock = 12;
console.log(typeof incomingStock);

let pendingStock;
const selectedProduct = null;
console.log(pendingStock === undefined);
console.log(selectedProduct === null);
console.log(Symbol("product") === Symbol("product"));
```

预期日志：

```text
Undefined: undefined
Null: object
Boolean: boolean
String: string
Number: number
BigInt: bigint
Symbol: symbol
Object: object
Array: object
Function: function
string
number
true
true
false
```

记住三处边界：

- `typeof null` 返回 `"object"` 是沿用至今的历史行为，**不能据此说 null 是对象**。判断空值用 `value === null`。
- 数组返回 `"object"`，函数返回 `"function"`；函数仍属于 Object 类型。`typeof` 不能替你做完整结构校验。
- 两次 `Symbol("product")` 得到不同值；括号中的文本只是描述，不是可按文本查回的业务编号。

`pendingStock` 已声明但没赋值，所以是 `undefined`；`selectedProduct` 主动赋为 `null`。这是常见语义约定，不能只看 `undefined` 就断言数据一定“还在加载”。空值是否允许，最终由业务约定决定。也不要把“未声明变量”和“已声明但值为 undefined”混为一谈；C04 会用 TDZ 解释为什么 `typeof` 也并非在任何位置都安全。[typeof 的正式求值规则](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-typeof-operator)

## 3. Number 与 Java int、double、BigDecimal 的边界

普通的 `12` 和 `12.5` 都是 Number。它采用 IEEE 754 二进制 64 位浮点数，理解精度时更接近 Java `double`，不会因为写了整数形式就变成 Java 的 `int`。

**操作方式：自己尝试 · 浏览器 Console，V03；验证状态：numbers.js 已在 Node 与 Chrome 执行。**

```js title="numbers.js"
console.log(5 / 2);
console.log(5n / 2n);
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(typeof NaN, Number.isNaN(NaN));
console.log(1 / 0, Number.isFinite(1 / 0));
console.log(Number.isInteger(3.0));
console.log(Number.MAX_SAFE_INTEGER);
console.log(Number.isSafeInteger(9007199254740992));
console.log(9007199254740992 === 9007199254740993);
console.log(9007199254740992n + 1n);

// 金额以整数分保存；当前输入与乘积都在安全整数范围。
const unitPriceCents = 1990;
const soldQuantity = 3;
const totalCents = unitPriceCents * soldQuantity;
console.log(totalCents, Number.isSafeInteger(totalCents));
console.log((totalCents / 100).toFixed(2));
```

预期日志：

```text
2.5
2n
0.30000000000000004
false
number true
Infinity false
true
9007199254740991
false
true
9007199254740993n
5970 true
59.70
```

### 3.1 除法与无效数字不会自动抛出 Java 式异常

`5 / 2` 得到 `2.5`。JS 不会根据两边写成整数形式，就自动执行 Java 的整数除法。`5n / 2n` 则是 BigInt 除法，小数部分向零截断，得到 `2n`；它不是一种小数精算方案。

`NaN` 表示数值计算或转换得到的“不是一个有效数字”的特殊 Number 值；`typeof NaN` 仍为 `"number"`。用 `Number.isNaN(value)` 识别它。`1 / 0` 的 Number 结果是 `Infinity`，可用 `Number.isFinite` 排除它和 NaN，不能期待它像 Java 整数除零一样抛异常。

### 3.2 浮点误差与安全整数是两个问题

`0.1`、`0.2` 等十进制小数通常无法用有限位二进制精确表示，所以算术结果会舍入。不是 `===` 算错了：两边确实是不同的 Number 值。不要把所有比较都改成 `==`，也不要把“统一加一个 `Number.EPSILON`”当成适用于各种金额和数量级的修复。

另外，安全整数范围为 `-(2 ** 53 - 1)` 到 `2 ** 53 - 1`，即正负 **9007199254740991**。范围内的整数能被精确表示，并能与相邻整数区分；超出后某些整数仍能表示，但不能保证连续区分。例子里两个不同的十进制字面量最终落在同一个 Number 值上，比较才得到 `true`。

`Number.isInteger` 只检查当前 Number 是否为整数；`Number.isSafeInteger` 还检查安全范围。库存、整数分以及计算结果都需要考虑范围。已经被舍入丢掉的信息，之后再调用 `BigInt(...)` 也无法恢复；超大整数应从精确文本或 BigInt 字面量开始。[Number 与 BigInt 的定义](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-numeric-types)、[安全整数与检查方法](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html#sec-number.issafeinteger)

### 3.3 价格先以整数分计算，显示时再格式化

上例用 `1990` 分乘以 `3` 件，先得到整数 `5970` 分，最后显示 `59.70` 元。`toFixed(2)` 返回**字符串**；它是显示格式，不会给 Number 增加十进制精度。

这节使用固定的、较小的整数分，不从任意小数输入直接乘 100。不要因此推导出 `Number("任意价格文本") * 100` 总是精确，也不要认为结果在安全整数内就自动规定好了税费和折扣的舍入规则。金额扩大、除法分摊、不同币种和后端精确数据需要单独定义单位、范围与舍入方式；本课先把库存项目中的基本表示选对。

**操作方式：讲解示例 · Java 对照；验证状态：已核对 JLS 与 BigDecimal 文档，本段 Java 未执行。** 以下是放在 Java `main` 方法中的语句，BigDecimal 使用完整类名，避免遗漏 import：

```java
System.out.println(5 / 2);     // 2，Java 整数除法
System.out.println(5.0 / 2);   // 2.5，Java 浮点除法
System.out.println(0.1 + 0.2); // 0.30000000000000004
System.out.println(
    new java.math.BigDecimal("0.1")
        .add(new java.math.BigDecimal("0.2"))
        .toPlainString()
); // 0.3
```

Java `double` 也有类似二进制小数问题；`BigDecimal` 的十进制模型是另一种工具。字符串构造器保留这里的十进制输入，不要先把 `0.1` 变成 double 再期待构造器消除误差。JS BigInt 更接近 Java `BigInteger`，**不是 BigDecimal**。[JLS 除法](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.17.2)、[BigDecimal 字符串与 double 构造器](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html)

### 3.4 故障 E01：BigInt 与 Number 不能直接相加

**操作方式：自己尝试 · 浏览器 Console；验证状态：bigint-error.js 已在 Node 与 Chrome 复现预期 TypeError。** 单独运行：

```js title="bigint-error.js"
// 故意失败的独立示例。类型不同，不能直接混做加法。
console.log(1n + 1);
```

预期为 `TypeError`，不是 `2n`。作者环境的错误首行为 `TypeError: Cannot mix BigInt and other types, use explicit conversions`，不同引擎措辞可能不同。定位到加法行，分别检查两个操作数的 `typeof`；若业务全是 BigInt，可写 `1n + 1n`。若要转成 Number，应先确认数值范围，不能用强转掩盖精度损失。这个限制针对算术混算；不要推导成“两类数字不能做任何比较”，第 6 节会区分。

## 4. 显式转换是开始，业务校验才决定是否接收

`Number`、`String`、`Boolean` 在本课作为转换函数使用，不加 `new`。Java 中常见的解析失败异常，不能直接套在 JS `Number` 上。

**操作方式：自己尝试 · 浏览器 Console，V04；验证状态：以下片段属于已在 Node 与 Chrome 执行的 conversion.js。**

```js
console.log(Number("3"));
console.log(Number(""), Number("   "));
console.log(Number(null), Number(undefined));
console.log(Number("3件"), Number("3.5"));
console.log(Number.isNaN("3件"));
console.log(Number.isNaN(Number("3件")));
console.log(Number.parseInt("3.8", 10));
console.log(String(12), typeof String(12));
```

预期日志：

```text
3
0 0
0 NaN
NaN 3.5
false
true
3
12 string
```

这里有三类不同判断：

1. **转换**：`Number("3.5")` 成功得到 3.5，但库存件数未必允许小数。
2. **检测无效数**：`Number.isNaN` 不先转换参数，所以字符串 `"3件"` 本身不会被它判成 NaN；先转换再检查，或直接检查结果是否为安全正整数。
3. **业务约束**：空字符串转换成 0，不代表用户填了 0。售出数量必须非空、安全整数且大于 0，库存则可以等于 0。

`Number.parseInt("3.8", 10)` 得到 3，因为它按整数前缀解析；参数 10 指十进制。它不会证明“原输入就是整数”，也会截断你本该拒绝的输入。修复 C02 的件数时，先取文本、明确转成 Number，再检查，保留原始文本用于判断是否空白。[数值转换规则](https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-tonumber)、[parseInt](https://tc39.es/ecma262/2026/multipage/global-object.html#sec-parseint-string-radix)

## 5. truthy、falsy 与默认值：库存 0 不能丢

Java 的 `if` 条件要求 boolean；JS 的条件会把值按真假规则解释。称一个值为 **truthy**，意思是它在这种布尔判断中表现为 true；并不是它本身就是布尔值 `true`。

本课会用到的 falsy 值是：`false`、`0`、`-0`、`0n`、`NaN`、空字符串 `""`、`null`、`undefined`。非空字符串 `"0"`、`"false"`、`" "` 都为 truthy；普通对象和数组也是 truthy，哪怕没有内容。

**操作方式：自己尝试 · 浏览器 Console，V04；验证状态：以下片段属于已在 Node 与 Chrome 执行的 conversion.js。**

```js
console.log(Boolean(0), Boolean("0"), Boolean("false"));
console.log(Boolean(""), Boolean(" "));
console.log(Boolean([]), Boolean({}));

console.log(0 || 12, 0 ?? 12);
console.log(false || true, false ?? true);
console.log("" || "未命名", "" ?? "未命名");
console.log(null ?? 12, undefined ?? 12);
console.log(NaN ?? 12);
console.log(3 && "允许售出", 0 && "允许售出");
```

| 表达式 | 预期值 | 为什么 |
| --- | --- | --- |
| `Boolean(0)` / `Boolean("0")` / `Boolean("false")` | `false` / `true` / `true` | 字符串是否为空，与文本描述什么是两回事 |
| `Boolean("")` / `Boolean(" ")` | `false` / `true` | 一个空格仍然是非空字符串 |
| `Boolean([])` / `Boolean({})` | `true` / `true` | 普通对象的真假不依据元素或属性个数 |
| `0 || 12` / `0 ?? 12` | `12` / `0` | `||` 使用真假判断，`??` 只处理 null 或 undefined |
| `false || true` / `false ?? true` | `true` / `false` | `??` 保留显式的布尔 false |
| `"" || "未命名"` / `"" ?? "未命名"` | `"未命名"` / `""` | 是否接收空名称，应由业务规则决定 |
| `null ?? 12` / `undefined ?? 12` | `12` / `12` | 两种空值都会选默认值 |
| `NaN ?? 12` | `NaN` | 无效数字不是 nullish；默认值不能代替校验 |
| `3 && "允许售出"` / `0 && "允许售出"` | `"允许售出"` / `0` | `&&` 也返回选中的操作数，不保证返回 Boolean |

`a || b` 在 a 为 truthy 时返回 a，否则才计算并返回 b；`a ?? b` 在 a 不是 null/undefined 时返回 a，否则才计算并返回 b。它们都是**短路求值**。`&&` 在左边 falsy 时直接返回左值，否则才计算右边。这与 Java 的短路直觉相近，但 JS 返回的是选中的操作数值，不会统一转为布尔值。

库存默认值的业务约定可以是：“仅在库存没有提供时使用 12；0 表示售完，必须保留。”应使用 `savedStock ?? 12`。如果值是 `"0"`、负数或 NaN，仍要按接口约定转换或拒绝；`??` 不是验证器。

本课只使用普通值。浏览器为了兼容旧页面，还保留了 `document.all` 的特殊真假行为，不把它放进库存逻辑。另一个语法边界是：`??` 不能不加括号就与 `||` 或 `&&` 混写；需要组合时先明确分组和业务意图，避免靠猜优先级写默认值。[布尔转换](https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-toboolean)、[逻辑与空值合并求值](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-binary-logical-operators)、[浏览器兼容特例](https://tc39.es/ecma262/2026/multipage/additional-ecmascript-features-for-web-browsers.html#sec-IsHTMLDDA-internal-slot)

## 6. 比较时，先问你要哪一种“相等”

**操作方式：自己尝试 · 浏览器 Console，V05；验证状态：comparison.js 已在 Node 与 Chrome 执行。**

```js title="comparison.js"
console.log(3 === "3", 3 == "3");
console.log(0 == false, "" == 0);
console.log(null === undefined, null == undefined);
console.log(null == 0);
console.log(NaN === NaN, Object.is(NaN, NaN));
console.log(0 === -0, Object.is(0, -0));
console.log(1n === 1, 1n == 1);

const firstProduct = { name: "键盘" };
const sameProduct = firstProduct;
const anotherProduct = { name: "键盘" };
console.log(firstProduct === sameProduct);
console.log(firstProduct === anotherProduct);
console.log(Object.is(firstProduct, anotherProduct));
console.log("键盘" === "键盘");
```

预期日志：

```text
false true
true true
false true
false
false true
true false
false true
true
false
false
true
```

| 方式 | 是否按规则转换不同类型 | 本课需要掌握的边界 |
| --- | --- | --- |
| `===`，以及相反的 `!==` | 不转换为另一类型再比较 | `3 !== "3"`；NaN 与自身不相等，正负零相等 |
| `==`，以及相反的 `!=` | 某些类型组合会转换，还有特定分支 | `3 == "3"` 为 true；不能概括为“统统先转数字” |
| `Object.is(a, b)` | 不做这种类型转换 | 与严格相等的主要差别是 NaN 与正负零；仍不比较对象内容 |

`0 == false` 中 false 按规则转成 0；`"" == 0` 中空文本转成 0。但 `null == 0` 是 false，而 `null == undefined` 是 true，说明它不是统一执行一次 `Number(...)`。读旧代码时要能识别这些转换；库存项目采用**边界处明确转换，内部使用严格比较**，减少隐式规则进入业务计算。

`1n === 1` 为 false，因为 BigInt 与 Number 类型不同；`1n == 1` 可按规则比较而得到 true。这并未取消前面算术混用的 TypeError：比较运算与加法有各自的规则。

两个对象字面量创建了两个对象。`firstProduct` 与 `sameProduct` 持有指向同一对象的值，所以相等；`anotherProduct` 是另一个对象，即使字段一样也不相等。`Object.is` 同样不会递归比较字段。Java 中可联想“对象身份”与 `equals` 的区别，但不能直接把 JS 的 `===` 当成 Java 的内容 `equals`。JS 字符串是原始值，`"键盘" === "键盘"` 按字符串值相等，不要套用 Java 对象引用比较的所有细节。[严格相等与宽松相等规则](https://tc39.es/ecma262/2026/multipage/abstract-operations.html#sec-testing-and-comparison-operations)、[Object.is](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html#sec-object.is)

## 7. 必做练习 A：先预测值与类型，再解释转换发生在哪里

**操作方式：自己尝试 · 浏览器 Console；验证状态：prediction.js 已在 Node 与 Chrome 执行，参考答案 A01 已与实际结果核对。**

在纸上为每行写下“值、类型、一句话原因”，再刷新空白页运行。只答出字符、不说明类型，不算完成。

```js title="prediction.js"
// 先写出值和类型，再运行核对。
console.log("12" + 3);
console.log("12" - 3);
console.log(Boolean("false"));
console.log(0 ?? 12);
console.log(NaN === NaN);
console.log(Number("") === 0);
console.log(5n / 2n);
console.log({} === {});
```

<details>
<summary>提示 A：先把运算符分类</summary>

`+` 需要检查是否走字符串拼接；`-` 在这里走数值转换。`Boolean` 问字符串是不是空，`??` 问左值是否为 null/undefined。相等比较本身的结果是布尔值，两个对象字面量创建的是两个对象。

</details>

<details>
<summary>参考答案 A01：值、类型与原因</summary>

| 行 | 值 | 类型 | 原因 |
| --- | --- | --- | --- |
| 1 | `"123"` | string | 字符串拼接 |
| 2 | `9` | number | 这里的字符串被转换后做减法 |
| 3 | `true` | boolean | `"false"` 是非空字符串 |
| 4 | `0` | number | 0 不是 null/undefined，保留下来 |
| 5 | `false` | boolean | NaN 在严格相等中与自身不相等 |
| 6 | `true` | boolean | 空字符串转换成数字 0 后与 0 严格相等 |
| 7 | `2n` | bigint | BigInt 除法向零截断 |
| 8 | `false` | boolean | 对象身份不同 |

若第一行和第二行只看日志字符，可能忽略 string 与 number；用 `typeof ("12" + 3)` 和 `typeof ("12" - 3)` 继续检查。注意括号：让 `typeof` 检查整个计算结果。

</details>

## 8. 必做练习 B：保留售完库存，修复补货和价格

**操作方式：自己尝试 · 浏览器 Console；验证状态：错误起点 E02 与完整参考答案 A02 均已在 Node 与 Chrome 执行，边界变体见课尾。**

这是独立的纯 JS 练习，**不修改 C02 的网页文件**。`savedStock` 模拟已经取得的库存值，`rawQuantity` 模拟输入框文本；本课没有真正连接存储或服务器。刷新空白页，先执行并解释错误结果。

```js title="inventory-broken.js"
// 故意有问题的起始代码：售完、赠品与不合法输入处理都要检查。
const savedStock = 0;
const stock = savedStock || 12;
const rawQuantity = "3";
const quantity = Number.parseInt(rawQuantity, 10);
const unitPriceYuan = 0.1;
const totalYuan = unitPriceYuan * quantity;

console.log("stock", stock);
console.log("restocked", stock + rawQuantity);
console.log("totalYuan", totalYuan);
console.log("valid", Boolean(quantity));
```

实际起始日志是 `stock 12`、`restocked 123`、`totalYuan 0.30000000000000004`、`valid true`。最后一个 true 也不能证明验证正确；把输入改成 `"-1"` 或 `"3.8"` 再看。

你的修复应满足：

1. 仅 null/undefined 的库存才默认 12；库存 0 保留，库存必须是安全非负整数。
2. 补货量来自非空白字符串，转换后的值必须是安全正整数；不允许 `"3.8"` 被截成 3。
3. 单价改为整数 **10 分**，单价 0 可表示赠品，不能用真假判断否定它。
4. 输入合法后才计算补货量与总价；结果也检查安全整数范围。默认输入应得到库存 0、补货后 3、金额 30 分、显示 0.30 元。

本练习把补货计算和金额计算作为两项独立计算，不实际售出或改 DOM。`if` 已在 C02 的防御判断中出现；其作用是“条件满足才执行花括号中的语句”，C04 再集中讲控制流。

<details>
<summary>提示 B：不要让一个操作同时承担三种职责</summary>

`??` 选择缺失时的默认值；`Number` 转换输入；`Number.isSafeInteger` 和大小比较表达业务要求。三者不能互相代替。`rawQuantity.trim()` 会去掉首尾空白并产生字符串，用于判断输入是否全为空白；原字符串不会被它改掉。

先检查输入，再相加或相乘。两个输入都是安全整数，不保证它们的和或乘积仍在安全范围内，因此还要检查结果。

</details>

<details>
<summary>参考答案 A02：完整独立文件与验收</summary>

刷新空白页，再运行下面的完整文件；不要接着把它粘在错误文件后面，避免同名 `const` 重复声明。

```js title="inventory-answer.js"
// 参考答案：输入是文本，库存和金额在业务计算前转为经过检查的数字。
const savedStock = 0;
const stock = savedStock ?? 12;
const rawQuantity = "3";
const quantity = Number(rawQuantity);
const validQuantity = rawQuantity.trim() !== "" &&
  Number.isSafeInteger(quantity) && quantity > 0;
const validStock = Number.isSafeInteger(stock) && stock >= 0;
const unitPriceCents = 10;
const validPrice = Number.isSafeInteger(unitPriceCents) && unitPriceCents >= 0;

console.log("stock", stock);
console.log("validQuantity", validQuantity);
console.log("validStock", validStock);
console.log("validPrice", validPrice);

if (validStock && validQuantity) {
  const restocked = stock + quantity;
  if (Number.isSafeInteger(restocked)) {
    console.log("restocked", restocked);
  } else {
    console.log("restock rejected: unsafe integer");
  }
}

if (validPrice && validQuantity) {
  const totalCents = unitPriceCents * quantity;
  if (Number.isSafeInteger(totalCents)) {
    console.log("totalCents", totalCents);
    console.log("totalYuan", (totalCents / 100).toFixed(2));
  } else {
    console.log("price rejected: unsafe integer");
  }
}
```

默认输出：

```text
stock 0
validQuantity true
validStock true
validPrice true
restocked 3
totalCents 30
totalYuan 0.30
```

这段假定输入来自字符串，库存来自数字或空值；如果改成其他类型，应该按新的数据约定处理。它允许 `Number` 接受的其他合法数值表示，例如 `"1e2"` 得到 100；若产品只允许十进制数字字符，后续可按产品要求增加文本格式规则，不把 `Number` 误当成“只能输入数字字符”。

按下表每次只改一个输入，重新独立运行：

| 改动 | 应观察的结果 |
| --- | --- |
| `rawQuantity = ""`、`"   "`、`"0"`、`"-1"`、`"3.8"`、`"3件"` | `validQuantity false`，不输出补货结果或金额 |
| `rawQuantity = " 3 "` | 合法，仍补货 3、金额 30 分 |
| `savedStock = null` 或 `undefined` | stock 12，补货后 15 |
| `savedStock = -1` | validStock false，不输出补货结果；独立金额计算仍可完成 |
| `savedStock = "0"` | validStock false；默认值没有偷偷把文本变成数字 |
| `unitPriceCents = 0` | validPrice true，总价 0 分，显示 0.00 |
| `savedStock = Number.MAX_SAFE_INTEGER` | 输入本身合法，但加 3 越界，打印补货拒绝信息 |
| `unitPriceCents = Number.MAX_SAFE_INTEGER` | 输入本身合法，但乘 3 越界，打印金额拒绝信息 |

无效输入时本练习只打印校验标记，没有网页反馈；接回 C02 时，需要像已有表单一样显示原因并停止状态更新。

</details>

## 9. 接回库存项目：先统一数据边界，再写更多流程

C02 的输入 `value` 和 `textContent` 是文本，业务库存和件数应是检查过的数字，金额以约定单位计算，最后才转换为显示文本。以后从 URL、JSON 或存储读数据，也要先确认它的类型和业务含义；看到“12”两个字符不能自动假定它是 Number。

这次不把 BigInt 加进普通库存，也不引入金额库或测试框架。用固定输入、明确预期、检查边界，就已经在练习后续 UT 需要的思路：成功情况能算对，错误和缺失情况也有清楚行为。

离开前独立回答：

1. 为什么 `12 + "3"` 与 `12 - "3"` 的结果类型不同？
2. `typeof null`、`typeof NaN` 为什么不能代替业务校验？
3. `Number.isInteger` 与 `Number.isSafeInteger` 各能证明什么？
4. 保存的库存为 0 时，`|| 12` 与 `?? 12` 哪个符合“售完”的含义？
5. `Object.is` 能否比较两个商品对象的字段内容？

下一课 [C04 变量、作用域与控制流](../c04-scope-control/) 会解释本课的 `let`、`const`、条件与循环怎样组织代码，以及断点处的变量何时可读。全部课程见[课程目录](../../roadmap/)。

## 10. 资料与实际验证记录

核查日期 **2026-10-15**。Ecma 已发布的年度基线为 **ECMAScript 2026 / ECMA-262 第 17 版**，本课引用 TC39 的 `/2026/` 固定版；默认不带年份的在线规范继续演进，不能把草案名称当成发布声明。本课未使用尚未完成的提案。[Ecma 发布说明](https://ecma-international.org/news/ecma-international-approves-new-standards-14/)

正文提供了针对规则的直接链接；原始规范用于查证，不要求初学者通读。Java 对照查阅 JLS 与 BigDecimal 官方文档，Console 的操作入口查阅 Chrome 官方说明。

实际执行环境：**macOS arm64、Node 24.22.0、Chrome 155.0.8059.40**。在仓库根目录使用已固定的本地 Node，逐个执行 `examples/c03/*.js`，无第三方依赖；普通文件退出 0，故意失败的 `bigint-error.js` 退出 1 并包含 TypeError。Chrome 通过调试协议在独立空白页面中执行相同的 9 个完整文件，输出一致、错误类型符合预期；不是手动点击与粘贴的操作记录。学习者只需按前文选 Console 或已有 Node，不需要复现作者的缓存目录。

| ID / 文件 | 实际结果 | 验证边界 |
| --- | --- | --- |
| V01 / input.js | string、123、9、number、15 | 验证拼接、数值转换与类型 |
| V02 / types.js | 7 种原始类型、对象/数组/函数、动态赋值与空值日志符合正文 | Symbol 两次创建严格比较为 false |
| V03 / numbers.js | Number/BigInt 除法、浮点、NaN/Infinity、安全整数与 5970 分 / 59.70 | 仅此单位、输入与显示量级，不宣称完成通用财务计算 |
| E01 / bigint-error.js | 预期 TypeError，退出 1 | 故意错误，不算正常脚本通过 |
| V04 / conversion.js | 转换、真假、短路结果符合正文 | 空字符串默认值在终端日志中表现为空白，表格明确标注值 |
| V05 / comparison.js | 11 行输出与正文一致 | 同一对象身份与不同对象身份分别验证 |
| A01 / prediction.js | 8 行预测结果与答案一致 | 值和类型均核对 |
| E02 / inventory-broken.js | 12、123、浮点尾数与过宽校验已复现 | 仅用于定位错误，不能当成可用业务实现 |
| A02 / inventory-answer.js | 默认 0 → 3，30 分 / 0.30；空白/0/负数/小数/非法文本拒绝，缺失库存默认、赠品与结果越界均符合答案 | 17 个边界变体在 Node 使用临时替换执行；Chrome 验证默认完整文件，仓库文件保留正常默认输入 |

正文有标题的 JS 代码块与同名文件逐字核对；第 4、5 节两段代码合起来是完整的 `conversion.js`。本次**未将手动浏览器粘贴、Java 代码、Edge、Windows 或真实手机写成已验证**。实际运行记录只覆盖列出的环境与操作，不能替代所有宿主环境兼容性结论。完整命令、输出与来源清单见[examples/c03 的 README](https://github.com/socoo123/js_web/tree/main/examples/c03)。
