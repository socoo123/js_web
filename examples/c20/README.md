# C20 构建工具与第一次 UT · 示例

配套正文：[C20](../../src/content/docs/04-runtime-tooling/c20-vite-vitest.md)。工具与测试在 [阶段 3](../inventory/03-tooling/)，本目录的 Node 示例不需要安装依赖。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| prediction.js | `node prediction.js` | 错误计数 3，对照 Inventory 正确计数 2 |
| identity.js | `node identity.js` | 同内容统计对象身份不同；JSON 仅用于这组观察 |
| boundaries.js | `node boundaries.js` | 空统计、0/1/5/6 边界、报告非法输入 |
| low-stock-fixed.js | 被 answers.js 导入 | 低库存修复后的函数 |
| answers.js | `node answers.js` | 练习 2 的正确计数和空数组、边界输入 |

## 运行

- 仓库根目录：`npm run examples -- c20`，自动核对 4 个输出文件。
- 阶段 3：`npm ci`，然后 `npm run report`、`npm test`、`npm run build`。
- `npm run dev` 通常在 `http://localhost:5173/js_web/`；`npm run preview` 通常在 `http://localhost:4173/js_web/`。以终端实际地址为准。
- `npm run test:watch` 显式启用 watch；保存测试后重跑，q 退出。
- `npm run test:bug` 选择 labs，原始版本预期非零退出。修复 labs/low-stock.js 后同一用例通过；实验不进入正常 npm test。
- `npm run build:bridge` 构建独立 TS 实验；`npm run check:bridge` 原始版本预期 TS2345、非零退出；`npm run preview:bridge -- --port 4174` 预览它。

## 正常测试与故意失败入口

| 文件或入口 | 结果 |
| --- | --- |
| tests/summary.test.js | 7 条：固定统计、空数组、低库存边界、输入不变 |
| tests/stock.test.js | 19 条：更新/撤销、非法更新不变、库存端点、文本解析 |
| tests/report.test.js | 10 条：分类/空数组、非数组、非法初始库存 |
| tests/async.test.js | 2 条：可控加载成功与拒绝，无网络、无固定 sleep |
| labs/low-stock.test.js | 1 条故意失败：Expected 2 / Received 3；修复后 1 条通过 |
| type-bridge/broken.ts | Vite 转译成功，tsc 检查失败，浏览器显示 123；转换后显示 15 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；阶段 3 锁定 Vite 8.3.4、Vitest 5.0.5、TypeScript 7.0.2，根清单与根锁未改。
- `npm run examples -- c20` 4/4，全量固定输出 200/200 通过。阶段 3 重新 `npm ci` 后，`npm test` 38 条、`npm run build`、report、versions 通过；根 lint/check/build 通过，24 个 HTML 与 20 课产物检查通过。
- 低库存实验实际先失败再修复通过。练习 2 扩展后 6 条通过；删除下界/排除 5 分别被边界用例发现。实验文件最后恢复故意带错的原始起点。
- watch 启动、文件变动后 7 条重跑、q 退出已执行。
- TS 原始源码构建成功、类型检查报 TS2345；Number 转换后检查与构建通过。实验恢复原始错误起点。
- Chrome 155.0.8059.82（headless，DevTools 协议）：dev/preview 初始 6 种、52 件、26348.00 元；配件筛选 2 种；预览编辑 P002 后 55 件、26735.00 元，刷新保留；导出动态块成功，无页面异常或失败资源。
- 生产 JS 的 sourceMappingURL 与 .map 一致；映射至 01-core/inventory.js 第 30 行，在对应生成位置命中断点，调用参数为 P002、3；继续后汇总正确。
- TS 独立预览实际显示 123；转换并重建后实际显示 15。
- 未运行：在 DevTools UI 中手工点击的操作路径（按 Chrome 官方文档核对）、Firefox、Safari、Windows。无线上库存应用部署，本课线上发布的是教程正文。
