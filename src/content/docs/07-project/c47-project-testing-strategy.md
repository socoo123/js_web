---
title: C47 综合项目与测试选择
description: 按业务风险为库存项目选择 UT、RTL 集成与浏览器冒烟，补齐保存恢复、错误数据、键盘和窄屏验收。
sidebar:
  order: 47
---

> **第 4 周 · 第 24 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C35、C36、C45、C46 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

库存应用能构建，原来的测试也通过了。你准备交付，同事却问：“保存失败会不会毁掉上一次快照？接口返回 200，但里面是另一件商品怎么办？不用鼠标还能编辑吗？”

你需要先写出失败的后果，再选择能观察这个后果的测试。

继续 `examples/inventory/04-react/`，补齐商品操作、表单、详情与快照连接处的回归。

学完你能：

- 把“测试一下库存应用”写成带输入、操作和验收条件的测试计划。
- 区分 Vitest 运行器、RTL 组件测试工具和 Playwright 浏览器回归的职责。
- 用五个有明确风险的用例补齐数据、表单、请求与静态产物检查。
- 从失败信息定位真实问题，并完成键盘、窄屏和损坏快照的验收。

固定输出在 [examples/c47](https://github.com/socoo123/js_web/tree/main/examples/c47)，完整回归在阶段 4 的 `tests/final-core.test.jsx`、`tests/final-workflows.test.jsx` 和 `e2e/pages.spec.js`。先在阶段目录执行 `npm ci`；下面的 npm 命令都在该目录运行，Node 小例子另写目录。

## Java 程序员先看这里

| Java 经验 | 前端对应 | 差异 |
| --- | --- | --- |
| JUnit 运行测试与断言 | Vitest；旧工程也常见 Jest | 运行器不决定你测的是函数还是整个组件流程 |
| 测 Service 输入与结果 | 测解析函数、reducer、快照边界 | 可在 Node 运行，反馈快、容易覆盖边界 |
| 多个真实对象一起测试 | RTL 渲染组件并模拟用户操作 | 观察 DOM、焦点与错误信息，保留实际业务函数 |
| Selenium 浏览器流程 | Playwright 浏览器回归 | 同时经过构建产物、资源路径、浏览器与路由 |
| 模拟远程依赖 | 在 fetch 或加载函数边界提供替身 | 替身返回什么，决定哪些真实逻辑被测到 |

## 1. 从失败后果开始写测试计划

先问“错了会损失什么”，再问“在哪一层最容易发现”。库存错一件、旧快照丢失、无法用键盘保存，都比某个组件内部渲染了几次更值得作为交付条件。

**先猜一猜：** 商品库存误变成字符串 `"0"`。保存时抛错，原来的好快照还会保留吗？在 `examples/c47` 运行：

```js title="snapshot-boundary.js"
import { products } from "../shared/products.js";
import { writeInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const original = JSON.stringify({ version: 1, products });
let saved = original;
const storage = { setItem(key, value) { saved = value; } };
const invalid = products.map((product) => product.id === "P002"
  ? { ...product, stock: "0" } : product);
try {
  writeInventorySnapshot(storage, invalid);
} catch (error) {
  console.log(error.message);
}
console.log("旧快照保留", saved === original);
```

```text
库存商品字段无效
旧快照保留 true
```

存储替身只实现写入，真实函数先校验待保存内容，失败时不写。先覆盖再抛错，也能满足只检查异常的测试，所以还要检查旧记录。

Java 里也是先验证命令，再提交持久化更新。区别是浏览器快照通过 Web Storage 保存，具体读写权限和刷新恢复还要在浏览器中检查。

本课的计划可以直接作为你自己的起点：

| 失败风险 | 输入与操作 | 最小合适层级 | 通过条件 |
| --- | --- | --- | --- |
| 非法记录覆盖好快照 | 已有合法快照，写入库存 `"0"` | Vitest 函数 UT | 报错且旧字符串逐字保留 |
| 售罄或删除结果恢复错 | P002 改价为 29 分，删除其他商品，再恢复 | Vitest 业务集成 | 只剩 P002，库存 0、单价 29 |
| 表单与快照脱节 | 非法价格修正后保存，再保存快照并重挂载 | RTL 集成 | 错误聚焦；卡片、统计与恢复值一致 |
| HTTP 成功但商品错误 | 请求 P002，先返回 P001，再重试返回 P002 | RTL 请求集成 | 错数据不展示；重试恢复正确商品 |
| 交付后输入或导航失效 | 键盘搜索、编辑、保存、刷新、详情、返回 | Playwright 冒烟 | 搜索词完整；焦点、数据和 URL 一致 |

前四行放在反馈更快的测试里；最后一行经过真实键盘与刷新。原有边界、请求竞态和静态 404 回归继续保留。

第二行连接 reducer 与快照解析，范围是业务集成。RTL 也由 Vitest 驱动。

## 2. 核心规则先在 Node 测，断言业务结果

纯函数与 reducer 先测输入、返回值和旧数据。需要跨越保存与恢复时，再把真实模块接起来。下面的小例子演示第二种范围，在 `examples/c47` 运行。

**先猜一猜：** 鼠标从 0 件改成 3 件，单价改成 0.29 元，序列化再恢复后，总库存和总价值是多少？原始样例会跟着变吗？

```js title="reducer-roundtrip.js"
import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";
import { parseInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const edited = productsReducer(products, { type: "saved", id: "P002",
  changes: { ...products[1], stock: 3, priceCents: 29 } });
const restored = parseInventorySnapshot(JSON.stringify({ version: 1, products: edited }));
console.log("恢复鼠标", restored[1].stock, restored[1].priceCents);
console.log("总库存", restored.reduce((sum, product) => sum + product.stock, 0));
console.log("总价值分", restored.reduce((sum, product) => sum + product.stock * product.priceCents, 0));
console.log("起点鼠标", products[1].stock, products[1].priceCents);
```

```text
恢复鼠标 3 29
总库存 55
总价值分 2634887
起点鼠标 0 12900
```

固定起点是 52 件、2,634,800 分。P002 原来库存为 0，改成 3 件、每件 29 分，只增加 87 分，因此结果为 55 件、2,634,887 分。直接写这个独立算出的期望值，能发现项目计算与业务要求不一致。

用同一生产函数算 `expected` 再比较，两边可能一起错。Java 单测也应使用来自需求的期望值。

`final-core.test.jsx` 的第一条正式回归把“旧快照保留”落成断言。以下是测试体，导入在完整文件中：

```js
const original = JSON.stringify({ version: 1, products });
const records = new Map([[INVENTORY_STORAGE_KEY, original]]);
const storage = { setItem: (key, raw) => records.set(key, raw) };
const invalid = products.map((product) => product.id === "P002"
  ? { ...product, stock: "0" } : product);
expect(() => writeInventorySnapshot(storage, invalid)).toThrow("库存商品字段无效");
expect(records.get(INVENTORY_STORAGE_KEY)).toBe(original);
```

结果应为通过；它同时限制异常和副作用。第二条回归用真实 `saved`、`removed` action 与解析函数，要求保存后只恢复 P002，库存仍为 0，价格为 29 分。原来的 `tests/reducer.test.jsx` 继续检查不可变更新、未知 action、库存上限与编号边界。

:::tip[自己尝试 · Node]
1. 在 `examples/c47` 运行 `node snapshot-boundary.js`、`node reducer-roundtrip.js`。
2. 切到 `examples/inventory/04-react`，运行 `npm test -- tests/final-core.test.jsx`。
3. 阅读两条回归，把各自的输入、动作和业务期望圈出来。

预期：两个固定输出与正文一致，两条回归通过。第一条即使收到了异常，也必须继续确认旧快照没有被替换。
:::

## 3. RTL 测用户操作，保留真实表单与请求校验

组件集成测试从可访问名称找到控件，模拟操作，再检查可见结果。保存后的 state 形状属于实现细节；商品卡片、金额、错误说明和焦点才是用户能观察到的行为。

`tests/final-workflows.test.jsx` 使用 happy-dom，先导入 `rtl-support.jsx` 完成断言扩展与清理。第一条用例渲染真实 App，下面摘出非法价格这一段：

```jsx
const user = userEvent.setup();
const first = renderApp();
const mouse = () => screen.getByRole("article", { name: "无线鼠标" });
await user.click(within(mouse()).getByRole("button", { name: "编辑" }));
const price = screen.getByRole("textbox", { name: "单价（元，必填）" });
await user.clear(price);
await user.type(price, "0.001");
await user.click(screen.getByRole("button", { name: "保存商品" }));
expect(price).toHaveFocus();
expect(price).toHaveAccessibleDescription(/最多两位小数/);
expect(mouse()).toHaveTextContent("¥129.00");
```

结果：保存失败，价格输入获得焦点，错误说明与输入关联，卡片仍为 129.00 元。只验证回调没调用，无法保证用户知道错在哪里。`within(mouse())` 把同名“编辑”按钮限制在鼠标卡片里。

完整用例接着把价格改为 `"0.29"`、库存改为 `"3"`，再次保存，检查卡片、55 件总库存和 26348.87 元总价值。然后点击“保存本地快照”，卸载 App 再重新渲染，要求这些值仍存在。DOM 环境中的重挂载验证初始化读取；浏览器刷新由下一节补上。

Java 里可以把这看作多个真实对象协作的集成测试。这里还要驱动 DOM 事件，并用 `await user...` 等待交互结束。[user-event](https://testing-library.com/docs/user-event/intro/) 模拟一次交互涉及的多个事件，比只手工派发一个 change 更贴近使用过程。

### 请求替身放在哪里，决定测到了什么

这次保留真实 `fetchProduct` 和响应校验，只替换最外面的 `fetch`。请求 P002 时，第一次给它一个 HTTP 200 的 P001；第二次再返回正确的 P002。以下是第二条回归的请求与断言部分：

```jsx
const fetchMock = vi.fn()
  .mockResolvedValueOnce(new Response(JSON.stringify(products[0])))
  .mockResolvedValueOnce(new Response(JSON.stringify(products[1])));
vi.stubGlobal("fetch", fetchMock);
render(<QueryClientProvider client={createTestClient()}>
  <CachedProductDetails productId="P002" loadProduct={fetchProduct} />
</QueryClientProvider>);
expect(await screen.findByRole("alert")).toHaveTextContent("商品数据格式不正确");
expect(screen.queryByRole("region", { name: "缓存商品详情" })).not.toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "重试详情" }));
expect(await screen.findByRole("region", { name: "缓存商品详情" })).toHaveTextContent("无线鼠标 · 外设 · 缓存库存 0 件");
expect(screen.queryByRole("alert")).not.toBeInTheDocument();
expect(fetchMock).toHaveBeenCalledTimes(2);
```

结果：先看到格式错误，没有错误商品的详情区域；点击重试后看到无线鼠标、库存 0，错误消失。HTTP 成功只说明响应状态成功，数据还必须通过编号、类型和字段规则检查。

测试客户端关闭自动重试，生产客户端保留既有规则；客户端按用例隔离并清理。直接让加载函数抛错能测失败界面，却会跳过响应解析与编号校验。

异步出现的元素用 [`findBy...`](https://testing-library.com/docs/dom-testing-library/api-async/) 等待；已经存在的用 `getBy...`；检查不存在用 `queryBy...`。每次异步交互和异步查询都要等待。Jest 在既有工程也能承担运行器职责，本项目继续用 Vitest，RTL 查询与行为断言的思路相同。

:::tip[自己尝试 · 本地 React]
在阶段 4 运行 `npm test -- tests/final-workflows.test.jsx`，然后打开该文件：

1. 找出非法价格提交前后的卡片金额检查。
2. 找到卸载和重新挂载，确认恢复检查读取的是真实快照。
3. 找到请求替身，确认第一次返回的是 P001，组件请求的却是 P002。

预期：两条回归通过；一次失败、一次人工重试总共调用 fetch 两次。替身没有替换 `readProductResponse`，所以编号校验仍在测试范围内。
:::

## 4. 浏览器冒烟串起最重要的一条交付路径

Playwright 用真实浏览器访问构建产物。沿用 C46 的严格静态服务器与 `/js_web/` 前缀，可以同时观察 JS 入口、hash 路由、键盘焦点和刷新恢复。

`e2e/pages.spec.js` 新增一条综合流程：按 `/` 聚焦搜索 → 连续输入“鼠标” → Tab 到该卡片的编辑按钮 → Enter 打开表单 → 修改库存与价格 → 保存 → 保存快照 → 刷新 → 详情 → 返回。

下面摘出输入和刷新后的验收；`tabTo` 用 Tab 逐个移动焦点，到达目标才继续：

```js
await page.keyboard.press("/");
const search = page.getByRole("textbox", { name: "搜索名称（按 / 聚焦）" });
await expect(search).toBeFocused();
await page.keyboard.type("鼠标");
await expect(search).toHaveValue("鼠标");
```

结果：搜索框完整保留两个字，列表只显示无线鼠标。接着完成保存与刷新，结果应为库存 3 件、单价 0.29 元、总库存 55 件；搜索词仍为“鼠标”。本地详情显示修改后的 3 件，下面的模拟远端副本仍为初始 0 件、129.00 元，两份数据按既有设计分别管理。

这里值得保留浏览器回归，是因为输入来自键盘、URL 更新由路由器调度、刷新又重新读取存储。把其中任意一部分替换掉，都可能漏掉连接处的问题。[Playwright 的页面断言](https://playwright.dev/docs/test-assertions)会在超时内重试直到条件满足；等待“库存变为 3”比固定睡两秒更直接。

Java 的 Service UT 也无法证明页面能操作。浏览器回归串起主流程，具体边界留给较小的测试。

:::tip[自己尝试 · 本地 React]
1. 阶段 4 执行 `npm run test:e2e:pages`。首次缺少浏览器时，按终端提示执行 `npx playwright install chromium` 后重跑。
2. 阅读 `e2e/pages.spec.js` 的第二条回归，找出搜索词、保存后焦点与刷新值的断言。
3. 若失败，打开终端给出的 error-context 文件；需要查看全过程时，用 `npx playwright show-trace` 加终端显示的 trace.zip 路径。

预期：先构建并检查产物，再通过两条浏览器回归。每条用例从独立浏览器上下文开始，本地快照不相互继承。
:::

## 5. 键盘、窄屏、恢复还要自己走一遍

自动断言能检查目标是否获得焦点，交付时还要亲自确认焦点看得清、阅读顺序合理、按钮不被遮挡。happy-dom 的组件测试不计算真实页面布局；360px 浏览器视口适合先找窄屏问题，真机输入法、软键盘和触控体验需要再用自己的手机检查。

在阶段 4 执行 `npm run build`、`npm run preview:pages`，打开 `http://127.0.0.1:4179/js_web/#/products`。在专用本地预览里操作，快照保存的是本机数据。

| 检查 | 操作 | 可观察的通过条件 |
| --- | --- | --- |
| 键盘 | 按 `/`，搜索鼠标；Tab/Shift+Tab、Enter 完成编辑；先把库存清空提交，再改为 3、价格 0.29 | 错误输入有说明和焦点；修正保存后焦点回到“库存管理”；卡片与统计一起更新 |
| 窄屏 | F12 → Toggle device toolbar，宽度 360；查看列表与展开的编辑表单 | 页面无整体横向滚动，文字、输入和保存按钮能读到、操作到；焦点轮廓可见 |
| 快照 | 保存本地快照；再改一次库存但不保存快照，刷新 | 恢复最后明确保存的值；未保存快照的改动被丢弃 |
| 损坏恢复 | 保存下面的坏记录，刷新，再点“清除本地快照”并刷新 | 提示原记录保留，先用 52 件初始库存；清除并刷新后仍为 52 件 |

损坏实验在这个本地应用的 Console 执行：

```js
localStorage.setItem("js_web:inventory:products:v1", "{");
```

结果：刷新后看到“本地库存无法读取”，Application → Local storage 中原值仍为 `{`。这是 [`localStorage`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage) 的同源记录；切换端口会换一份存储。清除按钮只处理这份库存快照。

手工记录写“环境、操作、实际结果、仍失败的项目”。和 Java 服务验收一样，记录来自实际操作。

## 常见错误与调试

### 错误 1：快照报错了，好数据却已经没了

**现象**：保存非法库存时出现异常，但刷新后旧商品无法恢复。

**工具**：在阶段 4 运行 `npm test -- tests/final-core.test.jsx`，打开首条失败的断言；在 `src/inventory-storage.js` 对比校验与 `storage.setItem` 的顺序。

**证据**：错误实现在 `parseInventorySnapshot(raw)` 前调用 `setItem`。即使之后抛异常，Map 中的旧值已经变成含字符串库存的坏 JSON；测试最后的字符串比较失败。

**原因**：异常只终止后续代码，已经执行的写入不会自动撤销。

**修复**：保留“序列化 → 校验 → 写入”的顺序，完整实现见 `writeInventorySnapshot`。

**确认**：重跑首条回归，既要收到错误，又要保留旧字符串；重新挂载时仍能恢复原始六件商品。这条规则适合函数 UT，无需启动浏览器。

### 错误 2：连续输入后搜索词少了一个字

**现象**：逐个连续输入“鼠标”，最后只剩“标”；填入整个字符串的测试却通过。

**工具**：运行 `npm run test:e2e:pages`，看 `toHaveValue("鼠标")` 的期望与实值；检查 `src/main.jsx` 的 HashRouter 和 `useCatalogFilters.js` 的 URL 数据来源。

**证据**：搜索框 `value` 直接来自 URL。路由器默认通过 transition 更新位置，输入后未同步提交新值，受控输入被旧值还原，后一个字接在了旧值上。

**原因**：文本输入需要同步更新它的受控值。React 的 [startTransition](https://react.dev/reference/react/startTransition) 文档明确说明，transition 更新不能用来控制文本输入。

**修复**：这个小型应用在入口使用当前 [HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter) 提供的同步更新选项：

```jsx
<HashRouter useTransitions={false}><App /></HashRouter>
```

搜索仍以 URL 为来源，导航同步提交；StrictMode 保留。大型搜索页可以把立即更新的输入草稿与延后计算的结果分开设计，本项目六条商品使用同步路由即可。

**确认**：保持连续键盘输入，要求两个字完整保留；编辑、保存快照、刷新、进入详情再返回后也保留“鼠标”。这条回归检查生产入口，补上组件环境中一次填入完整值时没有观察到的行为。

## 练习

### 练习 1：JSON 能解析，商品就有效吗

在 `examples/c47` 打开 `prediction.js`，预测三行输出后运行 `node prediction.js`。说明哪一步检查语法，哪一步检查业务。

<details>
<summary>提示</summary>

JSON 可以合法地保存字符串 `"0"`；商品规则要求库存为整数。空数组则表示商品都已删除，不属于损坏数据。

</details>

<details>
<summary>参考答案</summary>

依次输出 `JSON 中的库存类型 string`、`库存商品字段无效`、`空库存种类 0`。`JSON.parse` 只确认 JSON 语法，`parseInventorySnapshot` 再确认版本、编号和字段。空集合要按用户保存的状态恢复，否则删除全部商品后刷新会意外“复活”。

</details>

### 练习 2：修好“总是成功”的请求测试

起点是 `tests/final-workflows.test.jsx` 的第二条用例。假设有人把两次 fetch 响应都改成 P002，并删除错误界面的断言，测试依然全绿，却不再发现“错误商品也被展示”。恢复这条回归的风险覆盖。

验收：第一次响应状态为 200、内容为 P001；先看到格式错误且无详情，点击重试后才出现 P002；总共请求两次。记录你保留了哪些真实模块。

<details>
<summary>提示</summary>

继续让组件调用 `fetchProduct`，只在 fetch 边界准备两个 `Response`。错误商品与请求编号不一致，必须经过真实响应校验才能被拒绝。

</details>

<details>
<summary>参考答案</summary>

第 3 节给出了对应片段：第一次返回 `products[0]`，第二次返回 `products[1]`，恢复失败、无详情、点击重试和成功的断言。独立测试客户端关闭自动重试，使两次读取分别对应首读和用户重试。

真实执行的是组件、Query 查询、`fetchProduct` 和 `readProductResponse`；fetch 是替身。这条测试证明当前界面与数据校验接线正确，静态文件地址和真实浏览器行为由产物回归负责。

</details>

### 练习 3：交出自己的风险计划

从第 1 节表格选出你最担心的三项，或换成同样具体的库存风险。每项写“失败后果、输入、操作、层级、通过条件、文件位置”。先检查现有测试，已有覆盖的引用对应文件，缺少的再补。

至少运行一条核心回归、一条 RTL 回归和一次浏览器冒烟，并按第 5 节检查键盘、窄屏与快照恢复。验收记录要能让同事按步骤重复。

<details>
<summary>提示</summary>

“表单正常”不够具体。可以改成“空库存阻止保存并聚焦库存框，改成 0 后保存成功”。风险越具体，越容易判断是否已经覆盖、应该在哪一层覆盖。

</details>

<details>
<summary>参考答案</summary>

一份可交付的选择是：非法数据不能覆盖旧快照（`final-core.test.jsx`）；错误商品响应要失败且可重试（`final-workflows.test.jsx`）；键盘编辑后刷新恢复（`pages.spec.js`）。

手工补上 360px 下展开表单、错误焦点、保存按钮可达和坏快照清除，写出看到的实际值。不要用测试数量代替通过条件；修复一个 bug 后，优先留下最能直接捕获它的回归。

</details>

## 项目进度

继续 `examples/inventory/04-react/`：新增两个 final 测试文件，在已有 `e2e/pages.spec.js` 补键盘主流程；`src/main.jsx` 让 HashRouter 同步更新，修复连续搜索输入丢字。其余商品能力使用已有实现。

在阶段目录运行：

```sh
npm run lint
npm test
npm run test:e2e:pages
```

预期：核心与组件回归通过，严格静态产物上的两条浏览器回归通过。恢复初始数据后仍为 6 种、52 件、26348.00 元；按本课编辑并保存快照后为 55 件、26348.87 元。课内新增五条回归，完整文件同时是测试计划的可执行部分。

保存风险表、自动回归结果和手工检查记录。

## 小结

- 按失败后果选测试，使用能观察这个后果的最小范围。
- 核心 UT 检查规则与副作用；业务集成检查模块连接和恢复结果。
- RTL 驱动真实组件与业务逻辑，在外部边界替换请求，等待可见结果。
- 浏览器冒烟覆盖生产入口、连续键盘输入、URL、快照和刷新。
- 键盘、窄屏与损坏恢复要留下可重复的操作记录。

自测：

1. 为什么“抛出了异常”仍不足以证明旧快照安全？
2. 用 Vitest 跑的回归，为什么既可能是 UT，也可能是集成测试？
3. HTTP 200 返回 P001 时，请求 P002 的组件应该显示什么？
4. 为什么一次 fill 整个字符串，可能漏掉连续键盘输入的问题？
5. DOM 模拟环境、360px 浏览器视口和真机，各自能帮你发现什么？

下一课回顾整条学习路线，检查核心机制，并为自己的下一阶段安排补缺任务。

## 延伸阅读

- [Vitest：开始使用与运行测试](https://vitest.dev/guide/)
- [Testing Library：React 组件行为测试](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library：异步查询与等待](https://testing-library.com/docs/dom-testing-library/api-async/)
- [Playwright：隔离、可见行为与测试实践](https://playwright.dev/docs/best-practices)
- [React：startTransition 与受控输入](https://react.dev/reference/react/startTransition)
- [React Router：HashRouter 与 useTransitions](https://reactrouter.com/api/declarative-routers/HashRouter)
