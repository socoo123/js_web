# 当前进度与上下文恢复

恢复关键词：**JS_WEB_START**。最后更新：2026-10-15。

## 最新用户要求

- 最新要求：**使用三个子 agent，并行生成接下来的 C03、C04、C05，完成后提交 GitHub。** 三个子 agent 各负责一课及示例，主 agent 统一审阅、验证、更新目录与进度，再提交推送并检查 Pages。此次授权取代此前暂不启动多 agent 的要求。
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
- 通过 48 课号连续性、24 天每日两课、Markdown 本地链接与 Git 空白检查；独立审阅确认 React/UI5 关键边界。

P0 计划文件已纳入此前 Git 提交。远端同步的实际状态以 `git status -sb`、`git log -1` 和 `git ls-remote origin refs/heads/main` 为准，避免在文件里写入自引用的提交 hash。C01 与网站基础已一并提交和推送，具体 Pages 结果见下节。

## C01 已完成：文章、练习与生态图

- 正文：[C01 JavaScript 的故事与生态地图](../src/content/docs/01-history-web/c01-story-ecosystem.md)。包含目标与时间、历史转折、Java 对照、语言/引擎/宿主/包管理/界面库、Web 基础起点、旧代码背景、标准与提案边界、错误定位、必做练习和折叠答案。
- 练习：[examples/c01/README.md](../examples/c01/README.md)，无第三方依赖。浏览器 Console 为必做，Node 与 Java 为选做对照；代码块与示例文件已逐一核对一致。
- 首图：[D2 源码](../diagrams/c01-ecosystem.d2) → [SVG](../src/assets/diagrams/c01-ecosystem.svg)。固定 D2 0.9.0、Dagre 与 Noto Sans SC 字体提交及 SHA-256；保留字体许可，并在 SVG 内嵌所需字形与许可。重建见 [图说明](../diagrams/README.md)。
- 实际验证（2026-10-15）：Chrome 155.0.8059.40 的独立 headless 页面、Node 23.11.0、JDK 21.0.2；库存计算、环境探针、同步回调、CommonJS 加载、预期 ReferenceError、练习答案及售出为 0 的变体均符合预期。
- 图编译和中文渲染已检查；独立静态 Markdown 预览检查了 360px 正文宽度、图像加载、5 个答案/提示折叠区。预览使用临时阅读样式，不能替代未来 Starlight 主题与 Astro 生产构建验收。
- 重新核对官方历史、ECMAScript 2026 与 TC39 状态；实际验证环境与 Node 24 LTS 的后续工程计划分开记录，未把资料核对或作者机器版本当成网站依赖安装。

## 网站基础与提前 Pages 部署

当前：**已提交推送，并成功部署 GitHub Pages（2026-10-15）。** [首页](https://socoo123.github.io/js_web/) · [C01](https://socoo123.github.io/js_web/01-history-web/c01-story-ecosystem/) · [学习路线](https://socoo123.github.io/js_web/roadmap/)。

- 固定 Node **24.22.0 LTS**、npm **11.19.1**、Astro **7.3.8**、Starlight **0.42.6**；直接依赖固定具体版本，根级唯一 `package-lock.json`。React islands 尚无实际需求，未预装 React。
- 已创建静态网站配置、中文根语言、首页、4 周/8 周路线、48 课目录、自动课程导航、代码高亮/复制、原生练习折叠区、Pagefind 搜索。目录在构建时从大纲和已存在正文生成，提前建站时为 **1 / 48** 课；C02 发布后为 **2 / 48**，未写课程显示「待发布」。
- `npm run setup:diagrams` 按固定摘要准备 D2/字体；`npm run build` 串行同步目录、编译 D2、生成静态 HTML/搜索索引并检查 `/js_web/` 内部链接与资源。工具保存在忽略目录，未全局安装。
- 工作流：[deploy.yml](../.github/workflows/deploy.yml)，推送 `main` 自动构建并部署；部署目标为 `https://socoo123.github.io/js_web/`。固定 Actions commit，构建只读、部署取得 Pages/OIDC 权限。
- 已把“文章完成后验证 → 更新目录/进度 → 提交并推送 → 核查 Pages”写入 [AGENTS.md](../AGENTS.md) 和项目规则；维护步骤见 [DEPLOYMENT](DEPLOYMENT.md)。用户明确要求仅本地草稿时按当次范围处理。
- 本地实际验证（2026-10-15）：固定 Node/npm 下 `npm ci`、D2 准备/编译、`npm run check`（0 errors/0 warnings）、`npm run build` 与生产输出检查通过。构建生成首页、路线页、C01 与 404；Starlight 自定义 404 与内部通配路由有一条优先级提示，实际采用 404.html，不影响发布。
- Chrome 155.0.8059.40 生产预览验收：1280px/360px 首页、路线页与课程无整页横向溢出；亮暗模式截图与 D2 图中文正常；5 个折叠答案含正文并能展开；禁用站点 JS 后正文与折叠内容仍在 HTML 中。
- 搜索实际执行「浏览器」「库存」「npm」均返回带 `/js_web/` 的结果；搜索弹窗能检索 C01 与段落链接。浏览器未捕获资源 HTTP 错误或未处理异常。
- 安装时的间接 PostCSS 解析器告警已通过限定的依赖覆盖修复；锁文件重新 `npm ci` 及 `npm audit` 通过，报告为 0 漏洞。核查依据见 [SOURCES](SOURCES.md)。
- 首次远端验收：[Actions run 38662138819](https://github.com/socoo123/js_web/actions/runs/38662138819) 的 build/deploy 全部成功；Ubuntu 24.04 的锁文件安装、固定 Node、Linux x64 D2/字体准备、内容检查、静态构建、Pages 配置/上传/发布均实际执行通过。Pages Source 为 GitHub Actions，HTTPS 已启用。
- 线上首页、路线页、C01 深层地址均 HTTP 200。Chrome 对真实 Pages 重做 1280px/360px、亮暗模式、图加载、5 个折叠区、禁用站点 JS 的静态阅读与「浏览器/库存/npm」搜索验收，全部通过，未捕获资源 HTTP 错误或未处理异常。
- 工作流有上游 Actions 内部 Node 20 声明的兼容提示；GitHub runner 已强制使用 Node 24，本次构建/上传均通过。后续升级 Actions 时复核该提示，不把提示当成失败或影响网站运行。

## C02 已完成：Web 基础、卡片与调试现场

当前：**已提交推送，并成功部署 GitHub Pages（2026-10-15）。** [线上 C02](https://socoo123.github.io/js_web/01-history-web/c02-web-debugging/) · [课程目录](https://socoo123.github.io/js_web/roadmap/)。

- 正文：[C02 Web 基础与第一个调试现场](../src/content/docs/01-history-web/c02-web-debugging.md)。覆盖 HTML 语义/标签/表单与 DOM，CSS 选择器/层叠/盒模型/Flex/Grid/响应式，URL/HTTP/路径与页面加载；解释 defer、内存数据与 DOM、源码与临时编辑的边界。
- 配套：[examples/c02](../examples/c02/README.md)。三个完整 HTML/CSS/JS 文件，无第三方依赖；已有 Python 3 提供本地服务，不要求提前安装 Node/npm。包含原生输入约束、正整数/超卖校验、售完禁用、Enter 提交、补货增量答案；操作方式与验证状态逐项分开。
- 调试：Console 表达式、Elements/Computed、Network 路径404、Sources断点/单步/调用帧，漏defer故障、360px固定宽度故障、分步提示与折叠答案。面板路径是资料核对；浏览器协议执行与手动面板操作没有混淆。
- 图：[D2 源码](../diagrams/c02-page-flow.d2) → [SVG](../src/assets/diagrams/c02-page-flow.svg)。沿用固定 D2 0.9.0、Dagre 与内嵌中文字体/许可。纵向图聚焦脚本交互更新，明确初始绘制不必等用户操作，不冒充准确瀑布图。
- 实际示例验证（2026-10-15）：macOS arm64、Chrome **155.0.8059.40**、Python **3.11.8**；浏览器协议驱动使用 Node **24.22.0**。12→9、超卖不变、售完0并禁用、刷新12、Enter、空值/0/1.5的原生与JS校验、404与漏defer、DOM临时99/样式32px恢复、补货12→17→0→5→2、禁用页面JS均符合预期。实际断点在app.js第23行，单步前stock=12/quantity=3，单步后remaining=9/stock=12。
- 站点验证：固定 Node **24.22.0** / npm **11.19.1** 的 `npm run check` 为0 errors/0 warnings；`npm run build` 生成5个HTML、两张D2图和搜索索引，`/js_web/` 内部链接/资源、C01/C02各5个有内容的折叠区检查通过。保留此前已记录的404路由优先级提示，不影响实际404.html。
- Chrome生产预览：1280px/360px 首页、路线、C01/C02无整页溢出；C02亮暗正文、中文图与5个折叠区正常，禁用站点JS仍有正文与答案。搜索“defer”“盒模型”“补货”均命中C02，旧查询与搜索弹窗正常，资源无HTTP错误、无未处理异常。图首次窄屏检查后已简化为纵向并重新构建验收；Edge、Windows、真实手机与屏幕阅读器未执行。
- 远端首发：[Actions run 38663909240](https://github.com/socoo123/js_web/actions/runs/38663909240) build/deploy 全部成功；Ubuntu 24.04 实际执行锁文件安装、D2/字体准备、检查、静态构建和 Pages 发布。C02 深层地址 HTTP 200；真实 Pages 的1280px/360px、亮暗正文与D2图、5个折叠区、禁用站点JS阅读、搜索弹窗及“defer/盒模型/补货”检索全部通过，没有资源HTTP错误或未处理异常。上游Actions内部Node20声明提示与此前相同，runner使用Node24并执行成功。
- 已同步课程目录2/48、C01→C02链接、README、来源与架构；生产输出检查新增C02。M1的网站基础与两篇示范课验收条件已满足；后续学习功能和46课并未因此完成。

## C03–C05 并行编写与统一验收

当前：**C03–C05 正文、示例、两张 D2 图已完成，本地检查与生产阅读验收通过；尚待本批提交推送与 Pages 发布。** 三个子 agent 各负责一课，主 agent 已逐篇审阅与统一集成。

- C03：[值、类型、转换与比较](../src/content/docs/02-language-data/c03-values-types.md)，承接 C02 的表单字符串、Number 转换与库存默认值。
- C04：[变量、作用域与控制流](../src/content/docs/02-language-data/c04-scope-control.md)，包括循环统计、TDZ、越界与错误堆栈，配套作用域 D2 图。
- C05：[对象、引用与数据交换](../src/content/docs/02-language-data/c05-objects-json.md)，包括别名/浅复制、JSON 校验导入、显式时区日期与字符串，配套引用关系 D2 图。
- 已实际执行：Chrome **155.0.8059.40** 独立页面逐个运行本批 20 个 JS 文件；正常示例与答案未出现未预期异常，BigInt 混算故障文件按设计抛 TypeError。C03 答案库存 0、补货 3、总价 30 分；C04 统计 22/空数组 0；C05 别名、浅复制和参数重新绑定符合预期，日期例子切换 UTC/Asia/Shanghai 输出不变。学习者不用安装用于作者验收的 CDP 工具。
- 逐课执行补充：C03 的 17 个库存/金额边界变体在 Node **24.22.0** 通过；C04 的 Java **21.0.2** 对照输出 22/0，Chrome 本地 HTTP 页第 6 行断点四轮单步正确，故障第五轮 `index=4, quantity=undefined, total=22→NaN`，空数组故障与恢复后 22/0/0 均验证；C05 六文件 Node/Chrome 日志一致，另验 10 条导入边界与浅复制故障，UTC/Honolulu 输出一致。各课 README 给出命令、实际输出与未执行平台。
- 统一审阅修复：删除 C03 与大纲不符的后续课号预告；C04 明确每次 S01 前刷新独立页面，块只隔离 let/const。同一 Chrome 上下文实测首次 `var-before undefined`、复跑 `var-before 12`，避免把清空日志误当变量重置；正文与源码注释同步。
- 固定 Node **24.22.0** / npm **11.19.1**：`npm run check` 为 0 errors/0 warnings/0 hints；`npm run build` 生成 8 个 HTML、4 张 D2 图与 Pagefind 索引。C01–C05 链接/资源、中文语言、源码与产物折叠区数量检查通过；保留已记录的 Starlight 404 路由优先级提示，实际 404.html 正常。
- Chrome 本地生产预览：1280px/360px 首页、路线与 C01–C05 无整页横向溢出；新课亮暗正文正常，C04/C05 中文 SVG 清晰；C03/C04/C05 分别 4/5/5 个提示答案区完整可展开。禁用站点 JS 后三篇正文与答案仍存在；“安全整数”“TDZ”“浅复制”命中对应新课，搜索弹窗与旧查询正常，新课首个代码块复制到剪贴板的内容逐字正确，无资源 HTTP 错误或未处理异常。
- 已同步课程目录 **5/48**、C02→C03 链接、README、来源、架构和构建输出检查。下一篇为 C06；个人学习进度功能仍未实施。


## 尚未实施

- C06–C48 正文、练习与后续 D2 图尚未编写；本批范围为 C03–C05。
- 学习者 localStorage 完成进度/导入导出、少量 React islands 及综合示例待实施。目录的已发布课数是建设状态，不是个人学习进度。
- Pages 首发与后续建设进度以各节实际结果为准，提前上线不代表 M6 或 48 课全部完成。

## 下一项未完成：C06 函数、闭包与高阶操作

先确认本批 C03–C05 的提交与 Pages 结果，再按 `CURRICULUM.md` 和 `CONTENT_GUIDE.md` 继续 C06：函数是值，声明/表达式/箭头函数，参数、默认值与 rest，词法作用域与闭包，高阶函数，Java lambda 类比及边界。库存筛选工厂与独立计数器是主练习；用 Scope 面板观察闭包，修复循环捕获错误。C04 的作用域图只讲绑定查找，C06 再延伸到函数保留的词法环境。

1. 先读 STATUS 与 AGENTS，检查 Git 与现有站点，保留 C01–C05 和静态架构。
2. 核对本课使用的官方规范与目标环境，不提前扩大为 C07。
3. 执行核心例子与答案，更新来源、目录和本文件，运行 `npm run check` / `npm run build`，验收新课生产页。
4. 按授权正常提交推送 main，检查对应 Pages Actions 及新课线上直达 URL；不强推，不把失败记为已上线。

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
