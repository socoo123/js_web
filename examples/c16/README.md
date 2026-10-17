# C16 模块、依赖与组织代码 · 示例

配套 [C16](../../src/content/docs/03-async-modules/c16-modules-dependencies.md) 与 [ES 版本速查](../../src/content/docs/reference/es-versions.md)。无新增依赖；固定商品来自 shared/products.js。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| format.js + imports.js | `node imports.js` | 默认/具名导出、改名导入 |
| counter.js + live.js | `node live.js` | 独立作用域、活绑定、命名空间、单次初始化 |
| readonly.js | `node readonly.js` | 导入绑定不能重新赋值，捕获 TypeError |
| report.js + dynamic.js | `node dynamic.js` | 动态 import、Promise、缓存 |
| cycle-a.js + cycle-b.js + cycle.js | `node cycle.js` | 故意在循环依赖初始化时读取 TDZ，预期 ReferenceError |
| wrong-export.js / path-error.js | `node 文件名.js` | 故意缺失导出/扩展名，预期 SyntaxError / Error |
| legacy-total.cjs + legacy-report.cjs + commonjs.js | `node commonjs.js` | require/module.exports 与 ESM 默认导入 |
| urls.js | `node urls.js` | 相对 URL 保留 /js_web/，根路径丢失子路径 |
| support.js | `node support.js` | toSorted / Map.groupBy 行为 |
| prediction.js | `node prediction.js` | 练习 1 初始化顺序与共享绑定 |
| project-report.js | `node project-report.js` | Inventory 复用与候选对象独立 |
| storage-roundtrip.js | `node storage-roundtrip.js` | 真实项目快照编解码、空副本、版本拒绝 |
| annual-support.js / year-support.js | `node 文件名.js` | 速查页的代表能力/方法存在性；expected 对应下方 Node 基线 |
| index.html | 本地网页 | 全部浏览器实验与项目入口 |
| browser.html + browser.js | 本地网页 | ESM 复用 Inventory，显示 6 种、52 件、26348.00 元 |
| classic.html | 本地网页 | 故意缺 type=module，等待脚本、Console 语法错误 |
| bare.html / mapped.html + bare.js | 本地网页 | 裸名称失败；import map 映射同一文件后成功 |
| support-browser.html | 本地网页 | 在 Console 查看当前浏览器的年度支持输出 |
| ../inventory/02-web | 本地网页 | C15 页面拆分 ESM，动态导出，候选 Inventory 保存 |

## 运行

- 在本目录执行表中 Node 命令；仓库根目录 `npm run examples -- c16` 自动核对同名 expected 输出。三份故意失败的文件须以非零退出并包含指定错误名。
- 仓库根目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c16/`；HTTP 服务应覆盖整个仓库，不能只把 02-web 作为服务根目录。
- 练习 2 在副本修改：classic 的脚本加 type="module"，wrong-export 改默认导入，path-error 补 .js。正确网页可对照 browser.html，两个修复后的 Node 文件应输出 ¥399.00。

## 验证记录

- 2026-10-17 · Node 24.22.0 / npm 11.19.1 · macOS arm64：15/15 固定输出、全量 176/176 通过；lint 零 error/warning、astro check 零诊断，build 与生产输出检查通过；正文 7943/8000 字符、15 个代码块。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：
  - browser 显示完整汇总；classic 与 bare 如预期失败，mapped 显示 ¥399.00；年度代表能力均为 true。
  - 静态请求包含 app/Inventory/validation/storage/api/view；初次未请求 download，首次导出才请求并成功下载。禁用缓存后阻断动态模块，反馈显示导出失败，无未捕获异常。
  - 配件筛选两项，搜索无结果为空态；P002 从 0 改 3 后为 55 件、26735.00 元，刷新保留，保存后焦点回编辑按钮。
  - 注入 Storage.setItem 失败后再改 P002：列表、汇总和存储均保持原值，取消重开仍为 3，证明没有先改当前 Inventory。
  - 实际导出、恢复、回导下载文件通过；坏导入拒绝；损坏存储保留坏原文并降级初始 JSON；404 显示失败，解除故障重试恢复。
  - 360/768/1280px 仍为 1/2/4 列，无横向溢出。页面模块变量不再暴露在全局，检查通过 DOM、存储与请求完成。
  - 从 c16/browser.html 导入项目 api.js，仍正确请求模块相邻 JSON；有效空副本显示暂无商品、零汇总，无重试按钮。
  - 练习 2 的两个 Node 修复副本均输出 ¥399.00；生产预览 /js_web/ 下课程、速查页与路线返回 200，15 个代码块和 4 个折叠区保留，禁用 JS 后正文与答案可读。
- ES2026 探测：Node 中所查 Map/WeakMap Upsert、Iterator.concat、四个 Uint8Array 编解码方法与 Math.sumPrecise 缺失；JSON context.source、Error.isError、Array.fromAsync 存在；Chrome 中所查方法均存在，JSON source 可读取。
- 未运行：DevTools 界面手动点击、Firefox、Safari、真实手机；面板入口按官方文档核对。网站主题与配置未改，沿用周验收。
- 同日：[Pages Actions 38984292309](https://github.com/socoo123/js_web/actions/runs/38984292309) 成功；课程、速查页与路线页均返回 200，HTML 与本地构建逐字节一致；线上 D2 返回 200、image/svg+xml。
