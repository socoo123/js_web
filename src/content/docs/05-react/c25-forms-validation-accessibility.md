---
title: C25 表单、校验与可访问性
description: 建立商品编辑表单，区分输入草稿和业务数据，完成数字校验、错误提示与键盘操作。
sidebar:
  order: 25
---

> **第 3 周 · 第 13 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br>
> 前置：C03、C11、C23、C24 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

C24 已经能给无线鼠标补货。现在要把库存改成 3、单价改成 129.90 元，再加上「热销」标签。你写出几个输入框，发现名称刚输入就弹回原值；库存一清空，保存后却变成了 0。

点取消也提交、Enter 没反应、红框不解释原因、保存后焦点丢失，也都是表单问题。表单既要处理数据，也要交代操作过程。

学完你能：

- 根据需求选择受控或非受控输入，正确读取文本、下拉框和复选框
- 把可暂时为空的输入草稿转换成合法库存和整数分价格
- 分清原生约束校验与业务校验，让点击和 Enter 走同一个提交入口
- 用 label、错误说明和焦点安排完成可用的键盘流程
- 在阶段 4 加入商品编辑，保存后让列表、筛选与统计同步变化

纯 JS 例子在 [examples/c25](https://github.com/socoo123/js_web/tree/main/examples/c25)，完整组件在[库存项目阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)。在阶段 4 目录执行 `npm ci`，再执行 `npm run dev -- --host 127.0.0.1`，打开终端给出的 /js_web/ 地址。实验页都在该地址后加 labs/forms.html?case=实验名。

## Java 程序员先看这里

| Java 经验 | React 中的对应 | 差异 |
| --- | --- | --- |
| 文本组件保存编辑中的文本 | 非受控输入由 DOM 保存当前值 | 受控输入则由 React state 决定显示值 |
| DTO 中 stock 是 int | 商品 stock 是 number | 输入中的 stock 仍是字符串，可以暂时为空 |
| Bean Validation 检查字段 | HTML 约束与业务校验函数 | 浏览器约束改善交互，字段规则仍要明确实现 |
| BigDecimal 处理十进制金额 | 价格文本转换为整数分 | 本项目按文本拆分小数部分，保存前检查安全整数 |
| 表单提交按钮触发处理 | form 的 onSubmit | 浏览器还提供 Enter 提交、默认导航和原生校验 |

## 1. 受控与非受控：当前值存在哪里

**受控输入的显示值来自 state，输入事件把新文本写回 state。** 用户输入、调用 setter、重新渲染，形成一次闭环。[React input](https://react.dev/reference/react-dom/components/input)

阶段 4 的 labs/ControlledName.jsx 是一个完整的最小组件：

```jsx
import { useState } from "react";

export default function ControlledName() {
  const [name, setName] = useState("机械键盘");
  return <label>商品名称<input value={name} onChange={(event) => setName(event.target.value)} /></label>;
}
```

打开 case=controlled，把名称改成「键盘待盘点」，输入框保留新文本；全选删除，输入框为空。

value 决定显示值，onChange 提供刚发生的编辑。React 的文本 onChange 每次输入就触发，接近原生 input 事件。立即保存 event.target.value，显示才能跟上输入。

name 始终保存字符串，空值用空字符串，避免从 undefined 切换成字符串而改变控制模式。trim 留到提交时做，输入期间保留原始文本。

### 只在提交时读取，可以用非受控输入

非受控输入把当前文本交给浏览器 DOM。defaultValue 只给初始值，之后用 FormData 在提交时读取。下面是 labs/UncontrolledForm.jsx：

```jsx
import { useState } from "react";

export default function UncontrolledForm() {
  const [result, setResult] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setResult(`${data.get("name")} / ${typeof data.get("stock")} / ${data.has("featured")}`);
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>商品名称<input name="name" defaultValue="机械键盘" /></label>
      <label>库存数量<input name="stock" type="number" defaultValue="12" /></label>
      <label className="checkbox-label"><input name="featured" type="checkbox" defaultChecked />热销标签</label>
      <button type="submit">读取表单</button>
      <p role="status">{result}</p>
    </form>
  );
}
```

**先猜一猜：** 打开 case=uncontrolled，把名称改成「键盘待盘点」，保持热销勾选，提交后显示什么？

结果是 **键盘待盘点 / string / true**。取消勾选再提交，最后一项变成 false。result 只保存提交结果，输入文本仍由 DOM 保存。

[FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/FormData) 按控件的 name 收集数据，id 用来识别页面元素，二者职责不同。没有 name、被 disabled 的控件不会进入数据；未勾选的 checkbox 也不会进入。普通文本字段读取为字符串，缺失项的 get 结果为 null。

需要逐次响应编辑时用受控输入，简单表单可以提交时读取。Java 对照：类似从文本组件取值或由界面模型决定组件值；React 还要求通过 setter 更新 state。

### select 读 value，checkbox 读 checked

本课编辑表单采用受控方式。src/ProductForm.jsx 中的两种控件分别这样更新：

```jsx
      <select {...fieldProps("category")} required value={draft.category}
        onChange={(event) => change("category", event.target.value)}>
        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
```

选择音频后，draft.category 是字符串「音频」，重新渲染后仍选中它。[React select](https://react.dev/reference/react-dom/components/select) 在父元素上用 value 管理选中项。

checkbox 的开关读 checked，得到布尔值：

```jsx
      <label className="checkbox-label"><input type="checkbox" name="featured" checked={draft.featured}
        onChange={(event) => change("featured", event.target.checked)} />热销标签</label>
```

它的 value 是提交给 FormData 的值，默认是字符串 on；是否勾选由 checked 表示。

change 用 `setDraft(pending => ({ ...pending, [field]: value }))` 更新一项：[field] 指定字段，展开保留其他值，沿用 C24 的不可变更新。

## 2. 草稿保存字符串，提交时生成业务数字

草稿允许空字符串，业务库存要求 0–99999 的整数。分开保存，才能清空旧值再输入新值。

**先猜一猜：** 清空库存后，转换与业务解析各得到什么？在 examples/c25 目录运行：

```js title="value-boundary.js"
import { parseStock } from "../inventory/04-react/src/product-form.js";

const rawStock = "";
console.log(typeof rawStock, Number(rawStock)); // → string 0
console.log(parseStock(rawStock)); // → null
console.log(parseStock("0")); // → 0
console.log(parseStock("3.5")); // → null
console.log(parseStock("100000")); // → null
```

Number 把空字符串转成 0，丢掉了「未填写」信息。业务解析用 null 表示无效，字符串 0 才产生数字 0。这就是 C03 的输入边界。

src/product-form.js 的 parseStock 先检查格式，再转换并检查范围：

```js
export function parseStock(text) {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const stock = Number(trimmed);
  return Number.isInteger(stock) && stock <= 99999 ? stock : null;
}
```

正则要求至少一位十进制数字，拒绝空白、负号、小数、指数写法和单位。范围检查保留 0 与 99999。结果用 null 判断无效，`if (!stock)` 会误伤合法的 0。

type=number 读出的 value 仍是字符串；valueAsNumber 可读数字，空值为 NaN。本课统一保留文本草稿，提交时检查非空、格式和范围。

Java 对照：draft 类似 HTTP 表单原始参数，解析校验后才得到业务 DTO；立刻转 int 会丢掉编辑中的空白状态。

### 元转分：先检查小数位，再做精确换算

价格按元输入、按分保存，要求非负、最多两位小数。129.999 应提示修改，不能静默截断。

```js title="price-cents.js"
import { parsePriceCents } from "../inventory/04-react/src/product-form.js";

console.log(0.29 * 100); // → 28.999999999999996
console.log(parsePriceCents("0.29")); // → 29
console.log(parsePriceCents("129.9")); // → 12990
console.log(parsePriceCents("129.999")); // → null
console.log(parsePriceCents("3元")); // → null
console.log(parsePriceCents("")); // → null
```

浮点乘法仍有误差。限定两位小数后，可拆分十进制文本，补足小数位，再合成整数分：

```js
export function parsePriceCents(text) {
  const trimmed = text.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole + fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}
```

129.9 的小数部分补成 90，拼成 12990 后调用 Number；0.29 变成整数文本 029，得到 29。无小数时补 00，最后检查安全整数范围。

price 可以暂存 129.，保存时要求补完整。组件用文本 input 保留中间态，inputMode=decimal 提示移动设备选择键盘；校验仍由解析函数完成。

Java 对照：BigDecimal 支持更一般的十进制运算；这里利用最多两位小数的约定转换为整数分，后续按整数计算。

## 3. 提交入口：原生约束与业务校验各做一层

form 的 onSubmit 统一处理按钮与 Enter 提交。保存按钮写 type=submit，取消写 type=button。[button 的类型](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/button)

浏览器默认提交会发送数据并导航。本地 state 编辑在处理函数中用 event.preventDefault() 阻止导航，再执行校验和保存。

### 原生约束先挡住简单错误

打开 case=native，对照 labs/NativeForm.jsx：

```jsx
import { useState } from "react";

export default function NativeForm() {
  const [message, setMessage] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    setMessage(`进入提交处理：库存 ${new FormData(event.currentTarget).get("stock")} 件`);
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>库存数量<input name="stock" type="number" required min="0" max="99999" step="1" /></label>
      <button type="submit">提交库存</button>
      <p role="status">{message}</p>
    </form>
  );
}
```

空输入点击提交，浏览器提示必填；填 -1 触发下限约束，填 1.5 触发步长约束；填 0 后按 Enter，页面显示「进入提交处理：库存 0 件」。前三次原生校验没有通过，onSubmit 没有执行。

[约束校验](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Constraint_validation)中的 required 管非空，min/max 管范围，step=1 要求按整数步长取值。validity 查看失败项，checkValidity() 返回是否通过，reportValidity() 还显示反馈。

required 接受只含空格的普通文本，商品名称却要 trim 后有内容。这类业务要求需要自己的校验函数。将来接入后端，服务端也按字段规则校验收到的数据。

### 自定义错误信息时，仍然执行完整业务校验

编辑表单要在字段下显示中文错误，使用 noValidate 让提交进入自定义处理。required 继续描述要求，原生弹出提示由自定义反馈取代。

validateDraft 一次检查所有字段，有错误就返回 value=null，全部通过才产出业务值。在 examples/c25 运行：

```js title="validate-draft.js"
import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";

const mouse = products[1];
const draft = { ...toDraft(mouse), name: "  无线鼠标  ", stock: "3", price: "129.90", featured: true };
const { value } = validateDraft(draft, mouse.tags);
console.log(value.name, value.stock, value.priceCents, value.tags.join("、"));
console.log(typeof draft.stock, typeof value.stock);
console.log(mouse.stock, mouse.priceCents, mouse.tags.length);
```

输出是 **无线鼠标 3 12990 热销**、**string number**、**0 12900 0**。名称去首尾空格，库存与价格变为数字，旧商品保持原样。分类限四选一，名称 trim 后为 1–40 个字符。

热销开关只增删热销，扩展坞取消热销后仍保留新品。校验集中在纯函数里，Node 示例、组件和测试都可调用。

ProductForm 的提交函数只负责安排这些结果：

```jsx
  function handleSubmit(event) {
    event.preventDefault();
    const result = validateDraft(draft, product.tags);
    setErrors(result.errors);
    if (result.value === null) {
      const firstField = Object.keys(result.errors)[0];
      event.currentTarget.elements.namedItem(firstField)?.focus();
      return;
    }
    onSave(product.id, result.value);
  }
```

失败时显示错误、聚焦并返回；成功才调用 onSave。event.currentTarget 是绑定处理函数的 form，elements.namedItem 按控件 name 找到第一个错误字段。

Java 对照：类似将表单绑定到 DTO 并验证，根据字段错误决定反馈或保存。

## 4. 可访问性：名称、原因和下一步都要找得到

label 提供可见名称，点击文字会聚焦输入，辅助技术也能识别。分开写时 htmlFor 与 input 的 id 一致；嵌套 input 也有效。

ProductForm 用商品编号构造 id，例如 edit-P002-name，同页打开多个商品时仍能区分。名称字段与错误显示如下：

```jsx
      <label htmlFor={`${prefix}-name`}>商品名称（必填）</label>
      <input {...fieldProps("name")} required autoFocus value={draft.name}
        onChange={(event) => change("name", event.target.value)} />
      {errorMessage("name")}
```

点击编辑后，名称获得焦点。纯空格提交后出现红框和「请输入 1–40 个字符的名称。」，焦点回到名称，帮助用户看见、理解并修改问题。

fieldProps 在有错时提供 aria-invalid=true，让 aria-describedby 指向 errorMessage 生成的错误段落。文字解释原因，颜色只是辅助。[字段错误的关联方式](https://www.w3.org/WAI/tutorials/forms/notifications/)

顶部 role=alert 提示保存失败，各字段解释原因。错误在首次提交后显示，下一次提交重新计算，让用户先输入再集中检查。

autoFocus 只在用户点编辑、表单挂载时发生。失败后聚焦第一个错误，Tab 可继续处理。事件中的 DOM focus 改变交互位置，输入值仍由 state 管理。

键盘顺序为名称、分类、库存、单价、热销、保存、取消。Tab 前进，Shift+Tab 后退，空格切换热销，Enter 提交。沿用原生控件行为和可见的 focus-visible 轮廓。

取消编辑会丢弃这次草稿，焦点返回该商品的编辑按钮。保存后焦点移到页面的库存管理标题，它有 tabIndex=-1，允许代码聚焦，却不会多占一个日常 Tab 停靠点。成功提示放在持续存在的 role=status 区域。

改名或分类后，商品可能移出筛选，编辑按钮随之消失；标题仍在，可继续查看统计和条件。Java 对照：类似桌面 GUI 的标签和焦点设计，网页还把名称与错误关系交给可访问性树。

## 5. 编辑草稿和商品列表各保存什么

ProductForm 保存草稿 draft 与上次提交反馈 errors，App 保存 products，卡片决定是否展开编辑。

把鼠标库存写成 3，只改 draft，总库存仍是 52。保存才经回调更新 products，总库存变为 55；取消则保留原值。草稿与业务记录有不同含义。

src/product-state.js 新增一个沿用 C24 写法的更新函数：

```js
export function updateProduct(items, id, changes) {
  return items.map((product) => product.id === id
    ? { ...product, ...changes, id: product.id }
    : product);
}
```

更新产生新数组和新 P002，末尾保留原 id。App 用 `setProducts(pending => updateProduct(pending, id, changes))` 提交，筛选、排序与总价值从 products 重算。

鼠标从 0 件、129.00 元保存为 3 件、129.90 元后，总库存 **55 件**，总价值 **26737.70 元**。新增价值是 3 × 12990 分。

表单关闭或卡片移出筛选时，未保存草稿丢弃；再次打开从已保存商品创建草稿。因此先保存或取消，再切换筛选。Java 对照：草稿像未确认的 DTO，保存才替换列表记录；React 仍用新对象与 setter 更新界面。

## 常见错误与调试

### 名称刚输入就弹回机械键盘

**现象**：打开 case=locked，全选名称并输入「键盘待盘点」，输入框仍回到机械键盘。

**工具**：F12 → Sources → 找到 labs/LockedNameBroken.jsx，在 setName(name) 行号上设置断点，再次编辑。处理函数是：

```jsx
// 有问题的写法：收到新输入后，仍把旧快照写回 state。
import { useState } from "react";

export default function LockedNameBroken() {
  const [name, setName] = useState("机械键盘");
  function handleChange(event) {
    setName(name);
  }
  return <label>商品名称<input value={name} onChange={handleChange} /></label>;
}
```

**证据**：暂停时查看 Scope，name 是机械键盘，event.target.value 是键盘待盘点。输入事件已经带来新文本，state 却没有得到它。

**原因**：value 由 name 控制，处理函数又写回旧 name，React 在处理编辑后恢复了旧显示值。

**修复**：把 setName(name) 改成 setName(event.target.value)。正确组件见 ControlledName.jsx。

**确认**：删掉断点，再输入新名称并清空，都能保留输入结果。阶段 4 目录运行 `npm run test:bug -- labs/forms-bugs.test.jsx`，这项回归也会通过；另一个空库存错误还需下面的修复。

### 库存清空后，竟然保存成 0

**现象**：打开 case=blank，保持库存为空，点「保存库存」，显示「已保存库存 0」。

**工具**：Sources → labs/BlankStockBroken.jsx，在 const value = Number(stock) 那一行设断点，重新提交空库存。

**证据**：stock 是空字符串；在暂停时的 Console 输入 Number(stock)，得到 0。表单使用 noValidate，因此提交会进入这段自定义处理。

**原因**：先转换再只检查数字，已经分不清未填写和明确填写 0。

**修复**：导入 src/product-form.js 的 parseStock，把 Number(stock) 换成 parseStock(stock)，拒绝条件改为 value === null。完整版本见 BlankStockFixed.jsx，也可打开 case=blank-answer 对照。

**确认**：空库存显示「库存无效」，填写 0 显示「已保存库存 0」；-1、1.5 和 100000 都被拒绝。两处错误全部修复后，同一条 bug 回归命令应为 2 条通过；仓库保留错误起点供练习。

## 练习

### 练习 1：FormData 里的值和类型

先预测，再在 examples/c25 运行 node prediction.js，模拟复选框勾选与取消时的字段存在性。

```js title="prediction.js"
const data = new FormData();
data.set("stock", "0");
data.set("featured", "on");
console.log(typeof data.get("stock"), data.get("stock") === 0);
console.log(data.has("featured"), data.get("featured"));
data.delete("featured");
console.log(data.has("featured"), data.get("featured"));
```

<details>
<summary>提示</summary>

读取的库存还是文本。has 判断字段是否存在，get 在字段不存在时返回 null；checkbox 的 on 是提交值。

</details>

<details>
<summary>参考答案</summary>

依次为 string false、true on、false null。字符串 0 与数字 0 不同；取消勾选的真实表单省略 featured。受控 checkbox 则直接读布尔值 checked。

</details>

### 练习 2：一次发现三个非法字段

修好两个实验，再输入纯空格名称、库存 -1、单价 129.999。验收：显示三项错误，聚焦名称，商品与统计不变。先用纯函数判断：

```js title="invalid-draft.js"
import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";

const invalid = { ...toDraft(products[1]), name: "   ", stock: "-1", price: "129.999" };
const result = validateDraft(invalid);
console.log(Object.keys(result.errors).join(",")); // → name,stock,price
console.log(result.value); // → null
console.log(products[1].stock, products[1].priceCents); // → 0 12900
```

<details>
<summary>提示</summary>

收集全部 errors 后再决定返回值；过早结束就只能显示第一项错误。

</details>

<details>
<summary>参考答案</summary>

validateDraft 返回 name、stock、price 三项错误与 value=null。ProductForm 显示 errors、聚焦后返回，onSave 不会调用。

修成无线鼠标、0、129.90 后提交成功，保存 0 件、12990 分。tests/forms.test.jsx 检查拒绝非法保存、错误关联与焦点。

</details>

### 练习 3：只用键盘完成编辑

刷新首页，用键盘给机械键盘名称加「已盘点」，再编辑并取消。验收：标题更新，第二次草稿丢弃，焦点回编辑按钮。

<details>
<summary>提示</summary>

用 Tab 找到第一张卡片的编辑按钮，Enter 展开，名称会自动获得焦点。复选框用空格操作，取消按钮可用 Tab 到达。观察轮廓，确认焦点位置。

</details>

<details>
<summary>参考答案</summary>

编辑名称后按 Enter 保存，焦点移到库存管理标题，成功区域显示已保存 P001。重新用 Tab 找到该商品的编辑按钮，Enter 打开；修改草稿，再到取消编辑并按 Enter，卡片仍显示上一次保存的名称。

取消按钮写 type=button，Enter 才只激活取消。三种焦点位置分别服务于修错、确认结果和继续操作。

</details>

## 项目进度

从 C24 的 examples/inventory/04-react 继续。新增 product-form.js 处理转换与校验，ProductForm.jsx 展示字段与错误，product-state.js 加入 updateProduct，均在 src 下。

src/App.jsx 新增 handleSave 更新商品并提示成功，ProductList 传递 onSave，ProductCard 展开表单并处理关闭，styles.css 补间距、错误文字和焦点轮廓。完整文件在阶段目录。

:::tip[自己尝试 · 本地 React]
1. 刷新首页，确认 6 种、52 件、26348.00 元。打开 P002 编辑，填写纯空格名称、库存 -1、单价 129.999，然后保存。
2. 确认三个字段错误、名称获得焦点，统计不变。改成无线鼠标、3、129.90，勾选热销，在库存输入中按 Enter。
3. 再打开编辑，改名称后取消；搜索鼠标并再次编辑，把名称保存为办公指针，观察当前筛选结果与焦点。

预期：第 2 步保存后为 55 件、26737.70 元，鼠标有热销标签；第 3 步取消后保留已保存值。改名保存后卡片移出鼠标搜索结果，但页面仍提示已保存 P002，焦点在库存管理标题；清空搜索即可看到办公指针。
:::

在阶段 4 目录运行 npm test、npm run build，再运行 `npm run preview -- --host 127.0.0.1` 查看生产预览。表单实验页只在 dev 服务中提供。当前商品仍保存在内存，刷新恢复固定六件商品。

## 小结

- 受控输入由 state 决定当前值；非受控输入由 DOM 保存，可在提交时用 FormData 读取。
- 文本、select 读 value，checkbox 的开关读 checked；库存和价格先保留字符串草稿。
- 校验通过后才生成业务数字。空库存与库存 0 不同，价格按最多两位小数转换为整数分。
- form 的 onSubmit 统一处理提交；原生约束和自定义错误各有明确入口，取消按钮写 type=button。
- label 提供名称，错误文字解释原因，焦点帮助继续操作；保存后列表与统计从同一份商品数据计算。

自测：

1. 为什么只传 value 却不把新文本写进 state，输入就会弹回旧值？
2. 为什么 type=number 和 Number(value) 都不足以证明库存输入有效？
3. noValidate 表单中的 required 属性和业务校验分别承担什么职责？
4. 取消热销时，如何保留扩展坞的新品标签？
5. 保存后商品移出筛选结果，焦点为何移到持续存在的标题？

下一课讨论状态提升、保留与重置，安排多个组件之间的状态归属和切换商品时的草稿行为。

## 延伸阅读

- [React：input 的受控、非受控与表单读取](https://react.dev/reference/react-dom/components/input)
- [React：select](https://react.dev/reference/react-dom/components/select)
- [React：用 state 响应输入](https://react.dev/learn/reacting-to-input-with-state)
- [MDN：约束校验](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Constraint_validation)
- [MDN：FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/FormData)
- [W3C WAI：表单反馈与错误通知](https://www.w3.org/WAI/tutorials/forms/notifications/)
