# C04 变量、作用域与控制流 · 示例

配套正文：[C04](../../src/content/docs/02-language-data/c04-scope-control.md)。纯 JS 文件无第三方依赖，可以整段粘贴到浏览器 Console，也可以用 Node 运行。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| bindings.js | `node bindings.js` | let 重新赋值、const 对象修改与赋值错误 |
| scope.js | `node scope.js` | 向外查找与同名遮蔽 |
| var.js | `node var.js` | 函数作用域、声明前的 undefined |
| tdz.js | `node tdz.js` | 内层 TDZ 不回退外层；声明后的 undefined |
| branches.js | `node branches.js` | 分支共享结果、售罄与低库存 |
| switch.js | `node switch.js` | case 块、break、default |
| stats.js | `node stats.js` | 普通 for、累计量、正常与空输入 |
| iteration.js | `node iteration.js` | for-of 数字值与 for-in 字符串属性名 |
| search.js | `node search.js` | continue 与 break |
| errors.js | `node errors.js` | RangeError、catch、finally |
| stats-broken.js | `node stats-broken.js` | 故意错误：越界产生 NaN |
| message-broken.js | `node message-broken.js` | 故意错误：退出码非 0，抛 ReferenceError |
| prediction.js | `node prediction.js` | 练习 1 |
| message-answer.js | `node message-answer.js` | 练习 2，两条消息路径 |
| summary-answer.js | `node summary-answer.js` | 练习 3，完整六件商品与空输入 |
| index.html | 本地网页 | 加载 stats.js；切换 errors.js 观察异常 |
| StockStats.java | `java StockStats.java` | Java 统计对照 |

## 运行

- 在本目录执行上表命令。每个 JS 文件配有 `.expected.txt`；message-broken 的预期 stdout 为空，以首行 `expect-error` 检查异常。在仓库根目录运行 `npm run examples -- c04` 自动核对。
- Console：逐块粘贴完整代码，重复声明报错时刷新。var 示例在函数内运行，每次调用都从新的局部绑定开始。
- 本地网页：在本目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/`。
- Java：已有 JDK 11 以上时运行，不生成 class 文件。

## 断点与验收输入

- stats.js：在第 5 行累加语句设断点；前四轮 quantity 为 12、0、7、3，total 依次从 0 变为 12、12、19、22。
- 把 `<` 改成 `<=`：第 5 轮 index=4、length=4、quantity=undefined；单步后 total=NaN。恢复 `<` 后正常数组、空数组、单个 0 分别返回 22、0、0。
- errors.js：将 index.html 的脚本路径切到 errors.js，开启 caught exception 暂停；在 throw 行看到 quantity=-1，堆栈为 requireStock → readStock → 调用处。在 catch 日志行暂停可查看 error.name/message/stack。
- 把 readStock 的输入改成 12：输出「库存 12」「本次检查结束」；输入 0、99999 同样通过，-1、100000、1.5、NaN 都输出范围错误与收尾消息。完成后恢复 -1 和原脚本路径。
- tdz.js：将 console.log(label) 改成 console.log(typeof label)，仍打印 ReferenceError。
- 练习 3：六件商品为总库存 52、有货商品数 5；空数组与单个 0 均为 0、0。

## 验证记录

- 2026-10-15 · Node 24.22.0 · macOS arm64：15/15 JS 文件通过独立进程运行与 `.expected.txt` 比较，包含预期异常；统计正常/空/零/六件商品与库存校验边界均通过。
- 2026-10-15 · Java 21.0.2：StockStats.java 输出 total 22、empty 0、zero 0，与 JS 一致。
- 2026-10-15 · Chrome 155.0.8059.40（headless，经 DevTools 协议）：15 个文件分别运行、正文 JS 代码块按顺序在同一 Console 会话运行，结果符合预期；typeof TDZ 变体通过。
- 同日 · Chrome：本地 HTTP 加载、正常四轮断点及单步、故障第五轮 undefined→NaN、异常暂停、catch 中的消息与 stack、合法输入修复均通过；结束后页面恢复正常三行统计。验证使用响应变体，仓库保留正确 stats.js 与原始异常演示。
- 同日 · 生产预览：1280px/360px 的新版 D2、6 个折叠区、16 个代码块与子路径资源通过；禁用页面 JS 后正文和折叠答案仍可读。
- 本课重构时 T0 尚未实现；当时使用忽略目录内的临时脚本核对内容规则、文件一致性与输出。
- 未运行：手动点击 DevTools 的操作路径（已对照 Chrome 官方文档核对）、Firefox、Safari、Windows。
