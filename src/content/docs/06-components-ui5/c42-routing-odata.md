---
title: C42 UI5 路由与 OData 起点
description: 用 manifest 连接库存列表与详情，读懂 OData 元数据与查询，并运行一个有限的 V2 浏览器 mock。
sidebar:
  order: 42
---

> **第 4 周 · 第 21 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C40、C41 · 运行：Node 24、本地 UI5 · 示例已运行验证

## 这一课解决什么问题

C41 的库存表格已经能筛选和编辑。现在同事想把 USB-C 扩展坞的详情发给你，地址栏却只有 index.html：当前选中哪件商品，只存在页面内存里。

地址不能靠“第 1 行”标识商品。SAP 服务的 `Products('P004')` 又和本地 `/products/3` 有什么关系？

**路由保存商品编号，模型负责取到这件商品。**

学完你能：

- 在 manifest 配置列表、详情与未知地址的路由。
- 从行的绑定上下文取编号，直接打开、刷新和返回详情。
- 阅读 OData 的实体类型、实体集、主键与查询选项。
- 区分 JSONModel、V2 ODataModel 和 V4 ODataModel 的职责。
- 用浏览器 MockServer 运行有限的 V2 读取实验，说明真实 SAP 接入还需要什么。

完整工程见[阶段 6](https://github.com/socoo123/js_web/tree/main/examples/inventory/06-openui5)，独立例子见 [examples/c42](https://github.com/socoo123/js_web/tree/main/examples/c42)。

## Java 程序员先看这里

| Java 经验 | UI5 对应 | 差异 |
| --- | --- | --- |
| Spring MVC 的路径参数 | Router 的 pattern、arguments | 本课匹配浏览器 hash，在前端切换 View |
| 按主键查询 DTO | 用路由 id 找商品，再设置绑定上下文 | 数组位置随排序和数据变化，业务编号更适合分享 |
| DTO 类型与接口文档 | OData 的实体类型和 `$metadata` | 服务还能声明实体集、键和关联，客户端据此组织请求 |
| Repository 或 HTTP 客户端 | ODataModel | 同时管理服务请求、缓存与控件绑定，并非数据库连接 |

## 1. manifest 路由：从地址找到该显示的 View

路由分两步：**route 匹配地址，target 决定显示内容。** 本例的 App.view.xml 只保留 `<App id="app" />`，列表和详情都是它的 pages 成员。列表原来外层的 App 移走，Page 保留。

在 manifest 的 sap.ui5 下配置 routing。核心配置如下，完整文件另含未知地址：

```json
{
  "config": {
    "routerClass": "sap.m.routing.Router",
    "type": "View", "viewType": "XML",
    "path": "course.inventory.view",
    "controlId": "app", "controlAggregation": "pages",
    "async": true
  },
  "routes": [
    { "pattern": "", "name": "list", "target": "list" },
    { "pattern": "products/{id}", "name": "detail", "target": "detail" }
  ],
  "targets": {
    "list": { "id": "inventoryView", "name": "Inventory" },
    "detail": { "id": "detailView", "name": "Detail" }
  }
}
```

空 hash 显示 Inventory；`#/products/P004` 显示 Detail，id 为 P004。path 与 name 组成 View 名称；controlId 找到 App，controlAggregation 指定 pages。

[路由配置](https://ui5.github.io/docs/04_Essentials/routing-configuration-9023130.html)中的 routes 按顺序匹配。本工程把 `:all*:` 放到最后，显示“页面地址不存在”。它接住 `#/wrong/path` 这类地址；`#/products/P999` 已匹配详情规则，应该由详情页提示“未找到商品”。**页面路径错了和商品不存在，是两种不同的反馈。**

Component 仍先调用父类 init，再创建 ui 模型，最后执行 `this.getRouter().initialize()`。initialize 开始监听 hash，也处理第一次打开页面时已有的地址。只创建路由配置却没初始化，首次打开详情就不会按预期工作。

### 点击表格行时传 id

将 ColumnListItem 设置为 `type="Navigation" press=".onDetail"`，点击行时执行：

```js
onDetail(event) {
  const id = event.getSource().getBindingContext("inventory").getProperty("id");
  this.getOwnerComponent().getRouter().navTo("detail", { id });
},
```

点击 P004，URL 变成 `index.html#/products/P004`。navTo 的 `"detail"` 是 route 名称，`{ id }` 填充路径参数。

和 Spring MVC 一样，模式匹配出参数；这里在浏览器内切换 View。hash 不发给静态服务器，`/js_web/ui5/index.html#/products/P004` 刷新仍请求 index.html。

## 2. 详情绑定：编号稳定，数据位置现场查

**先猜一猜：** 搜索 P004 后只剩一行。下面两次读第 0 个商品，得到的是同一件吗？在 examples/c42 运行 `node route-identity.js`。

```js title="route-identity.js"
import { products } from "../shared/products.js";

const visible = products.filter((product) => product.id === "P004");
console.log(visible[0].id); // → P004
console.log(products[0].id); // → P001
const index = products.findIndex((product) => product.id === visible[0].id);
console.log(`/products/${index}`); // → /products/3
console.log(`#/products/${visible[0].id}`); // → #/products/P004
```

可见索引只描述表格顺序；`/products/3` 是本次 JSON 中的位置；P004 是商品身份。URL 保存 P004，详情再查当前数组位置，数据重排后仍能使用。

### 直接打开详情时，JSON 可能还没回来

直接打开详情时，Router 可能比 model/products.json 更早就绪。

Component 的 inventoryReady 等待 dataLoaded 并检查 products 数组。详情监听 patternMatched，核心处理如下：

```js
const sequence = ++this._sequence;
const id = event.getParameter("arguments").id;
const view = this.getView();
view.unbindElement("inventory");
view.getModel("detail").setProperty("/status", "loading");
try {
  await this.getOwnerComponent().inventoryReady;
  if (view.isDestroyed() || sequence !== this._sequence) return;
  const products = view.getModel("inventory").getProperty("/products");
  const index = products.findIndex((product) => product.id === id);
  view.getModel("detail").setProperty("/status", index < 0 ? "missing" : "found");
  if (index >= 0) view.bindElement({ path: `/products/${index}`, model: "inventory" });
} catch {
  if (!view.isDestroyed() && sequence === this._sequence) {
    view.getModel("detail").setProperty("/status", "error");
  }
}
```

四种状态分别是加载中、找到、未找到、加载失败。unbindElement 清除旧商品；sequence 让等待结束后只处理最新编号，沿用 C30 的竞态处理思路。

View 设置上下文后，控件使用相对绑定：

```xml
<VBox visible="{= %{detail>/status} === 'found' }">
  <ObjectIdentifier title="{inventory>name}" text="{inventory>id}" />
  <Label text="{i18n>stock}" />
  <ObjectNumber id="detailStock" number="{inventory>stock}" />
</VBox>
```

P002 显示库存 0，P999 显示未找到。列表把 P002 改成 3 后详情也显示 3：两页继承同一个 inventory 模型。

### 返回列表

详情按钮固定表示“返回列表”，执行 `navTo("list", {}, true)`。第三个参数 true 替换当前历史项，因此从外部直接打开详情也能回到列表，不会跳去另一个网站。浏览器自身的后退、前进继续在已有历史之间移动。

:::tip[自己尝试 · 本地 UI5]
1. 在 `examples/inventory/06-openui5` 执行 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:8040/index.html`。
2. 搜索 P004，按 Enter，点击商品行。复制详情 URL，在新标签页打开并刷新。
3. 将 hash 改成 `#/products/P002`、`#/products/P999`、`#/wrong/path`，分别观察，再点返回列表。

预期：P004 库存 3，P002 库存 0；后两种地址分别提示商品不存在、页面地址不存在。刷新仍能显示详情，返回列表能显示六件初始商品。
:::

## 3. OData：实体、元数据与查询有共同契约

OData 为资源寻址、字段类型和查询定义共同规则；普通 JSON 接口的结构则由双方自由约定。

先读阶段 6 的 localService/metadata.xml，其中的业务定义是：

```xml
<EntityType Name="Product">
  <Key><PropertyRef Name="id" /></Key>
  <Property Name="id" Type="Edm.String" Nullable="false" MaxLength="4" />
  <Property Name="name" Type="Edm.String" Nullable="false" MaxLength="40" />
  <Property Name="category" Type="Edm.String" Nullable="false" />
  <Property Name="stock" Type="Edm.Int32" Nullable="false" />
  <Property Name="priceCents" Type="Edm.Int32" Nullable="false" />
</EntityType>
<EntityContainer Name="InventoryService" m:IsDefaultEntityContainer="true">
  <EntitySet Name="Products" EntityType="Inventory.Product" />
</EntityContainer>
```

Product 是实体类型，Products 是实体集，id 是键；记录 P002 才是实体。Edm.String、Edm.Int32 声明类型，Nullable、MaxLength 声明约束。

实验取固定数据的五个标量字段，整数分落在 Int32 范围；真实金额类型以服务契约为准。

| 相对服务根地址 | 含义 |
| --- | --- |
| `$metadata` | 服务结构、实体集与键的描述 |
| `Products` | 商品实体集 |
| `Products('P002')` | id 为字符串 P002 的实体 |
| `Products('P002')/stock` | 这件商品的 stock 属性 |

字符串键带单引号；Products 的大小写来自 metadata。它与 JSONModel 中小写 products 数组各自有自己的定义。

Java DTO 可类比实体类型；实体集是服务资源集合。元数据约束之外，服务端仍需校验业务与权限。

### 查询选项控制返回什么

“库存 1–5 件、库存从多到少、只取两件、只拿需要的字段”，可以表达为下面的请求。实际查询写在同一条 URL：

```http
GET localService/service/Products?
  $filter=stock ge 1 and stock le 5&
  $orderby=stock desc,id asc&
  $top=2&$select=id,name,stock,priceCents
```

结果顺序是 P006 降噪耳机 5 件、P004 USB-C 扩展坞 3 件。

[OData V2 查询规则](https://www.odata.org/documentation/odata-version-2-0/uri-conventions/)中，ge 是大于等于，le 是小于等于。`$filter` 筛选实体，`$orderby` 排序，`$top` 限制数量，`$skip` 跳过前面的记录，`$select` 选择字段；`$expand` 展开服务声明的关联。本实验没有关联，先把单个实体集读清楚。

与 Java Stream 的 filter、sorted、limit 相似，但查询交给服务执行；mock 中由浏览器替身执行。返回两件商品的合计，只能说明这两件的库存。

## 4. JSONModel 与 ODataModel：相似的绑定，不同的取数方式

JSONModel 的 `/products/1` 访问本地对象。ODataModel 的 `/Products('P002')` 描述服务资源，数据经请求到达缓存。

**先猜一猜：** ODataModel 执行 `getProperty("/Products('P999')/stock")` 得到 undefined，就能判定服务里没有 P999 吗？

不能。getProperty 只读缓存，不发请求。要确认远程实体是否存在，需发起读取并处理响应。

| 问题 | JSONModel | V2 ODataModel | V4 ODataModel |
| --- | --- | --- | --- |
| 数据入口 | JS 对象或 JSON 文件 | OData 服务与元数据 | OData 服务与元数据 |
| 常见路径 | `/products/1` | `/Products('P002')` | 按服务键构造的实体路径 |
| 常规列表筛选 | 浏览器中已有的数据 | 默认发往服务，可配置操作模式 | 通常由服务处理 |
| Controller 主动读取 | 本地 getProperty | read；本地缓存用 getProperty | 通过 binding 与 Promise API |
| 接口关系 | 普通客户端模型 | 模块 `odata/v2/ODataModel` | 模块 `odata/v4/ODataModel`，API 单独学习 |

[V4 模型接口](https://ui5.github.io/docs/04_Essentials/changes-compared-to-odata-v2-model-abd4d7c.html)需要单独学习，迁移要调整调用代码。V4 读取 V2 的兼容模式已弃用；本课按协议选择对应模型。

XML 的 `items="{odata>/Products}"` 驱动列表请求，行字段相对绑定为 `odata>name`、`odata>stock`。运行下一节实验后，在 Console 读缓存：

```js title="cache-console.js"
sap.ui.require(["sap/ui/core/Element"], (Element) => {
  const model = Element.getElementById("odataView").getModel("odata");
  console.log(model.getProperty("/Products('P002')/stock")); // → 0
  console.log(typeof model.getProperty("/Products('P999')/stock")); // → undefined
});
```

远程分页时缓存通常只有部分数据，全量统计应由服务提供。[V2 模型文档](https://ui5.github.io/docs/04_Essentials/odata-v2-model-6c47b2b.html)解释请求与缓存。Java 的 Repository 也封装数据访问，ODataModel 还连接控件绑定。

## 5. 用 V2 MockServer 跑一次有限读取

[OpenUI5 的浏览器 MockServer](https://ui5.github.io/docs/04_Essentials/mock-server-69d3cbd.html)拦截 XMLHttpRequest，按元数据与本地 JSON 给出 V2 响应。它不接管原生 fetch；本课使用 UI5 V2 ODataModel 发起请求。

实验入口是 `test/odata.html`。先启动 mock，再创建模型：

```js
const { server, serviceUrl } = mockserver.start();
const model = new ODataModel({
  serviceUrl, useBatch: false, tokenHandling: false, defaultBindingMode: "OneWay",
});
```

rootUri 与 serviceUrl 使用同一站内路径，以斜杠结尾。先启动 mock，再让模型请求 `$metadata`。关闭 batch 便于观察；tokenHandling=false 仅用于这个无鉴权、只读实验。

metadata 声明 Products，mockdata/Products.json 提供固定数组，关闭随机补数据。表格显示六件商品，含库存为 0 的 P002。

点击“有限查询”，Controller 使用 V2 的 read 方法：

```js
this.getView().getModel("odata").read("/Products", {
  filters: [new Filter({
          filters: [new Filter("stock", FilterOperator.GE, 1), new Filter("stock", FilterOperator.LE, 5)],
          and: true,
        })],
  sorters: [new Sorter("stock", true), new Sorter("id")],
  urlParameters: { "$top": "2", "$select": "id,name,stock,priceCents" },
  success: (data) => this.getView().getModel("probe").setProperty("/result",
    data.results.map((product) => `${product.id} ${product.name} ${product.stock}`).join("；")),
  error: (error) => this.getView().getModel("probe").setProperty("/result", "读取失败，请检查集合名和模拟服务。"),
});
```

结果是 `P006 降噪耳机 5；P004 USB-C 扩展坞 3`。同字段的顶层 Filter 数组会按 OR 组合，这里显式用 and:true 表达范围。Sorter 的 true 表示降序，集合回调 data.results 已解包 V2 响应。

再在这个实验页的 Console 读取单件商品：

```js title="read-console.js"
sap.ui.require(["sap/ui/core/Element"], (Element) => {
  const model = Element.getElementById("odataView").getModel("odata");
  model.read("/Products('P002')", {
    success: (product) => console.log(product.id, product.stock), // → P002 0
    error: (error) => console.log("读取失败", error.statusCode),
  });
});
```

V2 read 返回请求句柄；`await model.read(...)` 不会等待数据。需要 Promise 时，在 success/error 上封装。

:::tip[自己尝试 · 本地 UI5]
1. 保持阶段 6 开发服务，在新标签页打开 `http://127.0.0.1:8040/test/odata.html`。
2. 等表格显示六行，点击“有限查询”，再运行上面的 Console 代码。
3. 打开 Sources，在 test/OData.controller.js 的 read 调用处设断点，查看 filters、sorters、urlParameters；Network 查看实际加载的 metadata.xml 和 Products.json。

预期：表格含 P002 的库存 0，有限查询按 P006、P004 排列，Console 打印 P002 0。模拟的服务请求可能不出现在普通 Network 列表中，因为它们被浏览器内的替身处理；本地元数据和样例文件仍需要通过 HTTP 加载。
:::

### 从 mock 到真实 SAP 服务

mock 主页面与库存编辑页各用一份数据。编辑库存页不会修改 mock，刷新也没有数据库保存动作。浏览器 V2 mock 的[支持清单](https://ui5.github.io/docs/04_Essentials/odata-features-supported-by-the-odata-v2-mock-server-3459c37.html)是有限的，V4 本地服务模拟通常走 CAP；完整 CRUD、V4 与 CAP 放到选修 X09。

真实接入先确认服务根 URL、协议版本、metadata 和认证。企业应用可用 [Application Router 与 Destination](https://help.sap.com/docs/btp/sap-business-technology-platform/application-routes-and-destinations)连接后端。认证服务建立会话，后端校验权限；UI5 Router 切换 View，Application Router 是服务端入口。

401 先查登录，403 查权限或请求保护；写操作可能需要 CSRF token，并发更新可能使用 ETag。具体流程与 CORS 由服务端契约和部署决定。

Pages 提供静态文件。SAP 密码与 client secret 保留在服务端配置；前端使用认证方案提供的用户会话。

## 常见错误与调试

### 搜索后点第一行，详情指向错误商品

**现象**：搜索 P004，点击唯一一行，却打开 P001，或提示商品不存在。

**工具**：Sources → controller/Inventory.controller.js，在 onDetail 的 navTo 行设置断点，点击该行。

**证据**：事件源的绑定上下文路径是 `/products/3`，id 是 P004；代码传给路由的却是可见索引 0，或者从原数组读出的 P001。地址栏也出现了这个错误参数。

**原因**：表格位置被当成商品身份。筛选改变可见顺序，排序与重新加载同样会改变数组位置。

**修复**：把参数来源改成第 1 节的 `getBindingContext("inventory").getProperty("id")`，详情用 id 查当前数组后再 bindElement。

**确认**：重新搜索 P004，地址包含 P004、详情显示库存 3；复制地址刷新仍显示同一件商品。examples/c42 的浏览器回归同时覆盖筛选、刷新和历史导航。

### 有限查询失败，元数据里明明有商品

**现象**：把 test/OData.controller.js 的 read 路径改成 `/products` 后，表格仍有六行，点击“有限查询”却显示读取失败。

**工具**：Sources → 在 error 回调设断点；同时打开 localService/metadata.xml，查看 EntitySet 的 Name。

**证据**：回调收到 404，metadata 写的是 Products；表格绑定用的是正确的 `/Products`，所以列表依然正常。

**原因**：请求路径大小写不符合服务契约。JSONModel 的小写数组名被带进了 OData 服务。

**修复**：将 read 路径恢复 `/Products`。若 `$metadata` 就失败，则先比对 mock 的 rootUri 与模型 serviceUrl，并检查模拟器是否在模型创建前启动。

**确认**：重载实验页，再点查询，结果恢复 P006、P004。集合与主键读取均有浏览器回归。

## 练习

### 练习 1：预测本地数据与查询结果

在 examples/c42 先阅读 prediction.js，再预测四行输出。运行 `node prediction.js` 核对。

<details>
<summary>提示</summary>

属性名大小写精确匹配；0 是合法库存；findIndex 找不到时返回 -1。低库存排除售罄商品，排序后再取两件。

</details>

<details>
<summary>参考答案</summary>

依次是 undefined、0、-1、`P006:5,P004:3`。本地缺少 Products 属性，不会让 JSONModel 自动查询服务。

</details>

### 练习 2：修复路由参数

把 Inventory.controller.js 中 onDetail 的 id 来源改为 `this.byId("products").indexOfItem(event.getSource())`，复现搜索 P004 后点击详情的问题，再修好。

验收：搜索 P004 后地址必须含 P004；直接打开 P002 显示库存 0；P999 有未找到反馈；三种情况刷新后行为一致。

<details>
<summary>提示</summary>

indexOfItem 返回的是控件在表格里的位置。暂停后查看同一行 BindingContext 中的 id，那里才有业务身份。

</details>

<details>
<summary>参考答案</summary>

从行上下文读 id 传给 navTo。详情等 inventoryReady 后按 id 找位置，按钮进入与直接打开使用同一套逻辑。

</details>

### 练习 3：修改有限查询，解释模型边界

在 test/OData.controller.js 移除 LE 5，保留 GE 1、降序与 `$top=2`，预期 P005 25 件、P001 12 件，然后恢复。解释为什么库存页改 P002 后，mock 仍为 0。

<details>
<summary>提示</summary>

先在固定数据上算结果，再看请求参数。检查两个入口分别创建了哪些模型，以及 MockServer 的数据来自哪个文件。

</details>

<details>
<summary>参考答案</summary>

去掉 LE 条件即可。库存最高是 P005、P001。主应用读本地 JSON，mock 读独立样例文件，两个入口没有共享写入通道。

</details>

## 项目进度

从 `examples/inventory/06-openui5` 的 C41 状态继续：

- manifest 增加 App 根 View 与三条路由；Component 建立 inventoryReady 并初始化 Router。
- Inventory 的行启用 Navigation，Controller 增加 onDetail，保留原有编辑。
- 新增 Detail、NotFound 的 View/Controller 与中英文资源，共享 inventory。
- localService 保存元数据与样例，test/odata.html 启动独立 V2 实验。

在该阶段目录执行 `npm run build`。进入 dist 后运行 `python3 -m http.server 8140 --bind 127.0.0.1`，打开 `http://127.0.0.1:8140/index.html#/products/P002`。dist 是库存主应用的静态产物；test 入口用于开发实验。

验收：初始 6 件商品、库存 52、价值 26348.00 元；原有编辑与语言切换可用；详情复制、刷新成功；V2 实验读到 P006、P004。

## 小结

- route 匹配 hash，target 把 View 放进 App.pages；Component 初始化 Router 才开始导航。
- URL 保存业务 id，详情等数据就绪后查位置、绑定上下文，0 与找不到要分开处理。
- OData 用 metadata 描述实体类型、实体集和键，用查询选项表达筛选、排序、分页与字段选择。
- JSONModel 面向本地对象；ODataModel 面向服务与已加载缓存；V2、V4 的模型 API 各有设计。
- 浏览器 V2 MockServer 支持有限实验；真实 SAP 认证、权限与持久化由服务端承担。

自测：

1. 为什么分享 P004 比分享“第 0 行”可靠？
2. 直接打开详情时，为什么要等 inventoryReady？
3. Product、Products、P002 和 `$metadata` 分别表示什么？
4. getProperty 返回 undefined，为什么不能证明远程实体不存在？
5. 浏览器 UI5 Router 与 Application Router 分别做什么？

下一课转向 UI5 Web Components，在普通网页里使用自定义元素、属性、事件与 slots。

## 延伸阅读

- [UI5：路由配置](https://ui5.github.io/docs/04_Essentials/routing-configuration-9023130.html)
- [UI5：带参数的路由](https://ui5.github.io/tutorials/walkthrough/steps/31/index.html)
- [OData：V2 URI 与查询约定](https://www.odata.org/documentation/odata-version-2-0/uri-conventions/)
- [UI5：OData V2 Model](https://ui5.github.io/docs/04_Essentials/odata-v2-model-6c47b2b.html)
- [UI5：V2 MockServer 配置教程](https://ui5.github.io/tutorials/walkthrough/steps/26/index.html)
- [UI5：V4 相比 V2 的模型接口变化](https://ui5.github.io/docs/04_Essentials/changes-compared-to-odata-v2-model-abd4d7c.html)
