---
title: C17 Node 与浏览器的边界
description: 分清 JS 与宿主的职责，用 Node 读取库存文件、接收参数、生成报告，并用 inspect 找到路径和异步错误。
sidebar:
  order: 17
---

> **第 2 周 · 第 9 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C12、C13、C16 · 运行：Node 24，本地网页作对照 · 部分示例未运行，已在对应位置标注

## 这一课解决什么问题

原生库存页已能编辑和保存库存。现在想每天生成一份文本报告：总共多少件、值多少钱、各分类有几种商品。为了复制这些数字打开网页，有些绕。

把 C16 的 Inventory 放到 Node，读取磁盘上的 products.json，就能在终端打印报告。计算没变，只改变输入和输出。

常见的坑也在这里：脚本换个目录就报 ENOENT；readFile 包了 `try/catch`，错误仍然让程序退出。本课讲清宿主能力与异步结果的边界。

学完你能：

- 分清 V8、Node 与 npm 的职责
- 用 fs/promises 读取和写入文本，区分工作目录与模块位置
- 接收参数和环境变量，转换、校验后交给业务模块
- 解释 Buffer 的字节和字符串的差异，读懂一个按块读取的 stream
- 用 Node inspect 暂停程序、检查路径和 Promise，生成可复现的库存报告

示例在 [examples/c17](https://github.com/socoo123/js_web/tree/main/examples/c17)。沿用 Node 24，用 `node --version` 确认。除另有说明，在该目录执行 `node 文件名.js`；固定输出可在仓库根目录用 `npm run examples -- c17` 核对。`node:` 模块随 Node 提供。

## Java 程序员先看这里

| Java 经验 | Node 中的对应 | 差异 |
| --- | --- | --- |
| JVM 与 Java 运行库 | V8 与 Node 的运行时 API | V8 执行 JS，Node 把文件、进程等能力接进来 |
| Files.readString / writeString | fs/promises 的 readFile / writeFile | 返回 Promise，用 await 等结果 |
| main(String[] args) | `process.argv.slice(2)` | 前两项是 Node 程序与入口脚本的路径 |
| System.getenv | `process.env` | 读取后是字符串或 undefined，数字配置也要转换 |
| IDE 断点与局部变量 | `--inspect` 与调试客户端 | 调试目标是 Node 进程，终端客户端也能查看暂停的局部变量 |

## 1. 同一门语言，不同的宿主能力

Array、Map、Promise 是语言能力；document 是浏览器的 DOM 入口，process 和 fs 由 Node 提供。判断代码能在哪里运行，先看宿主 API；纯计算的 Inventory 两边都能复用。

Node 是运行时，npm 负责依赖和项目脚本；内建模块随运行时提供。

**先猜一猜：** 下面文件用 Node 运行，document、process、fetch 各是什么类型？

```js title="host.js"
import { Inventory } from "../inventory/01-core/inventory.js";
import { products } from "../shared/products.js";

console.log("document", typeof document);
console.log("process", typeof process);
console.log("fetch", typeof fetch);
console.log("总库存", new Inventory(products).summary().totalStock);
```

```text
document undefined
process object
fetch function
总库存 52
```

Node 24 也有 fetch。document 为 undefined，直接访问 `document.querySelector` 会抛 ReferenceError；Inventory 只依赖语言内建对象，所以仍能算出 52。

浏览器通过用户选择文件、网络请求等受限入口得到数据；Node 的 fs 在进程权限内访问本地路径。往网页导入 `node:fs/promises`，浏览器也无法获得这种系统能力。

> 未运行验证：本地网页对照未能启动可用浏览器。请按步骤自己尝试。

:::tip[自己尝试 · 本地网页]
1. 在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`。
2. 打开 `http://127.0.0.1:8000/examples/c17/browser.html`。
3. 对照上面 Node 的四行输出。

预期：网页显示 document object、process undefined、fetch function、总库存 52。只有宿主相关的前两行改变，业务汇总相同。
:::

和 Java 只依赖集合的业务类一样，纯计算更易复用；JS 还要单独辨认不同宿主的 API。

### V8 跑 JS，系统处理 I/O，结果再回到 JS

Node 加载入口和依赖，由 V8 执行 JS。普通脚本默认在一个 JS 线程上运行；异步文件操作交给 libuv 线程池，网络 I/O 通常依靠系统的就绪通知。完成后的业务计算仍回到 JS 线程。

```js title="async-read.js"
import { readFile } from "node:fs/promises";

console.log("开始");
const pending = readFile(new URL("../shared/products.json", import.meta.url), "utf8");
console.log("同步代码继续");
const products = JSON.parse(await pending);
console.log("文件就绪", products.length);
```

```text
开始
同步代码继续
文件就绪 6
```

readFile 立即返回 Promise，同步代码继续。await 等文件读完再恢复，JSON.parse 才把文本变成数组；小文件也是异步恢复。

Promise 后续处理通过微任务恢复。Node 围绕文件、网络、定时器处理事件，没有网页渲染步骤；setImmediate、process.nextTick 遵循自己的调度规则。

[Node 的执行模型](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)意味着：await 让出等待时间，CPU 计算仍占用 JS 线程。async 里的 JSON.parse 或漫长循环占住线程时，其他回调也得等。

Java 的某些 CompletableFuture 方法会把任务交给执行器；JS 的 async 本身没有这一步。

## 2. 文件读取：先确定路径的基准

[fs/promises](https://nodejs.org/download/release/latest-v24.x/docs/api/fs.html#promises-api)的 readFile 接受路径或 file: URL。传 utf8 得到字符串，不传编码得到 Buffer；得到文本后还要 JSON.parse，才有商品数组。

路径有两个基准：**工作目录**由 `process.cwd()` 给出，取决于从哪里启动；**模块位置**由 `import.meta.url` 给出，取决于文件放在哪里。

| 写法 | 基准 | 用途 |
| --- | --- | --- |
| `import "./report.js"` | 当前模块的位置 | 导入依赖 |
| `readFile("./products.json", "utf8")` | 当前工作目录 | 读取调用者指定的文件 |
| `path.resolve("products.json")` | 当前工作目录 | 把输入文件名解析成绝对路径 |
| `new URL("../shared/products.json", import.meta.url)` | 当前模块的位置 | 找到程序自带的数据 |

ESM 的相对 import 按模块位置解析，fs 的相对字符串路径按 cwd 解析。都写了 ./，基准仍不同。

[path](https://nodejs.org/download/release/latest-v24.x/docs/api/path.html)用于处理系统路径：resolve 得到绝对路径，join 拼接并规范化路径段，basename 取文件名，dirname 取父目录。下面在 `examples/c17` 目录运行：

```js title="paths.js"
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = new URL("../shared/products.json", import.meta.url);
const filename = fileURLToPath(source);
console.log(path.basename(filename)); // → products.json
console.log(path.isAbsolute(filename)); // → true
console.log(path.dirname(filename) === path.resolve("../shared")); // → true（在本目录运行）
console.log(path.basename(path.join("reports", "inventory.txt"))); // → inventory.txt
```

path 只算路径，不检查文件是否存在。`import.meta.url` 是 URL；需要系统路径时用 `fileURLToPath`，正确处理编码和 Windows 盘符，别直接取 URL.pathname。

模块相邻文件用 new URL 定位，fs 能直接接收。和 Java 的 Path.resolve 一样，路径运算与实际文件读取是两件事。

### 写文件：等待成功，再告诉调用者完成了

writeFile 返回 Promise，await 完成后才知道写入成功。父目录不存在会抛 ENOENT。默认写法会覆盖文件，本课用 `flag: "wx"` 只创建新文件；目标已存在就抛 EEXIST，重新生成时换个输出名。

输入文本先解析、校验、计算，全部成功后再写新报告。坏 JSON 或不合规商品会在写文件前被拒绝。

同一文件的多次写入要按顺序等待；并发改同一个文件与 Java 一样需要协调。

## 3. 命令行参数和环境变量都是输入

`process.argv` 的前两项是 Node 与入口脚本路径，2 起才是脚本参数。`process.env` 读取进程的环境变量，缺少的键得到 undefined。

**先猜一猜：** 环境变量写成 `LOW_STOCK_LIMIT=0`，读出来是数字 0，还是字符串？

```js title="args-env.js"
import process from "node:process";

const category = process.argv[2] ?? "全部";
const text = process.env.LOW_STOCK_LIMIT ?? "5";
const limit = Number(text);
if (text.trim() === "" || !Number.isInteger(limit) || limit < 0 || limit > 99999) {
  throw new RangeError("LOW_STOCK_LIMIT 须为 0–99999 的整数");
}
console.log("分类", category);
console.log("阈值", typeof text, limit);
```

在 `examples/c17` 目录，用 macOS/Linux 终端执行：

```sh
node args-env.js
LOW_STOCK_LIMIT=0 node args-env.js 配件
```

第一条打印「分类 全部」与「阈值 string 5」；第二条打印「分类 配件」与「阈值 string 0」。变量值在命令前设置，只影响该次子进程。

默认值取 5，但它最初仍是文本 "5"；只有 Number(text) 才得到业务数字。这里沿用 C03 的入口规则：先判空、转数字，再检查整数和范围。?? 保留了合法的 "0"；0 表示关闭低库存提醒，因为没有正库存会小于等于 0。

parseInt 会把 "3.5" 读成 3，所以用 Number 后检查整数。与 Java 的 System.getenv 一样，环境变量需要自己转换。

带空格的文件名要加引号，例如 `"库存 数据.json"`，脚本才会得到一个完整参数。参数用于本次任务，环境变量可为一批任务提供共同配置。

### 退出状态也是脚本的输出

终端工具有三条结果通道：stdout 给正常结果，stderr 给诊断信息，退出状态告诉调用者成功还是失败。库存报告通过 `process.stdout.write` 输出，错误通过 console.error 输出，并设置 `process.exitCode = 1`。

成功通常返回 0。只打印「失败」而正常返回，自动化任务仍会认为成功。exitCode 在正常结束时返回失败状态；`process.exit(1)` 强制退出，可能截断尚未写完的输出。

## 4. Buffer 与 stream：字节和分块

[Buffer](https://nodejs.org/download/release/latest-v24.x/docs/api/buffer.html)保存字节，是 Uint8Array 的子类；字符串保存文本。中文「机械键盘」在 JS 字符串中占 4 个 UTF-16 码元，用 UTF-8 编码则占 12 字节。读文件不指定编码时拿到的正是 Buffer，要按正确编码 toString 才变成文本；它可类比 Java 的 byte[] 加字符集解码。

```js title="buffer.js"
import { Buffer } from "node:buffer";

const name = "机械键盘";
const bytes = Buffer.from(name, "utf8");
console.log(name.length, bytes.length); // → 4 12
console.log(bytes.toString("utf8")); // → 机械键盘
```

[stream](https://nodejs.org/download/release/latest-v24.x/docs/api/stream.html)让程序按块消费数据，readFile 则把整份文件读到内存。下面每个 chunk 默认是 Buffer；块边界可能切开 JSON 字段或中文字符，所以只累计字节，不逐块解析 JSON。for await 按消费进度等待下一块，读取失败从循环抛出。Java 的 InputStream 也按数据流读取，但这里取下一块使用异步等待。本课的小文件继续用 readFile 最直接。

```js title="stream.js"
import { createReadStream } from "node:fs";

const source = new URL("../shared/products.json", import.meta.url);
let byteCount = 0;
for await (const chunk of createReadStream(source)) {
  byteCount += chunk.length;
}
console.log("读到了字节", byteCount > 0); // → true
```

## 常见错误与调试

### 在示例目录能运行，回到仓库根目录就找不到文件

**现象**：在 `examples/c17` 目录运行 `node path-broken.js`，打印「商品 6」；在仓库根目录运行 `node examples/c17/path-broken.js`，却报 ENOENT。它读取的原文件并没有被删除。

**工具**：在仓库根目录启动调试目标：

```sh
node --inspect-brk=127.0.0.1:9229 examples/c17/path-broken.js
```

`--inspect` 开启调试端口并继续运行；这里用 `--inspect-brk`，让程序在开始时暂停，给客户端留出连接时间。地址只监听本机。保持这个终端打开，再开一个终端，在仓库根目录执行：

```sh
node inspect 127.0.0.1:9229
```

看到 `debug>` 后输入 cont，程序会停到文件中的 debugger 语句。输入 repl 进入暂停上下文，分别输入 `process.cwd()` 和 source。这是 Node 自带的[终端调试客户端](https://nodejs.org/download/release/latest-v24.x/docs/api/debugger.html)，不需要额外安装工具。

**证据**：cwd 是仓库根目录，source 却是仓库父目录下的 shared/products.json。`path.resolve("../shared/products.json")` 把工作目录向上退了一层。输入 Ctrl+C 离开 repl，cont 继续；若目标提示 Waiting for the debugger to disconnect，再在客户端输入 `.exit`，原终端会显示带这个错误路径的 ENOENT。

**原因**：代码想找的是随模块放置的共享数据，使用的却是随启动位置变化的相对文件路径。启动脚本的绝对路径也不会自动改变 `process.cwd()`。

**修复**：把 source 那行换成 `new URL("../shared/products.json", import.meta.url)`，去掉 debugger。完整答案在 `path-fixed.js`。这里按模块位置定位；项目入口接收的用户文件名则仍按工作目录定位。

**确认**：在 `examples/c17` 运行 `node path-fixed.js`，再到仓库根目录运行 `node examples/c17/path-fixed.js`，两次都打印「商品 6」。两次 cwd 不同，结果应相同。

:::tip[自己尝试 · Node]
按上述步骤抄下 cwd 与 source，再运行修复版。预期：错误路径多退一层；修复后两个目录都得到 6。端口占用时先退出自己前一次调试。
:::

### `try/catch` 包住了读取，却没接住错误

**现象**：运行 `node async-broken.js`，先打印「读取调用已返回」，随后出现 ENOENT，catch 里的「读取失败」没有打印。

```js
// 有问题的写法：try 里只创建 Promise，没有等待它
try {
  const pending = readFile(new URL("./missing.json", import.meta.url), "utf8");
  debugger;
  console.log("读取调用已返回");
} catch (error) {
  console.log("读取失败", error.code);
}
```

**工具**：在 `examples/c17` 运行 `node inspect async-broken.js`。它会自动启动并连接目标；输入 cont 到 debugger，再输入 repl，在暂停上下文求值 `pending instanceof Promise`。

**证据**：结果为 true，当前 try 没有等待 Promise。Ctrl+C 回到 `debug>`，用 `.exit` 结束调试；正常运行原文件，错误堆栈指向读取，catch 日志没有出现。

**原因**：读取失败来自稍后的 Promise 拒绝，此时当前 try 已结束。`try/catch` 要在 await 等待处才能接住这个失败。

**修复**：在 try 里 await 读取。缺失文件保留，用它确认错误处理本身。

```js title="async-fixed.js"
import { readFile } from "node:fs/promises";

try {
  await readFile(new URL("./missing.json", import.meta.url), "utf8");
} catch (error) {
  console.log("读取失败", error.code); // → 读取失败 ENOENT
}
```

**确认**：运行 `node async-fixed.js`，只打印「读取失败 ENOENT」。示例把失败视为已处理；报告工具还会返回非零状态。

## 练习

### 练习 1：预测异步读取的值和类型

先写出 `prediction.js` 的三行输出，再在 `examples/c17` 运行 `node prediction.js` 核对。验收：解释每行类型，并说清最后一行为什么保留 0。

```js title="prediction.js"
import { readFile } from "node:fs/promises";

const pending = readFile(new URL("../shared/products.json", import.meta.url), "utf8");
console.log("A", typeof pending.then);
const text = await pending;
console.log("B", typeof text);
console.log("C", JSON.parse(text)[1].stock ?? 12);
```

<details>
<summary>提示</summary>

readFile 没有立即返回字符串；utf8 决定等待完成后的结果类型。数组下标 1 是 P002，无线鼠标的起始库存为 0。

</details>

<details>
<summary>参考答案</summary>

依次是 A function、B string、C 0。pending 是 Promise，所以 then 是函数；await 得到 UTF-8 解码后的字符串；JSON.parse 之后才是数组。?? 只替换 null 和 undefined，售罄的 0 会保留。

</details>

### 练习 2：修复路径和错误处理

复制两个 broken 文件修复。验收：路径例子在仓库根目录和示例目录都打印「商品 6」；异步例子保留缺失文件名，进入 catch 打印「读取失败 ENOENT」。说明改变了什么基准或等待位置。

<details>
<summary>提示</summary>

path.resolve 的结果取决于 cwd。`try/catch` 能捕获 await 等待时出现的拒绝。

</details>

<details>
<summary>参考答案</summary>

`path-fixed.js` 用 `import.meta.url` 固定数据位置；`async-fixed.js` 在 try 内 await，把拒绝带回 `try/catch`。按两种 cwd 重跑前者，用原缺失文件重跑后者。

</details>

### 练习 3：生成分类报告

在阶段 3 目录运行 `cli.js`，读取 `../../shared/products.json`，把输出保存为新文件 accessories.txt，分类传「配件」。验收：2 种商品、28 件、587200 分；把 LOW_STOCK_LIMIT 改成 0 后低库存为 0；再次写同一个文件应失败，并保留已有内容。

<details>
<summary>提示</summary>

三个位置参数依次是输入文件、输出文件、分类。每次需要成功写文件时换一个输出名。阈值只影响低库存计数，不改变商品数量和总价值。

</details>

<details>
<summary>参考答案</summary>

在 `examples/inventory/03-tooling` 运行 `node cli.js ../../shared/products.json accessories.txt 配件`。P004 有 3 件、P005 有 25 件，总库存 28；价值是 3 × 29900 + 25 × 19900 = 587200 分。默认低库存只有 P004，阈值 0 时没有正库存满足条件。wx 创建模式让第二次写入得到 EEXIST，入口 catch 返回失败状态，已有报告保留。

</details>

## 项目进度

从 C16 的 [阶段 2 原生页面](https://github.com/socoo123/js_web/tree/main/examples/inventory/02-web)继续，新建 [examples/inventory/03-tooling](https://github.com/socoo123/js_web/tree/main/examples/inventory/03-tooling)，通过 import 复用业务模块。

新增 `options.js` 解析配置、`report.js` 生成文本、`cli.js` 协调 I/O。独立 `package.json` 声明 ESM 模式，配有独立锁文件；当前无第三方依赖，直接用 node 运行。

`report.js` 复用阶段 2 的 validateProducts 校验并复制商品，再用阶段 1 的 Inventory。先筛分类再统计；低库存要求 `stock > 0 && stock <= limit`，售罄另算。

入口完整代码如下，对应 `cli.js`：

```js
import process from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { parseOptions } from "./options.js";
import { createReport } from "./report.js";

try {
  const options = parseOptions(process.argv.slice(2), process.env);
  const text = await readFile(options.source, "utf8");
  const report = createReport(JSON.parse(text), options);
  if (options.target !== null) {
    await writeFile(options.target, report, { encoding: "utf8", flag: "wx" });
  }
  process.stdout.write(report);
} catch (error) {
  console.error("报告失败：", error.code ?? error.name, error.message);
  process.exitCode = 1;
}
```

在 `examples/inventory/03-tooling` 运行 `node cli.js`，只在终端打印默认报告：

```text
库存报告（全部）
商品种类：6
总库存：52 件
库存总价值：2634800 分（26348.00 元）
售罄：1 种
低库存（阈值 5 件）：2 种
分类：外设 2、显示器 1、配件 2、音频 1
标签：热销、新品
```

要写文件，在同一目录运行 `node cli.js ../../shared/products.json inventory-report.txt`。用户传入的两个路径按 cwd 解析；未传输入时，`options.js` 使用相对模块的默认数据 URL，因此从仓库根目录运行 `node examples/inventory/03-tooling/cli.js` 仍打印同一份报告。

核对上述固定值，再按练习 3 验证分类、阈值与重复输出。输入改成缺失文件或坏 JSON 时，应报错并非零退出，输入原文不变。

报表在本地 Node 进程运行；GitHub Pages 只发布静态页面，不执行报表。

## 小结

- V8 执行 JS，Node 提供文件和进程等宿主能力；纯业务模块可跨宿主复用。
- readFile 返回 Promise，编码决定得到字符串还是 Buffer；异步 I/O 后的 JS 计算仍占用当前线程。
- fs 相对路径按 cwd，程序自带文件可用 `import.meta.url` 定位；path 只处理路径，不读文件。
- argv 和 env 是文本入口，转换、校验后再计算；失败通过 stderr 与非零退出状态交给调用者。
- inspect 让你在暂停处读取实际值；调路径看基准，调异步错误看 Promise 在哪里被等待。

自测：

1. Node 有 fetch，为什么仍不能执行 `document.querySelector`？
2. 在另一个目录启动同一个脚本，哪种路径会改变含义？
3. 为什么 async 函数中的 JSON.parse 仍可能阻塞其他回调？
4. try 中调用 readFile 和 await readFile，捕获失败的行为有何不同？
5. 环境变量 `LOW_STOCK_LIMIT=0` 读到什么类型？输出报告失败时应该返回什么状态？

下一课用 npm 管理项目：配置 scripts、读懂依赖版本与锁文件，建立可复现的安装流程。

## 延伸阅读

- [Node：Node 与浏览器的差异](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser)
- [Node 24：fs/promises](https://nodejs.org/download/release/latest-v24.x/docs/api/fs.html#promises-api)
- [Node 24：process.argv、env 与退出状态](https://nodejs.org/download/release/latest-v24.x/docs/api/process.html)
- [Node：事件循环、定时器与 nextTick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node 24：Debugger](https://nodejs.org/download/release/latest-v24.x/docs/api/debugger.html)
- [Node 24：Buffer](https://nodejs.org/download/release/latest-v24.x/docs/api/buffer.html)
