# C15 CSS 布局与响应式 · 示例

配套正文：[C15](../../src/content/docs/03-async-modules/c15-css-layout-responsive.md)。网页无需第三方依赖，固定数据取自 shared/products.json。

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
