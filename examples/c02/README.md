# C02 Web 基础与第一个调试现场 · 示例

配套正文：[C02](../../src/content/docs/01-history-web/c02-web-debugging.md)。独立 HTML/CSS/JS，无第三方依赖；使用 P001 机械键盘，初始库存 12。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| index.html + styles.css + app.js | 本地网页 | 商品卡片、原生表单、售出与页面更新 |
| dom-basics.js | 练习页 Console | 文本与输入值都是字符串 |
| url-resolution.js | Console 或 `node url-resolution.js` | 相对路径与站点根路径；附 `.expected.txt` |
| dom-prediction.js | 刷新后在练习页 Console 粘贴 | 练习 1：节点文本与业务库存互不自动同步 |
| restock-answer.js | 追加到 app.js | 练习 3：依赖已有变量及新增补货按钮 |

## 运行

在本目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`，用 Chrome 打开 `http://127.0.0.1:8000/`。已有编辑器静态预览服务也可使用；浏览器执行 JS，服务只返回文件。终端按 `Ctrl+C` 结束。

Node 只用于可选的 URL 例子。在本目录运行 `node url-resolution.js`；仓库根目录的 `npm run examples -- c02` 会核对唯一的 Node 预期输出。其余文件依赖 DOM，按本地网页步骤操作。

## 练习验收

- 售出：12 → 售出 3 得到 9 → 尝试售出 10 仍为 9 → 售出 9 得到 0、按钮禁用；刷新恢复 12。Enter 同样提交。
- 练习 1：刷新后粘贴代码，输出数字 12、字符串 `"99"`、字符串 `"3"`。再售出 3，页面恢复业务结果 9。
- 练习 2：CSS 末尾添加 `.product-card { width: 720px; }`，360px 出现整页横向滚动；删除规则，360px/1280px 均无整页溢出。
- 练习 3：在 `</form>` 后、反馈前添加 `<button id="restock-button" type="button">补货 5 件</button>`，将答案追加到 app.js。依次得到 12 → 17 → 0 → 5 → 2；售完禁用、补货启用。
- 每次故障演练先恢复正常文件：`./ap.js` 产生脚本 404；去掉 defer 产生 null/addEventListener TypeError。分别恢复路径与 defer，再售出 3 得到 9。

## 验证记录

- 2026-10-15 · macOS arm64 · Python 3.11.8 · Chrome 155.0.8059.40（headless，经 DevTools 协议驱动）：
  - HTML/CSS/JS 均 200，P001 商品信息正确；售出、超卖、售完、刷新、Enter、空值/0/1.5 的原生校验均符合正文。直接分发 submit 时 JS 校验也拦住非法数量。
  - 两个 DOM 片段与 URL 片段按正文执行；节点文本改 99 后业务库存仍独立，临时 padding 32px 刷新后回到 20px。
  - 脚本路径 404、漏 defer 的 TypeError 均复现；漏 defer 时在首行暂停并单步查询，saleForm 与再次查询的结果均为 null；恢复后交互正常。
  - app.js 第 23 行断点命中 handleSale：stock=12、quantity=3；单步后 remaining=9、stock=12；继续后页面为 9。
  - 正常 1280px：两列各 448px；360px：单列 328px，均无整页溢出。固定宽度故障与删除规则后的恢复符合练习 2。
  - 组合补货 HTML 与答案，库存和禁用状态符合练习 3。禁用页面 JS 后商品信息、库存 12 与 noscript 提示仍存在，售出按钮禁用。
- 2026-10-15 · Node 24.22.0：`url-resolution.js` 的 stdout 与 `.expected.txt` 一致，1/1 通过。
- 2026-10-15 · 本地生产页：15 个代码块、6 个练习折叠区；360px/1280px 无整页溢出，新版 D2 中文可读、折叠交互和禁用 JS 后正文阅读正常；`npm run check`、`npm run build` 通过。
- 2026-10-15 · [Pages run 38761177588](https://github.com/socoo123/js_web/actions/runs/38761177588) 成功；文章与新版 SVG 均返回 200，内容逐字节等于本地构建。
- 本课重构时 T0 尚未实现，使用忽略目录中的临时脚本核对内容规则、代码块与文件一致性、Node 输出。
- 未运行：手动点击 DevTools 面板（路径按 Chrome 官方文档核对）、其他浏览器、Windows、真实手机。

## V2 连续工作区

2026-10-28 · 发行版 2026.10-v2.2：本课在 `labs/inventory/` 持续修改，`npm run lab -- check C02` 检查实际文件。C00→C20 的单目录正文跟做、错误证据与修复见 [R5 验证](../../labs/records/R5.md)。Java 完整源文件在 labs/reference/java，已用 Java 21.0.2 执行；旧例子保留为可选参考。网站使用原 URL 与 F1 课号。
