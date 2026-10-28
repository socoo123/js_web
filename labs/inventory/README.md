# 库存工作区

这个目录是持续修改的 C00 起始工程。参考解由 `labs/reference/steps` 重建，正常启动不会导入参考解。

在本目录用 Node 24 执行一次 `npm ci`，然后运行 `npm run lab -- start C01` 和 `npm run lab -- dev`。浏览器打开终端打印的地址。跨课只更换任务，不必重装依赖或重建工程。

- `npm run lab -- status`：查看当前任务和上次检查。
- `npm run lab -- check C03`：读取当前源码检查，失败显示输入、期望与实际。
- `npm run lab -- compare C03`：只读对照本发行版参考解，不应用补丁。
- `npm run lab -- restore C02 ../inventory-recovery`：将 C03 的参考起点另存到新目录。目标存在且非空时拒绝，不覆盖作业。
- `npm run lab -- build`：构建当前界面，默认演示路径 `/js_web/demos/inventory/`，不是网站源码目录。

每次暂停，在 `notes/next.md` 保存当前课、已改文件、观察结果和下一步。`.lab` 的任务位置与网站的课程完成标记分别管理。

已迁移范围、下载与验证明细见 [改版验证记录](../records/README.md)。尚未发行的课继续使用旧版阅读入口，不把元数据中的计划当成已完成的功能。
