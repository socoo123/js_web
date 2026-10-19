---
title: C43 UI5 Web Components 原生使用
description: 在原生网页使用 UI5 自定义元素，分清属性、事件与 slots，检查 Shadow DOM、主题和语言资源。
sidebar:
  order: 43
---

> **第 4 周 · 第 22 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C11、C16、C39–C42 · 运行：Node 24、本地网页 · 示例已运行验证

## 这一课解决什么问题

已有的普通网页想加 Fiori 风格的输入框和补货按钮，还需要创建 Component、manifest 和 XML View 吗？

使用 UI5 Web Components，可以直接写 `<ui5-input>`、`<ui5-button>`，用 DOM API 读值、监听事件。商品数组与界面更新都由你的 JS 管理。

沿用 C03 的补货：P001 库存 12，补货 3 后为 15；P002 库存 0，补货后为 3。换了控件，转换和校验仍由应用负责。

学完你能：

- 用 npm、ES 模块和 Vite 加载、注册自定义元素
- 分清 HTML attribute 与 JS property，正确设置布尔值、读取输入和监听事件
- 在 Elements 看懂宿主、Shadow DOM 与 slots，选对样式入口
- 加载主题和语言资源，在 Network 判断它们是否成功交付
- 解释 React 19 直接使用自定义元素与 React 包装库的关系

完整文件在 [examples/c43](https://github.com/socoo123/js_web/tree/main/examples/c43)。先进入已有锁文件的实验目录启动页面：

```sh
cd examples/c43/lab
npm ci
npm run dev
```

打开 `http://127.0.0.1:8043/`，预期显示商品选择框、补货卡片和“总库存 52 · 库存价值 26348.00 元”。

## Java 程序员先看这里

| Java 经验 | 本课对应 | 差异 |
| --- | --- | --- |
| 加入一个 UI 库并实例化控件 | 导入模块，再写自定义标签 | 模块执行会向浏览器注册标签 |
| 布尔 setter | `button.disabled = false` | disabled attribute 存在即为 true |
| 事件监听器 | addEventListener | 输入读 value，附加数据按契约读 detail |
| 控件暴露公共 API、隐藏内部实现 | 宿主元素与 Shadow DOM | 页面选择器有树边界，样式通过主题变量或公开的 parts 定制 |
| 布局容器接收子控件 | 子元素进入默认或命名 slot | slot 是 DOM 的内容插入口，内容仍属于页面 |

## 1. 导入模块，浏览器才认识标签

Custom Elements 是浏览器的[自定义元素机制](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements)。合法的自主自定义标签名包含连字符，例如 `ui5-input`。解析 HTML 时，即使标签还没注册，浏览器也会先保留这个元素；注册完成后，再把它升级为对应的组件。

UI5 Web Components 通过 npm 包分发。[官方起步文档](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/)采用 ES 模块导入与打包，本课使用 Vite。`lab/components.js` 的入口如下：

```js
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents-icons/dist/add.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

await setLanguage("zh-CN");
await Promise.all(["ui5-button", "ui5-input", "ui5-card", "ui5-card-header"]
  .map((name) => customElements.whenDefined(name)));
```

导入模块会执行注册，add 图标也有独立模块。Assets.js 注册资源加载入口。组件就绪后，main.js 接着初始化业务。

最小的页面标记就是两个标签，输入值和按钮文字直接写在 HTML 中：

```html
<ui5-input id="amount" value="3" accessible-name="补货数量"></ui5-input>
<ui5-button id="save" design="Emphasized" icon="add">补货</ui5-button>
```

预期显示输入 3 和带加号的“补货”按钮。design 指定强调样式，按钮文字进入默认 slot。

网页的 `script type="module"` 加载 main.js，再导入 components.js；Vite 处理包路径。浏览器按 URL 解析模块，不会自动去 node_modules 查包。双击 HTML 或只复制标签会缺少这条加载链。

在实验页 Console 运行：

```js title="registered-console.js"
await customElements.whenDefined("ui5-input");
const registeredInput = document.querySelector("#amount");
console.log(Boolean(customElements.get("ui5-input"))); // → true
console.log(registeredInput instanceof HTMLElement); // → true
```

两个 true 分别证明标签已注册、实例是 DOM 元素。whenDefined 等待注册；显示结果还可以从 Shadow DOM 观察。

经典 UI5 用 loader 加载框架控件；ui5-input 是浏览器元素，JSONModel 的绑定语法不会自动作用于它。

对照 Java 的类库加载，浏览器还多了标签名到元素类的注册表。

## 2. 属性传值，事件通知：业务计算仍在外面

### attribute 是标记文本，property 是 JS 值

HTML attribute 是标签上的配置；property 是 JS 对象属性。UI5 按元数据转换，例如 accessible-name 对应 accessibleName；复杂值按 API 通过 property 传入。

**先猜一猜：** 给按钮设置 `disabled="false"`，它能点击吗？在实验页 Console 运行下面代码，最后会恢复可用状态：

```js title="attributes-console.js"
const saveButton = document.querySelector("#save");
saveButton.setAttribute("disabled", "false");
console.log(saveButton.hasAttribute("disabled"), saveButton.disabled); // → true true
saveButton.removeAttribute("disabled");
console.log(saveButton.disabled); // → false
saveButton.disabled = false;
console.log(typeof saveButton.disabled); // → boolean
```

输出为 `true true`、`false`、`boolean`。UI5 的布尔属性存在即为真，文本 false 也一样。动态开关用 `saveButton.disabled = false` 或移除 attribute，像 Java 布尔 setter 一样传布尔值。

Input.value 是 string，输入 3 也一样。[Input API](https://ui5.github.io/webcomponents/components/Input/)列出了 value、valueState、slots 和事件，遇到问题核对名字和类型。

### 监听事件时读什么

Input 的 input 在输入时触发，change 在 Enter 或失焦完成输入时触发。UI5 同时提供 ui5- 前缀事件；本课只订阅 ui5-input。

main.js 的监听器是：

```js
amount.addEventListener("ui5-input", (event) => {
  console.log(event.type, event.target === amount, typeof event.target.value);
  updateDraft();
});
```

输入 4，Console 打印 `ui5-input true string`，预览为补货后 16 件。target 是 ui5-input，当前输入读它的 value；updateDraft 只更新预览，点击按钮才保存。

currentTarget 是挂监听器的元素，外层委托时就是容器。穿过 Shadow DOM 的事件可能把 target 重定向为宿主；业务代码读组件公开属性即可。

补货复用 C03 的入口规则。`lab/restock.js` 先转换和检查，再生成新的商品对象：

```js
export function parseAmount(text) {
  if (text.trim() === "") return null;
  const amount = Number(text);
  return Number.isInteger(amount) && amount >= 1 && amount <= 99999
    ? amount : null;
}

export function restock(product, text) {
  const amount = parseAmount(text);
  if (amount === null || product.stock + amount > 99999) return null;
  return { ...product, stock: product.stock + amount };
}
```

P002 输入 `"3"`，返回 stock 为 3 的新对象；输入 `""`、`"3.8"`、`"3件"` 或补货后超过 99999，都返回 null。原商品保持不变。updateDraft 根据这个结果设置 `amount.valueState` 和 `save.disabled`；保存时也再次检查，再用 map 替换商品并重画汇总。

应用负责“事件 → 校验 → 更新数据 → 更新界面”，就像 Java 控件监听器仍需调用业务逻辑。

### detail 只装事件契约规定的数据

CustomEvent 的 detail 用来携带额外数据。Input 的当前值通过控件 value 读取；某些选择事件则把 item 放到 detail。读取哪个字段，由具体事件决定。

先用一个自己定义的业务事件看清契约。在 examples/c43 运行 `node event-contract.js`：

```js title="event-contract.js"
const target = new EventTarget();
target.addEventListener("inventory-restock", (event) => {
  console.log(event.type, event.detail.id, event.detail.amount);
});
target.addEventListener("inventoryRestock", () => console.log("另一个名字"));
target.dispatchEvent(new CustomEvent("inventory-restock", {
  detail: { id: "P002", amount: 3 },
}));
```

只打印 `inventory-restock P002 3`。连字符和大小写都属于事件名。这里用 Node 观察名称与 detail；DOM 冒泡要在浏览器中观察。

:::tip[自己尝试 · 本地网页]
1. 保持实验服务，选择 P002，确认库存为 0。
2. 输入 3，点“补货”；再依次输入空白、3.8、3件。
3. 恢复输入 3，按 Tab 到按钮，再按 Enter。

预期：第一次保存后 P002 为 3、总库存 55、价值 26735.00 元；非法输入时按钮禁用、预览给出原因，库存保持 3；键盘提交后 P002 为 6。刷新页面恢复初始数据。
:::

## 3. Shadow DOM 管内部实现，slot 接收页面内容

组件内部 DOM 可以放入独立的 shadow tree。ui5-input 是**宿主**，原生 input 由组件创建；页面提供的子节点属于 light DOM。[Shadow DOM](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_shadow_DOM)让组件的内部选择器和页面选择器有清楚的边界。

Card 通过 header 和默认 slot 接收页面提供的内容：

```html
<ui5-card id="card" accessible-name="商品补货">
  <ui5-card-header id="heading" slot="header" title-text="机械键盘"
    subtitle-text="P001 · 外设"></ui5-card-header>
  <div class="card-body">
    <p id="stock"></p>
    <label id="amount-label">补货数量（1–99999 的整数）</label>
    <ui5-input id="amount" value="3" show-clear-icon
      accessible-name-ref="amount-label"></ui5-input>
    <ui5-button id="save" design="Emphasized" icon="add">补货</ui5-button>
    <p id="feedback" role="status" aria-live="polite"></p>
  </div>
</ui5-card>
```

标题显示在头部，输入与按钮显示在内容区。slot="header" 指定命名插槽，div 进入默认插槽。Card 与 CardHeader 分别注册，两个模块都需导入。

accessible-name-ref 关联补货数量标签，status 区域提供保存反馈。应用负责给控件有意义的名称。

**先猜一猜：** header 能从 card.querySelector 找到，内部原生 input 也能从 quantityElement.querySelector 找到吗？

```js title="shadow-console.js"
const cardElement = document.querySelector("#card");
const quantityElement = document.querySelector("#amount");
console.log(cardElement.querySelector('[slot="header"]').id); // → heading
console.log(quantityElement.querySelector("input")); // → null
console.log(Boolean(quantityElement.shadowRoot.querySelector("input"))); // → true
```

结果为 heading、null、true。CardHeader 仍是页面可查询的子节点；Input 内部的原生 input 隔着 shadow root，普通 querySelector 不会跨过去。

Elements 展开 ui5-input → `#shadow-root (open)` 可看到原生 input。open 允许 JS 检查内部结构；日常更新用 amount.value。Shadow DOM 提供封装，不提供安全隔离。

样式也有相应入口：

```css
ui5-input { width: 100%; }
ui5-input input { color: red; }
ui5-input::part(input) { letter-spacing: 2px; }
```

第一行控制宿主宽度；第二行无法穿过 shadow root，字不会变红；第三行通过公开 part 改字间距。配色优先用主题变量，局部定制查 CSS Parts 表。.card-body 属于页面，可直接用 CSS 排版。

对照 Java，property 和 parts 像公开定制接口，slot 像向指定区域传子内容。

:::tip[自己尝试 · 本地网页]
1. 在 Elements 选中 id 为 heading 的 ui5-card-header，确认它有 `slot="header"`。
2. 把 header 改成 wrong，观察标题区域，再恢复 header 并刷新。
3. 在 Styles 为 ui5-input 添加上面的三条 CSS，比较宽度、颜色和字间距。

预期：错误的 slot 名称无法分配到头部；恢复并刷新后标题重新显示。普通后代选择器进不了 shadow tree，公开 part 可以修改字间距。
:::

## 4. 主题与语言也是需要交付的资源

webcomponents 包提供控件，icons 提供图标，base 提供配置 API；fiori 包另有高层控件。

组件内置默认主题和英文文案，其他主题与翻译需要对应资源。入口已经导入 Assets.js；main.js 使用以下配置 API，在选择框 change 后调用 setTheme 或 setLanguage：

```js
import { setTheme, getTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setLanguage, getLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

await setTheme("sap_horizon_dark");
await setLanguage("en");
```

预期：组件变为 Horizon 深色；输入框清除图标的可访问名称变为 Clear。getTheme、getLanguage 可读回配置。页面下方同时显示当前设置，选择框在异步切换期间暂时禁用，避免连续设置交错。

[Assets.js](https://ui5.github.io/webcomponents/docs/advanced/using-assets/)先注册加载器，并不在 import 当下下载所有语言与所有主题。需要某项资源时，动态 import 才加载它；Vite 把相应 JSON 资源转成可加载的模块。Network 中可能看到带 hash 的 JS，而不是直接看到一个 JSON 文件。

setLanguage 改变组件内置文案；页面自己的“补货”和商品名称由业务翻译字典负责。经典 UI5 的 ResourceModel 不会接管这个普通网页。

:::tip[自己尝试 · 本地网页]
1. 打开 Network，勾选 Disable cache 后刷新，过滤 zh_CN 或 messagebundle。
2. 切到 Horizon 深色，过滤 parameters-bundle，检查新增请求的状态码和 Response；再切回浅色。
3. 把组件语言改成 English，在 Elements 查看 Input 内部清除图标的 accessible-name。

预期：初次中文加载有相应翻译资源；首次切深色出现主题资源请求且返回成功；图标名称从“清除”变为 Clear，页面业务标题仍为中文。再次使用已加载的资源可以复用模块缓存。
:::

交付整个 dist，包括动态 chunks 与字体。漏文件可能导致“第一页正常，切主题才失败”。Vite base 为 `./`，支持整目录部署到静态子路径。

类似 Java 发布时携带资源包，主题与翻译需要正确的文件路径。

## 5. React 19 可以直接使用这些元素

React 19 已原生支持 Custom Elements，可以识别元素暴露的 property，并通过 `on` 加事件原名来订阅自定义事件。标签名继续用带连字符的小写形式。详细规则见 [React 自定义 HTML 元素文档](https://react.dev/reference/react-dom/components#custom-html-elements)。

lab/react-native.jsx 先导入同一个 components.js，让元素注册完成后再 createRoot。组件的核心部分如下：

```jsx
function NativeInput() {
  const [text, setText] = useState("3");
  return <>
    <ui5-input accessible-name="补货数量" value={text}
      onui5-input={(event) => setText(event.target.value)}></ui5-input>
    <ui5-button disabled={parseAmount(text) === null}>补货</ui5-button>
    <p role="status">当前输入：{text}</p>
  </>;
}
```

打开 `http://127.0.0.1:8043/react.html`，输入 7，预期状态文字变为“当前输入：7”；清空后按钮禁用，恢复 3 后按钮启用。这一页只演示 value、disabled 和事件传递。

`onui5-input` 是 `on` 加上 `ui5-input`，保留了事件中的连字符；不能按习惯改成 onUi5Input。原生写法用组件公开的 DOM 名称，包装库可以提供适合 React 的 props、事件接口和高层布局。选择包装库的理由包括这些 API 与组件组合，而不是“React 监听不了自定义事件”。

包装库像 Java 适配层；React state 和业务校验仍由应用管理。

## 常见错误与调试

### 按钮始终灰着，明明写了 false

**现象**：在 Console 执行 `document.querySelector("#save").setAttribute("disabled", "false")`，输入框仍是合法的 3，按钮却禁用。

**工具**：Elements → 选中 id 为 save 的 ui5-button，查看标签上的 disabled；Console 输入 `$0.hasAttribute("disabled")` 和 `$0.disabled`。

**证据**：两个值都为 true，Elements 上的字符串 false 没有变成 JS 的 false。

**原因**：布尔 attribute 由是否存在决定真假。这里的代码设的是文本标记。

**修复**：移除 disabled，或者给 property 赋布尔 false。程序里的 `save.disabled = next === null` 也应直接传布尔计算结果。

**确认**：刷新恢复初始状态，再运行 attributes-console.js，观察 true true → false，最后点击合法补货成功。浏览器回归同时检查属性规则与非法输入时的真实禁用行为。

### 输入框变了，预览一直停在 15

**现象**：把 main.js 的监听名改成 `ui5Input`，刷新后将初始输入 3 改成 4，预览仍显示补货后 15 件。

**工具**：Sources → main.js → 在监听回调内的 console.log 行设置断点，重新输入；Console 读取 `document.querySelector("#amount").value`，再对照 Input API 的 Events。

**证据**：value 已经是 `"4"`，回调断点却没命中；组件事件名称是 input 或带前缀的 ui5-input，代码监听的是 ui5Input。

**原因**：DOM 事件名称精确匹配。名字不对时回调不会运行，也没有异常提醒。

**修复**：恢复 `addEventListener("ui5-input", ...)`。React 直接使用时也按事件原名写 onui5-input。

**确认**：刷新、输入 4，断点命中且预览为 16；恢复 3，点击补货后库存为 15。examples/c43 的浏览器回归会用真实输入检查预览，能够发现这类事件接线错误。

## 练习

### 练习 1：预测类型、数据与布尔值

在 examples/c43 先读 prediction.js，预测四行输出，再运行 `node prediction.js`。

```js title="prediction.js"
import { products } from "../shared/products.js";
import { parseAmount, restock } from "./lab/restock.js";

const mouse = products.find((product) => product.id === "P002");
console.log(typeof "3", parseAmount("3"));
console.log(mouse.stock, restock(mouse, "3").stock);
console.log(parseAmount(""), parseAmount("3件"));
console.log(Boolean("false"), Boolean(false));
```

验收：解释类型、原对象变化和两个布尔结果。

<details>
<summary>提示</summary>

restock 返回新对象，非空字符串是 truthy。Boolean 转换与 attribute 是不同机制，文本 false 都不是布尔 false。

</details>

<details>
<summary>参考答案</summary>

依次输出 `string 3`、`0 3`、`null null`、`true false`。P002 原库存保持 0；校验通过的文本才进入加法；Boolean("false") 为 true 是因为字符串非空。按钮动态禁用要传真正的布尔值。

</details>

### 练习 2：修复事件与 slot

把 main.js 监听名改成 ui5Input，index.html 的 header slot 改成 heading。刷新后说明两个错误的层次，再修好。

验收：卡片头重新显示机械键盘；输入 4 立刻显示补货后 16；选择 P002 后保存 3，库存与汇总都正确。

<details>
<summary>提示</summary>

Sources 检查监听回调是否运行；Elements 检查 CardHeader 的 slot 属性，和 Card API 中公开的 Slots 名称比对。

</details>

<details>
<summary>参考答案</summary>

监听恢复 ui5-input，slot 恢复 header。第一个错误使业务回调收不到通知，第二个使页面内容无法分配到命名插槽。导入 CardHeader 模块解决的是注册，slot 名称解决的是内容放在哪里，两者分别检查。

</details>

### 练习 3：解释语言切换与发布目录

切深色与 English，构建预览。解释“补货”为何仍是中文，以及动态资源为何也需发布。

验收：预览页输入、补货、主题切换都成功；Network 没有失败资源；清除图标英文名称可见于 Elements。

<details>
<summary>提示</summary>

区分组件提供的文案与应用自己提供的文本。观察主题资源在首次切换前后才出现的请求。

</details>

<details>
<summary>参考答案</summary>

setLanguage 处理组件内置文案；“补货”是页面传入的文字，需要业务翻译机制更新。Assets.js 注册的动态 import 在用到主题或翻译时才加载对应文件，所以发布的是整个 dist。网页不需要运行 Node 服务处理库存操作。

</details>

## 项目进度

从仓库的 examples/c43/lab 开始，独立比较同一库存业务的原生组件写法。阶段 6 的 OpenUI5 工程继续保留，阶段 7 将沿用这里的组件知识完成 React 表单与列表。

- components.js 导入控件、图标与资源，设置初始中文并等待注册。
- index.html 提供 Card、Input、Button 和 slots；main.js 管商品数组、预览、保存与汇总。
- restock.js 复用文本入口规则；style.css 只负责页面布局与公开样式入口。
- react.html、react-native.jsx 对照 React 19 的直接属性与事件支持。

仍在 lab 目录运行：

```sh
npm run build
npm run preview
```

打开 `http://127.0.0.1:8143/`。预期初始六件商品、库存 52、价值 26348.00 元；选择 P002 补货 3 后为 3，总库存 55；刷新恢复；主题、语言与 React 对照页都能加载。

库存保存在页面内存。对照经典 UI5 的模型通知绑定更新，本课由应用手动校验、更新 DOM。

## 小结

- UI5 Web Components 是注册到浏览器的自定义元素，ES 模块导入负责加载注册代码。
- HTML attribute 是文本配置，property 是 JS 值；布尔 attribute 存在即为真，Input.value 仍是字符串。
- 事件名字与 payload 按 API 契约使用；数据更新与业务校验由应用负责。
- Shadow DOM 封装内部树，slots 接收页面内容，主题变量和公开 parts 提供样式入口。
- 主题与翻译需要随静态产物交付；React 19 可直接处理自定义元素的属性与事件。

自测：

1. 标签已经出现在 Elements，为什么仍需要检查注册模块？
2. disabled="false" 为什么会禁用按钮？输入 3 的 value 又是什么类型？
3. slot 中的 CardHeader 和 Input 内部的原生 input，分别由谁提供？
4. 切换组件语言后，“补货”为什么仍然是中文？
5. React 19 直接使用组件时，如何从 ui5-input 得到 JSX 监听名？

下一课用 UI5 Web Components for React 改写同一库存表单与列表，比较包装后的接口和数据流。

## 延伸阅读

- [UI5 Web Components：起步、npm 导入与构建](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/)
- [UI5 Web Components：组件 API 与属性、slots、事件](https://ui5.github.io/webcomponents/docs/getting-started/components-APIs/)
- [UI5 Web Components：额外资源与动态加载](https://ui5.github.io/webcomponents/docs/advanced/using-assets/)
- [UI5 Web Components：主题与语言配置](https://ui5.github.io/webcomponents/docs/advanced/configuration/)
- [MDN：使用 Shadow DOM](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_shadow_DOM)
- [React：自定义 HTML 元素](https://react.dev/reference/react-dom/components#custom-html-elements)
