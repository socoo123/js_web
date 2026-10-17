# C28 useRef 与外部系统 · 示例

配套正文：[C28](../../src/content/docs/05-react/c28-refs-external-systems.md)。普通 JS 在本目录，真实 React 示例在[阶段 4](../inventory/04-react/)。数据沿用 shared/products.js。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| ref-object.js | node ref-object.js | 普通对象的稳定身份与别名 |
| cancel-handle.js | node cancel-handle.js | Node 定时器真实取消，句柄归空 |
| prediction.js | node prediction.js | 闭包读取固定数字与可变容器 |
| 阶段 4 src/App.jsx、ProductForm.jsx | dev / 首页 | 标题 ref 与编辑挂载焦点 |
| 阶段 4 src/InventoryCounter.jsx | dev / 首页 | 延时记录的句柄、等待状态与清理 |
| 阶段 4 labs/refs-main.jsx | 下表实验页 | 八个 ref、焦点与定时器实验 |
| 阶段 4 tests/refs.test.jsx | npm test | 九项新增行为回归 |
| 阶段 4 labs/refs-bugs.test.jsx | npm run test:bug -- labs/refs-bugs.test.jsx | 两项故意失败，修改 Broken 文件后通过 |

## 运行

- 仓库根目录执行 `npm run examples -- c28`；本目录也可逐个运行上表 node 命令。
- 阶段 4 执行 `npm ci`、`npm run dev -- --host 127.0.0.1`，打开终端的 /js_web/ 地址。
- 在地址后加 labs/refs.html?case=下表值；实验页仅 dev 提供。
- 阶段 4 运行 `npm test`、`npm run build`，再用 `npm run preview -- --host 127.0.0.1` 检查生产首页。

| case | 操作与预期 |
| --- | --- |
| probe | 两次日志、更新版本、再日志；分别为 1/1/0、2/2/0、1/3/1 |
| count | 三次点击仍显示 0，输入备注后才显示 3 |
| count-answer | 三次点击依次显示 1、2、3；备注保留 |
| focus | 提交 3 后库存 15、数量清空并回焦点；Enter 提交 2 后为 17 |
| early | 首次打开日志为 null，输入出现但焦点仍在按钮 |
| early-answer | 挂载后由 Effect 聚焦名称输入 |
| timer | 安排后取消仍在两秒后加三，取消时句柄已丢失 |
| timer-answer | 取消保留次数，重复安排只保留最新任务，隐藏清理，重挂载归零 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1。沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3；依赖清单和锁未改。
- 固定输出 3/3；阶段 4 正常回归 86/86，含本课九条；React 生产构建通过。取消测试覆盖等待中重渲染、替换的两个到期点、重新安排、独立实例和卸载时真实撤销定时器。
- 两项 bug 测试先分别报计数仍为 0、取消后仍加三；按 RefCountFixed 与 InventoryCounter 替换两个 Broken 文件后 2/2，通过后恢复教学错误起点。
- 独立后台 Chrome 155.0.8059.82：八个实验按正文操作通过；probe 三组日志一致，count 的错误与修复、补货提交后焦点和 Enter、条件挂载的空节点与修复、延时取消和替换均符合上表。隐藏/重新挂载归零，无页面异常，未操作现有窗口。
- 通过 Chrome 调试接口取得暂停帧：错误计数两次点击前 current 分别为 0、1，页面仍为 0；错误取消事件中 timer 为 null，原任务随后执行加三。没有手动点击 DevTools 界面。
- 首页按项目步骤：P002 改为 3/129.90 后为 55 件、26737.70 元；首次编辑和切换商品聚焦名称，修改单价保留当前焦点，保存回标题，取消回编辑按钮，筛选隐藏按钮后取消回标题。安排/立即记录一次/取消后仍为 1，商品统计不变；错误字段获焦点，切换重置错误；刷新恢复固定六件与盘点零次。
- 固定工程版本下复跑 3/3 与 86/86；两项错误回归按相同命令先失败后通过并恢复起点。网站 lint 28 课零 error/warning、check 零诊断、build 固定输出 232/232 与 33 页产物检查通过；正文 7939 字符、13 个代码块，全部代码与源文件或连续节选一致。
- 生产预览：React 保存后的数值与标题焦点、跨渲染取消通过；课程 HTTP 200，禁用 JS 后 13 段代码与四个折叠区可阅读和展开；路线页 28/48 与 C28 链接正常。
- Pages：[run 39040017175](https://github.com/socoo123/js_web/actions/runs/39040017175) build/deploy 成功；C28 和路线页均 HTTP 200，课程标题、timerRef/Effect 内容与 28/48 目录已上线。
- 未运行：屏幕阅读器朗读、DevTools 界面手动点击、Firefox、Safari、Windows。
