# C26 状态提升、保留与重置 · 示例

配套正文：[C26](../../src/content/docs/05-react/c26-state-ownership-reset.md)。统一使用 shared/products.js；真实 React 组件在[阶段 4](../inventory/04-react/)。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| selected-id.js | node selected-id.js | 旧引用与从当前数组按 id 查找 |
| draft-boundary.js | node draft-boundary.js | 草稿提交后更新列表与统计 |
| prediction.js | node prediction.js | 显式保存、删除按 id 索引的草稿 |
| 阶段 4 src/App.jsx | dev / 生产首页 | editingId、单一编辑区、保存/取消/删除与焦点 |
| 阶段 4 src/ProductList.jsx、ProductCard.jsx | dev / 生产首页 | 受控选择与回调上报 id |
| 阶段 4 labs/ownership-main.jsx | 下表实验页 | 错误/正确设计与组件身份 |
| 阶段 4 tests/ownership.test.jsx | npm test | 7 条正常回归 |
| 阶段 4 labs/ownership-bugs.test.jsx | npm run test:bug -- labs/ownership-bugs.test.jsx | 两项故意失败，修复各 Broken 文件后通过 |

## 运行

- 仓库根目录：`npm run examples -- c26` 自动核对 3 个固定输出；本目录也可运行各 node 命令。
- 阶段 4：`npm ci`、`npm run dev -- --host 127.0.0.1`，打开终端的 /js_web/ 地址。
- 地址后加 labs/ownership.html?case=下表值；实验页仅由 dev 服务提供，不进入生产构建。
- 正常检查：阶段 4 执行 `npm test`、`npm run build`，再 `npm run preview -- --host 127.0.0.1`。

| case | 操作与预期 |
| --- | --- |
| local | 补货一次，鼠标显示 1 件，总库存错误保留 52 件 |
| shared | 补货一次为 1/53，再次为 2/54 |
| switch | 键盘名称改为键盘待盘点后选 P002，标题换成 P002，草稿错误保留键盘名称与库存 12 |
| switch-answer | 同样切换得到无线鼠标、0、129.00，错误清空；切回 P001 重新读取机械键盘 |
| identity | 盘点到 1 后切换强调仍为 1；更换容器重置为 0；隐藏后重显重新初始化 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1，沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3；依赖清单与锁文件未改动。
- 固定输出 3/3；阶段 4 正常回归 49/49、生产构建通过。两项 bug 回归先分别报总库存仍为 52、名称仍为键盘待盘点；按正文修复两份 Broken 文件后原测试 2/2 通过，随后恢复教学错误起点。
- 独立后台 Chrome 155.0.8059.82：按正文运行五个实验；同商品保留输入、跨商品重置整份草稿/错误、切换时名称焦点、单一表单与当前商品补货禁用通过；未操作已有 Chrome 窗口。
- 调试断点取得 LocalStockBroken 中 stock=1、product.stock=0；ProductForm 中 product.id=P002、product.name=无线鼠标、draft.name=键盘待盘点、draft.stock="12"。通过 Chrome 调试接口读取暂停帧，未在 DevTools 界面手动点击 Components 或 Sources。
- 首页执行正文项目步骤：P002 草稿 3/129.90 在排序后保留，总库存仍为 52；Enter 保存后总库存 55、总价值 26737.70 元，焦点到标题；重开读取已保存值。
- 删除其他商品保留草稿，删除当前商品关闭编辑并提示、聚焦标题；搜索隐藏 P001 后草稿仍在，取消聚焦标题，再开恢复机械键盘。卡片仍可见时取消返回编辑按钮；纯 Tab/Enter 打开、修改和保存通过，无页面异常。
- 网站内容 lint 26 课零 error/warning，check 零诊断，build 固定输出 225/225、31 个 HTML 与 26 课产物检查通过；正文 7760 字符、14 个代码块，13 个 JS/JSX 片段均与示例源码一致。
- 生产预览：切换商品重置、保存 P002 为 3/129.90 后得到 55 件、26737.70 元并聚焦标题；课程 HTTP 200，禁用 JS 后正文、14 段代码和六个折叠区可读可展开，路线为 26/48。
- Pages：[run 39037201320](https://github.com/socoo123/js_web/actions/runs/39037201320) build/deploy 成功；C26 与路线页均 HTTP 200，标题、草稿策略与项目结果已上线，路线为 26/48。
- 未运行：屏幕阅读器朗读、Firefox、Safari、Windows。
