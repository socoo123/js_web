# C06 函数、闭包与高阶操作 · 示例

配套正文：[C06](../../src/content/docs/02-language-data/c06-functions-closures.md)。纯 JS 示例无需第三方依赖，每个文件单独运行。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| function-values.js | `node function-values.js` | 三种函数写法、函数引用与调用 |
| parameters.js | `node parameters.js` | 默认值、rest 与空数组 |
| lexical-scope.js | `node lexical-scope.js` | 定义位置决定作用域查找 |
| counter.js | `node counter.js` | 两个引用共享计数，工厂调用创建独立计数 |
| shared-binding.js | `node shared-binding.js` | 同次调用产生的闭包共享可变绑定 |
| select-products.js | `node select-products.js` | 同步回调，把循环与判断规则分开 |
| filters.js | `node filters.js` | 分类筛选工厂，包含售罄商品 |
| loop-broken.js / loop-fixed.js | 分别用 `node` 运行 | var / let 的循环绑定 |
| return-broken.js / return-fixed.js | 分别用 `node` 运行 | 漏 return 与对象表达式 |
| prediction.js | `node prediction.js` | 练习 1：绑定当前值与函数身份 |
| filters-broken.js / filters-answer.js | 分别用 `node` 运行 | 练习 2：函数值与布尔结果 |
| index.html + counter.js | 本地网页 | 在 Scope 观察闭包中的 count |
| loop.html + loop-broken.js | 本地网页 | 在循环断点观察 index；改用 loop-fixed.js 验证修复 |

## 运行

- Node：在本目录执行上表命令；仓库根目录执行 `npm run examples -- c06` 自动核对 14 份固定输出。错误版本的预期输出保存的就是错误现象。
- 网页：在本目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/` 或 `/loop.html`，按正文设断点。
- 项目：进入 `../inventory/01-core`，运行 `node demo.js`；根目录 `npm run examples` 也会核对项目输出。

## 验证记录

- 2026-10-16 · Node 24.22.0 · macOS arm64：C06 固定输出 14/14 与阶段 1 demo 通过；正文所有带 title 的代码块与同名文件逐字一致。
- 同日：计数器共享引用/起点 12、筛选阈值 0/13、空数组、项目音频分类均按正文验收；共享 JS/JSON 数据一致，总库存 52、总价值 2,634,800 分。
- 同日 · Chrome 155.0.8059.40（headless，DevTools 协议）：14/14 文件输出与 `.expected.txt` 一致。
- 计数器实际网页断点：`next` 的 Closure (createCounter) 中 count 在加法前为 0、1、0，单步后为 1、2、1；最终日志为 1、2、1。
- 循环实际网页断点：创建函数时 index 为 0、1、2；循环后调用三个函数，var 版为 3、3、3，let 版为 0、1、2。修复版通过相同页面加载后核对。
- D2 以固定工具链生成 SVG，已在 Chrome 渲染并检查中文与引用关系。
- 全站门禁：六课 lint 零 error/warning，Node 固定输出 69/69，`check`、`build` 通过；本地 1280px/360px、亮暗模式、折叠答案、复制、搜索与禁用 JS 阅读通过。
- Pages：[run 38844828221](https://github.com/socoo123/js_web/actions/runs/38844828221) 成功；新课、路线和搜索入口返回 200，文章与 D2 与本地生产产物逐字一致。
- 未运行：Windows/macOS 图形安装向导、DevTools 界面上的手动点击、Firefox、Safari。面板路径依据 Chrome 官方文档核对，断点与作用域内容按上述协议实测。
