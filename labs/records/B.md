# B · 组件库与 UI5 连续主线（成功）

2026-10-29。范围仅 C37–C44 / L4；发行版 `2026.10-v2.4` 已冻结发布。四路交付及返修、主独立教学验收、批次门禁、Pages部署与线上核验全部通过。阶段 B 成功；下一阶段为 C，由用户在新窗口启动。

## 当前进度快照

| 项目 | 已落盘成果 / 当前结果 |
| --- | --- |
| 八课正文 | `src/content/docs/06-components-ui5/` 的 C37–C44 已集成；七课由 `.md` 转为 `.mdx`，原 URL 保留；C41 已接正式 C40 起点 |
| Lab 与代码 | `src/content/docs/labs/l4.mdx`、`labs/reference/steps/C37/` 至 `C44/`、四个 adapter 和检查器已集成；逐课验证见 `examples/c37/README.md` 至 `examples/c44/README.md` |
| 四路交付 | 四个子 agent 及全部返修已结束；范围、sessionID 和结果见下表 |
| 主验收 | 公开 C40 起点→C41–C44 独立跟做、根 `check` / `build`、8快照回归、10页60组视觉、发行契约与冻结源码核对通过 |
| 阶段结论 | B 成功；八课、L4、四个 adapter 与发行包已发布，下一阶段 C 尚未开始 |
| Git / 线上 | 内容提交 `195c4d6` 已推送main；[Pages 40892019506](https://github.com/socoo123/js_web/actions/runs/40892019506) build/deploy成功；14个页面、4份清单、234包SHA及D2/搜索资源通过 |

四路及全部返修已结束，主 agent 已完成集成、独立验收与发布核验。本窗口止于 B；记录提交触发的部署结果在最终回复给出。

## 基线与四路

- `main` 基线 `7337e90`，工作区干净；阶段 A 内容 `89795e4` 和已冻结包保留。已检查远端，无新增提交。
- 启动前核验 `openai/gpt-6.1-sol` 为 active 且包含 `max`。四路连续后台启动，均为 `general` / `openai/gpt-6.1-sol#max` / `background: true`；禁止下级委派、提交或推送。
- 隔离根：`/private/var/folders/5k/y6qh6sfd2g30js0v0qrv4mfr0000gn/T/opencode/js-web-B-20261029/`。每份副本含基线 1730 文件；`baseline-hashes.json` 保存原始摘要，`dispatch.md` 定义归属、接口、端口与验收向量。
- C36 业务接口不变：公共 core、repository 单一可写数据源；四 adapter 并列，P004 取消保持 3/52、保存 8 得 57、P001 保持 12、空白/负数拒绝且 0 合法。React 主应用保留。

| 路 | 范围 | sessionID | 状态 |
| --- | --- | --- | --- |
| 1 | C37–C38 / Ant Design | `ses_e7857eb2bffeaZWl6fzhxMVqxm` | 真实 C36→C38、最终 C44 的 AntD 8 场景及 React 10 场景通过；已结束 |
| 2 | C39–C42 / OpenUI5 | `ses_e78578bddffecWqj8x7PaSwQqj` | 真实 C38→C42、最终 C44、Model/四组故障/静态与完整 walkthrough 通过；已结束 |
| 3 | C43 / 原生 Web Components | `ses_e785740ebffeDpPUQZeqnw5Y2H` | 真实 C42→C43 与最终 C44 均通过 85 条、开发 5/5、静态 5/5；已结束 |
| 4 | C44 / UI5 React、L4 | `ses_e7856ffe6ffe3m7DACHY5NIC6O` | 真实 C43→C44 两文件增量、85 条/repository/开发 6/6/静态 6/6 通过；已结束 |

共享 catalog、片段注册表、工具接线、来源、状态和发行产物由主 agent 集成。四路首稿、返修与真实接续补验全部结束；各路原始报告见隔离根 `agent-N/delivery/integrated-report.md`。独立教学验收如下，四路局部夹具结果不计作真实连续主线通过。

## 基线核验

- A 最终 [Pages 40816336569](https://github.com/socoo123/js_web/actions/runs/40816336569) 的 build/deploy 均成功，对应完整提交 `7337e90699219f95cfb5c18ef28328a828515da8`。
- 已核对线上 `2026.10-v2.3/C36.tar.gz`：HTTP 200，SHA-256 `3ad77ed6bb27081c85f8a2f3cc477a19c3cc6dcf0dab0e7f1d0e83ec6140e2ca` 与冻结包一致；保留 148 个历史发行文件摘要与八课旧锚点清单。
- 从冻结 C36 解包到独立目录，用 Node 24.22.0 / npm 11.19.1 执行 `npm ci`：737 包、7 秒、本机缓存环境。随后 `npm run lab -- check C36` 通过：85 条工作文件检查、10 组隔离浏览器场景、组件/请求/Action/RTL 与严格静态 E2E；这是接管基线，阶段 B 最终验收另记。日志为隔离根 `baseline-C36-install.log`、`baseline-C36-check.log`。

## 首轮审阅与返修

- 四路首稿均已交付。主审发现各路原 prelude 只提议放入 C36/C43 参考快照，正常持续修改源码的读者不会自动取得它。已统一改为新版 C00 的机械外壳，并镜像到仓库 C00 工作区；核心连接点保持占位，课程答案仍只在各课 steps。旧 A 用户通过新目录保留工具/锁/外壳并迁入自己的源码，不覆盖旧作业。
- C44 首稿的检查只排除 HTTP 错误，未限制实际字体来自同源静态子路径。主审重新核对官方 Fonts 文档，并要求默认 CDN 路径先失败、关闭默认加载和打包本地字体后通过；不以资源 HTTP 200 代替自包含验证。
- C43 首轮 Astro check 曾写入共享依赖软链中的 `.vite/.astro` 生成缓存，未改依赖源码或锁；子 agent 如实记录后停止该用法，未删除共享缓存。最终站点门禁由主 agent 重建并核验，局部夹具均不进入发行包。

## 集成候选

- 四路本轮返修全部交回后，按各自 manifest 集成 149 项归属文件操作；共享 catalog/片段/对照注册表、check 分发由主 agent 合并。记录在隔离根 `integrated-files.json`；C36 step、既有 React/core/repository 和锁未改。
- 新版 C00 自带四个按课启用的机械外壳，仓库工作区镜像一致；集成预览时八课 implemented=true、migrated=false，独立教学验收后 migrated 已改为 true，C41 trial 已清空。阶段 A 升级说明补充迁入自己的 tests/vite.config.js、逐项合并 package scripts，保留旧目录。
- 候选 `build:labs` 生成 C00–C44 共 45 个连续快照；lint 48 课零 error/warning。预览 Astro 构建成功，八课原 177 个 H2/H3 锚点在实际 HTML 全部保留。这里是集成预览，不是最终批次发布门禁。
- 主提供各路真实前置 C36/C38/C42/C43 以及最终 C44 的独立副本，复用四个原 session 做接续补验。主读者副本则从预览公开下载入口取得 C40 包并核对 SHA，已独立 npm ci；未用教师终态替代跟做。

## 真实接续与主独立教学验收

- 四路接续只应用各自正式增量，没有额外补外壳或改 core/锁。B1 的29个 src 文件保持 C36 原字节；B2 的37个运行输入与最终 C44 相同；B3 的26个运行输入相同；B4 的138个工作文件与最终 C44 相同。各路在最终副本实际运行对应行为，哈希复核不替代运行。
- B2 在隔离完整仓库运行 C03/C23/C41 walkthrough：C03 合法0与错误默认值、C23 正式C22起点的15/16、C41 正式C40起点的路径故障均先红后绿。仅调整测试副本端口避冲突，端口归一后脚本SHA相同。这是自动组装回归。
- 主 agent 从 `http://127.0.0.1:18200/js_web/` 的公开候选入口下载 C40，SHA-256 为 `fd61ba8e4c61199be1d799c00e53041bd1dbf0c09893a9c24055259410044dba`，在 `reader-C40/` 独立 `npm ci`。最终迁移元数据会改变正式包摘要。
- 逐页读取实际 HTML 去除全部 details 后的公开正文与代码；期间未读教师 steps、折叠答案或自动组装脚本。手工完成后保留 `reader-snapshots/C41` 至 `C44`，才对照参考实现。18个课间文件中16个仅区域注释/行首空白不同，两个 XML 另有开始标签换行；业务代码一致。

| 课 | 只按公开正文修改 | 实际检查与错误证据 |
| --- | --- | --- |
| C41 | 替换 View/Controller，新增编辑 Fragment，共3文件 | 86条与共同场景通过；CDP Sources断点观察 `/products/3` / P004；写死0后首项变P0048、原P004仍3，恢复后P00112/P0048/总57 |
| C42 | manifest/Component/列表接线，新增容器/详情/metadata/probe，共10文件 | 86条、刷新/返回/前后退/未知id、有限V2及严格静态通过；路由故障断点观察可见索引0与真实P004，恢复后hash为P004且刷新库存3 |
| C43 | 原生外壳内 HTML 配置/小表单、组件加载与editor，共3文件 | 85条、开发5/5；disabled字符串故障确实失败“expected enabled / received disabled”，恢复后严格静态5/5；同源字体、翻译/主题、0与取消/保存通过 |
| C44 | 新写 App 与 ProductEditor，共2文件 | 85条/repository、开发6/6；外层form错换Form后保存不关闭、确认不发生，恢复后生产6/6；鼠标/输入Enter/按钮Enter均一次确认，0/非法/字段保留与资源通过 |

- 主读者抽验未发现缺少导入、拼接、配置或调用步骤。C41/C42的断点由CDP操作；C43文中的DevTools人工点选仍保持未验证标注。未将这四课抽验扩大成全部八课独立跟做；C37–C40另做增量可读性审阅与真实快照回归。
- 日志与断点证据在隔离根 `reader-Cnn-*`、`reader-reference-comparison.json`。测试定位器最初两次未包含UI5合成可访问名称/标点，另一次未等待hash导航；只修主验收脚本，课程源码未因此变更。恢复故障后源码保持原正确实现。
- 环境：macOS arm64、Node24.22.0/npm11.19.1、OpenUI51.153.0、UI5 Web Components2.27.2、Chromium156.0.8078.4。未执行Firefox/Safari/Windows/真机/屏幕阅读器或真实SAP服务。

## 最终门禁与发布

八课 implemented/migrated 均为 true，trial 为空；主独立验收已通过。最终门禁与实际发布证据如下；C45–C48的改版实现/迁移标记仍为false。

- 第一轮根8快照回归C37–C43通过，C44因隔离node_modules软链的字体realpath落在Vite许可外而403；正常安装与生产已通过。B4原session复现后只给开发检查器增加实际依赖目录realpath许可，未扩大父目录、未改学员CLI/业务或资源断言；软链开发6/6/生产6/6通过，单文件补丁已集成，返修结束。见 `agent-4/delivery/followup-symlink-report.md`。
- 根check发现C41退出最后一个trial后JSON推断trial为null，旧展示分支产生3条never属性诊断；主删去已无数据使用的试做展示分支，任务卡统一正式起止字段。修正后33文件零诊断；任务卡实际DOM保持正式链原样。
- `npm run check`：33 文件，0 errors / 0 warnings / 0 hints；原始日志 `final-astro-check-fixed.log`。
- `npm run build`：已完成并通过，原始日志 `final-build.log`。内含 Lab/源码门禁9项、22个Java完整源文件、48课lint零error/warning、固定输出示例307/307、学习进度数据测试15/15；生成61页，生产输出的中文、`/js_web/`链接/资源、搜索入口、四张速查导航及课程折叠区/D2检查通过。这里的产物检查不代替浏览器视觉验收。
- 新版真实C00默认页检查通过：P001/12、6种/52库存、未来课程功能尚未接通、360px无溢出；见 `final-c00.log`。29个机械外壳文件与工作区镜像逐字节一致。日志所列根 `.lab/c43-fixture-Unixus` 检查副本已原样移至隔离根 `c00-default-page-fixture/` 保存，不进入Git或发行包。
- 上述原始日志均在「基线与四路」列出的隔离根；本记录保存关键结果，日志未作为发行内容。首次8快照失败日志 `final-ui5-snapshots.log` 保留，不能据此声明修复后的整批通过。
- 最终视觉：八课及Lab首页/L4共10页，360/768/1280px × 亮暗共60组，无整页溢出；任务卡、双栏布局、图片/alt与无JS阅读通过。共用控件的键盘复制/拒绝提示、答案与三词搜索通过；另逐页执行八课任务命令复制、所有双栏键盘复制、答案展开/收起，全部通过。主查看C38窄屏亮色、C40桌面暗色、C44窄屏暗色、L4桌面亮色代表截图，正文/导航/任务区可读。证据为 `final-visual.log`、`final-B-interactions.json` 及 `.cache/qa/v2/site-review/`；未扩大为本批全站/F1浏览器复检。
- 发行契约：`check-release.mjs` 通过，148个历史文件原字节保留，45个快照/90候选包SHA正确；C36 React/services/core源码在C36–C44保留，start/compare只读、非空恢复拒绝且原文件保留、恢复文件精确一致。证据 `release-contract-result.json`。
- 修复后整批 `npm run test:lab-ui5` 已通过：C37–C44全部8个真实连续快照，C38/C40/C42/C43/C44的严格静态检查通过；C44开发与生产均6/6，本地字体实际请求成功。日志 `final-ui5-snapshots-fixed.log`，首次失败日志保留用于追溯。
- 发行冻结：`labs/releases/2026.10-v2.4/` 保存C00–C44共90包和manifest；随后 `npm run build:labs` 通过冻结源码摘要校验，未改写历史发行字节。线上发布另按下节核验。

## 发布

- 内容提交：[`195c4d6637c65ad80ee9b9edcc44b972ca8d362d`](https://github.com/socoo123/js_web/commit/195c4d6637c65ad80ee9b9edcc44b972ca8d362d)，已正常推送main。提交前审阅本批diff、未跟踪文件及远端；锁/C36/历史发行无改动，测试副本保存在隔离根。
- [Pages 40892019506](https://github.com/socoo123/js_web/actions/runs/40892019506)：build/deploy均成功，完成于2026-10-29 14:40:46 UTC。CI中的真实起点跟做、React连续快照、UI5连续快照、根检查与静态构建均通过。
- 线上核验完成于2026-10-29 14:42:32 UTC：C37–C44八课任务卡与v2.4正式起点正确，Lab首页及L1–L5共6入口返回200；4份manifest与仓库冻结字节一致；234个下载包逐包SHA-256一致（v2.1/2/3/4分别16/50/78/90包）；C39 D2 SVG与Pagefind资源返回200。命令为 `NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem node <隔离根>/verify-online.mjs`，结果保存于 `online-result.json`。
- 线上入口：[C37](https://socoo123.github.io/js_web/06-components-ui5/c37-component-ecosystem-selection/)、[C44](https://socoo123.github.io/js_web/06-components-ui5/c44-ui5-react/)、[L4](https://socoo123.github.io/js_web/labs/l4/)、[v2.4 manifest](https://socoo123.github.io/js_web/downloads/inventory/2026.10-v2.4/manifest.json)。Lab页面与学习包已发布，adapter应用的严格静态运行证据来自本地验收。
- 发布记录回写本文件、STATUS、Lab设计与发行索引；仅维护文档变更，按PLAN §6检查差异/引用，不重复本地全量测试。记录提交的Pages仍须等待，结果在最终回复给出，不循环追加自身SHA/run。

## 下一步

用户清理上下文并新开窗口后，用 `JS_WEB_START` 启动阶段 C：C45–C48 / L5、导航下载、C15定点修正及最终验收。按PLAN §7核验模型并同时启动新的四路 `general` / `openai/gpt-6.1-sol#max`；保留本批发布成果、冻结历史与现有Git工作。C成功后本轮结束，下一阶段为“无”。
