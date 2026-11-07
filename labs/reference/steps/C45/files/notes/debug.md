# 库存交付排错

这是参考记录的结构；自己的实际值、截图和采样文件保存在自己的工作区。一个终端运行 npm run lab -- api，另一个运行 npm run lab -- dev。

## 接上后端

- 起点：页面标题下显示「数据源：本地后端 /api」；初始 6/52/2634800。
- 证据：Network 有 GET /api/products（200，Response 带 items/summary/totals）；api 终端同时打印 GET /api/products?page=1&pageSize=50 200。
- 恢复固定数据：页面按钮「恢复固定数据」或 npm run lab -- api reset；不手工删除 .lab/server/products.json。

## 状态

- 复现：App 的 restock 绕开 dispatch，直接修改 products 中的商品；从 P001=12 点击立即补一件。
- 证据：Sources 中字段已变13，页面仍12；Network 与 api 终端都没有 POST /api/products/P001/restock，刷新后仍12。
- 根因与修复：读取结果当成可变 state；恢复 await dispatch({ type: "restocked", id, amount })。
- 复验条件：一次点击13、总库存53，Network 与终端各有一条 restock 200；P004仍3；刷新仍13。

## 后端排错

- 直连 CORS：VITE_API_BASE=http://127.0.0.1:8070/api 启动 dev，页面「读取失败：Failed to fetch」，Console 报缺少 Access-Control-Allow-Origin；改回默认 /api，经 Vite 代理同源读取。
- 422：后端返回 fields.priceCents 时，错误显示在价格输入框下并聚焦；其他字段的错误放表单底部。
- 保存后失效：保存 P004=8 后列表与详情重新读取，不必刷新就显示 8/57。
- 500：注入一次 GET /api/products 500，页面显示「读取失败：HTTP 500：…」和「重新读取」，点一次恢复六种。
- 慢请求：给 GET /api/products/P001 注入 1500ms 延迟，打开 P001 后立刻打开 P002，最终仍显示 P002。

## 资源、存储、布局

- Network：把 src/react/index.html 的 main.jsx 拼错会产生模块404；改回同一文件名再刷新。
- Application（VITE_DATA_SOURCE=mock npm run lab -- dev）：保存快照，导入含空库存的 JSON；拒绝后业务主键与 backup 原文不变。只在专用本地 origin 操作。
- Elements：360px 给 main 加 min-width:44rem 可复现溢出；删除该声明，不裁切 body。
- 键盘：P004取消仍3/52；保存8且清空搜索后8/57，P001仍12；空白拒绝并聚焦库存。

## 性能与内存

- 同一视口录制首次/再次展开分类报表；记录模块下载、脚本与布局分别占在哪里。
- 快捷键 Hook 清理前后，按相同次数切换筛选；记录 keydown 监听器数与保留链，而非只比较总堆。
- 将自己实际录制的文件、操作次数、观察与限制填在这里。自动行为检查不能代替对采样的解释。
