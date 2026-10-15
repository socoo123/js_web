# 当前进度与上下文恢复

恢复关键词：**JS_WEB_START**。最后更新：2026-10-15。

## 最新用户要求

- 会 Java，按有编程基础的前端初学者讲解，用中文。
- 从 JS 历史到当前规范、数据结构、异步、Node/npm/Yarn/Bun，补充 pnpm。
- React 要详细；讲 SAP UI5 与流行开源组件。
- 图使用 D2，比例不高，关键机制不能省。
- 静态网站，关联 GitHub，后续可以部署 Pages。
- 先规划，给关键词，方便清理上下文后继续。
- 每天学习 **3–4 小时**：4 周 48 课为主线，8 周为慢速/深化版。
- **不需要每个示例在站内完整运行**；需自己操作的内容明确标注「自己尝试」，给步骤与预期结果。
- 必须教前端 Debug 工具与 UT 框架，包括 DevTools、React DevTools、Node inspect、Vitest/RTL，解释 Jest/Playwright 的分工。

## P0 已完成的准备

- 确认本地目录最初为空、未初始化 Git。
- 确认 GitHub `socoo123/js_web` 最初为空；当前账号有仓库管理与推送权限。
- 初始化本地 `main`，关联 `origin = https://github.com/socoo123/js_web.git`，验证远端读取。
- 写入总计划、48 课大纲、架构、教学规范、Debug/UT 路线、官方来源。
- 写入 AGENTS.md 与项目规则，使关键词恢复依赖仓库文件。

计划文件会作为本轮初始提交同步远端。提交/同步的实际状态以 `git status -sb`、`git log -1` 和 `git ls-remote origin refs/heads/main` 为准，避免在文件里写入自引用的提交 hash。

## 尚未实施

- 未创建 Astro/Starlight 网站、课程正文或完整练习代码。
- 未安装依赖；本机查询未发现 D2 CLI。
- 未创建 Pages Actions；查询 Pages 配置时返回未配置。
- 尚未部署，`https://socoo123.github.io/js_web/` 只是未来目标地址。
- 来源中所列版本是核查状态，不是已安装/已运行的示例版本。

## 下一项任务：M1 网站基础与示范课

用户清理上下文后发送 JS_WEB_START 并要求开始时，执行下面步骤：

1. 先读本文件与 AGENTS.md；检查 Git 状态与已有文件，保留用户后续改动。
2. 读取 PLAN、CURRICULUM、ARCHITECTURE、CONTENT_GUIDE、DEBUG_TESTING、SOURCES；无需重做本轮规划。
3. 核查兼容的 Node 24 LTS、npm、Astro/Starlight/React 依赖，固定具体版本与根锁文件。
4. 建立静态站骨架，设置 GitHub 项目子路径 `/js_web/`。
5. 首页展示 4 周/8 周路线、课程目录、课程建设进度。
6. 写完整 C01/C02 示范课，遵循 Java 对照、自己尝试、验证状态、Debug 入门规范。
7. 固定 D2，创建生态关系首图，构建 SVG 并检查中文布局。
8. 构建并预览生产输出；验证首页、示范课、资源子路径与静态阅读。
9. 更新本文件，记录真正完成内容、验证结果与下一步 M2。

M1 交付网站骨架与示范课，不同时装入所有组件库。M6 才配置和部署 Pages；用户若明确提前要求预览部署，按新的范围推进并标注课程建设状态。

## 已定的教学与技术方向

- 同一“库存管理小应用”贯穿 JS、React、普通组件库、经典 UI5、UI5 React。
- 48 课分配：JS/Web C01–16，运行时/工程 C17–20，React C21–36，组件/UI5 C37–44，交付 C45–48。
- Debug 从第 1 周开始，第 2 周引入 UT，后续持续练习；不要求所有例子在线运行或写测试。
- Astro + Starlight + MD/MDX + 少量 React islands，Pagefind 搜索与 localStorage 进度。
- 主站工程统一 npm；其他包管理器在隔离练习目录比较。
- D2 源码构建为 SVG；普通语法优先代码/表格。
- 普通组件库主练习 Ant Design，其他方案做功能和模式比较。
- UI5 以 OpenUI5/JSONModel 与 UI5 Web Components 为可入门路线；V2 浏览器 mock 可静态演示；完整 V4/CAP 和真实 SAP 后端选修。

## 继续工作时的自检

- 不因关键词就假定跨项目具有隐式记忆；文件才是上下文来源。
- 不把规划勾选成实现，不把资料核对写成运行通过，不把未来 URL 写成已上线。
- 用户新的要求优先于本计划；在推进时同步相关文档。
- 结束一个阶段时留下可执行的下一步，而不是只写“继续完善”。
