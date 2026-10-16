---
title: C05 对象、引用与数据交换
description: 用商品编辑草稿理解属性、解构与浅复制，校验 JSON 导入，并分清时间点和业务日期。
sidebar:
  order: 5
---

> **第 1 周 · 第 3 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C03、C04 · 运行：浏览器 Console 或 Node 24 · 示例已运行验证

## 这一课解决什么问题

商品编辑页有一个「取消」按钮。你先写 `const draft = { ...product }` 保存草稿，修改库存再取消，原库存还在；修改仓库城市再取消，原商品的城市却已经变了。

接着做 JSON 导入：文件能解析，库存却是字符串 `"0"`，补货 3 件显示成了 `"03"`。代码没有报错，数据已经走错了路。

本课先解释对象共享，再把外部文本变成合格记录。

学完你能：

- 用点、方括号和可选链读取字段，区分属性缺失与值为 `undefined`
- 解释解构默认值、改名和字符串清洗的结果
- 画出别名与浅复制的共享关系，按修改路径创建新对象
- 区分 JSON 语法和商品规则，拒绝字符串库存与非法值
- 用带偏移的日期时间交换时间点，保住业务日期的含义

例子在仓库的 [examples/c05](https://github.com/socoo123/js_web/tree/main/examples/c05)。在 Chrome 打开网页，按 F12 进入 Console，依次粘贴代码块；重复声明时刷新再贴。已有 Node 可在该目录运行 `node properties.js`，其余文件换名。

## Java 程序员先看这里

| Java | JavaScript | 差异 |
| --- | --- | --- |
| DTO / record 聚合字段 | 对象字面量 `{ id, stock: 12 }` | 直接创建记录，字段由代码检查 |
| 两个引用指向同一对象 | `const alias = original` | 同样共享身份；`{ ...original }` 才新建外层对象 |
| 对象参数传值 | 函数收到引用值的副本 | 改字段影响共享对象，改形参只影响函数内部 |
| `String` 不可变 | `trim()` 等返回新字符串 | 两者都用 UTF-16，`length` 未必是可见字符数 |
| JSON 库绑定 DTO；`Instant` / `LocalDate` | `JSON.parse`；`Date` / 日期字符串 | 解析后仍要校验，时间点和日历日期分开表示 |

## 1. 对象属性：固定字段用点，动态字段用方括号

[对象字面量](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_objects)把相关字段放在一起。冒号左边是属性名，右边是值；`{ id }` 是 `{ id: id }` 的简写，前提是已经有同名变量。

```js title="properties.js"
const id = "P001";
const product = {
  id,
  name: "机械键盘",
  category: "外设",
  stock: 12,
  priceCents: 39900,
  tags: ["热销"],
};
const field = "stock";
console.log(product.name, product[field]); // → 机械键盘 12
console.log(product.field);               // → undefined
product.note = undefined;
console.log(Object.hasOwn(product, "note"));    // → true
console.log(Object.hasOwn(product, "missing")); // → false
product.stock = 15;
delete product.note;
console.log(product.stock, Object.hasOwn(product, "note")); // → 15 false
```

`product.name` 固定读 `name`，`product[field]` 先算出 `field` 的值 `"stock"`，再读库存。`product.field` 找的是字面上的 `field` 属性，所以得到 `undefined`。如果属性叫 `"display-name"`，就写 `product["display-name"]`。

赋值可以添加、更新属性，`delete` 删除属性。C04 的 `const` 限制变量重新赋值，这些操作都发生在对象内部。

`note` 存在但值为 `undefined`，`missing` 则不存在，单看读取结果分不清。[`Object.hasOwn`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)回答「对象自身有没有这个属性」，所以前者是 `true`，后者是 `false`。需要区分「未填写」和「没传字段」时就用它。

Java DTO 的字段通常由类声明固定下来；JS 普通对象可以随时添删字段，拼写一致要靠你检查。

### 深层字段可能缺失时，用可选链

[`?.`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining)在左侧为 `null` 或 `undefined` 时停止这条链，得到 `undefined`；接上 `??` 就能给显示默认值。

```js title="optional.js"
const detailed = { id: "P001", warehouse: { city: "上海" } };
const brief = { id: "P002" };
const selected = null;
console.log(detailed.warehouse?.city ?? "未提供"); // → 上海
console.log(brief.warehouse?.city ?? "未提供");    // → 未提供
console.log(selected?.warehouse?.city ?? "未提供"); // → 未提供
console.log(({ stock: 0 }).stock ?? 12); // → 0
```

`brief` 存在，缺的是 `warehouse`，所以在它后面写 `?.city`。`selected` 自己就可能为空，因此从 `selected?.warehouse` 开始保护。在可能为空的接收者后面放 `?.`。

这和 Java 先判空再逐层访问的目标相同。可选链保留库存 0，也保留字符串 `"0"`：它处理空值，字段类型由导入校验负责。

## 2. 解构与字符串：拿到值，再决定怎样清洗

[解构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring)用一行从对象里读取多个字段。它声明的是变量，不是会自动追踪对象的视图。

**先猜一猜：** 解构之后把库存改成 15，局部变量 `stock` 是多少？`note: null` 会触发默认值吗？

```js title="destructuring.js"
const keyboard = { id: "P001", name: "机械键盘", stock: 12 };
const { name: productName, stock, category = "未分类" } = keyboard;
keyboard.stock = 15;
console.log(productName, stock, keyboard.stock, category);
// → 机械键盘 12 15 未分类
const { note = "暂无备注" } = { note: null };
console.log(note); // → null
```

`name: productName` 把 `name` 属性的值存进局部变量 `productName`，对象里的属性仍叫 `name`。`stock` 读取当时的数字 12，后来改 `keyboard.stock` 不会更新这个局部变量。

默认值 `= "未分类"` 只在读到 **`undefined`** 时生效；明确传入的 `null` 会留下来。这与 `??` 同时接管 `null` 和 `undefined` 不同。整个对象为空时，先处理缺值再解构。

Java 的 `int stock = dto.stock;` 也是读取当时的值；解构内层对象则会得到引用值。

### 字符串清洗会返回新字符串

库存编号约定为 `P` 加三位数字。导入的 `" p001 "` 可以先去掉首尾空白，再统一大写；字符串方法会返回结果，原字符串保持原样。

```js title="strings.js"
const rawId = " p001 ";
const cleanId = rawId.trim().toUpperCase();
console.log(cleanId, rawId === " p001 "); // → P001 true
console.log(cleanId.startsWith("P"), cleanId.includes("001")); // → true true
console.log(cleanId.slice(1)); // → 001
console.log(`商品 ${cleanId}，剩余 ${12} 件`); // → 商品 P001，剩余 12 件
console.log("😀".length); // → 2
```

`rawId` 仍是 `" p001 "`，所以输出 `true`。单独调用 `rawId.trim()` 没接住结果，空格仍在。和 Java `String` 一样，清洗后要保存返回值。

常用操作按返回什么来记：

| 写法 | 返回什么 | 本例用途 |
| --- | --- | --- |
| `trim()`、`toUpperCase()` / `toLowerCase()` | 新字符串 | 清理首尾空白、统一编号或搜索词大小写 |
| `startsWith("P")`、`includes("001")` | 布尔值 | 检查前缀、查找片段；区分大小写 |
| `slice(1)`、`slice(0, 2)` | 新字符串 | 从下标 1 取到末尾，或取下标 0、1；终点不含在内 |
| 反引号与 `${表达式}` | 新字符串 | 组合商品说明，普通引号不会插值 |

这些方法见 [MDN String](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String)。`"😀".length` 是 2，因为长度统计 UTF-16 码元；这点与 Java `String.length()` 相同。本课程长度限制按 `length` 检查。

## 3. 别名与浅复制：新的外层可能仍共享内层

赋值复制的是值。对象变量保存的引用值复制后，两个名字仍指向同一个对象；对象展开 `{ ...original }` 会创建新外层，但属性里存着的内层引用值也只是被复制过去。

**先猜一猜：** 改草稿里的城市，原商品的城市会变吗？这里给商品附加一个仓库对象，方便观察两层数据。

```js title="references.js"
const original = { id: "P001", stock: 12, warehouse: { city: "上海" } };
const alias = original;
const draft = { ...original, stock: 15 };
console.log(alias === original, draft === original); // → true false
console.log(draft.warehouse === original.warehouse); // → true
alias.stock = 13;
draft.warehouse.city = "杭州";
console.log(original.stock, draft.stock, original.warehouse.city);
// → 13 15 杭州
```

第一行身份比较说明：`alias` 和 `original` 是同一个对象，`draft` 是新对象。第二行说明：两个外层的 `warehouse` 仍指向同一个仓库。改 `alias.stock` 就改了原商品库存；改 `draft.warehouse.city` 就改了双方共享的城市。

![对象关系图：original 与 alias 指向同一商品对象，draft 指向新商品对象；两个商品的 warehouse 仍指向同一仓库。independent 和它的新仓库分别独立。](../../../assets/diagrams/c05-alias-copy.svg)

沿箭头看「哪个名字指向哪个对象」：原商品和浅复制草稿汇入同一仓库，按路径复制的草稿指向新仓库。图展示创建草稿后、修改之前的关系。改数字库存只影响对应外层，改共享仓库会被两个外层同时看到。

### 修改哪条路径，就重建那条路径

要让草稿独立修改城市，就同时创建新商品和新仓库。这里从原始数据重新开始：

```js title="copy-path.js"
const source = { id: "P001", stock: 12, warehouse: { city: "上海", shelf: "A-03" } };
const independent = {
  ...source,
  stock: 15,
  warehouse: { ...source.warehouse, city: "杭州" },
};
console.log(source.warehouse.city, independent.warehouse.city); // → 上海 杭州
console.log(independent.warehouse === source.warehouse); // → false
console.log(independent.warehouse.shelf); // → A-03
console.log(({ stock: 15, ...source }).stock); // → 12
console.log(({ ...source, stock: 15 }).stock); // → 15
```

`...source` 保留外层字段，`...source.warehouse` 保留仓库的 `shelf`，最后用 `city` 覆盖目标值。原商品仍是上海，新草稿是杭州，货架仍是 `A-03`。改更深的地址字段时，继续重建到地址层。

展开时按从左到右处理，**后面的同名属性覆盖前面**。因此 `{ stock: 15, ...source }` 又被原库存 12 覆盖，`{ ...source, stock: 15 }` 才是 15。

[对象展开](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)复制自有、可枚举的属性。对普通记录，就是把这一层字段值填进新对象；只做一层，所以叫「浅」。Java 里新建 DTO 后逐个赋字段，遇到内层对象也会有同样的共享关系。

### 参数也是传值：改字段和换对象是两件事

**先猜一猜：** 函数里先改库存，再给参数赋一个新对象，调用方最终看到 15 还是 0？

```js title="parameters.js"
function change(record) {
  record.stock = 15;
  record = { id: "P002", stock: 0 };
  console.log("函数内", record.stock); // → 函数内 0
}
const current = { id: "P001", stock: 12 };
change(current);
console.log("调用后", current.id, current.stock); // → 调用后 P001 15
```

调用时，`record` 得到 `current` 中引用值的副本。第一句修改双方能找到的原对象；第二句只让形参 `record` 指向新对象。外面的 `current` 仍指向 P001，所以看到库存 15。

Java 和 JS 在这里完全一致：都是传值。调试时问「这行在改共享对象的字段，还是在给某个变量重新赋值」，就能准确判断谁受影响。

## 4. JSON：先解析语法，再校验商品格式

JSON 是文本格式，属性名和字符串用双引号。它允许对象、数组、字符串、数字、布尔值和 `null`，没有注释和尾逗号。

[`JSON.parse(text)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)把文本解析成值；`JSON.stringify(value)`把值转成 JSON 文本。

```js title="json.js"
const jsonText = '{"id":"P001","stock":12}';
const parsed = JSON.parse(jsonText);
console.log(typeof jsonText, typeof parsed, parsed.stock); // → string object 12
console.log(JSON.stringify(parsed)); // → {"id":"P001","stock":12}
console.log(JSON.parse("null")); // → null
try {
  JSON.parse('{"stock":12,}');
} catch (error) {
  console.log(error.name); // → SyntaxError
}
```

`jsonText` 是字符串，`parsed` 才是能用 `.stock` 访问的对象。`"null"` 是合法 JSON，因此解析后直接得到 `null`；尾逗号才是语法问题，会抛 `SyntaxError`。相较 Java 库的 DTO 绑定，`JSON.parse` 只完成语法解析。

### JSON 能保存哪些值

JSON 适合交换普通数据。JS 里的某些值需要转换后才能表示，默认序列化会按下面的规则处理：

```js title="json-boundaries.js"
console.log(JSON.stringify({ note: undefined, stock: NaN })); // → {"stock":null}
console.log(JSON.stringify([undefined, NaN])); // → [null,null]
const timestamp = new Date("2026-10-15T01:30:00Z");
const restored = JSON.parse(JSON.stringify({ updatedAt: timestamp }));
console.log(restored.updatedAt, typeof restored.updatedAt);
// → 2026-10-15T01:30:00.000Z string
try {
  JSON.stringify({ orderId: 123n });
} catch (error) {
  console.log(error.name); // → TypeError
}
```

对象属性值为 `undefined` 时被省略，数组对应位置变成 `null`；`NaN` 和无穷大也变成 `null`。Date 序列化成日期时间字符串，解析回来仍是字符串，后面要用日期方法时再显式 `new Date(...)`。

[`JSON.stringify`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)默认遇到 BigInt 或循环引用会抛 `TypeError`，函数和 Symbol 值也无法原样保存。编辑草稿沿用路径复制。Java 里序列化得到什么，也取决于字段类型与序列化规则。

### 把外部记录变成内部记录

导入练习采用固定商品数据的四个字段子集：`id`、`name`、`stock`、`priceCents`。编号清理成 `P` 加三位数字，名称去掉首尾空白后长度为 1–40，库存为 0–99999 的整数，价格分为非负安全整数。

JSON 里库存必须已经是数字。输入框给的是文本，C03 用 `Number` 转换；导入格式约定数字，这里就拒绝 `"12"`，让提供数据的一方修正格式。

```js title="import-product.js"
function importProduct(text) {
  const raw = JSON.parse(text);
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new TypeError("商品必须是对象");
  }
  if (typeof raw.id !== "string" || typeof raw.name !== "string") {
    throw new TypeError("编号和名称必须是字符串");
  }
  const id = raw.id.trim().toUpperCase();
  const name = raw.name.trim();
  if (!/^P\d{3}$/.test(id) || name.length < 1 || name.length > 40) {
    throw new RangeError("编号或名称格式错误");
  }
  if (!Number.isInteger(raw.stock) || raw.stock < 0 || raw.stock > 99999) {
    throw new RangeError("库存必须是 0–99999 的整数");
  }
  if (!Number.isSafeInteger(raw.priceCents) || raw.priceCents < 0) {
    throw new RangeError("价格分必须是非负安全整数");
  }
  return { id, name, stock: raw.stock, priceCents: raw.priceCents };
}
const text = '{"id":" p001 ","name":" 机械键盘 ","stock":12,"priceCents":39900,"debug":true}';
const imported = importProduct(text);
console.log(JSON.stringify(imported));
console.log(Object.hasOwn(imported, "debug")); // → false
```

最后两行输出 `{"id":"P001","name":"机械键盘","stock":12,"priceCents":39900}` 和 `false`。编号被统一大写，名称空白被清掉，未知字段 `debug` 没进入内部记录。

按三步读这段函数：

1. **解析**：`JSON.parse` 负责文本语法，错误直接抛出。
2. **校验**：先排除 `null`、数组和非对象，再检查字段类型、范围。先确认是字符串再调用 `trim()`，避免清洗时就报错。
3. **构造**：逐字段创建新记录，只保留约定字段。增加字段时同步补格式、检查和构造。

`/^P\d{3}$/` 是正则表达式：开头 `^`、字母 P、三个数字、结尾 `$`，`.test(id)` 返回是否匹配；语义与 Java 的正则规则相近。`Number.isInteger` 拦住字符串、小数和 `NaN`，库存上限再限制业务范围；`Number.isSafeInteger` 给价格分加上精度范围。

返回新对象相当于把外部 DTO 映射到内部记录。

:::tip[自己尝试 · 浏览器 Console]
1. 粘贴 `import-product.js`，确认得到清理后的 P001 和 `false`。
2. 把 `text` 里的库存数字 `12` 改成字符串 `"12"`，再次执行整个代码块。
3. 分别把文本改成 `'null'`、`'[]'`、`'{"stock":12,}'`，每次执行一次。

预期：字符串库存报 `RangeError`，`null` 和数组报 `TypeError`，尾逗号报 `SyntaxError`。三类输入都没有产生内部商品记录。
:::

## 5. 日期与时区：同一时刻可以有不同日期

[`Date`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)表示时间点，内部是自 1970 年 UTC 元旦起的毫秒值。输入文本里的 `Z` 表示 UTC，`+08:00` 表示比 UTC 快八小时的钟表读数；两种写法可以表示同一时刻。

```js title="dates.js"
const utcTime = new Date("2026-10-15T01:30:00Z");
const shanghaiTime = new Date("2026-10-15T09:30:00+08:00");
console.log(utcTime.getTime() === shanghaiTime.getTime()); // → true
console.log(shanghaiTime.toISOString()); // → 2026-10-15T01:30:00.000Z
console.log(utcTime.getUTCFullYear(), utcTime.getUTCMonth() + 1, utcTime.getUTCDate());
// → 2026 10 15
const midnight = new Date("2026-10-15T00:30:00+08:00");
console.log(midnight.toISOString().slice(0, 10)); // → 2026-10-14
console.log(Number.isNaN(new Date("not-a-date").getTime())); // → true
```

上海早上 9:30 和 UTC 凌晨 1:30 是同一时刻，所以 `getTime()` 相等。Date 不保留输入的 `+08:00`；`toISOString()` 统一输出 UTC，并用 `Z` 标记。

`getUTCFullYear()` 等按 UTC 读日历字段，其中月份从 0 开始，显示时加 1；`getFullYear()` 等没有 UTC 的方法按当前电脑的本地时区读。非法文本得到无效 Date，可用 `Number.isNaN(date.getTime())` 检查，再决定是否提示用户。

最后的 `2026-10-14` 解释了一个常见错日：上海 15 日凌晨 00:30，在 UTC 还是 14 日下午。先转成 UTC 再截前十位，得到的当然是 UTC 日期。

保存和显示时按含义选择：

| 数据含义 | 保存或交换 | 显示 |
| --- | --- | --- |
| 商品更新时间，是一个确定时刻 | 带 `Z` 或明确偏移的 ISO 日期时间 | 用 [`Intl.DateTimeFormat`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) 指定业务时区，如 `Asia/Shanghai` |
| 盘点日，只关心哪一天 | 日期字符串 `"2026-10-15"` | 按日历日期使用，直接保留年月日 |

标准日期 `"2026-10-15"` 传给 Date 按 UTC 解释，省略偏移的 `"2026-10-15T09:30:00"` 则按本地时区解释。Java 中这对应 `Instant` 和 `LocalDate` 的职责分开；JS 需要你在数据格式里明确表达这一区别。

## 常见错误与调试

### 草稿的城市改动穿透了「取消」

:::tip[自己尝试 · 本地网页]
1. 在终端进入仓库的 `examples/c05` 目录，运行 `python3 -m http.server 8000 --bind 127.0.0.1`。
2. 用 Chrome 打开 `http://127.0.0.1:8000/draft.html`，按 F12 打开 DevTools。
3. 按下面的断点步骤找出共享对象，再修改 `draft-broken.js`。

预期：修复前原商品的城市变成杭州；修复后原商品保持 `12 / 上海`，草稿为 `15 / 杭州`。
:::

**现象**：Console 显示原商品库存还是 12，城市却和草稿一起变成了杭州。业务上即使丢弃草稿，原记录也已经变了。

**工具**：打开 Sources，在左侧文件树找到 `draft-broken.js`，单击 `editDraft.warehouse.city = "杭州";` 的行号设断点。刷新页面，代码会停在修改城市之前。

```js title="draft-broken.js"
// 有问题的写法：浅复制后直接修改共享的仓库对象
const savedProduct = { id: "P001", stock: 12, warehouse: { city: "上海", shelf: "A-03" } };
const editDraft = { ...savedProduct };
editDraft.stock = 15;
editDraft.warehouse.city = "杭州";
console.log("原商品", savedProduct.stock, savedProduct.warehouse.city); // → 原商品 12 杭州
console.log("草稿", editDraft.stock, editDraft.warehouse.city); // → 草稿 15 杭州
```

**证据**：在暂停时的 Console 输入 `editDraft === savedProduct`，得到 `false`；输入 `editDraft.warehouse === savedProduct.warehouse`，得到 `true`。在 Scope 展开两个对象，此时城市都是上海。按 F10 单步越过赋值，再展开看，两个仓库的城市都变成杭州。

**原因**：展开只创建新商品，仓库仍共享。数字库存各自保存，内层城市通过同一仓库读取，所以只有城市联动。

**修复**：把创建草稿那一行改成 `const editDraft = { ...savedProduct, warehouse: { ...savedProduct.warehouse } };`。完整修复见同目录 `draft-fixed.js`。

**确认**：刷新后断点再次停住，比较仓库身份得到 `false`。单步越过修改，原商品仍为上海，草稿变成杭州；继续运行，Console 显示原商品 `12 / 上海`、草稿 `15 / 杭州`。这次丢弃草稿就能保住原商品。

## 练习

### 练习 1：预测值和共享关系

先写出四行输出，再运行 `prediction.js` 核对。验收时要说明哪些值独立、哪个对象仍共享。

```js title="prediction.js"
const base = { id: "P002", stock: 0, warehouse: { city: "上海" } };
const { stock: picked = 12 } = base;
const copy = { ...base };
copy.stock = 3;
copy.warehouse.city = "杭州";
console.log(picked, base.stock, copy.stock);
console.log(base.warehouse.city, base === copy);
console.log(({ stock: null }).stock ?? 12);
console.log(JSON.stringify({ stock: 0, note: undefined }));
```

<details>
<summary>提示</summary>

分别看三层：解构得到的数字、两个外层商品、内层仓库。`??` 只处理空值，JSON 序列化要留意值为 `undefined` 的属性。

</details>

<details>
<summary>参考答案</summary>

1. `0 0 3`：解构取到数字 0；`copy` 的库存更新不影响 `base.stock`。
2. `杭州 false`：内层仓库共享，但两个外层对象不同。
3. `12`：`null` 触发 `??` 的默认值。
4. `{"stock":0}`：库存 0 保留，值为 `undefined` 的 `note` 被省略。

`picked` 是读取时的数字，`copy.warehouse` 是共享引用值，二者都遵守「复制值」这条规则。

</details>

### 练习 2：拒绝不合格的商品导入

`import-broken.js` 把导入的值直接当商品。先运行它，再用第 4 节的 `importProduct` 修复。

```js title="import-broken.js"
// 有问题的写法：把 JSON 语法正确当成商品字段合格
const candidateText = '{"id":"P002","name":"无线鼠标","stock":"0","priceCents":12900}';
const candidate = JSON.parse(candidateText);
console.log("库存", candidate.stock ?? 12);
console.log("补货后", candidate.stock + 3);
```

现在打印 `库存 0` 和 `补货后 03`。第一个 0 实际是字符串，第二个结果才暴露问题。目标是在进行补货计算之前拒绝非法记录，并把错误转换成可读提示。

以 P002 的 `stock: 0` 为有效基准，每次只改一处：

| 改动 | 预期 |
| --- | --- |
| 把原来的 `"stock":"0"` 改成 `"stock":0` | 输出 `库存 0`、`补货后 3` |
| 库存为 `"0"`、`-1`、`1.5`、`100000` 或缺失 | 提示库存格式错误，不计算补货 |
| 整份文本为 `null` 或 `[]` | 提示商品必须是对象 |
| 增加尾逗号 | 提示 JSON 语法错误 |
| 价格分改成字符串 `"12900"` | 提示价格分必须是非负安全整数 |
| 名称全空格 | 提示编号或名称格式错误 |

<details>
<summary>提示</summary>

`?? 12` 只能补空值，无法检查字符串、小数或范围。把解析和校验交给 `importProduct`，在它成功返回后才读取库存；用 `try/catch` 显示异常信息。固定格式的数据缺字段时应报告，而不是补出一个看似合理的库存。

</details>

<details>
<summary>参考答案</summary>

把第 4 节的 `importProduct` 函数放在前面，后面接下列代码；完整独立文件是 `import-answer.js`。

```js
const candidateText = '{"id":"P002","name":"无线鼠标","stock":0,"priceCents":12900}';
try {
  const accepted = importProduct(candidateText);
  console.log("库存", accepted.stock);
  console.log("补货后", accepted.stock + 3);
} catch (error) {
  console.log(error.name === "SyntaxError" ? "JSON 语法错误" : error.message);
}
```

默认输出 `库存 0`、`补货后 3`。`accepted` 只在校验通过后存在，字符串库存等错误会直接进入 `catch`，因此补货表达式始终接收数字。

直接加 `Number(candidate.stock)` 会接受字符串，负数、小数和范围仍需检查。应统一经过导入边界。

</details>

## 小结

- 点读取固定属性，方括号计算属性名；`Object.hasOwn` 区分缺失与值为 `undefined`，`?.` 处理深层空值。
- 解构读取当时的值，默认值只处理 `undefined`；字符串清洗返回新字符串。
- 赋值会保留对象身份，展开只复制外层；独立更新要重建修改路径上的每层对象。
- Java 和 JS 都是传值；JSON 导入按解析、校验、构造三步处理。
- Date 表示时间点，`toISOString()` 输出 UTC；业务日期用单独的日期字符串表示。

自测：

1. `product[field]` 和 `product.field` 什么时候会得到不同结果？
2. 解构的默认值与 `??` 对 `null` 的处理有什么区别？
3. 外层复制后，怎样证明两个仓库仍然共享？
4. `JSON.parse` 成功后，为什么还要检查字段类型与范围？
5. 上海凌晨的时间转成 ISO 字符串，日期为什么可能退一天？

下一课讲函数、闭包与高阶操作，把这些商品处理规则变成可以复用的函数。

## 延伸阅读

- [MDN：使用对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN：解构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring)
- [MDN：展开语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN：JSON](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [MDN：Date](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Chrome DevTools：用断点暂停代码](https://developer.chrome.com/docs/devtools/javascript/breakpoints)
