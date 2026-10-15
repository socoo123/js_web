# C03：值、类型、转换与比较

配套正文：[C03 Markdown](../../src/content/docs/02-language-data/c03-values-types.md)。这是独立的语言练习，无第三方依赖，不需要修改 C02 文件或启动整个网站。

## 操作方式与文件

**自己尝试 · 浏览器 Console** 是主线，无需安装 Node。打开空白页的 DevTools Console，把一个完整 `.js` 文件的内容一次粘贴执行；运行下一文件前刷新空白页，避免同名 `const` 重复声明。先预测值和类型，再运行核对；`console.log` 返回的 `undefined` 不属于日志内容。浏览器界面可能给字符串加引号，类型不会因此变化。

| 文件 | 用途 | 验证状态 |
| --- | --- | --- |
| `input.js` | C02 输入文本、加法拼接与显式转换 | 已在 Node / Chrome 执行 |
| `types.js` | 7 种原始类型、对象、typeof、空值、Symbol | 已在 Node / Chrome 执行 |
| `numbers.js` | Number/BigInt、浮点、安全整数、整数分 | 已在 Node / Chrome 执行 |
| `bigint-error.js` | 故意混算，预期 TypeError | 已在 Node / Chrome 复现预期错误 |
| `conversion.js` | Number/String/Boolean、truthy、默认值与短路 | 已在 Node / Chrome 执行 |
| `comparison.js` | ===、==、Object.is 与对象身份 | 已在 Node / Chrome 执行 |
| `prediction.js` | 必做预测题 A01 | 已在 Node / Chrome 执行 |
| `inventory-broken.js` | 必做修错题起点 E02，有意保留错误 | 已在 Node / Chrome 复现错误结果 |
| `inventory-answer.js` | 独立参考答案 A02 | 默认文件已在 Node / Chrome 执行；17 个边界变体在 Node 执行 |

正文每个带文件名的 JS 代码块与对应文件逐字一致。`conversion.js` 在正文第 4、5 节拆成两个连续片段，按顺序合并与文件一致；片段无需从上段取得变量。Java 对照是放进 `main` 的语句，只核对官方资料，本次未执行 Java。

## 已有 Node 时的可选运行方式

**自己尝试 · 本地 Node。** 作者基线为 Node **24.22.0**。本课不要求安装；运行时与包管理器在 C17–C20 学习。先进入仓库根目录，例如 `cd /你的实际路径/js_web`，再逐个运行：

```sh
node --version
node examples/c03/input.js
node examples/c03/types.js
node examples/c03/numbers.js
node examples/c03/conversion.js
node examples/c03/comparison.js
node examples/c03/prediction.js
node examples/c03/inventory-broken.js
node examples/c03/inventory-answer.js
node examples/c03/bigint-error.js
```

如果只下载本目录，进入保存 `.js` 的目录后用 `node input.js` 等命令。不要把终端命令贴进浏览器 Console。`bigint-error.js` 会故意退出失败，单独运行它，不把失败当成缺依赖，也不使用它作为正常业务代码。

## 默认输出

**验证状态：已验证。** 2026-10-15，macOS arm64，Node 24.22.0。作者实际使用仓库缓存中的固定 Node；等价的单文件实际命令是：

```sh
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c03/input.js
```

作者逐个执行了上表 9 个文件；8 个退出 0，故意失败文件退出 1。缓存路径只用于复现作者环境，不是学习者需要安装的依赖。以下摘录 stdout，故意错误摘录错误首行：

`input.js`：

```text
string
123
9
number
15
```

`types.js`：

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

`numbers.js`：

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

`conversion.js`：

```text
3
0 0
0 NaN
NaN 3.5
false
true
3
12 string
false true true
false true
true true
12 0
true false
未命名
12 12
NaN
允许售出 0
```

其中 `console.log("" || "未命名", "" ?? "未命名")` 传入两个值：`"未命名"` 与 `""`。终端该行末尾还有用于分隔的空白，不能误读成只执行了一个表达式；上方为便于阅读省略该行末尾空白。Chrome 协议记录也确认第二个参数是空字符串。

`comparison.js`：

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

`prediction.js`：

```text
123
9
true
0
false
true
2n
false
```

类型依次是 string、number、boolean、number、boolean、boolean、bigint、boolean。答案不只比较日志字符。

`inventory-broken.js`（错误结果，不是期望业务行为）：

```text
stock 12
restocked 123
totalYuan 0.30000000000000004
valid true
```

`inventory-answer.js`：

```text
stock 0
validQuantity true
validStock true
validPrice true
restocked 3
totalCents 30
totalYuan 0.30
```

`bigint-error.js`：

```text
TypeError: Cannot mix BigInt and other types, use explicit conversions
```

错误定位在 `bigint-error.js` 第 2 行。完整堆栈含作者路径和 Node 内部帧，此处只保留有教学意义的错误首行。各引擎错误措辞不保证完全一致。

Chrome **155.0.8059.40** 通过调试协议在每个文件独立的空白页面执行同一份源码，9 个文件与上述值、类型和预期错误一致。自动化记录捕获了 console 参数本身，因此区分字符串 `"123"`、数字 9、格式化字符串 `"0.30"`。没有把这次协议执行写成手动面板点击或粘贴的记录。

## 参考答案的边界验证

**验证状态：已在 Node 24.22.0 执行。** 对 `inventory-answer.js` 每次只替换一处输入，将临时代码交给 Node `--input-type=module -e` 执行；文件原文没有留下坏输入。17 个变体均退出 0，并检查以下可观察输出；这些变体没有另做浏览器执行。

| 替换值 | 实际结果 |
| --- | --- |
| rawQuantity 为 `""` | validQuantity false；不计算补货或金额 |
| rawQuantity 为 `"   "` | 同上 |
| rawQuantity 为 `"0"` | 同上 |
| rawQuantity 为 `"-1"` | 同上 |
| rawQuantity 为 `"3.8"` | 同上，没有截为 3 |
| rawQuantity 为 `"3件"` | 同上 |
| rawQuantity 为 `"9007199254740992"` | 同上，超出安全整数范围 |
| rawQuantity 为 `" 3 "` | 合法，补货 3，总价 30 分 |
| rawQuantity 为 `"1e2"` | 合法，补货 100，总价 1000 分，显示 10.00 |
| savedStock 为 null | 默认 12，补货后 15 |
| savedStock 为 undefined | 默认 12，补货后 15 |
| savedStock 为 -1 | validStock false，不输出补货；独立金额计算仍完成 |
| savedStock 为 `"0"` | validStock false，不偷偷接受文本库存；金额独立计算 |
| unitPriceCents 为 0 | validPrice true，总价 0 分 / 0.00 |
| unitPriceCents 为 -1 | validPrice false，不计算金额；补货独立计算 |
| savedStock 为 Number.MAX_SAFE_INTEGER | 输入合法，加 3 结果不安全，输出 `restock rejected: unsafe integer` |
| unitPriceCents 为 Number.MAX_SAFE_INTEGER | 输入合法，乘 3 结果不安全，输出 `price rejected: unsafe integer` |

本例约定数量输入是字符串，库存是数字或空值；`trim()` 不负责处理非字符串类型。`Number` 接受指数等表示；若要求仅允许十进制数字字符，应额外定义文本规则。价格使用小额整数分，格式化代码不是覆盖所有范围、币种、税费和分摊规则的财务方案。

常见失败原因：在同页重复粘贴两个文件造成 `const` 重复声明；只检查最终字符而忽略类型；用 `parseInt` 截去应被拒绝的小数；把 `Boolean` 当作业务校验；把 `??` 当作自动转换和校验。

## 来源与未验证范围

核查日期：**2026-10-15**。本课使用已定稿的语言特性，不用未完成提案；固定 `/2026/` 规范与不断演进的默认在线草案分开。

- [Ecma 第 17 版 / ECMAScript 2026 发布说明](https://ecma-international.org/news/ecma-international-approves-new-standards-14/)
- [ECMAScript 2026 类型](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types)
- [类型转换与比较](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [typeof、加法、逻辑与空值合并](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [Number、安全整数、格式化](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html)
- [parseInt](https://tc39.es/ecma262/2026/multipage/global-object.html#sec-parseint-string-radix)
- [Object.is](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html#sec-object.is)
- [浏览器 document.all 历史特例](https://tc39.es/ecma262/2026/multipage/additional-ecmascript-features-for-web-browsers.html#sec-IsHTMLDDA-internal-slot)
- [JLS：除法](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.17.2)
- [Java BigDecimal](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html)
- [Chrome Console 执行 JavaScript](https://developer.chrome.com/docs/devtools/console/javascript)

Java 代码、手动 Console 操作、Edge、Windows、真实手机均未执行。本课不涉及 DOM 交互、接口请求、持久化或生产财务系统；静态站的构建、部署与线上阅读验收由网站发布步骤另行记录。
