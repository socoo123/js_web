# 本地库存后端

L5 用的后端由作者提供：只用 Node 24 内置的 `node:http`，不需要安装额外依赖，只监听 `127.0.0.1`。你只写前端；这里的代码可以读，但不需要改。每个接口的请求与响应示例见网站的 [L5 后端接口](https://socoo123.github.io/js_web/labs/api/)。

## 启动与停止

在工作区根目录运行：

```bash
npm run lab -- api
```

终端先打印一行 `库存后端：http://127.0.0.1:8070/api（数据 .lab/server/products.json；Ctrl+C 停止）`，然后一直在前台运行，按 Ctrl+C 停止。如果提示「8070 已被占用：可能已有一个 api 在运行」，说明另一个终端里已经开着后端，用那个就行，或者先把它停掉。

`npm run lab -- dev` 启动的前端会把 `/api` 代理到 8070，所以要开两个终端：一个跑 `api`，一个跑 `dev`。

## 读日志

每个请求打印一行：方法、路径和查询、状态码、耗时。

```text
GET /api/products?stock=low 200 3ms
PATCH /api/products/P004 428 1ms
GET /api/products 500 0ms 注入故障
GET /api/products/P001 - 812ms 注入故障 客户端已断开
```

- 行尾的 `注入故障`：这次响应被 `POST /api/_lab/faults` 注入的故障改变了（返回指定状态，或先等待一段时间）。
- `客户端已断开`：浏览器在服务器回答之前取消了请求，所以状态写成 `-`。
- 状态 500 且错误码是 `INTERNAL` 时，下一行会打印 `  原因：…`。

## 数据文件与恢复

- 数据保存在 `.lab/server/products.json`，格式是 `{"format":1,"products":[…]}`，每个商品带 `version`。第一次启动时从 `data/products.json` 生成。
- 每次修改先写同目录的临时文件再改名替换，写到一半失败时旧文件保持完整，这次修改也不会生效。
- `npm run lab -- api reset` 恢复固定数据（6 个商品，version 全为 1）：后端正在运行时调用 `POST /api/_lab/reset`，同时清空注入的故障；后端没运行时直接改写数据文件。
- 数据文件被改坏（不是合法 JSON，或某个商品不合法）时，后端拒绝启动并提示运行 reset。reset 会把坏文件另存为 `products.json.damaged-<时间>`，不会删除。

## 环境变量

| 变量 | 作用 | 不设置时 |
| --- | --- | --- |
| `LAB_API_PORT` | 后端端口；`api reset` 和 `shell` 的代理也按它找后端 | `8070` |
| `LAB_API_DATA` | 数据文件路径，相对路径按工作区根目录解析 | `.lab/server/products.json` |
| `LAB_API_CORS_ORIGIN` | 允许跨源访问的来源，例如 `http://127.0.0.1:8060` | 不发任何 CORS 头 |

## 为什么不 import 你的 src/core

服务器的字段校验、汇总和搜索规则在 `rules.generated.mjs`，由作者从参考解生成，只读。它不 import 工作区的 `src/core`：你在前端改规则（哪怕改错了），服务器仍按固定契约回答，这样 422 消息和汇总数字才能当作对照。前端和服务器是两个独立运行的程序，真实项目里也不会让服务器直接使用前端那份可以随意修改的代码。

## 代码怎么读

| 文件 | 内容 |
| --- | --- |
| `app.mjs` | 入口：创建和启动服务器、CORS、故障注入、日志 |
| `routes.mjs` | 每个接口做什么，包括 PATCH 的检查顺序 |
| `products.mjs` | 列表的筛选、排序、分页，新建、修改、补货的字段规则 |
| `store.mjs` | 读写数据文件、损坏检查、reset |
| `faults.mjs` | 注入故障的参数检查与排队 |
| `http.mjs` | 读请求体、发 JSON、统一的错误对象 |

## 契约测试

```bash
node --test server/test/
```

每个用例使用临时数据文件和随机端口，不会改动 `.lab/server/products.json`。
