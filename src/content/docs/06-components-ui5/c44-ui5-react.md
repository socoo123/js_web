---
title: C44 UI5 Web Components for React
description: 用 React 包装库重写库存表单与列表，读对事件、校验草稿、同步汇总，并交付主题和语言资源。
sidebar:
  order: 44
---

> **第 4 周 · 第 22 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C25、C26、C38、C41、C43 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

C43 已经能在普通网页里使用 UI5 输入框和按钮。现在要把它们放进 React 库存应用：列表选商品，右侧编辑，保存后列表与汇总一起变化。

你已经会写 React 表单，也用过 Ant Design。换成 UI5 后，最容易出错的是沿用另一个库的事件参数、把布局组件当成提交容器，以及以为包装库会自动管理业务数据。

这次继续使用六件商品。P002 无线鼠标库存为 0，保存为 3 后，总库存从 52 变成 55，价值从 26348.00 元变成 26735.00 元。界面换了，业务规则和结果保持一致。

学完你能：

- 用 React 组件、props、回调和 slots 组织 UI5 界面
- 分别读取 Input、Select、CheckBox 与 List 的事件数据
- 用独立草稿、校验和不可变更新完成编辑，保留库存 0
- 分清基础包装控件、布局组件与高层组合组件
- 比较普通组件库、经典 UI5 和 UI5 React 的数据流，检查主题资源

完整代码在 [阶段 7](https://github.com/socoo123/js_web/tree/main/examples/inventory/07-ui5-react)，短例子在 [examples/c44](https://github.com/socoo123/js_web/tree/main/examples/c44)。进入已带锁文件的参考工程：

```sh
cd examples/inventory/07-ui5-react
npm ci
npm run dev
```

打开 `http://127.0.0.1:8044/`，预期看到商品列表、编辑表单与“总库存 52”。列表和表单并排显示，窄屏时上下排列。

## Java 程序员先看这里

| Java 经验 | 本课对应 | 差异 |
| --- | --- | --- |
| 用适配器统一某个库的调用入口 | React 包装组件 | JSX 接口更顺手，底层仍有真实自定义元素 |
| 监听器参数带事件源与附加数据 | target、detail | 不同控件的有效字段不同，要按事件契约读取 |
| 编辑 DTO，校验后更新业务对象 | draft、validateDraft、setProducts | 草稿是文本，保存后业务字段才是数字 |
| 布局容器与提交动作 | UI5 Form 与原生 form | 前者排版，后者承接浏览器提交事件 |
| 字段直接赋值后刷新控件 | React state 更新 | 用新数组触发渲染，列表和汇总读取同一份数据 |

## 1. 包装库提供 React 接口，业务仍由你管理

[UI5 Web Components for React](https://github.com/UI5/webcomponents-react)提供两类组件：一类包装 UI5 自定义元素，例如 Input、Button、List；另一类用 React 组合布局或较复杂的交互，例如 FlexBox、AnalyticalTable。

C43 的 `<ui5-input>` 到这里写成 `<Input>`。导入包装组件时，它会导入对应的元素注册模块。你可以传 value、disabled、ref 和事件回调，用熟悉的 React 组件树组织页面。

参考工程的 src/main.jsx 入口是：

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import "@ui5/webcomponents-react/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/save.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { App } from "./App.jsx";
import "./styles.css";

await setLanguage("zh-CN");
createRoot(document.getElementById("root")).render(
  <StrictMode><ThemeProvider><App /></ThemeProvider></StrictMode>,
);
```

预期：组件用中文内置文案启动，保存按钮显示图标。ThemeProvider 为包装库的样式与语言等基础设施接好入口；Assets.js 注册资源加载；单个图标还要显式导入。

本课使用 UI5 2 与 React 19。官方推荐一起安装包装库、webcomponents 和 fiori；直接导入的 base、icons 也列为依赖。参考工程的清单与锁文件已配好，按前面的 npm ci 安装即可。

**React 19 本身已支持 Custom Elements。** C43 的直接标签写法仍然有效；包装库增加的是 React 风格接口、类型提示和组合组件。两种入口可以用下表对照：

| 事情 | 直接元素 | React 包装组件 |
| --- | --- | --- |
| 标签 | ui5-input | Input |
| 可访问名称 | accessible-name | accessibleName |
| 输入监听 | JSX 的 onui5-input | onInput |
| List 点击监听 | JSX 的 onui5-item-click | onItemClick |
| Card 头部内容 | 子元素上写 slot="header" | 传 header JSX |

在 Elements 中，包装后的 Input 仍可看到 ui5-input 与 Shadow DOM。它像 Java 适配器：改变调用入口，底层控件的值类型、事件内容和资源需求仍然存在。

## 2. 事件名变顺手了，取值仍按控件契约

### 输入、选择和勾选分别读取

输入框的 value 保持字符串，CheckBox 的 checked 是布尔值，Select 的 change 事件提供选中的 Option。把它们统一写成一个“event.target.value 万能函数”，反而会丢信息。

ProductEditor.jsx 中三个回调的关键部分是：

```jsx
<Input value={draft.stock}
  onInput={(event) => change("stock", event.target.value)} />
<Select value={draft.category}
  onChange={(event) => change("category", event.detail.selectedOption.value)}>
  {categories.map((category) => <Option key={category} value={category}>{category}</Option>)}
</Select>
<CheckBox text="热销" checked={draft.featured}
  onChange={(event) => change("featured", event.target.checked)} />
```

输入 3，草稿 stock 为 `"3"`；选择音频，category 为 `"音频"`；取消热销，featured 为 false。change 用函数式更新合并字段，然后 React 把新的草稿值传回控件。

onInput 随输入更新，适合受控文本；Input 的 onChange 在完成输入时触发，例如失焦。取值与事件时机按 UI5 API 定义。

### List 的 target 是谁

List 的 item-click 把被点击的项放在 detail.item。监听器挂在列表上，选择商品要读列表项携带的业务 id。

**先猜一猜：** 事件源是列表，还是 detail 里的商品项？在 examples/c44 运行 `node event-contract.js`：

```js title="event-contract.js"
const list = new EventTarget();
const item = { dataset: { productId: "P002" } };
list.addEventListener("item-click", (event) => {
  console.log(event.target === list);
  console.log(event.detail.item.dataset.productId);
});
list.dispatchEvent(new CustomEvent("item-click", { detail: { item } }));
```

结果为 true、P002。这段代码只模拟“事件源与附加数据是两部分”，页面中的实际 List 事件也按公开契约提供 detail.item。

target 是事件源，currentTarget 是当前监听元素，商品项则在 detail.item。[List API](https://ui5.github.io/webcomponents/components/List/)明确列出 item-click 的 item 参数。包装库把监听入口改成 onItemClick，payload 的含义仍需照着读。

## 3. Form 排版，草稿和校验决定能否保存

### 保留原生提交边界

UI5 的 [Form](https://ui5.github.io/webcomponents/components/Form/)把标签与字段按空间排好，FormItem 表示一组标签和内容。它是布局组件。浏览器提交由外层小写 form 接收：

```jsx
<form onSubmit={submit} noValidate aria-label={`编辑 ${product.id}`}>
  <Form>
    <FormItem labelContent={<Label for="edit-category">分类</Label>}>
      <Select id="edit-category" accessibleName="分类" value={draft.category}
        onChange={(event) => change("category", event.detail.selectedOption.value)}>
        {categories.map((category) => <Option key={category} value={category}>{category}</Option>)}
      </Select>
    </FormItem>
  </Form>
  <Button type="Submit" design="Emphasized" icon="save">保存商品</Button>
</form>
```

预期：分类控件有名称；点击保存或聚焦保存按钮后按 Enter，进入 submit。labelContent 是命名 slot 的 JSX 入口，Label 的 for 对应控件 id。

noValidate 让这份练习统一展示业务校验结果。submit 调用 preventDefault，校验成功后更新 state。Form 不接管草稿，也不会因为字段被标成 required 就替应用完成字段转换和业务校验。

对照 Java，布局管理器决定控件在哪里，校验器决定输入是否有效，两者分别负责。

### 文本入口继续复用 C03 的规则

ProductEditor 用 toDraft(product) 初始化文本草稿，保存时调用 validateDraft。实现直接复用阶段 4 的 product-form.js，因此不同 UI 版本执行相同规则：名称去首尾空白后 1–40 个字符，分类四选一，库存 0–99999 的整数，价格非负且最多两位小数。

在 examples/c44 运行 `node validation.js`：

```js title="validation.js"
import { products } from "../shared/products.js";
import { toDraft, saveDraft } from "../inventory/07-ui5-react/src/editor-state.js";

const dock = products.find((product) => product.id === "P004");
const draft = toDraft(dock);
console.log(saveDraft(products, dock.id, { ...draft, stock: "" }).errors.stock);
console.log(saveDraft(products, dock.id, { ...draft, stock: "0" }).value.stock);
console.log(saveDraft(products, dock.id, { ...draft, price: "29.90" }).value.priceCents);
console.log(saveDraft(products, dock.id, { ...draft, featured: false }).value.tags.join("、"));
```

依次打印“请输入 0–99999 的整数库存。”、0、2990、新品。空文本与库存 0 分开处理；元转分在入口完成；取消“热销”只删除该标签，P004 原有的“新品”仍保留。

输入过程保留字符串，能表达空白和尚未输完的内容。保存后才把有效值放进业务数组。价格按十进制文本拆成元与小数部分拼出整数分，避免把任意小数乘 100 当作通用金额转换。

校验失败后，Input 的 valueState 设为 Negative，valueStateMessage 接收说明内容；表单下方保留可见错误并用 accessibleDescriptionRef 关联。通过 ref 聚焦第一个错误字段。颜色、文字和焦点共同告诉用户怎样继续。

:::tip[自己尝试 · 本地 React]
1. 在已启动的页面选择 P002，输入库存 3 并保存。
2. 把库存改成空白、-1、3.8，再把价格改成 1.234，分别尝试保存。
3. 最后输入库存 0、价格 0，聚焦保存按钮，按 Enter。

预期：第一次总库存为 55、价值为 26735.00 元；非法输入显示原因并聚焦错误字段，列表不变；最后能保存合法的两个 0。刷新恢复原始数据。
:::

## 4. 列表、编辑区与汇总共用一份业务 state

App 拥有 products、selectedId 与 query；ProductList 接收筛选后的数组和选择回调，ProductEditor 拥有尚未提交的 draft。汇总从 products 直接计算。

ProductList.jsx 的关键部分是：

```jsx
function handleItemClick(event) {
  onSelect(event.detail.item.dataset.productId);
}
return (
  <List accessibleName="商品列表" noDataText="没有匹配的商品" onItemClick={handleItemClick}>
    {products.map((product) => (
      <ListItemStandard key={product.id} data-product-id={product.id} type="Active"
        description={`${product.id} · ${product.category} · 库存 ${product.stock} 件`}
        additionalText={product.id === selectedId ? "编辑中" : `${(product.priceCents / 100).toFixed(2)} 元`}>
        {product.name}
      </ListItemStandard>
    ))}
  </List>
);
```

初始显示六项；点击无线鼠标，右侧出现 P002 的草稿。key 给 React 识别行的身份，data-product-id 给 DOM 事件查业务 id，两个属性用途不同。key 不会自动成为可读取的 DOM attribute。

App 用 `<ProductEditor key={selectedId} product={selected} onSave={save} />`。选择不同商品时，key 改变，草稿重新初始化；同一商品保存后 key 不变，当前草稿继续保留。这里把“切换就丢弃未保存内容”作为明确规则，并在表单旁提示。

saveDraft 校验通过后创建新数组，App 执行 setProducts(result.products)。列表与汇总在同次 React 更新后读取新数据，编辑期间则继续展示已保存的数据。

**先猜一猜：** 保存 P002 后，旧数组里的库存是否改变？在 examples/c44 运行 `node prediction.js`：

```js title="prediction.js"
import { products } from "../shared/products.js";
import { toDraft, saveDraft, summarize } from "../inventory/07-ui5-react/src/editor-state.js";

const mouse = products.find((product) => product.id === "P002");
const draft = { ...toDraft(mouse), stock: "3" };
const result = saveDraft(products, mouse.id, draft);
console.log(typeof draft.stock, typeof result.value.stock);
console.log(mouse.stock, result.products.find((product) => product.id === "P002").stock);
console.log(result.products === products, result.products[0] === products[0]);
console.log(summarize(result.products));
```

依次输出 `string number`、`0 3`、`false true`、`总库存 55 · 库存价值 26735.00 元`。更新只替换 P002，未变化的 P001 继续共用原对象；旧 P002 保持 0。Java 集合中习惯的原地字段赋值，在 React 这里要换成创建新引用。

比较同一保存动作的数据流：

| 方案 | 编辑输入由谁保存 | 保存后怎样更新显示 |
| --- | --- | --- |
| Ant Design 版 | Form 实例管理字段 | 校验后更新 React products，再传给 Table |
| 经典 OpenUI5 版 | 独立 JSONModel 草稿 | 校验后 setProperty，模型通知绑定控件 |
| UI5 React 版 | ProductEditor 的 draft state | 校验后 setProducts，新 props 更新列表和汇总 |

普通组件库的 Form API、经典 UI5 的绑定路径、React 的 state 各有自己的契约。C41 的 `inventory>/products` 路径写进 React Input.value，只会变成普通文本；这里传的是 draft.stock 的实际值。

## 5. 组合布局与资源仍要一起交付

### 从基础控件走到页面结构

Card 的 header prop 可以接收 CardHeader，包装库会把内容放到正确 slot；FlexBox 是 React 布局组件，生成页面布局所需的元素和样式。App 中的组合如下：

```jsx
<FlexBox direction="Row" wrap="Wrap" alignItems="Center" className="toolbar">
  <Input accessibleName="搜索商品" placeholder="商品名或编号" value={query}
    showClearIcon onInput={(event) => setQuery(event.target.value)} />
  <p id="summary">{products.length} 件商品 · {summarize(products)}</p>
</FlexBox>
<Card header={<CardHeader titleText="商品列表" subtitleText={`匹配 ${visible.length} 件；选择商品进入编辑`} />}>
  <ProductList products={visible} selectedId={selectedId} onSelect={setSelectedId} />
</Card>
```

预期：工具栏在空间不足时换行，卡片头显示匹配数量。页面 CSS Grid 决定列表和编辑区的双列或单列，Form 决定字段排布，各自处理自己的区域。

高层组件用于减少重复组合。例如 AnalyticalTable 适合复杂表格列、排序和交互配置；它还带有 React 表格逻辑，不能当成原生 ui5-table 的简单别名。使用前先读它自己的回调与数据契约。本课六行可编辑列表用 List 已足够。

当前项目的 charts 包已标为 deprecated。需要图表时单独评估受维护的方案，本课工程只安装实际使用的组件包。可回查[UI5 家族速查](../../reference/ui5-family/)，按设计系统、经典框架、原生组件与包装层区分名称。

### ThemeProvider、配置与 Assets 各有职责

ThemeProvider 包住应用后，切换主题仍调用底层配置 API；语言也通过配置改变。Settings.jsx 引用：

```js
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

await setTheme("sap_horizon_dark");
await setLanguage("en");
```

预期：组件与使用主题变量的页面区域一起变深；组件语言改为英文后，搜索框清除图标的可访问名称变为 Clear。业务标题“库存编辑”、按钮“保存商品”和商品名称仍由应用提供。

ThemeProvider 接入包装库样式与主题变化，setTheme 选择主题，Assets.js 提供动态资源加载入口。它们不是一个 API 的三种名字。[资源文档](https://ui5.github.io/webcomponents/docs/advanced/using-assets/)解释了主题和翻译如何在需要时加载。

Settings 等待异步配置完成，期间禁用两个选择框，失败则提示检查 Network。页面 CSS 使用 `--sapBackgroundColor`、`--sapTextColor` 等主题变量，才能跟随控件配色。普通页面区域写死白色背景，即使控件切了深色，它也仍是白色。

:::tip[自己尝试 · 本地 React]
1. 在 Network 勾选 Disable cache 后刷新，过滤 messagebundle 或 zh_CN。
2. 切 Horizon 深色，过滤 parameters-bundle，观察新增资源请求。
3. 切 English，在搜索框输入 P，然后在 Elements 展开工具栏 ui5-input 的 Shadow DOM，查清除图标名称；再观察业务按钮文字。

预期：翻译与主题资源成功返回；页面与控件配色一起变化；组件内置文案改变，业务中文保留。CardHeader 在 Elements 中带有 slot="header"。
:::

## 常见错误与调试

### 保存按钮可以按，却没有进入提交函数

**现象**：字段能编辑，点“保存商品”后列表与汇总不变，Console 没有业务异常。起始错误是把外层原生 form 删掉，把提交写到了 UI5 Form 上：

```jsx
// 有问题的写法：把布局组件当成原生提交容器
<Form onSubmit={submit}>
  <FormItem labelContent={<Label>库存</Label>}>
    <Input value={draft.stock}
      onInput={(event) => change("stock", event.target.value)} />
  </FormItem>
  <Button type="Submit">保存商品</Button>
</Form>
```

**工具**：打开 Sources → src/ProductEditor.jsx，在 submit 第一行行号上单击设断点；回页面点保存。再到 Elements 搜索 ui5-form，向上检查祖先节点。

**证据**：断点未命中；存在 ui5-form，却没有原生 form 祖先。Button 的 type 是 Submit，但当前树中没有负责提交的 HTML 表单。

**原因**：React 的大写 Form 渲染的是布局组件 ui5-form，它没有替应用创建原生 form。写 onSubmit 只是在等待事件，事件不会因 prop 存在而自动产生。

**修复**：恢复 ProductEditor.jsx 中的 `<form onSubmit={submit} noValidate>`，内部放 Form 与保存按钮。校验和 setProducts 继续保留在应用里。

**确认**：再次点击保存，断点命中；P002 保存 3 后总库存为 55；非法输入触发错误提示。阶段 7 的浏览器回归覆盖“输入 → 点击真实按钮 → 提交 → 列表汇总”，能发现缺失提交处理这类接线错误。纯函数单测则负责输入边界，两层测试各覆盖自己的风险。

## 练习

### 练习 1：解释四行输出

回到 prediction.js，先写答案再运行。说明草稿和保存结果的 stock 类型、原 P002 库存，以及为什么新数组仍能共用 P001 对象。

验收：四行预测正确；能解释总价值增加的是 3 × 12900 分。

<details>
<summary>提示</summary>

文本草稿与业务对象是两个边界。map 只替换命中的商品，未修改项可以继续共用引用。

</details>

<details>
<summary>参考答案</summary>

输出依次为 string number、0 3、false true，以及总库存 55、价值 26735.00 元。保存先校验，再生成新数组和新的 P002；原数据不变。P001 没有更新，复用其对象无需复制字段。总价值增加 38700 分。

</details>

### 练习 2：修好提交容器

以完整 ProductEditor.jsx 为起点，删除外层 form，把 onSubmit 迁移到 Form，观察上面的故障，再修复。

验收：P002 保存 3 更新列表和汇总；库存 -1 保存失败，聚焦库存；把库存改回 0 可以保存。

<details>
<summary>提示</summary>

先证明 submit 是否执行，再看校验结果。遇到断点从未命中的情况，先检查事件和容器，而不是修改金额函数。

</details>

<details>
<summary>参考答案</summary>

恢复原生 form 和它的 onSubmit，Form 继续做内部排版。保存按钮使用 type="Submit"。校验错误由应用返回并展示，成功后用新的 products 数组更新 state；这两步都依赖提交函数先被调用。

</details>

### 练习 3：追踪草稿和标签

选择 P004，把名称改成“未保存的名称”，然后切到 P002，再切回来。接着取消 P004 的热销并保存；在 React DevTools 的 Components 中找到 App，查看 products 里的 P004。

验收：切回后名称恢复 USB-C 扩展坞；保存后 tags 只有新品；搜索不存在的商品显示空列表，库存汇总保持不变。

<details>
<summary>提示</summary>

找到 ProductEditor 的 key，看看它跟随哪个值；再看 validateDraft 怎样处理原标签数组。

</details>

<details>
<summary>参考答案</summary>

selectedId 改变会重建编辑组件，因此旧草稿被丢弃；热销开关只添加或删除热销，其他标签沿用原数据。搜索从 products 派生 visible，编辑区按 selectedId 找商品，汇总从全部 products 派生，三者的输入范围清楚，所以空列表也不影响业务库存。

</details>

## 项目进度

从 examples/c43/lab 的原生组件知识继续，在 examples/inventory/07-ui5-react 完成阶段 7。参考工程与阶段 5、6 并列，便于比较同一业务。

- src/main.jsx 接入 ThemeProvider、Assets 与图标；Settings.jsx 管主题和组件语言。
- App.jsx 保存商品、选择与搜索状态；ProductList.jsx 将点击项映射到业务 id。
- ProductEditor.jsx 管独立草稿、字段错误与焦点；editor-state.js 复用阶段 4 校验并创建新数组。
- styles.css 处理页面布局与主题变量；tests 和 e2e 分别验证业务规则与真实控件接线。

仍在阶段 7 目录执行：

```sh
npm test
npm run test:e2e
npm run build
npm run test:e2e:production
npm run preview
```

预览地址为 `http://127.0.0.1:8144/`。生产回归另把构建目录挂在 `/js_web/ui5-react/`，检查嵌套路径下的事件、主题和资源。应用数据保存在页面内存，刷新恢复固定数据；阅读课程的网站由 Astro 独立构建。

完成标准：初始六件商品，库存 52、价值 26348.00 元；P002 保存为 3 后，库存 55、价值 26735.00 元；非法字段无法保存；切换商品重置草稿；主题和语言资源能加载。

## 小结

- React 包装库提供组件、props 和回调，底层 UI5 元素与事件契约仍然存在。
- Input 读 value，CheckBox 读 checked，Select 与 List 按 detail 契约读取选择对象。
- UI5 Form 排版，原生 form 承接提交；草稿校验成功后才更新业务数组。
- App 保存一份 products，列表和汇总由它派生，编辑区用 key 明确切换重置规则。
- ThemeProvider、配置 API 与 Assets 各有职责，主题、翻译和动态 chunks 随产物一起交付。

自测：

1. React 19 已支持自定义元素，包装库还提供什么？
2. 为什么 List 的事件源不能直接当作被点击的商品项？
3. UI5 Form 与小写 form 分别负责什么？
4. 取消热销时，怎样保住商品原来的新品标签？
5. 控件切了深色，页面背景为什么可能仍然是白色？

下一课从资源、请求、状态、布局与存储串起完整排错过程，为最终交付准备检查记录。

## 延伸阅读

- [UI5 React：安装、包职责与资源入口](https://github.com/UI5/webcomponents-react)
- [UI5 React：组件、事件与高层组合组件文档](https://ui5.github.io/webcomponents-react/v2/)
- [UI5 Web Components：Form 的布局与提交边界](https://ui5.github.io/webcomponents/components/Form/)
- [UI5 Web Components：List 的事件与 payload](https://ui5.github.io/webcomponents/components/List/)
- [UI5 Web Components：主题与语言资源](https://ui5.github.io/webcomponents/docs/advanced/using-assets/)
- [React：状态保留与重置](https://react.dev/learn/preserving-and-resetting-state)
