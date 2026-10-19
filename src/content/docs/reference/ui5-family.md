---
title: UI5 家族速查
description: 区分 Fiori、SAPUI5、OpenUI5、原生 UI5 Web Components 与 React 包装库，按数据流和工程入口查找课程。
sidebar:
  order: 4
---

先看工程入口，再找对应文档。名字里都有 UI5，不表示它们共享同一套控件、模型和事件接口。

## 名称与使用入口

| 名称 | 负责什么 | 工程里通常看到什么 | 课程 |
| --- | --- | --- | --- |
| SAP Fiori | 设计系统、体验原则与交互模式 | 页面结构、控件行为与视觉规范 | [家族关系](../../06-components-ui5/c39-fiori-ui5-family/) |
| SAPUI5 | SAP 提供的经典 UI 框架及产品库 | sap-ui-core、XML View、Controller、manifest、Model | [与 OpenUI5 的关系](../../06-components-ui5/c39-fiori-ui5-family/) |
| OpenUI5 | 开源经典 UI5，含共享核心和常用库 | Component、sap.m、JSONModel、UI5 CLI | [工程](../../06-components-ui5/c40-openui5-mvc-project/)、[绑定](../../06-components-ui5/c41-model-binding-controls/)、[路由与 OData](../../06-components-ui5/c42-routing-odata/) |
| UI5 Web Components | 使用浏览器 Custom Elements 的组件 | ui5-input、Shadow DOM、slot、ES 模块 | [原生使用](../../06-components-ui5/c43-native-web-components/) |
| UI5 Web Components for React | React 包装接口、布局与组合组件 | Input、onItemClick、ThemeProvider、React state | [React 库存表单](../../06-components-ui5/c44-ui5-react/) |

SAPUI5 与 OpenUI5 的库范围及使用条件分别核对。经典 UI5 控件如 sap.m.Input，和自定义元素 ui5-input 属于不同技术入口。[SAPUI5/OpenUI5 官方对照](https://ui5.github.io/docs/02_Read-Me-First/sapui5-vs-openui5-5982a97.html)

## 同一库存保存动作的数据流

| 方案 | 草稿 | 校验与保存 | 界面更新 |
| --- | --- | --- | --- |
| Ant Design + React | Form 实例字段 | 应用校验后更新 products | React 传新数据给 Table |
| 经典 OpenUI5 | 独立 JSONModel | Controller 校验后 setProperty | 模型通知绑定控件 |
| 原生 Web Components | 普通 JS 草稿 | 事件处理函数校验与更新数组 | 应用更新 DOM |
| UI5 React | 组件 draft state | 校验后 setProducts | React 新 props 更新包装控件 |

JSONModel 的绑定路径、React state 与组件库 Form 实例是不同接口。ODataModel 则处理服务元数据、请求和缓存；真实读写还依赖服务端权限与部署。[经典 UI5 JSONModel](https://ui5.github.io/docs/04_Essentials/json-model-96804e3.html)

## React 包装层的常用映射

| 原生入口 | React 包装入口 | 值从哪里读 |
| --- | --- | --- |
| ui5-input / ui5-input 事件 | Input / onInput | event.target.value，字符串 |
| ui5-checkbox / ui5-change | CheckBox / onChange | event.target.checked，布尔值 |
| ui5-select / ui5-change | Select / onChange | event.detail.selectedOption.value |
| ui5-list / ui5-item-click | List / onItemClick | event.detail.item 上的业务 id |
| slot="header" | Card 的 header JSX | 页面传入的内容 |
| ui5-form | Form | 布局；提交由原生 form 处理 |

React 19 已能直接使用自定义元素。直接 JSX 标签的事件入口用 on 加完整事件名，如 onui5-input；包装库则提供上表的接口。[React Custom Elements](https://react.dev/reference/react-dom/components#custom-html-elements)、[包装库文档](https://ui5.github.io/webcomponents-react/v2/)

## 包、主题与资源

| 入口 | 职责 |
| --- | --- |
| @ui5/webcomponents | 基础原生控件 |
| @ui5/webcomponents-fiori | Fiori 专用或高层原生组件 |
| @ui5/webcomponents-react | 包装组件及 React 组合组件 |
| @ui5/webcomponents-base / icons | 配置与基础设施 / 图标 |
| ThemeProvider | 接入 React 包装库的样式等基础设施 |
| setTheme / setLanguage | 选择组件主题 / 组件内置语言 |
| Assets.js | 注册主题、翻译等资源加载入口 |

当前 charts 包已弃用，选图表时另查维护情况；不同包的版本兼容以 peerDependencies 为准。[官方包清单与安装说明](https://github.com/UI5/webcomponents-react)

主题和翻译可能按需加载，静态交付包含整个构建目录。组件语言与业务文案分别管理；Pages 上的练习使用静态数据或浏览器内 mock。[资源说明](https://ui5.github.io/webcomponents/docs/advanced/using-assets/)
