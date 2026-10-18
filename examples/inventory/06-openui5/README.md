# 库存项目 · 阶段 6：OpenUI5

当前对应 **C40**：经典 UI5 的最小商品列表工程；Component/manifest、XML View、Controller 与独立模块已连接。筛选、编辑、i18n、路由和 V2 mock 留给 C41–C42。

## 运行

在本目录执行（Node 24、npm）：

```sh
npm ci
npm run dev
```

打开 `http://127.0.0.1:8040/index.html`。根路径可能显示目录列表。首次启动需联网取得框架依赖，之后使用 CLI 的本地缓存。

- 本目录的 package.json/package-lock.json 仅锁定本阶段的工具，不改变网站根工程。
- ui5.yaml 固定 OpenUI5 1.153.0 和框架库，CLI 4 在 Node 中提供资源，UI5 在浏览器运行。
- `webapp/model/products.json` 包含 `examples/shared/products.json` 的固定六件商品，外层是 `{ "products": [...] }`；总库存 52，P002 库存 0。
- `manifest.json` 创建 inventory 模型并异步读静态 JSON；Component 创建 ui 提示模型，两者向根 View 传播。
- 编号 P002 查询显示「P002 无线鼠标 · 库存 0 件」；空白、未知编号有反馈；列表不修改，刷新重新初始化。无远程业务服务。

## 构建与静态预览

```sh
npm run build
cd dist
python3 -m http.server 8140 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8140/index.html`。`--all` 包括框架依赖，generateVersionInfo 补齐框架版本信息；dist 含 resources 与应用预加载文件；保持相对路径可部署到子目录。只提交源码、配置与锁，不提交 dist、node_modules。

## 浏览器回归

详见 [C40 示例](../../c40/README.md)：复用阶段 4 已锁定的 Vitest/Playwright，以独立后台 Chrome 验证真实 UI5。阶段 6 不额外安装测试框架。
