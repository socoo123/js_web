# 库存项目 · 阶段 6：OpenUI5

当前对应 **C41**：在 C40 Component/manifest/XML View 工程上增加 Table 筛选、编辑 Dialog、独立草稿、字段校验、当前结果汇总与中英文资源。路由和 V2 mock 留给 C42。

## 运行

在本目录执行（Node 24、npm）：

```sh
npm ci
npm run dev
```

打开 `http://127.0.0.1:8040/index.html`。根路径可能显示目录列表。首次启动需联网取得框架依赖，之后使用 CLI 的本地缓存。

- 独立 package.json/package-lock.json 只属于本阶段；ui5.yaml 固定 OpenUI5 1.153.0，CLI 4 在 Node 提供资源，UI5 在浏览器运行。
- `webapp/model/products.json` 来自固定共享数据，外层是 `{ "products": [...] }`；初始总库存 52、总价值 2634800 分、P002 库存 0。
- inventory/i18n 在 manifest 声明；Component 创建 ui；Controller 把独立 draft 放在 View，Fragment 通过 dependents 继承模型。保存前解析文本并校验，取消丢弃草稿，编号和标签保留。
- 搜索名称或编号，按 Enter/搜索按钮触发，多个字段用 OR；清空并搜索移除条件。汇总为当前完整匹配结果，未开启 growing/分页。
- 编辑 P002 库存为 3 并保存后，总库存 55、总价值 2673500 分；刷新恢复固定数据。所有修改只在页面内存，没有远程保存服务。
- 选择 English/中文后通过 sap-ui-language 参数重新加载，恢复初始商品；界面文案翻译，商品业务值保留。相对资源路径与当前 URL 构造保持子路径。

## 构建与静态预览

```sh
npm run build
cd dist
python3 -m http.server 8140 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8140/index.html`。`--all` 包括框架依赖，generateVersionInfo 补齐版本信息；保留完整 dist 与相对路径可部署到子目录。只提交源码、配置与锁。

## 浏览器回归

在仓库根运行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c41/vitest.config.js`，需保持开发服务。复用阶段 4 已锁定的测试工具，缺依赖时在阶段 4 执行 npm ci；不再安装一套测试框架。

生产、故障注入与验证记录见 [C41 示例](../../c41/README.md)。[C40 回归](../../c40/README.md)的取值已适配 Table，编号查询、固定商品与模块故障检查继续保留。
