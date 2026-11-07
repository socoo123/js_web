---
title: L5 后端接口
description: 本地库存后端的启动与恢复、日志、通用约定、每个接口的请求与响应、故障注入和常见失败。
---

L5 的工作区自带作者写好的本地后端 `server/`。它只用 Node 24 内置模块，只监听本机 `127.0.0.1:8070`，数据存在工作区的 `.lab/server/products.json`。你只写前端，这一页是写前端时查的接口说明；任务步骤在 [L5 主页](/js_web/labs/l5/)。

下面的响应和终端输出都来自实际运行。每一节的请求都从固定数据开始，同一节里按顺序发出。为了好读，长 JSON 换行缩进，响应头只留与本页有关的几行，省略了 `Date`、`Connection` 等。

## 启动、停止与恢复数据

在库存工作区执行，终端保持打开：

```sh
npm run lab -- api
```

```text
库存后端：http://127.0.0.1:8070/api（数据 .lab/server/products.json；Ctrl+C 停止）
```

- **停止**：在这个终端按 Ctrl+C，终端打印「库存后端已停止。」
- **第一次启动**：数据文件不存在时，后端从 `data/products.json` 生成它，每个商品的 `version` 是 1。之后的修改都写进这份文件，重启后还在。
- **恢复固定数据**：在另一个终端运行 `npm run lab -- api reset`。页面里的「恢复固定数据」按钮做的是同一件事。
- **端口被占用**：启动失败并提示「8070 已被占用：可能已有一个 api 在运行。先在那个终端按 Ctrl+C 停止，或设置 LAB_API_PORT 换端口。」
- **工作区里没有 `server/`**：提示「本地后端从 2026.11-v4.0 的 C44 起提供；按 Lab 总览的升级说明取得新工作区。」，处理见 [L5 的升级说明](/js_web/labs/l5/#从旧发行版升级)。

`api reset` 先看 8070 上有没有后端在跑，两种情况的输出不同：

```text
已通过运行中的后端（127.0.0.1:8070）恢复固定数据，并清空注入的故障。
```

```text
后端没有运行，已离线恢复固定数据：.lab/server/products.json（6 个商品，version 全为 1）。
```

三个环境变量写在命令前面，只影响这一次启动：

| 变量 | 作用 | 例子 |
| --- | --- | --- |
| `LAB_API_PORT` | 换端口，默认 8070 | `LAB_API_PORT=8071 npm run lab -- api` |
| `LAB_API_DATA` | 换一个数据文件，用于独立实验 | `LAB_API_DATA=/tmp/try.json npm run lab -- api` |
| `LAB_API_CORS_ORIGIN` | 放行一个来源的跨源请求，见 [CORS 与代理](#cors-与代理) | `LAB_API_CORS_ORIGIN=http://127.0.0.1:8060 npm run lab -- api` |

换了端口，`vite.config.js` 里的代理目标要改成同一个端口；`api reset` 和 `shell` 也要带上同样的 `LAB_API_PORT`。设置了 `LAB_API_CORS_ORIGIN` 时，启动行下面多一行「CORS 只放行来源 http://127.0.0.1:8060」。

**数据文件损坏时拒绝启动。** 文件不是合法 JSON，或任何一个商品不合规则，后端不会带着坏数据运行，命令以退出码 1 结束：

```text
数据文件损坏：.lab/server/products.json（不是合法 JSON：Expected ',' or '}' after property value in JSON at position 37 (line 2 column 1)）。运行 npm run lab -- api reset 恢复固定数据；损坏文件会另存，不会删除。
```

这时运行 `npm run lab -- api reset`，它先把坏文件复制一份带时间的副本，再写入固定数据：

```text
后端没有运行，已离线恢复固定数据：.lab/server/products.json（6 个商品，version 全为 1）。
原文件已损坏，另存为 .lab/server/products.json.damaged-2026-11-07T071820.029Z，没有删除。
```

和 C14 的本地快照一样，先保留现场，再恢复。

## 读懂 api 终端

每个请求结束时打印一行：`方法 路径?查询 状态 耗时`。

```text
GET /api/products?stock=low 200 0ms
PATCH /api/products/P004 409 0ms
POST /api/_lab/faults 204 0ms
GET /api/products?pageSize=1 500 0ms 注入故障
GET /api/products/P001 200 1504ms 注入故障
GET /api/products/P001 - 204ms 注入故障 客户端已断开
```

- 前端每个 `/api` 请求在 Network 里有一行，在这里也应有一行。Network 有、终端没有，说明请求没到后端，例如被 CORS 预检拦下或代理目标写错。
- 行尾的「注入故障」表示这次响应由[故障注入](#故障注入)决定。参考实现保存商品时会先注入 300ms 延迟，让「正在保存…」看得见，所以每次保存前多一行 `POST /api/_lab/faults 204`，PATCH 那一行也带「注入故障」。
- 状态写成 `-` 并带「客户端已断开」：浏览器在响应前取消了请求，例如 `AbortController` 生效。
- 服务器内部出错（500 `INTERNAL`）时，下一行以「原因：」开头写出具体原因。

## 通用约定

### JSON 与错误体

- 只处理 `/api/` 开头的路径，其他路径一律 404。
- 响应体都是 JSON，`Content-Type: application/json; charset=utf-8`，`Cache-Control: no-store`。204 没有响应体。
- 请求体也必须是 JSON 对象，最大 64KB。发送时带 `Content-Type: application/json`。

所有失败都用同一种错误体。`message` 是给人看的中文；`code` 给程序判断；`fields` 和 `current` 只在需要时出现：

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "字段校验失败，见 fields",
    "fields": { "id": "编号不能修改", "stock": "库存必须是 0–99999 的整数" }
  }
}
```

`fields` 的键是商品字段名（`name`、`category`、`stock`、`priceCents`、`tags`），另有 `id`、`quantity` 和列表的查询参数名；值和前端 `validateProduct` 的消息一致。表单拿到 422 时，按键把消息放到对应输入框旁。

### 错误码

| 状态 | `code` | 什么时候 | 附带 |
| --- | --- | --- | --- |
| 400 | `BAD_JSON` | 请求体不是合法 JSON，或不是对象 | — |
| 400 | `BAD_QUERY` | 列表的查询参数取值非法 | `fields`：哪个参数 |
| 404 | `NOT_FOUND` | 商品不存在，或没有这个接口 | — |
| 405 | `METHOD_NOT_ALLOWED` | 路径存在，方法不支持 | 响应头 `Allow` |
| 409 | `CONFLICT` | `If-Match` 与服务器上的 version 不一致 | `current`：服务器上的商品 |
| 413 | `PAYLOAD_TOO_LARGE` | 请求体超过 64KB | — |
| 422 | `VALIDATION` | 字段不合规则 | `fields`：字段名 → 消息 |
| 428 | `PRECONDITION_REQUIRED` | `PATCH` 没带 `If-Match` | — |
| 500 | `INTERNAL` | 服务器内部错误，例如写数据文件失败（这次修改不生效） | — |
| 注入时指定 | `FAULT` | 故障注入的响应（没有自定义 `body` 时） | — |

状态码的含义见 [MDN：HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status)。前端只要 `response.ok` 为 false，就读错误体并抛错，不要把错误体当成商品。

### version 与 If-Match

每个商品都带 `version`：新建时是 1，每次修改或补货加 1。读取单个商品、新建、修改、补货的响应头里有 `ETag: "<version>"`，和响应体里的 `version` 相同。

修改商品必须带请求头 `If-Match`，值是你读到的 version，写成 `"3"` 或 `3` 都可以。服务器上的 version 已经变了，就返回 409，`current` 里是服务器当前的商品；你的修改不会覆盖别人的修改。两个标签页同时编辑 P004 就是这个场景。机制见 [MDN：If-Match](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/If-Match) 与 [ETag](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/ETag)。

### CORS 与代理

开发页面在 `http://127.0.0.1:8060`，后端在 8070。端口不同就是不同的源，浏览器只在响应带了允许的 CORS 头时才让脚本读取。后端**默认不发任何 CORS 头**，所以前端用相对地址 `/api`，由代理转发：

| 场景 | 谁转发 `/api` | 配置 |
| --- | --- | --- |
| 开发（`npm run lab -- dev`） | Vite 开发服务器 | `vite.config.js`：`server: { proxy: { "/api": "http://127.0.0.1:8070" } }` |
| 严格静态预览（C46） | `tools/static-react-server.mjs` | 转给 `LAB_API_ORIGIN`，默认 `http://127.0.0.1:8070`；后端没启动时返回 502 |
| 空白前端壳（`npm run lab -- shell`） | Vite 开发服务器，端口 8061 | 已配置好 |

浏览器看到的始终是同源请求。curl 不是浏览器，不受 CORS 限制，所以下面的 curl 例子可以直接请求 8070。

想观察 CORS，用 `LAB_API_CORS_ORIGIN` 放行一个来源。只有请求头 `Origin` 与它完全相等时，后端才回这几个头：

```text
Access-Control-Allow-Origin: http://127.0.0.1:8060
Access-Control-Expose-Headers: ETag, Location
Vary: Origin
```

预检请求（`OPTIONS`）另外回 `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE` 和 `Access-Control-Allow-Headers: Content-Type, If-Match`。没有放行时，预检仍返回 204，只是没有这些头，浏览器因此报 CORS 错误。注意 `http://localhost:8060` 和 `http://127.0.0.1:8060` 是两个不同的源。原理见 [MDN：CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/CORS)。

## 接口

| 方法与路径 | 作用 | 成功 | 主要失败 |
| --- | --- | --- | --- |
| `GET /api/health` | 后端是否在运行 | 200 | — |
| `GET /api/products` | 列表、筛选、排序、分页与汇总 | 200 | 400 `BAD_QUERY` |
| `GET /api/products/:id` | 读取一个商品 | 200 + `ETag` | 404 |
| `POST /api/products` | 新建，编号由服务器分配 | 201 + `Location` | 400、422 |
| `PATCH /api/products/:id` | 修改部分字段 | 200 + `ETag` | 404、428、400、409、422 |
| `POST /api/products/:id/restock` | 补货 | 200 + `ETag` | 404、400、422 |
| `DELETE /api/products/:id` | 删除 | 204 | 404 |
| `POST /api/_lab/reset` | 恢复固定数据，清空注入的故障 | 204 | — |
| `POST /api/_lab/faults` | 注入故障 | 204 | 400、422 |

下面的 curl 在任意终端执行。同样的请求也可以在开发页面的 Console 里用 `fetch` 发，地址写相对的 `/api/…`，经代理到达后端：

```js
const response = await fetch("/api/products?stock=low");
console.log(response.status, await response.json());
```

### 健康检查

```sh
curl -i http://127.0.0.1:8070/api/health
```

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"ok":true}
```

### 列出商品

`GET /api/products`，查询参数都可选，未知参数忽略：

| 参数 | 取值 | 不传时 |
| --- | --- | --- |
| `q` | 按编号或名称包含查找，去掉首尾空格，不区分大小写 | 不过滤 |
| `category` | 外设、显示器、配件、音频；`全部` 等于不过滤 | 全部 |
| `stock` | `low`（1–5 件）或 `out`（0 件） | 不过滤 |
| `sort` | `id`、`name`、`stock`（少到多）、`-stock`（多到少） | `id` |
| `page` | 正整数，从 1 开始 | 1 |
| `pageSize` | 1–50 的整数 | 20 |

响应里有三组数，范围各不相同：

- `items`：当前页的商品；`total`：筛选后的总条数。页码超出时 `items` 为空。
- `summary`：筛选后**全部**结果的汇总，不受分页影响。
- `totals`：全部商品的汇总，不受筛选影响。

```sh
curl "http://127.0.0.1:8070/api/products?stock=low"
```

```json
{
  "items": [
    { "id": "P004", "name": "USB-C 扩展坞", "category": "配件", "stock": 3, "priceCents": 29900, "tags": ["热销", "新品"], "version": 1 },
    { "id": "P006", "name": "降噪耳机", "category": "音频", "stock": 5, "priceCents": 89900, "tags": ["热销"], "version": 1 }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 2,
  "summary": { "count": 2, "stock": 8, "valueCents": 539200, "soldOut": 0, "lowStock": 2 },
  "totals": { "count": 6, "stock": 52, "valueCents": 2634800, "soldOut": 1, "lowStock": 2 }
}
```

分页不影响 `summary`：`?pageSize=2&page=2` 只返回 P003、P004 两项，`total` 是 6，`summary` 仍是 6 种、52 件、2634800 分。

参数非法时返回 400，`fields` 列出每个出错的参数：

```sh
curl -i "http://127.0.0.1:8070/api/products?stock=few&pageSize=80"
```

```text
HTTP/1.1 400 Bad Request

{"error":{"code":"BAD_QUERY","message":"查询参数不合法，见 fields","fields":{"stock":"stock 只能是 low（1–5 件）或 out（0 件）","pageSize":"pageSize 必须是 1–50 的整数"}}}
```

### 读取一个商品

```sh
curl -i http://127.0.0.1:8070/api/products/P004
```

```text
HTTP/1.1 200 OK
ETag: "1"

{"id":"P004","name":"USB-C 扩展坞","category":"配件","stock":3,"priceCents":29900,"tags":["热销","新品"],"version":1}
```

不存在的编号返回 404：`{"error":{"code":"NOT_FOUND","message":"商品 P404 不存在"}}`。

### 新建商品

请求体是 `name`、`category`、`stock`、`priceCents`、`tags`。编号由服务器分配：现有最大编号加 1。名称先去掉首尾空格再保存。

```sh
curl -i -X POST http://127.0.0.1:8070/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"  随身转接头 ","category":"配件","stock":3,"priceCents":29,"tags":[]}'
```

```text
HTTP/1.1 201 Created
Location: /api/products/P007
ETag: "1"

{"id":"P007","name":"随身转接头","category":"配件","stock":3,"priceCents":29,"tags":[],"version":1}
```

从固定数据新建它以后，`totals` 是 7 种、55 件、2634887 分。字段不合规则时返回 422，一次列出全部问题：

```text
HTTP/1.1 422 Unprocessable Entity

{"error":{"code":"VALIDATION","message":"字段校验失败，见 fields","fields":{"name":"名称需要 1–40 个字符","category":"分类无效","stock":"库存必须是 0–99999 的整数","priceCents":"价格必须是非负安全整数分","tags":"标签必须是字符串数组"}}}
```

这是请求体 `{"name":"","category":"零食","stock":-1,"priceCents":1.5,"tags":"热销"}` 的结果。编号用到 P999 后再新建，`fields.id` 是「编号已用尽：最大编号是 P999」。

### 修改商品

`PATCH /api/products/:id`，请求体只放要改的字段，只允许 `name`、`category`、`stock`、`priceCents`、`tags`。必须带 `If-Match`。

```sh
curl -i -X PATCH http://127.0.0.1:8070/api/products/P004 \
  -H 'Content-Type: application/json' -H 'If-Match: "1"' \
  -d '{"stock":8}'
```

```text
HTTP/1.1 200 OK
ETag: "2"

{"id":"P004","name":"USB-C 扩展坞","category":"配件","stock":8,"priceCents":29900,"tags":["热销","新品"],"version":2}
```

之后全部商品的总库存是 57。服务器按这个顺序检查，先失败的先返回：

| 顺序 | 情况 | 结果 |
| --- | --- | --- |
| 1 | 商品不存在 | 404 `NOT_FOUND` |
| 2 | 没带 `If-Match` | 428 `PRECONDITION_REQUIRED` |
| 3 | 请求体不是 JSON 对象 | 400 `BAD_JSON` |
| 4 | `If-Match` 与当前 version 不同 | 409 `CONFLICT`，带 `current` |
| 5 | 字段不合规则，或改了不允许的字段 | 422 `VALIDATION`，带 `fields` |

上面保存成功后，再用旧的 `If-Match: "1"` 提交 `{"stock":9}`：

```text
HTTP/1.1 409 Conflict

{"error":{"code":"CONFLICT","message":"保存冲突：P004 在服务器上是 version 2，你基于 \"1\"","current":{"id":"P004","name":"USB-C 扩展坞","category":"配件","stock":8,"priceCents":29900,"tags":["热销","新品"],"version":2}}}
```

带上正确的 `If-Match: "2"`，提交 `{"stock":"","id":"P999"}`：

```text
HTTP/1.1 422 Unprocessable Entity

{"error":{"code":"VALIDATION","message":"字段校验失败，见 fields","fields":{"id":"编号不能修改","stock":"库存必须是 0–99999 的整数"}}}
```

空白库存不合法，`{"stock":0}` 合法。缺 `If-Match` 时的消息是「修改商品需要 If-Match 请求头，值是你读到的 version，例如 If-Match: "1"」。

### 补货

`POST /api/products/:id/restock`，请求体 `{"quantity": 整数}`。数量是 1–99999，补完后的库存也不能超过 99999。

```sh
curl -i -X POST http://127.0.0.1:8070/api/products/P001/restock \
  -H 'Content-Type: application/json' -d '{"quantity":3}'
```

```text
HTTP/1.1 200 OK
ETag: "2"

{"id":"P001","name":"机械键盘","category":"外设","stock":15,"priceCents":39900,"tags":["热销"],"version":2}
```

全部商品变为 6 种、55 件、2754500 分。`{"quantity":0}` 返回 422，`fields.quantity` 是「补货数量必须是 1–99999 的整数」。补货不需要 `If-Match`：它是在当前库存上增加，不是用你看到的值覆盖。

### 删除商品

接着新建商品那一节，删除刚建的 P007：

```sh
curl -i -X DELETE http://127.0.0.1:8070/api/products/P007
```

```text
HTTP/1.1 204 No Content
```

全部商品回到 6 种、52 件、2634800 分。再删一次，或再读取它，都是 404「商品 P007 不存在」。编号按现有最大编号加 1 分配，所以删掉最大的 P007 后再新建，得到的仍是 P007。

### 恢复固定数据

```sh
curl -i -X POST http://127.0.0.1:8070/api/_lab/reset
```

```text
HTTP/1.1 204 No Content
```

数据回到 6 种、52 件、2634800 分，每个商品的 version 回到 1，没用完的注入故障也被清空。`/api/_lab/` 开头的两个接口只供本地排错和测试，前端的「恢复固定数据」按钮调用的就是它。

### 故障注入

`POST /api/_lab/faults` 让指定方法和路径接下来的请求失败或变慢，用来练习排错和写测试。被影响的请求在 api 终端行尾带「注入故障」。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `method` | 是 | 大写的 HTTP 方法，例如 `GET`、`PATCH` |
| `path` | 是 | `/api/` 开头的路径，按路径精确匹配，不含查询串 |
| `status` | 与 `delayMs` 至少一个 | 400–599，用这个状态响应 |
| `delayMs` | 与 `status` 至少一个 | 0–10000，先等这么久；只有延迟时，等完照常处理 |
| `times` | 否 | 1–20，生效几次，默认 1 |
| `body` | 否 | 和 `status` 一起用时，原样作为响应体；不给时是 `{"error":{"code":"FAULT","message":"注入的故障：<status>"}}` |

同一方法和路径注入了多条，按注入顺序消耗。`/api/_lab/` 自身不受影响。三个常用例子：

```sh
# 下一次列表请求返回 500（查询串不参与匹配）
curl -X POST http://127.0.0.1:8070/api/_lab/faults -H 'Content-Type: application/json' \
  -d '{"method":"GET","path":"/api/products","status":500}'
# 下一次读取 P001 晚 1.5 秒
curl -X POST http://127.0.0.1:8070/api/_lab/faults -H 'Content-Type: application/json' \
  -d '{"method":"GET","path":"/api/products/P001","delayMs":1500}'
# 下一次保存 P004 返回带 fields 的 422
curl -X POST http://127.0.0.1:8070/api/_lab/faults -H 'Content-Type: application/json' \
  -d '{"method":"PATCH","path":"/api/products/P004","status":422,"body":{"error":{"code":"VALIDATION","message":"字段校验失败，见 fields","fields":{"priceCents":"价格必须是非负安全整数分"}}}}'
```

第一条之后的那次列表请求：

```text
HTTP/1.1 500 Internal Server Error

{"error":{"code":"FAULT","message":"注入的故障：500"}}
```

再请求一次就恢复 200。第二条之后读取 P001 实际用了约 1.5 秒，终端记录 `GET /api/products/P001 200 1504ms 注入故障`。参数不合法时返回 422，例如 `method` 写成小写、`path` 带了查询串：

```text
{"error":{"code":"VALIDATION","message":"故障参数不合法，见 fields","fields":{"method":"method 必须是大写的 HTTP 方法，例如 GET","path":"path 必须是 /api/ 开头的路径，不含查询串","delayMs":"status 与 delayMs 至少提供一个","status":"status 与 delayMs 至少提供一个"}}}
```

前端的 `failNext(operation)` 和「模拟详情失败」「模拟保存失败」也通过这个接口注入，所以模拟的失败同样出现在 Network 和 api 终端。

## 常见失败

| 现象 | 先看哪里 | 原因与处理 |
| --- | --- | --- |
| 页面「读取失败：Failed to fetch」，Network 显示 CORS error，api 终端却有 200 | Console 的 CORS 报错、Request URL | 前端直连了 8070。改回相对地址 `/api` 走代理 |
| Network 里 `/api` 请求 502，api 终端没有记录；dev 终端打印 `http proxy error` 和 `ECONNREFUSED` | api 终端是否还在运行 | 后端没启动，或代理目标的端口不对。运行 `npm run lab -- api`，核对代理目标 |
| `/api` 请求 404 且 Response 为空，api 终端没有记录 | Response 内容 | 请求没经过代理：`vite.config.js` 缺 `server.proxy`，或改完没重启 dev。后端自己的 404 一定带 JSON 错误体和一行日志 |
| 保存返回 428 | 请求头 | `PATCH` 没带 `If-Match` |
| 保存返回 409 | Response 的 `current` | 别处先改了这个商品。保留草稿，提示用户载入最新再保存 |
| 422 的消息只出现在表单底部 | Response 的 `fields` | 把 `fields` 的键对应到输入框；`priceCents` 对应价格输入框 |
| 数字和预期对不上，例如总库存 55 不是 52 | api 终端的历史记录 | 上一个实验的修改还在数据文件里。点「恢复固定数据」或运行 `npm run lab -- api reset` |
| `npm run lab -- api` 报「数据文件损坏」 | 提示里的文件路径 | 运行 `npm run lab -- api reset`；坏文件会另存为 `.damaged-…` |
| `npm run lab -- api` 只列出「命令：status \| start Cnn \| …」，里面没有 `api`；或提示「本地后端从 2026.11-v4.0 的 C44 起提供…」 | 工作区里有没有 `server/` | 2026.10-v2.5 及更早的工作区没有后端，按 [L5 的升级说明](/js_web/labs/l5/#从旧发行版升级) 处理 |

## Pages 上没有后端

课程网站和 GitHub Pages 只发静态文件，没有 Node 服务，也就没有 `/api`。本地后端只在你的电脑上运行，数据只在你的工作区里。

要把库存应用放上 Pages，用 mock 构建：`VITE_DATA_SOURCE=mock npm run lab -- build`。这份产物只用浏览器内的数据和本地存储，不请求 `/api`，做法见 [C46](/js_web/07-project/c46-static-build-pages/)。
