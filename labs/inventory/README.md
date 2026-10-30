# 库存工作区

这个目录是持续修改的 C00 起始工程。参考解由 `labs/reference/steps` 重建，正常启动不会导入参考解。

在本目录用 Node 24 执行一次 `npm ci`，然后运行 `npm run lab -- start C01` 和 `npm run lab -- dev`。浏览器打开终端打印的地址。跨课只更换任务，不必重装依赖或重建工程。

- `npm run lab -- status`：查看当前任务和上次检查。
- `npm run lab -- check C03`：读取当前源码检查，失败显示输入、期望与实际。
- `npm run lab -- compare C03`：只读对照本发行版参考解，不应用补丁。
- `npm run lab -- restore C02 ../inventory-recovery`：将 C03 的参考起点另存到新目录。目标存在且非空时拒绝，不覆盖作业。
- `npm run lab -- build`：构建当前界面，默认演示路径 `/js_web/demos/inventory/`，不是网站源码目录。

## 暂停、恢复与只读对照

一直在自己的工作副本继续，不用每天重新下载。阶段起点是前一阶段完成态：L1/C00、L2/C10、L3/C20、L4/C36、L5/C44。比如在本目录执行 `npm run lab -- restore C44 ../inventory-delivery`，会另存到 `../inventory-delivery`；进入新目录执行一次 `npm ci`，再 `npm run lab -- start C45`。C45–C48 回到保留的 `src/react`，四个 adapter 留作对照。

恢复只接受不存在或普通空目录；非空目录、普通文件、有效或悬空符号链接都拒绝。压缩包 SHA、发行版、文件清单与安全路径先验证，再写新目录；原源码、个人 notes 和当前 `.lab` 都不改。即使任务记录损坏，仍可另存恢复，不需要先删除它。

`start Cnn` 只保存任务位置，不装参考解。`check Cnn` 读取当前实际源码并保存检查结果，跨终端可用 `status` 查看。`compare Cnn` 只显示差异，连当前任务记录也不修改；看到参考解不等于检查已经通过。下载页中的发行版和 `checkpoint.json` 应一致，跨发行版请用新目录和该版锁重新安装。

每次暂停，在 `notes/next.md` 保存当前课、已改文件、观察结果和下一步。`.lab` 的任务位置与网站的课程完成标记分别管理。

学习入口与版本化下载见 [Lab 总览](https://socoo123.github.io/js_web/labs/)，本地发行范围见 `tools/catalog.json` 与 `checkpoint.json`。仓库中的 [改版验证记录](../records/README.md) 保存实际验收；旧版 `examples/inventory` 仅作参考，不要求切过去重做当前 Lab。
