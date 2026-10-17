# 库存项目 · 阶段 4：React

当前参考状态：C21 完成。使用 Vite + React 的 JavaScript 入口，展示固定数据中的 P001 商品卡片；后续课程在本目录逐步加入列表、状态、表单与请求。

## 运行

需要 Node 24、npm 11。在本目录执行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

打开终端给出的地址，通常是 `http://127.0.0.1:5173/js_web/`。预期：库存管理、机械键盘、P001、外设、库存 12 件、单价 ¥399.00。

其他命令也在本目录执行：

| 命令 | 作用与结果 |
| --- | --- |
| npm run inspect | 不使用 JSX，在 Node 中观察 React 元素的 type、props 和 DOM 方法缺失 |
| npm test | 正常卡片内容回归，1 条通过；不包含故意失败的 labs |
| npm run build | 应用首页构建到本目录 dist，包含 source maps |
| npm run preview -- --host 127.0.0.1 | 读取已有 dist，通常为 http://127.0.0.1:4173/js_web/ |
| npm run test:bug | 运行 labs/name.test.jsx，原始版本预期失败；修复后通过 |

## 文件与边界

- index.html → src/main.jsx → App → ProductCard。StrictMode 保留，Fragment 不增加 DOM 包装。
- src/ProductCard.jsx 从 `../../shared/products.js`（相对阶段目录）读取固定数据，没有另存一份数据；组件文件里的实际路径为 `../../../shared/products.js`。
- vite.config.js 使用 /js_web/ 基础路径，开发服务允许读取 examples 内的共享模块；本阶段的锁与网站根锁独立。
- 普通 CSS 保留盒模型与移动端空间；React 组件描述结构，浏览器继续负责布局。
- npm run build 的正常入口只有首页。labs/jsx.html 是本地 dev 实验页，不进入生产构建。
- 本阶段产物未部署到课程 Pages；网站发布的是静态教程正文。

## JSX 实验

使用 dev 服务，打开下表路径；端口以终端输出为准。

| 地址（在 /js_web/ 后） | 起点与预期 |
| --- | --- |
| labs/jsx.html | Expressions 与 StylePreview：P002 为 0 件，两个 title 不同，动态 style |
| labs/jsx.html?case=name | ProductCardBroken：文字 product.name、title 机械键盘；修复后两处都是机械键盘 |
| labs/jsx.html?case=return | ReturnBroken：只见实验标题，组件返回 undefined |
| labs/jsx.html?case=answer | ReturnFixed：用括号保留返回表达式，显示机械键盘 |

错误起点保留在仓库，练习后可自行恢复。验证细节见 [examples/c21](../../c21/README.md)。
