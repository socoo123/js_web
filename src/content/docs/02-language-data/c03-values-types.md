---
title: C03 值、类型、转换与比较
description: 看懂 JS 的类型、数字精度、转换、默认值和相等比较，修好补货变成 123、售罄商品被改回 12 件的 bug。
sidebar:
  order: 3
---

> **第 1 周 · 第 2 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C02 · 运行：浏览器 Console 或 Node 24 · 示例已运行验证

## 这一课解决什么问题

给 C02 的商品卡片加一个「补货」按钮：库存 12 件，输入 3，点一下，页面显示 **123**。再点一下，变成 1233。

同一天，同事给后端没返回库存的商品写了默认值 `product.stock || 12`，结果已经售罄的无线鼠标也显示「库存 12 件」。

两个 bug 都不报错。问题出在你没想到某个值是什么类型，也没想到 JavaScript 会怎样替你转换它。Java 编译器会挡住大部分这类错误，JS 要靠你自己弄清每个值的类型。

学完你能：

- 用 `typeof` 查出值的类型，分清 `null` 和 `undefined`
- 解释 `5 / 2` 为什么是 2.5，金额为什么要存成整数「分」
- 把输入框的文本转换成数字并校验，不让空输入悄悄变成 0
- 在 `||` 和 `??` 之间选对默认值，保住库存 0
- 默认用 `===` 比较，说清两个内容相同的对象为什么不相等

例子在仓库的 [examples/c03](https://github.com/socoo123/js_web/tree/main/examples/c03)。在 Chrome 的任意网页按 F12 打开 Console，粘贴代码回车即可。本课的代码块可以依次贴在同一页，提示 `has already been declared` 时刷新再贴。装了 Node 的话，也可以在该目录运行 `node types.js`。

## Java 程序员先看这里

| Java | JavaScript | 差异 |
| --- | --- | --- |
| `int stock = 12;` | `let stock = 12;` | 变量不写类型，类型属于值 |
| `int`、`long`、`double` | Number | 只有一种数字，行为同 `double` |
| `BigInteger` | BigInt，写作 `12n` | 不能和 Number 直接混算 |
| `Integer.parseInt("3件")` 抛异常 | `Number("3件")` 得到 `NaN` | 转换失败不抛异常 |
| `if (stock)` 编译不通过 | `if (stock)` 合法 | 任何值都能当条件，`0` 和 `""` 算假 |
| `a.equals(b)` | 没有内置的内容比较 | `===` 比较对象身份，相当于 Java 的 `==` |

## 1. 值有类型，变量没有

JS 的变量只是一个名字，可以先指向字符串，再指向数字。类型跟着值走，用 [`typeof`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof) 查看。

```js title="types.js"
let quantity = "3"; // 刚从输入框读到的文本
console.log(typeof quantity); // → string
quantity = Number(quantity);
console.log(typeof quantity); // → number

console.log(typeof null);        // → object（历史遗留，null 不是对象）
console.log(typeof []);          // → object（数组也是对象）
console.log(typeof console.log); // → function
console.log(typeof notDeclared); // → undefined（未声明的名字也不报错）

const product = { id: "P001", stock: 12 };
console.log(product.stok);       // → undefined（属性名拼错了）
```

JS 有 7 种原始类型，加上对象（Object）共 8 种：

| 类型 | 写法 | 库存里的例子 |
| --- | --- | --- |
| String | `"P001"`、`"12"` | 商品编号、输入框的值；没有 char 类型 |
| Number | `12`、`399.5`、`NaN` | 库存件数、以分为单位的价格 |
| Boolean | `true`、`false` | 是否上架 |
| Undefined | `undefined` | 变量没赋值、属性不存在 |
| Null | `null` | 主动表示「没有」，如未选中商品 |
| BigInt | `12n` | 超大整数，如 64 位订单号 |
| Symbol | `Symbol("id")` | 唯一标记，本课程很少用到 |
| Object | `{ id: "P001" }`、`[]` | 商品记录、商品列表；函数也是对象 |

`typeof null` 是 `"object"`，这是 JavaScript 第一版实现留下的问题，为了兼容旧网页一直没改；数组也得到 `"object"`。判断空值写 `value === null`，判断数组用 `Array.isArray(value)`。

**null 和 undefined。** Java 只有 `null`，JS 有两个「没有值」。`undefined` 通常由语言给出：变量没赋值、属性不存在、函数没写 `return`。`null` 通常由程序员写出，表示「这里明确没有」。拼错的 `product.stok` 在 Java 里是编译错误，在 JS 里只是安静地得到 `undefined`，所以读到意外的 `undefined` 时，先查属性名和数据来源。

:::tip[自己尝试 · 浏览器 Console]
1. 在任意网页打开 Console。
2. 逐行输入并回车：`const input = document.createElement("input")`、`input.type = "number"`、`input.value = 3`。
3. 输入 `typeof input.value` 并回车。

预期：显示 `'string'`。赋进去的是数字 3，输入框也是 `type="number"`，读回来的 `value` 仍是字符串。开头的 123 就从这里开始。
:::

## 2. Number：只有一种数字

JS 的普通数字只有 Number 一种，它是 IEEE 754 双精度浮点数，也就是 Java 的 `double`。写成 `12` 也不会变成 `int`。

**先猜一猜：** 下面 6 行分别打印什么？

```js title="numbers.js"
console.log(5 / 2);
console.log(Math.trunc(5 / 2));
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(1 / 0);
console.log(0 / 0);
```

```text
2.5
2
0.30000000000000004
false
Infinity
NaN
```

把 Number 当成 `double`，这些结果就都不奇怪了。和 Java 对照：

| 表达式 | Java | JavaScript |
| --- | --- | --- |
| `5 / 2` | 2，两个 int 做整数除法 | 2.5；要取整就写 `Math.trunc(5 / 2)` |
| `0.1 + 0.2` | 0.30000000000000004（double） | 相同 |
| `1 / 0` | 抛 `ArithmeticException` | `Infinity` |
| `1.0 / 0`、`0.0 / 0` | `Infinity`、`NaN` | 相同 |

区别只在于 JS 没有 int，所以没有整数除法，也没有除以零的异常。`NaN` 表示「算不出有效的数」，`typeof NaN` 却是 `"number"`；判断它要用 [`Number.isNaN()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN)，原因见第 5 节。Java 一列可以用 `java JavaNumbers.java` 运行对照。

### 金额存成整数「分」

0.1 不能用二进制精确表示，所以 Java 里算钱用 `BigDecimal`。JS 没有内置的十进制小数类型，常见做法是把金额存成整数分：P002 无线鼠标 129.00 元，存成 `12900`。

```js title="money.js"
// P002 无线鼠标：单价 129.00 元，存成整数 12900 分
const priceCents = 12900;

console.log(129 * 0.9);                    // → 116.10000000000001（按元算九折）
console.log(Math.round(priceCents * 0.9)); // → 11610（按分算，再取整）

const totalCents = priceCents * 3;
const label = (totalCents / 100).toFixed(2);
console.log(totalCents);   // → 38700
console.log(label);        // → 387.00
console.log(typeof label); // → string
```

整数的加、减、乘没有误差。乘以折扣率这类会产生小数的计算，用 `Math.round` 回到整数分，舍入方式先和业务方约定。`toFixed(2)` 返回字符串，只用于显示。

### 超过 2⁵³ 的整数

Number 能精确表示的整数范围是 ±(2⁵³ − 1)，即 [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)。库存和金额远小于它，但 Java 后端常见的 `long` 型 ID 会超出。

```js title="bigint.js"
console.log(Number.MAX_SAFE_INTEGER); // → 9007199254740991
console.log(2 ** 53 === 2 ** 53 + 1); // → true，相邻整数已经分不开

const order = JSON.parse('{"orderId": 1234567890123456789}');
console.log(order.orderId);                       // → 1234567890123456800
console.log(Number.isSafeInteger(order.orderId)); // → false

console.log(1234567890123456789n + 1n); // → 1234567890123456790n
try {
  console.log(1n + 1);
} catch (error) {
  console.log(error.name); // → TypeError，BigInt 不能和 Number 混算
}
```

:::caution[Java 后端的 long 型 ID]
雪花算法这类 64 位 ID 经过 `JSON.parse` 后，末几位会被悄悄改掉。让后端把这类 ID 序列化成字符串（Jackson 可以在字段上加 `@JsonSerialize(using = ToStringSerializer.class)`），前端只当文本比较和显示。
:::

[BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt) 对应 Java 的 `BigInteger`：任意大小的整数，没有小数，`5n / 2n` 得到 `2n`。和 Number 混算会抛 `TypeError`，要先显式转换。

## 3. 文本变数字：转换以后还要校验

输入框、URL 参数、浏览器存储里读出来的都是字符串。`+` 只要碰到字符串就做拼接，这就是开头 123 的来源：

```js title="conversion.js"
console.log(12 + "3"); // → 123，字符串拼接
console.log(12 - "3"); // → 9，减法只做数学运算，"3" 先被转成数字

console.log(Number("3"));   // → 3
console.log(Number(" 3 ")); // → 3，忽略首尾空白
console.log(Number("3.8")); // → 3.8
console.log(Number("3件")); // → NaN
console.log(Number(""));    // → 0，空输入变成了 0

console.log(Number.parseInt("3件", 10)); // → 3，只读开头的数字
console.log(Number.parseInt("3.8", 10)); // → 3，小数被丢掉
```

`-`、`*`、`/` 会把字符串转成数字，所以 `12 - "3"` 碰巧得到 9。碰巧对的代码最危险，换成加法就错。

两种显式转换：

- `Number(text)` 要求整个字符串是一个数字，否则得到 `NaN`。陷阱是空字符串和纯空白字符串会变成 `0`。
- `Number.parseInt(text, 10)` 从头读到第一个非数字字符就停，所以 `"3件"` 和 `"3.8"` 都得到 3，参数 10 表示十进制。Java 的 `Integer.parseInt("3件")` 会抛 `NumberFormatException`，它却照单全收。旧代码里的全局 `parseInt` 是同一个函数。

两者都不抛异常，所以处理输入要分两步：先转换，再校验业务规则。补货数量要求是 1–99999 的整数：

```js title="parse-quantity.js"
function parseQuantity(text) {
  if (text.trim() === "") return null; // 空输入不能当成 0
  const quantity = Number(text);
  if (!Number.isInteger(quantity)) return null; // NaN 和小数都不是整数
  if (quantity < 1 || quantity > 99999) return null;
  return quantity;
}

console.log(parseQuantity("3"));   // → 3
console.log(parseQuantity(" 3 ")); // → 3
console.log(parseQuantity(""));    // → null
console.log(parseQuantity("3.8")); // → null
console.log(parseQuantity("3件")); // → null
console.log(parseQuantity("0"));   // → null
```

[`Number.isInteger`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger) 对 `NaN`、`Infinity` 和小数都返回 `false`，一次排除三类无效值。函数用 `null` 表示「没有有效数量」，调用方拿到 `null` 就提示用户，不改库存。

![流程图：外部输入都是 string，先在入口用 Number 转换，再校验非空、整数和范围。不通过就提示原因、库存不变；通过后才进入业务计算，最后用 toFixed 或 String 转回 string 显示。](../../../assets/diagrams/c03-value-boundary.svg)

从上往下读：文本只在入口处理一次，业务计算只接收检查过的数字，显示时才转回字符串。以后读 JSON、读浏览器存储、写 React 表单，都沿用这条边界。

## 4. truthy、falsy 与默认值

Java 的 `if` 只接受 boolean。JS 的条件可以是任何值，会按规则当成真或假：当成假的叫 **falsy**，其余的叫 **truthy**。记住这 8 个 falsy 值：`false`、`0`、`-0`、`0n`、`NaN`、`""`、`null`、`undefined`。

**先猜一猜：** 无线鼠标已经售罄，下面打印什么？

```js title="defaults.js"
const savedStock = 0; // P002 无线鼠标，已售罄
console.log(savedStock || 12);
console.log(savedStock ?? 12);

console.log(Boolean("0"), Boolean("false"), Boolean(""));
console.log(Boolean([]), Boolean({}));
```

```text
12
0
true true false
true true
```

`a || b` 在 `a` 为 falsy 时返回 `b`。库存 0 是 falsy，被换成了 12，售罄商品「复活」了。[`a ?? b`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) 只在 `a` 是 `null` 或 `undefined` 时返回 `b`，0 会保留。库存、价格、开关这类 0 和 `false` 有意义的字段，默认值一律用 `??`。它相当于 Java 的 `Objects.requireNonNullElse(stock, 12)`。

后两行说明：非空字符串都是 truthy，包括 `"0"` 和 `"false"`；空数组和空对象也是。所以 `if (product.stock)` 既不能判断「有没有库存字段」，也不能判断「有没有货」。判断字段缺失写 `product.stock === undefined`，判断有货写 `product.stock > 0`。

另一点和 Java 不同：`||`、`&&`、`??` 返回其中一个操作数，不一定是布尔值。`0 && "有货"` 的结果是 `0`。以后在 React 里写 `{stock && <Badge />}`，库存为 0 时页面上会多出一个 0，原因就在这里。

## 5. 相等：默认用 ===

JS 有两种相等运算符。`===`（严格相等）不做类型转换，类型不同直接得到 `false`。`==`（宽松相等）先按一套规则转换类型，再比较。

**先猜一猜：** 哪几行是 `true`？

```js title="equality.js"
console.log(3 === "3");
console.log(3 == "3");
console.log(0 == "");
console.log(0 == "0");
console.log("" == "0");
console.log(null == undefined);
console.log(null == 0);
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));
```

```text
false
true
true
true
false
true
false
false
true
```

`0 == ""` 和 `0 == "0"` 都成立，`"" == "0"` 却不成立，`==` 连传递性都不保证。它的规则不值得背：**一律用 `===` 和 `!==`**。常见的例外只有 `value == null`，它同时匹配 `null` 和 `undefined`，很多团队允许这一种写法。

`NaN` 和任何值都不相等，包括它自己，所以 `x === NaN` 永远是 `false`，要用 `Number.isNaN(x)`。[`Object.is`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 和 `===` 只有两处不同：认为 `NaN` 等于自己，认为 `0` 和 `-0` 不相等。日常用 `===` 就够了。

对象比较的是身份，不是内容：

```js title="identity.js"
const keyboard = { id: "P001", stock: 12 };
const sameKeyboard = keyboard;
const copied = { id: "P001", stock: 12 };

console.log(keyboard === sameKeyboard); // → true，同一个对象
console.log(keyboard === copied);       // → false，内容相同，但是两个对象
console.log(keyboard.id === copied.id); // → true，字符串按内容比较
```

对象的 `===` 相当于 Java 对象之间的 `==`。但 JS 没有内置的 `equals`，判断是否同一件商品要比较业务字段，比如 `a.id === b.id`。字符串正好相反：Java 比较字符串要用 `equals`，JS 的字符串是原始值，`===` 就按内容比较。

## 常见错误与调试

### 补货后库存变成 123

:::tip[自己尝试 · 本地网页]
1. 在终端进入仓库的 `examples/c03` 目录，和 C02 一样运行 `python3 -m http.server 8000 --bind 127.0.0.1`。
2. 用 Chrome 打开 `http://127.0.0.1:8000/restock.html`，按 F12 打开 DevTools。
3. 按下面的步骤找到原因，再修改 `restock.js`。

预期：修好后，库存 12 补货 3 显示 15；清空输入框再点补货，页面提示「请输入 1–99999 的整数。」，库存不变。
:::

**现象**：页面显示库存 12、补货数量 3。点「补货」后显示 123，再点一次变成 1233。Console 没有任何报错。

**工具**：打开 Sources，在左侧文件树选中 `restock.js`，单击 `stock = stock + amount;` 的行号设置断点。回到页面点「补货」，代码会停在这一行执行之前。处理函数如下：

```js
function handleRestock() {
  // 有问题的写法：直接拿输入框的 value 参与加法
  const amount = amountInput.value;
  stock = stock + amount;
  stockNode.textContent = String(stock);
  feedback.textContent = "已补货 " + amount + " 件。";
}
```

**证据**：看右侧 Scope 面板。Local 里的 `amount` 显示为带引号的 `"3"`，是字符串；Script 里的 `stock` 是数字 12。点 Resume 继续，再点一次「补货」，停住时 `stock` 已经是 `"123"`。暂停期间在 Console 输入 `typeof amount`，也会得到 `'string'`。

**原因**：输入框的 `value` 永远是字符串，`12 + "3"` 做的是拼接。第一次之后 `stock` 也成了字符串，第二次就是 `"123" + "3"`。

**修复**：把第 3 节的 `parseQuantity` 复制到 `restock.js` 开头，读取那行改成 `const amount = parseQuantity(amountInput.value);`，在 `amount === null` 时写提示并 `return`。完整版本见同目录的 `restock-fixed.js`。

**确认**：删掉断点，刷新页面，补货 3 后显示 15；清空输入框再点补货，库存仍是 15，页面提示输入无效。

不打断点时，日志写成 `console.log({ amount, stock })`，而不是 `console.log(amount)`。直接打印的 `"3"` 和 3 看起来一样；放进对象后，Console 会给字符串加引号，显示 `{amount: '3', stock: 12}`。

## 练习

### 练习 1：预测值和类型

先在纸上写出每行的**值和类型**，再运行 `prediction.js` 核对。

```js title="prediction.js"
// 先写出每行的值和类型，再运行核对
console.log("12" + 3);
console.log("12" - 3);
console.log(Number("  "));
console.log(Boolean("0"));
console.log(0 ?? 12);
console.log(null || "未分类");
console.log(5n / 2n);
console.log({ id: "P001" } === { id: "P001" });
```

<details>
<summary>提示</summary>

先看运算符：`+` 遇到字符串就拼接，`-` 只做数学运算。`Boolean` 只看字符串是否为空；`??` 只看左边是不是 `null` 或 `undefined`；`||` 看左边是不是 falsy。

</details>

<details>
<summary>参考答案</summary>

| 行 | 值 | 类型 | 原因 |
| --- | --- | --- | --- |
| `"12" + 3` | `"123"` | string | 有字符串，`+` 做拼接 |
| `"12" - 3` | `9` | number | 减法把 `"12"` 转成数字 |
| `Number("  ")` | `0` | number | 纯空白转成 0，所以 `parseQuantity` 先判空 |
| `Boolean("0")` | `true` | boolean | 非空字符串都是 truthy |
| `0 ?? 12` | `0` | number | 0 不是 `null` 或 `undefined` |
| `null \|\| "未分类"` | `"未分类"` | string | `null` 是 falsy |
| `5n / 2n` | `2n` | bigint | BigInt 除法丢掉小数 |
| 对象字面量 `===` | `false` | boolean | 两个不同的对象 |

第一行打印出来是不带引号的 `123`，和数字看起来一样。要核对类型，改成 `console.log(typeof ("12" + 3))`。

</details>

### 练习 2：修好补货和库存价值

`inventory-broken.js` 模拟一次补货：P002 无线鼠标已售罄，补货 3 件，再计算库存价值。代码能运行，但结果不对。

```js title="inventory-broken.js"
// 有问题的写法：默认库存、补货计算和数量校验各有一个 bug
const product = { id: "P002", name: "无线鼠标", stock: 0, priceCents: 12900 };
const rawAmount = "3"; // 补货输入框读到的文本

const stock = product.stock || 12;
const amount = Number.parseInt(rawAmount, 10);

if (Number.isNaN(amount)) {
  console.log("补货数量无效");
} else {
  const newStock = stock + rawAmount;
  const valueCents = newStock * product.priceCents;
  console.log("补货后库存", newStock);
  console.log("库存价值", (valueCents / 100).toFixed(2), "元");
}
```

现在它打印 `补货后库存 123` 和 `库存价值 15867.00 元`。修改代码，满足以下三条：

1. 默认输入打印 `补货后库存 3` 和 `库存价值 387.00 元`。
2. 把 `rawAmount` 改成 `"3.8"`、`""` 或 `"3件"`，都打印 `补货数量无效`。
3. 删掉 `product` 里的 `stock` 字段（模拟后端没有返回库存），按默认 12 件计算，打印 `补货后库存 15` 和 `库存价值 1935.00 元`。

<details>
<summary>提示</summary>

一共 3 个 bug：默认值用错了运算符；补货时加的是原始文本，不是转换后的数字；`parseInt` 会把 `"3.8"` 和 `"3件"` 读成 3，`Number.isNaN` 拦不住它们。第 3 节的 `parseQuantity` 可以直接拿来用。

</details>

<details>
<summary>参考答案</summary>

```js title="inventory-answer.js"
function parseQuantity(text) {
  if (text.trim() === "") return null;
  const quantity = Number(text);
  if (!Number.isInteger(quantity)) return null;
  if (quantity < 1 || quantity > 99999) return null;
  return quantity;
}

const product = { id: "P002", name: "无线鼠标", stock: 0, priceCents: 12900 };
const rawAmount = "3"; // 补货输入框读到的文本

const stock = product.stock ?? 12;
const amount = parseQuantity(rawAmount);

if (amount === null) {
  console.log("补货数量无效");
} else {
  const newStock = stock + amount;
  const valueCents = newStock * product.priceCents;
  console.log("补货后库存", newStock);
  console.log("库存价值", (valueCents / 100).toFixed(2), "元");
}
```

改了三处：

1. `|| 12` 改成 `?? 12`。售罄的 0 是有意义的值，只有字段缺失（`undefined`）时才用默认值。
2. `stock + rawAmount` 改成 `stock + amount`。`rawAmount` 是字符串，`+` 会拼接。原来的库存价值也能算出数，是因为 `*` 把 `"123"` 转成了 123，错误藏得更深。
3. `parseInt` 加 `isNaN` 换成 `parseQuantity`。`parseInt` 把 `"3.8"` 和 `"3件"` 都读成 3，`isNaN` 查不出来；`parseQuantity` 转换整个字符串，再要求结果是 1–99999 的整数。

</details>

## 小结

- 变量没有类型，值有。`typeof null` 和 `typeof []` 都是 `"object"`。
- Number 就是 Java 的 `double`。金额存成整数分，超过 2⁵³ 的 ID 用字符串传输。
- 外部输入都是字符串：先用 `Number` 转换，再校验非空、整数和范围。
- 默认值用 `??`，否则库存 0 会被当成 falsy 替换掉。
- 比较一律用 `===`。对象比较的是身份，同一件商品要比较 `id`。

自测：

1. `12 + "3"` 和 `12 - "3"` 的结果为什么类型不同？
2. 为什么 `Number("")` 对表单校验很危险？
3. 库存为 0 时，`stock || 12` 和 `stock ?? 12` 分别得到什么？
4. 后端返回订单号 `1234567890123456789`，前端应该怎么接收？
5. 两个字段完全相同的商品对象，`===` 为什么返回 `false`？

下一课讲变量、作用域与控制流：`let`、`const`、`var` 的区别，以及断点停住时为什么有的变量还不能读。

## 延伸阅读

- [MDN：JavaScript 数据类型和数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Data_structures)
- [MDN：Number](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number)
- [MDN：相等比较和相同性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness)
- [MDN：Falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)
- [Chrome DevTools：调试 JavaScript](https://developer.chrome.com/docs/devtools/javascript)
- [ECMAScript 2026：数据类型和值](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
