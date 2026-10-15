# 静态网站架构与部署规划

状态：技术方向已定，尚未安装依赖或创建网站代码。实施时先核查实际版本，再固定依赖。

## 技术选择

采用 **Astro + Starlight + Markdown/MDX + 少量 React islands**。

| 需求 | 方案与理由 |
| --- | --- |
| 长篇中文课程、目录和移动阅读 | Starlight 提供文档站骨架，减少重复搭建导航 |
| 代码显示与复制 | 使用现有 Expressive Code 能力，保留文件名/高亮/差异标记 |
| 课程正文 | Markdown 为主；需要嵌入组件时使用 MDX；构建成真实 HTML |
| React 示例 | Astro 官方 React 集成；只有少量需要交互的示例加载 React |
| 搜索 | Starlight 默认 Pagefind 静态索引，测试中文分词与英文 API 搜索 |
| 进度 | 浏览器 localStorage；不引入账号/后端 |
| 关键图 | D2 构建期生成 SVG，浏览器只显示图 |
| 部署 | GitHub Actions 构建 dist，再发布 GitHub Pages |

VitePress 同样能生成静态文档，但默认主题基于 Vue，本项目要讲大量 React；Astro 的 React 集成使示例组织更直接。无需另做一个全站 React SPA。

依据：[Astro islands](https://docs.astro.build/en/concepts/islands/)、[React 集成](https://docs.astro.build/en/guides/integrations-guide/react/)、[Starlight 内容](https://starlight.astro.build/guides/authoring-content/)、[Starlight 搜索](https://starlight.astro.build/guides/site-search/)、[VitePress](https://vitepress.dev/guide/what-is-vitepress)。

## 运行边界与示例策略

用户不要求所有示例完全在线运行。第一版重点是清楚讲解和让学习者自己操作。

| 内容 | 所需环境 | 站内呈现 |
| --- | --- | --- |
| 纯 JS 语法/数据函数 | 浏览器 Console 或本地 Node，按 API 标注 | 代码、输出、预测题、自己尝试 |
| DOM/CSS/浏览器调试 | 本地 HTML/开发服务、Chrome/Edge DevTools | 完整必要文件、操作步骤、预期现象 |
| Node/npm/Yarn/pnpm/Bun | 学习者本地终端 | 命令、版本、目录、输出与排错说明 |
| React/普通组件/UI5 React | 本地 Vite 工程 | 分阶段代码与自己尝试；少量预构建演示可选 |
| 经典 OpenUI5 | 本地 UI5 CLI 或明确 bootstrap 的静态例子 | 文件与命令、绑定/路由/调试步骤 |
| OData V2 mock | 浏览器 MockServer + 静态 metadata/JSON | 有限范围演示或自行尝试 |
| OData V4/CAP/真实 SAP | 本地或外部服务 | 选修，明确服务要求，不宣称 Pages 自带后端 |

所有示例将“在哪里尝试”和“是否实际验证”分别记录。文档核对不能等同于运行通过。

不在第一版实现任意代码在线执行器。未来若有此需求，先验证隔离、超时、资源限制和结果输出，再决定是否引入；它不阻碍课程交付。

少量 React 演示按需加载，避免在首页或每篇文章加载所有组件库。经典 UI5/大型组件库示例可以独立构建或只作为本地练习资料。

## 目录草图

以下是实施后预计目录，当前仅有规划文件：

```text
js_web/
├── README.md
├── AGENTS.md
├── .cursor/rules/project-context.mdc
├── docs/
│   ├── PLAN.md
│   ├── CURRICULUM.md
│   ├── ARCHITECTURE.md
│   ├── CONTENT_GUIDE.md
│   ├── DEBUG_TESTING.md
│   ├── SOURCES.md
│   └── STATUS.md
├── src/
│   ├── content/docs/
│   │   ├── index.mdx
│   │   ├── roadmap/
│   │   ├── 01-history-web/
│   │   ├── 02-language-data/
│   │   ├── 03-async-modules/
│   │   ├── 04-runtime-tooling/
│   │   ├── 05-react/
│   │   ├── 06-components-ui5/
│   │   ├── 07-project/
│   │   └── reference/
│   ├── components/            # Progress、少量可信 React 演示
│   ├── assets/diagrams/       # D2 构建生成 SVG
│   └── styles/
├── diagrams/                  # D2 源文件
├── examples/                  # 独立练习；自己的 README/必要依赖
├── scripts/                   # D2 构建、课程/链接检查
├── public/                    # 静态数据与可下载练习资料
├── tests/                     # 必要的站点关键行为验收
├── astro.config.mjs
├── package.json
├── package-lock.json
├── .node-version
└── .github/workflows/         # M6 创建 Pages 工作流
```

课程示例用 `.js/.jsx`，站点工程可使用适量 TypeScript。读者不需要先掌握复杂泛型才能开始学习。

## 内容模型

Starlight 标准字段与自定义字段分开；扩展 schema 后再写入自定义数据，避免 frontmatter 被静默丢弃或构建报错。

建议每课记录：

```yaml
title: C23 useState：状态快照与更新队列
description: 从 Java 的可变字段思维转向 React 的渲染快照。
lessonId: C23
week: 2
day: 12
prerequisites: [C06, C21, C22]
difficulty: core
estimatedMinutes: 40
execution: local-react
verification: reviewed
verifiedWith: null
lastReviewed: 2026-10-15
```

`estimatedMinutes` 表示阅读/跟做预算，另显示独立练习预算；不是承诺完成整课项目只要 40 分钟。`verification` 按具体示例记录更精确，页面聚合不得掩盖未执行的例子。

来源链接放在正文相关说明附近，并在课尾给出官方延伸阅读。课号不可随标题调整而变化。

## 进度与搜索

进度键：`js_web:progress:v1`。数据包含 schemaVersion、completedLessonIds、lastLessonId、updatedAt。

- localStorage 不可用、JSON 损坏或包含已删除课号时，页面继续可读并给出恢复方式。
- 完成标记由学习者控制；翻页不等于学会。
- 导入校验结构、ID 和版本；导出纯 JSON。
- 默认只保存在当前浏览器，不宣称 GitHub 会同步学习进度。
- 进度与最近阅读区域在客户端增强，不阻塞静态正文。

搜索采用静态索引；在生产构建后验证“闭包”“状态快照”“断点”“单元测试”“UI5”“useEffect”“npm ci”等查询。开发服务器里能显示页面不代表搜索索引正确。

## D2 构建

1. 源码放 `diagrams/`，有稳定文件名和对应课号。
2. 实施时选择并固定 D2 CLI 版本，使用无需商业许可的布局引擎。
3. 一条构建脚本逐个生成 SVG 到 `src/assets/diagrams/`，供课程相对导入。
4. D2 先构建，再进行 Astro 构建；非零退出必须阻止发布，不能只检查文件存在。
5. 中文字体、布局、文字大小和亮暗模式实际渲染检查；统一风格，避免图内塞长代码。
6. 每图有 alt/邻近文字解释；流程即使不看图也能理解。

依据：[D2 导出](https://www.d2lang.com/tour/exports/)、[D2 CLI](https://d2lang.com/tour/man/)。本轮本机尚无 D2，安装和图渲染在 M1 执行。

## Pages 子路径与路由

预计 Astro 配置方向：

```js
site: 'https://socoo123.github.io',
base: '/js_web/',
output: 'static',
trailingSlash: 'always'
```

- 课程对应真实生成的 HTML，深层地址首次打开和刷新都成功。
- 参数路由如有使用，构建时列出全部课路径。
- 手写链接与 public 资源由统一 helper 加 base；不要散落硬编码的 `/assets/...`。
- Markdown 图片优先相对导入，构建资产使用 Astro 的处理能力。
- 独立 React 练习可用 HashRouter；课程正文采用普通静态路径，不以 SPA 404 重写作为部署基础。
- 搜索索引、字体、图片、下载和示例数据必须一起通过子路径验收。

依据：[Astro Pages 部署](https://docs.astro.build/en/guides/deploy/github/)、[Astro 路由](https://docs.astro.build/en/guides/routing/)、[React Router HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter)。

## 依赖与命令规划

初始核心依赖：astro、@astrojs/starlight、@astrojs/mdx、@astrojs/react、react、react-dom。仅在实际需要时增加示例/验证依赖。

Node 24 LTS 为查询所见基线；M1 核对并固定具体补丁。本地与 CI 使用同一版本。网站工程统一 npm、一份根级 `package-lock.json`；其他管理器实验在独立目录，不混用根锁文件。

预计脚本：

| 命令 | 用途 |
| --- | --- |
| npm run dev | 网站本地开发 |
| npm run diagrams | D2 生成 SVG |
| npm run check | 内容 schema、Astro/类型、必要链接检查 |
| npm run build | 先生成图再构建静态网站 |
| npm run preview | 检查生产产物与搜索 |
| npm run test | 有价值的站点业务测试，按实施需要配置 |
| npm run test:e2e | 关键路径浏览器验收，按实施需要配置 |

以上是待创建的命令，本轮不能执行。课程用的 UT 练习与网站自身测试分开组织，避免把“教框架”误当成“给每个静态段落写测试”。

## GitHub Actions 部署计划

M6 执行部署，不在本轮创建或触发发布：

1. 仓库 Pages Source 设为 GitHub Actions。
2. PR 只做检查与构建；main 推送/手动触发执行发布。
3. 构建 job：contents: read，安装固定 Node、npm ci、固定 D2、检查、构建、上传 dist。
4. 发布 job：依赖构建，仅此 job 给 pages: write、id-token: write，environment 为 github-pages。
5. 采用 GitHub 官方 Pages actions，实施时核对版本并固定完整 commit SHA；无需在仓库提交长期 PAT。
6. 设置部署 concurrency，记录成功部署的提交与 URL。

未来站点地址：`https://socoo123.github.io/js_web/`。当前仓库未配置 Pages，不能将这个地址报告为已上线。

依据：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 验证范围

用户允许示例自己尝试；验收仍需确保网站本身能构建、阅读和部署。

必须检查：静态构建、内容/链接、关键资源、首页与深层刷新、搜索、代码复制、答案展开、进度恢复、360px 阅读、键盘操作、关键 D2 渲染。

教学示例：选择代表性的核心机制与测试示范实际执行，其余核对代码/官方文档并标注自己尝试及验证状态。不要声称 48 课全部已运行。

网站测试只覆盖可能回归的行为，例如进度损坏恢复、导入校验和子路径资源；静态文本改动通常用内容检查与视觉审阅即可。
