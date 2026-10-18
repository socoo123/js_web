---
title: C37 组件生态与选择标准
description: 分清三类组件方案与数据工具，用库存表格和编辑弹窗检验可访问性、主题、维护和许可，写出选择理由。
sidebar:
  order: 37
---

> **第 4 周 · 第 19 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br />
> 前置：C25、C26、C35、C36 · 运行：Node 24、本地网页 · 示例已运行验证

## 这一课解决什么问题

库存应用已经能编辑、筛选和保存。现在把商品卡片换成表格、编辑区放进弹窗，Ant Design、MUI、Mantine、shadcn/ui、Radix、UI5 React 该选谁？

它们都有按钮和弹窗，接入后你承担的工作却不同。有的交付外观和交互，有的提供行为基础，有的把组件代码放进你的仓库。表格看起来成功了，也可能排序后编辑错商品，或让键盘用户回不到原来的按钮。

学完你能：

- 按交付方式区分完整组件库、无样式 primitives 和组件代码分发。
- 分清 UI、请求缓存、表格逻辑、表单状态各自管什么。
- 用同一组业务和键盘操作比较候选方案，检查主题是否覆盖弹窗。
- 找到兼容要求、维护记录和许可，给库存项目写出可解释的选择。

示例在 [examples/c37](https://github.com/socoo123/js_web/tree/main/examples/c37)。本课用原生表格与 `dialog` 建立验收基线，候选库的定位通过官方文档比较。实验网页只编辑库存数量；阶段 4 的完整字段规则继续保留。

## Java 程序员先看这里

| Java 经验 | 前端对应 | 关键差异 |
| --- | --- | --- |
| 引入一个带默认皮肤的控件包 | 完整 React 组件库 | props 和事件连接业务数据，库提供默认外观与交互 |
| 组合底层控件，自己做皮肤 | 无样式 primitives | 交互可复用，布局、颜色和状态外观仍需你实现 |
| 把模板生成的源码提交进仓库 | 组件代码分发 | 本地代码由你维护，底层 npm 依赖仍需升级 |
| Maven 中不同职责的依赖 | UI、Query、Table、Form 工具 | 名称里都有“组件”，也可能工作在完全不同的层 |
| JTable 的行位置与业务主键 | 显示行索引与商品 id | 排序、筛选和分页都会改变位置，保存始终按 id |

## 1. 三类方案：交付给你的东西不同

选择之前先问：**外观谁决定，交互谁提供，修改和升级落在哪个文件？** 三类方案的主要差别在这里。

```text
完整库：业务组件 → npm 包中的组件实现与默认样式
primitives：业务组件 → 自己的样式与组合 → npm 包中的交互基础
代码分发：业务组件 → 仓库内的组件源码 → 它依赖的底层包
```

三个维护入口不同：完整库优先改配置与公开 API；primitives 要维护外观层；代码分发允许改本地组件，同时需要跟进上游修复。这些路径可以组合，例如本地组件内部继续使用 Radix。

### 完整组件库：先得到一致的界面

这类方案通常把按钮、输入框、弹窗、布局和主题组织成一套。你写数据与事件，组件把它们转换成界面。它省掉大量重复工作，也意味着项目会采用一套既有的设计语言。

| 方案 | 定位与默认方向 | 对库存页的影响 |
| --- | --- | --- |
| [Ant Design](https://ant.design/docs/react/introduce/) | 面向企业 Web 应用的 React 组件库 | Table、Form、Modal 可以组成同一套管理界面 |
| [MUI 的 Material UI](https://mui.com/material-ui/getting-started/) | 采用 Material Design 的 React 组件库 | 适合已有 Material 设计约定的团队；复杂网格需另看 MUI X |
| [Mantine](https://mantine.dev/getting-started/) | 带样式的 React 组件、Hooks 与配套包 | 能组合表单和弹窗；Form 等能力按包划分，逐项看需要什么 |
| [UI5 Web Components for React](https://github.com/UI5/webcomponents-react) | 在 UI5 Web Components 之上提供 React 接口和高层组件 | 适合要求 Fiori 体验的 React 应用，需要关注对应资源与主题体系 |

UI5 React 在这里指 **UI5 Web Components for React**，不是经典 SAPUI5 或 OpenUI5 的 React 写法。选中它意味着采用另一套组件实现与资源约定；只因为系统后端来自 SAP，还不足以决定前端必须使用它。

### 无样式 primitives：拿行为，自己完成外观

[Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) 提供 Dialog、Popover、Select 等底层组件，处理许多角色、焦点和键盘交互。它把这些可复用行为作为基础，样式交给你。

“无样式”很适合已有设计系统的团队：同一个 Dialog 行为可以配成品牌需要的外观。代价是你仍要完成尺寸、间距、禁用态、错误态、焦点轮廓和深浅主题。一个能打开的弹窗，距离整套库存界面还有组合工作。Radix **Themes** 则是带样式的另一套产品，读文档时看清 Primitives 这个名称。

### 组件代码分发：把组件放进自己的仓库

[shadcn/ui](https://ui.shadcn.com/docs) 提供组件代码及其分发方式。组件可以进入项目的 `components/ui/`，你能直接修改它，获得带默认样式的起点。具体组件采用什么底层实现，要看所选条目和生成的依赖；底层可能继续使用 primitives。

你改过本地 Dialog，后续上游修复就需要比较差异并合入。更新 npm 依赖不会自动合并本地源码。[它的 Data Table 指南](https://ui.shadcn.com/docs/components/radix/data-table) 展示了如何组合 Table 外观与 TanStack Table 逻辑。

Java 中“依赖一个控件 jar”更像完整库或 primitives，“生成并接管一份模板代码”更像代码分发；后者依然可能依赖其他 jar，前端也是如此。

## 2. UI 库负责呈现，数据规则留在业务层

换库时先保持数据流：商品数组进入界面，编辑事件带商品 id 返回，校验通过后更新数组。请求缓存和业务数据各自继续由原来的模块管理。

| 工具 | 主要职责 | 库存场景里的位置 |
| --- | --- | --- |
| Ant Design 等 UI 库 | 控件、布局、视觉与交互 | 展示表格、打开弹窗、显示错误 |
| TanStack Query | 异步服务端状态的缓存、重试、失效 | 复用 C32 的远程详情实验 |
| TanStack Table | 表格行列、排序、筛选等逻辑 | 组合自己的表格 UI；它本身不决定外观 |
| React Hook Form 等表单工具 | 字段状态、提交、校验组织 | 管理复杂表单草稿，和输入控件连接 |
| state、reducer 或其他状态工具 | 应用拥有的数据与更新 | 商品数组、当前编辑编号等 |

[TanStack Table 的表格指南](https://tanstack.com/table/latest/docs/guide/tables) 把数据和行模型作为核心；[React Hook Form](https://github.com/react-hook-form/react-hook-form) 关注表单状态与校验。它们与 UI 组件可以组合。完整库已经满足表格和表单需要时，先使用它已有的能力。

### 记录身份贯穿整个编辑过程

**先猜一猜：** 按库存升序后，无线鼠标在首行。拿首行的索引 0 回原数组找，会编辑谁？在 `examples/c37` 运行 `node row-identity.js`。

```js title="row-identity.js"
import { products } from "../shared/products.js";
import { selectProduct } from "./select-product.js";
import { selectProduct as selectBroken } from "./select-product-broken.js";

const visible = products.toSorted((a, b) => a.stock - b.stock);
const row = { id: visible[0].id, index: 0 };
console.log("显示首行", row.id);
console.log("按位置编辑", selectBroken(products, row).id);
console.log("按编号编辑", selectProduct(products, row).id);
console.log("原数组首行", products[0].id);
```

```text
显示首行 P002
按位置编辑 P001
按编号编辑 P002
原数组首行 P001
```

`toSorted` 生成了新的显示顺序，原数组仍从机械键盘开始。这和 Java 对排序后的视图使用原列表下标一样，位置已经不是同一个含义。表格的行身份、按钮事件和保存入口都应保留业务 id。

接入组件库时，把这个规则映射到它的 API。例如 [Ant Design Table](https://ant.design/components/table/) 提供 `rowKey` 配置记录身份，业务按钮仍需把当前记录的 `id` 交给编辑事件。配置行 key 与正确传递事件参数是两件都要做的事。

### 显示格式和排序依据分开

**先猜一猜：** `1599.00` 和 `199.00` 按文本排序，哪个在前？表格里应让哪个商品价格更低？

```js title="price-sort.js"
import { products } from "../shared/products.js";

const rows = products.map((product) => ({
  id: product.id,
  priceCents: product.priceCents,
  priceLabel: (product.priceCents / 100).toFixed(2),
}));
const byLabel = rows.toSorted((a, b) => a.priceLabel.localeCompare(b.priceLabel));
const byValue = rows.toSorted((a, b) => a.priceCents - b.priceCents);
console.log("按显示文本", byLabel.map((row) => row.id).join(","));
console.log("按整数分", byValue.map((row) => row.id).join(","));
console.log("原始价格类型", typeof products[0].priceCents);
```

```text
按显示文本 P002,P003,P005,P004,P001,P006
按整数分 P002,P005,P004,P001,P006,P003
原始价格类型 number
```

文本比较看到开头的 `15` 和 `19`，把显示器排到了支架前面。表格排序用 `priceCents` 的数字比较，单元格显示时再格式化。C03 的“金额保存为整数分”仍然有效；像 Java 的展示 DTO 一样，显示字符串不会取代原始金额字段。

## 3. 用可操作的基线检查可访问性与主题

选库要比较完成后的操作路径。对编辑弹窗，最小路径是：键盘打开、焦点进入、读出标题与字段、处理错误、取消或保存、焦点回到触发处。可访问性既包含组件提供的基础，也包含你传入的标题、标签和错误信息。

### 打开弹窗，要改变交互范围

实验用浏览器原生 [`dialog`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) 练习这条路径。下面是 `selection.html` 的结构片段：

```html
    <dialog id="editor" aria-labelledby="editor-title" aria-describedby="editor-help">
      <form id="editor-form" novalidate>
        <h2 id="editor-title">编辑商品</h2>
        <p id="editor-help">取消或按 Esc 会丢弃本次草稿。</p>
        <p id="editing-product"></p>
        <label for="stock">库存数量</label>
        <input id="stock" name="stock" type="number" min="0" max="99999" step="1" required autofocus aria-describedby="stock-error">
        <p id="stock-error" role="alert"></p>
        <div class="toolbar">
          <button type="submit">保存</button>
          <button type="button" id="cancel">取消</button>
        </div>
      </form>
    </dialog>
```

`aria-labelledby` 关联弹窗标题，`label` 关联库存输入框，错误区域通过 `aria-describedby` 关联字段。页面选择自己处理校验，因此 form 设置 `novalidate`；无效输入时脚本写入错误、设置 `aria-invalid` 并聚焦字段。

`selection.js` 里打开编辑器的函数如下。这里 `resolveProduct` 在正确页面使用按 id 查找的实现。

```js
function openEditor(row) {
  const product = resolveProduct(products, row);
  if (!product) return;
  editingId = product.id;
  triggerId = row.id;
  stock.value = String(product.stock);
  stock.removeAttribute("aria-invalid");
  error.textContent = "";
  document.querySelector("#editing-product").textContent = `${product.id} ${product.name}`;
  editor.showModal();
}
```

打开无线鼠标后，弹窗显示 `P002 无线鼠标`，库存框是 `0` 且获得焦点。`showModal()` 让背景处于不可交互状态；这里的 `autofocus` 指定初始焦点。Esc 触发默认取消行为，脚本还在关闭时按 `triggerId` 找到编辑按钮恢复焦点，保存导致表格重建后也能回来。

这条验收路径可用于比较第三方组件。[Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) 例如提供模态焦点管理、Title 和键盘关闭等机制。你组合时仍要填写有意义的标题、可访问名称，并决定取消草稿的业务行为。Java 控件库也能提供焦点机制，具体操作顺序和错误提示仍取决于应用。

:::tip[自己尝试 · 本地网页]
1. 在仓库根目录运行 `python3 -m http.server 8037 --bind 127.0.0.1`，打开 `http://127.0.0.1:8037/examples/c37/selection.html`。
2. 点“按库存升序”，用 Tab 移到“无线鼠标”的编辑按钮，按 Enter。用 Tab、Shift+Tab 在字段和按钮间移动。
3. 把库存改成 8，按 Esc，再打开同一商品。接着清空库存点保存，最后填 3 保存。
4. 在页面点“深色主题”，再次打开弹窗，检查输入框、文字和焦点轮廓。

预期：Esc 后库存仍为 0；空值保留弹窗并聚焦字段、显示错误；保存 3 后总库存 55 件、价值 26735.00 元，焦点回到鼠标的编辑按钮。深色页面和弹窗使用一致背景，刷新恢复初始数据。
:::

### 主题用配置贯穿页面与浮层

主题包含背景、文字、边框、错误和焦点等语义值。实验把值放在根元素上，让页面和 dialog 都能继承；这是 `selection.css` 的相关部分：

```css
:root { --surface: #ffffff; --text: #172033; --border: #526177; --error: #b42318; color-scheme: light; }
:root[data-theme="dark"] { --surface: #172033; --text: #f5f7fa; --border: #aab7ca; --error: #ffb4ab; color-scheme: dark; }
body, dialog { background: var(--surface); color: var(--text); }
```

切换后，两处背景都变成深色，文字也随之变化。原生 dialog 进入浏览器顶层显示，仍保留 DOM 继承关系。

React 库常用 Portal 把弹窗放到另一处 DOM 容器。此时局部 CSS 选择器、变量继承范围和浮层容器都要检查。使用候选库时，优先走它公开的主题机制，例如 [Ant Design 的 ConfigProvider 与 design token](https://ant.design/docs/react/customize-theme/)。React Context 的传递和 DOM 上 CSS 的继承是不同机制，实际打开弹窗检查两者的结果。

表格还要检查窄屏：列能否阅读，操作是否仍可达；列太多时可以在表格容器内滚动。用屏幕阅读器进一步检查标题、字段和表头的关联。完成这些操作，比给候选库填一个“支持无障碍”的勾更有用。

## 4. 查维护与许可，把结论写成选择理由

维护状况要落到具体版本和组件。先看是否归档、最近发布和迁移说明，再搜 Table、Dialog、Form 的问题与修复。成熟小组件发布较少，和大版本迁移缺少文档，是两种不同信号。

可以先在仓库根目录读取包的公开元数据：

```sh
npm view antd peerDependencies license --json
```

当前结果显示 React 与 React DOM 的要求都是 `>=18.0.0`，许可为 MIT。阶段 4 的 React 19 落在声明范围内；接入时再用自己的表格、弹窗和测试确认组合结果。这个命令只查询信息，安装由对应项目的清单和锁文件记录。

维护入口也有差别：Ant Design 看 [Changelog](https://ant.design/changelog/)，MUI、Mantine 看版本发布和迁移指南；Radix 看各 primitive 的发布说明；shadcn/ui 要同时看代码条目和底层依赖；UI5 React 要关注包装库与 UI5 Web Components 的配套变化。阅读一条与你的控件相关的修复，判断它是否能解释项目中的问题。

### 许可看具体包和功能

| 方案范围 | 公开许可 | 选择时还要看什么 |
| --- | --- | --- |
| Ant Design `antd` | [MIT](https://github.com/ant-design/ant-design/blob/master/LICENSE) | 配套产品与资源分别核对 |
| Material UI | [MIT](https://github.com/mui/material-ui/blob/master/LICENSE) | MUI X 的 Community、Pro、Premium 分别判断 |
| Mantine 核心仓库 | [MIT](https://github.com/mantinedev/mantine/blob/master/LICENSE) | 第三方扩展自己的许可和依赖 |
| Radix Primitives | [MIT](https://github.com/radix-ui/primitives/blob/main/LICENSE) | 配套依赖和素材 |
| shadcn/ui 组件代码 | [MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) | 本地组件使用的依赖、额外 registry 条目 |
| UI5 Web Components for React | [Apache-2.0](https://github.com/UI5/webcomponents-react/blob/main/LICENSE) | 对应组件、资源包及其说明 |

这张表对应列出的项目范围。比如 [MUI X 许可页](https://mui.com/x/introduction/licensing/) 区分 MIT 的 Community 和采用商业许可的扩展功能；选型记录应写具体功能属于哪一档。分发时按对应 LICENSE 保留要求的文本和声明；模板、图标、字体也按各自来源记录。

### 本项目为什么先选 Ant Design

我们的目标是：在已有 React 库存上完成表格和编辑弹窗，保留字段校验、商品身份及本地数据行为；设计上允许采用一套现成的管理界面。基于这个目标，阶段 5 选择 Ant Design。

| 判断点 | 本项目的选择理由 |
| --- | --- |
| 功能与职责 | 同一库的 Table、Form、Modal 覆盖主要界面；业务仍使用原来的商品数组与更新入口 |
| 可访问性 | 以刚练过的标题、标签、错误、键盘和焦点路径验收组合后的页面 |
| 主题 | 使用公开主题配置，让列表、表单和弹窗采用同一套语义值 |
| 维护 | 有版本记录与组件级修复入口；接入版本由阶段项目锁文件固定 |
| 许可与额外工作 | 本课目标控件属于 antd 的 MIT 范围；需要完成数据适配和应用回归 |

这是一项基于需求的决定。如果必须使用既有 Material 风格，优先评估 MUI；团队已有完善品牌设计系统，可以承担样式工作，就评估 primitives；愿意维护组件源码时，代码分发方案也有吸引力；要求 Fiori 体验时，再评估 UI5 路线。

当前阶段 4 实现继续作为行为参照。本课交付选型理由与独立实验，阶段 5 的完整迁移在 C38 完成。六种初始商品仍是 52 件、26348.00 元，组件选择只改变界面的实现方式。

## 常见错误与调试

### 排序后编辑错商品

**现象**：打开实验页 `selection.html?case=broken`，点“按库存升序”，再点无线鼠标的编辑按钮，弹窗却显示机械键盘，库存是 12。

**工具**：打开 Chrome DevTools → Sources → `selection.js`，在 `editingId = product.id;` 的行号上单击设置断点。关闭弹窗，再点无线鼠标的编辑按钮。

**证据**：暂停后在 Scope 或 Console 查看 `row.id` 是 `P002`，`row.index` 是 0，`product.id` 却是 `P001`。原数组的第 0 项也是 `P001`。错误选择器是：

```js title="select-product-broken.js"
// 有问题的写法：把显示位置当成原数组位置
export function selectProduct(products, row) {
  return products[row.index] ?? null;
}
```

**原因**：排序改变了显示位置，按钮传来的 index 被用于另一份顺序。换一个表格皮肤也会留下同样的业务错误。

**修复**：把错误文件里的函数改成下面的实现，仍保留原导出名。正确参考也在 `select-product.js`。

```js title="select-product.js"
export function selectProduct(products, row) {
  return products.find((product) => product.id === row.id) ?? null;
}
```

**确认**：移除断点，刷新错误页面并重做步骤，应打开无线鼠标且库存为 0；保存 3 后只有鼠标更新，总库存变为 55 件。下面这条 Vitest 回归保护“显示位置变化后仍编辑同一件商品”：

```js
it("排序后编辑鼠标，仍按商品编号读取合法库存 0", () => {
  const visible = products.toSorted((a, b) => a.stock - b.stock);
  const selected = selectProduct(products, { id: visible[0].id, index: 0 });
  expect(selected).toMatchObject({ id: "P002", stock: 0 });
});
```

测试文件 `select-product.test.js` 默认引入正确实现。练习时先把导入改成 `./select-product-broken.js`，观察失败，修复错误选择器后再次运行。测试还覆盖筛选后的行位置和商品已删除的情况。

在阶段 4 目录已执行过 `npm ci` 的基础上，回到仓库根目录运行：

```sh
node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c37/vitest.config.js
```

正确实现应通过 3 条测试。它们检查数据适配；弹窗的焦点与布局继续用真实网页检查。

## 练习

### 练习 1：预测换皮肤以后还要守住的结果

运行前阅读 `acceptance.js`：选择 P002，把库存从 0 改成 3，其他字段不变。预测编辑对象、总库存、总价值、原数据库存和不存在的编号分别得到什么。在 `examples/c37` 运行 `node acceptance.js` 核对。

```js title="acceptance.js"
import { products } from "../shared/products.js";
import { selectProduct } from "./select-product.js";

const row = { id: "P002", index: 0 };
const selected = selectProduct(products, row);
const changed = products.map((product) => product.id === selected.id
  ? { ...product, stock: 3 } : product);
console.log("编辑对象", selected.id, "原库存", selected.stock);
console.log("总库存", changed.reduce((sum, product) => sum + product.stock, 0));
console.log("库存总价值", changed.reduce((sum, product) =>
  sum + product.stock * product.priceCents, 0));
console.log("原数据库存", products.find((product) => product.id === "P002").stock);
console.log("不存在的编号", selectProduct(products, { id: "P999", index: 0 }));
```

<details>
<summary>提示</summary>

鼠标每件 12900 分。`map` 为鼠标生成新对象，原数组保持不变；选择器找不到 id 时返回 `null`。

</details>

<details>
<summary>参考答案</summary>

依次是：编辑对象 P002、原库存 0；总库存 55；总价值 2673500 分；原数据库存 0；不存在的编号为 `null`。价值增加了 `3 × 12900 = 38700` 分。这些断言适用于任何组件实现，显示格式和按钮样式都不会改变计算结果。

</details>

### 练习 2：修好位置错误，再验证取消

从 `selection.html?case=broken` 和 `select-product-broken.js` 开始，按调试步骤修复。验收：库存排序后编辑鼠标仍读到 0；筛选场景的回归通过；输入 8 后按 Esc，再打开仍是 0；空输入报错；保存 3 后键盘焦点回到同一个编辑按钮。

<details>
<summary>提示</summary>

按商品 id 查找记录。弹窗打开时只复制字段到草稿，提交成功才更新商品数组。检查默认取消和关闭时的焦点恢复，观察值是否在保存前就写回了商品。

</details>

<details>
<summary>参考答案</summary>

选择器采用 `select-product.js` 的实现。`selection.js` 的 `openEditor` 只设置输入框的值，保存处理函数才通过 `map` 更新商品；Esc 关闭后，重新打开会再次从商品读取 0。关闭事件按 `triggerId` 寻找按钮，因此表格保存后重建也能恢复焦点。数据回归和键盘操作都通过，才覆盖了这次错误涉及的两个层面。

</details>

### 练习 3：为表格和弹窗写一份选型理由

写 150–250 字的选择记录：候选至少涵盖完整库、primitives、代码分发三类；说明首选、两项理由和你愿意承担的额外工作。附三条可观察验收，其中至少一条是键盘操作，一条是固定数据结果，并给出维护与许可入口。

<details>
<summary>提示</summary>

先写“项目要什么”，再选方案。不要用星标数或截图数量替代功能判断。团队已有的设计约定、维护能力和目标用户，会改变选择。

</details>

<details>
<summary>参考答案</summary>

示例：库存页需要同风格表格、表单与弹窗，团队允许采用现成管理界面，因此首选 Ant Design。它的 Table、Form、Modal 覆盖目标，主题配置便于统一页面和浮层；团队负责数据适配与交互回归。Radix Primitives 需要额外完成样式，shadcn/ui 需要接管本地组件维护。按官方 Changelog 跟进控件修复，许可入口为 antd 的 LICENSE。验收：Esc 丢弃草稿并恢复焦点；初始总库存 52 件；鼠标保存 3 后总库存 55 件、总价值 26735.00 元。

</details>

## 小结

- 三类交付方式决定你接管的是配置、外观组合，还是本地组件源码。
- UI、Query、Table、Form 各有职责，先满足业务需要，再决定组合哪些工具。
- 表格事件保留商品 id，数字排序保留原始值，显示格式放在最后。
- 用标题、标签、错误、键盘、焦点和主题的实际操作路径比较候选方案。
- 维护与许可查具体版本、包和功能；选择理由从项目需求出发。

自测：

1. shadcn/ui 的本地组件与 npm 依赖，分别怎样获得修复？
2. 为什么 TanStack Query 不能直接替你画出商品表格？
3. 表格配置了稳定的行 key，为什么编辑事件仍可能找错商品？
4. 为什么检查主题时必须实际打开弹窗？
5. 哪种需求变化会让你重新评估本课的组件选择？

下一课用 Ant Design 完整实现库存表格与编辑弹窗，把本课的验收条件落实到组件库版。

## 延伸阅读

- [Ant Design：React 组件库与设计目标](https://ant.design/docs/react/introduce/)
- [Radix Primitives：交互基础与无样式设计](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [shadcn/ui：组件代码分发](https://ui.shadcn.com/docs)
- [MUI X：Community 与商业许可](https://mui.com/x/introduction/licensing/)
- [UI5 Web Components for React：定位与文档入口](https://github.com/UI5/webcomponents-react)
- [MDN：dialog 元素与模态行为](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
