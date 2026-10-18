---
title: C35 React UT、集成测试与 E2E 地图
description: 用角色查询和用户行为验证表单、创建商品与失败重试，分清 UT、集成测试和 E2E。
sidebar:
  order: 35
---

> **第 3 周 · 第 18 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C20、C25、C30–C34 · 运行：Node 24、本地 React · 示例已运行验证

## 这一课解决什么问题

你改好了商品表单。手动试过输入 3、点击保存，列表也变了。但第二天有人清空库存框，点保存，空输入被悄悄存成 0；另一个同事改了请求错误页，「重试」按钮还在，点下去却没有重新请求。

如果测试只检查 reducer 返回了什么，它发现不了按钮接错回调。如果测试只保存整页 HTML，快照里出现了按钮，也说明不了按钮是否能用。

本课把「用户做了什么，最后看到了什么」写成可重复运行的程序。沿用阶段 4 的真实组件，不另搭一套测试专用业务。

学完你能：

- 分清测试运行器、DOM 环境、组件测试库与浏览器自动化各自的职责
- 用角色和可访问名称找到输入框、商品卡片与按钮
- 写出空库存校验、合法的 0、创建后更新统计的行为测试
- 控制请求失败与成功，验证用户重试以及卸载清理
- 给跨页关键路径留一条 E2E，把业务分支留在更容易定位的层级

源码在 [examples/c35](https://github.com/socoo123/js_web/tree/main/examples/c35)，组件测试与 E2E 在 [阶段 4](https://github.com/socoo123/js_web/tree/main/examples/inventory/04-react)。

## Java 程序员先看这里

| Java 经验 | 前端对应 | 差异 |
| --- | --- | --- |
| JUnit 发现用例并报告失败 | Vitest | 执行 JS 测试；React 的 DOM 环境另外提供 |
| Mockito 替换外部依赖 | `vi.fn()`、`vi.spyOn()` | 可以直接把函数作为 prop 注入，控制 Promise 的结果 |
| 测方法返回值 | 测用户能观察的界面 | 输入、点击、错误提示、焦点都是组件的外部行为 |
| 集成测试连接几层业务代码 | RTL 挂载真实组件树 | 可以让表单、Context、reducer 与统计一起工作 |
| Selenium 跑浏览器 | Playwright | 从构建产物进入，连资源、路由和真实浏览器行为一起检查 |

## 1. 先选层级，再选工具

**一次测试应该放在能发现目标问题、又容易解释失败的最小范围。** 库存转换错了，直接测纯函数；按钮连错了，挂载组件；详情刷新变成 404，就打开真实浏览器。

| 要防的故障 | 选择 | 为什么 |
| --- | --- | --- |
| 空文本变成 0、价格分数算错 | Vitest 纯函数 UT | 输入输出明确，边界数据便宜 |
| 表单错误没有显示、提交了非法值 | RTL 组件测试 | 要经过输入、提交和渲染 |
| 新建后卡片变了，统计没变 | RTL 集成测试 | 需要真实组件、Context 和 reducer 协作 |
| 失败后点重试仍停在错误页 | RTL 集成测试 + 可控加载函数 | 覆盖请求状态到按钮再到结果 |
| 子路径资源、详情刷新、返回筛选出错 | Playwright E2E 冒烟 | 要经过实际构建、URL 与浏览器 |

UT 是单元测试。组件测试也可以是 UT，例如只测一个 ProductForm 的输入和回调；挂载完整 App，把多个组件与业务更新连在一起，更适合叫集成测试。测试层级由范围决定，文件后缀和库名决定不了它。

先运行纯函数例子，确认最底层的合同：

```js title="boundary.js"
import { parseStock, parsePriceCents } from "../inventory/04-react/src/product-form.js";

console.log(parseStock(""));
console.log(parseStock("0"));
console.log(parseStock("3.5"));
console.log(parsePriceCents("0.29"));
```

依次输出 `null`、`0`、`null`、`29`。空白与合法的 0 被分开，金额按整数分保存。这是 C25 已经建立的规则，后面的组件测试继续保护它。

### 把测试工具放对位置

[Vitest](https://vitest.dev/guide/environment.html) 负责发现测试、运行断言、提供 mock 并汇总结果；React Testing Library，简称 RTL，负责把 React 组件挂到 DOM，提供查询和清理；user-event 描述输入、点击等交互；jest-dom 扩充 DOM 断言。jest-dom 名称里有 Jest，也能通过专门入口接入 Vitest。

本项目沿用 happy-dom：在 Node 进程里提供 document、input 等 DOM API。它适合大多数表单与状态行为，真实布局、CSS 呈现和浏览器特有交互交给浏览器检查。Java 里替换了 Web 容器的测试环境，同样需要清楚自己正在测到哪一层。

若从 C34 的依赖继续，先在 `examples/inventory/04-react` 执行：

```sh
npm install --save-dev --save-exact @testing-library/react@16 @testing-library/dom@10 @testing-library/user-event@14 @testing-library/jest-dom@7
npm install --save-dev --save-exact @playwright/test@1
npx playwright install chromium
npm test -- tests/testing-forms.test.jsx tests/testing-async.test.jsx
```

若直接下载当前参考实现，目录里已有清单和锁，执行 `npm ci`，再安装 Playwright 的 Chromium、运行测试即可。新增依赖只进入阶段 4，网站根目录继续用自己的锁。

两个测试文件首行使用 `// @vitest-environment happy-dom`，其余纯函数测试仍用 Node。它们导入 `tests/rtl-support.jsx`，该文件负责 DOM 断言和隔离：

```js
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";

const clients = new Set();

export function createTestClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.add(client);
  return client;
}

afterEach(() => {
  cleanup();
  for (const client of clients) client.clear();
  clients.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
```

预期：每个用例结束，组件卸载，测试客户端缓存清空，spy 和全局替换恢复。这里 Vitest 没开启全局 API，因此按 [RTL 的配置说明](https://testing-library.com/docs/react-testing-library/setup/#auto-cleanup-in-vitest) 显式调用 cleanup。`restoreAllMocks` 恢复 spy；替换过的全局量由 `unstubAllGlobals` 恢复。每个用例自己的 `vi.fn()` 也在用例内重新创建。

## 2. 按角色找元素，按用户动作操作

**查询先表达用户认得的东西。** `getByRole("button", { name: "保存商品" })` 描述一个名称为「保存商品」的按钮。class 改名、按钮外多包一层 div，测试仍然能找到它。[角色查询](https://testing-library.com/docs/queries/byrole/) 里的 name 是可访问名称，通常来自按钮文字、label 或 aria-labelledby。

商品名称输入框是 `textbox`，`type="number"` 的库存框是 `spinbutton`，select 是 `combobox`。label 与输入框正确关联后，你可以按 label 查找，也可以按角色加名称查找。给普通 div 硬加 role 只为测试通过，会掩盖应该修正的 HTML 语义。

**先猜一猜：** 页面有六张商品卡片，每张都有「编辑」。直接查询一个「编辑」按钮会得到第一张吗？

下面是 `testing-forms.test.jsx` 中的一项完整用例；`render`、`screen`、`within` 来自 RTL，其他 import 见文件开头。

```jsx
it("同名按钮在目标商品内查询", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={["/products"]}><App /></MemoryRouter>);
  expect(() => screen.getByRole("button", { name: "编辑" })).toThrow(/multiple/i);
  const mouse = screen.getByRole("article", { name: "无线鼠标" });
  await user.click(within(mouse).getByRole("button", { name: "编辑" }));
  expect(screen.getByRole("form", { name: "编辑 P002" })).toBeInTheDocument();
  expect(screen.getByRole("spinbutton", { name: "库存数量（必填）" })).toHaveValue(0);
});
```

结果：用例通过，打开 P002，库存框为 0。第一次查询抛出多个匹配的错误，测试明确断言了这个结果。`within(mouse)` 把范围收进鼠标卡片，避免靠数组下标猜第几个按钮。

`render` 挂载真实 App；MemoryRouter 为测试提供内存中的 URL；`screen` 查询 document.body。给表单提供了 aria-labelledby，所以它能以「编辑 P002」的名称作为 form 被查询。

Java 中拿到集合后再按业务编号筛选，比硬取第 2 项稳定；这里也一样，先选业务对象，再找它的操作。

### get、query、find 的等待规则

| 查询 | 没找到 | 多个匹配 | 用在什么时候 |
| --- | --- | --- | --- |
| `getByRole` | 立即抛错 | 立即抛错 | 此刻应该已经存在 |
| `queryByRole` | 返回 null | 抛错 | 断言不存在 |
| `findByRole` | 重试，超时拒绝 | 重试，超时拒绝 | 异步出现，返回 Promise |

查多个元素用对应的 All 形式，例如 `getAllByRole`。检查不存在时，`expect(screen.queryByRole("alert")).not.toBeInTheDocument()` 能走到断言；换成 get，查询阶段就先抛错了。具体规则见 [Testing Library 查询表](https://testing-library.com/docs/queries/about/)。

[user-event](https://testing-library.com/docs/user-event/intro/) 用一串相关事件模拟交互，例如输入会涉及焦点、按键和 input。每个用例先 `userEvent.setup()`，再 `await user.clear(...)`、`await user.type(...)`、`await user.click(...)`，让交互完成后再观察。

fireEvent 适合明确需要派发某一个底层事件的场合。日常表单测试先写用户动作，可以少依赖你对事件顺序的猜测。

## 3. 一条测试说清一个业务结果

**校验测试要同时证明错误能看见、非法数据没提交。** 只断言出现「保存失败」，还可能漏掉「显示错误的同时也保存了」这个 bug。

`testing-forms.test.jsx` 的空库存用例如下：

```jsx
it("空库存阻止保存并把焦点交给错误字段", async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(<ProductForm product={products[1]} onSave={save} />);
  const stock = screen.getByRole("spinbutton", { name: "库存数量（必填）" });
  await user.clear(stock);
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(screen.getByRole("alert")).toHaveTextContent("保存失败");
  expect(stock).toHaveAccessibleDescription("请输入 0–99999 的整数库存。");
  expect(stock).toHaveFocus();
  expect(save).not.toHaveBeenCalled();
});
```

结果：用例通过。空库存显示错误，说明文字通过 aria-describedby 关联到字段，焦点回到库存框，save 调用次数为 0。ProductForm 使用 noValidate，把这条提交交给自己的业务校验，所以测试能观察到组件负责的提示。

这里的 `vi.fn()` 是父组件回调的替身。ProductForm 的对外合同就是调用 onSave，因此断言回调参数合理；挂载完整应用时，则继续检查卡片和统计。两种范围选择同一个业务规则的不同边界。

### 配一条合法的 0，防止修复过头

校验空白时很容易写成 `if (!stock)`，连合法的 0 一起挡住。另一条用例保留 P002 初始库存 0，把价格改成 0.29 元：

```jsx
it("合法的 0 和精确金额提交为业务数字", async () => {
  const user = userEvent.setup();
  const save = vi.fn();
  render(<ProductForm product={products[1]} onSave={save} />);
  const price = screen.getByRole("textbox", { name: "单价（元，必填）" });
  await user.clear(price);
  await user.type(price, "0.29");
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(save).toHaveBeenCalledExactlyOnceWith("P002", {
    name: "无线鼠标", category: "外设", stock: 0, priceCents: 29, tags: [],
  });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(products[1].priceCents).toBe(12900);
});
```

结果：保存一次，库存是数字 0，金额是整数 29 分，固定起点商品仍为 12900 分。此处检查数据字段，能防住「界面显示 0.29，但回调传了字符串价格」这种缺陷。

Java 的 DTO 单测也会验证数据边界；JS 里输入框提供字符串，类型转换尤其值得留回归。

### 创建商品为什么放在集成测试

阶段 4 的创建流程是「新增示例商品 → 编辑 → 保存」。完整用例名为「新建后编辑商品，卡片和统计一起更新」：挂载 App，点击新增，确认 P007，填名称「随身转接头」、库存 3、价格 0.29 元，再保存。末尾断言是：

```jsx
  expect(screen.getByText(/全部：7 种/)).toHaveTextContent("总库存 52 件");
  await user.click(screen.getByRole("button", { name: "保存商品" }));
  expect(screen.getByRole("article", { name: "随身转接头" })).toHaveTextContent("库存：3 件");
  expect(screen.getByText(/全部：7 种/)).toHaveTextContent("总库存 55 件 · 库存总价值 ¥26348.87");
  expect(screen.queryByRole("form", { name: "编辑 P007" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "库存管理" })).toHaveFocus();
```

结果：保存前仍是 52 件；保存后是 55 件，总价值增加 87 分，编辑区关闭，焦点回到标题。完整字段填写保存在同一个测试文件中。

它经过真实的事件回调、Context、reducer、列表与统计。若把这些全部 mock 成「预期数据」，测试就失去了发现连接错误的机会。保留同一条业务路径上的真实代码，只替换路径外的依赖。

:::tip[自己尝试 · 本地 React]
1. 在 `examples/inventory/04-react` 执行 `npm test -- tests/testing-forms.test.jsx`，阅读五个用例的结果。
2. 运行 `npm run dev -- --host 127.0.0.1`，打开终端地址下的 `/js_web/#/products`，按上述步骤新增并编辑 P007。
3. 再编辑 P002，把库存清空后保存，再输入 0 保存。

预期：新商品保存后总库存 55、价值 26348.87 元；空库存显示错误，0 可以保存。刷新后库存恢复固定起点。
:::

## 4. 异步测试：等结果，控制外部依赖

**异步发起和异步结果出现是两个时刻。** 点击完成后，请求可能仍在等待。测试应该等待用户可见的结果。

**先猜一猜：** async 函数一调用就抛错，下面三行日志按什么顺序出现？

```js title="async-order.js"
async function loadMouse() {
  throw new Error("模拟断网");
}
const pending = loadMouse().catch((error) => console.log(error.message));
console.log("已经发起");
await pending;
console.log("已经处理失败");
```

```text
已经发起
模拟断网
已经处理失败
```

async 函数把错误变成 Promise 拒绝，catch 回调在后续微任务执行。测试里的 `await user.click` 等待交互过程，网络完成仍然需要对应的等待条件。这和 Java 中提交异步任务后，任务未必已经完成是同一类时序问题。

### 请求失败，再由用户重试

下面的 `testing-async.test.jsx` 使用真实 CachedProductDetails 和 QueryClient，只把加载函数换成 [Vitest mock 函数](https://vitest.dev/guide/mocking/functions.html)：

```jsx
it("详情失败后由用户重试成功", async () => {
  const user = userEvent.setup();
  const load = vi.fn().mockRejectedValueOnce(new Error("模拟断网"))
    .mockResolvedValueOnce(structuredClone(products[1]));
  const client = createTestClient();
  render(<QueryClientProvider client={client}>
    <CachedProductDetails productId="P002" loadProduct={load} />
  </QueryClientProvider>);
  expect(await screen.findByRole("alert")).toHaveTextContent("模拟断网");
  await user.click(screen.getByRole("button", { name: "重试详情" }));
  expect(await screen.findByText(/无线鼠标 · 外设 · 缓存库存 0 件/)).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(load).toHaveBeenCalledTimes(2);
  expect(load).toHaveBeenLastCalledWith("P002", { signal: expect.any(AbortSignal) });
});
```

结果：第一次显示模拟断网，点击重试后显示无线鼠标、缓存库存 0，错误消失，总共调用两次加载函数。

每个用例创建独立客户端，关闭自动重试，让第一次失败直接进入错误界面。应用中的自动重试配置保持原样；这里选择的是「用户点击重试」这一条路径。若保留自动重试，第二个 mock 结果可能先被自动请求消耗，测试目标就变了。

mock 的边界也很明确：本用例验证组件怎样处理加载函数的拒绝与成功。HTTP 404 转异常、JSON 解析与响应校验，继续由已有的请求层测试覆盖。用字符串假错误替换整份查询 Hook，会绕过真实状态变化。

### 等待出现，断言消失

[findBy 查询和 waitFor](https://testing-library.com/docs/dom-testing-library/api-async/) 会反复尝试，直到条件满足或超时。需要等一个元素出现，直接用 findBy；需要等调用次数或已有节点文字变化，用 waitFor 包住会抛错的 expect。仅在回调中 `return false` 不会要求它继续等。

waitFor 的回调可能执行多次，因此点击和输入放在外面。否则一次失败重试可能再次点击按钮，测试自己制造额外请求。

读取错误提示后，先等成功内容出现，再用 query 断言错误已移除，表达的是完整恢复。固定睡 500 毫秒只表达「时间过去了」，机器慢一点就失败，机器快时又白等。

同文件还用可手动完成的 Promise 测加载态：先确认「正在加载 P002」且没有详情，完成 Promise，再等待详情出现。这里手动完成外部 Promise 使用了 RTL 的 act；普通 render 和 user-event 已处理常见 React 更新，遇到 act 提示先查漏掉的 await 与未结束的任务。

### cleanup 也有业务后果

测试框架卸载组件后，组件仍负责取消自己的请求、定时器和监听。下面直接测 C31 的手工请求组件：

```jsx
it("离开手工请求组件会取消它的请求", () => {
  let signal;
  const load = vi.fn((id, options) => {
    signal = options.signal;
    return new Promise(() => {});
  });
  const { unmount } = render(<ProductDetails productId="P002" loadProduct={load} />);
  expect(signal.aborted).toBe(false);
  unmount();
  expect(signal.aborted).toBe(true);
});
```

结果：卸载前 false，卸载后 true。永不完成的 Promise 只用来让请求保持等待，abort 的效果由 signal 观察。它没有证明真实网络传输已结束；请求函数还需要消费 signal。

本课异步用例使用真实时钟。测试倒计时等场景才需要假时钟；启用时应按 [user-event 配置](https://testing-library.com/docs/user-event/options/#advancetimers) 提供 advanceTimers，并在结束后恢复时钟。共享缓存、存储和未清理任务，都可能导致单独跑通过、整套跑失败。

## 5. 一条 E2E 贯通路径，快照留给小输出

**E2E 用真实浏览器覆盖各层接起来后的关键路径。** 本课只留一条「列表筛选 → 详情 → 刷新 → 返回筛选列表」，重点是生产资源、hash 路由与筛选参数一起工作。

`e2e/inventory.spec.js` 使用 [Playwright Test](https://playwright.dev/docs/writing-tests)：

```js
import { test, expect } from "@playwright/test";

test("筛选、详情、刷新与返回贯通生产产物", async ({ page }) => {
  await page.goto("/js_web/#/products");
  await page.getByRole("textbox", { name: "搜索名称（按 / 聚焦）" }).fill("鼠标");
  await expect(page.getByRole("article")).toHaveCount(1);
  const mouse = page.getByRole("article", { name: "无线鼠标" });
  await mouse.getByRole("link", { name: "查看缓存详情" }).click();
  await expect(page).toHaveURL(/#\/products\/P002\?q=/);
  await expect(page.getByRole("region", { name: "缓存商品详情" })).toContainText("缓存库存 0 件");
  await page.reload();
  await expect(page.getByRole("heading", { name: "商品详情 P002" })).toBeVisible();
  await expect(page.getByRole("region", { name: "缓存商品详情" })).toContainText("无线鼠标");
  await page.getByRole("link", { name: "返回筛选列表" }).click();
  await expect(page.getByRole("textbox", { name: "搜索名称（按 / 聚焦）" })).toHaveValue("鼠标");
  await expect(page.getByRole("article")).toHaveCount(1);
});
```

结果：只出现鼠标卡片，详情加载成功，刷新仍能进入 P002，返回后搜索词与唯一结果保留。`page` 是 Playwright 提供的隔离页面，getByRole 返回 locator；它与 RTL 方法名字相近，返回值和执行环境不同。这里的 expect 也来自 Playwright，DOM 断言有自己的自动等待。

`playwright.config.js` 指定 Chromium，并通过 [webServer](https://playwright.dev/docs/test-webserver) 先构建，再在 4178 端口预览。本测试保留 `/js_web/`，没有把开发服务器首页成功当成部署路径已经正确。数据由静态 JSON 初始化浏览器 mock，浏览器能读到它，Pages 就不需要写接口。

:::tip[自己尝试 · 本地 React]
1. 在阶段 4 执行 `npx playwright install chromium`，安装与锁定工具配套的浏览器。
2. 执行 `npm run test:e2e`。命令会自动构建、启动预览、运行浏览器并关闭服务。
3. 打开 `e2e/inventory.spec.js`，把每一步对应到列表、URL、详情和返回后的界面。

预期：1 条用例通过。若失败，先读终端中的具体断言；配置会保存失败 trace，可按终端给出的路径执行 `npx playwright show-trace 路径` 查看。
:::

### Jest 与快照在这张地图上哪里

[Jest](https://jestjs.io/docs/getting-started) 和 Vitest 都是 JS 测试运行器，都能配 RTL 做组件测试。现有 Jest 项目可以继续用 Jest；本项目沿用 Vite/Vitest，省去同时维护两套运行配置。RTL 与 user-event 的行为测试思路可以迁移，mock 和配置细节需要按运行器调整。

[快照测试](https://vitest.dev/guide/snapshot.html) 把序列化结果与提交的参考内容比较，适合短小、稳定、容易审阅的输出。整页 HTML 快照一变就出现大段 diff，审阅者容易直接更新；它也没有执行保存和重试。业务断言先写清「0 被保留」「非法输入未提交」「重试能恢复」，需要时再配小快照。序列化 DOM 快照与浏览器截图比较是两类测试。

## 常见错误与调试

### 空库存被当成 0，测试却一直是绿的

**现象**：`labs/forms.html?case=blank` 清空后保存，显示「已保存库存 0」。只测合法输入的用例全部通过。

**工具**：在阶段 4 执行 `npm run test:bug -- labs/testing-bugs.test.jsx`。查看失败里的 Expected、Received 和源码行；再打开 `labs/BlankStockBroken.jsx`。

**证据**：Expected 是「库存无效」，Received 是「已保存库存 0」。处理函数先把文本传给 Number：

```js
// 有问题的写法：空白在业务校验前已经变成了数字 0
const value = Number(stock);
if (!Number.isInteger(value) || value < 0 || value > 99999) {
  setMessage("库存无效");
  return;
}
setMessage(`已保存库存 ${value}`);
```

**原因**：`Number("")` 得到 0，后续整数与范围检查全部通过。旧测试只输入 3，正好绕开缺陷。

**修复**：在 Broken 文件导入 `../src/product-form.js` 的 parseStock，用它替换转换与判断：

```js
const value = parseStock(stock);
if (value === null) {
  setMessage("库存无效");
  return;
}
setMessage(`已保存库存 ${value}`);
```

**确认**：重复原命令，现在 1 条通过；网页空输入提示无效，输入 0 可以保存。`BlankStockFixed.jsx` 是完整答案。仓库保留错误起点；正常回归中的 ProductForm 空库存与合法 0 两项持续保护正式实现。

:::tip[自己尝试 · 本地 React]
先运行上面的错误回归，再按修复步骤修改，重复同一条命令。开发服务中打开 `/js_web/labs/forms.html?case=blank`，分别试空白与 0；也可切到 `case=blank-answer` 对照。

预期：错误起点失败，修复后通过；空白与合法的 0 得到不同结果。
:::

### 单独能过，整套运行出现多个「保存商品」

**现象**：一项测试单独通过，和其他测试一起跑时，查询报告多个匹配，错误输出中有上一个用例的表单。

**工具**：查看终端附带的 DOM 和可访问角色列表；需要缩小范围时，在失败查询前调用 `screen.debug()`。检查测试文件是否导入了清理入口。

**证据**：document.body 中同时存在两份不同用例挂载的 form，而当前测试只调用了一次 render。

**原因**：前一个用例的根没有卸载。screen 查询整个 body，所以暴露了污染。

**修复**：导入本课 rtl-support，让 afterEach 执行 cleanup；确实同时挂载多份组件的场景再按业务容器用 within 定位。

**确认**：先跑目标文件，再执行整个 `npm test`，两者都通过。用例需要更改 localStorage 或全局 fetch 时，也要在结束后恢复对应资源。

## 练习

### 练习 1：预测创建后的数据

先写出三行输出，再在 `examples/c35` 运行 `node fixture.js`。验收：解释为什么新增后总库存仍是 52，原数组仍只有六件商品。

```js title="fixture.js"
import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const after = productsReducer(structuredClone(products), { type: "sampleAdded" });
const created = after.at(-1);
console.log(created.id, created.name, created.stock);
console.log(after.length, after.reduce((sum, product) => sum + product.stock, 0));
console.log(products.length);
```

<details>
<summary>提示</summary>

新增商品的默认库存是 0；reducer 返回更新后的数组。纯函数测试适合检查这个合同，按钮是否连接到 reducer 由集成测试补上。

</details>

<details>
<summary>参考答案</summary>

三行依次是 `P007 新商品 0`、`7 52`、`6`。商品种类加一，库存加零。新的创建结果与固定样例分开，后续测试仍从原六件商品开始。

</details>

### 练习 2：修好一个选错层级的测试

同事要验证「断网后用户能重试」，却只断言加载 mock 被调用过一次，没查错误提示，也没点按钮。以 `testing-async.test.jsx` 的失败重试用例为起点，指出它比这个测试多保护了什么；再把 `CachedProductDetails.jsx` 的重试按钮回调暂改成空函数。

验收：目标用例在等待成功内容时失败；恢复回调后通过。只在你的练习副本改，保留正常实现的回调。

<details>
<summary>提示</summary>

加载函数调用一次只能说明发起过请求。完整恢复要经过错误界面、用户动作、新请求和成功界面。

</details>

<details>
<summary>参考答案</summary>

本课用例检查错误内容，点击「重试详情」，等待鼠标库存 0 出现，再检查错误消失和加载调用两次。空回调使请求不会重新发起，成功内容就一直等不到。它适合 RTL 集成测试：请求结果可控制，按钮、Query 状态和渲染仍走真实实现。

恢复 `onClick={() => query.refetch()}` 后，同一用例通过。HTTP 转异常的细节继续交给请求层，跨页资源交给 E2E。

</details>

## 项目进度

从 C34 的 `examples/inventory/04-react` 继续。本课不改变应用交互，推进的是测试能力：

- `tests/rtl-support.jsx` 提供 DOM 断言、独立 QueryClient 与清理。
- `testing-forms.test.jsx` 覆盖校验、合法 0、角色作用域与创建后的统计。
- `testing-async.test.jsx` 覆盖失败重试、加载反馈与卸载取消。
- `labs/testing-bugs.test.jsx` 复用空库存错误起点，独立于正常用例。
- `playwright.config.js` 与 `e2e/inventory.spec.js` 运行跨页冒烟；package.json 增加 `test:e2e`。

在阶段 4 执行 `npm run lint`、`npm test`、`npm run build`、`npm run test:e2e`。预期：正常回归 171 条，E2E 1 条；初始六件商品仍是 52 件、26348.00 元。错误起点用单独的 test:bug 命令运行。

## 小结

- 按故障选范围：纯函数测转换，组件测交互，集成测连接，E2E 测关键路径。
- 角色加可访问名称表达用户认识的控件，重复操作先用 within 缩小范围。
- 通过输入和点击驱动组件，断言错误、结果、焦点及对外提交合同。
- 异步等可观察条件，每项测试使用独立外部状态，结束后卸载和恢复资源。
- 一条跨页冒烟保护构建与路由；小快照作为补充，业务结果用明确断言。

自测：

1. 为什么库存输入框的角色是 spinbutton？页面有六个编辑按钮时怎样找到鼠标的？
2. 证明空库存没有保存，除了检查错误文字还要检查什么？
3. user.click 已经 await，为什么请求结果仍可能需要 findBy？
4. 测用户重试时，为什么关闭测试客户端的自动重试？
5. 卡片与统计不同步、详情刷新 404，分别适合在哪一层发现？

下一课复盘 React 项目的组件、状态与请求结构，按工具顺序定位综合故障。

## 延伸阅读

- [Testing Library：查询选择与优先级](https://testing-library.com/docs/queries/about/)
- [Testing Library：user-event 的交互模型](https://testing-library.com/docs/user-event/intro/)
- [Testing Library：异步查询与 waitFor](https://testing-library.com/docs/dom-testing-library/api-async/)
- [Vitest：mock 函数](https://vitest.dev/guide/mocking/functions.html)
- [Vitest：快照的使用与审阅](https://vitest.dev/guide/snapshot.html)
- [Playwright：编写测试与自动等待](https://playwright.dev/docs/writing-tests)
