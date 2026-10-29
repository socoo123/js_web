# C21 React 来由、JSX 与第一个组件 · 示例

正文：[C21](../../src/content/docs/05-react/c21-react-jsx-components.mdx)。主线在同一库存工作区，旧 examples 仅作机制参考。

| 材料 | 入口 | 用途 |
| --- | --- | --- |
| view-data.js、prediction.js | 仓库根目录 `npm run examples -- c21` | 2 个固定输出 |
| dom.html、dom.js | 保留的原生对照 | 历史参考，本批未重跑 |
| [C21 steps](../../labs/reference/steps/C21/) | C20 → C21 | 新 HTML/JSX 入口与六张卡片 |
| [c21.test.jsx](../../labs/inventory/tools/c21.test.jsx) | 当前工作区组件回归 | 实际 App、卡片内容与 children |

## Lab 与运行

- 发行版 `2026.10-v2.3`，L3 起点 C20；下载目录 `downloads/inventory/2026.10-v2.3/`；主验收与上线证据见 [阶段 A](../../labs/records/A.md)。
- 在自己的 `inventory/` 按正文创建 `src/react` 四个文件，执行 `npm run lab -- start C21`、`npm run lab -- dev`、`npm run lab -- check C21`。
- 本课专用回归：工作区执行 `node node_modules/vitest/vitest.mjs run --config tools/foundations.config.mjs tools/c21.test.jsx`。
- 阶段汇总与发布状态见 [A 记录](../../labs/records/A.md)；本路原始证据位于该记录所列隔离副本的 `delivery/agent-1.md`。

## 本次验证 · 2026-10-29

- macOS arm64；Node 24.22.0/npm 11.19.1；React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.4。使用已提供依赖的只读链接，未重新安装。
- `npm run examples -- c21` 2/2；组件回归 2/2；`lab check C21` 85 条工作文件检查与六卡浏览器检查通过。
- 小写 `<productCard />` 注入实际 App：组件回归失败；浏览器为 0 article、6 个未知标签并有 Console 大小写提示。改回 ProductCard 后原测试通过、六卡恢复。
- 独立 headless Chromium 156.0.8078.4：六商品、P002=0/129.00；JSX helper 与 source map 响应；title 字面量/表达式；Fragment、false/null/0、8px；可选库存价值练习 4788.00/0.00 均实际执行。
- 正文 createElement 命令在工作区 Node 执行，输出 `h2 机械键盘`、`undefined`。四份主体源码与正文片段逐字核对一致。
- 注册表建议镜像中的 C21 lint：4762/8000 字、9 块、零 error/warning；原有 20 个标题/显式锚点保留。
- 首次返修：库存价值移为折叠可选题，必做与正式终点均为六卡；定点浏览器复核六卡及模块响应的 article/jsx 通过，不再要求搜索不存在的 className。
- QA 从真实 C20 连续参考链组装 C21 验证；这是参考解/行为回归，不是主 agent 的独立读者抽验。
- 本路未运行：重新 npm ci、旧 dom.html、手动 DevTools UI 点击、Firefox/Safari/Windows。主集成的16快照、安装、构建及视觉/发布记录见阶段 A。

## 历史

2026-10-17 旧独立阶段 4 已发布：[Pages 39009250317](https://github.com/socoo123/js_web/actions/runs/39009250317)。旧工程、例子和包均保留；它的运行记录不算本次迁移验收。
