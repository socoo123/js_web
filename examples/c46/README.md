# C46 静态构建与 GitHub Pages · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| build-boundary.js | `node build-boundary.js` | Node 读取固定数据；6 种、52 件、document 未定义 |
| paths.js | `node paths.js` | 域名根、页面相对路径、应用 base |
| routes.js | `node routes.js` | HTTP pathname 与浏览器 hash |
| prediction.js | `node prediction.js` | 练习 1 的四个 URL |
| deploy-react.yml | 个人仓库参考 | 发布阶段 4 库存产物，未在个人仓库实际运行 |
| ../inventory/04-react/scripts/check-pages.mjs | `npm run check:pages` | 检查已有产物的入口资源、六份数据和生产边界 |
| ../inventory/04-react/scripts/serve-pages.mjs | `npm run preview:pages` | 严格按文件提供 /js_web/；不存在时 404 |

## 运行

- 仓库根执行 `npm run examples -- c46` 自动核对四个固定输出。
- 阶段 4 目录执行 `npm ci`、`npm run build`、`npm run check:pages`、`npm run preview:pages`；打开 `http://127.0.0.1:4179/js_web/#/products/P002`。
- 阶段 4 执行 `npm run test:e2e:pages`，自动构建、检查产物、启动严格服务器并运行浏览器回归；使用独立后台 Chromium。
- 错误 base 实验：阶段目录 `npm run build -- --base=/`，运行 `npm run check:pages` 应失败；启动严格预览时入口资源 404。恢复 `npm run build` 后重新检查、预览。
- `serve-pages.mjs` 可传端口及产物目录：`node scripts/serve-pages.mjs 4180 /absolute/path/to/dist`。仅供本地路径验收，不模拟 Pages 的全部缓存、CDN 或权限行为。
- 课程站在仓库根构建后 `npm run preview -- --host 127.0.0.1 --port 8746 --ignore-lock`，打开 `/js_web/07-project/c46-static-build-pages/`，独立于库存产物。
- deploy-react.yml 保留整仓库路径，需放入个人仓库 .github/workflows 并替换原课程发布工作流；只保留一个 Pages 部署。仓库名、Vite base 和检查脚本约定须一致。个人云端发布未运行，正文已标注。

## 验证记录

- 2026-10-19 · macOS arm64 · Node 24.19.0 / npm 11.7.0：四个固定输出 4/4 通过；阶段 4 构建与产物检查通过，专用严格静态浏览器回归 1/1 通过。
- Chromium：直接进入 hash P002、刷新、返回六件商品、总库存 52、按需分类报表通过；无页面异常或失败资源。正确 JSON 为 200/application/json、库存 0；无 base 的数据和干净详情路径均为 404。
- 错误 base 实验：构建 --base=/ 后，产物检查按预期失败（缺少 base 正确的 JS 入口）；严格预览首页 HTTP 200，但 /assets/ 下 JS/CSS 各 404，页面无库存标题。恢复正常 build 后产物检查与专用 E2E 通过。
- 阶段 4 Hooks lint、195/195 业务回归、严格静态 E2E 1/1 与原生产冒烟 2/2 通过；按需报表可加载。根站点 lint 46 课零 error/warning、Astro check 零诊断、build 与固定输出 293/293、53 个 HTML 路径检查通过。
- 本地课程深层页及刷新 HTTP 200；4 个提示/答案折叠区、C45 上一页、路线 46/48、禁用 JS 阅读通过。C16/C18 加载同一共用 SVG，C46 部署图的 hash/中文/连线已检查；本课 360/1280px 亮暗无页面横向溢出。
- Pages 部署核验待完成。
- 未运行：个人库存仓库的 Actions 发布、GitHub Settings 人工点击、Firefox/Safari、Windows 和真实手机。正式课程仓库的 Pages 发布另行记录。
