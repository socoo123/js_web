# C43 UI5 Web Components 原生使用 · 验证入口

主线在同一 `inventory/adapters/web-components/`，从C42接续，参考解为C43。发行版 `2026.10-v2.4` 的主验收与实际发布状态见 [阶段B](../../labs/records/B.md)。

| 文件/目录 | 用途 |
| --- | --- |
| `labs/reference/steps/C43/files/` | 三个目标文件；正文受控片段同源，不另复制业务实现 |
| `labs/reference/c00/adapters/web-components/` | 新版 C00 已含的休眠机械外壳权威源；不含本课表单答案 |
| `labs/inventory/adapters/web-components/` | 仓库 C00 工作区镜像，与权威源逐字一致 |
| `labs/reference/steps/C43/prelude/manifest.json` | 外壳清单，指向 C00；不再向 C36 注入文件 |
| `labs/inventory/tools/web-components-check.mjs` | 实际工作区浏览器检查；开发/严格静态两种模式 |
| `verify-lab.mjs` | 本地隔离验证；默认显式 C36+本课夹具，非完整课程链 |
| `lab/`、其他原有 JS/CSS/测试 | 历史独立补货案例，保留链接；见 [旧验证记录](legacy-validation.md) |

## 运行

- 学员在工作区按正文执行 `npm run lab -- start C43`、`npm run lab -- dev`、`npm run lab -- check C43`。工具接线与新起点已集成。
- 新版 C00 从第一课就带着按课启用的 adapters。阶段 A 旧版用户保留旧目录，按 L4 升级说明把新版 C00 解压到新目录，取得新版工具/adapters，再将自己的 src/notes 复制过去；保留新版 package/lock/tools/adapters，不用 C00 的 src 覆盖 React 成果。
- 作者在仓库根执行 `node examples/c43/verify-lab.mjs --c00`：验证 C00 默认原生页未加载未来组件；同时核对六个外壳文件及镜像。
- `node examples/c43/verify-lab.mjs --starter`：真实 C36 已自然继承新版 C00 的机械外壳，确认没有预装 UI5 表单；脚本不额外注入外壳。
- `node examples/c43/verify-lab.mjs`：C36+C43 答案的局部夹具，明确缺少 C37–C42，不记作连续跟做完成。
- `LAB_BASE=/js_web/demos/web-components/ node examples/c43/verify-lab.mjs --static`：生产构建、无 fallback 服务器、子路径浏览器检查。
- 最终接续补验用 `LAB_C43_WORKSPACE=/绝对/真实C43目录 node examples/c43/verify-lab.mjs [--static]`；不组装、不覆盖指定目录源码。
- 实际工作区也能直接运行 `node tools/web-components-check.mjs [--static]`；`--only=cancel/save/boundaries/properties-slots/resources` 只跑对应场景。默认随机空闲端口，`LAB_C43_PORT` 可指定。
- 根目录 `npm run examples -- c43` 继续核对原有三个固定输出例子；不能代替本课表单检查。

## 2026-10-29 本路实际验证

- macOS arm64，Node 24.22.0，Chromium 156.0.8078.4 headless，Playwright 1.64.1，Vite 8.3.4；UI5 Web Components/base 2.27.2，theming-base-content 11.36.4。未重新 npm ci，未改依赖源码；浏览器工具的 Vite 缓存在夹具 .lab 内。站点 check 的共享缓存例外见下。
- 主审修订后 `--c00` 1/1：默认卡片 P001/12、补货待接通、6/52；没有 parseStock、UI5 注册或 adapter 请求，360px 无溢出。六文件权威源/镜像逐字一致。
- 修订后 `--starter` 1/1：六件、52；点击编辑只有待接线提示，无 ui5-input 与库存表单答案，外壳从 C00 自然继承。
- 开发 5/5、严格静态 `/js_web/demos/web-components/` 5/5：P004 改 8 取消仍3/52，保存8后8/57，P001仍12，名称/分类/价格/tags 全保留；清空筛选恢复六件。
- 空白/空格/负数/小数/单位文本/超上限均禁用保存且显示错误；0 可保存，汇总49；刷新重置固定数据。键盘打开→输入→取消/保存、焦点返回、360px 无整页溢出通过。
- 真实 UI5 事件、disabled 布尔属性、valueStateMessage 命名槽、Shadow DOM 查询与 CSS part 边界通过。深色参数、中文翻译与本地 woff2 成功；切 English 后清除图标为 Clear，保存仍中文。
- 静态检查实际根/缺文件返回404；所有请求在部署子路径内、无外部 CDN、无资源/Console/pageerror。FontFace.css 打包本地字体，默认 CDN 字体关闭。
- 首轮局部夹具接入共享 check 建议行后为85条core + 5组浏览器通过。修订后新夹具 `node tools/check.mjs C43` 85条通过，浏览器另由上述命令5/5；未当成真实C42接续。29个src文件及3个C43答案文件与首轮逐字节一致。
- 主错误先红后绿：将实际 editor.js 的 property 赋值改成 `setAttribute("disabled", String(busy))`，`--only=save` 报 expected enabled / received disabled；恢复后1/1。将实际监听名改成 ui5Input，`--only=cancel` 报草稿预期8实为3；恢复后全部5/5。
- `npm run examples -- c43` 首轮3/3；修订后 `npm run lint:lessons` 48课、0 error/0 warning，C43为6196字/13块（含任务卡与8个受控片段；本地共享元数据夹具）。
- 首轮 `npm run check` 33文件、0诊断；本轮未再次运行。修订后 `node delivery/verify-anchors.mjs` 20个旧节锚点静态匹配。首轮Astro check 默认向依赖软链目标的 `.vite/.astro` 写了生成缓存；未编辑依赖源码，未删除/回滚共享缓存。最终站点门禁由主 agent 重建缓存后执行。
- 真实v2.4接续补验：从主agent提供的C42副本只应用本课三文件，共享check85条+开发5/5、严格静态5/5；最终C44副本也实际85条+开发5/5、严格静态5/5。29个src文件未改，26个C43运行输入在两者哈希一致。无必要实现修复，见 [B记录](../../labs/records/B.md)（作者接续回归，非独立正文验收）。
- 主agent公开C40→C41→C42后仅按本课正文完成三文件：85条、开发5/5、布尔attribute故障先红、修复后静态5/5通过；最终门禁/发行见B记录。未运行：DevTools手动点选与断点、屏幕阅读器、Firefox/Safari/Windows、真实SAP服务。
