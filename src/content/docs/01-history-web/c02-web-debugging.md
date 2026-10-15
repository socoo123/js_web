---
title: C02 Web 基础与第一个调试现场
description: 做出一张库存商品卡片，理解 HTML、CSS、DOM 与页面加载，用四个 DevTools 面板找到路径、样式和脚本问题。
sidebar:
  order: 2
---

> **第 1 周 · 第 1 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C01 · 运行：本地网页与浏览器 Console · 示例已运行验证

## 这一课解决什么问题

C01 已经能算出库存 `12 - 3`，但日志里的 9 还不是网页上的 9。你需要放一个输入框，让用户登记售出，再把结果写回商品卡片。

商品和样式都在，按钮却一直灰着；改个宽度，手机上突然横向滚动。问题出在资源、样式还是计算？这课用三个文件做出页面，再拿证据找原因。

学完你能：

- 用有语义的 HTML 组织商品、标签、输入框和按钮
- 读懂 CSS 选择器、盒模型、Flex、Grid 和窄屏规则
- 从 DOM 读取输入，计算库存，再显式更新页面
- 解释相对路径与脚本加载顺序，用 DevTools 定位故障

从 [examples/c02](https://github.com/socoo123/js_web/tree/main/examples/c02) 下载 `index.html`、`styles.css`、`app.js`，放到同一个 `c02-lab` 文件夹，跟着正文的片段对照完整文件。

编辑器保存文件，终端启动服务，浏览器执行 JS。已有 Python 3 时，在终端**进入 `c02-lab` 目录**运行；也可用编辑器已有的静态预览服务。

```sh
python3 --version
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8000/`。Python 只返回文件，浏览器执行脚本。端口占用时，两处 8000 一起改为 8001；终端按 `Ctrl+C` 结束。参数见 [Python 静态文件服务](https://docs.python.org/3/library/http.server.html#command-line-interface)。

:::tip[自己尝试 · 本地网页]
1. 启动服务，用 Chrome 打开页面。应看到 P001 机械键盘、库存 12、售出数量 3。
2. 点击「确认售出」：库存变成 9，反馈显示「已售出 3 件，剩余 9 件。」。
3. 将数量改为 10 再提交：提示库存不足，库存仍为 9。
4. 数量改为 9 再提交：库存变成 0，售出按钮禁用。刷新页面，恢复为 12。

预期：页面始终留在原地址。这份练习把库存存在当前页面内存中，刷新会重新初始化。
:::

## Java 程序员先看这里

| Java 经验 | 本课对应 | 差异 |
| --- | --- | --- |
| 类、方法组织程序 | HTML、CSS、JS 分别组织内容、外观和交互 | HTML 是标记语言，CSS 是样式语言 |
| 调用对象的方法、修改字段 | 查找 DOM 节点，再改属性 | 改业务变量后，要另外更新页面节点 |
| Swing/JavaFX 布局管理器 | Flex、Grid 根据规则排布元素 | 布局还会随浏览器可用宽度改变 |
| 注册事件监听器 | `addEventListener` 接收处理函数 | 注册时交函数，用户操作时才调用 |
| IDE 断点、变量、调用栈 | Sources、Scope、Call Stack | 页面还要结合 Network 和 Elements 排错 |

## 1. HTML：把内容写成有含义的文档

HTML 用标签表达内容的职责。打开 `index.html`，先看文档开头：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>C02 库存商品卡片</title>
    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="./styles.css">
    <script src="./app.js" defer></script>
  </head>
```

浏览器标签页显示「C02 库存商品卡片」。`doctype` 开启标准模式，`lang` 说明语言，UTF-8 指定编码。`head` 放页面信息和资源引用，`body` 放可见内容。`viewport` 让移动浏览器按设备宽度布局。

`<h2 id="product-name">机械键盘</h2>` 包含开始标签、属性、文本、结束标签。`id` 在本页唯一，`class` 是可复用的分组标记。`meta`、`link`、`input` 是空元素，没有结束标签。嵌套表示包含，和 Java 的继承不同。

`body` 中，`main` 是主体，`h1` 是页面标题，`article` 是商品卡片。卡片里的商品信息和表单如下：

```html
          <p>商品编号：P001</p>
          <p class="stock-line">剩余库存：<strong id="stock">12</strong> 件</p>

          <form id="sale-form">
            <label for="quantity">售出数量</label>
            <div class="sale-controls">
              <input id="quantity" name="quantity" type="number"
                min="1" step="1" value="3" required>
              <button id="sell-button" type="submit" disabled>确认售出</button>
            </div>
          </form>
          <p id="feedback" role="status">加载完成后可以登记售出。</p>
```

页面会显示库存、输入框和按钮。点击「售出数量」标签，焦点进入输入框，因为 `label` 的 `for` 对应输入的 `id`。`name` 是表单提交时的字段名，和用于查找节点的 `id` 各有职责。

`form` 组织一次提交，`type="submit"` 表示提交按钮；输入框里按 Enter 也能提交。标题层级、label 和原生按钮的键盘行为帮助用户操作页面。`role="status"` 通知反馈变化。[MDN 的表单入门](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Extensions/Forms/Your_first_form)有更多例子。

### 输入约束与按钮状态

`required` 要求填写，`min="1"` 要求至少 1，`step="1"` 要求整数。把数量清空，或者填 0、1.5，点击提交会出现浏览器的校验提示，库存保持原值。数量为 13 虽然通过这些约束，却超过库存 12，需要 JS 检查业务规则。

`disabled` 是布尔属性：只要存在就禁用，写成 `disabled="false"` 仍然禁用。脚本成功注册监听后会把按钮的 `disabled` 属性设为 `false`，让它可用。因此脚本没加载时，卡片内容仍在，按钮保持灰色。

## 2. CSS：选中元素，再决定盒子怎样排列

CSS 规则是「选择器 `{ 属性: 值; }`」。`*` 选中所有元素，`.product-card` 选中商品卡片：

```css
* {
  box-sizing: border-box;
}

.product-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #b8c8db;
  border-radius: 12px;
  background: white;
  overflow-wrap: anywhere;
}
```

结果是一张白底、圆角、有边框的卡片，文字和边框之间留出 20px。HTML 写 `class="product-card"`，CSS 用 `.product-card` 选择它；点号属于选择器。

| 选择器 | 选中什么 |
| --- | --- |
| `body` | 按标签名选元素 |
| `.product-card` | 所有带这个 class 的元素，class 可复用 |
| `#feedback` | id 为 feedback 的元素 |
| `input, button` | 两类元素，共用同一组声明 |
| `button:disabled` | 当前被禁用的按钮 |

多条规则匹配时，右键卡片 → 检查 → **Elements → Styles**，被覆盖的声明有划线，**Computed** 显示最终值。本例同一来源、同一层的普通声明中，ID 优先于 class，class 优先于标签；同等优先级再比较先后。

### 盒模型：300px 包括了什么

每个盒子从内到外是内容 content、内边距 padding、边框 border、外边距 margin。padding 在边框内，margin 在边框外；背景色覆盖到边框区域，外边距保持透明。

默认 `content-box` 下，`width: 300px` 只指定内容宽。再加左右各 20px padding、1px border，整个边框盒就有 `300 + 40 + 2 = 342px`。设置 `border-box` 后，同样的 300px 已包含 padding 和 border，内容剩 `300 - 40 - 2 = 258px`。两种方式都把 margin 留在 width 之外。[MDN：盒模型](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Box_model)。

在 Elements 选中卡片，查看 Computed 的盒模型，再把 Styles 中的 padding 改成 32px。预期：内容向内收，外部宽度不变。刷新后恢复 20px；要保留修改，就写回 `styles.css`、保存再刷新。

### Grid 排列卡片，Flex 对齐卡片里的项目

外层容器用 Grid 分列，卡片标题行用 Flex 排列标题和分类：

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
```

宽屏上得到两个等宽列，中间隔 16px；只有一张卡片，第二列留空。`repeat(2, …)` 重复两列，`1fr` 各分一份剩余空间，`minmax(0, 1fr)` 允许缩小。Grid 管直接子元素，标题由卡片内部的 Flex 管。

`justify-content` 沿主轴分配空白，`align-items` 沿交叉轴居中，`flex-wrap` 允许换行。输入框和按钮也用 Flex。如同给 JavaFX 的不同容器配置布局，浏览器会按可用尺寸重新排布。[MDN：CSS 布局](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Introduction)。

### 响应式：窄屏换一套布局规则

文件末尾的媒体查询在视口宽度不超过 640px 时生效：

```css
@media (max-width: 640px) {
  .page {
    padding: 16px;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
```

在 DevTools 左上方打开设备工具栏，选择 Responsive，把宽度设为 360。预期：外层变成单列，页面两侧各留 16px，卡片不超出屏幕。改到 1280，恢复两列轨道。媒体查询检查的是视口宽度；这里的 px 是 CSS 像素，不一定对应一个物理像素。

## 3. JS 与 DOM：变量变了，页面还要再改一次

浏览器把 HTML 解析成节点树，这就是 DOM。HTML 文件是初始输入，DOM 是当前页面的对象结构，屏幕则是浏览器结合 DOM 和样式绘制的结果。

[`document.querySelector`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelector) 按 CSS 选择器返回第一个匹配节点，找不到得到 `null`。`textContent` 读写文本，输入框的 `value` 读写输入值。

**先猜一猜：** 库存看起来是数字，输入框也写了 `type="number"`，下面读出来是什么类型？刷新练习页后，在 Console 粘贴：

```js title="dom-basics.js"
const shownStock = document.querySelector("#stock");
console.log(shownStock.textContent); // → 12
console.log(typeof shownStock.textContent); // → string
console.log(typeof document.querySelector("#quantity").value); // → string
```

两处读到的都是字符串；`type="number"` 约束输入内容，`value` 仍是文本。计算前用 `Number(...)` 转成数字，显示时用 `String(...)` 转回文本。

### 监听提交，把输入交给计算

`app.js` 开头保存节点引用，以及初始业务库存：

```js
const saleForm = document.querySelector("#sale-form");
const quantityInput = document.querySelector("#quantity");
const stockNode = document.querySelector("#stock");
const feedback = document.querySelector("#feedback");
const sellButton = document.querySelector("#sell-button");
let stock = 12;
```

`const` 保持节点引用不变，`let stock` 允许库存重新赋值。页面的初始 12 来自 HTML，业务变量的 12 来自脚本；售出时两处都要更新。

表单处理函数如下，完整保存在同一个 `app.js`：

```js
function handleSale(event) {
  // 本课在页面内处理表单，不执行默认的导航提交。
  event.preventDefault();
  const quantity = Number(quantityInput.value);

  if (!Number.isInteger(quantity) || quantity < 1) {
    feedback.textContent = "请输入大于 0 的整数。";
    return;
  }

  if (quantity > stock) {
    feedback.textContent = "库存不足，当前只有 " + stock + " 件。";
    return;
  }

  const remaining = stock - quantity;
  stock = remaining;
  stockNode.textContent = String(stock);
  feedback.textContent = "已售出 " + quantity + " 件，剩余 " + stock + " 件。";
  sellButton.disabled = stock === 0;
  console.log("库存变化", stock);
}
```

输入 3 后，`remaining` 和 `stock` 是数字 9，节点文本是字符串 `"9"`，Console 打印 `库存变化 9`。两个 `if` 拦住非法数量和超卖，`return` 提前结束处理。`===` 表示严格相等，库存为 0 时禁用按钮。

`event.preventDefault()` 取消表单默认的导航提交，让操作留在页面内。监听表单的 `submit`，点击和 Enter 都走同一个函数。

末尾用 `saleForm.addEventListener("submit", handleSale)` 注册监听，再启用按钮。和 Java 监听器一样，函数交给事件系统稍后调用；写成 `handleSale()` 会立即执行。

### 在计算那一行停住

:::tip[自己尝试 · 本地网页]
1. 刷新，确认库存 12、数量 3。右键页面 → 检查 → Sources，在左侧文件树找到 `app.js`。
2. 单击 `const remaining = stock - quantity;` 的行号设置断点，回到页面点「确认售出」。
3. 暂停时看 Scope 中的 `quantity`，并在 Console 输入 `stock`：应分别为数字 3 和 12。
4. 点 Step over 单步跳过，此时 `remaining` 为 9，`stock` 仍为 12。
5. 看 Call Stack 顶部的 `handleSale`，再点 Resume 继续，页面显示 9。删除断点。

预期：断点停在该行执行之前；单步后减法完成，但下一行赋值还没发生。
:::

和 Java IDE 一样，Scope 看变量，Call Stack 看调用位置，Step over 单步，Resume 继续。暂停时页面还没更新，继续执行才会看到结果。[Chrome：调试 JavaScript](https://developer.chrome.com/docs/devtools/javascript/)。

## 4. URL 与页面加载：先有节点，再连接交互

浏览器通过 URL 请求文件。`http://127.0.0.1:8000/index.html?mode=learn#stock` 可以拆成：

| 部分 | 本例的含义 |
| --- | --- |
| `http` | 协议；线上常见 HTTPS |
| `127.0.0.1` | 主机，当前电脑的回环地址 |
| `8000` | 端口，和终端启动的服务对应 |
| `/index.html` | 路径，定位服务中的资源 |
| `?mode=learn` | 查询参数；本例代码没读取它，页面行为不变 |
| `#stock` | 片段，可定位页面里的 id；不随 HTTP 请求发送给服务 |

**先猜一猜：** 页面多了一层目录，`./app.js` 与 `/app.js` 还会请求同一个文件吗？

```js title="url-resolution.js"
const pageUrl = "http://127.0.0.1:8000/c02-lab/index.html";
console.log(new URL("./app.js", pageUrl).href);
console.log(new URL("/app.js", pageUrl).href);
```

```text
http://127.0.0.1:8000/c02-lab/app.js
http://127.0.0.1:8000/app.js
```

本例没有 `base` 元素，`./` 相对文档目录，`/` 从站点根开始。本地两者可能碰巧相同；部署到课程站的 `/js_web/` 下，`/app.js` 就会丢掉这层目录。[MDN：什么是 URL](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL)。

### HTML 成功，脚本也可能失败

HTTP 是请求与响应。HTML、CSS、JS 分别请求，各有自己的响应状态和内容。

- **200**：请求成功，返回资源内容。
- **304**：缓存再验证时确认资源没变，浏览器继续使用缓存。
- **404**：服务找不到这个请求目标，先核对地址与文件名。

打开 **Network** 后刷新，选中 `app.js`，在 Headers 查 Request URL、Status Code，在 Response 看内容。HTML 和脚本要分别检查。

### defer 解决节点还没建立的问题

本页把外部脚本放在 `head` 并加 `defer`，让浏览器一边解析 HTML，一边下载脚本，等 HTML 解析完成、脚本就绪后再执行。这时 `querySelector` 才能找到后面的表单。

![交互流程：解析 HTML 建立 DOM 并下载资源，解析完成且脚本就绪后执行 defer 脚本；注册监听，提交表单后计算库存、更新 DOM，再由浏览器安排后续布局与绘制。](../../../assets/diagrams/c02-page-flow.svg)

从上往下看：先连接节点与监听器，提交时再计算和更新。图展示交互路径；初始页面可以在用户操作前显示。

| 原始 HTML 中的普通外部脚本 | 执行时机 |
| --- | --- |
| 不带 defer 或 async | 解析器遇到后等待下载和执行，再继续解析 HTML |
| 带 defer | 下载可与解析并行，解析完成后按文档顺序执行 |
| 带 async | 下载可与解析并行，脚本就绪就尽快执行，不保证节点已存在或多个脚本按文档顺序执行 |

本页脚本要操作下面的表单，因此选 `defer`。它延后执行时机，JS 仍在页面主线程执行。[MDN：script 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/script)。

## 常见错误与调试

### 商品和样式都有，售出按钮一直灰着

**现象**：把 `index.html` 中的 `src="./app.js"` 改成 `src="./ap.js"`，保存刷新。卡片存在，按钮禁用，Console 没有 `C02 ready`。

**工具**：打开 Network 后刷新，筛选 JS，选中 `ap.js`，查看 Headers 和 Response。

**证据**：Request URL 的文件名是 `ap.js`，状态为 404，实际目录中的文件叫 `app.js`；HTML 和 CSS 请求成功。

**原因**：浏览器根本没有执行库存脚本，启用按钮的语句也没有执行。

**修复**：在编辑器恢复 `src="./app.js"`，保存。

**确认**：刷新，脚本成功加载，Console 出现 `C02 ready`，按钮启用；售出 3 后库存为 9。[Chrome：检查网络活动](https://developer.chrome.com/docs/devtools/network/)。

### 脚本加载成功，却说不能读取 null 的 addEventListener

**现象**：恢复正常文件，再删掉 `head` 中脚本的 `defer`。刷新后 Console 出现 `TypeError`，指向注册监听的语句。

**工具**：点击错误里的 `app.js:行号` 跳到 Sources，在开头查找 `saleForm` 的语句设断点，再刷新并单步执行该查询。

**证据**：此时 `saleForm` 为 `null`。Console 中输入 `document.querySelector("#sale-form")` 也得到 `null`；源文件里却确实存在这个 id。

**原因**：普通脚本在 `head` 就执行了，解析器还没走到 `body` 中的表单。

**修复**：给该外部脚本恢复 `defer`，保存，并删除断点。

**确认**：刷新后查询得到表单节点，Console 无此异常，售出 3 得到 9。遇到同样异常时也查选择器拼写：`null` 的直接含义是「这次查询没找到节点」，还要结合文件和执行时机判断原因。

## 练习

### 练习 1：预测变量和屏幕会不会一起变

刷新练习页，保持输入 3，先写下三行的值和类型，再将 `dom-prediction.js` 粘贴到 Console。验收：解释为什么屏幕上的 99 和业务库存可以不同。

```js title="dom-prediction.js"
stockNode.textContent = "99";
console.log(stock); // 先猜结果，再运行
console.log(stockNode.textContent);
console.log(quantityInput.value);
```

<details>
<summary>提示</summary>

第一行修改的是节点文本。检查后面三行分别在读取业务变量、节点属性还是输入框的值。

</details>

<details>
<summary>参考答案</summary>

依次打印数字 `12`、字符串 `"99"`、字符串 `"3"`，可用 `typeof` 核对。

DOM 和业务变量是两处状态，改一处不会自动改另一处。此时售出 3，程序仍按业务库存 `12 - 3` 计算，并把文本改成 `"9"`，覆盖手工写入的 99。刷新也会恢复初始 12。

</details>

### 练习 2：修好手机上的横向滚动

在 `styles.css` 末尾追加下面的错误样式，保存刷新，再把设备工具栏的宽度设为 360：

```css
/* 有问题的写法：给卡片固定一个超过窄屏的宽度 */
.product-card { width: 720px; }
```

目标：用 Elements 找到造成超宽的声明，修到 360 和 1280 下都没有整页横向滚动，售出交互仍可用。可以在 Console 比较 `document.documentElement.scrollWidth > document.documentElement.clientWidth`，故障时为 `true`，修复后应为 `false`。

<details>
<summary>提示</summary>

查看 Computed 中卡片的边框盒宽度，再与视口比较。媒体查询改的是列数，`border-box` 改的是宽度的计算范围，谁会取消你刚写的 720px？

</details>

<details>
<summary>参考答案</summary>

删除刚追加的整条固定宽度规则。让卡片继续按 Grid 的可用列宽伸展，原有窄屏规则就能正常工作。

720px 包含了 padding 和 border，仍大于手机的可用宽度。删掉源文件中的固定宽度，再刷新确认。[Chrome：查看和修改 CSS](https://developer.chrome.com/docs/devtools/css/)。

</details>

### 练习 3：增加「补货 5 件」

在 `index.html` 的 `</form>` 后、反馈段落前加按钮，然后在 `app.js` 末尾编写监听器：

```html
<button id="restock-button" type="button">补货 5 件</button>
```

按顺序验收：刷新为 12 → 补货为 17 → 售出 17 为 0、售出按钮禁用 → 再补货为 5、售出按钮启用 → 售出 3 为 2。每一步都比较 Console 中的 `stock` 和页面文本。

<details>
<summary>提示</summary>

要同步四处：业务库存、库存文本、反馈、售出按钮状态。补货按钮用 `type="button"`，它负责一次普通操作。

</details>

<details>
<summary>参考答案</summary>

将 `restock-answer.js` 的内容追加到 `app.js` 末尾，使用前面已有的变量：

```js title="restock-answer.js"
// 追加到 app.js 末尾；先在 form 后添加 #restock-button 按钮。
const restockButton = document.querySelector("#restock-button");

function handleRestock() {
  stock = stock + 5;
  stockNode.textContent = String(stock);
  feedback.textContent = "已补货 5 件，剩余 " + stock + " 件。";
  sellButton.disabled = false;
}

restockButton.addEventListener("click", handleRestock);
```

补货固定增加 5，库存变为正数，因此可以启用售出按钮。只改节点文本会让下一次售出用旧库存，只改业务变量则会让画面停在旧值。

</details>

## 小结

- HTML 表达内容和表单语义，CSS 决定外观布局，JS 连接输入与计算。
- 盒模型区分内容、内边距、边框、外边距；Grid、Flex 和媒体查询配合可用空间排布。
- DOM 是当前节点结构。读输入得到文本，改业务变量后还要显式更新节点。
- 相对 URL 从文档目录解析，根路径从站点根解析；defer 让本页脚本等 DOM 建好再执行。
- Network 查资源，Elements 查节点与样式，Console 查表达式与错误，Sources 用断点查计算过程。

自测：

1. 为什么把 `stock` 改成 9，屏幕上的数字仍可能是 12？
2. `label for="quantity"`、`#quantity`、`.product-card` 分别引用什么？
3. `width: 720px` 加了 `border-box`，为什么还会在手机上超宽？
4. 按钮一直灰着时，怎样用请求地址和状态码区分脚本未加载与计算错误？
5. 在减法那一行设断点，暂停前后应当看到哪些变量变化？

下一课讲值、类型与转换，解释为什么输入框读到的「3」有时会把补货算成 123。

## 延伸阅读

- [MDN：HTML 入门](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax)
- [MDN：创建第一个表单](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Extensions/Forms/Your_first_form)
- [MDN：盒模型](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Box_model)
- [MDN：介绍 CSS 布局](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Introduction)
- [Chrome DevTools：调试 JavaScript](https://developer.chrome.com/docs/devtools/javascript/)
- [Chrome DevTools：检查网络活动](https://developer.chrome.com/docs/devtools/network/)
