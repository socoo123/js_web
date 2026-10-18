# 库存项目 · 阶段 6：OpenUI5

当前对应 **C42**：保留 C41 的筛选、草稿编辑、校验、汇总与 i18n，增加 manifest 列表/详情/未知地址路由、冷启动加载状态，以及独立的浏览器 OData V2 mock 实验。

## 运行

在本目录执行（Node 24、npm）：

```sh
npm ci
npm run dev
```

打开 `http://127.0.0.1:8040/index.html`。根路径可能显示目录列表。首次启动需联网取得框架依赖，之后使用 CLI 的本地缓存。

- 独立 package.json/package-lock.json 只属于本阶段；ui5.yaml 固定 OpenUI5 1.153.0，CLI 4 在 Node 提供资源，UI5 在浏览器运行。
- `webapp/model/products.json` 来自固定共享数据，外层是 `{ "products": [...] }`；初始总库存 52、总价值 2634800 分、P002 库存 0。
- App 根 View 只提供 App.pages；manifest routes/targets 加载 Inventory、Detail、NotFound。列表通过行上下文中的业务 id 导航，详情等待 inventoryReady 后查找当前数组位置。
- 直接打开 `index.html#/products/P002` 显示库存 0；P999 显示商品不存在，`#/wrong/path` 显示页面不存在。返回列表按钮 replace 到空路由；浏览器前进/后退继续可用。
- inventory/i18n 在 manifest 声明；Component 创建 ui；Controller 把独立 draft 放在 View，Fragment 通过 dependents 继承模型。保存前解析文本并校验，取消丢弃草稿，编号和标签保留。
- 搜索名称或编号，按 Enter/搜索按钮触发，多个字段用 OR；清空并搜索移除条件。汇总为当前完整匹配结果，未开启 growing/分页。
- 编辑 P002 库存为 3 并保存后，总库存 55、总价值 2673500 分；刷新恢复固定数据。所有修改只在页面内存，没有远程保存服务。
- 选择 English/中文后通过 sap-ui-language 参数重新加载，恢复初始商品；界面文案翻译，商品业务值保留。相对资源路径与当前 URL 构造保持子路径。

## OData V2 实验

打开开发服务的 `http://127.0.0.1:8040/test/odata.html`。本地 MockServer 先启动，再创建 V2 ODataModel。metadata.xml 声明 Products，mockdata/Products.json 从六件固定商品投影 id/name/category/stock/priceCents，未生成随机数据。

表格从 OData 绑定读六件商品；有限查询通过复合 AND、排序、top/select 读出 P006 5 件、P004 3 件。同字段过滤显式用 AND，避免默认 OR 分组。mock 数据与主页面 JSONModel 各自独立；本课只读，未接入 SAP 后端。MockServer 接管 XHR，不接管原生 fetch。完整 dist 也包含实验文件；test/localService 仅用于教学模拟。

## 构建与静态预览

```sh
npm run build
cd dist
python3 -m http.server 8140 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8140/index.html`。`--all` 包括框架依赖，generateVersionInfo 补齐版本信息；保留完整 dist 与相对路径可部署到子目录。只提交源码、配置与锁。

## 浏览器回归

在仓库根运行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c41/vitest.config.js`，需保持开发服务。复用阶段 4 已锁定的测试工具，缺依赖时在阶段 4 执行 npm ci；不再安装一套测试框架。

C42 回归在仓库根执行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c42/vitest.config.js`；可用 C42_BASE_URL 指定入口。开发与完整静态产物均可运行全套含 mock；源码故障注入仅用于开发服务。

生产、故障注入与验证记录见 [C42 示例](../../c42/README.md)和 [C41 示例](../../c41/README.md)。[C40 回归](../../c40/README.md)的取值已适配 Table，编号查询、固定商品与模块故障检查继续保留。
