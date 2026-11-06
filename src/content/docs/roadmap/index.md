---
title: 学习路线与课程目录
description: 4 周 48 课与 8 周慢速路线，从五个 Lab 进入同一个库存工作区。
---

<!-- 由 scripts/sync-roadmap.mjs 从课程大纲、catalog 与已有文章生成。 -->

**可阅读 48 / 48 课。** 第一次学习先到[库存工作区与 5 个 Lab](../labs/)准备工程，再按课号跟做。

## 选择你的节奏

<div class="pace-cards">

- **4 周主线** 每周 6 个学习日，每天按目录顺序学习 2 课，投入 3–4 小时；第 7 天休息或补课。
- **8 周慢速与深化** 每周 6 个学习日，每天按课号学习 1 课，用剩余时间练习、调试和复习。

</div>

下面按 4 周主线排列；每个学习日旁边注明 8 周路线对应的天数。每课先看任务卡，在自己的 inventory/ 修改，再对照输出、收集错误证据并检查。Lab 收尾包含在课程时间里；网站阅读标记与本地工作区检查分别管理。

48 课均已接入连续工作区。阶段内接自己的上一课，固定起点只用于补课或恢复；旧 examples 保留为机制参考与验证记录。

## 五个 Lab，一条连续主线

| Lab | 课程 | 补课起点 | 阶段产出 |
| --- | --- | --- | --- |
| [L1 库存规则与数据](../labs/l1/) | C01–C10 | C00 | 从商品卡片到可撤销的库存规则 |
| [L2 可用的原生库存页](../labs/l2/) | C11–C20 | C10 | 列表、请求、存储、布局与第一批测试 |
| [L3 React 库存应用](../labs/l3/) | C21–C36 | C20 | 从组件到状态、表单、异步与测试 |
| [L4 组件库与 UI5 适配](../labs/l4/) | C37–C44 | C36 | 同一规则与编辑场景，四种界面 |
| [L5 调试与静态交付](../labs/l5/) | C45–C48 | C44 | 从排错到可恢复的静态交付 |

起点是前一课的完成参考态，不是本 Lab 的答案。正常跟做沿用自己的目录；L4 保留 React 主应用，L5 回到 src/react 做交付。

## 第 1 周：历史、语言、结构与浏览器

<p class="roadmap-week-meta not-content">
<span>第 1–6 天 · 12 课 · 8 周路线第 1–2 周</span>
<span data-done-count="C01 C02 C03 C04 C05 C06 C07 C08 C09 C10 C11 C12" hidden></span>
</p>

<ol class="roadmap-timeline not-content">
<li class="roadmap-milestone"><span class="roadmap-lab-chip">L1</span><a href="../labs/l1/">库存规则与数据</a><span>从这里开始 · C01–C10 · 补课起点 C00</span></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 1 天</strong><span>8 周路线：第 1、2 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../01-history-web/c01-story-ecosystem/"><span class="roadmap-lesson__id">C01</span>JavaScript 的故事与生态地图</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C01" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../01-history-web/c02-web-debugging/"><span class="roadmap-lesson__id">C02</span>Web 基础与第一个调试现场</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C02" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 2 天</strong><span>8 周路线：第 3、4 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../02-language-data/c03-values-types/"><span class="roadmap-lesson__id">C03</span>值、类型、转换与比较</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C03" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../02-language-data/c04-scope-control/"><span class="roadmap-lesson__id">C04</span>变量、作用域与控制流</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C04" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 3 天</strong><span>8 周路线：第 5、6 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../02-language-data/c05-objects-json/"><span class="roadmap-lesson__id">C05</span>对象、引用与数据交换</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C05" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../02-language-data/c06-functions-closures/"><span class="roadmap-lesson__id">C06</span>函数、闭包与高阶操作</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C06" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 4 天</strong><span>8 周路线：第 7、8 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../02-language-data/c07-this-prototypes/"><span class="roadmap-lesson__id">C07</span>this、原型与 class</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C07" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../02-language-data/c08-arrays-processing/"><span class="roadmap-lesson__id">C08</span>Array 与业务数据处理</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C08" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 5 天</strong><span>8 周路线：第 9、10 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../02-language-data/c09-maps-sets/"><span class="roadmap-lesson__id">C09</span>Object、Map、Set 与弱集合</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C09" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../02-language-data/c10-stacks-queues-trees/"><span class="roadmap-lesson__id">C10</span>栈、队列、树与复杂度</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L1</span><span data-lesson-status="C10" hidden></span></span></li>
</ul></li>
<li class="roadmap-milestone"><span class="roadmap-lab-chip">L2</span><a href="../labs/l2/">可用的原生库存页</a><span>从这里开始 · C11–C20 · 补课起点 C10</span></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 6 天</strong><span>8 周路线：第 11、12 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../03-async-modules/c11-dom-events-forms/"><span class="roadmap-lesson__id">C11</span>DOM、事件、表单与页面调试</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C11" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../03-async-modules/c12-callbacks-promises/"><span class="roadmap-lesson__id">C12</span>从回调到 Promise：执行顺序</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C12" hidden></span></span></li>
</ul></li>
</ol>

## 第 2 周：现代 JS、运行时、工具与 React 起步

<p class="roadmap-week-meta not-content">
<span>第 7–12 天 · 12 课 · 8 周路线第 3–4 周</span>
<span data-done-count="C13 C14 C15 C16 C17 C18 C19 C20 C21 C22 C23 C24" hidden></span>
</p>

<ol class="roadmap-timeline not-content">
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 7 天</strong><span>8 周路线：第 13、14 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../03-async-modules/c13-async-await-fetch/"><span class="roadmap-lesson__id">C13</span>async/await、请求与 Network</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C13" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../03-async-modules/c14-storage-errors/"><span class="roadmap-lesson__id">C14</span>原生页面、存储与错误处理</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C14" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 8 天</strong><span>8 周路线：第 15、16 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../03-async-modules/c15-css-layout-responsive/"><span class="roadmap-lesson__id">C15</span>CSS 布局与响应式：排版库存页</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C15" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../03-async-modules/c16-modules-dependencies/"><span class="roadmap-lesson__id">C16</span>模块、依赖与组织代码</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C16" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 9 天</strong><span>8 周路线：第 17、18 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../04-runtime-tooling/c17-node-browser/"><span class="roadmap-lesson__id">C17</span>Node 与浏览器的边界</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C17" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../04-runtime-tooling/c18-npm-reproducible-installs/"><span class="roadmap-lesson__id">C18</span>npm：项目、版本与可复现安装</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C18" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 10 天</strong><span>8 周路线：第 19、20 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../04-runtime-tooling/c19-yarn-pnpm-bun/"><span class="roadmap-lesson__id">C19</span>Yarn、pnpm、Bun 的职责与选择</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C19" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../04-runtime-tooling/c20-vite-vitest/"><span class="roadmap-lesson__id">C20</span>构建工具与第一次 UT</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L2</span><span data-lesson-status="C20" hidden></span></span></li>
</ul></li>
<li class="roadmap-milestone"><span class="roadmap-lab-chip">L3</span><a href="../labs/l3/">React 库存应用</a><span>从这里开始 · C21–C36 · 补课起点 C20</span></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 11 天</strong><span>8 周路线：第 21、22 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c21-react-jsx-components/"><span class="roadmap-lesson__id">C21</span>React 来由、JSX 与第一个组件</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C21" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c22-props-composition-render/"><span class="roadmap-lesson__id">C22</span>Props、组合与渲染模型</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C22" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 12 天</strong><span>8 周路线：第 23、24 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c23-state-snapshot-queue/"><span class="roadmap-lesson__id">C23</span>useState：状态快照与更新队列</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C23" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c24-arrays-keys-derived/"><span class="roadmap-lesson__id">C24</span>数组更新、key 与派生数据</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C24" hidden></span></span></li>
</ul></li>
</ol>

## 第 3 周：详细 React 与组件工程

<p class="roadmap-week-meta not-content">
<span>第 13–18 天 · 12 课 · 8 周路线第 5–6 周</span>
<span data-done-count="C25 C26 C27 C28 C29 C30 C31 C32 C33 C34 C35 C36" hidden></span>
</p>

<ol class="roadmap-timeline not-content">
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 13 天</strong><span>8 周路线：第 25、26 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c25-forms-validation-accessibility/"><span class="roadmap-lesson__id">C25</span>表单、校验与可访问性</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C25" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c26-state-ownership-reset/"><span class="roadmap-lesson__id">C26</span>状态提升、保留与重置</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C26" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 14 天</strong><span>8 周路线：第 27、28 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c27-reducer-context/"><span class="roadmap-lesson__id">C27</span>useReducer 与 Context</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C27" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c28-refs-external-systems/"><span class="roadmap-lesson__id">C28</span>useRef 与外部系统</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C28" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 15 天</strong><span>8 周路线：第 29、30 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c29-effects-cleanup/"><span class="roadmap-lesson__id">C29</span>useEffect 深入与清理</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C29" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c30-requests-races/"><span class="roadmap-lesson__id">C30</span>请求状态与竞态调试</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C30" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 16 天</strong><span>8 周路线：第 31、32 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c31-custom-hooks-routing/"><span class="roadmap-lesson__id">C31</span>自定义 Hooks 与路由</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C31" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c32-tanstack-query-server-state/"><span class="roadmap-lesson__id">C32</span>认识 TanStack Query 与服务端状态</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C32" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 17 天</strong><span>8 周路线：第 33、34 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c33-modern-react-actions/"><span class="roadmap-lesson__id">C33</span>现代 React 19 与更新速查</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C33" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c34-performance-loading-errors/"><span class="roadmap-lesson__id">C34</span>性能、加载与错误诊断</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C34" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 18 天</strong><span>8 周路线：第 35、36 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../05-react/c35-react-testing/"><span class="roadmap-lesson__id">C35</span>React UT、集成测试与 E2E 地图</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C35" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../05-react/c36-react-project-debugging/"><span class="roadmap-lesson__id">C36</span>React 项目复盘与故障排查</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L3</span><span data-lesson-status="C36" hidden></span></span></li>
</ul></li>
</ol>

## 第 4 周：开源组件、UI5 与项目交付

<p class="roadmap-week-meta not-content">
<span>第 19–24 天 · 12 课 · 8 周路线第 7–8 周</span>
<span data-done-count="C37 C38 C39 C40 C41 C42 C43 C44 C45 C46 C47 C48" hidden></span>
</p>

<ol class="roadmap-timeline not-content">
<li class="roadmap-milestone"><span class="roadmap-lab-chip">L4</span><a href="../labs/l4/">组件库与 UI5 适配</a><span>从这里开始 · C37–C44 · 补课起点 C36</span></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 19 天</strong><span>8 周路线：第 37、38 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../06-components-ui5/c37-component-ecosystem-selection/"><span class="roadmap-lesson__id">C37</span>组件生态与选择标准</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C37" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../06-components-ui5/c38-antd-inventory/"><span class="roadmap-lesson__id">C38</span>一个普通组件库的完整案例</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C38" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 20 天</strong><span>8 周路线：第 39、40 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../06-components-ui5/c39-fiori-ui5-family/"><span class="roadmap-lesson__id">C39</span>SAP Fiori 与 UI5 家族</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C39" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../06-components-ui5/c40-openui5-mvc-project/"><span class="roadmap-lesson__id">C40</span>OpenUI5 入门：MVC 与工程</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C40" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 21 天</strong><span>8 周路线：第 41、42 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../06-components-ui5/c41-model-binding-controls/"><span class="roadmap-lesson__id">C41</span>UI5 Model、绑定与业务控件</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C41" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../06-components-ui5/c42-routing-odata/"><span class="roadmap-lesson__id">C42</span>UI5 路由与 OData 起点</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C42" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 22 天</strong><span>8 周路线：第 43、44 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../06-components-ui5/c43-native-web-components/"><span class="roadmap-lesson__id">C43</span>UI5 Web Components 原生使用</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C43" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../06-components-ui5/c44-ui5-react/"><span class="roadmap-lesson__id">C44</span>UI5 Web Components for React</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L4</span><span data-lesson-status="C44" hidden></span></span></li>
</ul></li>
<li class="roadmap-milestone"><span class="roadmap-lab-chip">L5</span><a href="../labs/l5/">调试与静态交付</a><span>从这里开始 · C45–C48 · 补课起点 C44</span></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 23 天</strong><span>8 周路线：第 45、46 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../07-project/c45-debug-delivery-checks/"><span class="roadmap-lesson__id">C45</span>全链路 Debug 与交付前检查</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L5</span><span data-lesson-status="C45" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../07-project/c46-static-build-pages/"><span class="roadmap-lesson__id">C46</span>静态构建与 GitHub Pages</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L5</span><span data-lesson-status="C46" hidden></span></span></li>
</ul></li>
<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 24 天</strong><span>8 周路线：第 47、48 天</span></p><ul class="roadmap-lessons">
<li class="roadmap-lesson"><a href="../07-project/c47-project-testing-strategy/"><span class="roadmap-lesson__id">C47</span>综合项目与测试选择</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L5</span><span data-lesson-status="C47" hidden></span></span></li>
<li class="roadmap-lesson"><a href="../07-project/c48-review-next-steps/"><span class="roadmap-lesson__id">C48</span>总复盘与后续路线</a><span class="roadmap-lesson__state"><span class="roadmap-lab-chip">L5</span><span data-lesson-status="C48" hidden></span></span></li>
</ul></li>
</ol>

## 源码与练习

必做任务、版本化学习包和恢复说明从 [Lab 入口](../labs/)进入。课程内写明当前目录、改动位置、启动和检查方式；在线阅读无需安装网站构建工具。

[GitHub 的 examples 目录](https://github.com/socoo123/js_web/tree/main/examples)保留逐课机制参考、固定输出与验证记录；旧七阶段工程仅作参考，不作为日常切换目录。

随时查阅：[ES 版本](../reference/es-versions/)、[Java ↔ JS](../reference/java-js/)、[React Hooks](../reference/react-hooks/)、[UI5 家族](../reference/ui5-family/)。
