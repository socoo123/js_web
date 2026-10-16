# C14 原生页面、存储与错误处理 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| json-snapshot.js | `node json-snapshot.js` | 字符串快照与独立对象 |
| syntax-shape.js | `node syntax-shape.js` | JSON 语法成功与结构有效的区别 |
| validate-stock.js | `node validate-stock.js` | JSON 字段严格检查类型和范围 |
| save-order-broken.js / save-order-fixed.js | `node 文件名.js` | 练习 2：写入失败时保留原内存 |
| prediction.js | `node prediction.js` | 练习 1：对象身份与有效空数组 |
| storage.html / storage-basics.js | 本地网页 | 字符串、显式保存与删除练习键 |
| storage-broken.html / storage-broken.js | 本地网页 | 故意遗漏 catch，坏 JSON 阻止页面更新 |
| storage-fixed.html / storage-fixed.js | 本地网页 | 捕获读取/解析失败、提示与显式清理 |
| valid.json / empty.json | 由库存页导入 | 固定 6 商品与合法空库存；均带 version 1 |
| invalid-syntax.json / invalid-stock.json | 由库存页导入 | 故意写坏 JSON / 库存为字符串 |
| duplicate-id.json / invalid-version.json | 由库存页导入 | 重复编号 / 不支持的版本 |
| ../inventory/02-web/ | 本地网页 | 完整存储、恢复、导入导出与原有筛选编辑 |

## 运行

- 本目录执行 Node 命令；仓库根目录运行 `npm run examples -- c14` 核对 6 份固定输出。
- 仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c14/`。
- 库存入口：`http://127.0.0.1:8000/examples/inventory/02-web/`。首次复现时先恢复初始数据。
- 库存键：`js_web:inventory:v1`；练习键分别为 `js_web:c14:demo:v1` 和 `js_web:c14:broken:v1`。
- 坏 JSON 练习：Console 写入 `localStorage.setItem("js_web:c14:broken:v1", "{")` 后刷新错误页；修复页显示提示并可显式清除。
- 导入文件不要求使用特定文件名，但要求 version 1、products 数组与全部合法业务字段；导入将整份替换。

## 验证记录

- 2026-10-16 · Node 24.22.0 / npm 11.19.1 · macOS arm64：6/6 固定输出、全量 159/159 通过；lint 零 error/warning，astro check 零诊断，build 与生产输出检查通过；正文 7860/8000 字符、16 个代码块。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：
  - 6 个纯 JS 脚本与 Node 输出一致；storage-basics 输出 null、0 string、3、0。
  - 错误页解析前行号断点读取 raw="{"、typeof raw="string"；继续后 SyntaxError 阻止更新；修复页保留坏文本、显示恢复提示，点击清除后恢复商品数 0。
  - 阶段 2：无副本为 52 件、26348.00 元；P002 改 3 为 55 件、26735.00 元，筛选和刷新保留；0/99999 通过，空/-1/3.8/100000 被拒绝。
  - 实际点击导出并读取下载文件；恢复初始数据后回导同一文件，编辑恢复；取消导入、4 类坏文件保留内存与存储，重复选择可重试。
  - 合法空库存刷新仍为空，valid.json 恢复固定数据；id/名称/分类/库存/价格/标签的非法边界逐项被拒绝。
  - 坏语法、null、错版本与错结构的本地副本降级初始 JSON，保留原文；显式恢复后才覆盖。
  - 同源不同路径共享该键；localhost 与 127.0.0.1 相互隔离。
  - 注入 QuotaExceededError 验证写入失败：编辑、导入、恢复均保留两份数据；注入属性 getter 的 SecurityError 验证读取降级，原生存储限制未通过实际耗尽配额复现。
  - 有效本地副本跳过商品 fetch；恢复时 404/断网/坏 JSON/错结构保留两份数据；初始加载失败可重试或导入；慢网控件与 aria-busy 正确恢复，裁剪名称并移除额外字段。
  - 正常页无未捕获脚本异常；错误页的故意 SyntaxError 已单独核对。
  - 生产预览 /js_web/ 下文章与路线返回 200，16 个代码块与 4 个答案折叠区存在；禁用 JS 后正文与答案仍在。练习 2 去掉 throw 后两版均输出库存 3。
- 未运行：DevTools 界面手动点击、Firefox、Safari、真实手机；面板入口对照 Chrome 官方文档。本课未改站点样式，沿用 C12 周验收。
- 同日：[Pages Actions 38924073963](https://github.com/socoo123/js_web/actions/runs/38924073963) 成功；线上文章与路线页返回 200，HTML 与本地构建逐字节一致。
