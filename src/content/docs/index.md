---
title: 从 Java 出发，学会 JavaScript
description: 为会 Java、初学前端的开发者准备的中文课程，从浏览器基础到 React 与 SAP UI5。
template: splash
hero:
  title: 从 Java 出发，走进 JavaScript
  tagline: 48 课、5 个 Lab、一个长期工作区。从浏览器基础出发，把同一个库存应用做到静态交付。
  actions:
    - text: 从 Lab 开始跟做
      link: /js_web/labs/
      icon: right-arrow
    - text: 查看学习路线
      link: /js_web/roadmap/
      variant: secondary
---

## 为你的 Java 经验搭一座桥

你已会写程序，但不必提前掌握 HTML、CSS、浏览器或 TypeScript。课程从这些基础讲起，用 Java 熟悉的对象、集合、异常和工程经验帮助你理解 JavaScript 的不同之处。

**48 课主线已发布。** 第一次学习先到[库存工作区与 5 个 Lab](./labs/)准备自己的工程，再从 [C01](./01-history-web/c01-story-ecosystem/)开始；[学习路线](./roadmap/)保留全部课程入口和阅读进度。

## 同一个项目，五次阶段交付

| Lab | 课程 | 你会做出什么 |
| --- | --- | --- |
| [L1 库存规则与数据](./labs/l1/) | C01–C10 | 从商品卡片开始，写输入校验、筛选统计、集合与撤销 |
| [L2 可用的原生库存页](./labs/l2/) | C11–C20 | 接列表、异步、存储、响应式布局、Node 报表和第一批 UT |
| [L3 React 库存应用](./labs/l3/) | C21–C36 | 从 JSX 逐步做到状态、表单、路由、缓存、测试与恢复 |
| [L4 组件库与 UI5 适配](./labs/l4/) | C37–C44 | 保留 React 主应用，为同一库存规则做四种并列界面适配 |
| [L5 调试与静态交付](./labs/l5/) | C45–C48 | 回到 React 主应用，排错、检查生产路径、补风险回归与现场小增量 |

正常学习一直修改自己的 `inventory/`；阶段起点只用于补课或恢复，不用每天新建工程。Lab 收尾就是课程练习，不另加一套大作业。

## 两种学习节奏

| 路线 | 每日安排 | 适合你何时选择 |
| --- | --- | --- |
| 4 周主线 | 每周 6 天，每天 2 课，共 24 天、48 课；每天 3–4 小时，包含 Lab 跟做与调试 | 能持续投入，希望连贯完成库存管理项目 |
| 8 周慢速与深化 | 每周 6 天，每天 1 课，按同样顺序推进 | 希望增加复习时间，或每天可用时间较少 |

## 每一课怎么学

1. 先看任务卡，确认起点、当前目录、本课改动和预期结果。
2. 在自己的工作区跟做；先预测，再运行，用有帮助的 Java 对照理解差异。
3. 按「自己尝试」收集错误证据、修复并复测，卡住后再展开提示或答案。
4. 检查当前文件，在 `notes/next.md` 留下暂停点；读懂后再主动标记课程完成。

语言与数据结构、Node/Bun 运行时、npm/Yarn/pnpm 包管理器会分别讲清；之后深入 React，再学习开源组件与 SAP UI5 系列。

随时查阅：[ES 版本](./reference/es-versions/)、[Java ↔ JS](./reference/java-js/)、[React Hooks](./reference/react-hooks/)、[UI5 家族](./reference/ui5-family/)。旧 `examples/cNN` 和七阶段工程保留为机制参考与验证记录，日常必做任务从 Lab 进入。

在线阅读无需安装网站。练习在自己的浏览器或本地工程完成；课程网站和学习包的访问地址不等于 Lab 应用已在线运行。每课页首说明示例验证状态，实际环境与命令见对应验证记录。
