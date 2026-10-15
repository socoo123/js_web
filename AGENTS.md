# 项目上下文与恢复入口

本文件适用于整个仓库。用户需要中文 JavaScript 学习静态网站，最终部署 GitHub Pages。

- 读者只会 Java，按有编程基础的前端初学者讲解；不可跳过 HTML/CSS/浏览器基础。
- 用户每天可投入 3–4 小时：4 周 24 个学习日、48 个微课为主线，8 周为慢速与深化版。
- 必须覆盖 JS 历史至当前标准、语言、数据结构、异步、Node/npm/Yarn/pnpm/Bun、详细 React、SAP UI5 及开源组件。
- Node/Bun 是运行时，npm/Yarn/pnpm 是包管理器，和语言数据结构分别解释。
- 教学以运行代码、预期输出、Java 对照与练习为主；关键机制图只用 D2，保留源码并构建为 SVG。
- 网站必须静态输出；技术方向为 Astro + Starlight + MD/MDX + 少量 React islands。
- GitHub 项目仓库为 `socoo123/js_web`；Pages 子路径是 `/js_web/`，不得假定部署在域名根目录。
- 网站工程统一 npm 与单一 package-lock.json；其他管理器在隔离示例中比较。
- 课程示例用 JS/JSX 主线；TypeScript 是短桥接与选修，不能让 TS 前置阻碍 JS 入门。
- 用户不要求所有示例在网站中完整运行；需亲手操作的内容标注「自己尝试」，给出环境、步骤和预期结果。
- 必须教前端调试工具和 UT：DevTools、React DevTools、Node inspect、Vitest/RTL，以及 Playwright 与 Jest 的定位。
- 示例分别标注操作方式（讲解/自己尝试）与验证状态（已验证/已核对/未验证）；未执行者不能声称已测试。
- 动态技术、版本与安装命令先核对官方来源；区分正式标准、Stage 4、未完成提案及实际环境支持。
- UI5 必须区分 SAPUI5、OpenUI5、UI5 Web Components、React 包装库；Pages 演示用静态数据或可在浏览器运行的 mock。
- 每次完成一个里程碑，更新 docs/STATUS.md，包括验证结果及下一项未完成工作。

## 关键词 JS_WEB_START

用户发送 `JS_WEB_START` 时，先读 `docs/STATUS.md`，再读其中指定的计划与架构文件。
检查 Git 状态和现有代码；从下一项未完成任务继续，不重做规划，不假定空仓库。
用户本轮只要求规划；下一次明确要求开始后执行 M1。遵循用户后续的范围修订。
