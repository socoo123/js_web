# C17 Node 与浏览器的边界 · 示例

配套正文：[C17](../../src/content/docs/04-runtime-tooling/c17-node-browser.md)。Node 例子无第三方依赖，网页需从仓库根目录提供静态服务。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| host.js | `node host.js` | Node 的宿主能力与 Inventory 复用 |
| browser.html | 本地网页 | 浏览器宿主对照，未运行验证 |
| async-read.js | `node async-read.js` | 同步继续、等待文件、解析文本 |
| paths.js | `node paths.js` | file URL、系统路径与 cwd |
| args-env.js | `node args-env.js` | 参数、环境变量转换与校验 |
| buffer.js | `node buffer.js` | UTF-8 字节与字符串长度 |
| stream.js | `node stream.js` | 按块累计文件字节数 |
| path-broken.js | `node path-broken.js` | 在本目录成功，在仓库根目录失败 |
| path-fixed.js | `node path-fixed.js` | 模块相邻文件不随 cwd 改变 |
| async-broken.js | `node async-broken.js` | 故意漏 await，预期未处理的 ENOENT |
| async-fixed.js | `node async-fixed.js` | try 内 await 捕获文件失败 |
| prediction.js | `node prediction.js` | 练习 1：Promise、文本与库存 0 |
| project-report.js | `node project-report.js` | 阶段 3 的固定业务报告 |
| cli-cases.js | `node cli-cases.js` | 实际启动 CLI，检查 cwd、文件与失败出口 |

## 运行

- 在本目录执行上表命令；默认 LOW_STOCK_LIMIT 未设置。在仓库根目录运行 `npm run examples -- c17`，自动比较 13 份 `.expected.txt`。
- 参数实验（macOS/Linux，在本目录）：`LOW_STOCK_LIMIT=0 node args-env.js 配件`，输出「分类 配件」「阈值 string 0」。
- 网页：根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c17/browser.html`。
- 报表：见 [阶段 3 README](../inventory/03-tooling/README.md)，不安装根目录以外的依赖。

## 验证记录

- 2026-10-17 · Node 24.22.0、npm 11.19.1 · macOS arm64：`npm run examples -- c17` 13/13 通过；故意漏 await 的例子以非零状态退出，stderr 含 Error / ENOENT。
- 同日 · 两终端 inspect 实测：根目录用 `--inspect-brk=127.0.0.1:9229` 启动 path-broken.js，另一个终端用 `node inspect 127.0.0.1:9229` 连接；cont 停在 debugger，repl 中 cwd 为仓库根目录，source 为仓库父目录的 shared/products.json；继续、断开后原进程 ENOENT，退出码 1。
- 同日 · `node inspect examples/c17/async-broken.js`：cont 到 debugger，repl 求值 `pending instanceof Promise` 为 true；继续后只打印「读取调用已返回」，随后等待调试器断开。正常运行时的拒绝与错误栈由固定输出门禁核对。
- 同日 · `--inspect=127.0.0.1:9229` 运行 path-fixed.js：直接打印「商品 6」并自然退出；两种 cwd 的修复结果一致。
- 同日 · cli-cases.js：从仓库根目录、阶段目录、临时目录启动默认报告均一致；中文空格相对路径可读写；配件 2 种/28 件/587200 分；阈值 0 保留，空白、小数、越界拒绝；空数组汇总为 0。
- 同日 · CLI 错误分支：缺文件、坏 JSON、非数组、字符串库存、重复 id、未知分类、多余参数、缺输出父目录均非零退出且无成功输出；已有输出与输入同名时 EEXIST，输入及已有输出保留原文；临时实验文件自动清理。
- 同日 · 本地静态服务 browser.html 返回 200；浏览器工具无可用浏览器，未执行网页 JS，不计为浏览器运行验证。
- 同日 · 内容 lint 17 课零 error / warning，Astro check 零诊断；完整 build 通过，固定输出 189/189，21 个 HTML 的子路径/资源/折叠区检查通过；8 个带文件名代码块与源码逐字一致。
- 未运行：浏览器对照、Windows / PowerShell、Linux 本机与 Chrome 图形调试客户端。正文未提供未实测的图形客户端步骤。
