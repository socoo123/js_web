# 课程改版审阅稿（R0 历史记录）

此目录保留旧审阅证据。当前执行按 [PLAN](../PLAN.md) 的 A/B/C 和 [Lab 设计](../../labs/README.md)，下文当时的未实施状态不代表当前进度，也不再要求重做 R1–R9。

当前实现范围见 [STATUS](../STATUS.md)；以下保留方案阶段的审阅记录。

2026-10-28。完整决策与实施队列见 [新 PLAN](../PLAN.md)。本目录只提供页面设计审阅，未把组件或 Lab 功能接入网站。

- [打开 HTML 样稿](lesson-layout.html)：C03 普通课、C23 React 难点、5 个 Lab 总览。可切换亮暗、独立复制代码、展开提示/答案。
- [桌面截图](lesson-desktop.png)：1280px，Java 左、JavaScript 右。
- [手机截图](lesson-mobile.png)：360px，同一对照卡内上下展示两种代码及各自结果。
- [48 章改动](../CURRICULUM.md#revision-v2-curriculum)、[每章可能错误](../DEBUG_TESTING.md#revision-v2-errors)、[页面实现规格](../ARCHITECTURE.md#revision-v2-ui)、[写作模板](../CONTENT_GUIDE.md#revision-v2-writing)。

HTML 可直接在浏览器打开；file 地址下复制权限可能受限，仍可选中文本。要使用本地 HTTP 预览，在仓库根目录执行 `python3 -m http.server 8876 --bind 127.0.0.1 --directory docs/review`，打开 `http://127.0.0.1:8876/lesson-layout.html`。样稿里的 `npm run lab` 是拟定命令，目前不可运行。

## 本次实际检查

- 48 个课程任务、48 个错误矩阵记录按 C01–C48 连续；标题与现有课程一致，24 个学习日映射正确。
- Playwright/Chromium：360、768、1280px × 亮暗六组。无页面横向溢出或脚本异常；1280px 两栏，其余两种宽度单栏。
- 独立复制得到本侧代码；键盘 Enter 可展开答案；章节和 Lab 锚点可跳转。360px 禁用 JS 后两侧代码/输出/解释仍可读，原生答案可展开。
- 桌面、手机与深色截图已目视检查。截图从 HTML 原样生成，不是未来站点已上线的截图。
- Java 21.0.2：样稿两段 Java 代码补 main 包装后实际执行，分别输出 15。Node 24.22.0：C03 JS 转换片段输出 15；答案片段接受合法整数范围，拒绝空白、非数字、负数、小数及越界输入。
- 复用已安装 React 19.3.1 与 happy-dom：样稿 C23 错误事件片段从12更新为13；函数式更新片段从12更新为15。该检查验证片段行为，不代表完整 C23 Lab 已实现。

临时核对脚本、完整几何结果与深色截图在被忽略的 `.cache/qa/revision/`；不是产品实现或发布资产。尚未进行 Astro 组件集成、完整 Lab 跟做或 Pages 发布；这些属于 PLAN 的 R1–R9。

## 交接范围

本次只写方案与样稿。正式课程仍用原文件与运行方式。下一位 agent 应先按用户 review 修改方案，再在用户明确要求实施后按 R1 开始；不能从图片倒推实现、跳过快照链或直接批量改48课。
