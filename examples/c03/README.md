# C03 值、类型、转换与比较 · 示例

配套正文：[C03](../../src/content/docs/02-language-data/c03-values-types.mdx)。纯 JS 文件既可以粘贴到浏览器 Console，也可以用 Node 运行；没有第三方依赖。

V3 正文直接使用的文件：

| 文件 | 正文位置 | 说明 |
| --- | --- | --- |
| types.js | 第 1 节可运行片段 | 浏览器内可运行，输出同 `.expected.txt` |
| number-predict.js | 第 2 节「先猜一猜」 | 代码块与文件逐字一致，答案面板读取 `.expected.txt` |
| convert-predict.js | 第 3 节「先猜一猜」 | 同上 |
| parse-stock.js | 第 3 节 Console 面板 | 直接导入 C03 参考解的 `parseStock`，七种输入的结果；含 `import`，只用 Node 运行 |
| defaults.js | 第 4 节可运行片段 | 浏览器内可运行 |
| compare.js | 第 5 节代码块与 Console 面板 | 代码块与文件逐字一致 |

全部示例：

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| types.js | `node types.js` | 动态类型、typeof 的特例、拼错属性名 |
| number-predict.js | `node number-predict.js` | 除法、浮点误差、整数分、安全整数、BigInt 除法 |
| convert-predict.js | `node convert-predict.js` | `+` 拼接、`-` 转换、Number 与 parseInt |
| parse-stock.js | `node parse-stock.js` | C03 参考解 `parseStock` 的有效与无效输入 |
| compare.js | `node compare.js` | 严格相等、宽松相等、NaN、对象身份 |
| numbers.js | `node numbers.js` | Number 的除法、浮点、Infinity、NaN |
| money.js | `node money.js` | 金额用整数分，折扣取整，toFixed 返回字符串 |
| bigint.js | `node bigint.js` | 安全整数、long 型 ID 经过 JSON.parse 失真、BigInt |
| conversion.js | `node conversion.js` | `+` 拼接、Number 与 parseInt |
| parse-quantity.js | `node parse-quantity.js` | 转换后校验：非空、整数、范围 |
| defaults.js | `node defaults.js` | `\|\|` 与 `??`、truthy/falsy |
| equality.js | `node equality.js` | `==`、`===`、NaN、Object.is |
| identity.js | `node identity.js` | 对象按身份比较 |
| prediction.js | `node prediction.js` | 练习 1 |
| inventory-broken.js | `node inventory-broken.js` | 练习 2 的起始代码（输出是错误结果） |
| inventory-answer.js | `node inventory-answer.js` | 练习 2 参考答案 |
| restock.html + restock.js | 本地网页 | 数值转换后的补货；原始故障复现见下文 |
| restock-fixed.js | 参考 | 修复后的 restock.js |
| JavaNumbers.java | `java JavaNumbers.java` | 第 2 节 Java 对照表 |

## 运行

- Node：在本目录执行上表命令；在仓库根目录执行 `npm run examples -- c03`，用各文件的 `.expected.txt` 自动核对输出。
- 浏览器 Console：在 Chrome 打开任意网页，按正文顺序粘贴。
- 本地网页：在本目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/restock.html`。
- Java：需要 JDK 11 及以上，在本目录运行 `java JavaNumbers.java`。

当前 `restock.js` 保留已完成的数值转换：库存 12 补货 3 显示 15。要复现正文中的 123 问题，先把加法行改回 `stock = stock + amount;`，再按正文设置断点。带完整输入校验的实现见 `restock-fixed.js`。

## 练习 2 的验收输入

| 改动 | 参考答案的输出 |
| --- | --- |
| 默认（`rawAmount = "3"`） | `补货后库存 3`、`库存价值 387.00 元` |
| `rawAmount` 为 `"3.8"`、`""`、`"3件"`、`"  "`、`"0"` | `补货数量无效` |
| `rawAmount` 为 `" 3 "` | 与默认相同 |
| 删掉 `stock` 字段 | `补货后库存 15`、`库存价值 1935.00 元` |

## 验证记录

- 2026-10-15 · Node 24.22.0 · macOS arm64：12 个 `.js` 文件的 stdout 与 `.expected.txt` 一致；练习 2 参考答案按上表 7 种输入逐一运行，结果一致。
- 2026-10-15 · Chrome 155（headless，经 DevTools 协议驱动）：
  - 12 个 `.js` 文件分别在空白页执行，输出与 `.expected.txt` 一致。
  - 正文的 Console 尝试步骤得到 `string`；按正文顺序把全部代码块粘贴到同一页（REPL 模式）没有重复声明错误。
  - `restock.html`：第 9 行断点命中 `handleRestock`，Local 中 `amount` 为字符串 `"3"`，Script 中 `stock` 第一次为数字 12、第二次为字符串 `"123"`；页面依次显示 123、1233。
  - 换成 `restock-fixed.js` 后，补货 3 显示 15；输入 `""`、`"3.8"`、`"0"` 时提示「请输入 1–99999 的整数。」，库存保持 15。
- 2026-10-15 · Java 21.0.2：`java JavaNumbers.java` 输出 `2`、`0.30000000000000004`、`Infinity`、`NaN`、`0.3`、`ArithmeticException: / by zero`、`NumberFormatException: For input string: "3件"`。
- 2026-10-19 · 按用户要求提交已有的 `Number(amount)` 修改。Node 24.22.0 下固定输出 12/12 与语法检查通过；Chromium 156.0.8078.4 实际打开本地网页，连续补货 3 后库存依次为 15、18，反馈正确，无页面异常。原始故障的历史记录保留，复现方式见上文。
- 未运行：在 DevTools 界面上手动点击的操作路径（面板名称按 Chrome 官方文档核对）、Firefox、Safari、Windows。

## V2 工作区试做

- 2026-10-28 · 发行版 `2026.10-v2.1` · 起点 `C02` → 终点 `C03`；工作区检查与卡片有效/空白/非法输入通过。原例子保留为可选参考，不是当前主线工作目录。
- 在练习工作区执行 `npm run lab -- check C03`。教师从起点按正文片段跟做并修改实际文件验证先红后绿：`npm run test:lab-walkthrough`。
- 详细环境、错误证据、范围与限制见 [V2 验证](../../labs/records/README.md)。C23/C41 的试做前置单独提供，连续路线仍需 R6/R7 验收。

## V2 连续工作区

2026-10-28 · 发行版 2026.10-v2.2：本课在 `labs/inventory/` 持续修改，`npm run lab -- check C03` 检查实际文件。C00→C20 的单目录正文跟做、错误证据与修复见 [R5 验证](../../labs/records/R5.md)。Java 完整源文件在 labs/reference/java，已用 Java 21.0.2 执行；旧例子保留为可选参考。网站使用原 URL 与 F1 课号。

## V3 范例课改写

2026-11-06 · V3 第 1 阶段（路 4 改写，待主验收）。正文改为「主张 → 代码 → 效果 → 原因 → Java 对照」，课号、URL、全部锚点、知识点、Java 对照主题、主错误、练习和验收数字不变。旧页首引用块改为 frontmatter `lesson`，下载、恢复等操作细节交给任务卡。

- 环境：macOS arm64、Node 24.22.0、Playwright 1.64.1 / Chromium 156.0.8078.4（headless）。
- `npm run examples -- c03`：16/16 通过，含新增 4 个文件。正文 3 个 js 代码块与 number-predict、convert-predict、compare 逐字一致；两个可运行片段 types、defaults 不含 Node API。
- 课程 lint（V3 规则，结构类规则为 error）：0 error、0 warning；正文 4804/8000 字符（集成后组件里的文字也计入）、16 个代码块，段落最长 99 字。
- 正文跟做：从 C02 参考快照恢复到临时目录，只按正文加入第 3 节 `parseStock`、用参考答案两个函数替换旧 `restockProduct`。
  - 改前 `node tools/lab.mjs check C03` 失败（exit 1），页面 12 补 3 显示「库存 123 件」。
  - 按调试第 2 步在 `restockProduct` 的 return 行（第 8 行）设断点：`typeof text` 为 string、`text` 为 "3"、`product.stock` 为数字 12，与正文一致。
  - 改后检查通过（21 条）；页面 12 补 3 得 15，库存价值 478800 → 598500 分；空白、3件、-1、3.5 分别显示两种 RangeError 原因，库存保持 15，无页面异常。
- 效果截图 `c03/before`、`c03/after` 由 `npm run capture:previews` 从 C02、C03 参考快照拍摄（360 与 768 两种宽度，窄屏读者默认看到 360），定义见 `labs/previews/c03.json`。
- Java 对照核对（Java 21.0.2 实际执行临时文件）：`5 / 2` 得 2；`Objects.requireNonNullElse(0, 12)` 得 0、传 null 得 12；`Integer.parseInt("3件")` 抛 NumberFormatException；两个内容相同的对象 `==` 为 false；字符串 `equals` 比内容为 true。
- 集成构建上的页面检查（严格静态服务 `dist`，headless Chromium）：
  - 页首显示「第 1 周 · 第 2 天」、L1 链接和 frontmatter 四项；没有旧页首。
  - 2 个「先猜一猜」默认收起，点击后显示答案；4 个 Console 面板与 `.expected.txt` 逐行一致。
  - `types`、`defaults` 在页面里运行，7 行、4 行全部与已验证输出一致；编辑后多打印一行会标出 1 行不同，重置恢复。
  - 360/768/1280px × 亮/暗无横向溢出、无页面异常。禁用 JavaScript 时页首完整，答案仍能展开，可运行片段隐藏按钮、显示源码和已验证输出。
- 未运行：DevTools 界面手动点击（断点与 Scope 经 DevTools 协议读取）、Firefox、Safari、Windows。
