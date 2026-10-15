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

## 文章完成后的 GitHub 同步

用户已授权：每次生成文章后，完成必要验证、更新课程目录和 docs/STATUS.md，然后将本次文章、示例、D2 源码/SVG 及相关站点改动提交并推送到 `origin`（`socoo123/js_web`），无需再次请求提交或推送许可。

- 正常在 `main` 提交，使用明确的提交信息，例如 `docs: publish C02 Web foundations lesson`。
- 提交前检查 Git 状态与差异，只纳入本次工作；不混入用户无关改动、缓存、依赖目录或凭据。
- 运行 `npm run check` 和 `npm run build`；示例按实际执行结果标注，未执行者不能写已测试。
- 推送前检查远端新提交；有冲突时保留双方内容并处理，不使用强制推送覆盖远端。
- 推送后检查对应 Pages Actions；确认部署成功并核对新文章线上地址。失败时继续修复或明确报告具体阻塞，不能把失败写成已上线。
- 如果用户当次明确要求仅本地草稿或暂不发布，以该次要求为准。

## 关键词 JS_WEB_START

用户发送 `JS_WEB_START` 时，先读 `docs/STATUS.md`，再读其中指定的计划与架构文件。
检查 Git 状态和现有代码；从下一项未完成任务继续，不重做规划，不假定空仓库。
按 docs/STATUS.md 中的最新进度和用户当次范围继续；规划、课程写作与提前部署均已有后续范围修订，不把旧的“仅规划”要求当成当前限制。
