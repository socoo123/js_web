# C22 Props、组合与渲染模型 · 示例

配套正文：[C22](../../src/content/docs/05-react/c22-props-composition-render.md)。纯 JS 使用共享商品数据；React 文件在 [阶段 4](../inventory/04-react/)。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| props.js | node props.js | 解构参数、undefined/null 与默认值 |
| conditions.js | node conditions.js | 0、false、售罄与标签判断 |
| purity-broken.js、purity-fixed.js | node 对应文件 | 对照修改输入与只读计算 |
| prediction.js | node prediction.js | 练习 1 预测输出 |
| 阶段 4 src | npm run dev | 工具栏、列表、卡片与单向数据流 |
| 阶段 4 labs/props.html | dev 服务 | children、空列表、错误 props 与孤立 0 |
| 阶段 4 labs/render-commit.html | dev 服务 | 重复 render、标题变化、DOM 节点保留 |
| 阶段 4 tests | npm test | 正常商品、组合、空列表与输入只读回归 |

## 运行

- 仓库根目录：`npm run examples -- c22`，核对 5 个固定输出文件。
- 阶段 4：`npm ci`，再 `npm run dev -- --host 127.0.0.1`；打开终端给出的 /js_web/ 地址。
- 实验在上述地址后接 `labs/props.html`，case 查询值为 wrong、zero、empty；不加 case 时展示 count=0 与链接 children。
- 渲染实验：`labs/render-commit.html`，填写备注，Console 保存 `window.noteBefore = document.querySelector("#note")`；点两个按钮后比较节点身份与备注。
- 错误 props：`npm run test:bug -- labs/props.test.jsx`；空标签：`npm run test:bug -- labs/tags.test.jsx`。仓库保留故意错误的起点，两条各自预期失败；按正文修复后通过。
- 正常发布构建：阶段 4 执行 `npm test`、`npm run build`、`npm run preview -- --host 127.0.0.1`。labs 只由 dev 服务提供。

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；沿用 C21 的 React/react-dom 19.3.1、Vite 8.3.4 与 Vitest 5.0.5，依赖清单及各锁文件未改。
- `npm run examples -- c22` 5/5，阶段 4 正常 `npm test` 6/6。props 错误测试实际从失败到修复通过；临时加入 product.stock += 1，冻结输入测试抛 TypeError，恢复后 6/6。
- Chrome（桌面原生 DevTools）：首页显示六件商品及固定库存；props 实验的 count=0、链接 children、自定义空提示正确；wrong 页面最初六张机械键盘，修复后第二张无线鼠标、0 件、¥129.00。
- React Developer Tools 8.0.0：官方商店显示已安装；实际从 DevTools 的 More tabs 打开 Components，树为 PropsPreview → ProductListBroken → 六个 ProductCard；选中 key=P002 的卡片，其 product 误为 P001，父组件 products 为六项数组。Profiler 入口可见。
- render-commit 实验：重复 render 有日志，StrictMode 开发调用重复；标题切换后 Console 比较 same=true，备注值保持「先核对外设」。
- zero 页面最初显示孤立 0，tags.test.jsx 失败；改为 length > 0 后页面只剩标题，同一测试通过，最终恢复教学错误起点。
- 阶段 4 重装 npm ci、正常测试及生产构建通过；练习 3 加粗说明实际构建/预览后恢复参考基线，再次正常测试与构建通过。网站 lint 为 22 课零 error/warning，check 零诊断，build 固定输出 207/207、26 个 HTML 与 22 课产物检查通过；C22 正文 7,869 字符、16 个代码块，具名代码与示例逐字一致。
- 本地静态课程 HTTP 200，Chrome 显示新课与侧栏入口，6 个练习折叠区及路线页 22 / 48 已检查。
- 未运行：Firefox、Safari、Windows；Profiler 性能录制（本课只介绍入口）。
