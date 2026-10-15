# C01 练习与验证

对应文章：[C01 JavaScript 的故事与生态地图](../../src/content/docs/01-history-web/c01-story-ecosystem.md)。主线只需要浏览器和文本编辑器，无第三方依赖；Node 与 Java 操作是可选对照。

## 自己尝试 · 浏览器 Console

1. 用 Chrome 或 Edge 打开本目录 `index.html`。
2. 右键页面 → 检查 / Inspect → Console。
3. 先输入 `1 + 2`，预期得到 `3`。
4. 逐段输入 `stock.js`、`host-probe.js` 的内容；不要把文件名当代码输入。
5. 改变库存数据、预测输出再执行，完成文章练习 A/B/C。

Console 的执行不会自动保存到文件；要保留修改，仍需用编辑器修改 `.js` 文件。这里只观察计算与日志，页面不会自动更新数字。`index.html` 不加载脚本，普通本地文件打开即可；无需开发服务或 `npm install`。

## 自己尝试 · 本地 Node（选做）

前置：你的电脑已有 Node。没有 Node 可跳过，C17 再安装。以下命令**工作目录为仓库的 `examples/c01/`**：

```sh
node --version
node stock.js
node host-probe.js
node old-style.js
node -e "console.log(require('./commonjs.cjs')(12, 3))"
node stock-answer.js
```

不要连续执行两个故障文件来判断“是否全部通过”：下列命令**分别执行且预期非零退出**，错误文件用于教学：

```sh
node language-error.js
```

预期：`ReferenceError: productNmae is not defined`。重新执行正常的 `stock.js`，确认完整声明与使用恢复正常。

```sh
node host-error.js
```

预期：`ReferenceError: document is not defined`。同一 `document.querySelector("h1")` 表达式在本课浏览器页面可以找到标题，说明宿主能力不同。

常见失败：`node` 找不到是终端环境问题；脚本找不到先检查目录和文件名；CommonJS 文件单独执行没有日志是预期行为，因为它只导出函数。

## 讲解示例 · Java 对照

前置：已有 JDK。验证时在**仓库根目录**执行，编译产物放到被忽略的 `.cache/`：

```sh
mkdir -p .cache/qa/java
javac -encoding UTF-8 -d .cache/qa/java examples/c01/Stock.java
java -cp .cache/qa/java Stock
```

预期三条输出与 `stock.js` 相同。学习本课不用为这个对照安装 JDK。

## 实际验证记录

日期：**2026-10-15**。环境：macOS arm64；Chrome **155.0.8059.40**（独立 headless 页面执行脚本）、Node **23.11.0**、JDK **21.0.2**。Node 版本是作者机器的真实执行环境；后续课程工程仍计划核对并采用 Node 24 LTS。

| 文件 / ID | 操作方式 | 状态与实际结果 |
| --- | --- | --- |
| `index.html` / H01 | 自己尝试 · 本地网页 | 已验证：标题与段落存在；`1 + 2` 为 3 |
| `stock.js` / S01 | 自己尝试 · 浏览器；Node 选做 | 两种环境已验证：键盘 / 9 / 剩余库存：9 |
| `Stock.java` / J01 | 讲解示例 · Java | 已编译并执行：输出同 S01 |
| `host-probe.js` / S02 | 自己尝试 · 浏览器；Node 选做 | Chrome：function / object / undefined；Node：function / undefined / object |
| `language-error.js` / E01 | 自己尝试 · 错误定位 | Chrome、Node 均按预期抛 ReferenceError；正常脚本复跑成功 |
| `host-error.js` / E02 | 讲解示例 · 环境差异 | Node 按预期抛 ReferenceError；Chrome 找到 h1 |
| `old-style.js` / S03 | 讲解示例 · 旧代码阅读 | 两种环境已验证：键盘剩余库存：12 |
| `commonjs.cjs` / S04 | 讲解示例 · Node CommonJS | `require` 后调用输出 9；单独执行无日志 |
| `stock-answer.js` / A01 | 讲解答案 · 浏览器 / Node | 两种环境已验证：鼠标 / 16 / 剩余库存：16；售出改为 0 后为 20 |

浏览器验证在同一本课 HTML 页面上下文自动执行相同代码并核对日志、异常和 DOM 结果；没有把这项自动验证写成手动 DevTools 点击测试。操作路径已核对 [Chrome 官方文档](https://developer.chrome.com/docs/devtools/console/javascript)。Edge、Bun 没有实际执行，概念题与旧代码背景为资料核对。

本文是示例复现记录，不引入测试运行器。课程中的 Vitest/RTL 等 UT 教学从后续课程开始。C01 初稿曾单独检查静态 Markdown 预览；随后已完成 Astro/Starlight 生产构建与 Pages 上线验证，站点验收见 [STATUS](../../docs/STATUS.md)，不改变本表所列示例执行环境。
