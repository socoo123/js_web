# C38 一个普通组件库的完整案例 · 示例

| 文件/目录 | 运行 | 说明 |
| --- | --- | --- |
| table-contract.js | `node table-contract.js` | 排序后记录身份、数字排序与显示文本 |
| draft-boundary.js | `node draft-boundary.js` | 表单文本、业务数字与原对象分离 |
| prediction.js | `node prediction.js` | 练习 1：不可变保存、统计与空值校验 |
| ../inventory/05-antd | 见下 | Table/Form/Modal 完整应用、故障实验和测试 |

## 运行

- 本目录运行上表 Node 命令；仓库根运行 `npm run examples -- c38` 自动核对三个 `.expected.txt`。
- 在 `examples/inventory/05-antd` 运行 `npm ci`、`npm run dev -- --host 127.0.0.1`，打开终端的 `/js_web/` 地址。
- 同目录执行 `npm test`、`npm run test:e2e`、`npm run test:e2e:production`、`npm run build`；测试采用本机 Chrome headless，缺少时先安装 Chrome。完整说明见阶段 README。
- 开发服务：`/js_web/labs/lifecycle.html?case=broken` 复现保留草稿，`?case=fixed` 运行正确参考。实验不进入生产首页。

## 验证记录

- 2026-10-18 · macOS arm64 · Node 24.22.0/npm 11.19.1：`npm run examples -- c38` 3/3；阶段 5 `npm install`、`npm ci`、`npm test` 15/15 和 `npm run build` 通过，依赖审计无已知漏洞。antd 6.6.6、React 19.3.1、Vite 8.3.4、Vitest 5.0.5、Playwright 1.64.1 固定在示例独立锁，根清单与锁不变。
- 同日 · Chrome 155.0.8059.82 headless 独立 profile：`npm run test:e2e` 6/6；排序后 P002 仍读 0；取消草稿不保存，重开恢复 0；空库存与三位价格校验聚焦字段；保存 3 后 55 件/26735.00 元，焦点回到同商品按钮，快照后刷新保留。
- 全字段：P004 去名称首尾空格、库存 0、价格 299.01 元、分类音频、取消热销后保留新品；新增 P007、补货、删除、搜索空态、空数组快照通过。坏 JSON 保留原记录并提示，恢复按钮清除；模拟 Storage.setItem 抛 SecurityError，显示失败且内存库存保留。
- 草稿实验：错误起点“键盘改 8→Esc→鼠标”标题 P002、字段 8；正确参考字段 0。纯函数回归与真实浏览器路径分别记录，不把资料核对作为执行通过。
- 360px 深色：表格内部横向滚动、文档无横向溢出；Portal 输入背景 rgb(20,20,20)；连续 12 次 Tab 和 12 次 Shift+Tab 留在弹窗。首轮发现中文双字按钮的可访问名称插入空格，确认/取消按钮补显式名称；首尾 Tab 转到文档外后，通过 modalRender 包装层直接循环修复并回归。
- `npm run test:e2e:production`：构建后 5/5 应用用例通过，/js_web/ 生产资源可用。构建有单入口 JS 大于 500kB 的体积提示，未修改阈值；实验不计入生产产物。
- 站点：`npm run lint:lessons` 38 课零 error/warning；`npm run check` 零诊断；`npm run build` 全量固定输出 269/269、44 页构建与资源/折叠区检查通过。
- 本地站点：C38 与路线 HTTP 200、标题与 6 个练习折叠区正确、路线 38/48，无失败资源或页面错误；1280px 表格和 360px 深色弹窗已截图检查。
- Pages：[run 39121201638](https://github.com/socoo123/js_web/actions/runs/39121201638) 成功；线上 C38 与路线 HTTP 200、标题/6 个折叠区/路线 38/48 正确，无失败资源或页面错误。
- 未运行：在 React DevTools 界面中手动展开 Components 的步骤（实验值由浏览器行为核对）、屏幕阅读器、Firefox、Safari、Windows；MUI 等候选库接入未执行。
