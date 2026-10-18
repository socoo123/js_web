# C40 OpenUI5 入门：MVC 与工程 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| module-paths.js | `node module-paths.js` | 资源映射与子路径 URL |
| prediction.js | `node prediction.js` | 行对象、模型根与大小写 |
| engineering.test.js、vitest.config.js | 见下 | 真实 UI5 工程与绑定的浏览器回归 |
| ../inventory/06-openui5 | 本地 UI5 | 本课完整工程、独立 package.json/lock 与 ui5.yaml |

## 运行

- 本目录执行上表 Node 命令；仓库根运行 `npm run examples -- c40` 自动核对两个 `.expected.txt`。
- 在 `examples/inventory/06-openui5` 执行 `npm ci`、`npm run dev`；打开 `http://127.0.0.1:8040/index.html`（端口根路径为目录入口）。
- 保持开发服务，在仓库根执行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c40/vitest.config.js`。
- 回归复用阶段 4 的锁定工具；缺依赖时先在 `examples/inventory/04-react` 执行 `npm ci`。Chrome 使用独立 headless profile，不操作现有窗口。
- 开发反例：在上述回归命令前加 `C40_BROKEN_BINDING=1`，末尾加 `-t 'Component'`；预期 P002 控件 info 为空、断言失败。移除变量后恢复。
- 生产：阶段 6 执行 `npm run build`，在 dist 执行 `python3 -m http.server 8140 --bind 127.0.0.1`；在仓库根给回归命令加 `C40_BASE_URL=http://127.0.0.1:8140/index.html`，末尾加 `-t 'Component|Input'`。
- 模块故障回归只运行开发源码：把 findProduct 导入请求改成不存在的 findProducts，断言 404，再用干净页面恢复正确源码。生产使用 Component-preload，不注入同一故障。

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0/npm 11.19.1：两个固定输出 2/2；阶段 6 的 npm ci 与 CLI 静态构建通过。隔离空目录的 npm init -y、npm install --save-dev @ui5/cli@4 也运行通过。
- 同日 · Chrome 155.0.8059.82 headless · Vitest 5.0.5/Playwright 1.64.1：开发 3/3、生产 2/2；六件商品逐字段等于共享数据、总库存 52、P002 模型为数字 0/控件 info 为字符串 "0"。默认、带空格、空编号、未知编号与刷新均符合正文。
- 开发反例先失败后恢复：Stock 拼写错误使 info 为 ""，回归退出 1；恢复后 3/3。模块改为 findProducts 时请求 404，干净页面恢复正确路径后启动成功。浏览器拦截仅用于测试，不修改源码。
- XML 绝对 /name 路径的六行名称为空，编号和库存保留；错误模型名 products 使行数为 0，inventory 数据仍有 6 件。Sources 对应行暂停后得到 stock=0、Stock=undefined、控件 info=""，与调试步骤一致。
- 生产最初缺少 sap-ui-version.json，已按官方任务表加入 generateVersionInfo 并重新构建；根路径及 /js_web/ui5/ 子目录预览均 2/2、无失败资源或页面错误；停止 UI5 开发服务后，静态端口仍通过查询回归。
- 正文 7975 字符、13 个代码块；40 课 lint 零 error/warning，npm run check 零诊断，npm run build 全量固定输出 274/274、46 页及 /js_web/ 产物检查通过；两个带 title 与四个完整工程代码块和文件一致，无新增 D2。
- 本地生产课程与路线均 HTTP 200，路线 40/48；C40 的 1280px/360px 无文档横向溢出、无失败资源或页面错误，六个答案折叠区及禁用 JS 阅读正常。UI5 工程与课程页面已截图检查。
- Pages：[run 39124104412](https://github.com/socoo123/js_web/actions/runs/39124104412) 成功；线上 C40 与路线均 HTTP 200，标题、六个答案折叠区、路线 40/48 与新课链接正确。
- 未运行：DevTools 界面上手动点选面板、屏幕阅读器、Firefox、Safari、Windows；真实 SAP 服务。
