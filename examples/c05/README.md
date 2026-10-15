# C05：对象、引用与数据交换

本目录配套 [C05 正文](../../src/content/docs/02-language-data/c05-objects-json.md)，无第三方依赖。商品编号、名称、库存、整数价格分与仓库是贯穿例子；这里处理内存中的单条记录，不接服务器、不读写文件或浏览器存储。

## 自己尝试：浏览器为主线

操作方式：**自己尝试 · 浏览器 Console**。

1. 打开自己的 C02 页面，进入 DevTools → Console。
2. 一次复制下表一个完整 `.js` 文件，包括最外层 `{ ... }`。外层块避免不同次跟做的同名声明冲突。
3. 先预测输出，再执行，与本页实际日志比较。Console 额外显示的表达式求值结果 `undefined` 不属于 `console.log` 日志。
4. `answers.js` 是两个独立练习的参考答案，应先做正文的练习再看。

| 文件 | 目标 | 操作方式 | 验证状态 |
| --- | --- | --- | --- |
| `properties.js` / O01 | 字面量、点/方括号、自有属性、解构、可选链、删除 | 自己尝试 · Console | 已验证 |
| `references.js` / O02 | 别名、浅复制、嵌套共享、路径更新、参数传值 | 自己尝试 · Console | 已验证 |
| `json-boundaries.js` / J01 | JSON 省略、`null`、日期、共享身份、失败边界 | 自己尝试 · Console | 已验证 |
| `import-product.js` / J02 | 语法解析、形状校验、字段选择与转换 | 自己尝试 · Console | 已验证 |
| `strings-dates.js` / S01 | 字符串常用操作、UTC/偏移、业务日期跨日 | 自己尝试 · Console | 已验证 |
| `answers.js` / A01、A02 | 草稿独立、缺值与错误类型分开 | 自己尝试 · Console | 已验证 |

Java 与 JS 都按值传递参数：对象参数收到的值仍能找到同一对象；改其字段调用方能看见，给参数赋新对象不会替换调用方变量。不要把它写成“对象按引用传参”。

## 可选：本地 Node

操作方式：**自己尝试 · 本地 Node**。没有 Node 时沿用 Console，不要求提前安装。

已有 Node **24.22.0** 时，在你保存这些文件的实际目录执行：

```sh
cd /你的实际路径/c05-lab
node --version
node properties.js
node references.js
node json-boundaries.js
node import-product.js
node strings-dates.js
node answers.js
```

以上每个文件相互独立；无需根站点依赖或包管理器。作者在仓库根目录实际使用已准备的固定运行时，例如：

```sh
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c05/properties.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c05/references.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c05/json-boundaries.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c05/import-product.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c05/strings-dates.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c05/answers.js
```

## 实际日志与运行记录

日期 **2026-10-15**，macOS arm64，Node **24.22.0**，Chrome **155.0.8059.40**。浏览器通过 Chrome DevTools Protocol 执行六个原始完整文件，逐行日志与 Node 一致；不是人工操作每个 DevTools 面板的记录。没有给正常代码加转译或 polyfill。

### O01 `properties.js`

```text
键盘 12 机械键盘
undefined
true false
键盘 12 9 未分类
null
未提供
未提供
TypeError
外设 false
```

### O02 `references.js`

```text
true false
true
10 9 杭州
false
杭州 苏州
10
9
参数改绑后 0
调用后 7
```

### J01 `json-boundaries.js`

```text
string object 12
{"id":"KB-001","stock":null}
[null,null,null]
undefined
2026-10-15T01:30:00.000Z string
true false
BigInt TypeError
循环 TypeError
```

### J02 `import-product.js`

```text
{"id":"KB-001","name":"键盘","stock":12,"priceCents":19900,"warehouse":{"city":"上海"}}
false
JSON 语法错误
商品必须是对象
商品必须是对象
库存必须是非负安全整数
库存必须是非负安全整数
库存必须是非负安全整数
仓库必须是对象
```

第一行是选择并清理过的内部记录，第二行证明未知 `debug` 没进入结果；接着依次是尾逗号、`null`、数组、字符串库存、负库存、小数库存、`null` 仓库的失败结果。语法错误只稳定展示分类，不依赖引擎英文错误文案。

### S01 `strings-dates.js`

```text
KB-001 true
true true
001 00001
键盘/白色
["键盘","鼠标"]
商品 KB-001，剩余 12 件
2
true
2026-10-15T01:30:00.000Z
2026 10 15
true
2026-10-14
```

### A01、A02 `answers.js`

```text
12 上海 A-03
9 杭州 A-03
true true
未提供
未提供
上海
城市格式错误
```

### 补充边界：正文练习 C 与故障起始代码

同一日期，在上述 Node/Chrome 两个环境额外运行 J02 的导入函数，输入用基础记录 `{"id":"KB-001","name":"键盘","stock":12,"priceCents":19900}`，每次只替换下列字段。重现时把 `import-product.js` 的 `good` 替换为相应 JSON 文本，重跑整个文件：

| 输入变化 | 实际结果 |
| --- | --- |
| 库存 0，省略仓库 | `{"id":"KB-001","name":"键盘","stock":0,"priceCents":19900,"warehouse":{"city":"未提供"}}` |
| 价格分 `"19900"` | `价格分必须是非负安全整数` |
| 编号全空格 | `编号必须是非空字符串` |
| 库存 `9007199254740992` | `库存必须是非负安全整数` |
| 多出 JSON 字段 `"__proto__":{"polluted":true}` | 只输出约定字段，`Object.hasOwn(product, "__proto__")` 为 `false`，`product.polluted` 为 `undefined` |
| 价格分 -1 / 1.5 | 均为 `价格分必须是非负安全整数` |
| 名称全空格 | `名称必须是非空字符串` |
| 仓库城市 42 / 全空格 | 均为 `仓库城市必须是非空字符串` |

练习 A 起始故障在两环境实际复现：`draft = { ...original }` 后改 `draft.warehouse.city`，原记录变为 `12 / 杭州`，两个仓库身份相等；参考答案保留原记录 `12 / 上海 / A-03`，新记录 `9 / 杭州 / A-03`，两层身份均不同。

六个文件还分别在 Node 的 `TZ=UTC` 和 `TZ=Pacific/Honolulu` 下运行，输出逐行一致。S01 用 `Z`/显式偏移、`toISOString()` 和 `getUTC...` 避免依赖作者机器时区；不是断言本地 `toString()`/默认本地化输出也一致。父 agent 另在 Chrome 的 UTC 与 Asia/Shanghai 覆盖时区中执行日期文件，输出一致。

浏览器与 Node 双环境运行记录和额外边界验证脚本保存在忽略的 `.cache/qa/c05-language-results.json`、`.cache/qa/c05-language-qa.mjs`，不作为课程运行依赖。实际页面布局和站点构建由主 agent 统一验收，本目录不冒称已完成发布检查。

## 未执行与边界

- Edge、Safari、Windows、真实手机没有逐项执行这些文件；没有把单一 Chrome 验证说成全部浏览器通过。
- Sources 手动断点操作仅沿用已核对的 Chrome 面板步骤，本课没有逐项录制点击；实际协议运行与手动操作分开记录。
- `Intl.DateTimeFormat` 的时区选项只作为展示建议，本课未运行地区语言格式验收；不承诺不同 ICU 数据版本的标点、空格等完全一致。
- 导入器只接受 JSON 支持的数据类型及本文约定的商品形状；不是通用 schema 校验器，不接受类实例，不提供通用深复制。
- JSON 不保证保留方法、原型、共享身份、日期实例等；不要把默认 stringify/parse 往返当任意数据的无损复制。
- 商品编号转大写限定为本课程 ASCII 编号约定，不是所有地区语言文字的标准化规则。

## 官方核查来源

2026-10-15 核查；语言链接固定正式 ECMAScript 2026 分章版，避免把当前编辑草案当新发布年度标准。本课能力多为早已存在的标准能力，不代表全部新增于 ES2026。

- [对象字面量与展开](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-object-initializer)、[可选链](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html#sec-optional-chains)
- [解构绑定](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html#sec-destructuring-binding-patterns)
- [Object.hasOwn](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html#sec-object.hasown)
- [JSON.parse / JSON.stringify](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json-object)
- [Date、日期时间格式与 Date.parse](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html#sec-date-objects)
- [String 方法](https://tc39.es/ecma262/2026/multipage/text-processing.html#sec-string-objects)与 [UTF-16 字符串类型](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-string-type)
- [Oracle Java 对象参数传值](https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html)：该页基于 JDK 8，本课仅引用稳定参数机制。
- [WHATWG structuredClone 与结构化克隆边界](https://html.spec.whatwg.org/multipage/structured-data.html#structured-cloning)
- [ECMA-402 Intl.DateTimeFormat](https://tc39.es/ecma402/2026/#sec-intl-datetimeformat-constructor)
