# C10 栈、队列、树与复杂度 · 示例

配套正文：[C10](../../src/content/docs/02-language-data/c10-stacks-queues-trees.md)。没有第三方依赖，分类数据来自阶段 1。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| stack.js | `node stack.js` | 保存独立的旧库存，空栈返回 undefined |
| queue-head.js | `node queue-head.js` | 头索引、剩余数量、释放引用与整批重置 |
| queue-bench.js | `node queue-bench.js` | 十万项 shift / 头索引计时，耗时输出不固定 |
| tree-dfs.js | `node tree-dfs.js` | 递归前序 DFS |
| tree-bfs.js | `node tree-bfs.js` | 头索引队列 BFS |
| tree-iterative.js | `node tree-iterative.js` | 显式栈 DFS，反向压入孩子 |
| deep-tree.js | `node deep-tree.js` | 循环遍历两万条边的单链，20001 个节点 |
| graph.js | `node graph.js` | Map 邻接表及含环关系 |
| undo-broken.js | `node undo-broken.js` | 共享引用导致旧库存丢失，保留错误输出 |
| prediction.js | `node prediction.js` | 练习 1：push / pop 返回值 |
| queue-broken.js | `node queue-broken.js` | 练习 2：有效任务 0 导致提前结束 |
| queue-answer.js | `node queue-answer.js` | 练习 2 参考答案 |
| project-check.js | `node project-check.js` | 练习 3：撤销与遍历边界，使用 Node assert |
| index.html | 本地网页 | 加载 undo-broken.js 供断点调试 |

## 运行

- Node：在本目录执行上表命令。仓库根目录运行 `npm run examples -- c10` 核对 12 份固定输出。
- 计时例子无 `.expected.txt`，单独运行；只比较量级与两个累加和，不断言耗时或倍数。
- 本地网页：在**仓库根目录**运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c10/`。
- 项目：进入 `../inventory/01-core`，运行 `node demo.js`，新增输出也由 `demo.expected.txt` 自动核对。

## 验收输入

| 检查 | 预期 |
| --- | --- |
| P001 补货 3 后再补 2，各存旧值，再撤销两次 | 17 → 15 → 12，空栈 undefined |
| 盘点输入 `[0, 12, 3]`、`[]`、`[0, 0]` | 依次处理全部位置，原数组保留 |
| 计时 count 为 10000 / 100000 | 两个累加和均为 49995000 / 4999950000 |
| 深树改用递归 DFS | 超过运行时深度上限时报 RangeError；具体上限不固定 |
| 项目库存 0、99999、无变化、非法数值、缺失 id | 接受边界；无变化不入栈；拒绝非法修改且不入栈 |
| 两个实例用独立商品副本，修改后撤销 | 历史独立，共享起始商品保持原值，索引对象身份不变 |
| null、单节点树、固定分类树 | 零次 / 一次回调；深度与 DFS/BFS 顺序匹配 |

## 验证记录

- 2026-10-16 · Node 24.22.0 · macOS arm64：`npm run examples -- c10` 12/12；正文 11 个带标题代码块与文件逐字一致。
- 同日：两次修改的 LIFO、空队列与两个零、递归版两万条边报 RangeError 均已运行；循环版遍历 20001 节点。项目验收含非法输入、边界、无变化不入栈、独立副本、索引对象身份、空树、单节点与深度。
- 同日：十万项三次计时，shift 约 759–791ms，头索引约 1.05–1.07ms；一万项约 0.48ms / 0.14ms。累加和一致；这些数字仅记录本机观察。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：11 个浏览器可用模块输出匹配；project-check.js 使用 Node assert，仅在 Node 运行。计时文件单独在 Node 执行。
- 同日：错误版断点前后均为同一对象，库存/历史从 12/12 变成 15/15，最终 15；按正文替换入栈行后，引用比较 false，单步后 15/12，最终 12；Module 作用域存在。
- 同日：课程 lint 零 error / warning，Astro check 零问题，全量 123/123；完整 build 与 13 页 `/js_web/` 产物检查通过。D2 已渲染检查。
- 同日：[Pages run 38876725107](https://github.com/socoo123/js_web/actions/runs/38876725107) 构建与部署成功；新课、路线页与 D2 SVG 返回 200，内容均与本地产物逐字节一致。
- 未运行：DevTools 界面手动点击、Firefox、Safari、Windows。
