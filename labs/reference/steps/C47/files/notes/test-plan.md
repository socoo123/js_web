# 库存风险回归计划

五项风险，不按测试文件数或快照数量计覆盖。

| 风险/后果 | 操作与期望 | 层级/现有文件 |
| --- | --- | --- |
| 非法快照毁掉最后一份好数据 | 两次合法保存后传stock字符串；抛错且主键/backup整个Map原文不变 | Vitest UT，regression.test.jsx |
| 连续输入丢字而整串fill掩盖问题 | 逐字输入P004、清空；完整条件、一项P004、恢复6/52/2634800 | RTL regression.test.jsx；严格浏览器search场景补生产入口 |
| 后端拒绝时用户不知道改哪里 | 422 fields.priceCents 落到价格输入框并聚焦；409 提示服务器库存、草稿保留、载入最新后再保存 | RTL regression.test.jsx，repository 抛 ApiError |
| 读取或保存失败后无法恢复 | 列表500显示原因与「重新读取」；首次get拒绝后人工重试读到P002；保存8失败保留草稿与52，重试才57 | RTL regression.test.jsx 新增列表；沿用inventory.test.jsx已有两条 |
| 接上后端后数据没有真正写入 | reset后保存P004=8，刷新仍8、总库存57，GET /api/products/P004 为 version 2 | Playwright tests/e2e/api.spec.js，检查器提供临时数据后端与带代理的严格预览 |

执行：npm run lab -- check C47。自动检查隔离存储并使用临时数据的后端；对自己的360/768/1280视口、焦点轮廓与手机输入另记实际结果。

主错误：saveProducts先调用setItem再校验，异常不会回滚已经写入的原文。先让非法保存回归红，再恢复encodeSnapshot在前、任何setItem在后，原断言应绿。
连续输入使用同步HashRouter；保留StrictMode，不增加固定sleep或用一次fill替代逐字输入。
422/409 用替身在 repository 边界抛 ApiError，真实表单、Provider 与 Query 保留；HTTP 状态、If-Match 与持久化交给真实后端流程。

自己的结果：填写命令、实际失败信息、修复位置、复验值与未完成环境。
