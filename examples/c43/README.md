# C43 UI5 Web Components 原生使用 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| restock-cases.js | `node restock-cases.js` | 售罄、非法文本、原对象与库存上限 |
| event-contract.js | `node event-contract.js` | EventTarget、事件原名和 detail |
| prediction.js | `node prediction.js` | 练习 1 |
| registered-console.js | 原生实验页 Console | 自定义元素注册 |
| attributes-console.js | 同上 | 布尔 attribute 与 property |
| shadow-console.js | 同上 | light DOM 与 shadow tree 查询边界 |
| parts.css | Elements → Styles | 宿主、普通后代选择器与公开 part |
| lab/ | 本地网页 | 原生补货页、主题/语言与 React 19 对照 |
| restock.test.js / webcomponents.test.js | 见下 | 2 条业务回归、5 条浏览器回归 |

## 运行

- 本目录执行 Node 命令；仓库根执行 `npm run examples -- c43`，核对三个 `.expected.txt`。
- lab 目录执行 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:8043/`；react.html 仅对照原生属性与事件，没有 React 包装库。
- lab 执行 `npm run build`、`npm run preview`，打开 `http://127.0.0.1:8143/`；交付整个 dist。base 为 ./，可以把完整产物挂到 /js_web/native/ 静态目录。
- 仓库根执行 `node examples/inventory/04-react/node_modules/vitest/vitest.mjs run --config examples/c43/vitest.config.js`；复用阶段 4 已锁工具，缺失时在阶段 4 npm ci。
- 使用独立 headless Chrome，不操作现有窗口。设置 C43_BASE_URL 可改入口；例如 `C43_BASE_URL=http://127.0.0.1:8343/js_web/native/` 后执行同一测试命令。
- 反例：回归命令前加 `C43_BROKEN_EVENT=1`，末尾加 `-t '注册、固定数据'`，预期预览更新失败。只拦截开发源码，把监听名改成 ui5Input，不修改文件。

## 验证记录

- 2026-10-19 · macOS arm64 · Node 24.22.0/npm 11.7.0：固定输出 3/3；lab 精确锁 UI5 Web Components/base/icons 2.27.2、Vite 8.3.4、React/ReactDOM 19.3.1，npm ci 与静态构建通过。根依赖、锁、站点配置、D2 和阶段 6 未改。
- Chrome 155.0.8059.82 headless · Vitest 5.0.5/Playwright 1.64.1：开发 7/7、静态 /js_web/native/ 7/7。页面异常、Console error、HTTP 错误和失败资源均纳入正常回归。
- 原生页初始 6 件/库存 52/26348.00 元；P002 输入 3 后库存 3、汇总 55/26735.00 元；刷新恢复。空白、3.8、3件、负数、0 与超上限禁止提交，恢复合法输入后键盘 Tab/Enter 补货成功。
- 三个 Console 文件实际执行：注册 true/true；布尔 true true→false→boolean；Shadow 查询 heading/null/true。slot 节点仍归页面，错误 slot 不分配；改回后按正文刷新，标题恢复。运行中改成无效 slot 后，UI5 会忽略该 slot，故恢复步骤明确要求刷新。
- 公开 input part 字间距 2px 生效，普通后代选择器未使内部输入变红；深色变量由 #f5f6f7 变为 #12171c，中文翻译及 parameters-bundle 资源请求成功；语言切 en 后图标可访问名称清除→Clear，业务标题仍为中文。
- React 19 对照页：真实 ui5-input 事件更新 state/文字，value property 与 disabled 布尔传递正确。事件错误名反例先失败，正常命令恢复通过。
- 网站 lint 43 课零 error；check 零诊断；全量固定输出 283/283；build 49 页与 /js_web/ 产物检查通过。课程生产页 HTTP 200、6 个折叠区展开、资源/异常、禁用 JS 阅读与实验页 360px 无溢出通过；[Pages run 39180665049](https://github.com/socoo123/js_web/actions/runs/39180665049) 成功；线上课程和路线均 HTTP 200，标题、6 个折叠区、43/48 与 C43 链接正确。
- 未运行：DevTools 界面手动点选、屏幕阅读器、Firefox、Safari、Windows；真实 SAP 服务与后端持久化。
