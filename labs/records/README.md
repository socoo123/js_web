# V2 实际验证记录

本次续作：[R5 · C01–C20 连续迁移](R5.md)，发行版2026.10-v2.2；[Pages 40713752220](https://github.com/socoo123/js_web/actions/runs/40713752220)与线上课程/下载/恢复核验通过。下面保留R1–R4的历史证据。

发行版：2026.10-v2.1。2026-10-28 · macOS arm64 · Node 24.22.0 / npm 11.19.1 / Java 21.0.2 / Chromium 156.0.8078.4。旧 examples 通过不代表新工作区通过。

| 任务 | 实际执行范围 | 结果 |
| --- | --- | --- |
| R1 | 单一练习锁安装 React/Query/AntD/UI5/测试工具；C00 360px 卡片；npm ci；start 不覆盖 | 初次 install 642 包约 3 分钟；ci 643 包 9.51 秒（已缓存）；node_modules 516 MB；显示 P001/12，无溢出/脚本错误 |
| R2 | C00→C03 重建、实际文件检查、新目录恢复、含作业目录拒绝 | 契约检查通过；改为 `stock || 12` 确实失败；非空恢复拒绝后作业原文保留；正常启动不导入参考解 |
| R3 | 静态 CodeCompare/CodeExcerpt/LessonTask、受控区域与 MDX AST、快照下载、原 F1 | 7 条契约/门禁测试；3 个完整 Java 源文件运行通过；超过块数/行数、缺来源/区域、表达式与隐藏代码均被拦截；F1 全浏览器回归通过 |
| R4 | C03、C23、C41 从真实起点按正文区域组装，修改实际文件制造错误，再修复 | `npm run test:lab-walkthrough` 全流程通过；不是把完成快照直接跑绿；详见下表 |

## 三课的实际链条

| 课 | 起点与起点预期失败 | 触发与证据 | 修复及完成检查 |
| --- | --- | --- | --- |
| C03 | C02；尚无 parseStock，check 会指出缺少入口 | 起点页面补 3 得 123；完成代码改成 `stock || 12` 后，实际检查打印“初始库存 0，期望 0，实际 12” | 按正文 parser/restock 区域组装，12+3=15；空白/3件/负数/小数不保存；浏览器与工作文件检查通过 |
| C23 | P22 明确前置：六商品静态 React 列表与共享规则；缺 StockActions 的检查失败 | 三次直接替换得到 13；延迟回调捕获旧值，插入立即 +1 后最终 15；同样实际文件让行为测试失败 | 按 setup/queue/delay/controls/App 区域组装；连续补货 15，交错补货 16；真实页面与 3 条 React 行为测试通过（含混合队列→2） |
| C41 | P40 明确前置：Component/JSONModel/i18n/共享桥；缺编辑 Fragment 的检查失败 | Sources 对应的真实 context 为 `/products/3`、P004；实际写死 `/products/0` 后，检查失败“P001 不变，8 !== 12” | 按 View/Controller/Fragment 区域组装；取消保留 3，空白拒绝，保存 P004=8/P001=12，tags 保留、可见汇总与中英切换通过 |

C23/P22→P23 与 C41/P40→P41 是 R4 的前置试做，不代表 C04–C22/C40 已连续迁移。R6/R7 必须接回正式相邻快照并重新验收。

## 构建、恢复和视觉

- 快照发行包由独立 C00 教师模板与课间变更重建，不从可变的学员业务文件生成；包含练习锁，不含 node_modules、dist、.lab、教师答案目录。`public/downloads/inventory/2026.10-v2.1/manifest.json` 含包与逐文件 SHA-256；tar/gzip 的时间、所有者与顺序固定。
- OpenUI5 的 ESM→IIFE→sap.ui.define 桥实际构建；stock、金额、草稿向量两端一致，固定统计与业务边界读取当前源码。UI5 adapter 的 package.json 只供 CLI 识别，无独立安装或锁文件。
- UI5 CLI 生产构建通过；严格静态 `http://127.0.0.1:8875/js_web/demos/inventory/index.html` 完整编辑/语言场景通过，含资源状态检查。首次缺 sap-ui-version.json 的 404 已通过 generateVersionInfo 修复。这里只验证本地产物，没有宣称 UI5 demo 已部署。
- 根目录 lint 48 课零 error，check 零诊断，旧固定输出 303/303、F1 数据测试 15/15、静态 build 61 页通过。保留全部旧课 URL、旧示例目录和 14 张 D2 源码/SVG。
- 61 页 × 360/768/1280px × 亮暗 = 366 组无整页溢出；三课桌面两栏、手机/平板单栏；两侧键盘复制与拒绝剪贴板提示、代码聚焦滚动、原生折叠答案、三个关键词搜索、D2 加载与 61 页禁用 JS 阅读通过。代表截图已目视检查，缓存位于 `.cache/qa/v2/`。
- 旧 F1 标记/撤销、刷新、48 课状态、导入导出/合并、坏文件拒绝、备份/损坏恢复、跨标签、存储拒绝/写满及禁用 JS 回归通过；进度键与完成语义不变。
- 安装数值仅描述本机本次网络/缓存。UI5 框架资源首次启动另行下载；Windows、其他浏览器、真机与屏幕阅读器未执行。

## 发布

提交 `11259e9`；[Pages run 40684581291](https://github.com/socoo123/js_web/actions/runs/40684581291) build/deploy 成功。线上 C03/C23/C41 与 Lab 入口 HTTP 200，8 个快照双格式下载及 SHA-256 全部通过。实际发布字节冻结于 labs/releases/2026.10-v2.1；后续 R5 使用新发行版，不覆盖旧包。

本机线上核验使用 npm 已配置的可信 CA 文件（NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem），保持 TLS 验证。R5 续作与当前范围见上方记录，后续为 R6 React 正式连续迁移。
