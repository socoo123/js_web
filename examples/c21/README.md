# C21 React 来由、JSX 与第一个组件 · 示例

配套正文：[C21](../../src/content/docs/05-react/c21-react-jsx-components.md)。React 与 JSX 文件在 [阶段 4](../inventory/04-react/)，本目录纯 JS 无第三方依赖。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| view-data.js | node view-data.js | 固定商品的名称、库存、单价与库存价值 |
| prediction.js | node prediction.js | 字面文本与字段值、P002 库存 0 |
| dom.html、dom.js | 本地网页 | 原生 querySelector/textContent 对照 |
| 阶段 4 src | npm run dev | 函数组件、根入口、Fragment、固定卡片 |
| 阶段 4 labs | dev 的 /js_web/labs/jsx.html | 表达式/style 实验与两个错误起点 |
| 阶段 4 labs/inspect-elements.js | npm run inspect | createElement 观察，对应同名 expected.txt |
| 阶段 4 tests | npm test | 正常卡片内容回归 |

## 运行

- 仓库根目录：`npm run examples -- c21`，核对两个 Node 示例输出。
- 原生对照：仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c21/dom.html`；服务根需包含 examples/shared。
- 阶段 4：`npm ci`、`npm run dev -- --host 127.0.0.1`；完整实验地址和命令见该目录 README。
- 构建与预览：阶段 4 执行 `npm test`、`npm run build`、`npm run preview -- --host 127.0.0.1`，打开终端的 /js_web/ 地址。
- 新建模板：在仓库外练习目录执行正文的 npm create 命令、进入新目录 install/dev。跟做卡片时将 shared/products.js 复制到 src/products.js 并调整 import。

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；阶段 4 锁定 React/react-dom 19.3.1、Vite 8.3.4、@vitejs/plugin-react 6.1.2、Vitest 5.0.5。网站根清单与根锁未改。
- 仓库外实跑 create-vite 9.2.1 的 react 模板创建、npm install、开发欢迎页与生产构建；模板标题是 Get started，React 与 Vite 资源正常。
- `npm run examples -- c21` 2/2；全站固定输出 202/202，lint/check/build 通过，25 个 HTML、21 课产物检查通过。阶段 4 重装 npm ci、inspect 输出、正常 npm test 1 条和生产构建通过。
- Chrome 155.0.8059.82（headless，DevTools 协议）：原生对照、阶段 4 dev/preview 均显示机械键盘、12 件、¥399.00；main 直接子节点为 H1、P、ARTICLE，Fragment/StrictMode 无包装。
- JSX 实验的 title 字面量/表达式、P002 库存 0、false/null 空内容、数字 0、style 颜色与 8px 均符合正文；替换 P001 得到 12 件/399.00，改颜色经 HMR 更新。开发模块响应是 JSX helper 调用，article/className/子内容和内联 source map 可对应。
- name 错误页标题为 product.name、title 为机械键盘；生成代码返回位置断点两次命中，求值 product.name 均为机械键盘。补大括号后页面正确，同一 test:bug 从失败到通过；正常卡片测试也能抓住此错误改动。
- ReturnBroken 实际返回 undefined，页面没有 h2；括号修复与 answer 页面显示机械键盘。删除结束 p 实际触发 Vite 遮罩与 500，恢复后正常；错误文件最终恢复教学起点。
- 练习 3 实际构建与预览新增库存价值 ¥4788.00，之后恢复 C21 基线并重建。原生与正常 React 页面无 JS 异常或失败资源，360px 卡片无横向溢出；C21 静态教程禁用 JS 后正文与 6 个答案折叠区保留。
- 未运行：DevTools UI 中的手工点击/单步路径（按 Chrome 官方文档核对）、Firefox、Safari、Windows。本课发布教程正文，库存应用只在本地运行。
- Pages：待推送后核验。
