# A · React 连续主线（执行中，未发布）

2026-10-29。范围 C21–C36 / L3；发行候选 `2026.10-v2.3`。独立教学验收已通过，最终发行门禁与发布记录见下文。

## 基线与四路

- 主仓库 main 基线：`93f81d29fef57e4bd86da38cc8f740e12b14775e`。
- 接管全部既有未提交规划文档、C21–C31 steps、catalog、练习/C00 package 与锁、React CLI/检查器；未重置或删除继承工作。
- 四个隔离副本包含未提交成果；启动前核验 `openai/gpt-6.1-sol#max` 可用。四路均为 `general` / `background: true`，没有下级委派。各自只拥有指定课程与专用文件，共享元数据由主 agent 集成。
- 隔离副本、交稿与原始日志根目录：`/private/var/folders/5k/y6qh6sfd2g30js0v0qrv4mfr0000gn/T/opencode/js-web-A-20261029/`，分工在 `dispatch.md`；`agent-1` 至 `agent-4` 为各路副本。集成仅取归属文件，未带入夹具、缓存或依赖。

| 路 | 范围 | sessionID | 状态 |
| --- | --- | --- | --- |
| 1 | C21–C24 | `ses_e7aca863cffeBn35x0zQFCqxeD` | 最终完整检查通过：85/85/86/85工作文件检查、组件2/5/8/10、浏览器1/1/3/4；本路任务已结束 |
| 2 | C25–C28 | `ses_e7aca2e67ffedsTxVjktC2xFRh` | 最终完整检查通过：每课85条core，专项18/22/35/41、专项浏览器及共享3组；本路任务已结束 |
| 3 | C29–C32 | `ses_e7ac9d96fffe6St6wzVFNK0Mbd` | 最新预检、28个H3及重试文案已集成；最终每课85条core、专项7/12/15/11、各5组共享浏览器与专用浏览器/lint通过；本路任务已结束 |
| 4 | C33–C36、L3、共享 React 检查接线 | `ses_e7ac9781bffeIJJ4Lg93Baij64` | 真实接续及33文件、41个H3已集成；连续Vite缓存追加返修完成，主读者C32完整复验通过；本路已结束 |

C24 约定集合 state 与 id 更新；C28 交接 reducer/Provider、局部草稿与 ref 句柄；C32 交接 repository 单一可写数据源、Query 缓存及 Promise dispatch。后段的临时夹具不作为真实集成证据。

四路及全部返修均已结束，无活跃子任务。主 agent 在集成工作区运行 `npm run test:lab-react`，C21–C36全部16个实际快照通过（`final-react-snapshots.log`），包含C35/C36严格静态E2E。A4的过时同步表单断言只在Action段排除，Effect/2000ms、Query和真实表单行为保留；C29–31的全量保存溢出专项已接入checker。独立跟做发现的连续升级Vite缓存故障也已复用A4原会话修复，见下文。

主审定点修复：合法安全整数单价仍可能使全量总价值溢出。C27/28 原先在 React 调度的 reducer 内抛错，真实浏览器 main/form 被卸载；现于 dispatch 前只读预检候选，让表单捕获错误、保留草稿与 52/2634800，修正后可重试。编辑/新建各由失败转通过，C29–31 正接回同一边界；C32 仓库提交校验与事件捕错仍沿用。

## 共享资产审阅

- 继承锁新增 react-router、ESLint/React Hooks lint 共 92 个包，原已存在包除根清单外未变；全部 resolved 指向 npm 官方 registry；C00 与工作区锁一致。安装及行为结果另记。
- 独立空目录用继承清单/锁执行 `npm ci` 成功：737 包、7 秒、依赖约 586 MB（本机缓存环境）。没有更改四路共享的已安装依赖目录。
- C03 错误字段确实在 `||` 处截断并错列；已恢复 trigger/evidence/repair/risk，并转义错误矩阵 Markdown 表格中的管道符。仓库没有从错误矩阵重生成 catalog 的脚本；catalog 为权威来源，build 只生成 tools 副本。增加缺字段及 C03 列语义回归，结果如下。
- `node --test --test-name-pattern='48 个|C03 的逻辑或' tests/labs.test.mjs`：2/2 通过。
- 继承基线 `npm run check`：32 文件，0 errors / 0 warnings / 0 hints；集成后同一检查结果见下文。
- `LAB_NATIVE_CHECK_PORT=18062 node scripts/verify-l1-walkthrough.mjs`：C00→C20 自动组装与实际源码故障红绿通过，固定数据、自有 notes、非覆盖行为保留。这是受影响前置回归，不记为本次独立读者抽验。原生检查新增可选端口，避免与并行 React 检查争用默认端口；默认行为不变。
- 69 个已冻结历史文件与接管基线 SHA 一致。
- A1–A3 集成阶段：`npm run lint:lessons` 48 课零 error/warning；`npm run check` 32 文件零 error/warning/hint。C33–C36 尚未集成，以上不是最终批次门禁。
- 中间 `npm run build` 通过：9 项 Lab/内容契约、22 个 Java 对照、303 个固定输出、15 项进度数据测试、14 张 D2、61 页产物；记录在隔离根 `intermediate-build.log`。
- `LAB_NATIVE_CHECK_PORT=18062 npm run test:lab-walkthrough` 通过：C00→C20 自动组装/错误红绿，以及 C03、正式 C22→C23、C41 试做的实际工作文件回归。C23 错误版分别得到 13、15，修复后为 15、16；`pre-final-walkthrough.log` 保存证据。这是前置自动回归，独立读者验收另记。
- A4 真实 C32 的66个文件哈希一致；C25–C36的12快照完整检查、9项必要故障及真实重试按钮故障红→绿、C33–36公开围栏作者组装通过。按33文件manifest集成，69份上游镜像未复制；其中A2旧计数不替代最新溢出修复结果。证据在 `agent-4/delivery/evidence/final-*`。
- 主审 C33–36 的公开改动位置、Action错误传播、Profiler/lazy/边界、RTL与严格静态步骤、真实存储故障插入行；catalog实现与任务文件表已对齐，迁移标记待主验收。L3补充旧发行版升级入口。
- 四路集成构建通过（`integrated-build.log`），Astro check 32文件零诊断。随后最新预检增量与锚点已重建公开候选包/页面；主审实际HTML中的C21–C36全部322个旧H2/H3目标均存在（`legacy-anchors-36.json`）。
- 主流程 `npm run check` 32文件零诊断、`npm run lint:lessons` 48课零error/warning（`final-astro-check.log`、`final-lesson-lint.log`）。原发行69文件保留，Git远端检查与main无分叉；冻结/发布前仍复核最终差异。

## 主 agent 独立教学验收

主 agent 从本地公开下载入口取得 `2026.10-v2.3` 候选起点，核对SHA，读取构建页面排除全部details后的正文与代码。期间未读教师steps、折叠答案或自动组装脚本；逐课源码另存 `reader-produced-Cnn.json`，跟做结束后才对照。起点明细在 `reader-starts.json`，最终元数据/工具修正会改变正式包摘要。

| 课 / 起点 | 只按正文完成的改动 | 实际结果 |
| --- | --- | --- |
| C23 / 公开C22 | 新增StockActions、App接入；连续updater与延迟补货 | 完整check通过；15/16；替换值更新使回归失败，恢复后3项通过 |
| C30 / 公开C29 | 新增product-api/ProductDetail、App选中详情与失败入口 | 完整check通过；去掉成功守卫和延时signal，慢旧请求覆盖导致失败；恢复后通过 |
| C31 / 上述C30 | 新增请求Hook，重写详情，Provider快照Hook、App路由与URL筛选，共5文件 | 完整check通过；删productId依赖时Hooks lint及请求回归失败，恢复均通过；P004 hash刷新与严格静态路径通过 |
| C32 / 上述C31 | 新增repository/query-options，替换Provider/详情，App异步事件及await导入导出，删除旧Hook/reducer/API | 完整check通过：85条core、11条组件、专用浏览器/严格静态、共享5组及lint；漏id导致P002读成P001，两条回归失败，恢复后8/8通过 |

- C22起点tar SHA：`4ce99924d3bd447cec3b9f2bc55639f5cff799437393fa039563a6536e736b2c`；C29：`a6a2d28968db20f7b0f912e8216f11d9533ceefafe92a4b12241b29256e4594a`。
- C31首次使用依赖软链时共享浏览器报Invalid hook call。保留旧缓存并改为按正文真实`npm ci`后，同源码完整通过（`reader-C31-direct-check.log`）。
- C32在真实安装、保留C31缓存时触发Query新依赖优化后的Invalid hook call/useEffect null（`reader-C32-check.log`）。A4确认renderer和Query引用两代React chunk，模块/useEffect/内部对象身份均不同；显式预打包实际运行入口后，同一旧缓存完整检查红1→绿0。固定配置的C31→C32不清缓存、优化元数据逐字节一致，C36及8个前置检查也通过；证据见 `agent-4/delivery/vite-cache-followup.md`。
- 主 agent 仅在读者副本的新隔离复制品应用3行工具补丁，27个C32业务源码与独立完成时字节一致；`npm run lab -- check C32` 完整通过（`reader-C32-final-check.log`）。原读者副本、原错误日志与缓存保留；未靠忽略错误、重试或覆盖业务源码通过。
- 完成后对照参考终态（`reader-reference-comparison.json`）：四课源码文件集合一致（21/27/28/27）；C23语法树相同，C30–C32仅导入顺序、独立useState声明顺序与格式/区域注释不同，人工确认不影响行为。未发现缺失的导入/连接/删除步骤；主审已修正C30持续勾选模拟失败时重试仍失败的说明。
- 完整日志、四课故障红绿均在隔离根 `reader-Cnn-*`。独立抽验范围仅这四课；其余课程为增量审阅、作者组装及实际快照回归。
- 主 F1 浏览器回归通过（`final-f1.log`）：标记/撤销、跨标签、导入导出、损坏恢复、权限/写满与无JS。

## 最终发行门禁

- 集成缓存修复后，主 agent 再跑 `npm run test:lab-react`：16个实际快照全部通过，包含C35/C36严格静态E2E（`release-react-snapshots.log`）。
- 最终 `npm run build` 通过：9项Lab/内容契约、22张双栏及65片段/Java执行、48课lint零error/warning、303固定输出、15进度数据测试、14张D2、61页与子路径资源检查；`npm run check` 32文件零诊断（`release-build.log`、`release-astro-check.log`）。
- C21–C36的implemented/migrated均为true、trial为空；生成catalog、路线与公开包已同步。C41继续保留试做入口，B/C范围未提前标完成。
- `2026.10-v2.3` 已冻结39个快照（C00–C36、P40/P41），双格式78包与manifest共79文件。冻结后 `npm run build:labs` 重新核对逐源码摘要通过；历史69文件原字节不变，三个发行版144个冻结包/公开副本SHA一致（`release-frozen-check.log`、`release-frozen-rebuild.log`）。
- 最终视觉：61页×360/768/1280px×亮暗=366组，无整页横向溢出；两侧键盘复制/剪贴板拒绝提示、代码聚焦、原生答案、三词搜索、D2加载与61页无JS阅读通过（`release-visual.log`）。目视C26/C35窄屏、C32/L3桌面、C23桌面双栏与768px单栏截图，中文、换行、对比度和任务卡正常；截图在 `.cache/qa/v2/site-review/`。F1结果见上文，呈现行为未再变更。

## 发布

未提交、未部署。下一阶段仍须在本阶段验收与 Pages 核验后决定。
