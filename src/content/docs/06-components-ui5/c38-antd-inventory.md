---
title: C38 一个普通组件库的完整案例
description: 用 Ant Design 的 Table、Form、Modal 完成库存页，连接业务校验、草稿重置、焦点、主题与本地快照。
sidebar:
  order: 38
---

> **第 4 周 · 第 19 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br />
> 前置：C25、C26、C35、C37 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

上一课选定了 Ant Design。现在真正替换库存页：列表变成可排序表格，点编辑打开弹窗，保存后统计跟着变化。第一眼很容易做出来，第二次打开弹窗才暴露问题：鼠标为什么带着键盘的草稿？库存框看着像数字，为什么还能保存负数？

这些问题落在组件库和业务代码的连接处。库能提供控件、表单管理与焦点机制；商品身份、金额单位、什么时候提交，以及刷新后是否保留，需要应用明确决定。

学完你能：

- 用 Table 的列定义、记录和回调连接商品数组，排序后仍编辑正确商品。
- 让 Form 管理草稿，复用已有校验，把输入文本转换成业务数字。
- 用 Modal 完成打开、取消、保存与重开，验证键盘和焦点路径。
- 配置统一主题，处理空列表、损坏快照和保存失败，说明社区功能与收费扩展的边界。

短例子在 [examples/c38](https://github.com/socoo123/js_web/tree/main/examples/c38)，完整应用在 [阶段 5](https://github.com/socoo123/js_web/tree/main/examples/inventory/05-antd)。仍用六种商品，初始总库存 52 件、价值 26348.00 元。

## Java 程序员先看这里

| Java 经验 | 本课对应 | 差异 |
| --- | --- | --- |
| JTable 的模型与列配置 | `dataSource` 与 `columns` | 渲染函数收到当前记录，事件按业务 id 返回 |
| 编辑 DTO 与实体分开 | Form 草稿与商品数组 | 输入变化先留在表单，提交通过后才更新商品 |
| Bean Validation 的字段约束 | `Form.Item rules` 加业务校验函数 | 浏览器校验改善交互，未来接后端仍需服务端校验 |
| Dialog 的打开和关闭 | `open` 与组件生命周期 | 关闭可以只隐藏，草稿是否保留由状态位置决定 |
| 统一皮肤配置 | ConfigProvider 与 token | React Context 可以传到 Portal 中，局部 CSS 继承另看 DOM 位置 |

## 1. 接入组件库，先保留业务模块

阶段 5 新建一个独立的 Vite + React 示例工程，从阶段 4 复用 `product-form.js`、`products-reducer.js`、`product-state.js` 和 `inventory-storage.js`。它们负责字段、更新、筛选和快照，界面层换成 Ant Design。

先运行完整参考，再拆开看。在仓库根目录执行：

```sh
cd examples/inventory/05-antd
npm ci
npm run dev -- --host 127.0.0.1
```

终端会给出地址，通常是 `http://127.0.0.1:5173/js_web/`。预期看到六行商品、搜索和分类筛选、初始统计，以及新增、快照和主题按钮。

这里已有 `package-lock.json`，所以用 `npm ci`。自己给已有 React 项目加库时，在该项目目录执行 `npm install antd@6`；同时更新清单与锁文件。[官方 Vite 指南](https://ant.design/docs/react/use-with-vite/)也是通过 npm 包接入组件。网站根目录的依赖与阶段 5 分开维护。

入口 `src/main.jsx` 仍用熟悉的 React 结构：

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
```

App 呈现页面，`styles.css` 管应用布局和焦点样式，库提供组件样式。

商品数组与纯函数、界面适配、库控件各有职责。类似 Java 中给既有服务接新界面，事件继续调用原业务入口。

## 2. Table：字段用于显示，记录用于操作

[Table](https://ant.design/components/table/) 接受记录数组 `dataSource`，列配置 `columns` 决定每个单元格怎样显示。`dataIndex` 选字段；`render(value, record)` 可以同时拿到字段值和整条记录。阶段 5 的 `ProductTable.jsx` 中，关键列如下：

```jsx
  const columns = [
    { title: "编号", dataIndex: "id", width: 90 },
    { title: "商品", dataIndex: "name", width: 190 },
    { title: "分类", dataIndex: "category", width: 100 },
    { title: "库存", dataIndex: "stock", width: 100, sorter: (a, b) => a.stock - b.stock },
    { title: "价格（元）", dataIndex: "priceCents", width: 130,
      sorter: (a, b) => a.priceCents - b.priceCents, render: (cents) => formatPriceCents(cents) },
    { title: "标签", dataIndex: "tags", width: 150,
      render: (tags) => tags.length ? tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : "—" },
    { title: "操作", key: "actions", width: 250, render: (_value, record) => <Space>
      <Button aria-label={`编辑${record.name}`} onClick={() => onEdit(record.id)}>编辑</Button>
      <Button aria-label={`补货${record.name}`} onClick={() => onRestock(record.id)}>补货</Button>
      <Button danger aria-label={`删除${record.name}`} onClick={() => onRemove(record.id)}>删除</Button>
    </Space> },
  ];
  return <Table rowKey="id" columns={columns} dataSource={products} pagination={false}
    scroll={{ x: 1110 }} locale={{ emptyText: <Empty description="没有符合条件的商品" /> }} />;
```

这是函数体片段，所需组件和 `formatPriceCents` 已在完整文件导入。点库存表头会按数字排序；点鼠标的编辑按钮，回调收到 `P002`。`rowKey="id"` 让行有稳定身份，按钮也传同一个 id；两处一起保持身份，显示行号无需参与保存。

价格列保留整数分，用数值相减排序，在 `render` 才格式化成元。操作列没有 `dataIndex`，第一个参数不是业务主键，所以用第二个参数 `record`。

**先猜一猜：** 鼠标按库存升序排到第一行后，编辑回调和价格排序依据分别是什么类型？在 `examples/c38` 运行 `node table-contract.js`。

```js title="table-contract.js"
import { products } from "../shared/products.js";
const visible = products.toSorted((a, b) => a.stock - b.stock);
const firstRecord = visible[0];
console.log("编辑回调", firstRecord.id);
console.log("单元格值", firstRecord.stock, typeof firstRecord.stock);
console.log("价格显示", (firstRecord.priceCents / 100).toFixed(2));
console.log("排序依据", firstRecord.priceCents, typeof firstRecord.priceCents);
```

```text
编辑回调 P002
单元格值 0 number
价格显示 129.00
排序依据 12900 number
```

显示 `129.00` 是字符串，原金额仍为数字 12900。Java 的 TableModel 也会区分列值与单元格渲染结果；把显示文本塞回模型，再排序或计算，就丢掉了业务语义。

筛选也有明确归属：App 持有搜索词和分类，通过阶段 4 的 `selectProducts` 派生可见商品；Table 负责当前六行的本地排序。总库存统计始终基于完整 `products`，搜索结果变空时显示“没有符合条件的商品”，统计仍反映整份库存。

本例对六行数据本地排序。接分页接口时，可把 `onChange` 映射成请求参数；本地排序只作用于已拿到的数据。

## 3. Form：只存草稿，提交时跨过输入边界

[Form](https://ant.design/components/form/) 管理字段值、校验结果和提交。它不拥有商品数组。打开弹窗时，从商品生成草稿；输入时改 Form；提交成功后，App 才更新商品。

**先猜一猜：** 把鼠标库存输入为 3，但尚未提交，商品对象里的库存是多少？在 `examples/c38` 运行 `node draft-boundary.js`。

```js title="draft-boundary.js"
import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";
const mouse = products.find((product) => product.id === "P002");
const draft = { ...toDraft(mouse), stock: "3", price: "129.00" };
console.log("表单草稿", draft.stock, typeof draft.stock);
console.log("尚未保存", mouse.stock);
const { value } = validateDraft(draft, mouse.tags);
console.log("保存数据", value.stock, typeof value.stock, value.priceCents);
console.log("原对象", mouse.stock);
```

```text
表单草稿 3 string
尚未保存 0
保存数据 3 number 12900
原对象 0
```

`validateDraft` 返回一个新的业务值，调用 reducer 才会写入新数组。它不改原商品，输入文本仍留在草稿。C03 的“转换、校验、计算、显示”在这里仍是同一条边界。

### 字段用 name 进入 Form

`ProductEditor.jsx` 中的库存、价格和标签字段是：

```jsx
      <Form.Item name="stock" label="库存数量" rules={[fieldRule("stock")] }>
        <Input inputMode="numeric" />
      </Form.Item>
      <Form.Item name="price" label="价格（元）" rules={[fieldRule("price")] }>
        <Input inputMode="decimal" />
      </Form.Item>
      <Form.Item name="featured" valuePropName="checked"><Checkbox>热销</Checkbox></Form.Item>
```

`name` 是提交对象的字段名，`label` 为控件提供名称。带 `name` 的 Form.Item 会接管子控件的值与变化事件，因此字段里无需再写一份 `useState`。Checkbox 的值在 `checked`，通过 `valuePropName` 告诉 Form 如何连接；文本框则采用默认的 `value`。

这里故意选择 Input 保存字符串。`inputMode` 只是移动端键盘提示，用户仍可能输入小数、负号或粘贴任意文本，业务校验负责判断。换成 InputNumber 时，要一起调整值模型和空值处理，不能把当前字符串校验原样接上。

### 规则复用已有函数

阶段 4 已经定义名称 1–40 字、库存整数范围、价格精度、有效分类等规则。适配文件 `form-adapter.js` 把同一规则转换成 Form 所需的 Promise 校验器：

```js
export function fieldRule(field, originalTags = []) {
  return {
    validator(_rule, value) {
      const baseline = { name: "新商品", category: "配件", stock: "0", price: "0.00", featured: false };
      const { errors } = validateDraft({ ...baseline, [field]: value ?? "" }, originalTags);
      return errors[field] ? Promise.reject(new Error(errors[field])) : Promise.resolve();
    },
  };
}
```

有效时 Promise 完成；无效时带错误信息拒绝，Form 把信息关联到当前字段。baseline 为其他字段提供有效值，本函数只取当前字段的错误，因此它适用于本项目这些相互独立的字段约束。比如校验库存时，不会被另一个尚未填好的名称干扰。

点保存会触发 `form.submit()`。Form 通过字段校验后调用 `onFinish(values)`；App 的 `commitDraft` 再对整份草稿调用 `validateDraft`，通过后执行 reducer。前者组织字段交互，后者得到业务值，提交入口一直有明确边界。

价格按文本拆出整数和小数部分，保存成整数分；`"299.01"` 对应 29901。空文本、负数与三位小数都会失败。热销复选框只增删“热销”标签，原有“新品”保留，这样一次编辑不会顺手擦掉未展示的业务信息。

## 4. Modal：把关闭、销毁和提交分开

[Modal](https://ant.design/components/modal/) 的 `open` 控制可见状态，`onCancel` 通知用户取消，`onOk` 通知点击确认。**确认按钮先提交表单，保存成功才关闭。** 否则校验失败时，用户连错误信息都看不到。

`ProductEditor.jsx` 的容器与表单入口如下：

```jsx
  return <Modal title={product.id ? `编辑 ${product.id} ${product.name}` : "新增商品"} open={open}
    onCancel={onCancel} onOk={() => form.submit()} okText="保存" cancelText="取消"
    okButtonProps={{ "aria-label": "保存" }} cancelButtonProps={{ "aria-label": "取消" }}
    mask={{ closable: false }} focusable={{ trap: true, focusTriggerAfterClose: true }} destroyOnHidden
    modalRender={(node) => <div onKeyDown={cycleDialogFocus}>{node}</div>}
    afterOpenChange={(visible) => { if (visible) nameInput.current?.focus(); }} afterClose={afterClose}>
    <p>保存后更新当前页面；取消或按 Esc 丢弃本次草稿。</p>
    {error && <Alert type="error" title={error} showIcon />}
    <Form name="product-editor" form={form} layout="vertical" preserve={false}
      initialValues={toDraft(product)} onFinish={finish} scrollToFirstError={{ focus: true }}>
```

打开鼠标时标题是“编辑 P002 无线鼠标”，库存为 0。打开动画结束后名称框获得焦点；提交空库存，字段提示“请输入 0–99999 的整数库存。”，焦点移到库存框，弹窗继续显示。填 3 保存后，列表变成总库存 55 件、总价值 26735.00 元。

这里有三层生命周期，分别看：

1. `open=false` 启动关闭，保留内容完成退出动画。
2. `destroyOnHidden` 在隐藏后卸载弹窗内容，`preserve={false}` 让 Form 字段移除时不保留字段值。
3. App 在 `afterClose` 中清掉 `editor`，整个 ProductEditor 和它内部的 `Form.useForm()` 实例一起卸载。下次打开再从商品创建草稿。

第三步落实了“每次编辑是新会话”，也避免外层仍存活的表单实例接着用旧草稿。`initialValues` 是表单初始化值，适合这里的新实例；需要保留同一表单实例并主动装载另一条记录时，使用 `setFieldsValue` 或相应重置策略，同时处理错误和触碰状态。

取消和 Esc 只关闭编辑会话，商品数组不变。保存调用 `commitDraft`，用当前商品的原标签做校验，再由 `productsReducer` 按 id 生成新数组；新增则通过 `nextProductId` 生成编号。组件内的临时错误单独显示，编号用完等异常会留在弹窗中供用户处理。

### 焦点要和数据一起验收

`focusable.trap` 配置焦点限制，关闭后返回触发元素；本例还在 `modalRender` 的包装层处理 Tab 首尾循环，避免浏览器把焦点移到地址栏，完整函数在 `cycle-dialog-focus.js`。输入框 ref 用于初始焦点。排序和保存期间，Table 的稳定行 key 帮助保留编辑按钮身份，关闭后仍能回到它。

`scrollToFirstError={{ focus: true }}` 负责字段校验失败时的焦点。它需要字段 id/ref 能到达真实控件，本例直接使用库的 Input 和 Select；以后包装自己的输入组件时，要传递这些连接信息。看见红字和键盘能到达红字对应的字段，是两项都要检查的结果。

:::tip[自己尝试 · 本地 React]
1. 在阶段 5 启动页面，点库存表头升序，用 Tab 找到无线鼠标的编辑按钮，按 Enter。
2. 把库存填成 8，按 Esc。重新打开鼠标，检查库存；再清空库存点保存。
3. 输入 3 保存，确认统计和关闭后的焦点。点“保存本地快照”，刷新页面。
4. 搜索“不存在”，再清空筛选；切换深色主题并重开弹窗。

预期：取消后仍为 0；空库存保留弹窗并聚焦字段；保存后是 55 件、26735.00 元，焦点返回鼠标的编辑按钮；保存快照后刷新保留 3。搜索无结果时显示空态，深色弹窗的字段和文字与主题一致。
:::

商品提交和本地快照是两个事件：前者改当前内存数组，后者把版本化 JSON 写到 localStorage。快照沿用阶段 4 的键与格式，同一 origin 下可以交换数据。存储里的合法空数组表示删光商品；损坏数据则提示恢复初始商品并保留原记录，用户可以显式清除。

写入失败时，页面显示“保存本地快照失败”，当前内存数据继续存在。组件库负责显示 Alert，读取、校验、捕获存储异常和恢复策略仍在业务代码中。整个应用依靠浏览器本地数据，部署静态文件就能运行。

## 5. 主题贯穿弹窗，功能范围按具体包判断

App 使用 [ConfigProvider](https://ant.design/components/config-provider/) 包住表格与弹窗，主题入口是：

```jsx
  return <ConfigProvider locale={zhCN} theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: { colorPrimary: "#1677ff", borderRadius: 6 } }}>
```

切换深色后，Table、Form、Modal 的背景与文字一起变化；应用自己绘制的 main 背景也跟随 `dark`。token 是语义化主题输入，algorithm 计算成套深浅配色，[主题指南](https://ant.design/docs/react/customize-theme/)给出了组合方式。

Modal 默认挂到 body。它仍处于这棵 React 树里，能收到 ConfigProvider 的 Context；只写 `.inventory-page .ant-modal` 则可能匹配不到，因为 CSS 选择器看 DOM 父子关系。这里使用声明式 `<Modal>`，主题沿组件树传递。

窄屏时表格列保持可读宽度，在表格内部横向滚动；页面本身可以换行，按钮和弹窗仍可到达。

### 换库时比较对应能力

| 本例需求 | Ant Design 路径 | MUI 的对应方向 |
| --- | --- | --- |
| 小数据表格、排序 | `antd` 的 Table | Material UI Table；也可按需评估 MUI X Data Grid |
| 编辑与校验 | Form + Modal | Dialog + 输入控件，表单状态和规则另外组织 |
| 统一主题 | ConfigProvider + token | ThemeProvider + theme |
| 功能与许可 | 本例所用 `antd` 控件在 MIT 包内 | Material UI 和 MUI X Community 属于 MIT 范围；Pro/Premium 按功能另看商业许可 |

根据 [MUI X 许可页](https://mui.com/x/introduction/licensing/)检查具体功能档位；“支持表格”并不意味着高级分组、导出或其他扩展都在同一范围。Ant Design 的 Table、Form、Modal 已覆盖本例目标，业务没有依赖额外收费扩展。

## 常见错误与调试

### 打开鼠标，库存却是刚才键盘的草稿

**现象**：在阶段 5 开发服务下打开 `/js_web/labs/lifecycle.html?case=broken`。编辑机械键盘，把库存改成 8，按 Esc，再编辑无线鼠标。标题是鼠标，库存却还是 8。

**工具**：打开 React DevTools → Components，搜索 `PersistentEditor`，查看 `product` 和 `open`；再展开 Form 的 props，检查 `initialValues`。同时在 Elements 中选中库存 input，在 Console 读 `$0.value`。

**证据**：`product.id` 为 `P002`、`product.stock` 为数字 0，`initialValues.stock` 是字符串 `"0"`，真实输入框的值却为 `"8"`。错误组件一直挂着，它的表单主体是：

```jsx
    <Form name="persistent-editor" initialValues={toDraft(product)} layout="vertical">
      <Form.Item name="stock" label="库存数量"><Input /></Form.Item>
    </Form>
```

**原因**：商品 props 变了，表单实例与草稿还在。`initialValues` 初始化表单，后续传入的新对象不会自动覆盖已编辑的字段。Java 中重新选中实体，也不会自动替你清空另一个编辑缓冲区。

**修复**：采用 `ProductEditor.jsx` 的新会话策略：App 在关闭动画结束后移除编辑器，下次重新挂载；内部使用 `destroyOnHidden` 和 `Form preserve={false}`。正确参考地址是同一路径加 `?case=fixed`。

**确认**：重复“键盘改 8 → Esc → 鼠标”，库存显示 0；再取消并重开同一商品也从商品值开始。阶段 5 运行 `npm run test:e2e`，其中的草稿回归会同时检查错误起点确实显示 8、正确参考显示 0。

## 练习

### 练习 1：草稿提交后，哪些值发生变化

在 `examples/c38` 运行 `node prediction.js` 前写出四行输出，解释最后两行为什么成立。

```js title="prediction.js"
import { products } from "../shared/products.js";
import { toDraft } from "../inventory/04-react/src/product-form.js";
import { commitDraft } from "../inventory/05-antd/src/form-adapter.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";
const mouse = products.find((p) => p.id === "P002");
const { value } = commitDraft(products, mouse.id, { ...toDraft(mouse), stock: "3" });
const updated = productsReducer(products, { type: "saved", id: mouse.id, changes: value });
console.log(updated.reduce((sum, p) => sum + p.stock, 0));
console.log(updated.reduce((sum, p) => sum + p.stock * p.priceCents, 0));
console.log(mouse.stock);
console.log(commitDraft(products, mouse.id, { ...toDraft(mouse), stock: "" }).value);
```

<details>
<summary>提示</summary>

鼠标每件 12900 分，原库存 0。reducer 返回新数组；空字符串在转换之前就应该被判为无效库存。

</details>

<details>
<summary>参考答案</summary>

依次是 55、2673500、0、null。总库存增加 3，总价值增加 38700 分；原商品对象没有被修改。第二份草稿的库存为空，校验失败，因此没有可保存的业务值。表单采用什么外观，都应该维持这四个结果。

</details>

### 练习 2：修复重开时的旧草稿

从 `labs/PersistentEditor.jsx` 和 `labs/lifecycle-main.jsx` 的错误分支开始改，按调试步骤建立新编辑会话。验收：键盘改 8 后取消，重开键盘是 12；再打开鼠标是 0；关闭动画完整，焦点回到触发按钮。

<details>
<summary>提示</summary>

先找到 Form 实例由哪个组件创建，再决定关闭后销毁谁。只改标题或更新商品 props，不会替代清理草稿。

</details>

<details>
<summary>参考答案</summary>

实验的正确分支只在 `product` 存在时渲染 ProductEditor，`afterClose` 把 product 设成 null，下一次打开重新创建实例。内部 Form 用商品生成 initialValues。这样取消只丢弃草稿，商品数组保持原值；保留实例的设计则需要主动装载字段，并明确错误是否重置。

</details>

### 练习 3：验收扩展坞的完整字段与失败恢复

在阶段 5 编辑 P004：名称首尾加空格、库存改 0、价格先填 `299.001` 再改 `299.01`、分类选音频、取消热销。验收：三位小数不能保存；成功后名称去掉空格，价格为 29901 分，保留“新品”。再检查损坏快照的提示和恢复按钮。

<details>
<summary>提示</summary>

价格入口是字符串，标签应从原数组增删指定项。检查快照时在 DevTools → Application → Local Storage 找到 `js_web:inventory:products:v1`，先保存原值，再把它改成 `broken-json` 后刷新。

</details>

<details>
<summary>参考答案</summary>

字段校验复用 `validateDraft`，提交结果的名称经过 trim，价格拆成整数分，标签仅移除“热销”。坏 JSON 会被读取逻辑捕获，页面使用六种初始商品并保留原记录；点“清除快照并恢复初始商品”才删除它。Vitest 覆盖字段与数据规则，浏览器回归覆盖全字段操作、错误焦点及恢复路径。

</details>

## 项目进度

从阶段 `04-react/` 的业务模块开始，在 `05-antd/` 建立组件库版。新增 `App.jsx` 连接筛选、商品、统计和快照；`ProductTable.jsx` 负责列与事件；`ProductEditor.jsx` 负责编辑会话；`form-adapter.js` 连接库与业务校验。完整文件已放在阶段目录，正文展示的是连接处的改动。

在 `examples/inventory/05-antd` 执行：

```sh
npm test
npm run test:e2e
npm run build
npm run preview -- --host 127.0.0.1
```

首次运行浏览器测试前，在同一目录执行 `npx playwright install chrome`，或使用本机已有 Chrome。开发服务支持 `labs` 实验；生产构建输出应用首页到本目录 `dist/`，预览通常为 `http://127.0.0.1:4173/js_web/`，资源仍带 `/js_web/` 子路径。

验收：六种初始商品参考值不变；排序后编辑、创建、补货、删除、筛选空态、完整字段校验、取消草稿、键盘焦点和快照恢复都能工作。阶段 4 继续保存 React 路由、请求和排错实验，业务规则继续共用。

## 小结

- Table 的列决定呈现，记录 id 贯穿编辑回调与保存，显示字符串留在渲染阶段。
- Form 拥有草稿，业务函数拥有字段规则，提交通过后才更新商品。
- Modal 的可见状态与表单实例是两件事，取消重开需要明确的会话生命周期。
- 错误信息、焦点、空态、存储失败和深色浮层，都是组件接入后的实际验收项。
- 主题用公开配置，功能和许可按具体包及档位核对。

自测：

1. `render(value, record)` 的两个参数，哪个应该用于编辑操作？
2. 为什么库存 Input 写了 `inputMode="numeric"`，仍然需要业务校验？
3. 关闭弹窗后，怎样判断下次打开会不会保留旧草稿？
4. 鼠标库存改成 3，什么时候会更新统计，什么时候刷新后才会保留？
5. 为什么弹窗能收到 ConfigProvider，却可能匹配不到页面内部的 CSS 选择器？

下一课进入 SAP Fiori 与 UI5 家族，分清经典 UI5、Web Components 和 React 包装库的关系。

## 延伸阅读

- [Ant Design：Table 的数据、列与行身份](https://ant.design/components/table/)
- [Ant Design：Form 字段、校验与初始化](https://ant.design/components/form/)
- [Ant Design：Modal 生命周期与焦点](https://ant.design/components/modal/)
- [Ant Design：主题配置](https://ant.design/docs/react/customize-theme/)
- [React：保留与重置状态](https://react.dev/learn/preserving-and-resetting-state)
- [MUI X：功能档位与许可](https://mui.com/x/introduction/licensing/)
