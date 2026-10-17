---
title: ES 版本速查
description: 按年份查找现代 JavaScript 的代表能力，分清年度标准、提案阶段和目标环境支持。
sidebar:
  order: 1
---

这是查阅索引。遇到具体问题时回到对应课程跟做，再来这里查年度归属。判断新能力的方法见 [C16](../../03-async-modules/c16-modules-dependencies/)。

## 怎样读这张表

“属于 ES2023”说明能力进入了哪一版语言标准；“Chrome 支持”说明某个实现能否使用。它们是两件事。Node 与浏览器还提供各自的宿主 API，例如 fs、DOM；这些 API 不能仅按 ECMAScript 年份分类。

下表挑选与课程最相关的代表能力，**不是各年度全部新增项**。支持列以 Node 24 和 Chrome 155 为目标基线，只覆盖列出的能力。换成实际项目的旧版目标时，打开对应 MDN 页的 Browser compatibility，继续按版本判断。

## ES2015–ES2025：常用能力索引

| 年度 | 代表能力解决什么问题 | 在目标基线中的支持 | 首次讲解或查阅入口 |
| --- | --- | --- | --- |
| ES2015（也叫 ES6） | let/const 管作用域；箭头函数、class、模块组织代码；Map/Set 管集合，Promise 组织异步 | 可用 | [变量 C04](../../02-language-data/c04-scope-control/)、[函数 C06](../../02-language-data/c06-functions-closures/)、[class C07](../../02-language-data/c07-this-prototypes/)、[集合 C09](../../02-language-data/c09-maps-sets/)、[Promise C12](../../03-async-modules/c12-callbacks-promises/)、[模块 C16](../../03-async-modules/c16-modules-dependencies/) |
| ES2016 | includes 判断数组是否包含值；** 表示乘方 | 可用 | includes 见 [C08](../../02-language-data/c08-arrays-processing/) |
| ES2017 | async/await 让 Promise 流程顺序可读；Object.entries 把键值对取成数组 | 可用 | [异步 C13](../../03-async-modules/c13-async-await-fetch/)、[键值对 C09](../../02-language-data/c09-maps-sets/) |
| ES2018 | 对象展开与 rest 方便复制和拆字段；Promise.finally 统一收尾 | 可用 | [对象 C05](../../02-language-data/c05-objects-json/)、[finally C12](../../03-async-modules/c12-callbacks-promises/) |
| ES2019 | flat 展平数组；Object.fromEntries 从键值对建立对象 | 可用 | 本页索引：[flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)、[fromEntries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries) |
| ES2020 | ?? 保住 0，?. 处理空值；BigInt 表示大整数；allSettled 收集全部异步结果 | 可用 | [默认值与大整数 C03](../../02-language-data/c03-values-types/)、[可选链 C05](../../02-language-data/c05-objects-json/)、[请求 C13](../../03-async-modules/c13-async-await-fetch/) |
| ES2021 | replaceAll 替换全部匹配文本；Promise.any 取首个成功结果 | 可用 | 本页索引：[replaceAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll)、[any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) |
| ES2022 | Object.hasOwn 查自有属性；class 私有元素表达内部状态；at 用负下标从尾部取值 | 可用 | [hasOwn C05](../../02-language-data/c05-objects-json/)、[私有元素 C07](../../02-language-data/c07-this-prototypes/)、[at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) |
| ES2023 | toSorted/toSpliced 返回新数组；findLast 从后往前查找 | 可用 | [数组复制方法 C08](../../02-language-data/c08-arrays-processing/)；findLast 为本页索引 |
| ES2024 | Object.groupBy/Map.groupBy 直接分组；Promise.withResolvers 分开创建 Promise 与其 resolve/reject | 可用 | [Map.groupBy C16](../../03-async-modules/c16-modules-dependencies/)；其他为本页索引 |
| ES2025 | Iterator 的 map 等辅助方法按需处理序列；Set 的 union 等方法表达集合运算 | 可用 | 本页索引：[Iterator.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/map)、[Set.union](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/union) |

年度表的代表功能可运行仓库 examples/c16/annual-support.js，浏览器可打开同目录的 support-browser.html 查看 Console。它检验代表行为与方法存在性，不等于对某一年度做完整符合性测试。

## ES2026：标准已经出版，运行时支持逐项判断

Ecma 已发布 ECMAScript 2026，第 17 版。下表列出新增组的主要 API；本课只做索引，不要求在库存页中采用。年度归属依据固定年度标准与 TC39 完成提案表，环境列是方法存在性检查，JSON 一行额外读取 source 字段。

| 新增组与用途 | 主要 API 或入口 | Node 24 | Chrome 155 |
| --- | --- | --- | --- |
| Map/WeakMap Upsert：缺键时保存默认值或计算结果 | getOrInsert / getOrInsertComputed | 本次检查的方法缺失 | 存在 |
| JSON 源文本访问：reviver 可读取原始数字文本 | [JSON.parse 的 context.source](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter) | 能读取 | 能读取 |
| Iterator Sequencing：顺序拼接多个可迭代对象 | [Iterator.concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/concat) | 缺失 | 存在 |
| 字节与文本互转 | [Uint8Array.fromBase64](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64)、toBase64、fromHex、toHex | 本次检查的方法缺失 | 存在 |
| 更精确地累加浮点数 | [Math.sumPrecise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sumPrecise) | 缺失 | 存在 |
| 辨认 Error 对象 | [Error.isError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError) | 存在 | 存在 |
| 把异步来源收集成数组 | [Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync) | 存在 | 存在 |

同一份环境探测在 Node 与浏览器会得到不同输出。运行 examples/c16/year-support.js 时，以自己的结果和 MDN 兼容表作决定。金额仍按课程约定存整数分；sumPrecise 不是十进制定点金额类型。

## Stage 4、在研提案和标准年份

Stage 0、1、2、2.7、3 表示在研阶段；Stage 4 表示流程已完成。完成后进入哪一年度，继续看出版版本。当前完成提案表把 Temporal 与 Explicit Resource Management 的预计出版年列为 2027，不能因为某个环境提前实现，就把它们写成 ES2026 的新增项。

遇到方法缺失，选择兼容实现或已有写法；遇到新语法解析失败，则要转换语法或调整目标环境，普通 if 检查无法让解析器忽略它。

## 来源与继续阅读

- [MDN：JavaScript 模块与兼容性入口](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Ecma：已出版年度标准](https://ecma-international.org/publications-and-standards/standards/ecma-262/)
- [ECMAScript 2026 固定年度文本](https://tc39.es/ecma262/2026/multipage/)
- [TC39：完成提案与预计出版年](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [TC39：提案流程](https://tc39.es/process-document/)
