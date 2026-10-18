# 库存项目 · 阶段 5：Ant Design

C38 参考实现。用 Ant Design 6 的 Table、Form、Modal 替换本地库存界面，复用 `../04-react/src/` 的商品校验、reducer、筛选、ID 和快照模块；与 `../../shared/products.js` 共用六种初始商品。阶段 4 的路由、Query/Action 和故障实验继续保存在原目录。

## 运行

需要 Node 24、npm 11。在本目录运行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

打开终端地址，通常为 `http://127.0.0.1:5173/js_web/`。初始 6 种、52 件、26348.00 元；鼠标 0 件。搜索/分类过滤、数字排序、创建/编辑/补货/删除、空态、深浅主题都可操作。

| 命令 | 结果 |
| --- | --- |
| `npm test` | 15 条 Vitest：输入边界、整数分、标签保留、非法提交、快照格式 |
| `npm run test:e2e` | 6 条 Chrome：CRUD/校验/焦点/主题/存储及故意错误与正确草稿对照 |
| `npm run test:e2e:production` | 构建后在预览服务执行同一组 5 条应用用例；不运行开发实验 |
| `npm run build` | 本目录 dist，资源 base 为 /js_web/，包含 source maps |
| `npm run preview -- --host 127.0.0.1` | 预览已有构建，通常为 http://127.0.0.1:4173/js_web/ |

浏览器测试用本机 Chrome（headless、独立临时 profile），缺少时可先用 `npx playwright install chrome` 安装。测试端口 4188 不复用其他服务。开发服务下可打开 `/js_web/labs/lifecycle.html?case=broken` 或 `?case=fixed`：先把键盘草稿改 8 取消，再开鼠标，错误起点仍显示 8，正确参考显示 0。

## 文件与状态

- `src/App.jsx`：商品数组、筛选、全量统计、编辑会话、本地快照与主题。
- `src/ProductTable.jsx`：rowKey=id、数字排序、按记录 id 发出事件，表格内横向滚动。
- `src/ProductEditor.jsx`：Form 独立草稿；关闭动画结束后 App 卸载编辑器，重开创建新实例；字段错误聚焦。
- `src/form-adapter.js`：字段 Promise 校验器与提交入口，共用阶段 4 的校验函数；热销增删保留新品。
- `src/cycle-dialog-focus.js`：在可见控件首尾处理 Tab/Shift+Tab，避免焦点转到浏览器地址栏；其余焦点管理采用 Modal。
- 快照键与格式沿用阶段 4 的 `js_web:inventory:products:v1`。同一 origin 下两版共用快照；点击按钮才写入，坏记录保留，恢复按钮显式清除，空数组有效。
- 数据全部在浏览器。构建产物无需后端；实验 labs 只供开发服务，不打进生产首页。

运行与核对记录见 [examples/c38](../../c38/README.md)。依赖与独立 package-lock.json 只属于此示例；网站根清单与锁不变。
