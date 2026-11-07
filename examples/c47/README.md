# C47 综合项目与测试选择 · 示例

## 当前 Lab 主线

- 发行版 `2026.10-v2.5`，C46→C47，保留当前 `src/react`。新增regression.test.jsx与notes/test-plan.md，App设置HashRouter useTransitions=false。主独立跟做、最终补验与发布状态见 [阶段C](../../labs/records/C.md)。
- 工作区 `npm run lab -- check C47`：两条新增回归+已有inventory/review共9条Vitest，6组严格浏览器场景；四项风险计入已有失败重试，不重复同一用例。
- 作者入口：根 `LAB_DELIVERY_PORT=19102 node scripts/verify-delivery-lab.mjs`；从真实C44连续装配，不是独立正文跟做。
- 2026-10-29 · Node 24.22.0/npm 11.19.1/macOS arm64/Chromium 156.0.8078.4：9/9、6组通过；非法快照先setItem再校验时throw仍绿、旧原文比较红，恢复顺序后绿。
- 生产真实键盘逐字P004，在默认HashRouter下多轮实测出现4/P4/04；同步更新后完整P004并可清空/刷新。未用延迟或整串fill代替。
- 禁用真实ProductDetail重试按钮的refetch，既有RTL在P002恢复断言红；还原后绿。Map/独立repository/独立浏览器隔离数据，不触碰个人localStorage。
- `npm run examples -- c47` 3/3（旧固定输出仍有效参考）。未运行：真机、输入法、屏幕阅读器、Firefox/Safari、Windows；最终整合视觉和发布由主 agent 负责。

## 2026.11-v4.0：接上本地后端

上面的记录属于浏览器内 mock 时期（2026.10-v2.5），不能当作下面新内容的证据。

- 正文改动：页首运行环境加「本地后端」；风险由四项变为五项，与 `v4-l5app` `af357e9` 的 C47 参考 `notes/test-plan.md` 一致，新增「后端拒绝时不知道改哪里」，「失败后不能重试」加列表 500，「路径、键盘、刷新」一行并入真实后端写入；导入块加 `vi`、`within`、`ApiError`；`#请求替身放在哪里决定测到了什么` 下新增 422、409、列表 500 三条 RTL；第 4 节新增 `tests/e2e/api.spec.js` 与 `check C47` 用临时后端的说明；第 5 节改为 API 模式写入后端、损坏恢复在 mock 模式检查；Java 对照、练习、提示、参考答案、项目进度、小结与自测随之调整。原有标题、锚点、主错误（先 setItem 再校验）、连续输入与 HashRouter 内容、6/52/2634800 与 57 未变。
- 新增的四段测试代码逐字取自 `v4-l5app` `af357e9` 的 `tests/react/regression.test.jsx` 与 `tests/e2e/api.spec.js`（e2e 去掉了注释与 region 标记）；逐行比对，正文每个非空代码行都出现在参考文件里。409 测试的消息「版本已变化」与 422 的「商品字段不合法」是参考测试里替身的文字，不是后端真实消息。
- 2026-11-07 · macOS 26.3.1 arm64 · Node 24.22.0：在临时数据文件上实际请求后端，恢复固定数据后 `PATCH /api/products/P004`（`If-Match: "1"`，`{"stock":8}`）得 200、`ETag: "2"`，全部商品 6 种、57 件、2784300 分；再用 `If-Match: "1"` 得 409，`current.stock` 为 8、`version` 为 2。这与 api.spec.js 断言的数字一致。
- 2026-11-07 同一环境，参考实现实跑（拼装方式见 C45 记录，`v4-l5app` `4818e74`，C45–C47 参考步骤，与 `af357e9` 相同）：`LAB_DELIVERY_PORT=8276 LAB_E2E_PORT=8277 node tools/lab.mjs check C47` 中 Vitest 3 个文件 12 条通过（含上面三条后端错误测试），10 组浏览器检查通过（state、editor、fields、retry、slow、static、search、conflict、storage，以及 `tests/e2e/api.spec.js` 在临时数据后端上 1 passed），85 条工作文件检查通过。因此页首恢复「示例已运行验证」，去掉了两处「未运行验证」。
- 未运行：带代理的严格预览上的手工键盘与窄屏检查（正文写成学员自己做的步骤）。

## 第一版参考（非 Lab 主线）

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| snapshot-boundary.js | `node snapshot-boundary.js` | 非法库存拒绝写入，旧快照保留 |
| reducer-roundtrip.js | `node reducer-roundtrip.js` | 编辑、序列化、恢复；55 件、2634887 分 |
| prediction.js | `node prediction.js` | JSON 语法、业务字段与合法空集合 |
| ../inventory/04-react/tests/final-core.test.jsx | `npm test -- tests/final-core.test.jsx` | 旧快照保护 UT；reducer 与恢复业务集成 |
| ../inventory/04-react/tests/final-workflows.test.jsx | `npm test -- tests/final-workflows.test.jsx` | 非法价格修正/恢复；真实响应校验与用户重试 |
| ../inventory/04-react/e2e/pages.spec.js | `npm run test:e2e:pages` | C46 路径检查 + C47 键盘编辑、刷新与详情 |

## 运行

- 仓库根：`npm run examples -- c47`，自动核对三个 `.expected.txt`。
- 阶段 4：`npm ci`、`npm run lint`、`npm test`、`npm run test:e2e:pages`；浏览器使用独立后台 Chromium。
- 手工跟做：阶段 4 运行 `npm run build`、`npm run preview:pages`，打开 `http://127.0.0.1:4179/js_web/#/products`；缺浏览器时执行 `npx playwright install chromium`。专用静态服务器与 E2E 共用端口，结束手动预览后再跑 E2E。
- 原始数据：6 种、52 件、2634800 分。P002 改为库存 3、价格 0.29 元后：55 件、2634887 分；本地详情与模拟远端副本继续分开管理。
- 五项风险计划见正文第 1 节及阶段 4 README 的 C47 节；两个核心用例、两个 RTL 用例、一个新增 E2E，复用现有工具与锁，不增加依赖或 D2。

## 第一版验证记录（历史，非本轮源码证据）

- 2026-10-19 · macOS arm64 · Node 24.21.0 / npm 11.7.0：三个固定输出 3/3；阶段 4 Hooks lint 与全部 199/199 回归通过（原 195 + 新增 4）。
- Chromium 156.0.8078.4：严格静态产物两条 E2E 2/2（原 1 + 新增 1）及原生产冒烟 2/2 通过。新增流程只用键盘完成搜索、表单、保存快照、刷新、详情与返回；保持“鼠标”、3 件/0.29 元、55 件/26348.87 元，mock 仍为 0 件/129.00 元。
- 连续输入回归首次失败：期望“鼠标”，实值“标”；真实生产入口 HashRouter 默认 transition 导致受控 URL 输入回退。main.jsx 改 useTransitions=false 后通过，StrictMode 保留；无加输入延迟或改整串 fill 回避。
- 快照故障实验：将写入顺序改为先 setItem 再校验，首条核心回归在旧记录比较处如期失败；恢复实现后全量通过。错误分支的异常断言仍通过，说明新增副作用断言有效。
- 按正文浏览器步骤复检：360px 展开表单无整体横溢，库存留空提交后错误说明关联、焦点轮廓和保存按钮可达；修正为 3/0.29 保存后标题聚焦。保存快照后补至 4 未再保存，刷新恢复 3；坏快照“{”回退到 52 件且原文保留，清除并刷新后 key 不存在。1280px 六卡片可见，无页面异常；截图经目视检查。
- 网站 lint 47 课零 error/warning，Astro check 零诊断，build 和固定输出 296/296、54 个 HTML 路径检查通过。本地新课/刷新 200、六折叠区、上一课导航、路线 47/48 与禁用 JS 阅读通过；课程 360/1280px 无页面横溢。
- Pages [run 39253230340](https://github.com/socoo123/js_web/actions/runs/39253230340) 构建与部署成功（提交 7042de6）；新文章/路线 HTTP 200、线上浏览器深层刷新、六折叠区、上一课导航、路线 47/48、360/1280px 与禁用 JS 阅读复检通过。
- 未运行：真实手机/输入法/软键盘、Firefox/Safari、Windows；DevTools 界面点击路径按文档，浏览器复检使用独立后台实例。
