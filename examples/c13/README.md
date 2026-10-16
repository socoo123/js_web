# C13 async/await、请求与 Network · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| mock-api.js | 由其他脚本导入 | 固定商品库存与定时器，无 HTTP |
| async-value.js / await-order.js / await-flow.js | `node 文件名.js` | async 返回值、恢复顺序、异常与 finally |
| serial.js / concurrent.js | `node 文件名.js` | 串行启动与 map + all 并发 |
| all-failure.js / settled.js | `node 文件名.js` | all 失败不取消其他操作、逐项保留结果 |
| foreach-broken.js / foreach-fixed.js | `node 文件名.js` | forEach 忽略 Promise，map + all 修复 |
| catch-broken.js / catch-fixed.js | Node / 页面 Console 导入 | try 内 return Promise 与 return await |
| prediction.js | `node prediction.js` | 练习 1：await 普通值 |
| fetch-json.js / fetch-demo.js / fetch.html | 本地网页 | HTTP 检查、JSON 解析、加载/空/错状态 |
| empty.json / invalid.json / wrong-shape.json | 由 fetch.html 读取 | 空数组、故意写坏的 JSON、合法但非数组的 JSON |
| fetch-broken.html / fetch-fixed.html | 本地网页 | 各自加载同名 JS，真实 missing.json 404 与解析错误 |
| search.html / search.js | 本地网页 | AbortController 取消上一次静态文件读取，再本地筛选 |
| ../inventory/02-web/ | 本地网页 | 静态 products.json、页面状态、失败重试、原有筛选编辑 |

## 运行

- 在本目录运行 Node 文件；仓库根目录 `npm run examples -- c13` 核对 12 份固定输出。
- 仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c13/`。
- 项目入口：`http://127.0.0.1:8000/examples/inventory/02-web/`，请求相对路径 `./products.json`。
- fetch.html 可选择全部失败场景；missing.json 故意不存在，invalid.json 故意不完整。
- search.html 的请求仍是静态 JSON，名称筛选在浏览器完成，不模拟服务端搜索协议。
- 打开 Network，禁用缓存并限速，可观察加载与 canceled；Offline 模拟网络错误。

## 验证记录

- 2026-10-16 · Node 24.22.0 / npm 11.19.1 · macOS arm64：固定输出 12/12，全量 153/153；lint 零 error/warning，astro check 零诊断，build 与生产输出检查通过。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：
  - 12 个教学脚本与 Node 固定输出一致；for…of 得到 12、0，all 在第二项先完成时仍返回输入顺序 12、0。
  - 正常请求 6 项、空数组、真实 404、无效 JSON、非数组 JSON 与二次消费响应体均符合正文；加载按钮在全部分支恢复。
  - 404 解析前断点观察 status=404、ok=false；return Promise 错误版仅进入外部 catch，return await 修复版进入内部 catch 并降级为 0；日志拆为独立行后，直接设置行号断点也逐项复核通过。
  - 慢网先显示加载且禁用按钮，Offline 进入失败，恢复后成功；取消搜索产生 canceled，最终显示 P002；空词显示 6 项，无匹配显示空态。
  - 阶段 2：6 种、52 件、26348.00 元；P002 改 3 后为 55 件、26735.00 元；筛选保留编辑，非法库存被拒绝，刷新恢复初始数据。
  - 阶段 2：慢网 aria-busy 与禁用/恢复；404、JSON 语法和结构错误均能重试，错误提示不被筛选覆盖，成功空数据区别于筛选空态。
  - 按项目步骤实际改名 products.json 产生 404、恢复文件后点重试成功；实际写入 [] 显示暂无商品，结束后恢复固定文件。浏览器缓存按正文禁用。
  - 生产预览 /js_web/ 下文章与路线返回 200，16 个代码块、4 个答案折叠区存在；页面无未捕获脚本错误。
- 未运行：DevTools 界面手动点击、Firefox、Safari、真实手机；面板入口按 Chrome 官方文档核对。本课未改站点样式，沿用 C12 周验收。
- 同日：[Pages Actions 38919408362](https://github.com/socoo123/js_web/actions/runs/38919408362) 成功；文章与路线页返回 200，HTML 与本地构建逐字节一致。
