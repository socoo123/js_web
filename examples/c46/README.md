# C46 静态构建与 GitHub Pages · 示例

## 当前 Lab 主线

- 发行版 `2026.10-v2.5`，C45→C46；只改 `vite.config.js` 与 `notes/delivery.md`，保留当前React应用/四个adapter。主独立跟做与最终发布状态见 [阶段C](../../labs/records/C.md)。
- 工作区：`npm run lab -- start C46`、`npm run lab -- build`；产物 `dist/src-react`，base `/js_web/demos/inventory/`。
- 只读严格预览：`LAB_STATIC_ROOT=dist/src-react node tools/static-react-server.mjs`，默认8068；`LAB_E2E_PORT`可换端口。**该模式跳过build和base覆写**，不做SPA fallback；未设变量仍是旧C35默认构建冒烟。
- `npm run lab -- check C46` 读当前配置先build，再用同一个静态服务器函数验收。结束手工预览再检查，避免端口冲突。作者自动回归：根 `LAB_DELIVERY_PORT=19102 node scripts/verify-delivery-lab.mjs`。
- 2026-10-29 · Node 24.22.0/npm 11.19.1/macOS arm64/Chromium 156.0.8078.4：85条核心断言、5组浏览器场景通过；嵌套入口/JSON/map/按需报表、P004hash刷新、缺失JS和干净详情路径404通过。
- 真正将当前配置base改 `/` 后build，产物检查在 `/assets/index-….js` 前缀处失败；恢复配置并重新build后绿。服务器没有静默重建成正确base。
- 只读CLI分别服务上述错误/正确dist，入口实际404/200，服务前后全部7文件SHA未变；未设LAB_STATIC_ROOT的旧C35默认Playwright回归1/1通过。最终公开CLI连续start/check在19104端口完成。
- `npm run examples -- c46` 5/5，新增delivery-paths.js对应当前正文。deploy-react.yml已改为**个人完整Lab工作区在仓库根**的模板，上传site/demos/inventory结构；Actions官方tag SHA于2026-10-29核对，但个人云端发布未执行。
- 2026-10-30 · 个人模板权限定点修正：锁定configure-pages用默认GITHUB_TOKEN读取Pages配置，build显式授予contents:read/pages:read，deploy原权限不变。本次只核对官方源码/权限表并检查本地YAML与最小差异；个人Actions/Pages云端仍未执行，不能记作发布通过。
- 未运行：个人GitHub Settings/Actions/线上、Windows、Firefox/Safari、真机；本地成功不是在线演示已部署。课程最终发布由主 agent 负责。

## 第一版参考（非 Lab 主线）

下表除已更新的个人模板外保留第一版脚本；旧阶段工程的路径不作为本轮必做步骤。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| build-boundary.js | `node build-boundary.js` | Node 读取固定数据；6 种、52 件、document 未定义 |
| paths.js | `node paths.js` | 域名根、页面相对路径、应用 base |
| routes.js | `node routes.js` | HTTP pathname 与浏览器 hash |
| prediction.js | `node prediction.js` | 练习 1 的四个 URL |
| deploy-react.yml | 个人仓库参考 | 当前完整Lab工作区模板，个人云端未运行 |
| ../inventory/04-react/scripts/check-pages.mjs | `npm run check:pages` | 检查已有产物的入口资源、六份数据和生产边界 |
| ../inventory/04-react/scripts/serve-pages.mjs | `npm run preview:pages` | 严格按文件提供 /js_web/；不存在时 404 |

## 运行

- 仓库根执行 `npm run examples -- c46` 自动核对五个固定输出（含当前Lab的路径预测）。
- 阶段 4 目录执行 `npm ci`、`npm run build`、`npm run check:pages`、`npm run preview:pages`；打开 `http://127.0.0.1:4179/js_web/#/products/P002`。
- 阶段 4 执行 `npm run test:e2e:pages`，自动构建、检查产物、启动严格服务器并运行浏览器回归；使用独立后台 Chromium。
- 错误 base 实验：阶段目录 `npm run build -- --base=/`，运行 `npm run check:pages` 应失败；启动严格预览时入口资源 404。恢复 `npm run build` 后重新检查、预览。
- `serve-pages.mjs` 可传端口及产物目录：`node scripts/serve-pages.mjs 4180 /absolute/path/to/dist`。仅供本地路径验收，不模拟 Pages 的全部缓存、CDN 或权限行为。
- 课程站在仓库根构建后 `npm run preview -- --host 127.0.0.1 --port 8746 --ignore-lock`，打开 `/js_web/07-project/c46-static-build-pages/`，独立于库存产物。
- 当前deploy-react.yml的使用方式见上方“当前Lab主线”，不再使用第一版阶段路径；个人云端发布未运行，正文已标注。

## 第一版验证记录（历史，非本轮源码证据）

- 2026-10-19 · macOS arm64 · Node 24.19.0 / npm 11.7.0：四个固定输出 4/4 通过；阶段 4 构建与产物检查通过，专用严格静态浏览器回归 1/1 通过。
- Chromium：直接进入 hash P002、刷新、返回六件商品、总库存 52、按需分类报表通过；无页面异常或失败资源。正确 JSON 为 200/application/json、库存 0；无 base 的数据和干净详情路径均为 404。
- 错误 base 实验：构建 --base=/ 后，产物检查按预期失败（缺少 base 正确的 JS 入口）；严格预览首页 HTTP 200，但 /assets/ 下 JS/CSS 各 404，页面无库存标题。恢复正常 build 后产物检查与专用 E2E 通过。
- 阶段 4 Hooks lint、195/195 业务回归、严格静态 E2E 1/1 与原生产冒烟 2/2 通过；按需报表可加载。根站点 lint 46 课零 error/warning、Astro check 零诊断、build 与固定输出 293/293、53 个 HTML 路径检查通过。
- 本地课程深层页及刷新 HTTP 200；4 个提示/答案折叠区、C45 上一页、路线 46/48、禁用 JS 阅读通过。C16/C18 加载同一共用 SVG，C46 部署图的 hash/中文/连线已检查；本课 360/1280px 亮暗无页面横向溢出。
- Pages [run 39243733535](https://github.com/socoo123/js_web/actions/runs/39243733535) 构建与部署成功（提交 7f680c9）；新文章与路线页 HTTP 200，四个折叠区与 D2 引用存在，路线显示 46/48。线上浏览器复检深层刷新、共用图、亮暗宽度和禁用 JS 阅读通过；个人库存部署模板仍未执行。
- 未运行：个人库存仓库的 Actions 发布、GitHub Settings 人工点击、Firefox/Safari、Windows 和真实手机。课程仓库实际部署见上一条。
