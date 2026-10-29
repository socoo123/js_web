# 库存界面的 UI5 路线

- Fiori 是设计系统；任务仍是筛选 P004、打开独立草稿、取消不写入、保存只改 P004。
- SAPUI5/OpenUI5 是经典 UI5 框架，共享核心与常用库；具体库范围和许可需要分别核对。
- UI5 Web Components 是自定义元素；React 包装库连接这些元素，不包装 OpenUI5 MVC。
- 接手 XML View、manifest 和 UI5 Model 的工程沿用经典路线；本练习用 OpenUI5 的 sap.m。
- 保留 React 应用时可选 Web Components 或其 React 包装；无需迁入 JSONModel。
- 业务规则只来自 src/core；OpenUI5 通过已提供的构建桥调用同一规则。
- 页面内存与有限 V2 mock 适用于静态教学；真实鉴权、权限与持久化需要服务端。
