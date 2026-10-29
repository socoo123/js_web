# C39 SAP Fiori 与 UI5 家族 · 示例

## 连续 Lab · 阶段 B（2026.10-v2.4）

- 主线在自己的 `inventory/notes/ui5-choice.md`，不再启动本目录的独立 CDN demo；目标发行版 `2026.10-v2.4`，C38 → C39。
- 新版C00自带未接业务的OpenUI5机械壳，默认仍原生页；旧A目录保留，从新版C00取tools/清单/锁/adapters后迁入自己的src/notes及其他已写文件，重新npm ci；补课才用新版C36。
- 工作区检查入口：`npm run lab -- check C39`，包含 `tools/openui5-choice-check.mjs`；四种名称、P004与mock边界检查通过。
- 2026-10-29 · Node 24.22.0/npm 11.19.1 · macOS arm64：根目录 `npm run examples -- c39` 4/4，新增 family-choice.js 对应正文的字段标签预测。
- 实际 XMLView/JSONModel 通知由 `node tools/openui5-model-check.mjs` 在 OpenUI5 1.153.0 / Playwright 1.64.1 Chromium 中重验：0/0 → 直接赋值3/0 → setProperty3/3，默认 TwoWay。
- 首轮使用局部夹具；最终在主集成真实C38上只应用C39增量，85条与家族笔记检查通过，start不改源码。
- 主审返修补验：C00权威源/镜像10文件一致、原生P00112且无UI5请求、无未来core答案；C00–C03恢复/防覆盖契约4/4，课程lint仍零错误/警告。
- 官方家族、CLI/API核查见 [SOURCES](../../docs/SOURCES.md)；最终门禁与发布见 [B记录](../../labs/records/B.md)。未运行：真实SAP、跨浏览器、Windows、屏幕阅读器。

## 第一版参考（保留）

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| replenishment.js | `node replenishment.js` | 从固定库存数据提取待补货任务 |
| field-metadata.js | `node field-metadata.js` | 字段值与本地展示配置分离 |
| prediction.js | `node prediction.js` | 练习 1：预测输出 |
| family-choice.js | `node family-choice.js` | 新主线：标签变化不改变库存 |
| index.html、init.js | 本地 UI5 | 固定 OpenUI5 CDN 引导与异步 XMLView |
| Inventory.view.xml、Inventory.controller.js | 本地 UI5 | 命名 JSONModel、补货事件、错误/正确更新 |
| binding.test.js、vitest.config.js | 见下 | Vitest 组织真实浏览器绑定回归 |

## 运行

- 本目录运行上表 Node 命令；仓库根执行 `npm run examples -- c39` 自动核对三个 `.expected.txt`。
- 在 `examples` 目录运行 `python3 -m http.server 8039 --bind 127.0.0.1`；Chrome 打开 `http://127.0.0.1:8039/c39/`，需可访问 OpenUI5 CDN。
- `?case=broken` 绕过模型 API，点击后 Model 为数字 3，控件仍为文本 `"0"`；默认入口为正确参考，显示 0→3→6，刷新回到 0。
- 浏览器回归：保留上述 HTTP 服务，在另一个终端的仓库根执行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c39/vitest.config.js`。
- 回归复用阶段 4 锁定的 Vitest/Playwright，先在 `examples/inventory/04-react` 执行 `npm ci`；使用本机 Chrome 的独立 headless profile，不操作已有窗口。端口不同时设置 `C39_BASE_URL` 为以 `/c39/` 结尾的完整 URL。
- 反例：在回归命令前加 `C39_BROKEN=1`，并在命令末尾加 `-t '补货通知'`；预期模型/控件一致性断言失败。移除该环境变量再执行恢复通过。
- CLI 查询：仓库根执行 `npm view @ui5/cli version engines --json`。本课不安装 CLI，不建立阶段 6 工程；SAPUI5、Web Components 与 React 包装库的关系按官方文档比较。

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0/npm 11.19.1：固定输出 3/3；正文 7740 字符、10 个代码块，39 课 lint 零 error/warning；`npm run check` 零诊断。
- 同日 · Chrome 155.0.8059.82 headless · Vitest 5.0.5/Playwright 1.64.1：3/3 真实浏览器回归通过。框架实际加载 OpenUI5 1.153.0；正常补货为 0→3→6，模型维持 number、控件 text 为 string；刷新恢复 0。
- 反例先失败后恢复：`C39_BROKEN=1` 的一致性回归收到 `{model:3,text:"0"}` 而期望 `{model:3,text:"3"}`，退出 1；移除该变量后全量 3/3 通过。独立错误入口也核对模型 3/控件 0。
- `sap/m/Button` 的类元数据名称为 `sap.m.Button`；实验未注册 `ui5-button`，`customElements.get` 返回 undefined。没有安装 Web Components 或 React 包装库。
- DevTools 暂停帧：错误入口在 onRestock 的日志行前停住，getProperty 为数字 3、控件 getText 为字符串 `"0"`，与正文一致；通过独立 Chrome 调试接口检查，没有操作用户窗口。
- `npm run build`：全量固定输出 272/272、45 页构建及 /js_web/ 路径/资源/折叠区/D2 检查通过；全站 14 张 D2。新增图中文与箭头布局已截图检查。
- 本地生产页：C39 与路线 HTTP 200、路线 39/48；1280px/360px 无文档横向溢出，D2 资源正常，6 个答案折叠区和禁用 JS 阅读正常，无失败资源或页面错误。3 个带 title 的正文代码块与对应文件逐字一致。
- Pages：[run 39122376307](https://github.com/socoo123/js_web/actions/runs/39122376307) 成功；线上 C39、路线均 HTTP 200，标题、6 个折叠区、D2 资源与路线 39/48 正确，无失败资源或页面错误。
- 未运行：在 DevTools 界面上手动点击面板、屏幕阅读器、Firefox、Safari、Windows；SAPUI5、Web Components、React 包装库接入与真实 SAP 服务。
