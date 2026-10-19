# 阶段 7 · UI5 Web Components for React 库存编辑

对应 C44。C43 原生组件实验保留在 `../../c43/lab`；本目录与阶段 5、6 对照同一库存业务，复用阶段 4 的 `src/product-form.js`，固定数据来自 `../../shared/products.js`。

## 运行

在本目录，用 Node 24、npm 执行：

```sh
npm ci
npm run dev
```

打开 `http://127.0.0.1:8044/`。选择 P002，将库存从 0 改成 3 并保存：总库存 55，价值 26735.00 元。初始值为 52、26348.00 元。非法输入显示错误并聚焦；切换商品会丢弃未保存草稿；数据仅保存在页面内存，刷新恢复。

- `npm test`：业务校验、不可变更新、标签保留与汇总回归。
- `npm run test:e2e`：独立后台 Chrome 的真实控件、事件、提交、草稿与资源回归，需要本机 Chrome。
- `npm run build`：生成相对资源路径的完整 dist（含动态 chunks 与源码映射）。
- `npm run test:e2e:production`：先 build，再测试 `/js_web/ui5-react/` 下的静态构建。
- `npm run preview`：普通预览，地址 `http://127.0.0.1:8144/`。

网站根清单和锁独立，本目录有自己的 npm 锁。主题/翻译来自包内 Assets；没有远程库存服务或 SAP 登录。

## 文件入口

- `src/App.jsx`：业务数组、选择、搜索、派生汇总与保存；`ProductList.jsx`：detail.item 上的业务 id。
- `src/ProductEditor.jsx`：文本草稿、Form/FormItem 布局、原生 form 提交、错误关联与焦点。
- `src/editor-state.js`：复用校验，创建新数组；`src/Settings.jsx`：主题、组件语言、加载错误。
- `src/main.jsx`：ThemeProvider、Assets 与 save 图标；`src/styles.css`：响应式与主题变量。
- `static-server.js`：仅用于子路径生产回归，严格映射 dist，无 SPA 回退。

详细运行与未运行范围见 [examples/c44](../../c44/README.md)。
