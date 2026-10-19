# C44 UI5 Web Components for React · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| event-contract.js | `node event-contract.js` | 事件源与 detail.item 的区别 |
| validation.js | `node validation.js` | 空文本、库存 0、金额与标签 |
| prediction.js | `node prediction.js` | 文本草稿、不可变保存与汇总 |
| ../inventory/07-ui5-react | 见下文 | 真实 UI5 React 表单、列表、布局与资源 |

## 运行

在仓库根目录运行 `npm run examples -- c44`，用三个 `.expected.txt` 核对输出。

在 `examples/inventory/07-ui5-react`，使用其独立清单与锁执行 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:8044/`。

- `npm test`：4 条业务回归。
- `npm run test:e2e`：4 条真实 Chrome 控件回归。
- `npm run build` 后执行 `npm run test:e2e:production`：同 4 条回归运行在静态子路径 `/js_web/ui5-react/`。
- `npm run preview`：`http://127.0.0.1:8144/`；生产测试服务器与普通预览共用端口，按顺序运行。
- 在开发模式，`C44_BROKEN_FORM=1 npm run test:e2e -- --grep '真实 item-click'` 将响应中的原生 form 换为 UI5 Form；预期测试失败。去掉变量后恢复。

## 验证记录

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
