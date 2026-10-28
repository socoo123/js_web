# 库存工作区 · 初始工程

需要 Node 24。在当前目录执行一次 `npm ci`，然后执行 `npm run lab -- start C01`、`npm run lab -- dev`，打开终端地址。

这是 C00 商品卡片骨架，后续能力由你逐章修改加入。阶段之间不需要重新安装。

暂停时编辑 `notes/next.md`。用 `npm run lab -- status` 回看任务，用 `npm run lab -- check C03` 检查当前实际源码。

恢复命令 `npm run lab -- restore C02 ../inventory-recovery` 只写新目录，目标非空则拒绝。`npm run lab -- compare C03` 只读显示与本发行版参考解的差异，不自动应用。

课程、发行范围和详细说明见 [库存工作区](https://socoo123.github.io/js_web/labs/)。参考答案单独按需下载，不在默认入口导入。
