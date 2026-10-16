---
title: C11 DOM、事件、表单与页面调试
description: 把库存数据接到原生网页，掌握安全更新 DOM、事件委托和表单校验，用断点定位重复触发与意外删除。
sidebar:
  order: 11
---

> **第 1 周 · 第 6 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br />
> 前置：C02、C03、C08、C10 · 运行：本地网页；纯 JS 例子用 Node 24 · 示例已运行验证

## 这一课解决什么问题

上一课的库存模块能筛选、统计和撤销，但同事想直接在网页里找到无线鼠标，把库存从 0 改成 3。你给每行加了按钮，第一次能点，筛选之后却失效；把监听放进刷新列表的函数里，又变成点一次保存两次。

问题跨越内存数据、DOM 节点和输入文本。把三者的职责分清，页面就容易调试。

学完你能：

- 用选择器找到节点，把商品数据安全地显示为文字。
- 解释捕获、目标、冒泡，用一个监听器处理整张商品列表。
- 接住表单提交，保留库存 0，拒绝空值、小数和越界输入。
- 用事件断点与 DOM 断点找到「谁执行了两次」「谁删了节点」。
- 做出可用键盘操作的筛选和库存编辑页，让列表与汇总保持一致。

例子在 [examples/c11](https://github.com/socoo123/js_web/tree/main/examples/c11)。DOM 文件用浏览器运行，两个纯 JS 例子用 Node 运行；完整页面在后面的「项目进度」。

:::tip[自己尝试 · 本地网页]
1. 在终端进入仓库根目录，运行 `python3 -m http.server 8000 --bind 127.0.0.1`。
2. 用 Chrome 打开 `http://127.0.0.1:8000/examples/c11/`，按 F12 打开 Console。
3. 先打开「阶段 2 库存页」，搜索 `P002`，点「编辑库存」，把 0 改成 3，按 Enter。

预期：页面显示无线鼠标库存 3；全部库存变为 55 件、总价值变为 26735.00 元。刷新后恢复固定起始数据。
:::

## Java 程序员先看这里

| Java 经验 | 浏览器里的对应 | 一句话差异 |
| --- | --- | --- |
| 操作 Swing / JavaFX 控件树 | DOM 节点树 | DOM 是浏览器提供的对象，Node 中没有 `document` |
| 遍历集合寻找控件 | `querySelector` / `querySelectorAll` | 用 CSS 选择器查询，单个找不到是 `null` |
| 给按钮注册监听器 | `addEventListener` | 事件还能沿祖先节点传播 |
| DTO、表单校验 | 输入文本转业务数字 | `type="number"` 的 `value` 仍是字符串 |
| 更新模型后刷新控件 | 更新数据后重新生成列表 | 普通对象的字段变化不会自动更新 DOM |

## 1. DOM：查到的是节点对象

HTML 描述页面结构，浏览器把它解析成 DOM 树。`document` 是这棵树的入口，查询得到的节点有属性和方法，能直接修改页面。选择器写法沿用 CSS：`#products` 找 id，`.product` 找 class，`button[data-id]` 找带指定属性的按钮。

打开 `dom.html`。页面先有一行商品，脚本带 `defer`，等 HTML 解析完成后执行：

```html
<script defer src="dom.js"></script>
<ul id="products"><li>P001 机械键盘：12 件</li></ul>
```

**先猜一猜：** 先查一次列表，再追加一行，原查询结果的 `length` 会变成 2 吗？

```js title="dom.js"
const list = document.querySelector("#products");
const before = list.querySelectorAll("li");
const row = document.createElement("li");
row.textContent = "P002 无线鼠标：0 件";
list.append(row);
console.log(before.length);                       // → 1
console.log(list.querySelectorAll("li").length);  // → 2
console.log(document.querySelector("#missing")); // → null
```

输出依次是 `1`、`2`、`null`，页面则显示两行商品。

[`querySelectorAll`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelectorAll) 返回静态的 `NodeList`：成员是查询那一刻的节点，新插入的节点不会自动补进这份列表。重新查询才能得到两项。它保存的仍是节点引用，所以修改原有节点的文字，在旧结果中也能看到。

`querySelector` 返回第一个匹配节点，找不到是 `null`。读到空值错误时，先在 Elements 查 id 拼写和脚本时机。`defer` 让外部经典脚本在 HTML 解析后按文档顺序执行。

创建节点分成三步：`createElement` 得到尚未挂到页面上的对象，`textContent` 写文字，`append` 接到父节点。

Java 中拿到控件引用后也能改控件；DOM 额外提供按选择器查询的能力。

## 2. 显示文字用 textContent

商品名称是数据，按文字显示。HTML 结构由你创建的节点决定，把外部文本写入 [`textContent`](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent) 就能保住这个边界。

打开 `text.html`，先看上半部分：

```js title="text.js"
const name = "<b>机械键盘</b>";
const label = document.querySelector("#safe");
label.textContent = name;
console.log(label.textContent);           // → <b>机械键盘</b>
console.log(label.querySelector("b"));    // → null
```

页面原样显示 `<b>机械键盘</b>`，没有加粗。Console 打印同样的文字和 `null`：字符串没有变成 `b` 元素。

`textContent` 赋值会替换原有子节点，适合名称、数量、状态提示等叶子内容。给整个表单赋值会替换其中的输入框，所以写入目标要具体。

### innerHTML 会把输入解释成结构和行为

[`innerHTML`](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/innerHTML) 会把字符串解析成 HTML。下面故意把一份外部「商品名称」写进页面：

```js title="xss.js"
// 有问题的写法：把外部文本当成 HTML 解析
const rawName = '<img src="missing.png" onerror="this.parentNode.dataset.executed=1">';
const unsafe = document.querySelector("#unsafe");
unsafe.innerHTML = rawName;
// 图片加载失败后，页面会显示 1，表示输入中的代码执行了
unsafe.querySelector("img")?.addEventListener("error", () => {
  document.querySelector("#result").textContent = unsafe.dataset.executed;
});
```

预期：下半部分出现加载失败的图片，「输入中的代码是否执行」显示 **1**。浏览器先创建 `img`，随后图片请求失败，触发字符串里附带的 `onerror`，把父节点的标记改成 1。这个标记就是可观察的代码执行证据。

当恶意输入被网页当成代码执行时，就是 XSS（跨站脚本）。真实攻击可能读取信息、冒充用户操作，本例用标记展示这个越界过程。即使通过 `innerHTML` 插入的 `script` 标签通常不执行，事件处理属性仍能执行代码。

把危险那行改为 `unsafe.textContent = rawName` 后刷新：页面只出现原始字符串，不生成图片节点，也不执行属性里的代码，标记保持「等待图片错误」。完整商品行用 `createElement`、`append` 和 `textContent` 组合。

Java 后端模板也要区分 HTML 转义后的文本和原始 HTML。JS 的字符串类型没有「安全 HTML」这个保证，关键是它被送进哪一种 DOM API。

## 3. 事件：沿树传播，向父节点委托

监听器接收一个事件对象，里面既有「从哪里触发」，也有「当前哪个监听器正在处理」。打开 `events.html`，它的结构只有两层容器和按钮内的一段文字：

```html
<div id="outer"><button id="edit" type="button"><span>编辑库存</span></button></div>
```

**先猜一猜：** 点中 `span` 的文字时，三处监听按什么顺序执行？`target` 和 `currentTarget` 都是按钮吗？

```js title="events.js"
const outer = document.querySelector("#outer");
const edit = document.querySelector("#edit");
outer.addEventListener("click", () => console.log("外层捕获"), { capture: true });
edit.addEventListener("click", event => {
  console.log("按钮监听", event.target.tagName, event.currentTarget.tagName);
});
outer.addEventListener("click", () => console.log("外层冒泡"));
```

Console 依次打印「外层捕获」「按钮监听 SPAN BUTTON」「外层冒泡」。

这次 `click` 先经过从外向内的**捕获**阶段，到达目标 `span`，再沿祖先向外**冒泡**。外层的捕获监听先运行，按钮的普通监听在冒泡经过按钮时运行，最后到外层的普通监听。`addEventListener` 默认监听普通阶段，`{ capture: true }` 选择捕获。

- `event.target` 是此次事件的起点，这里是 `span`。
- `event.currentTarget` 是当前注册监听器的节点，这里是 `button`；换到外层监听中，它就是 `outer`。

Java 的按钮回调通常先关注事件源，浏览器还要关注祖先监听器；同一次点击可以经过多个监听器。

### 商品列表只注册一个监听器

列表筛选后，旧行会被新行替换。把监听放在一直保留的 `ul` 上，让按钮点击冒泡到这里，就是**事件委托**。阶段 2 页面里的处理如下：

```js
list.addEventListener("click", event => {
  const button = event.target.closest('button[data-action="edit"]');
  if (button === null || !list.contains(button)) return;
  openEditor(button.dataset.id);
});
```

预期：点击 `span` 能打开正确表单；反复筛选后仍能编辑。

`closest` 从目标节点向上找最近的编辑按钮，解决「点在按钮内部元素上」的问题。`data-id="P002"` 通过 `dataset.id` 读成字符串，用来查找商品。`contains` 把处理范围限制在当前列表里；点中行文字而不是按钮时，没有匹配按钮，直接结束。

初始化时注册一次监听，更新时只替换子节点，后来创建的按钮仍能冒泡到父列表。

`event.preventDefault()` 取消默认行为，例如表单导航；`event.stopPropagation()` 停止后续传播。两者职责不同：停止冒泡不会取消提交，取消提交也不会让祖先收不到事件。这里保留传播，通过按钮选择器决定哪些点击需要处理。

## 4. 表单：先校验，再把文本写回数据

监听 `form` 的 `submit`，可以同时接住点击保存按钮和输入框中的 Enter。用真正的 `button`，浏览器就提供焦点和键盘激活。表单里的非提交按钮明确写 `type="button"`，保存按钮写 `type="submit"`。

阶段 2 页面的输入部分如下，完整文件还包含编辑标题和商品名称：

```html
<form id="stock-form">
  <label for="stock">库存件数</label>
  <input id="stock" name="stock" type="number" required min="0" max="99999" step="1"
    aria-describedby="stock-help stock-error">
  <p id="stock-help">请输入 0–99999 的整数，0 表示售罄。</p>
  <p id="stock-error" class="error" aria-live="polite"></p>
  <button type="submit">保存库存</button>
  <button id="cancel" type="button">取消</button>
</form>
```

`label` 的 `for` 对应输入框的 id，点标签也能聚焦。`name` 是提交数据时使用的字段名。`required` 要求非空，`min`、`max` 和 `step` 给出数量范围与整数步长；0 符合规则。

正常点击保存时，浏览器先做原生校验。无效输入触发 `invalid`，阻止提交，`submit` 监听器还不会运行。页面在 `invalid` 监听器里写错误文字，并设置 `aria-invalid="true"`；修改输入时清掉旧错误。`aria-describedby` 让辅助技术把规则、错误与输入框关联起来，`aria-live` 让更新后的文字有机会被读出。

### 业务入口也接收检查过的数字

输入框的 `value` 仍是字符串。沿用 C03 的边界转换库存，本次允许 0。在 `examples/c11` 执行 `node stock-input.js`：

```js title="stock-input.js"
function parseStock(text) {
  if (text.trim() === "") return null;
  const stock = Number(text);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) return null;
  return stock;
}
console.log(parseStock("0"));     // → 0
console.log(parseStock(" 3 "));   // → 3
console.log(parseStock(""));      // → null
console.log(parseStock("3.8"));   // → null
console.log(parseStock("3件"));   // → null
console.log(parseStock("100000")); // → null
```

`parseStock` 用 `null` 表示无效值。判断写 `stock === null`，就能保住有效的 0。输入 `type="number"` 也可能读到空字符串，比如用户清空了输入，因此先检查非空。

Java 的整数解析解决类型问题，Bean Validation 解决范围问题；这里也分两步。HTML 校验给用户即时反馈，JS 校验守住写入数据的入口，后续有后端时服务端同样需要校验。

### 保存只改数据，再更新相关页面

`selectedId` 保存正在编辑的商品编号，`inventory` 是固定数据的独立副本。打开编辑器时填入旧库存并聚焦输入；提交时执行：

```js
form.addEventListener("submit", event => {
  event.preventDefault();
  const stock = parseStock(stockInput.value);
  if (stock === null) {
    stockInput.setCustomValidity("请输入 0–99999 的整数。");
    stockInput.reportValidity();
    return;
  }
  const product = inventory.find(product => product.id === selectedId);
  if (product === undefined) return;
  product.stock = stock;
  renderProducts();
  renderSummary();
  feedback.textContent = product.name + "库存已保存为 " + stock + " 件。";
  closeEditor(product.id);
});
```

预期：P002 改为 3，总库存 55 件、总价值 26735.00 元；改回 0 恢复起始统计。小数或越界值被原生校验挡住，解析函数也会返回 `null`。

`setCustomValidity` 设置业务错误文字，非空时字段处于无效状态；`reportValidity` 请求浏览器显示提示。用户重新输入时必须用空字符串清除它，否则改对的输入仍会被旧错误挡住。

数据改变后，`renderProducts()` 更新列表，`renderSummary()` 更新全部商品的统计。改普通对象的 `stock` 不会自动改变页面；反过来，单独改页面文字也不会更新业务数据。

事件函数收集意图，数组保存数据，渲染函数更新显示。汇总来自全部商品，列表来自筛选结果，页面上分别标为「全部库存」和「显示几种商品」。

:::tip[自己尝试 · 本地网页]
1. 打开阶段 2 库存页，用 Tab 找到无线鼠标的编辑按钮，按 Space；光标应进入库存输入框。
2. 分别输入空值、`-1`、`3.8`、`100000` 并保存，观察字段错误；再输入 `0`，按 Enter。
3. 再次打开编辑，改成 8，按 Tab 两次到「取消」，按 Enter。

预期：四类无效值都不修改数据；0 可以保存；取消保持原库存。保存或取消后，焦点回到对应商品的新编辑按钮；若筛选已隐藏它，焦点回到搜索框。
:::

按钮带有「编辑无线鼠标库存」这样的可访问名称，保存结果写入 `role="status"`。键盘用户能找到控件，辅助技术能知道操作对象和结果；这些需求从 HTML 结构开始实现。

## 常见错误与调试

### 点第二次，库存却加了两件

**现象**：打开 `duplicate.html`，机械键盘起始库存 12。点一次变成 13，再点一次变成 15。

```js title="duplicate-broken.js"
// 有问题的写法：每次显示都向同一个按钮增加新函数
const button = document.querySelector("#restock");
const stockNode = document.querySelector("#stock");
let stock = 12;
function render() {
  stockNode.textContent = String(stock);
  button.addEventListener("click", () => { stock += 1; render(); });
}
render();
```

**工具**：DevTools → Sources → 右侧 Event Listener Breakpoints，展开 Mouse，勾选 `click`。刷新页面，点一次后按 Resume 继续，再点第二次。每次暂停都看 Call Stack 和 Scope；DevTools 栏太窄时，可展开右侧折叠面板。

**证据**：第二次点击先后两次进入 `duplicate-broken.js` 的箭头函数，暂停时库存先是 13，随后是 14；继续后显示 15。每次 `render()` 都创建了一个新函数对象，两个监听器已经挂在同一个按钮上。

**原因**：浏览器按「事件类型、函数身份、捕获设置」识别已注册监听器。重复传同一个函数和相同捕获设置会去重，每次新建的箭头函数却各有身份。监听器里面又调用 `render()`，会继续增加后来点击时要执行的函数。

**修复**：把监听注册移到 `render()` 外，只在初始化时执行：

```js title="duplicate-fixed.js"
const button = document.querySelector("#restock");
const stockNode = document.querySelector("#stock");
let stock = 12;
function render() { stockNode.textContent = String(stock); }
button.addEventListener("click", () => { stock += 1; render(); });
render();
```

**确认**：打开 `duplicate-fixed.html`，连续点击两次得到 14。再用事件断点，第二次只进入一个补货回调。固定结构上的监听在初始化时注册一次。

### 输入关键词后，整个列表不见了

**现象**：打开 `removal.html`，输入「键」，列表消失；删掉关键词也不恢复。

```js title="removal-broken.js"
// 有问题的写法：清空列表时，连容器一起删掉了
const search = document.querySelector("#search");
const list = document.querySelector("#products");
search.addEventListener("input", () => {
  list.remove();
});
```

**工具**：先刷新。DevTools → Elements → 找到 `ul#products`，右键 → Break on → Node removal，再往搜索框输入「键」。

**证据**：浏览器暂停在 `list.remove()`，Call Stack 指向 `removal-broken.js`。继续执行后，在 Console 输入 `list.isConnected` 得到 `false`；引用还在，节点已经脱离页面。再次输入时，监听器仍在搜索框上运行，但被删掉的容器不会自己回来。

**原因**：要替换的是列表内容，代码却删除了列表容器。

**修复**：保留 `ul`，用 [`replaceChildren`](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceChildren) 替换里面的行：

```js title="removal-fixed.js"
const search = document.querySelector("#search");
const list = document.querySelector("#products");
search.addEventListener("input", () => {
  const matches = "机械键盘".includes(search.value.trim());
  const row = document.createElement("li");
  row.textContent = "P001 机械键盘：12 件";
  list.replaceChildren(...(matches ? [row] : []));
});
```

**确认**：打开 `removal-fixed.html`，输入不存在的名称得到空列表，清空输入恢复机械键盘；`list.isConnected` 一直是 `true`。如果是行被其他代码删了，在父容器上选 Subtree modifications，就能定位子节点变化。

节点还在但看不见时，再检查 CSS。选中 `ul#products`，在 Styles 临时添加 `display: none`，Computed 中搜索 `display` 会看到最终值；展开它可回到样式来源。取消勾选该声明，列表恢复。先确认节点是否存在，再查样式，能把删除问题和显示问题分开。

## 练习

### 练习 1：两个箭头函数是同一个监听器吗

先写出每行输出，再在 `examples/c11` 运行 `node prediction.js`。这段用数组模拟保存回调，观察函数身份：

```js title="prediction.js"
const callbacks = [];
function handleSave() { console.log("保存"); }
const first = () => handleSave();
const second = () => handleSave();
console.log(first === second); // → false
console.log(handleSave === handleSave); // → true
callbacks.push(first, second);
for (const callback of callbacks) callback(); // → 保存、保存
```

验收：解释输出顺序，并回答「把同一个 `handleSave` 两次传给同一个按钮的 `click` 监听，会执行两次吗？」

<details>
<summary>提示</summary>

数组会保留每次压入的元素。事件系统有自己的监听去重规则，先判断传入的是一个函数对象还是两个。

</details>

<details>
<summary>参考答案</summary>

依次输出 `false`、`true`、`保存`、`保存`。两个箭头表达式创建了两个函数；两个变量都指向 `handleSave` 时才是相同身份。数组循环会执行两个回调。

对同一个按钮，以相同捕获设置注册两次 `handleSave`，浏览器只保留一项监听；传两个分别创建的箭头函数，则保留两项。这就是重复监听 bug 中第二次点击执行两次的原因。

</details>

### 练习 2：让筛选后的按钮继续能编辑

以阶段 2 的 `app.js` 为起点，把委托处理中的 `event.target.closest('button[data-action="edit"]')` 改成 `event.target`，并把下一行改成 `if (!button.matches('button[data-action="edit"]')) return;`。

复现后修好它。验收：点击按钮内文字能打开对应商品；分类切换三次、恢复全部后仍能编辑；点击商品名称不会打开表单。

<details>
<summary>提示</summary>

按钮文字包在 `span` 里。打开事件断点，看 `event.target.tagName`；监听器注册的位置仍然是 `ul`。

</details>

<details>
<summary>参考答案</summary>

点文字时 `target` 是 `SPAN`，它既不匹配按钮选择器，也没有商品 id。恢复第 3 节的 `closest` 查询与空值、包含关系判断，便能从文字向上找到按钮。监听继续挂在父列表上，筛选生成新行后仍然有效。

</details>

## 项目进度

从阶段 1 的 `examples/inventory/01-core` 库存规则开始，新建 [examples/inventory/02-web](https://github.com/socoo123/js_web/tree/main/examples/inventory/02-web)。阶段 1 保留原有筛选、统计、库存校验和撤销实现；本课给这些规则建立一个原生页面入口，只编辑库存。

新增 `index.html`（结构）、`data.js`（固定数据）、`app.js`（事件与渲染）、`style.css`（基础样式与焦点轮廓）。本课按顺序加载经典脚本，用数组实现筛选、统计和库存写入。C16 再拆成 ESM，直接复用阶段 1 的 `Inventory`。

`inventory` 通过复制商品对象和标签数组与固定数据隔离。`createRow(product)` 创建一条商品行，名称和详情都用 `textContent`，按钮写入 `data-id`。上文已展示委托和保存部分，筛选渲染只负责以下工作：

```js
function renderProducts() {
  const keyword = search.value.trim().toLowerCase();
  const visible = inventory.filter(product =>
    (category.value === "" || product.category === category.value) &&
    (product.name.toLowerCase().includes(keyword) || product.id.toLowerCase().includes(keyword))
  );
  list.replaceChildren(...visible.map(createRow));
  document.querySelector("#result-count").textContent = visible.length === 0
    ? "没有匹配的商品。" : "显示 " + visible.length + " 种商品";
}
```

`renderProducts` 只重建列表区域，保留搜索框和编辑表单。六条数据整批更新很直观；表单焦点由打开、关闭编辑的函数管理。

`renderSummary` 对全部商品累加 `stock` 和 `stock * priceCents`，金额存整数分，显示时才除以 100。保存后同时刷新列表与汇总；取消只关闭编辑器。当前页面的改动保存在内存，刷新恢复初始状态。

在仓库根目录保持静态服务运行，打开 `http://127.0.0.1:8000/examples/inventory/02-web/`，按下表验收：

| 操作 | 可观察结果 |
| --- | --- |
| 初次打开 | 6 种商品、52 件、26348.00 元 |
| 分类选配件 | P004、P005 两行，全部库存统计保持不变 |
| 分类配件且搜索键盘 | 显示「没有匹配的商品。」 |
| 恢复全部，搜索 p002 | 只显示无线鼠标，编号搜索不区分大小写 |
| P002 库存由 0 改 3 | 55 件、26735.00 元，出现保存提示 |
| 库存填空、小数、负数或超上限 | 出现字段错误，商品与汇总保持原值 |
| 编辑后取消 | 库存不变，焦点回到编辑按钮 |
| 刷新 | 恢复六件商品的起始值 |

## 小结

- DOM 查询返回节点引用；`querySelectorAll` 的成员列表是查询时的快照。
- 外部文本用 `textContent`，页面结构用节点创建方法表达。
- 捕获由外向内，冒泡由内向外；事件委托让稳定父节点处理动态子节点。
- 表单提交先校验，再把字符串转换成业务数字；0 和无效值 `null` 分开判断。
- 业务数据是来源，DOM 是显示结果；用事件断点找重复处理，用 DOM 断点找意外修改。

自测：

1. 为什么追加一行后，旧 `NodeList` 的长度仍然是 1？
2. `innerHTML` 没有执行插入的 `script`，为什么仍可能有 XSS？
3. 点在按钮内的 `span`，`target` 和 `currentTarget` 分别是谁？
4. `preventDefault` 为什么不能解决重复监听？
5. 为什么只改商品行的文字，库存汇总不会自动改变？

下一课讲回调、Promise 与执行顺序，为库存模块加入模拟异步加载。

## 延伸阅读

- [MDN：DOM 脚本编程介绍](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Scripting/DOM_scripting)
- [MDN：textContent](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent)
- [MDN：innerHTML](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/innerHTML)
- [MDN：事件冒泡](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Scripting/Event_bubbling)
- [MDN：客户端表单验证](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Extensions/Forms/Form_validation)
- [Chrome DevTools：断点类型与使用方法](https://developer.chrome.com/docs/devtools/javascript/breakpoints)
