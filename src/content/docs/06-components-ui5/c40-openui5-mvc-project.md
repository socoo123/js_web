---
title: C40 OpenUI5 入门：MVC 与工程
description: 建立商品列表工程，串起 bootstrap、UI5 模块、XML View、Controller、Component、manifest 和静态构建。
sidebar:
  order: 40
---

> **第 4 周 · 第 20 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟  
> 前置：C16、C18、C39 · 运行：Node 24、本地 UI5 · 示例已运行验证

## 这一课解决什么问题

C39 的按钮已经能通过 JSONModel 更新库存。现在要把六件商品放进一个应用：有启动入口、独立页面、业务事件，还能构建后交给静态服务器运行。

这些文件怎样连起来，才能让按钮找到业务代码？学完你能：

- 用 UI5 CLI 启动包含六件固定商品的 OpenUI5 工程。
- 从模块名找到源码，从 XML 标签找到控件与事件方法。
- 解释 Component、manifest、View 和 Controller 的分工。
- 在 DevTools 中定位模块 404 与空绑定，并预览静态构建产物。

参考实现位于 [examples/inventory/06-openui5](https://github.com/socoo123/js_web/tree/main/examples/inventory/06-openui5)，预测例子与浏览器回归位于 [examples/c40](https://github.com/socoo123/js_web/tree/main/examples/c40)。

## Java 程序员先看这里

| Java 经验 | OpenUI5 对应 | 差异 |
| --- | --- | --- |
| Maven 清单与构建配置 | package.json、ui5.yaml | npm 安装 CLI；UI5 CLI 按 YAML 提供框架资源 |
| 应用启动与配置 | index.html、Component、manifest | 应用初始化发生在浏览器；manifest 由 UI5 读取 |
| 包名与类路径 | 命名空间与模块资源路径 | 点号名称与斜杠模块名按映射找到文件，大小写要一致 |
| JavaFX 的布局与事件处理 | XML View 与 Controller | XML 创建 UI5 控件对象，Controller 响应控件事件 |
| Controller 中的实例方法 | onInspect 与 this | UI5 调用事件方法时提供 Controller 接收者；普通箭头函数没有自己的 this |

## 1. 先把开发工具与浏览器资源分开

UI5 CLI 4 在 Node 执行，框架与 Controller 在浏览器执行。工程根目录放工具配置，`webapp/` 放浏览器要加载的应用。UI5 CLI 对 application 项目默认使用这个目录，启动服务后，`webapp/index.html` 对应网址 `/index.html`。

```text
06-openui5/
  package.json                  npm 依赖与脚本
  package-lock.json             此练习自己的锁文件
  ui5.yaml                      UI5 CLI 配置
  webapp/
    index.html                  页面入口
    Component.js                应用组件
    manifest.json               应用描述
    view/Inventory.view.xml     页面结构
    controller/Inventory.controller.js
    model/findProduct.js        查找函数模块
    model/products.json         六件商品，外层是 { "products": [...] }
```

从参考目录开始，在仓库根执行以下命令：

```sh
cd examples/inventory/06-openui5
npm ci
npm run dev
```

终端会报告服务监听 8040 端口。用 Chrome 打开 `http://127.0.0.1:8040/index.html`，你应当看到「OpenUI5 库存入门」、编号输入框与六行商品。直接打开端口根路径时可能看到目录列表；进入 `index.html` 才是应用。

已有锁文件，所以使用 `npm ci`。如果你在仓库外新建空练习，先运行 `npm init -y`、`npm install --save-dev @ui5/cli@4`，再建立本课文件与 scripts；首次安装生成的锁文件要保留。`dev` 脚本是 `ui5 serve --port 8040`，`build` 脚本是 `ui5 build --all --clean-dest --include-task generateVersionInfo`。npm scripts 会找到本项目安装的 CLI。

`ui5.yaml` 完整内容如下：

```yaml
specVersion: "4.0"
metadata:
  name: course.inventory
type: application
framework:
  name: OpenUI5
  version: "1.153.0"
  libraries:
    - name: sap.ui.core
    - name: sap.m
    - name: themelib_sap_horizon
```

本地服务可以响应 `resources/sap-ui-core.js`，并提供 `sap.m` 控件与 Horizon 主题。第一次启动需要联网下载依赖资源，后续可使用本地缓存。

[`framework` 配置](https://ui5.github.io/cli/v4/pages/OpenUI5/)固定 OpenUI5 的资源版本，CLI 会解析需要的库及其依赖。

`@ui5/cli` 是工具版本，`framework.version` 是框架版本，`specVersion` 是 YAML 格式版本。Java 的构建工具和应用依赖也各管一层。

## 2. bootstrap：从 HTML 进入应用组件

HTML 先加载 UI5 核心，核心再按配置加载初始化模块。把 `index.html` 中这段与 C39 对照：框架地址变成本地相对路径，初始化模块变为 `ComponentSupport`。

```html
  <script id="sap-ui-bootstrap" src="resources/sap-ui-core.js"
    data-sap-ui-theme="sap_horizon"
    data-sap-ui-async="true"
    data-sap-ui-compat-version="edge"
    data-sap-ui-language="zh-CN"
    data-sap-ui-resource-roots='{"course.inventory":"./"}'
    data-sap-ui-on-init="module:sap/ui/core/ComponentSupport"></script>
```

`async="true"` 让框架采用异步加载流程；`on-init` 指定初始化时运行的 UI5 模块。`ComponentSupport` 会读取页面里带 `data-sap-ui-component` 的元素，创建相应的组件容器。本例的承载元素是：

```html
  <main data-sap-ui-component data-name="course.inventory"
    data-id="container" data-settings='{"id":"inventory"}'
    aria-label="库存应用"></main>
```

`data-name` 指定组件名，`data-id` 指定容器 ID。ComponentSupport 添加容器前缀，本例组件实例 ID 是 `container-inventory`。

`resource-roots` 建立资源映射：命名空间 `course.inventory` 对应当前应用目录 `./`。于是 `course/inventory/Component.js` 能从应用目录中的 `Component.js` 找到。

**先猜一猜：** 把整份静态应用放到 `/js_web/ui5/` 后，相对路径 `resources/sap-ui-core.js` 会请求哪里？在 `examples/c40` 运行：

```js title="module-paths.js"
const namespace = "course.inventory";
const resourceRoot = new URL("./", "http://localhost:8040/index.html");
const moduleId = "course/inventory/model/findProduct";
const prefix = namespace.replaceAll(".", "/") + "/";
const file = moduleId.slice(prefix.length) + ".js";
console.log(file);
console.log(new URL(file, resourceRoot).pathname);
console.log(new URL("resources/sap-ui-core.js", "https://example.com/js_web/ui5/index.html").pathname);
```

依次输出 `model/findProduct.js`、`/model/findProduct.js`、`/js_web/ui5/resources/sap-ui-core.js`。前两行用普通 JS 展示本例的映射关系；真正加载模块的是 UI5 loader。

相对 URL 保留当前目录；开头写 `/resources/` 则会请求域名根，容易破坏子路径部署。

## 3. Component 与 manifest：应用初始化和声明配置

Component 是组织整个 UI5 应用的单元。它把根 View、模型和应用配置连接起来。

`Component.js` 定义并返回一个组件类：

```js
sap.ui.define([
  "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel",
], (UIComponent, JSONModel) => {
  "use strict";
  return UIComponent.extend("course.inventory.Component", {
    metadata: {
      interfaces: ["sap.ui.core.IAsyncContentCreation"],
      manifest: "json",
    },
    init() {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel({ message: "输入编号后查看商品。" }), "ui");
    },
  });
});
```

启动后，应用获得名为 `ui` 的模型，页面提示「输入编号后查看商品。」。`init` 由框架在组件初始化时调用，先执行父类初始化，再添加本应用的初始化内容。

`metadata.manifest="json"` 让 UI5 读取同目录下的 `manifest.json`；`IAsyncContentCreation` 声明组件支持异步创建内容。按[官方 Component 教程](https://ui5.github.io/docs/03_Get-Started/step-9-component-configuration-4cfa608.html)组织后，根 View 的创建也进入异步流程。

Java 子类也要保留父类初始化；UI5 的 `extend` 类体系采用上述父类调用写法。

### manifest 写“需要什么”，Component 写“初始化时做什么”

完整 manifest 保存在工程中。下面是 `sap.ui5` 下的两个配置项：

```json
    "rootView": {
      "viewName": "course.inventory.view.Inventory",
      "type": "XML",
      "id": "inventoryView"
    },
    "models": {
      "inventory": {
        "type": "sap.ui.model.json.JSONModel",
        "uri": "model/products.json"
      }
    }
```

结果是 UI5 创建 `view/Inventory.view.xml`，并创建名为 `inventory` 的 JSONModel，读取 `model/products.json`。JSON 文件外层是 `{"products":[...]}`，模型路径 `/products` 才能读到数组。请求完成后，列表绑定显示六件商品。

manifest 的主要区域可以按这个顺序读：

| 区域 | 本工程内容 | 读它的目的 |
| --- | --- | --- |
| `sap.app` | id、type、title、applicationVersion | 确定应用身份；id 与组件命名空间一致 |
| `sap.ui` | technology | 声明界面技术 |
| `sap.ui5.dependencies` | minUI5Version、libs | 声明应用需要的最低框架版本与运行库 |
| `sap.ui5.rootView` | XML View 名称与 ID | 确定组件首先创建哪个界面 |
| `sap.ui5.models` | inventory 模型类型与 URI | 让框架建立应用模型 |

[`manifest.json`](https://ui5.github.io/docs/03_Get-Started/step-10-descriptor-for-applications-8f93bf2.html)在浏览器运行时被 UI5 消费，`ui5.yaml` 由 Node 中的 CLI 消费。前者声明需要哪些运行库，后者让开发服务与构建提供这些库。增加库时，两处需求要对齐。

`minUI5Version` 声明最低要求，实际版本由 YAML 固定；`_version` 是 manifest 格式版本。组件模型向内部控件传播：`inventory` 存商品，`ui` 存提示。

## 4. XML View：布局、控件与绑定上下文

XML View 声明控件树：默认命名空间 `sap.m` 选择控件库，`mvc` 前缀用于 View。

```xml
<mvc:View controllerName="course.inventory.controller.Inventory"
  xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" displayBlock="true">
  <App>
    <Page title="OpenUI5 库存入门">
      <content>
        <VBox class="sapUiSmallMargin">
          <Label text="商品编号" labelFor="productId" />
          <HBox wrap="Wrap" alignItems="Center">
            <Input id="productId" value="P002" width="10rem" />
            <Button text="查看商品" press=".onInspect" class="sapUiTinyMarginBegin" />
          </HBox>
          <Text id="message" text="{ui>/message}" wrapping="true" />
          <List id="products" headerText="商品列表" items="{inventory>/products}">
            <StandardListItem title="{inventory>name}" description="{inventory>id}"
              info="{inventory>stock}" />
          </List>
        </VBox>
      </content>
    </Page>
  </App>
</mvc:View>
```

页面显示编号、按钮与六行商品；每行有名称、编号和库存，P002 的库存是 0。

`App` 承载页面，`Page` 提供标题和内容区域；`VBox` 纵向排列子控件，`HBox` 横向排列，`wrap="Wrap"` 允许空间不足时换行。`sapUiSmallMargin` 是 UI5 提供的间距类。

`Label` 的 `labelFor` 连接输入控件，`Input` 让你输入编号，`Button` 通过 `press` 发出事件，`Text` 显示提示。`<content>` 表示 Page 的一个 **aggregation（聚合）**，即该控件接纳子控件的位置；它本身不会变成 HTML 的 `<content>` 标签。

### 为什么行里没有 `/products/1/name`

`List.items` 绑定到绝对路径 `{inventory>/products}`。UI5 为数组里的每个元素建立一份行模板，并给该行提供当前元素的绑定上下文。因此 `{inventory>name}`、`{inventory>stock}` 从当前商品读取，前面没有 `/`。

**先猜一猜：** 把行内的 `{inventory>name}` 改成 `{inventory>/name}`，会显示每件商品名，还是空白？

结果是商品名变空，编号和库存仍有值。`/name` 从模型根查找，但根只有 `products`，没有 `name`。相对路径查当前行，绝对路径查模型根，起点不同。

Java 增强 for 循环中的 `product.getName()` 也随当前元素改变，只是这里由列表绑定建立上下文。

## 5. Controller 与模块：把一次点击接到业务函数

UI5 用 `sap.ui.define` 定义模块。依赖数组写斜杠分隔的模块 ID，回调参数按顺序接收依赖的导出值，`return` 决定本模块交给别人什么。

查找函数放在 `webapp/model/findProduct.js`：

```js
sap.ui.define([], () => {
  "use strict";
  return function findProduct(products, id) {
    return products.find((product) => product.id === id);
  };
});
```

输入六件商品和 `P002` 时，返回无线鼠标对象；输入 `P999` 时返回 `undefined`。业务部分仍是已经熟悉的 Array 查找。

UI5 loader 与 ESM 的语法不同；Node 的 `type="module"` 不会替换浏览器加载器。临时在 Console 加载模块可以用 `sap.ui.require`，定义可复用模块则用 `sap.ui.define`，见[官方模块教程](https://ui5.github.io/docs/03_Get-Started/step-6-modules-f665d0d.html)。

Controller 导入这个函数，并提供 XML 指定的 `onInspect`：

```js
sap.ui.define([
  "sap/ui/core/mvc/Controller", "course/inventory/model/findProduct",
], (Controller, findProduct) => {
  "use strict";
  return Controller.extend("course.inventory.controller.Inventory", {
    onInspect() {
      const id = this.byId("productId").getValue().trim();
      const model = this.getView().getModel("inventory");
      const products = model.getProperty("/products");
      let message;
      if (!Array.isArray(products)) message = "商品尚未就绪，请稍后重试。";
      else if (!id) message = "请输入商品编号。";
      else {
        const product = findProduct(products, id);
        message = product
          ? `${product.id} ${product.name} · 库存 ${product.stock} 件`
          : "未找到商品。";
      }
      this.getView().getModel("ui").setProperty("/message", message);
    },
  });
});
```

点击默认编号后显示「P002 无线鼠标 · 库存 0 件」。这条链可以从界面一路读回来：`press=".onInspect"` 找到 Controller 方法；`this.byId` 找到本 View 内的 Input；`getValue` 取得文本；函数返回商品；`setProperty` 修改提示模型；Text 绑定随之更新。Controller 连接控件事件与业务，查找函数只处理数据。

`this.byId` 在当前 View 范围查找局部 ID；实际控件 ID 带框架前缀。事件方法使用普通方法语法，UI5 按 Controller 接收者调用它。

:::tip[自己尝试 · 本地 UI5]
1. 保持 `npm run dev` 运行，打开 `http://127.0.0.1:8040/index.html`。
2. 用默认 P002 点击「查看商品」，再输入带首尾空格的 `  P001  ` 点击。
3. 清空编号点击，再输入 P999 点击，最后刷新。

预期：依次看到库存 0、库存 12、请输入编号、未找到商品；刷新恢复初始提示。商品列表一直是六行，查询只改变提示模型。
:::

## 常见错误与调试

### 模块名拼错，页面无法启动

**现象**：把 Controller 依赖中的 `course/inventory/model/findProduct` 改成 `course/inventory/model/findProducts`，刷新后页面未正常创建，Console 出现包含 `failed to load` 的模块加载错误。

**工具**：打开 DevTools → Network，勾选 Disable cache 后刷新，过滤 `findProducts`；再到 Console 展开首个模块加载错误。

**证据**：请求 URL 指向 `model/findProducts.js`，响应为 404；真实文件叫 `model/findProduct.js`。

**原因**：模块 ID 决定要请求的文件路径。错误发生在依赖加载阶段，Controller 工厂函数还没正常执行。

**修复**：把依赖字符串恢复为 `course/inventory/model/findProduct`。模块 ID 通常省略 `.js`，对应源码仍带扩展名。

**确认**：保持禁用缓存再次刷新，请求正确资源，六行商品出现；点击 P002 能读到库存 0。工程的浏览器回归会注入错误路径确认 404，再恢复路径检查启动。生产构建可能从预加载文件取得模块，练习此故障时使用开发服务。

### 列表有六行，库存却全部为空

**现象**：在 XML 把 `info="{inventory>stock}"` 改成 `info="{inventory>Stock}"`，刷新后商品名称和编号都正常，右侧库存为空。

**工具**：打开 Sources，搜索 `Inventory.controller.js`，在 `const products = model.getProperty("/products");` 的下一行设断点，然后点击「查看商品」。暂停后在 Console 检查 `model.getProperty("/products/1/stock")` 和 `model.getProperty("/products/1/Stock")`。

**证据**：前者为数字 0，后者为 `undefined`。继续执行，P002 的提示仍正确显示库存 0，但列表库存仍为空。

**原因**：JSON 字段区分大小写。数据已经加载，Controller 也取得了正确对象，只有列表声明的属性路径错了。绑定读到不存在的属性时可能只得到空显示。

**修复**：把 XML 中的 `Stock` 改回 `stock`，保留行内相对路径。

**确认**：刷新后六行库存依次是 12、0、7、3、25、5。`examples/c40/engineering.test.js` 同时断言 P002 的模型库存为 0、行控件的 `info` 为字符串 `"0"`。这条浏览器回归会发现绑定拼写错误，纯数组测试无法覆盖这条连接。

## 练习

### 练习 1：预测模型根与当前商品

先写下四行输出，再在 `examples/c40` 执行 `node prediction.js`。这段普通 JS 用来复习数据形状。

```js title="prediction.js"
import { products } from "../shared/products.js";

const row = products[1];
const namedModels = { inventory: { products } };
console.log(row.name);
console.log(row.stock);
console.log(namedModels.inventory.products.length);
console.log(row.Stock);
```

验收：写出输出，并说明 XML 行模板读取 `name` 时为什么采用相对路径。

<details>
<summary>提示</summary>

第二件商品是 P002。根对象里只有 products 数组，name 和 stock 在每一件商品上；字段名区分大小写。

</details>

<details>
<summary>参考答案</summary>

依次是「无线鼠标」、0、6、`undefined`。列表绑定把当前商品作为行上下文，所以 `{inventory>name}` 读取该行名称；`{inventory>/name}` 从根查找，找不到该字段。

</details>

### 练习 2：修复两个“页面空了”

分别制造两个故障：模块名改成 `findProducts`；恢复后，把 List 绑定改成 `{products>/products}`。每次只改一处，记录原因后恢复。

验收：能区分模块 404 与模型名错误；最终六行商品出现，P002 显示库存 0。

<details>
<summary>提示</summary>

先确认 Controller 是否成功加载，再检查模型名称。manifest 中模型的键是 inventory，products 是数据字段名。

</details>

<details>
<summary>参考答案</summary>

模块错误会请求不存在的 `model/findProducts.js`。恢复依赖名称后模块加载成功。模型名错误时没有名为 products 的模型，List 找不到绑定来源；查看 Controller 中的 `model.getProperty("/products").length` 仍得到 6，因为 inventory 模型正常。

把 List 恢复成 `{inventory>/products}`，六行随绑定出现。`inventory` 和 `products` 分别回答「用哪个模型」与「读取哪个字段」，不能互换。

</details>

### 练习 3：用静态产物重复一次查询

从阶段 6 工程开始，按下面「项目进度」构建并预览。验收：停止 UI5 开发服务后，静态服务器上的页面仍显示六行商品，P002 查询显示库存 0，Network 的核心资源返回 200。

<details>
<summary>提示</summary>

构建包含框架依赖，静态服务器的根目录应当是 dist。开发服务的虚拟 resources 路径要在构建中变成实际文件。

</details>

<details>
<summary>参考答案</summary>

运行 `npm run build`，再在 dist 目录启动 HTTP 服务。访问新的静态服务端口，确认地址不是原开发端口。

`ui5 build --all` 同时构建应用及依赖，产物包含 `resources/` 和应用文件，因此静态服务器可以提供所需资源。查询在浏览器执行，商品来自静态 JSON；停止开发工具不会移除浏览器端的业务逻辑。

</details>

## 项目进度

从 `examples/inventory/06-openui5/` 开始，修改本课的入口、组件、manifest、View、Controller 和模型文件。固定数据的初始总库存仍为 52，P002 售罄；查询只改变内存提示。

在阶段 6 目录执行静态构建与预览：

```sh
npm run build
cd dist
python3 -m http.server 8140 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8140/index.html`。预期仍有六件商品，P002 查询显示库存 0；停止开发服务后，这个地址仍能工作。所有资源来自这个静态目录。

[`ui5 build --all`](https://ui5.github.io/cli/v4/pages/GettingStarted/)生成应用与依赖的优化产物，包括 `Component-preload.js` 与框架资源；预加载文件减少逐文件请求；额外的 generateVersionInfo 任务补齐框架版本信息资源。

本阶段是独立的本地练习。发布到子目录时，保留完整 dist 与相对资源路径；业务仍在浏览器执行。

## 小结

- npm 安装工具；ui5.yaml 决定 CLI 提供的框架资源；manifest 声明浏览器应用配置。
- bootstrap 加载核心与初始化模块，ComponentSupport 创建应用组件。
- Component 组织初始化、模型与根 View；XML View 声明控件树。
- 列表的绝对路径选数组，行内相对路径读取当前商品；模型名与字段名分开。
- Controller 接事件，UI5 模块承载可复用逻辑；构建产物可以交给静态 HTTP 服务。

自测：

1. CLI 版本、YAML 的 specVersion、框架版本分别描述什么？
2. course.inventory.view.Inventory 对应哪个文件？谁建立了命名空间映射？
3. 为什么 `{inventory>name}` 能显示每一行，`{inventory>/name}` 却为空？
4. 为什么库存为空时要同时检查模型数据与控件绑定？
5. 开发服务停了，静态产物中的查看商品按钮为什么还能工作？

下一课把模型与绑定用于筛选、编辑、汇总和多语言，让这份库存列表开始处理业务修改。

## 延伸阅读

- [UI5 CLI：安装、项目接入与构建](https://ui5.github.io/cli/v4/pages/GettingStarted/)
- [UI5 CLI：OpenUI5 框架与库配置](https://ui5.github.io/cli/v4/pages/OpenUI5/)
- [UI5：Component 配置与初始化](https://ui5.github.io/docs/03_Get-Started/step-9-component-configuration-4cfa608.html)
- [UI5：应用 manifest 与 ComponentSupport](https://ui5.github.io/docs/03_Get-Started/step-10-descriptor-for-applications-8f93bf2.html)
- [UI5：模块定义与依赖加载](https://ui5.github.io/docs/03_Get-Started/step-6-modules-f665d0d.html)
- [OpenUI5 API：sap.m 控件与示例](https://openui5.hana.ondemand.com/#/api/sap.m)
