# C37 组件生态与选择标准 · 示例

配套正文：[C37](../../src/content/docs/06-components-ui5/c37-component-ecosystem-selection.md)。复用固定商品数据；不安装候选组件库、不增加依赖或 D2，不改阶段 4。

| 文件 | 运行 | 结果 |
| --- | --- | --- |
| row-identity.js | `node row-identity.js` | 排序首行 P002，错误按位置选 P001，正确按 id 选 P002 |
| price-sort.js | `node price-sort.js` | 文本顺序与金额顺序不同；整数分保留 number |
| acceptance.js | `node acceptance.js` | 鼠标库存改 3 后总库存 55、总价值 2673500 分；原数据 0 |
| select-product.js / select-product-broken.js | 被实验引入 | 正确选择器与故意保留的位置错误 |
| selection.html / selection.js / selection.css | 本地网页 | 原生 table/dialog 基线、草稿、输入校验、焦点与主题 |
| select-product.test.js / vitest.config.js | 以下命令 | 3 条商品身份回归 |

## 运行

- 在本目录运行三个 Node 文件；仓库根运行 `npm run examples -- c37` 自动核对 3 份固定输出。
- 仓库根运行 `python3 -m http.server 8037 --bind 127.0.0.1`，打开 `http://127.0.0.1:8037/examples/c37/selection.html`；错误入口在网址后加 `?case=broken`。
- 正确入口按 id 选记录；错误入口引入 select-product-broken.js。按正文修复它、刷新后重试；仓库保留错误版本供教学。
- 沿用阶段 4 的 Node 24/npm 11 与锁文件，先在 `examples/inventory/04-react` 运行 `npm ci`，再回仓库根执行：

```sh
node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c37/vitest.config.js
```

- 故障实验：把 test 文件的选择器导入改为 `./select-product-broken.js`，同命令应失败；修复选择器后同命令应通过，结束可恢复原始教学文件。
- 表格和弹窗是原生网页验收基线，不是六个候选库的实现。候选库只做官方资料比较；完整 Ant Design 接入属于 C38。
- 网页只在内存更新库存，刷新还原初始数据；未复刻阶段 4 的完整表单、请求或持久化。

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0 / npm 11.19.1：固定输出 3/3、Vitest 5.0.5 的 3 条回归通过。将同一测试导入改为错误选择器时 3/3 失败，恢复后 3/3 通过。
- 同日 · 独立后台 Chrome 155.0.8059.82：错误页排序后点鼠标显示键盘；在 openEditor 的 editingId 赋值前实际暂停，row.id=P002、row.index=0、product.id=P001、原数组首项=P001。
- 同日：正确页 Enter 打开鼠标、初始字段聚焦 0、Tab/Shift+Tab 移动、Esc 取消/恢复焦点与重开 0 通过；空值、-1、3.8、100000 均保留页面并提示/聚焦；0 可保存，3 保存后总库存 55、价值 26735.00 元且键盘库存仍 12；保存重建列表后恢复触发按钮焦点。
- 同日：深色页面/dialog 的计算背景均 rgb(23,32,51)，1280px/360px 截图与无整页横向溢出检查通过；刷新回初始 52/26348.00，无页面 JS 异常。
- 同日：正文的 npm view 命令读取 React/react-dom >=18.0.0、MIT；完整查询 version 得到 antd 6.6.6，动态事实来源见 docs/SOURCES.md。
- 同日：课程 lint 零 error/warning（C37 正文 7947 字符、14 个代码块）；Astro check 零诊断；全站固定输出 266/266、build 与 43 页产物检查通过；5 个带文件名的正文代码块与示例逐字一致。生产预览 C37 HTTP 200，1280px/360px 无整页横向溢出，6 个折叠区与禁用 JS 阅读通过；路线页 37/48 且 C37 链接正确，无失败资源。
- 未运行：六个第三方组件库的实际接入、屏幕阅读器、Firefox、Safari、Windows。
