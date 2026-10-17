# 库存项目 · 阶段 4：React

当前参考状态：C23 完成。App 组合工具栏、盘点计数和商品列表。InventoryCounter 用 useState 保存本次操作次数，支持立即、连续和延时累计；商品数组的编辑在后续课程推进。

## 运行

需要 Node 24、npm 11。在本目录执行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

打开终端给出的地址，通常是 `http://127.0.0.1:5173/js_web/`。预期：盘点计数从 0 开始；共 6 种商品，库存依次为 12、0、7、3、25、5；P002 显示已售罄、¥129.00，P001 显示 ¥399.00。先安排两秒后记录三次，再立即记录三次与一次，计数先为 4，随后为 7；刷新归零。

其他命令也在本目录执行：

| 命令 | 作用与结果 |
| --- | --- |
| npm run inspect | 不使用 JSX，在 Node 中观察 React 元素的 type、props 和 DOM 方法缺失 |
| npm test | 正常卡片、组合与状态交互回归，14 条通过；不包含故意失败的 labs |
| npm run build | 应用首页构建到本目录 dist，包含 source maps |
| npm run preview -- --host 127.0.0.1 | 读取已有 dist，通常为 http://127.0.0.1:4173/js_web/ |
| npm run test:bug -- labs/props.test.jsx | C22 传错商品的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/tags.test.jsx | C22 孤立 0 的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/name.test.jsx | C21 JSX 文字错误的回归，原始版本预期失败；修复后通过 |
| npm run test:bug -- labs/state-bugs.test.jsx | C23 连续/延时补货的两项回归，原始版本失败；参数累加后通过 |

## 文件与边界

- index.html → src/main.jsx → App → InventoryToolbar / ProductList → ProductCard。StrictMode 保留，Fragment 不增加 DOM 包装。
- src/App.jsx 从 `../../../shared/products.js` 读取固定数据，向下传递；ProductCard 只读 product prop，标题 id 按商品编号区分。
- InventoryCounter 的 count 是独立 UI 状态，不修改商品库存；两个实例各自记数。三个按钮分别提交一次加一、三次加一及定时器中的一次加三。
- vite.config.js 使用 /js_web/ 基础路径，开发服务允许读取 examples 内的共享模块；本阶段的锁与网站根锁独立。
- 普通 CSS 保留盒模型与移动端空间；React 组件描述结构，浏览器继续负责布局。
- npm run build 的正常入口只有首页。labs 的 HTML 是本地 dev 实验页，不进入生产构建。
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

## Props 与渲染实验（C22）

| 地址（在 /js_web/ 后） | 起点与预期 |
| --- | --- |
| labs/props.html | count=0、链接 children、P001/P002 各自内容 |
| labs/props.html?case=empty | 自定义空提示，无卡片 |
| labs/props.html?case=wrong | 六张 P001；修复 ProductListBroken 后各自显示商品 |
| labs/props.html?case=zero | 空标签显示孤立 0；修复 TagsBroken 后隐藏 |
| labs/render-commit.html | 两个根外按钮触发 render；备注文字和输入节点在标题变化后保留 |

渲染实验用 root.render 显式触发相同/不同输入，项目交互随后使用 state。正常 tests 使用静态输出验证内容与只读输入，浏览器步骤验证 DOM 保留。详细记录见 [examples/c22](../../c22/README.md)。

## 状态与更新实验（C23）

打开 labs/state.html?case= 后接 basic、snapshot、queue、queue-answer、delay、delay-answer、mixed、rules 或 independent。每次重新预测先刷新，补货起点统一为 P001 的 12 件。

queue 和 delay 保留错误起点；对应 answer 提供正确结果。snapshot 的旧日志是有意保留的点击时快照。完整地址、操作与结果见 [examples/c23](../../c23/README.md)。

tests/state.test.jsx 使用 happy-dom 和 React act 检查真实组件事件；辅助文件在每个用例结束后卸载根、清理定时器并恢复时钟。它不替代 Chrome 对页面与断点的验证。RTL 的系统用法留到测试课。
