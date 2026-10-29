# React 库存复盘

这是参考解的复盘要点。自己的记录应填实际观察，不复制成个人执行证据。

| 故障 | 最短操作和证据 | 根因与修复 | 重放检查 |
| --- | --- | --- | --- |
| 鼠标 1，汇总仍 52 | Components 中 products 的 P002.stock=1，summary.stock=52；Sources 有只初始化一次的统计 state | 删除冗余 state，从当前 visible 计算 summarize | 总库存 53、价值 2647700 分；详情库存 1 |
| URL 是 P002，详情却是 P001 | Sources 的 queryKey 缺 id；浏览器 mock 不产生写 API 网络请求 | detailOptions 使用 inventoryKeys.detail(id) | P001/P002 新鲜缓存隔离，鼠标 0 |
| 非法快照覆盖好记录 | Application 看原文；Sources 在 importText 检查 decodeSnapshot 与持久化顺序 | 先解析和字段校验，再提交；成功前保留原数据 | 非法导入拒绝且原文不变；坏主记录可从备份恢复 |

数据主人：repository 管商品和持久化；Query 管缓存；编辑器管草稿；URL 管筛选；汇总从当前输入派生。
暂停：在 notes/next.md 写当前课程、已改文件、观察结果和下一步；导出商品快照，草稿另存。
