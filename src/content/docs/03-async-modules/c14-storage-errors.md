---
title: C14 原生页面、存储与错误处理
description: 给原生库存页加入本地保存、损坏恢复和 JSON 导入导出，用 Application 面板定位刷新后数据丢失的问题。
sidebar:
  order: 14
---

> **第 2 周 · 第 7 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C05、C11、C13 · 运行：Node 24 与本地网页 · 示例已运行验证

## 这一课解决什么问题

在上一课的库存页里，把无线鼠标从 0 件改成 3 件，列表和统计都对。刷新页面，却又回到 0 件：页面重新请求了初始 JSON，上次的修改只存在内存中。

于是你加上 localStorage。平时刷新好了，某天读到一个坏 JSON，页面又停在「正在加载」。存下来了，还得读得回来；读不回来，还得给用户一条恢复路径。

学完你能：

- 区分初始 JSON、内存数据和当前浏览器的本地副本。
- 用带版本的 JSON 保存商品，读取时检查语法、结构和字段。
- 组织事件、保存与渲染，让写入失败时页面保留原数据。
- 导出备份、校验后导入，并在 Application 面板复现和修复存储问题。

示例在 [examples/c14](https://github.com/socoo123/js_web/tree/main/examples/c14)。纯 JS 文件在该目录用 `node json-snapshot.js` 运行；涉及 localStorage、文件选择和下载的例子使用本地网页。沿用前一课：在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，本课入口是 `http://127.0.0.1:8000/examples/c14/`。

## Java 程序员先看这里

| Java 经验 | 浏览器里的对应 | 差异 |
| --- | --- | --- |
| 内存中的 List | 页面里的 inventory 数组 | 刷新会重新执行脚本，旧数组随页面消失 |
| Map 的 get/put | localStorage 的 getItem/setItem | 键和值都是字符串；缺失返回 null，写入可能抛异常 |
| Jackson 反序列化 DTO | JSON.parse 后校验字段 | parse 只检查 JSON 语法，没有 DTO 类型替你约束结构 |
| 事务成功后更新界面 | 写入成功后提交内存并渲染 | 本课只写一个存储键，没有数据库的多记录事务 |
| 服务器保存用户数据 | 当前浏览器保存本地副本 | 换浏览器、设备或源就得到另一份数据，不随账号同步 |

## 1. localStorage 存的是字符串快照

[`localStorage`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage) 是浏览器提供的同步键值存储。写入成功后，刷新和重新打开页面通常仍能读取；页面里的数组则会重新创建。

**先猜一猜：** 读出来的 0 是数字吗？改了解析后的对象，存储也会跟着变吗？

在本课 `storage.html` 打开 Console，刷新观察：

```js title="storage-basics.js"
const demoKey = "js_web:c14:demo:v1";
localStorage.removeItem(demoKey);
console.log(localStorage.getItem(demoKey)); // → null
localStorage.setItem(demoKey, 0);
const stored = localStorage.getItem(demoKey);
console.log(stored, typeof stored); // → 0 string

localStorage.setItem(demoKey, JSON.stringify({ id: "P002", stock: 0 }));
const product = JSON.parse(localStorage.getItem(demoKey));
product.stock = 3;
console.log(product.stock); // → 3
console.log(JSON.parse(localStorage.getItem(demoKey)).stock); // → 0
localStorage.removeItem(demoKey);
```

`setItem` 会把值转成字符串，所以第一次读到的是 `"0"`。对象要先 stringify；直接传对象会存成 `"[object Object]"`。最后两行库存不同，是因为 parse 创建了独立对象，修改对象只改内存；要保存 3，必须再 stringify、再 setItem。

这和 Java 里的对象与序列化文本相同：改对象不会自动重写文件。localStorage 也没有对象字段监听或自动保存机制。

### 一份数据，三个位置

| 位置 | 本课放什么 | 什么时候变化 |
| --- | --- | --- |
| 静态文件 products.json | 6 种商品的固定起始记录 | 修改仓库文件并重新部署时 |
| 页面内存 inventory | 当前正在筛选、编辑的商品数组 | 加载、保存或导入成功时 |
| localStorage | 数组的 JSON 快照 | 用户保存、导入或恢复初始数据成功时 |

初始文件提供起点，本地快照保存后来的修改。setItem 不会给 GitHub Pages 写回 products.json，Network 里也不会多出保存请求。

### 源决定共享范围，键名决定业务归属

存储按**源**隔离：协议、主机、端口相同才属于同一份存储。`localhost:8000` 与 `127.0.0.1:8000` 不同，8000 与 8001 也不同。URL 的路径不参与隔离，同一个源下的两个项目可以读到彼此的键。

库存项目统一使用 `js_web:inventory:v1`；小练习用 `js_web:c14:demo:v1`。前缀使数据归属清楚，也让 Pages 的 `/js_web/` 项目不容易与同域其他项目撞键。删除本项目副本用 removeItem，clear 会清空这个源的全部键。

localStorage 适合本课这类小份业务快照，同步读写会占用主线程。sessionStorage 适合当前标签页会话，关闭会话后清除；IndexedDB 适合更大、结构更复杂的异步存储。

本地副本会受浏览器清理、隐私模式和存储策略影响，重要修改要导出备份。同源脚本能读取这些数据，因此示例只保存库存，不保存密码等秘密。多标签页同时编辑时，后一次保存会覆盖同一个键；本课练习用一个库存页标签操作。

## 2. JSON 能解析，还要符合业务规则

快照里保存 `version` 和 `products`：前者声明格式，后者保存商品。版本用于识别文件结构，和页面发布日期、商品修改次数无关。

```js title="json-snapshot.js"
const product = { id: "P002", name: "无线鼠标", stock: 0 };
const text = JSON.stringify({ version: 1, products: [product] });
console.log(typeof text);
const snapshot = JSON.parse(text);
console.log(snapshot.version, snapshot.products[0].stock);
console.log(snapshot.products[0] === product);
snapshot.products[0].stock = 3;
console.log(product.stock, snapshot.products[0].stock);
```

输出为 `string`、`1 0`、`false`、`0 3`。JSON 保存的是字段值，读回后得到新对象。库存 0 会原样保留，无需给它设置默认库存。完整商品快照包含固定数据的全部字段，这里只取三个字段观察序列化行为。

### 校验分三层

**先猜一猜：** 下面三份文本，哪些会在 JSON.parse 那一行失败？

```js title="syntax-shape.js"
for (const text of ['{', 'null', '{"version":1,"products":{}}']) {
  try {
    const snapshot = JSON.parse(text);
    console.log("解析成功", snapshot?.version ?? "无版本");
    if (snapshot?.version !== 1 || !Array.isArray(snapshot.products)) {
      throw new Error("备份结构错误");
    }
  } catch (error) {
    console.log(error.name);
  }
}
```

第一份输出 `SyntaxError`；第二份输出 `解析成功 无版本`、`Error`；第三份输出 `解析成功 1`、`Error`。

只有 `{` 不是合法 JSON。null、对象、数字、字符串都能作为合法 JSON 的顶层值，但库存备份要求顶层对象带版本号和商品数组。因此读取入口要依次检查：

1. **语法**：JSON.parse 能否把文本解析成 JS 值。
2. **结构**：版本是否是数字 1，products 是否是数组。
3. **业务**：每件商品的字段和编号是否符合规则。

Java 用 Jackson 接 DTO 时，也需要 Bean Validation 或业务校验；JS 连 DTO 的字段类型检查也要显式完成。

### 表单转换，JSON 校验

表单的 value 必须先把文本转成数字；JSON 已携带数字和字符串的区别。读备份时直接检查类型，才能发现把 stock 错存为 `"0"` 的文件。

```js title="validate-stock.js"
function validateStock(stock) {
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new Error("库存应为 0–99999 的整数");
  }
  return stock;
}
for (const value of [0, "0", -1, 3.8, 99999, 100000]) {
  try {
    console.log(JSON.stringify(value), "通过", validateStock(value));
  } catch (error) {
    console.log(JSON.stringify(value), error.message);
  }
}
```

只有 0 和 99999 通过；其余行都输出库存规则的错误信息，其中字符串会带引号。`Number.isInteger("0")` 为 false。若在这里写 `Number(stock)`，反而会掩盖备份格式错误。

阶段项目的 `validateProducts` 对整份数组执行以下检查，并返回只包含业务字段的新对象：

| 字段 | 接受的值 |
| --- | --- |
| id | P 加 3 位数字，并且整份数组中不重复 |
| name | 字符串，去掉首尾空格后为 1–40 个字符 |
| category | 外设、显示器、配件、音频之一 |
| stock | 0–99999 的整数 |
| priceCents | 非负安全整数，单位为分 |
| tags | 字符串数组，可以为空 |

检查 id 的 Set 沿用集合课的去重思路。重建对象则让备份中多出来的字段留在边界外；显示名称继续使用 textContent，导入的文本仍按文本显示。

解码入口很短，完整字段检查放在阶段项目 app.js 中：

```js
function decodeSnapshot(text) {
  const snapshot = JSON.parse(text);
  if (snapshot?.version !== 1) throw new Error("备份版本应为 1");
  return validateProducts(snapshot.products);
}
```

正常文件返回校验过的商品数组；坏语法、版本和字段分别在对应步骤抛错。合法的空数组返回 `[]`，表示「这份库存确实为空」。遇到版本 2 时先拒绝导入，等理解它的结构后再写明确的迁移规则。

## 3. 启动时先读副本，失败时给恢复路径

页面启动先尝试本地副本：存在且有效就使用它；没有副本才读初始 JSON。损坏或无权读取时，显示提示，再尝试初始 JSON。

```js
function readSavedProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : decodeSnapshot(raw);
  } catch (error) {
    storageFeedback.textContent = "本地副本无法读取，尝试加载初始 JSON。可导入备份或点击恢复初始数据；原存储未覆盖。";
    console.warn("本地副本读取失败", error);
    return null;
  }
}
```

有效副本返回数组，缺失或读取失败返回 null；catch 另外写出用户提示与 Console 原因。读取 localStorage 属性本身也放在 try 内，因为浏览器策略可能在这里就抛出 SecurityError。

调用方用 `const saved = readSavedProducts()`，再写 `inventory = saved ?? await fetchProducts("./products.json")`。有本地数组时，右边的 fetch 根本不会执行；空数组也会被保留。只有 null 才选择初始文件。

这与 Java 的「先读缓存，缺失再加载」类似。这里的副本代表用户编辑后的数据，因此成功读取它以后，新的静态 JSON 不会自动覆盖它。

页面显示数据来源。出现库存差异时，先看来源，再看 Network；本地副本有效时没有商品请求是正常结果。

### 保留坏原文，显式恢复

读取失败后保留原存储，也不把刚拿到的初始数据自动写回。这样用户还有机会复制坏原文查原因，或找回一份正确备份。下一次主动保存、成功导入或点击恢复，才会替换这个键。

「恢复初始数据」先确认，再请求 products.json，完整校验并写入成功后才替换页面。网络或存储失败时保留当前列表与原副本，提示重试。先删键再发请求会制造空档：请求若失败，连原副本也已经丢了。

初始 JSON 也可能失败，所以继续保留上一课的加载提示与重试。读取副本失败的提示放在独立区域，避免被请求结果盖掉；即使初始文件暂时不可用，仍能选择导入本地备份。

:::tip[自己尝试 · 本地网页]
1. 打开 `http://127.0.0.1:8000/examples/inventory/02-web/`，首次没有副本时应读取初始 JSON。
2. 把 P002 库存改成 3 并保存，刷新；再打开 DevTools → Application → Storage → Local Storage → `http://127.0.0.1:8000`。
3. 找到 `js_web:inventory:v1`，查看 version 与 P002 的 stock；页面的数据来源也应变成本地副本。
4. 点击「恢复初始数据」并确认，再刷新。

预期：初始为 52 件、26348.00 元；保存后为 55 件、26735.00 元，刷新保留；恢复后回到 52 件。若已做过练习，先恢复初始数据建立相同起点。
:::

## 4. 事件负责协调，渲染只读取状态

事件处理拆成四步：读取输入、生成候选数组、写入快照、提交状态并渲染。筛选只读 inventory，renderProducts 只生成节点；存储写入集中到保存入口。

项目用一个函数提交编辑、导入和恢复的结果：

```js
function commitInventory(next) {
  const text = encodeSnapshot(next);
  localStorage.setItem(STORAGE_KEY, text);
  inventory = next;
  loadState = "ready";
  retry.hidden = true;
  renderProducts();
  renderSummary();
  dataSource.textContent = "数据来源：当前浏览器的本地副本。";
  storageFeedback.textContent = "已保存到当前浏览器，可导出 JSON 备份。";
}
```

encodeSnapshot 先校验再 stringify。成功时依次写入存储、替换内存、更新列表和统计；失败时在 setItem 处抛错，后面的赋值和渲染都跳过。候选数组要通过 map 和对象展开创建，否则提前修改原对象，顺序就失效了。

这和 Java 中先完成持久化再刷新视图的组织方式相近；一次 setItem 只替换一个键。

### catch 放在能决定下一步的地方

底层编解码和写入函数把异常交给调用者。编辑处理器才能决定：失败后保留编辑框，告诉用户库存未改；导入处理器则告诉用户原数据保留，并恢复文件选择控件。

[`setItem`](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem) 可能因空间或策略失败，常见错误名包括 QuotaExceededError。catch 后显示固定、可行动的提示，详细 error 留在 Console。成功提示只出现在成功路径。

| 失败位置 | 用户看到什么 | 当前数据怎么办 |
| --- | --- | --- |
| 读取本地副本 | 无法读取，尝试初始 JSON | 保留原存储，加载起始记录 |
| 保存库存 | 保存失败，允许存储或释放空间后重试 | 列表不改，编辑框保留输入 |
| 导入备份 | 导入失败，检查格式、字段与存储权限 | 内存和原副本都保留 |
| 恢复初始数据 | 恢复失败，检查网络与存储权限 | 保留恢复前的数据 |

finally 负责恢复控件。异步读取文件或请求初始数据期间，项目禁用编辑、筛选和其他替换入口，结束后恢复。这让一次导入不会和另一次编辑交叉改状态。

## 5. 导出快照，校验后整份导入

导出使用和 localStorage 相同的 version 1 格式。文件名可以变化，内容的结构必须一致；同一个 decodeSnapshot 因而能处理本地副本和导入文件。

下面的辅助函数接收序列化文本，创建 [`Blob`](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob) 和临时对象 URL，再触发下载：

```js
function downloadJson(text, filename) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

调用 `downloadJson(encodeSnapshot(inventory), "inventory-v1.json")` 后，浏览器发起 JSON 文件下载，里面保存全部商品，包括未被当前筛选显示的商品。对象 URL 指向内存中的 Blob；移除链接后稍晚撤销 URL，释放这份临时资源。

确认文件已落在下载目录，才算拿到备份。文件在当前浏览器生成，和 Java 服务端返回下载响应的路径不同。

### 文件后缀只是选择提示

页面用 `<input type="file" accept=".json,application/json">` 让用户选择文件，change 事件中从 files 取得 File。[`file.text()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/text) 异步读取文本；accept 帮助选择文件，真正的检查仍是解析与字段校验。

```js
importInput.addEventListener("change", async () => {
  const file = importInput.files[0];
  if (file === undefined) return;
  setLoading(true);
  try {
    const next = decodeSnapshot(await file.text());
    if (!window.confirm("导入将替换全部商品，是否继续？")) return;
    commitInventory(next);
    editor.hidden = true;
    selectedId = null;
    feedback.textContent = "导入成功：" + next.length + " 种商品已保存到当前浏览器。";
  } catch (error) {
    feedback.textContent = "导入失败，原数据保留。请检查文件格式、字段与存储权限。";
    console.error("库存导入失败", error);
  } finally {
    importInput.value = "";
    setLoading(false);
    importInput.focus();
  }
});
```

合法文件经确认后整份替换；坏 JSON、错版本、非法字段或写入失败，都会走失败分支。取消确认直接返回，finally 仍会执行，原数据保持不变。把 input.value 清空，是为了再次选择同一文件时仍能触发 change。

`products: []` 导入后显示「暂无商品」，刷新仍为空。对 Java 程序员来说，导入相当于在反序列化和校验完成后才提交新的集合引用。

:::tip[自己尝试 · 本地网页]
1. 把 P002 库存改成 3，点击「导出 JSON」，在下载目录确认文件存在。
2. 恢复初始数据，选择刚下载的文件导入并确认，刷新核对。
3. 依次选择仓库 `examples/c14/` 中的 invalid-syntax.json、invalid-stock.json、duplicate-id.json、invalid-version.json。
4. 导入 empty.json 并确认，刷新，再导入 valid.json 恢复固定商品。

预期：回导备份后 P002 为 3；四份坏文件均提示导入失败，列表与副本不变；空库存刷新保留；valid.json 恢复 6 种、52 件、26348.00 元。
:::

## 常见错误与调试

### 写了默认值，坏 JSON 仍让页面停住

**现象**：打开本课 storage-broken.html，Console 执行下面一行，再刷新。页面停在「等待读取…」，Console 出现 SyntaxError。

```js
localStorage.setItem("js_web:c14:broken:v1", "{");
```

**工具**：先在 Application → Storage → Local Storage 选择当前源，查看练习键。再到 Sources → Page 打开 storage-broken.js，在 JSON.parse 那一行的行号上设断点，刷新。

```js title="storage-broken.js"
// 有问题的写法：默认值只处理缺失，坏 JSON 仍会抛错
const brokenKey = "js_web:c14:broken:v1";
const raw = localStorage.getItem(brokenKey);
const rows = JSON.parse(raw ?? "[]");
document.querySelector("#output").textContent = "商品数 " + rows.length;
```

**证据**：断点处 raw 为字符串 `"{"`。它不是 null，`?? "[]"` 保留了原值。单步越过时 parse 抛错，更新 output 的一行没有执行。Application 中还能看到原来的坏文本。

**原因**：默认值处理「缺失」，try/catch 处理「执行失败」。两者职责不同；改成 `raw || "[]"` 也拦不住非空的坏 JSON。

**修复**：打开 storage-fixed.html，它使用下面的脚本，把读取、解析和数组检查放进同一个 try。这里是独立数组练习；库存项目使用前面的带版本格式和完整校验。

```js title="storage-fixed.js"
const brokenKey = "js_web:c14:broken:v1";
const output = document.querySelector("#output");
try {
  const raw = localStorage.getItem(brokenKey);
  const rows = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error("商品数据应为数组");
  output.textContent = "商品数 " + rows.length;
} catch (error) {
  output.textContent = "本地数据无法读取，请点击清除练习副本再刷新。";
  console.warn("练习副本读取失败", error);
}
```

**确认**：相同的坏文本现在得到恢复提示，页面没有未处理异常。点击「清除练习副本再刷新」，显示商品数 0，练习键被移除。再回到库存项目，把它的键值改成 `{` 并刷新：应显示读取失败提示、加载初始 JSON，同时保留坏原文；点击恢复并确认后，键才变成有效快照。

## 练习

### 练习 1：修改对象以后，哪份数据变了

先写出每行输出，再在本课目录运行 `node prediction.js`。验收：解释对象身份与空数组的含义。

```js title="prediction.js"
const original = { id: "P002", stock: 0 };
const text = JSON.stringify({ version: 1, products: [original] });
const restored = JSON.parse(text);
restored.products[0].stock = 3;
console.log(original.stock, restored.products[0].stock);
console.log(restored.products[0] === original);
console.log(JSON.parse('{"version":1,"products":[]}').products.length);
```

<details>
<summary>提示</summary>

JSON 文本不是对象引用。parse 会创建对象；空数组是真实的集合值，不是本地键缺失时的 null。

</details>

<details>
<summary>参考答案</summary>

依次输出 `0 3`、`false`、`0`。只改了解析后的对象，original 和 text 都保持原样。最后的备份明确保存空库存，启动时应该继续显示空列表。

</details>

### 练习 2：失败提示正确，库存却偷偷变了

运行 `node save-order-broken.js`。persist 模拟存储拒绝写入，输出保存失败，但当前库存变成了 3。修好后应仍为 0；再让 persist 正常返回，库存才变成 3。

```js title="save-order-broken.js"
// 有问题的写法：写入失败之前就改了内存
let inventory = [{ id: "P002", stock: 0 }];
const next = inventory.map(product => ({ ...product, stock: 3 }));
function persist() {
  throw new Error("存储不可用"); // 模拟浏览器拒绝写入
}
inventory = next;
try {
  persist(next);
} catch (error) {
  console.log("保存失败", error.message);
}
console.log("当前库存", inventory[0].stock);
```

<details>
<summary>提示</summary>

catch 不会撤销已经完成的赋值。候选数组已经独立，调整提交它的时机即可。

</details>

<details>
<summary>参考答案</summary>

```js title="save-order-fixed.js"
let inventory = [{ id: "P002", stock: 0 }];
const next = inventory.map(product => ({ ...product, stock: 3 }));
function persist() {
  throw new Error("存储不可用"); // 模拟浏览器拒绝写入
}
try {
  persist(next);
  inventory = next;
} catch (error) {
  console.log("保存失败", error.message);
}
console.log("当前库存", inventory[0].stock);
```

现在输出 `保存失败 存储不可用`、`当前库存 0`。去掉 throw 那一行后，persist 成功，才执行赋值并打印当前库存 3。完整页面还应在这次赋值之后渲染列表和统计。

</details>

## 项目进度

从 C13 的 [examples/inventory/02-web](https://github.com/socoo123/js_web/tree/main/examples/inventory/02-web) 开始，目录里保存的是本课完成后的参考状态。仍用 defer 经典脚本，完整实现集中在 app.js。

1. **index.html**：新增数据来源、导出按钮、文件选择框、恢复按钮和独立的存储提示。保留筛选、编辑、请求状态与重试。
2. **app.js**：新增 validateProducts、encodeSnapshot、decodeSnapshot、readSavedProducts、commitInventory 和 downloadJson。读取静态 JSON 后也调用 validateProducts，两个入口遵守同一字段规则。
3. **启动**：loadProducts 先读本地副本，再按第 3 节选择是否请求初始 JSON；成功后显示数据来源、列表和汇总。读取失败只降级，不自动写回。
4. **编辑**：把原来直接修改 `product.stock` 的部分换成候选数组和统一提交。沿用原来的数字校验，在取得 product、stock 与 selectedId 后改成下面这段。

```js
const next = inventory.map(row => row.id === selectedId ? { ...row, stock } : row);
try {
  commitInventory(next);
  feedback.textContent = product.name + "库存已保存为 " + stock + " 件。";
  closeEditor(product.id);
} catch (error) {
  feedback.textContent = "保存失败，库存未修改。请允许本站存储或释放空间后重试。";
  console.error("库存保存失败", error);
}
```

5. **备份与恢复**：导入采用第 5 节处理器；恢复初始数据先确认，再请求、校验、提交。setLoading 同时控制文件选择、恢复、导出和编辑按钮，finally 统一恢复可用状态。

保持根目录的静态服务运行，打开库存项目。按前面的两组「自己尝试」检查保存、刷新、回导和失败保留，再在 Application 改坏库存键并恢复。CSS 排版沿用已有样式。

## 小结

- localStorage 存字符串，parse 得到新对象；内存变化要显式写入才会持久化。
- 读取先查 JSON 语法、版本与结构，再查业务字段；库存 0 和空数组都是合法值。
- 启动优先使用有效本地副本，缺失或读取失败再加载初始 JSON，并显示数据来源。
- 先生成候选数据，写入成功再提交和渲染；失败提示与当前数据保持一致。
- 导出保存版本化快照，导入完整校验后整份替换；Application 对照存储原文与刷新行为。

自测：

1. 为什么改了 parse 得到的对象，localStorage 仍是旧库存？
2. JSON.parse 成功，为什么仍可能无法导入？
3. 有效空库存和读取失败，启动后应分别显示什么？
4. 为什么保存失败的 catch 不能帮你撤销前面的对象修改？
5. 在 localhost 保存的数据，换成 127.0.0.1 为什么读不到？

下一课用 Flex、Grid 和移动优先的 CSS，把库存页排成不同屏幕上都好用的布局。

## 延伸阅读

- [MDN：localStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)
- [MDN：使用 Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- [MDN：JSON.parse](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- [MDN：Blob.text](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/text)
- [MDN：创建对象 URL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL_static)
- [Chrome DevTools：查看和修改本地存储](https://developer.chrome.com/docs/devtools/storage/localstorage/)
