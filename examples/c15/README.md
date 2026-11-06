# C15 CSS 布局与响应式 · 示例

配套正文：[C15](../../src/content/docs/03-async-modules/c15-css-layout-responsive.mdx)。主线在连续工作区修改 `src/vanilla/styles.css`；下表旧网页仅供机制实验参考，固定数据取自 shared/products.json。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| index.html | 本地网页 | 全部实验与阶段 2 项目的入口 |
| box-model.html + box-model.css | 本地网页 | content-box / border-box 外宽比较 |
| fluid.css | 随 responsive.html 加载 | 流式容器与最大宽度 |
| toolbar.html + filters.html + flex.css | 本地网页 / HTML 片段 | 字段包装、Flex 分配与换行；filters 是正文片段 |
| grid.html + grid.css | 本地网页 | auto-fill 空轨道；勾选仅显示 P001 |
| responsive.html + responsive.css | 本地网页 | 移动优先的单列、两列、四列 |
| appearance.html + appearance.css + focus.css | 本地网页 | 变量、键盘焦点、前景背景色 |
| overflow-broken.html + overflow-broken.css | 本地网页 | 故意使用 600px 固定宽度造成溢出 |
| overflow-fixed.html + overflow-fixed.css | 本地网页 | 跟随父元素，上限 600px |
| base.css | 网页共享 | 字体、控件与卡片基础样式 |
| layout-budget.js | `node layout-budget.js` | 练习 1 的间距预算，配 expected 输出 |
| contrast.js | `node contrast.js` | 不透明 sRGB 对比度，配 expected 输出 |
| ../inventory/02-web | 本地网页 | C14 页面上加入响应式布局，保留存储与恢复 |

## 运行

在仓库根目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c15/`。纯 JS 文件在本目录执行上表命令；根目录运行 `npm run examples -- c15` 核对输出。

## 验收要点

- box-model：桌面上边框盒宽 344 / 300px；流式 main 的默认最大宽 1200px。
- toolbar：宽屏控件底部对齐，360px 时分类字段换到下一行；label 和控件不分离。
- grid：720px 容器三列，各约 229.33px；只显示 P001 后列宽不变；auto-fit 对照会变为 720px。
- responsive：360/767px 单列、768/1199px 两列、1200/1280px 四列，无横向溢出；后置两列查询可复现覆盖错误。
- overflow：360px 视口下错误卡片宽 600px、页面滚动宽 616px；修复后卡片 328px、滚动宽 360px；宽屏上限 600px。
- appearance：Tab 焦点显示 3px 轮廓；修改根 --space 后面板 padding 从 16px 变 32px。
- 项目：360/768/1280px 为 1/2/4 列；初始 52 件、26348.00 元；筛选、编辑、错误、空态时均不溢出。

## 验证记录

- 2026-10-16 · Node 24.22.0 / npm 11.19.1 · macOS arm64：2/2 固定输出、全量 161/161 通过；lint 零 error/warning、astro check 零诊断，build 与生产输出检查通过；正文 7663/8000 字符、12 个代码块。对比度为 15.17、7.80、6.50、7.99。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：
  - 上述盒模型、Flex 对齐/换行、auto-fill/auto-fit、六个断点尺寸和媒体查询覆盖均按预期。
  - 读取 CSS computed/matched rules，证实溢出来自 #broken-card 的 width: 600px；修复后无溢出；生成 Grid 叠加层并检查截图。
  - 项目三种目标宽度截图已查看；配件筛选显示两项，P004 从 3 改 4 后刷新保留；-1 触发原生校验，取消后焦点返回编辑按钮。
  - 空筛选、40 字连续名称、200% 根字号下无横向溢出；Tab 顺序为导出、导入、恢复、搜索、分类、各编辑按钮，焦点可见。
  - 实际下载 JSON、恢复初始数据、回导下载文件通过；原存储键已在验证结束时移除，页面无未捕获异常。
  - 生产预览 /js_web/ 下文章与路线页返回 200；文章有 12 个代码块和 6 个提示/答案折叠区；360/1280px 无页面横向溢出，禁用 JS 后仍可阅读并展开答案。
- 未运行：DevTools 界面手动点击、Firefox、Safari、真实手机；面板入口核对官方文档。只改示例 CSS，站点主题沿用 C12 周验收。
- 同日：[Pages Actions 38927024152](https://github.com/socoo123/js_web/actions/runs/38927024152) 成功；线上文章与路线页返回 200，HTML 与本地构建逐字节一致。

## V2 连续工作区

2026-10-28 · 发行版 2026.10-v2.2：本课在 `labs/inventory/` 持续修改，`npm run lab -- check C15` 检查实际文件。C00→C20 的单目录正文跟做、错误证据与修复见 [R5 验证](../../labs/records/R5.md)。旧例子保留为可选参考。网站使用原 URL 与 F1 课号。

阶段 C 定点修正：删除 Java 几何算术对照，正文直接引用 C15 的完整 CSS，保留相同跟做起点、布局结果、故障步骤与原锚点。Swing/JavaFX 仅作经验引入。

- 2026-10-29 · macOS arm64、Node 24.22.0 / npm 11.19.1、Playwright 1.64.1 / Chromium 156.0.8078.4：`npm run examples -- c15` 2/2，课程 lint 零 error/warning；`npm run check` 零诊断，Astro 静态构建及 `npm run check:build` 通过。
- 在独立 `2026.10-v2.4/C14` 恢复副本，仅复制本次正文渲染的 13 行 CSS；`LAB_NATIVE_CHECK_PORT=19402 npm run lab -- check C15` 68 条通过。360/768/1280px 为 1/2/4 列；纯键盘筛选 P004、保存 8 后总库存 57，P001 仍 12，刷新保留；空白拒绝并聚焦错误字段。
- 在该副本的实际样式文件加 `article { min-width:600px; }`，360px 视口的滚动宽为 616px；移除故障后为 360px。截图、Computed 数值及完整本地站点自动审计见作者工作记录；主集成终验和发布由阶段 C 记录另行确认。
- 本次未测：Firefox、Safari、Edge、Windows、真机、屏幕阅读器；未手动操作 DevTools GUI。

## V3 范例课改写

2026-11-06 · V3 第 1 阶段（路 4 改写，待主验收）。正文改为「主张 → 代码 → 效果 → 原因 → Java 对照」，课号、URL、全部锚点（含旧兼容锚点）、知识点、主错误、练习和验收数字不变；旧页首引用块改为 frontmatter `lesson`，暂停记录等操作细节交给任务卡。

正文代码与效果的来源：

| 正文位置 | 内容 | 来源与核对 |
| --- | --- | --- |
| 第 1 节「先猜一猜」 | `.card` content-box / border-box | C15 页面内实测：外框 334 / 300px，border-box 内容区 266px |
| 第 1 节完整 CSS | `CodeExcerpt c15-css` | 直接读取 C15 参考快照的 `src/vanilla/styles.css` |
| 第 1 节 Console | `$0` 的 boxSizing 与 offsetWidth | 360px 实测 border-box、328；内容区 294 |
| 第 2–4 节 CSS 片段 | Flex/Grid、媒体查询、焦点 | 与完整 CSS 同一规则（媒体查询拆成多行） |
| 第 3 节 Console | 三种宽度的 gridTemplateColumns | 实测 '328px' / '360px 360px' / '284px 284px 284px 284px'；断点 672px、1120px 处切换 |
| 第 3 节「先猜一猜」 | 两条媒体查询对调 | 在工作区真实对调后 1280px 为 '584px 584px' |
| 页面截图 | `c15/layout`、`narrow`、`single`、`overflow`、`focus` | 从 C15 参考快照拍摄，定义见 `labs/previews/c15.json`；overflow 用临时追加的 `article { min-width: 600px; }`，并断言 scrollWidth 616 |
| 调试 Console | scrollWidth 616 / innerWidth 360 | 在工作区 styles.css 末尾真实追加故障行后实测 |

- 环境：macOS arm64、Node 24.22.0、Playwright 1.64.1 / Chromium 156.0.8078.4（headless）。
- `npm run examples -- c15`：2/2 通过。课程 lint（V3 规则，结构类规则为 error）：0 error、0 warning；正文 3830/8000 字符（集成后组件里的文字也计入）、12 个代码块，段落最长 110 字。
- 正文跟做：从 C14 参考快照恢复到临时目录，`LAB_NATIVE_CHECK_PORT=4344`。
  - 起点 `node tools/lab.mjs check C15` 失败（exit 1）；只按第 1 节替换 styles.css 后 68 条通过，360/768/1280px 无横向滚动。
  - 调试第 1 步在文件末尾加 `article { min-width: 600px; }`：检查失败于 `scrollWidth <= innerWidth`，360px 下 scrollWidth 616、卡片 min-width 600px、列表 328px；删掉后 68 条再次通过。
  - 只用键盘（Tab、输入、Enter）在三种宽度下：搜索 P004、编辑按钮显示 3px 焦点外框，打开后焦点在库存框；保存空白提示「请输入库存，空白无效」且焦点留在库存框；保存 8 后总库存 57、价值 2784300 分。
- Java 对照：只作布局管理器经验类比（FlowLayout 换行、窗口缩放时按同一规则重排），不声称 API 等价，与目录的对照主题一致。
- 集成构建上的页面检查（严格静态服务 `dist`，headless Chromium）：
  - 页首显示「第 2 周 · 第 8 天」、L2 链接和 frontmatter 四项。2 个「先猜一猜」可揭晓，3 个 Console 面板可见。
  - 6 处页面截图全部加载；`c15/layout` 点 360/768/1280 切到对应图片，窄于 600px 的视口默认显示 360。
  - 360/768/1280px × 亮/暗无横向溢出、无页面异常。禁用 JavaScript 时隐藏切换按钮，各显示一张默认图。
- 集成后定点修正：两个 Console 面板标题缩短，360px 下不再挤压面板标签；第 3 节的命令移进面板记录，补一句设备模式的说明并链接 Chrome 文档。`c15/focus` 增加 360 宽截图。
- 未运行：Firefox、Safari、Edge、真机、屏幕阅读器；DevTools 界面手动点击（Computed、Grid overlay 按官方文档核对，数值经 Playwright 读取）。
