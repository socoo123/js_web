# C44 UI5 Web Components for React · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| lab-boundary.js | `node lab-boundary.js` | 连续Lab共用core：文本/数字、P004=3→8、52→57、空白与0 |
| event-contract.js | `node event-contract.js` | 事件源与 detail.item 的区别 |
| validation.js | `node validation.js` | 空文本、库存 0、金额与标签 |
| prediction.js | `node prediction.js` | 文本草稿、不可变保存与汇总 |
| ../inventory/07-ui5-react | 见下文 | 第一版独立参考工程，不是连续Lab主入口 |

## 连续工作区（本课主线）

- 发行版 `2026.10-v2.4`；C43→C44，只改 `adapters/ui5-react/App.jsx`、新建 `ProductEditor.jsx`。保留C36主应用、core/repository；发布状态见B记录。
- 在本版 `inventory/` 执行 `npm run lab -- start C44`、`npm run lab -- dev`、`npm run lab -- check C44`；切界面前停止旧服务。共享CLI已集成。
- 实际源码检查：`node tools/ui5-react-repository.mjs`、`node tools/ui5-react-check.mjs`；严格静态：加 `--production`。端口环境变量 `LAB_UI5_REACT_PORT`，默认18140。
- 仓库根目录 `npm run examples -- c44` 核对4个固定输出，旧3例保留历史业务语义。

## 本次验证记录（阶段B）

- 2026-10-29 · macOS arm64 · Node24.22.0/npm11.19.1，React/DOM19.3.1，UI5React2.27.3，原生/base/fiori/icons2.27.2，Vite8.3.4，Playwright1.64.1。
- 新版C00预置机械壳，inventory镜像逐字一致且没有表单答案。首轮为缺C37–C43的局部夹具；最终真实C43只应用两个文件后，与C44的138个工作文件逐字一致，85条/repository/开发6/6/静态6/6通过。
- `npm run examples -- c44` 4/4；实际core/repository的取消、保存、字段保留、非法值、0、保存失败不写入通过。
- Chromium156.0.8078.4开发6/6：P004取消3/52、鼠标保存8/57、库存Input Enter、保存按钮Enter、空白/空格/负数/小数/非法文本拒绝与0合法、同步重复submit防重、清筛选恢复6项、价格/tags保留。
- 纯键盘Tab→列表Enter打开→输入→Tab→取消Enter→回焦列表通过；两种Enter与鼠标分别从新浏览器上下文开始，实际确认次数均1。原生FormData能读到stock="8"。
- 严格静态 `/js_web/demos/inventory-ui5-react/` 同6/6通过；缺失JS和路径404，无SPA fallback。新增所有实际请求同源/base内断言，阻断外部网络；初始版本尝试8个jsDelivr字体URL先红，HTML defaultFontLoading:false与本地FontFace.css修绿。本地woff2成功请求，FontFaceSet的72为loaded；中文初始+三次刷新、深色与英文Clear通过，无越界/CDN请求。
- 初始语言改为HTML data-ui5-config，移除main里的await setLanguage；实验性FontFace.css路径按锁定2.27.2与官方Fonts文档核对。更新L4为保留旧A目录，从新版C00取tools/包锁/adapters，再迁入自己的src/notes/tests；缺React前置才用C36补课。
- 故障实改独立夹具文件：布局Form替换HTML form、event.detail.value取错、onClick额外保存、移除同步锁均先红；恢复后开发6/6绿。重复保存错误版可观察确认次数2而非1。
- 实际CDP断点：错误布局Form无HTML form祖先、submit命中0、确认0/库存52；恢复后HTML form祖先存在、断点命中1，event.type=submit、id=P004、draft.stock="8"/string，确认1/库存57。真实ui5-input事件的target=UI5-INPUT/value="8"，detail只有inputType；item-click的detail.item对应P004。
- 新物化C36独立npm ci后，候选共享`npm run lab -- check C44`通过85条core检查、repository与开发6/6；严格静态6/6重验通过。依赖软链试跑曾因字体@fs路径403失败，改为自己的安装，不扩大Vite允许范围。
- `npm run lint:lessons` 在仅本地合并候选catalog/snippets元数据后，48课0error/0warning；C44正文5780/8000，11块，全部≤25行。元数据随后逐字恢复。未运行根全量build（依赖软链只读）；最终根check/build与发行由主agent验收。
- 主agent从公开C40连续完成到C43，再仅按C44正文手写两文件：85条/repository/开发6/6；原生form错换Form时保存失败，修复后静态6/6。最终门禁与发布见 [B记录](../../labs/records/B.md)。未运行Firefox/Safari/Windows/真机/屏幕阅读器、真实SAP。
- 批量快照软链字体403另经真实环境红→绿：仅开发检查器许可实际node_modules的realpath，开发6/6/生产6/6；学生CLI及业务源码不变，资源/字体断言全部保留。

## 第一版参考工程运行

在仓库根目录运行 `npm run examples -- c44`，用三个 `.expected.txt` 核对输出。

在 `examples/inventory/07-ui5-react`，使用其独立清单与锁执行 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:8044/`。

- `npm test`：4 条业务回归。
- `npm run test:e2e`：4 条真实 Chrome 控件回归。
- `npm run build` 后执行 `npm run test:e2e:production`：同 4 条回归运行在静态子路径 `/js_web/ui5-react/`。
- `npm run preview`：`http://127.0.0.1:8144/`；生产测试服务器与普通预览共用端口，按顺序运行。
- 在开发模式，`C44_BROKEN_FORM=1 npm run test:e2e -- --grep '真实 item-click'` 将响应中的原生 form 换为 UI5 Form；预期测试失败。去掉变量后恢复。

## 第一版历史验证记录

- 2026-10-19 · macOS arm64 · Node 24.19.0 / npm 11.7.0：3/3 固定输出、4/4 Vitest 回归通过。包锁定 React/ReactDOM 19.3.1、UI5 React 2.27.3、原生/base/fiori/icons 2.27.2、Vite 8.3.4、Vitest 5.0.5、Playwright 1.64.1。
- 独立后台 Chrome 155：开发 4/4、静态子路径生产 4/4 通过；未操作用户正在使用的浏览器窗口。
- 真实 item-click 选择 P002，Input 输入库存 3，经原生提交后列表与汇总为 55 / 26735.00 元；刷新恢复 52 / 26348.00 元。
- 名称空白、库存 -1、价格 1.234 同时错误时显示说明并聚焦名称；库存 0、价格 29.90 可用键盘保存。业务单测另覆盖空白/小数/超界/非法文本、分类白名单、名称上限与标签保留。
- P004 未保存草稿在切换后重置；真实 Select 选择外设、CheckBox 取消热销可保存；单测确认新品保留；重置按钮恢复当前已保存字段；空搜索结果保留编辑区与全部商品汇总。CheckBox 的 aria 状态异步更新，测试点击后等待状态，而非立即断言。
- CardHeader 自动进入 header slot；中文初始化、深色主题和英文组件语言通过，清除图标为 Clear，业务标题仍为中文；所有受测请求无 4xx/5xx、网络失败或 Console error。360px 无页面横向溢出；桌面截图已检查。
- 故障注入把 HTML form 换为 UI5 Form：真实保存回归如预期失败，恢复后全通过。另在浏览器断点停在 submit，读到 event.type=submit、product.id=P002、draft.stock="3"（string）；错误版无 HTML form 祖先，保存未触发，库存保持 52。
- 站点 `lint:lessons` 44 课零 error/warning、`check` 零诊断、`build` 及 286/286 全量输出通过；新文章/速查页导航、6 个折叠区、禁用 JS 阅读通过，51 个 HTML 页面静态资源与子路径检查通过。
- Pages [run 39182549346](https://github.com/socoo123/js_web/actions/runs/39182549346) 成功；C44、UI5 家族速查与路线页均 HTTP 200，线上保留 6 个折叠区，课程计数为 44 / 48。
- 未运行：React DevTools 面板内手动展开 App 的操作、Firefox/Safari、Windows、真实手机与 SAP 后端服务。Components 练习可按正文自己尝试；业务数据与回调已由真实 Chrome 和业务回归检查。
