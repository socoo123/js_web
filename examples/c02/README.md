# C02 商品卡片、布局与调试练习

对应文章：[C02 Web 基础与第一个调试现场](../../src/content/docs/01-history-web/c02-web-debugging.md)。本例是独立 HTML/CSS/JS，不依赖第三方包，不需要安装站点工程的依赖。

## 自己尝试 · 本地网页

前置：编辑器、Chrome，以及已有的 Python 3 或编辑器静态预览服务。以下命令工作目录为仓库 `examples/c02/`：

```sh
python3 --version
python3 -m http.server 8000 --bind 127.0.0.1
```

然后用浏览器打开 `http://127.0.0.1:8000/`。`index.html` 加载同目录的 `styles.css` 和 `app.js`；浏览器执行 JS，Python 只提供文件。端口占用时把命令和地址中的 8000 一起改为 8001；终端按 `Ctrl+C` 停止服务。

没有 Python 时可以使用已有编辑器的静态预览服务，采用其给出的 HTTP 地址；不要求为 C02 提前安装 Node/npm。Windows 的 `py -3` 写法见文章，属于资料核对，本次未执行。

1. 刷新：商品“键盘”、库存 12、输入 3，按钮启用；Console 有 `C02 ready`。
2. 确认售出：库存 9，日志 `库存变化 9`；输入 10 提交，库存仍为 9，显示库存不足。
3. 输入 9 提交：库存 0，售出按钮禁用；刷新重新变为 12。
4. 另起刷新，分别输入空值、0、1.5：原生校验阻止正常提交，库存不变。
5. 输入框内按 Enter：与点击售出按钮走同一个表单提交处理。

## 自己尝试 · 调试与排错

按文章给出的顺序逐个制造故障，**每次恢复正常文件再做下一项**：

| ID | 故障 / 操作 | 观察与恢复 |
| --- | --- | --- |
| D01/U01 | Console 读取 DOM、输入类型、stock；计算两个 URL | 文本是字符串、业务库存是数字；相对路径保留所在目录，根路径从站点根开始 |
| D02 | 临时把 padding 改为 32px，把 DOM 库存改为 99 | 业务变量不跟着变；刷新回到文件中的样式和初始库存 |
| E01 | 把 HTML 脚本引用改为 `./ap.js` | Network 脚本 404，按钮仍禁用；恢复 `./app.js`，刷新并售出 3 验证 |
| E02 | 删掉 head 中 script 的 `defer` | 在正文解析前查询为 null，`addEventListener` 抛 TypeError；恢复 defer |
| D03 | 在 app.js 的 `const remaining = stock - quantity;` 设置断点 | 暂停时 stock=12、quantity=3；单步后 remaining=9、stock 仍为12；继续后页面为9 |
| A01 | CSS 末尾加 `.product-card { width: 720px; }`，360px 观察 | 卡片超宽；删除新增声明，重查 360px/1280px 和交互 |

DevTools 临时编辑通常不会自动保存到编辑器里的文件；本课没有启用 Workspaces/Overrides。完整面板路径、证据要求和折叠答案在文章中。

## 自己尝试 · 补货练习与答案 A02

先独立完成：在 `</form>` 后、反馈段落前加入：

```html
<button id="restock-button" type="button">补货 5 件</button>
```

实现监听器，使业务库存、页面数字、反馈和售出按钮状态一起更新。参考实现是 `restock-answer.js` 的**增量代码**：追加到 `app.js` 末尾即可，不是独立程序，不需要同时再添加一条 script 引用。

验收：刷新 12 → 补货 17 → 售出 17 得到 0、按钮禁用 → 再补货得到 5、按钮启用 → 售出 3 得到 2。对照 Console 的 `stock` 与屏幕文本。

## 实际验证记录

日期：**2026-10-15**。macOS arm64，Chrome **155.0.8059.40** 独立 headless 页面，Python **3.11.8** 本地静态服务。作者用 Node **24.22.0** 调用 Chrome 调试协议组织验证；这不是学习者运行网页的前置条件。

| ID | 验证状态与实际结果 |
| --- | --- |
| W01 | 已验证：HTML/CSS/JS 均200；12→9、超卖保持9、售完0并禁用、刷新12；Enter 提交同样减到9 |
| W01 边界 | 已验证：空值/0/1.5 的原生有效性为 false，正常提交不扣库存；直接分发提交事件绕过原生校验时，JS 防御分支也阻止扣减 |
| D01/U01 | 已执行文章中的文本、typeof、stock 和 URL 表达式，值符合正文；window.stock 可能通过 id 命名访问返回节点，不能当作同名 let 变量 |
| D02 | 已验证：改 DOM 为99时业务库存仍9；临时 padding32px；刷新后恢复文本12、padding20px |
| E01/E02 | 已复现：ap.js 404；漏 defer 导致 null/addEventListener TypeError；恢复正常页面后按钮和售出均正常 |
| D03 | 已实际命中 app.js 第23行断点，stock=12、quantity=3；单步后 remaining=9、stock=12；调用帧为 handleSale，继续后页面9 |
| A01 | 已验证：正常1280px时卡片448px、两个448px轨道；360px时卡片328px、单列，无整页溢出。固定720px后窄屏溢出，删除声明恢复 |
| A02 | 已验证组合后的HTML与增量JS：12→17→0→5→2，售完禁用、补货重新启用，文本与变量一致 |
| 静态阅读 | 禁用页面脚本后商品与12件仍可读，售出按钮禁用，noscript提示存在 |

故障与答案通过同源临时响应变体组合执行，未把故障留在正常示例文件中。脚本的正常版本无未处理异常；404和TypeError是指定故障的预期结果。

浏览器协议执行验证与**手动 DevTools 面板操作**分开记录：面板点击步骤已核对 [Chrome Console](https://developer.chrome.com/docs/devtools/console/javascript)、[CSS](https://developer.chrome.com/docs/devtools/css/)、[Network](https://developer.chrome.com/docs/devtools/network/)、[Sources](https://developer.chrome.com/docs/devtools/javascript/)，本次没有声称手动面板点击已测试。Edge、真实手机和Windows未执行。

文章生产页、D2 中文图、搜索与 Pages 部署验收见 [STATUS](../../docs/STATUS.md)。
