---
title: C41 UI5 Model、绑定与业务控件
description: 用 JSONModel、Table 和编辑 Dialog 完成筛选、校验与汇总，理解绑定上下文、草稿隔离和多语言资源。
sidebar:
  order: 41
---

> **第 4 周 · 第 21 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C25、C39、C40 · 运行：Node 24、本地 UI5 · 示例已运行验证

## 这一课解决什么问题

C40 已经把六件商品放进列表，现在要让用户编辑库存。你把输入框直接绑定到商品，输入 3 后点「取消」，表格却已经从 0 变成了 3。再加一个筛选，编辑当前第一行，改到的竟然是另一件商品。

这两个问题都与绑定有关：一个是写入时机，一个是数据路径。控件帮你同步数据，但保存、取消和业务校验仍需要你设计。

学完你能：

- 区分模型名称、绝对路径、相对路径和行的绑定上下文。
- 用属性、列表与表达式绑定显示商品，用 formatter 把分显示成元。
- 筛选 Table 并汇总当前结果，正确处理零库存与空结果。
- 用 Fragment 创建 Dialog，隔离表单草稿与商品。
- 校验后写回 JSONModel，用 i18n 资源切换中英文界面。

完整工程见 [阶段 6](https://github.com/socoo123/js_web/tree/main/examples/inventory/06-openui5)，例子见 [examples/c41](https://github.com/socoo123/js_web/tree/main/examples/c41)。

## Java 程序员先看这里

| Java 经验 | OpenUI5 写法 | 差异 |
| --- | --- | --- |
| DTO 字段与 getter/setter | JSONModel 的 getProperty/setProperty | 模型还负责通知绑定，让相关控件更新 |
| JavaFX 属性绑定 | XML 中的 value、text、items 绑定 | 属性连值；列表为数组元素创建控件 |
| 编辑 DTO 后提交 | 独立 draft 模型，保存时合并 | 双向绑定本身没有保存、取消或事务语义 |
| ResourceBundle 与 properties | ResourceModel 与 i18n 绑定 | 界面文案也通过一个命名模型读取 |

## 1. JSONModel：既存数据，也通知绑定

JSONModel 把普通对象变成可绑定的数据。本工程的根对象是 `{ products: [...] }`，`inventory` 是模型名称，`/products/1/stock` 才是数据路径。

**先猜一猜：** 在工程页面的 Console 执行下面代码，默认绑定模式是什么？字段改成 3 后，再读原路径和拼错大小写的路径分别得到什么？

```js
sap.ui.require(["sap/ui/model/json/JSONModel"], (JSONModel) => {
  const model = new JSONModel({ product: { stock: 0 } });
  console.log(model.getDefaultBindingMode()); // → TwoWay
  model.setProperty("/product/stock", 3);
  console.log(model.getProperty("/product/stock")); // → 3
  console.log(model.getProperty("/product/Stock")); // → undefined
  model.destroy();
});
```

[JSONModel](https://ui5.github.io/docs/04_Essentials/json-model-96804e3.html)默认采用双向绑定：模型变化传到控件，可编辑属性变化也能回到模型。本课为 Input 设置 `valueLiveUpdate="true"`，输入时持续回写草稿。

这与 React 的受控输入不同：UI5 能通过绑定把值写回模型，通常无需为每个输入再写一遍 setState。

### 模型如何到达控件

C40 在 Component 上创建 inventory、ui 模型。它们向根 View 和内部控件传播，同名模型可以在更近的控件上覆盖。本课把 draft 模型放在 View 上，编辑弹窗沿 View 的依赖关系获取它。

| 模型 | 放在哪里 | 内容 |
| --- | --- | --- |
| inventory | Component | 已保存的六件商品 |
| ui | Component | 搜索文本、提示、当前结果汇总 |
| draft | View | 当前表单文本、错误状态 |
| i18n | Component，由 manifest 声明 | 界面文案资源 |

Controller 用 getModel("inventory") 取得商品模型。字段更新用 setProperty，它会通知绑定；直接改原对象不会自动通知。

## 2. 属性、列表、表达式：三种绑定各做一件事

把 List 换成 Table：items 使用 ColumnListItem 行模板，每个 cell 对应一列。核心片段如下，完整列定义在工程中：

```xml
<ColumnListItem>
  <cells>
    <ObjectIdentifier title="{inventory>name}" text="{inventory>id}" />
    <Text text="{inventory>category}" />
    <ObjectNumber number="{inventory>stock}"
      state="{= %{inventory>stock} === 0 ? 'Error' : 'None' }" />
    <ObjectNumber number="{path: 'inventory>priceCents', formatter: '.formatter.money'}" />
    <Button text="{i18n>edit}" press=".onEdit" />
  </cells>
</ColumnListItem>
```

运行后，P002 显示「无线鼠标、外设、0、129.00、编辑」，库存带错误状态，数字 0 仍清楚可见。

三种绑定：

| 类型 | 本工程写法 | 作用 |
| --- | --- | --- |
| 列表绑定 | Table 的 `items="{inventory>/products}"` | 为 products 数组创建行控件 |
| 属性绑定 | `number="{inventory>stock}"` | 把当前商品的 stock 交给 number 属性 |
| 表达式绑定 | `{= %{inventory>stock} === 0 ? 'Error' : 'None' }` | 由库存计算一个控件状态 |

列表绑定为每一行建立 **BindingContext（绑定上下文）**。P002 的上下文是 `/products/1`，所以相对路径 `inventory>stock` 读到 0。路径前没有 `/`，就从上下文继续找；写成 `inventory>/stock` 则去根对象找 stock，得到空值。

[表达式绑定](https://ui5.github.io/docs/04_Essentials/expression-binding-daf6852.html)的 `{= ... }` 会在依赖值变化时重新计算。这里的 `%{...}` 取原始模型值，避免先按目标属性类型转换；比较的是数字 0。表达式负责这类短小的展示判断，库存修改和校验放在 JS 函数里，便于阅读和测试。

### formatter 负责输出，不负责输入解析

金额存整数分，显示时变成元。Controller 的 `formatter` 属性引用 `model/formatter.js`，上面 `.formatter.money` 就从这个属性找到函数。函数的核心是：

```js
money(cents) {
  if (!Number.isSafeInteger(cents)) return "";
  return `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
},
```

12900 显示为 `"129.00"`，0 显示为 `"0.00"`，模型仍保留整数分。

[带 formatter 的属性绑定采用单向模式](https://ui5.github.io/docs/04_Essentials/data-binding-68b9644.html)，因为框架不知道如何把展示字符串反向变回原数据。编辑价格用 `draft>/price` 文本，保存时解析成分。UI5 DataType 也能提供格式化、解析与约束。

## 3. 筛选绑定，汇总当前可见结果

筛选只决定哪些行出现，原始 products 数组仍保留六件商品。搜索框的 `search` 事件在按 Enter 或点搜索按钮时触发；事件参数 `query` 是本次搜索词。

Controller 的处理函数如下：

```js
onFilter(event) {
  const query = event.getParameter("query").trim();
  const filters = query ? [new Filter({
    filters: [new Filter("name", FilterOperator.Contains, query),
      new Filter("id", FilterOperator.Contains, query)],
    and: false,
  })] : [];
  this.byId("products").getBinding("items").filter(filters, FilterType.Application);
},
```

搜索 `P004` 只显示 USB-C 扩展坞；搜索「鼠标」显示 P002；清空后再搜索，恢复六行。`and: false` 把两个条件组成“名称包含，或者编号包含”。传空数组会移除这一类筛选条件。

`FilterType.Application` 标记应用设置的筛选。这里用[官方筛选教程](https://ui5.github.io/docs/03_Get-Started/step-23-filtering-5295470.html)的 binding.filter 方式。JSONModel 的数据已在浏览器，筛选在本地执行。

### 先定统计口径，再写统计

页面明确写「当前总库存」「当前库存价值」。全部显示时为 6 件商品、52 件库存、26348.00 元；只显示 P004 时为 1 件商品、3 件库存、897.00 元。

表格的 `updateFinished` 在 items 更新完成后触发。处理函数从每个行控件取得绑定对象，再交给普通业务函数：

```js
onUpdateFinished() {
  const products = this.byId("products").getItems()
    .map((item) => item.getBindingContext("inventory").getObject());
  const summary = rules.summarize(products);
  const ui = this.getView().getModel("ui");
  Object.entries(summary).forEach(([key, value]) => ui.setProperty(`/${key}`, value));
},
```

`rules.summarize` 用 reduce 累计 count、stock 与 `stock * priceCents`，空数组从三个 0 开始。搜索不存在的名称后，汇总因此显示 0、0、0.00，而不是保留上一次结果。

表格一次展示这六件商品，没有开启 growing 分批加载，所以当前行就是本课完整的匹配集合。以后遇到分页或服务端数据时，要重新确定统计范围，不能把当前已加载行数当成服务端总数。

Controller 接控件事件、取得对象；业务函数只接普通数组，写法与 Java Stream 汇总类似。

## 4. Dialog 与草稿：输入时改草稿，保存时改商品

JSONModel 默认双向绑定。若输入框直接写 `value="{inventory>stock}"` 并绑定到原商品，输入过程就能改商品，关闭弹窗也不会自动撤销。我们建立一个独立 draft 模型，把“用户正在输入”和“业务已经接受”分开。

点击行内编辑按钮时，按钮继承该行的 inventory 上下文：

```js
async onEdit(event) {
  const context = event.getSource().getBindingContext("inventory");
  this._editPath = context.getPath();
  this.getView().getModel("draft")?.destroy();
  this.getView().setModel(new JSONModel(rules.toDraft(context.getObject())), "draft");
  this._dialogPromise ??= this.loadFragment({ name: "course.inventory.view.EditDialog" });
  const dialog = await this._dialogPromise;
  dialog.open();
},
```

筛选到 P004 后，当前只剩一行，但 `_editPath` 仍是 `/products/3`。保存使用这个路径，而不是用可见行号 0 重新拼路径。

`toDraft` 创建新对象，把 stock 和 price 变成输入文本，加入空的 errors 与 hasErrors。id 只展示，tags 留在原商品中；草稿只含标量字段，与原商品隔离。

### Fragment 声明结构，Controller 提供事件

[Fragment](https://ui5.github.io/docs/03_Get-Started/step-16-dialogs-and-fragments-4da7298.html)是一段可复用控件树，没有自己的 Controller。我们在 `view/EditDialog.fragment.xml` 声明 Dialog，文件中库存字段如下：

```xml
<Label text="{i18n>stock}" labelFor="editStock" required="true" />
<Input id="editStock" value="{draft>/stock}" valueLiveUpdate="true"
  valueState="{= %{draft>/errors/stock} ? 'Error' : 'None' }" valueStateText="{i18n>invalidStock}" />
```

输入 3 后，`draft>/stock` 成为字符串 `"3"`，表格里的库存仍是原来的数字。Label 通过 labelFor 连接输入。

Controller 的 `loadFragment` 返回 Promise，默认把内容加入 View 的 dependents，传入当前 Controller，并给内部 ID 加上 View 前缀。因此弹窗可继承 View 的模型，事件方法由当前 Controller 处理，输入可用 byId 查找；View 销毁时，依赖控件也会销毁。

缓存 Promise 防止重复创建；弹窗复用控件树，每次打开换新草稿。点取消或按 Escape 都只关闭；下次打开再从已保存商品建立草稿，未保存的输入自然被丢弃。Java 的编辑 DTO 也由应用决定何时提交。

### 校验发生在写回之前

`model/productRules.js` 的 `parseDraft` 统一执行字段规则：

| 输入 | 接受条件 | 保存值 |
| --- | --- | --- |
| name | 去首尾空格后 1–40 个字符 | 去空格后的字符串 |
| category | 外设、显示器、配件、音频之一 | 原有分类键 |
| stock | 非空十进制整数文本，范围 0–99999 | Number |
| price | 非负金额文本，最多两位小数 | 安全整数分 |

价格按整数部分和小数部分拼出分值，比如 `"1.23"` 得到 123；不会用 parseFloat 截断 `"1.234"`。空库存也先拒绝，不让 `Number("")` 把它变成 0。`validation.js` 已给出这些输入的可运行对照。

保存逻辑的核心是先校验，再合并：

```js
onSave() {
  const draft = this.getView().getModel("draft");
  const result = rules.parseDraft(draft.getData());
  draft.setProperty("/errors", result.errors);
  draft.setProperty("/hasErrors", result.hasErrors);
  if (result.hasErrors) {
    const field = Object.keys(result.errors).find((key) => result.errors[key]);
    const ids = { name: "editName", category: "editCategory", stock: "editStock", price: "editPrice" };
    this.byId(ids[field]).focus();
    return;
  }
  const inventory = this.getView().getModel("inventory");
  const current = inventory.getProperty(this._editPath);
  inventory.setProperty(this._editPath, { ...current, ...result.value });
  this.getView().getModel("ui").setProperty("/message", this._bundle.getText("saved"));
  this.byId("editDialog").close();
},
```

错误时，Dialog 留在原处，字段标红，焦点移到第一个错误输入，inventory 保持原样。通过时，新字段覆盖原商品的可编辑字段，id 与 tags 保留。模型通知列表更新，汇总随后重算。

如果在名称筛选中把商品改成不匹配的新名称，它会离开当前结果，汇总也随之减少。清空搜索就能找到改名后的商品。

:::tip[自己尝试 · 本地 UI5]
1. 在仓库根进入 `examples/inventory/06-openui5`，执行 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:8040/index.html`。
2. 搜索 P004，打开编辑，把库存改成 8，再取消。重新打开，库存应仍为 3。
3. 清空库存、价格写 1.234，保存；再改成库存 0、价格 299.01，保存。
4. 清空搜索并按 Enter，最后刷新。

预期：非法输入被拦住；有效保存只改变 P004，标签仍保留。清空搜索后总库存为 49；刷新恢复初始总库存 52。
:::

## 5. i18n：界面文案也来自模型

把文案放进 properties 文件，XML 只使用稳定的键。manifest 的 `sap.ui5.models` 新增：

```json
"i18n": {
  "type": "sap.ui.model.resource.ResourceModel",
  "settings": {
    "bundleName": "course.inventory.i18n.i18n",
    "supportedLocales": ["", "en"],
    "fallbackLocale": "",
    "async": true
  }
}
```

`bundleName` 解析到 `i18n/i18n.properties`。本工程基础文件是中文，`i18n_en.properties` 是英文；supportedLocales 中的空字符串表示基础文件，en 表示英文文件，fallbackLocale 指定回退到基础文件。

两个文件使用同一组键，例如：

```properties
# i18n.properties
save=保存
# i18n_en.properties
save=Save
```

运行英文界面后，`text="{i18n>save}"` 显示 Save；中文界面显示保存。ResourceModel 是[资源包的绑定入口](https://ui5.github.io/docs/03_Get-Started/step-6-resource-models-9790d9a.html)。

带参数的提示通过 `await model.getResourceBundle()` 取得资源包，再调用 `bundle.getText("inspected", [id, name, stock])`。资源中的 `{0}`、`{1}`、`{2}` 会被替换成对应值。商品名与分类键保留原值；分类选项的显示文案可以翻译。

语言选择重新加载应用：

```js
onLanguageChange(event) {
  const url = new URL(window.location.href);
  url.searchParams.set("sap-ui-language", event.getSource().getSelectedKey());
  window.location.assign(url.href);
},
```

选择 English 后，网址带上 `sap-ui-language=en`。UI5 在启动时读取[语言配置参数](https://ui5.github.io/docs/04_Essentials/configuration-options-and-url-parameters-91f2d03.html)，框架控件和应用资源一起使用新语言。URL 从当前地址构造，因此保留现有子目录路径。

界面明确提示切换会恢复初始商品。实际业务若要保留未保存编辑，需要另行设计恢复流程。

## 常见错误与调试

### 筛选到 P004，却改了 P001

**现象**：搜索 P004，编辑可见第一行，保存后 P001 库存改变，P004 仍为 3。

**工具**：打开 Sources → `controller/Inventory.controller.js`，在 onEdit 读取上下文后设置断点。回到页面搜索 P004，再点编辑。

**证据**：暂停时在 Console 输入 `context.getPath()`，得到 `/products/3`；`context.getProperty("id")` 是 P004。可见行索引虽为 0，模型索引却为 3。

**原因**：用可见行号拼 `/products/0`，把展示位置误当成数据位置。

**修复**：记录事件源的 `getBindingContext("inventory").getPath()`，保存时对这个路径调用 setProperty。本课参考实现已采用这种方式。

**确认**：重新执行搜索、编辑、保存，只有 P004 改变。`business.test.js` 的筛选后保存回归同时断言 P004 更新、P001 仍为 12。

### 弹窗有编号，库存输入却是空的

**现象**：打开 P002，编号正确，库存输入框空白；表格中库存仍显示 0。

**工具**：在 Sources 的 onEdit 中，于 `dialog.open()` 设置断点。暂停后检查 `this.getView().getModel("draft").getProperty("/stock")`，再检查 `this.byId("editStock").getBindingInfo("value")`。

**证据**：模型中值是字符串 `"0"`，绑定信息若显示路径 `/Stock`，就与实际字段不符。

**原因**：字段名大小写拼错。JSONModel 找不到路径时返回 undefined，输入控件因此显示为空。

**修复**：把 Fragment 中的 `draft>/Stock` 改为 `draft>/stock`。如果整个 draft 模型都取不到，再检查模型名与 loadFragment 的 View 依赖关系。

**确认**：重新加载页面，P002 弹窗显示 0；输入 3 后取消，重新打开仍为 0。浏览器回归覆盖初始值、草稿值和重开。

## 练习

### 练习 1：预测草稿和汇总

**先猜一猜：** 改草稿时原库存会变吗？保存到新数组后总库存与总价值是多少？在 `examples/c41` 运行：

```js title="draft-summary.js"
import { products } from "../shared/products.js";
import { rules } from "./load-rules.js";
const draft = rules.toDraft(products[1]);
draft.stock = "3";
console.log(products[1].stock, draft.stock); // → 0 3
const result = rules.parseDraft(draft);
const saved = products.map((product) => product.id === draft.id
  ? { ...product, ...result.value } : product);
console.log(rules.summarize(products).stock); // → 52
console.log(rules.summarize(saved).stock); // → 55
console.log(rules.summarize(saved).valueCents); // → 2673500
```

验收：除输出外，说清原商品库存与草稿库存的类型。

<details>
<summary>提示</summary>

P002 原库存是数字 0；草稿里的输入是字符串。新数组把校验结果合并到 P002，其他商品沿用原值。

</details>

<details>
<summary>参考答案</summary>

依次输出 `0 3`、52、55、2673500。第一行原商品是 number，草稿是 string；parseDraft 接受文本 3 后，保存值变回 number。增加的库存价值为 3 × 12900 = 38700 分，所以原价值 2634800 分变成 2673500 分。

</details>

### 练习 2：修复“取消后仍被修改”

把 onEdit 中创建新草稿的那一行改成 `this.getView().setModel(new JSONModel(context.getObject()), "draft")`，只输入新名称后取消。观察表格与重新打开后的名称，再恢复正确实现。

验收：解释为什么直接传入原对象会共享修改；修好后，输入新名称取消，原商品名称仍保留。

<details>
<summary>提示</summary>

JSONModel 接收普通对象时，并不会替你做一份编辑事务。重点比较它拿到的是原商品对象，还是 toDraft 创建的新对象。

</details>

<details>
<summary>参考答案</summary>

新模型与 inventory 中的该商品引用同一对象。Input 双向绑定把 name 写进这个共享对象，关闭 Dialog 也不会恢复字段；即使另一模型的控件尚未收到更新通知，数据已经被污染。

恢复 `new JSONModel(rules.toDraft(context.getObject()))`。toDraft 生成独立的标量字段，直到 onSave 校验通过才合并到 inventory。

</details>

### 练习 3：检查英文界面与空结果

选择 English，搜索不存在的编号，再清空搜索，打开 P002 编辑，输入负库存并保存，最后切回中文。

验收：空结果显示英文提示，三项汇总为 0；编辑弹窗按钮和校验说明使用英文；负库存被拦住；切回中文后恢复六件初始商品。

<details>
<summary>提示</summary>

语言选择重新加载应用。检查网址参数、i18n_en.properties 与基础文件是否包含同一组键；搜索需要按 Enter。

</details>

<details>
<summary>参考答案</summary>

英文空结果为 No matching products.，当前商品数、总库存和总价值都为零。恢复列表后，弹窗按钮为 Save、Cancel；负库存触发字段错误与 Correct the highlighted fields before saving.。切回中文的 URL 参数是 `sap-ui-language=zh-CN`，重新加载后总库存为 52。

</details>

## 项目进度

从阶段 6 的 C40 工程继续，保留启动入口、固定商品和编号查询。本课改动：

- Component 的 ui 模型增加搜索、语言选择与汇总字段；manifest 增加异步 i18n 模型。
- Inventory View 把 List 换成 Table，增加搜索、汇总和编辑入口。
- Controller 增加筛选、行上下文、Fragment 加载、校验保存和语言选择。
- 新增 `EditDialog.fragment.xml`、`productRules.js`、`formatter.js` 与两份 i18n 文件。

在阶段 6 目录执行：

```sh
npm run build
cd dist
python3 -m http.server 8140 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8140/index.html`，重复筛选、编辑和语言切换。预期与开发服务一致，全部显示时初始总库存为 52、总价值为 26348.00 元。P002 补到 3 后为 55、26735.00 元，刷新恢复初始值。

在仓库根运行 `npm run examples -- c41` 核对三个 Node 例子的输出。浏览器回归命令见 examples/c41/README。

## 小结

- JSONModel 的 setProperty 更新数据并通知绑定；模型名、路径与上下文一起决定读取位置。
- Table 的 items 创建行，属性绑定显示值，表达式与 formatter 计算展示结果。
- 筛选保留原数组；本课按完整匹配结果汇总，空结果清零。
- Dialog 绑定独立草稿；取消关闭，保存先校验，再按原商品路径写回。
- ResourceModel 提供文案；本例通过语言参数重启，内存修改随重载恢复。

自测：

1. 为什么库存为 0 时，输入框应该显示 0，而空输入仍然要拒绝？
2. 搜索 P004 后，第一行的绑定路径为什么是 /products/3？
3. formatter 把 12900 显示为 129.00，模型里的值改变了吗？
4. 关闭 Dialog 为什么无法自动撤销直接绑定到原商品的输入？
5. 英文界面中的商品名仍是中文，哪部分来自资源包，哪部分来自业务数据？

下一课把列表连接到详情路由，并从 JSONModel 走向 OData 的实体、元数据和浏览器 mock。

## 延伸阅读

- [UI5：JSONModel 与客户端数据](https://ui5.github.io/docs/04_Essentials/json-model-96804e3.html)
- [UI5：数据绑定与模式](https://ui5.github.io/docs/04_Essentials/data-binding-68b9644.html)
- [UI5：表达式绑定](https://ui5.github.io/docs/04_Essentials/expression-binding-daf6852.html)
- [UI5：列表筛选](https://ui5.github.io/docs/03_Get-Started/step-23-filtering-5295470.html)
- [UI5：Dialog 与 Fragment](https://ui5.github.io/docs/03_Get-Started/step-16-dialogs-and-fragments-4da7298.html)
- [UI5：ResourceModel 与语言资源](https://ui5.github.io/docs/03_Get-Started/step-6-resource-models-9790d9a.html)
