# 库存界面选型

核对日期：2026-10-29。目标：在保留 React 主应用的同时，独立适配六商品表格与库存编辑弹窗。

## 契约

- 输入：repository.list() 的完整商品；core.selectProducts 派生显示行，core.summarize 统计全量。
- 身份：rowKey 与编辑/保存都使用 id；排序后的 index 只表示位置。价格按 priceCents 数值排序。
- 输出：Form 保管字符串草稿；parseStock 通过后合并回完整商品，repository.save 校验并提交。
- 取消：P004 草稿 8 取消后仍为 3，总库存 52；保存 8 后 P004=8、P001=12、总库存 57。
- 边界：空白/负数拒绝，0 合法；名称、分类、价格、tags 原样保留；清空筛选恢复六行。
- 数据：每个 adapter 使用 storage:null 的独立固定数据仓库，刷新回到 6/52；React 主应用的持久化不变。

## 候选与责任

| 方案 | 谁维护什么 | 适配判断 |
| --- | --- | --- |
| Ant Design 完整库 | 上游提供 Table/Form/Modal 与样式，应用接业务与回归 | 首选，允许现成管理界面 |
| Radix Primitives | 上游交互基础，团队负责样式与组合 | 品牌外观优先时评估 |
| shadcn/ui 代码分发 | 团队维护本地组件源码及底层依赖更新 | 愿意接管源码时评估 |

MUI 适合已有 Material 约定，Mantine 是另一套带样式组件与配套 Hooks；Fiori 要求另评估 UI5 Web Components for React，它不是 OpenUI5 的 React 皮肤。Query 管缓存、Table 逻辑工具管行模型、Form 工具管草稿，三者都不代替库存规则。

## 验收与维护

- 可访问性：键盘打开/输入/Esc/保存，标题、label、错误说明可定位；关闭后回到同一编辑按钮。
- 主题：页面与实际打开的浮层同时检查亮/暗；360px 仅表格内部横滚。
- 维护：查看官方 Changelog 中与 Form/Modal 相关的修复，并跟随项目锁文件验证兼容。
- 许可：antd 为 MIT；MUI X Community 与 Pro/Premium 分档；新增包、字体和资源分别核对。

来源：[Ant Design](https://ant.design/components/table/)、[Form](https://ant.design/components/form/)、[主题](https://ant.design/docs/react/customize-theme/)、[Changelog](https://ant.design/changelog/)、[MIT](https://github.com/ant-design/ant-design/blob/master/LICENSE)、[Radix](https://www.radix-ui.com/primitives/docs/overview/introduction)、[shadcn/ui](https://ui.shadcn.com/docs)、[MUI X 许可](https://mui.com/x/introduction/licensing/)。
