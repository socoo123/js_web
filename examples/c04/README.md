# C04 变量、作用域与控制流

本目录是独立的学习练习，无第三方依赖，不需要运行网站根目录的 npm 安装或构建命令。浏览器 Console 是主线；Node 和 Java 只作选做对照。

## 文件与操作方式

| 文件 | ID / 操作方式 | 验证状态 |
| --- | --- | --- |
| `bindings.js` | S01 / 自己尝试 · 浏览器 Console | 已验证 let/const/var、属性修改、TDZ、遮蔽与 typeof TDZ |
| `controls.js` | S02 / 自己尝试 · 浏览器 Console | 已验证分支匹配、循环、键与值、continue/break |
| `stats.js` | S03 / Console 或本地网页 | 已验证正常输入、空数组、单个0 |
| `index.html` | D01 / 自己尝试 · 本地网页与 Sources | 已通过本地 HTTP 加载，实际命中循环断点并单步 |
| `StockStats.java` | J01 / 讲解示例，Java 对照可选 | 已用 JDK 21.0.2 执行，输出22、0 |
| `faults.js` | E01/E02/E03 / 故意错误，自己尝试 · Console | 已复现越界后的NaN、块作用域错误和RangeError调用链；这些是预期故障 |
| `answers.js` | A01/A02/A03 / 参考答案 | 已验证修复后的总数、两条消息路径、跳过0累计 |

`stats.js` 是正确实现，`faults.js` 专门保留故障。`answers.js` 可独立执行，不依赖先加载其他 JS。S01/S02 可整段复制到 Console。**S01 每次运行前先刷新页面，或使用新的独立页面**：块只隔离 let/const，不隔离 var；同一上下文再次运行时 legacy 仍为12，var-before 会打印12，而不是首次运行的undefined。S03 有顶层 const，重复复制前也先刷新页面重建上下文。清空日志不会清除绑定。

## 必做：浏览器运行与断点

1. 把 `index.html`、`stats.js` 放在同一目录；或直接使用当前目录。
2. 沿用 C02 已有的静态文件服务。在仓库根目录的终端中执行：

   ```sh
   cd examples/c04
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

3. 打开 `http://127.0.0.1:8000/`，在 Console 确认 `total 22`、`empty 0`。
4. Sources 打开 `stats.js`，在第6行 `total = total + quantity;` 设断点，然后刷新。
5. 暂停时本行尚未执行；观察下表，Step over 后检查 total，Resume 后等下一轮。
6. 最后继续运行并移除断点。修改文件要在编辑器保存，刷新重新执行；面板临时修改不等于源文件修复。

| index | quantity | 执行前 total | 单步执行后 total |
| --- | --- | --- | --- |
| 0 | 12 | 0 | 12 |
| 1 | 0 | 12 | 12 |
| 2 | 7 | 12 | 19 |
| 3 | 3 | 19 | 22 |

空数组调用不会进入循环体的断点。函数结束后不能在全局 Console 读取局部 total；请在暂停调用帧中读取。作者实际使用本机端口8004验证，以免与其他练习服务竞争；与上述8000命令只相差端口，命令和地址要一起改。没有 Python 时可沿用已有编辑器的静态预览服务，本课不要求先安装 Node；Windows 和编辑器服务未执行。

## 必做：复现与修复

在自己的 `stats.js` 把 `<` 改成 `<=`，保存刷新，先观察再修复：

```text
第0轮：index=0，quantity=12，total 0→12
第1轮：index=1，quantity=0，total 12→12
第2轮：index=2，quantity=7，total 12→19
第3轮：index=3，quantity=3，total 19→22
第4轮：index=4，quantity=undefined，total 22→NaN
```

因为有效下标只有0到3，`<=` 让程序多走一轮。普通数组这里读取缺失属性得到 undefined；数字相加得到 NaN，没有因此自动抛出异常。空数组也会多执行一次 index=0，结果同样 NaN。

恢复 `<`，重新执行 `[12, 0, 7, 3]`、`[]`、`[0]`，分别得到22、0、0。不要用 `?? 0` 或 `|| 0` 隐藏错误边界。浏览器验证用临时响应变体，不把故障改动留在正常 `stats.js`。

E02 在块外读取 message 会产生 ReferenceError；A02 将 let message 放在两处共享的外层块，分别验 stock=0和3。E03 抛出的是我们明确创建的 RangeError，消息为“库存必须是非负整数”；错误堆栈自上而下包含 requireNonNegative → readStock → 调用处。finally 最后输出“本次检查结束”。完整解释与渐进答案见文章。

## 选做：Node 与 Java

已有 Node 时，在仓库根目录运行，不需要 npm：

```sh
node --version
node examples/c04/bindings.js
node examples/c04/controls.js
node examples/c04/stats.js
node examples/c04/faults.js
node examples/c04/answers.js
```

作者实际逐个使用仓库缓存中固定的 Node 24.22.0：

```sh
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c04/bindings.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c04/controls.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c04/stats.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c04/faults.js
.cache/tools/node-v24.22.0-darwin-arm64/bin/node examples/c04/answers.js
```

该缓存路径是作者机器的验证路径，不是要求读者手动创建的练习依赖。正文不使用 Node 专属 API。

Java 对照命令（已有支持单文件源代码执行的 JDK 时）：

```sh
java -version
java examples/c04/StockStats.java
```

输出为 `total 22`、`empty 0`。这只是对应的 Java 统计实现，不要求先学 Java 工程配置，也没有在练习目录生成 class 缓存。

## 实际输出记录

日期：2026-10-15。macOS arm64，Node **24.22.0**，Chrome **155.0.8059.40**，JDK **21.0.2**，Python **3.11.8**。

S01（两种 JS 环境均执行）：

```text
binding 9 3
property 9
reassign TypeError
var-before undefined
var-block 12
tdz ReferenceError
inner 杭州仓 12
outer 默认仓
shadow-tdz ReferenceError
typeof-tdz ReferenceError
initialized undefined
```

S02（两种 JS 环境均执行）：

```text
if 售完
switch 执行补货
case-default
of 12
of 0
of 7
in 0 string
in 1 string
in 2 string
while 2
do 1
first 7
```

S03：`total 22`、`empty 0`；额外浏览器调用 `sumStock([0])` 为0。

E01/E02/E03（两种 JS 环境均执行；堆栈只保留结构）：

```text
iteration 0 12 12
iteration 1 0 12
iteration 2 7 19
iteration 3 3 22
iteration 4 undefined NaN
out-of-range undefined
invalid-total true
block-error ReferenceError
caught RangeError 库存必须是非负整数
RangeError: 库存必须是非负整数
    at requireNonNegative (...)
    at readStock (...)
    at ...调用处...
finally 本次检查结束
```

答案（两种 JS 环境均执行）：

```text
fixed-total 22
fixed-message 0 售完
fixed-message 3 可售
available-total 22
```

作者通过 Chrome 调试协议对本地 HTTP 页实际设置第6行断点，逐轮读取 index/quantity/total 并单步；正常四轮与故障第五轮、空数组错误轮均符合上表。恢复后原输入、空数组、单个0为22/0/0。面板点击路径只做官方资料核对，没有把协议自动化写成手动点击验证。自动化报告保存在忽略的 `.cache/qa/c04-debug-results.json` 与 `.cache/qa/c03-c05-browser-examples.json`，不属于读者运行依赖。

尚未执行：手动点击 DevTools、Edge、Windows、真实手机、其他引擎。错误消息和堆栈文件名/行列号依环境变化；不要按整段字符串编写业务判断。本课假定统计输入是非负整数的普通数组；稀疏数组、继承属性、代理、外部 JSON 验证不在该简单统计实现的保证范围。

## 官方资料

核查日期：2026-10-15。使用2026固定版规范，不把当前滚动编辑草案的标头当作本课依赖版本。

- [ECMAScript 2026：声明、块和语句](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)，核对 var/let/const、switch、循环与异常控制流。
- [环境记录](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html#sec-environment-records)，核对绑定初始化与向外查找。
- [普通对象属性读取](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver)，核对本例缺失数组下标得到 undefined 的边界。
- [Chrome 断点](https://developer.chrome.com/docs/devtools/javascript/breakpoints)与[调试参考](https://developer.chrome.com/docs/devtools/javascript/reference)，核对面板路径、Scope、Call Stack与单步。
- [V8 堆栈说明](https://v8.dev/docs/stack-trace-api)，核对 Chrome/Node 的堆栈表示与实现边界。
- [Python http.server 命令行](https://docs.python.org/3/library/http.server.html#command-line-interface)，沿用 C02 已有的本地文件服务。
