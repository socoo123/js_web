# C33 现代 React 19 与更新速查 · 示例

配套正文：[C33](../../src/content/docs/05-react/c33-modern-react-actions.md)。纯 JS 示例不需要第三方包，React 实验复用阶段 4 的锁定依赖。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| form-data.js | `node form-data.js` | 文本字段与缺少字段（补充实验） |
| action-results.js | `node action-results.js` | 复用实际操作工厂，成功/失败结果与不变的来源 |
| promise-identity.js | `node promise-identity.js` | 新 Promise 与固定 Promise 的身份 |
| prediction.js | `node prediction.js` | 手动传递上次结果，理解 Action 参数位置 |

## 运行

- 在仓库根目录执行 `npm run examples -- c33`，固定输出 4/4。
- React：进入 `examples/inventory/04-react`，执行 `npm ci`、`npm run dev -- --host 127.0.0.1`，打开 `/js_web/labs/actions.html`。
- 默认实验：P001 的预览先从 12 变 13，保存/读回成功后缓存变 13；“保存失败”回退；“读回失败”显示写成功与读取错误，恢复后只重新读取。模拟写入只更新当前页面 Map，没有保存 POST。
- 参数 case：simple（非受控重置）、signature / signature-answer（参数位置）、status / status-answer（表单归属）、ref（ref prop）、element（对象 property 与 stock-check 事件）、use（组件外固定 Promise）。切换实验用完整 URL 或刷新。
- Bug 回归：`npm run test:bug -- labs/actions-bugs.test.jsx`，两个错误起点预期失败。按 SignatureFixed 和 StatusScopeFixed 修改对应 Broken 文件后，同一命令通过；仓库保留错误起点。
- 正常回归：`npm run lint`、`npm test`、`npm run build`。新增 tests/actions.test.jsx 的 10 条，共 154 条正常回归；原 C32 组件与 query.html 保留。
- 生产预览：`npm run preview -- --host 127.0.0.1`，打开 `/js_web/#/products/P002?q=鼠标`；Action 补货后详情为 1，列表仍为本地 0、总库存 52；重入复用详情缓存，刷新恢复。labs 不参与生产构建。

## 验证记录

- 2026-10-18 · Node 24.22.0、npm 11.19.1、React 19.3.1、TanStack Query 5.104.4 · macOS arm64：C33 固定输出 4/4，阶段 4 正常回归 154/154，Hooks lint、生产构建通过。依赖/锁文件沿用 C32，没有安装新包。
- 同日 · Chrome 155.0.8059.82（独立 headless）：默认 Action 等待/成功/写失败回退、写成功读回失败及恢复、无保存 POST、切商品/缓存重入/刷新恢复均通过。等待时按钮禁用，乐观预览采用绝对值，未出现缓存更新后再加一次。
- 同日：simple 提交 P002 后收到 P002，非受控输入重置 P001；signature 重现 get is not a function，修复版收到 P001；status 等待时仍空闲且按钮可点，修复版等待时禁用，结束恢复。
- 同日：Sources 对应脚本断点命中，signature 的 formData 实为字符串“尚未提交”；status 在 save 的 setTimeout 处暂停时，页面仍空闲、按钮未禁用。两项 Vitest bug 回归先失败，替换为对应 Fixed 实现后 2/2，通过后恢复教学错误起点。
- 同日：ref prop 焦点进入 input；Custom Element 收到对象 property（没有 product attribute），Shadow DOM 按钮派发 stock-check 后 React 显示 P001；use 实验先显示等待再显示固定商品，未出现未缓存 Promise 警告或页面异常。
- 同日：根目录 lint:lessons（33 课零 error/warning，C33 7943 字符/12 个代码块）、check（零诊断）、build（固定输出 253/253、38 页子路径/资源/折叠区）通过；12 个正文代码块均与实际源文件片段一致。
- 同日：应用生产预览的 hash 深层入口、Action 补货、返回本地列表、缓存重入与刷新恢复通过；静态正文 HTTP 200，禁用 JS 后可阅读并展开 4 个练习折叠区。
- Pages：待推送后核验。
- 未运行：Firefox、Safari、Windows、真实后端、RSC/Server Functions 与版本索引中的其他进阶 API；索引只做官方资料核对。
