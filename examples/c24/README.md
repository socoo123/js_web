# C24 数组更新、key 与派生数据 · 示例

正文：[C24](../../src/content/docs/05-react/c24-arrays-keys-derived.mdx)。接自己 C23 的工作区，本课起统一商品 state。

| 材料 | 入口 | 用途 |
| --- | --- | --- |
| object-copy/shallow-broken/immutable-update/derived/prediction/tags-answer.js | 根目录 `npm run examples -- c24` | 6 个固定输出 |
| [C24 steps](../../labs/reference/steps/C24/) | C23 → C24 | 3 个 React 文件，collections 追加编号函数 |
| [c24.test.jsx](../../labs/inventory/tools/c24.test.jsx) | 当前实际 App | 库存/引用、15/16、删除/排序备注、筛选、增删编号 |

## Lab 与运行

- 发行版 `2026.10-v2.3`，C23 起点/C24 终点；下载目录 `downloads/inventory/2026.10-v2.3/`；主验收与上线证据见 [阶段 A](../../labs/records/A.md)。
- 在当前 `inventory/` 执行 `npm run lab -- start C24`、`npm run lab -- dev`、`npm run lab -- check C24`。
- 本段组件回归：工作区执行 `node node_modules/vitest/vitest.mjs run --config tools/foundations.config.mjs`；从 C24 完成态同时验证 C21/C22 契约。
- 汇总采用当前筛选结果：P004 初始 3/89700，补一件后 4/119600；清空筛选后是全量口径。不要用旧文的全量汇总断言替代它。
- 阶段汇总与发布状态见 [A 记录](../../labs/records/A.md)；本路证据与共享建议位于该记录所列隔离副本的 `delivery/agent-1.md`。

## 本次验证 · 2026-10-29

- macOS arm64；Node 24.22.0/npm 11.19.1；React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.4；未对只读依赖链接安装。
- `npm run examples -- c24` 6/6；本课 5 条回归通过，连同 C21/C22 共 10/10；`lab check C24` 85 条当前文件与浏览器检查通过。
- 实际 App 注入原地修改+同引用 setter，相关组件断言失败；恢复不可变 updater 后 5/5。
- 实际 ProductList 改用 index key，删除/排序备注回归失败；恢复 id 后同一用例通过，整段 10/10。
- headless Chromium 156.0.8078.4：Sources CDP 在 setter 前读内存 P001=13、DOM=12；索引故障删除后 P002 误留“键盘待盘点”；恢复后库存和 id 备注正确。
- 正文任务实际执行：鼠标补一件后筛选统计 1/12900，清空为 53/2647700；删除 P001 后新增 P007/P008 得 7 种、41 件、2168900 分；360px 无横向溢出。
- 新增编号测试含空集合 P001、连续 P007/P008、删除后按当前最大号生成、P999 时 null；旧商品、tags 与未改对象身份受保护。
- 主体 6 处代码与实际参考解一致；建议注册表镜像 lint：5070/8000 字、9 块、零 error/warning；原有 19 个标题/显式锚点保留。
- 首次返修：第 4 步明确独立刷新后执行。浏览器先改变库存/筛选/排序，再刷新得到 52；不设筛选补 P002→删 P001→新增两次，得到 7/41/2168900，记录在 `delivery/agent-1-revision-1.json`。
- 这是参考解组装与行为回归。主集成的16快照、构建及周视觉/发布记录见阶段 A；本路未运行重新 npm ci、手动 DevTools UI、旧阶段 4、Firefox/Safari/Windows。

## 历史

2026-10-17 旧阶段 4 与第二周验收已发布：[Pages 39021433607](https://github.com/socoo123/js_web/actions/runs/39021433607)。旧工程、包与旧版检查保留，本批未重跑这些历史验收。
