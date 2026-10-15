# C01 JavaScript 的故事与生态地图 · 示例

配套正文：[C01](../../src/content/docs/01-history-web/c01-story-ecosystem.md)。必做只需编辑器和 Chrome；Node、Java 为可选对照，没有第三方依赖。

| 文件 | 操作 | 说明 |
| --- | --- | --- |
| index.html | 自己尝试 · 本地网页 | 双击打开，右键 → 检查 → Console |
| stock.js | 自己尝试 · Console；`node stock.js` 可选 | P001 机械键盘售出 3 件，剩余 9 |
| Stock.java | 讲解 · `java Stock.java` | Java 对照，输出同 stock.js |
| old-style.js | 讲解 · Console / Node | var 与同步回调 |
| host-probe.js | 自己尝试 · Console / Node | Array、document、process 的环境差异 |
| commonjs.cjs | 讲解 · Node | 导出函数，单独执行没有日志 |
| language-error.js | 自己尝试 · Console / Node | 故意拼错名字，预期 ReferenceError |
| language-fixed.js | 讲解 · Console / Node | 拼写修复 |
| host-error.js | 讲解 · Console / Node | 浏览器打印标题；普通 Node 预期 ReferenceError |
| prediction.js | 自己尝试 · Console / Node | 练习 1：浏览器的 document 类型为 object |
| stock-answer.js | 参考答案 · Console / Node | P004 售出 2 件，剩余 1 |
| environment-broken.js | 自己尝试 · Console / Node | 练习 2：浏览器输出两行，Node 输出库存后报错 |
| environment-answer.js | 参考答案 · Console / Node | 两种环境都只打印库存 |

## 运行

- 浏览器：打开 index.html，在 Console 按正文顺序输入代码；遇到重复声明错误时刷新页面，再运行完整代码。
- Node：在本目录运行 `node 文件名.js`。同名 `.expected.txt` 保存 **Node** 预期 stdout；错误文件首行标记预期错误类型，空输出文件表示报错前没有日志。
- CommonJS：在本目录运行 `node -e "console.log(require('./commonjs.cjs')(12, 3))"`，预期 9。
- Java：已有 JDK 11 及以上时，在本目录运行 `java Stock.java`。
- T0 尚未实现 `npm run examples -- c01`；当前预期输出由本次临时核对脚本逐个执行比较，未新增课程依赖。

## 练习验收

| 输入 / 环境 | 预期 |
| --- | --- |
| stock-answer.js 默认 | USB-C 扩展坞 / 1 / 剩余库存：1 |
| stock-answer.js 改为 sold = 0 | USB-C 扩展坞 / 3 / 剩余库存：3 |
| prediction.js 浏览器 / Node | 最后一行为 object / undefined，其余相同 |
| environment-broken.js 浏览器 | 剩余库存：9 / C01：我的 JavaScript 实验页 |
| environment-broken.js Node | 先输出剩余库存：9，再抛 document 的 ReferenceError |
| environment-answer.js 默认 / 卖出量 0 | 剩余库存：9 / 剩余库存：12 |

## 验证记录

- 2026-10-15 · macOS arm64 · Node 24.22.0：10/10 个 `.expected.txt` 与执行结果一致；三个故障文件均按预期非零退出。CommonJS 命令、单独导出文件与 environment-broken.js 另行运行，结果符合上表。
- 同日 · Chrome 155.0.8059.40（headless，经 DevTools 协议驱动）：实际 HTML 的标题、段落、`1 + 2` 正确；正文涉及的 10 个 JS 脚本按顺序以 Console REPL 模式执行，日志及预期错误正确；库存脚本没有改动页面标题。
- 浏览器和 Node 均运行两道练习的卖出量 0 变体，输出与上表一致。
- 同日 · Java 21.0.2：`java examples/c01/Stock.java` 输出机械键盘 / 9 / 剩余库存：9。
- 工具职责、历史与标准状态：已核对官方来源，见正文链接及 docs/SOURCES.md。
- 未运行：DevTools 界面手动点击（路径按 Chrome 官方文档核对）、Edge、Firefox、Safari、Windows、Bun 命令；本课没有 React/UI5 项目运行示例。
