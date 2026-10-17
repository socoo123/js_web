# C24 数组更新、key 与派生数据 · 示例

配套正文：[C24](../../src/content/docs/05-react/c24-arrays-keys-derived.md)。固定数据来自 shared/products.js，真实 React 交互在[阶段 4](../inventory/04-react/)。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| object-copy.js | node object-copy.js | 新对象、旧库存与共享 tags |
| shallow-broken.js | node shallow-broken.js | 复制数组后修改元素，旧数据也变成 13 |
| immutable-update.js | node immutable-update.js | 新数组与新目标记录，未变商品继续共享 |
| derived.js | node derived.js | 补货后重算筛选与统计，原始顺序保留 |
| prediction.js | node prediction.js | 练习 1：true、待盘点、2 1 |
| tags-answer.js | node tags-answer.js | 练习 1：复制数组、目标对象和 tags |
| 阶段 4 src/product-state.js | 由 App 导入 | 新增、补货、删除与派生筛选/排序 |
| 阶段 4 labs/arrays.html | dev 服务 | 六个错误/正确对照入口，见下表 |
| 阶段 4 tests/arrays.test.jsx | npm test | 旧快照、界面更新、key、派生列表、排序/分类后编辑、空列表恢复 |
| 阶段 4 labs/arrays-bugs.test.jsx | npm run test:bug -- labs/arrays-bugs.test.jsx | 三项故意失败；修复相应 Broken 文件后通过 |

## 运行

- 仓库根目录：`npm run examples -- c24` 自动核对 6 个固定输出；本目录可分别运行 node 文件名.js。
- 阶段 4：`npm ci`、`npm run dev -- --host 127.0.0.1`。打开终端的 /js_web/，实验在其后加 labs/arrays.html?case=下表值。
- 阶段 4 正常构建：`npm test`、`npm run build`、`npm run preview -- --host 127.0.0.1`。labs 仅由 dev 服务提供，不进入生产入口。

| case | 操作与预期 |
| --- | --- |
| mutation / mutation-answer | 给键盘补 1 件：错误页面仍 12，正确为 13，再点为 14 |
| keys / keys-answer | P001/P002 输入键盘/鼠标草稿，删除 P001：错误 P002 留下键盘草稿，正确保留鼠标草稿 |
| derived / derived-answer | 给鼠标补 1 件：原始库存都为 1，错误筛选库存仍 0，正确为 1 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3；没有改动任何依赖清单或锁文件。
- 固定输出 6/6；正常回归 20/20。三项 bug 回归实跑失败，分别显示旧库存 12、鼠标错留机械键盘草稿、筛选库存 0；按正文修复后三项原测试通过，最终恢复教学错误起点。
- 独立后台 Chrome 155.0.8059.82：六个实验、实际输入两份草稿后的删除、搜索、分类、库存排序、补货、新增、删除、空态与刷新均通过，无 pageerror；未操作已有 Chrome 窗口。
- 调试接口实际在 MutationBroken 的 setter 前暂停：内存 stock=13，DOM 仍为 12；删除 P001 后检查 EditableRow 的 React props/state，product.id=P002、draft=键盘待盘点。未在原生 DevTools 界面手动逐项点击，面板入口沿用已核对的前课文档。
- 按项目进度原样操作：补鼠标后 53 件/26477.00 元，删除 P001 后 41 件/21689.00 元，清空条件并新增两次后 7 种/P007/P008，库存与价值不变。
- 练习 3 实际给 App 增加 onlySoldOut 开关及筛选条件，浏览器得到：只见 P002 → 补货后空列表/总库存 53 → 清除条件后六件且 P002 为 1。验证后恢复默认代码。
- 阶段 4 npm ci、20 条测试、build 与生产预览通过；360/1280px 页面无横向溢出。
- 网站 lint 24 课零 error/warning、check 零诊断、build 固定输出 217/217、29 个 HTML 与 24 课产物检查通过。正文 7,946 字符、10 个代码块；3 个具名代码块与示例逐字一致，所有代码块不超过 25 行。

## 第二周验收

- Q2 业务验收：阶段 1 demo 与阶段 3 report 的全部固定参考值一致（52 件、2634800 分、售罄 1、低库存 2、分类 2/1/2/1、标签热销/新品）；阶段 3 npm ci、38 条 Vitest 通过，阶段 4 正常回归 20 条通过。
- 原生阶段 2 在隔离 Chrome 中验证：P002 库存 0 改为 3 → 总库存 55 → 刷新仍 55；损坏 localStorage → 提示无法读取并用初始 JSON 显示 52 → 确认恢复后保存有效 version 1 的六件商品；360/768/1280 无溢出。
- 周视觉验收：C01–C24、首页、路线与两张参考页，共 28 页 × 360/1280 × 亮/暗模式，112 组布局通过；12 张 D2 在两种宽度加载，中文正常；C24 六个答案折叠区、首段代码复制、路线 24/48、搜索 UI 与锁文件/响应式/派生数据三个关键词均通过，无页面脚本或资源错误。
- 禁用 JS：C01–C24 与 Java ↔ JS 速查共 25 页正文可读，C24 折叠答案可展开。截图及自动检查记录仅留在忽略目录 .cache/qa/c24/。
- Pages：[run 39021433607](https://github.com/socoo123/js_web/actions/runs/39021433607) 的 build/deploy 均成功；线上 C24、Java ↔ JS 速查、路线页均 HTTP 200，六个折叠区、24/48、两列速查表与派生数据搜索命中 C24 均正确，无 pageerror。
- 未运行：Firefox、Safari、Windows。
