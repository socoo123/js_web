# C18 npm：项目、版本与可复现安装 · 示例

配套正文：[C18](../../src/content/docs/04-runtime-tooling/c18-npm-reproducible-installs.md)。命令实验用 Node 24 与 npm 11；安装需要访问 npm registry 或使用已有缓存。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| manifest.js | `node manifest.js` | 读取阶段 3 项目版本、脚本与依赖类别 |
| lock.js | `node lock.js` | 读取实际锁文件的版本、来源、完整性字段 |
| prediction.js | `node prediction.js` | 练习 1：项目版本、范围、具体版本 |
| project-report.js | `node project-report.js` | 固定数据的完整库存报告 |
| prepare-lab.js | `node prepare-lab.js` | 将实验模板复制到本目录 .cache/install-lab，已有目录时拒绝覆盖 |
| install-lab/package.json + package-lock.json | 副本中 `npm ci` | 同步的实验起点，semver 7.8.5 |
| install-lab/ranges.js | 副本中 `npm run ranges` | 四个 semver 范围判断，预期见 ranges.expected.txt |

## 运行

- 前四个文件在本目录用 node 运行；根目录 `npm run examples -- c18` 自动核对这 4 个 `.expected.txt`，无需安装阶段 3 的开发依赖。
- 实验：本目录执行 `node prepare-lab.js`，进入 `.cache/install-lab`，按正文依次运行 ci、ranges、改清单、失败、install、ci。副本被 Git 忽略；模板保持同步状态。
- 范围例子位于自带 package.json 的目录，网站示例发现器按规则跳过；需要在实验目录独立安装后运行。
- 贯穿项目：进入 `../inventory/03-tooling`，执行 `npm ci`、`npm run report`、`npm run versions`。

## 验证记录

- 2026-10-17 · Node 24.22.0 / npm 11.19.1 · macOS arm64：`npm run examples -- c18` 4/4 通过。
- 阶段 3：npm ci、report、versions、npm ls --depth=0/--all、npm explain semver 均通过；两个脚本分别打印完整固定库存报告、7.8.5。
- npm exec 与 npx 使用正文中的 `--no --` 参数，均只筛出 7.8.5。npm run 列出两个脚本；npm prefix 指向阶段 3。
- npm config get registry 返回公共源；npm view semver@7.8.5 version 返回 7.8.5。临时空目录的 npm init -y 成功。
- 实验副本首次 ci 成功，ranges 的 stdout 与 ranges.expected.txt 一致；只改清单到 6.3.1 后 ci 退出 1，报 EUSAGE 与 Invalid，锁仍为 7.8.5；install 同步锁后 ci、ranges 成功，依赖树为 6.3.1。
- 练习 2：只改回 7.8.5 后 ci 同样失败；install 同步后 ci、ranges、依赖树均符合预期。
- 仓库外临时目录独立重跑两次冲突与修复，均通过；失败的 ci 前后清单与锁摘要不变，范围例子的输出一致，排除了父项目依赖的影响。
- report 参数转发：配件报告 2 种、28 件、587200 分；重复写入 EEXIST，npm 非零退出且原文件不变。输出放临时目录并清理。
- 阶段 3 ci --omit=dev 后本地 semver 不存在，report 仍正确；再 ci 恢复工具。两次安装前后清单与锁的 SHA-256 一致；阈值环境变量经 npm 脚本传递，配件低库存为 0。
- 仓库根目录 npm run report 复现 Missing script；npm prefix 与 npm run 显示网站清单；切到阶段 3 后恢复。
- 未运行：Windows、Linux 本地命令实验。构建与部署记录由 STATUS 和对应 Actions 保留。
