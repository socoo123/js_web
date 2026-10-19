# C48 总复盘与后续路线 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| runtime-boundary.js | `node runtime-boundary.js` | 语言内建、DOM、Node 与共享请求能力 |
| identity.js | `node identity.js` | 对象身份、业务 id、Map 键和合法 0 |
| async-order.js | `node async-order.js` | 同步执行、await 与 ESM 顶层等待 |
| feature-check.js | `node feature-check.js` | 复制排序与旧环境分支 |
| gap-priority.js | `node gap-priority.js` | 虚构自评的筛选排序；实际分数由学员填写 |
| review-broken.js | `node review-broken.js` | 浅复制破坏旧状态，保留错误起点 |
| review-fixed.js | `node review-fixed.js` | 真实 reducer 更新，复用阶段 1 统计 |

## 运行

- 仓库根：`npm run examples -- c48`；本目录也可分别运行上述命令，无新增依赖。
- 阶段 4：`npm ci`、`npm run lint`、`npm test`、`npm run test:e2e:pages`，然后单独 `npm run preview:pages`；浏览器访问 `http://127.0.0.1:4179/js_web/#/products`。E2E 与手工预览共用端口，不能同时启动。
- 调试错误起点：本目录 `node --inspect-brk review-broken.js`，Chrome `chrome://inspect` 选择 Node 目标；在写入 stock 前断住，比较两个数组与商品的身份，单步观察旧库存被改。
- 修复复用阶段 4 `productsReducer`，既有回归 `npm test -- tests/reducer.test.jsx`；本课不新增业务逻辑和重复回归。
- 十题自测、评分与个人补缺表在正文；分数和重测日由学员填写。F1 网站学习进度已在后续任务完成，当前状态与测试入口见[根 README](../../README.md)。

## 验证记录

- 2026-10-19 · macOS arm64 · Node 24.21.0 / npm 11.7.0：七个固定输出 7/7；错误起点旧/新鼠标 1/1，答案 0/1、新旧总库存 53/52。
- Node inspect 实际断在 review-broken.js 写入前：before!==after、before[1]===after[1]；库存 0，stepOver 后旧/新均 1。通过独立 inspector 协议执行，Chrome 界面点击路径未手工操作。feature-check 在隔离 vm 中禁用 toSorted 后，降级分支输出一致。
- 阶段 1：demo stdout 与原 expected 逐字一致；6 种/52 件/2634800 分、售罄 1、低库存 2、分类/标签、撤销及异步隔离正常。阶段 2：初始值一致；鼠标 3 件后 55 件/2673500 分，编辑/刷新/导出/恢复/导入、坏副本保留及恢复、360/1280 无横溢通过。
- 阶段 3–7 各自 npm ci 与构建成功，未更改清单或锁。阶段 3 报表参考值一致、Vitest 38/38；阶段 4 lint、199/199、严格静态 Playwright 2/2；阶段 5 Vitest 15/15、生产浏览器 5/5；阶段 6 OpenUI5 全资源构建、静态子路径 C41 9/9 与 C42 5/5；阶段 7 Vitest 4/4、生产子路径浏览器 4/4。
- Chromium 156.0.8078.4 独立后台实例：按正文演示 P002 改为库存 3/单价 29 分，55 件/2634887 分，快照刷新恢复；本地详情与 mock 分离由生产 E2E 覆盖。另复检连续中文输入、空库存错误焦点/说明、保存后标题焦点、未存改动丢弃、坏快照原文保留及清除、360px 表单和 1280px 六卡片；截图已目视检查。
- 网站 lint 48 课零 error/warning（C48 正文 7956 字符、13 代码块）；Astro check 零诊断；全量固定输出 303/303、build 与 55 个 HTML 路径检查通过。七个具名代码块与文件逐字一致，48 课连续，固定数据副本一致，14 张 D2 与 SVG 一一对应且重新构建。
- Q4 · Chrome 155.0.8059.82：54 个可阅读页面（48 课、4 参考、首页、路线）× 1280/360px × 亮暗共 216 组无页面横溢、图均加载；14 张 D2 中文与 C48 截图目视检查通过。六折叠区、首段代码复制、补缺/组件/静态搜索及搜索 UI、54 页禁用 JS 阅读通过，无页面异常或失败资源。
- C48 发布时的 PLAN §10：基于既有逐课记录及上述全量门禁与项目复检，11 项通过；静态阅读/搜索/复制/窄屏已通过，当时 F1 尚未实施。F1 后续上线与最终 12/12 验收记录见 [SOURCES](../../docs/SOURCES.md) 和 [STATUS](../../docs/STATUS.md)。
- Pages [run 39257555264](https://github.com/socoo123/js_web/actions/runs/39257555264) 构建/部署成功（提交 3216857）；线上 C48、刷新、首页、路线 HTTP 200，48/48 与上一课导航、六折叠区、1280/360px × 亮暗、补缺/组件/静态搜索及搜索 UI、禁用 JS 阅读复检通过，无失败资源或页面异常。
- 未运行：真实手机/输入法/软键盘、屏幕阅读器、Firefox/Safari、Windows；本次未重做全部旧课手工实验，原有未运行标注保留。
