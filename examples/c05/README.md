# C05 对象、引用与数据交换 · 示例

配套 [C05 正文](../../src/content/docs/02-language-data/c05-objects-json.md)。各 JS 文件独立、无依赖，采用 PLAN 固定商品数据的字段子集；仓库是用于观察共享关系的附加字段。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| properties.js | `node properties.js` | 字面量、点/方括号、自有属性、增改删 |
| optional.js | `node optional.js` | 深层空值与可选链 |
| destructuring.js | `node destructuring.js` | 解构读取、改名、默认值 |
| strings.js | `node strings.js` | 清洗、查找、截取、模板与 UTF-16 |
| references.js | `node references.js` | 别名、浅复制与共享仓库 |
| copy-path.js | `node copy-path.js` | 按路径复制、展开覆盖顺序 |
| parameters.js | `node parameters.js` | 改字段与给形参重新赋值 |
| json.js | `node json.js` | JSON 文本、解析和语法错误 |
| json-boundaries.js | `node json-boundaries.js` | undefined、NaN、Date、BigInt |
| import-product.js | `node import-product.js` | 解析、校验、构造四字段记录 |
| dates.js | `node dates.js` | UTC、明确偏移、跨日、无效日期 |
| draft-broken.js | `node draft-broken.js` | 调试起点，原城市被误改是预期故障 |
| draft-fixed.js | `node draft-fixed.js` | 两层对象独立的参考修复 |
| prediction.js | `node prediction.js` | 练习 1 预测输出 |
| import-broken.js | `node import-broken.js` | 练习 2 起点，字符串库存导致 03 |
| import-answer.js | `node import-answer.js` | 练习 2 独立答案，捕获导入错误 |
| draft.html | 本地网页 | Sources 断点与单步现场 |

## 运行

- Node：在本目录执行表中命令，输出与同名 `.expected.txt` 比较。
- Console：按正文顺序粘贴完整代码块；异常分类为练习的预期结果。
- 本地网页：在本目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，用 Chrome 打开 `http://127.0.0.1:8000/draft.html`。
- 在仓库根目录运行 `npm run examples -- c05` 自动核对预期输出，`npm run lint:lessons` 检查正文规则。

## 验证记录

- 2026-10-16 · macOS arm64 · Node 24.22.0：16/16 文件 stdout 与手写 `.expected.txt` 一致；故障文件核对的是预期错误结果。
- 同日 · Chrome 155.0.8059.40（headless，经 DevTools 协议驱动）：16/16 文件输出一致；正文 15 个 JS 代码块依次在同一 Console REPL 执行，无声明冲突。
- Node 与 Chrome：导入器校验 32 组输入；涵盖正常/清洗/未知字段、null/数组/原始值、库存缺失/类型/小数/上下界、价格分类型/负值/小数/不安全整数、编号格式、名称类型/空白/40 与 41 长度、JSON 尾逗号。练习 2 完整答案也在 Node 对这 32 组输入验证提示和计算结果。
- Node 的 TZ 与 Chrome 的时区覆盖均测试 UTC、Asia/Shanghai、Pacific/Honolulu：`dates.js` 的输出逐行一致。Chrome 中显式指定上海的 Intl 格式化仍得到 2026 年 10 月 15 日；未比较各语言的标点和排版。
- Chrome 真实加载本地 `draft.html`：在城市赋值前暂停，外层身份 false、内层身份 true；单步后两侧城市均为杭州。加载修复源码后内层身份 false，单步后原城市上海、草稿杭州，日志与预期一致。修复源码通过请求拦截替换，仓库保留故障起点。
- 正文临时规则通过：7,973 个非空白字符、15 个代码块、每块 ≤ 25 行、5 个主体概念节、3 处先猜、2 题各有提示和答案；带文件名的代码块与文件逐字一致。`npm run check`、`npm run build` 通过。
- D2 已用固定工具重建并截图检查，中文与身份箭头清楚。全套周视觉验收未重复执行。
- Pages [run 38842751440](https://github.com/socoo123/js_web/actions/runs/38842751440) 成功；线上文章和新版 D2 返回 200，字节内容与本地生产构建一致。
- 重构时的临时核对脚本和结果在忽略目录 `.cache/qa/c05-*`，不是课程运行依赖；后续完成的 T0 已提供永久门禁。
- 未运行：DevTools 界面逐项人工点击、Firefox、Safari、Windows。面板路径已按 Chrome 官方文档核对，断点与单步经协议实测。
