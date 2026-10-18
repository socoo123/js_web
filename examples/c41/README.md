# C41 UI5 Model、绑定与业务控件 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| draft-summary.js | `node draft-summary.js` | 独立草稿、P002 补货与汇总 |
| validation.js | `node validation.js` | 零库存、空输入、范围、整数分解析 |
| prediction.js | `node prediction.js` | 可见索引与原数组、formatter、空结果 |
| model-console.js | 已启动的 UI5 网页 Console | 真实 JSONModel 的 TwoWay、setProperty、大小写 |
| load-rules.js | 由示例/测试导入 | 在 Node 加载真实 UI5 业务模块；不模拟绑定引擎 |
| rules.test.js、business.test.js | 见下 | 3 条业务单测、6 条真实 UI5 浏览器回归 |
| ../inventory/06-openui5 | 本地 UI5 | 本课完整阶段工程 |

## 运行

- 在本目录执行上表 Node 命令；仓库根执行 `npm run examples -- c41` 核对三个 `.expected.txt`。
- 阶段 6 执行 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:8040/index.html`。搜索需按 Enter/搜索按钮；语言选择重载并恢复初始商品。
- 仓库根运行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c41/vitest.config.js`，保持 UI5 开发服务。
- 工具复用阶段 4 的锁定依赖，缺依赖时先在 `examples/inventory/04-react` 执行 `npm ci`；Chrome 使用独立 headless profile，不操作现有窗口。
- 反例 1：在回归命令前加 `C41_BROKEN_DRAFT=1`，末尾加 `-t '草稿双向'`，预期原商品被草稿改成字符串 "3"，断言失败。
- 反例 2：加 `C41_BROKEN_PATH=1`、末尾加 `-t '非法字段阻止'`，预期错误写到 /products/0，P004 未更新，断言失败。反例只拦截开发源码，不修改文件。
- 生产：阶段 6 执行 `npm run build`，在 dist 执行 `python3 -m http.server 8140 --bind 127.0.0.1`；仓库根回归命令前加 `C41_BASE_URL=http://127.0.0.1:8140/index.html`。
- 同一套正常测试也可指定一个静态子目录入口，例如 `C41_BASE_URL=http://127.0.0.1:8341/js_web/ui5/index.html`；需先把完整 dist 挂载到该目录。

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0/npm 11.19.1：固定输出 3/3；阶段 6 npm ci、CLI 静态构建通过。沿用 OpenUI5 1.153.0/UI5 CLI 4.0.71，无新增依赖或 D2。
- 同日 · Chrome 155.0.8059.82 headless · Vitest 5.0.5/Playwright 1.64.1：C41 开发 9/9，静态 /js_web/ui5/ 9/9；C40 适配 Table 后 3/3。正常测试检查 Console error、资源状态与页面异常。
- 核对初始 6 件/52/2634800 分，筛选 P004 为 1 件/3/89700 分，空结果三项为 0，P002 补到 3 后为 55/2673500 分。取消、Escape、重复打开、非法输入/焦点、零库存、标签保留、改名离开筛选、刷新、中英往返均通过。
- 业务单测覆盖空白/超长名称、非法分类、库存上下界、非法/三位小数价格及安全整数分边界；最大安全分值转换、展示均保留 .91。
- 两个反例分别先失败（原商品成为 "3"；错误路径导致 P004 仍为 3），去掉故障注入后正常套件 9/9。
- 独立调试页面在 onEdit 暂停：P004 的 context 路径 /products/3、id P004、可见 1 行。Fragment stock 改为 Stock 后，在 dialog.open 前暂停：草稿 "0"、绑定 /Stock、控件值 ""；恢复源码后输入为 0。取消输入 8 后重开为 3。
- model-console.js 的实际输出依次为 TwoWay、3、undefined；带 title 的正文示例与文件逐字一致。正文普通课长度与代码块数由 lint 检查，无新增图。
- 网站 check 零诊断；全量固定输出 277/277，build 47 页及 /js_web/ 检查通过。课程生产页 HTTP 200，正文 6 个折叠区、1280/360 无文档溢出、无失败资源/页面异常、禁用 JS 阅读正常；课程/表格/Dialog 截图已检查。
- Pages：待推送后记录。
- 未运行：DevTools 界面上手动点选面板、屏幕阅读器、Firefox、Safari、Windows；真实 SAP 服务。
