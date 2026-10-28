# C19 Yarn、pnpm、Bun 的职责与选择 · 示例

配套正文：[C19](../../src/content/docs/04-runtime-tooling/c19-yarn-pnpm-bun.md)。主实验为 Yarn 与 pnpm；Bun 为扩展。安装需联网或已有工具/包缓存。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| prediction.js | `node prediction.js` | 区分 packageManager、script 的执行命令和直接依赖 |
| runtime.js | `node runtime.js` | 当前执行 JS 的运行时 |
| lockfiles.js | `node lockfiles.js` | 三份模板均声明 wrap-ansi 7.0.0，带各自的锁 |
| prepare-labs.js | `node prepare-labs.js` | 在系统临时目录生成三个独立副本，打印 cd 命令 |
| common/report.js | 副本中运行 report script | 读取固定商品数据，输出报告与折行后的商品名 |
| common/hidden.js | 副本中按正文运行 | 故意使用未直接声明的 string-width |
| common/runtime.js | 副本中运行 runtime script | 内容与外层 runtime.js 相同 |
| yarn-lab/ | 副本中 `corepack yarn install --immutable` | Yarn 4，PnP，清单 + yarn.lock + .yarnrc.yml |
| pnpm-lab/ | 副本中 `corepack pnpm install --frozen-lockfile` | pnpm 12，默认隔离布局，清单 + pnpm-lock.yaml |
| bun-lab/ | 副本中 `bun install --frozen-lockfile` | Bun 1，清单 + bun.lock |
| report.expected.txt | 对照副本报表 stdout | 五行预期；不是独立运行入口 |

## 运行

- 在本目录运行前三个文件，或在仓库根目录用 `npm run examples -- c19` 核对 3 个固定输出。
- 准备 Node 24 与 Corepack，Bun 另按官方安装页准备；正文直接调用 corepack，无需先运行 corepack enable。
- 在本目录执行 `node prepare-labs.js`，复制输出的 cd 命令进入所选副本，再按正文安装、运行、修复。
- prepare-labs 把模板、common 文件及 shared/products.json 复制到仓库外的系统临时目录，隔开网站父级依赖；重复调用生成新副本。
- 副本报表 stdout 应与 report.expected.txt 一致：6 种商品、52 件、2634800 分，再打印两行商品名。
- 自带清单的三份模板不进入根示例发现器；它们按正文独立安装和验证。模板与锁保持初始状态，故意改错只在副本中做。
- 本课不改阶段 3、站点根清单或根锁，不提交生成的安装文件与缓存。

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1、Corepack 0.36.0、Yarn 4.18.1、pnpm 12.14.0、Bun 1.4.3。
- `npm run examples -- c19`：3/3 通过。正文带 title 的 4 个代码块与相应文件逐字相同。
- 仓库外全新副本：Yarn/pnpm/Bun 冻结安装均成功，安装前后锁 SHA-256 不变；三种 report 的 stdout 与 report.expected.txt 一致。
- Yarn：默认 PnP 无 node_modules；裸 node report.js 报 ERR_MODULE_NOT_FOUND；yarn run report、yarn node report.js 成功。ESM 加载集成会有实验性提示。
- Yarn/pnpm why 均显示 wrap-ansi → string-width；hidden.js 分别报未声明依赖、ERR_MODULE_NOT_FOUND。各自 add 直接声明后打印 8，报告保持一致。
- Yarn node-modules linker 对照：在副本改 nodeLinker 并 immutable 安装，裸 node report.js 成功；同一份漏声明的 hidden.js 此时碰巧打印 8。改回 PnP 后恢复严格检查。
- pnpm：顶层 wrap-ansi 为符号链接，实际解析到 node_modules/.pnpm；pnpm 12 生成的锁含工具依赖与项目依赖两个 YAML 文档，保留原始产物。
- Bun：安装后裸 node report.js 与 bun run report 均正确；node runtime.js、bun runtime.js、bun run runtime、bun run --bun runtime 分别为 Node/Bun/Node/Bun。
- 三副本各自只把 wrap-ansi 改成 6.2.0：冻结安装非零退出且锁不变；普通 install 同步后，冻结安装与报告再次通过。Yarn 报 YN0028，pnpm 报锁不同步，Bun 报冻结模式下锁需改变。
- Corepack 在网站根目录拒绝调用 yarn，指出根 packageManager 为 npm；在实验副本读取各自固定版本，证明入口按项目区分。
- 全站 lint 19 课零 error/warning；check 零诊断；build 的 196/196 固定输出示例与 23 页产物检查通过。
- [Pages run 38996724990](https://github.com/socoo123/js_web/actions/runs/38996724990) 成功；线上 C19 与路线页 HTTP 200，正文包含新课标题/代码，路线页显示 19/48 并链接 C19。
- 未运行：Windows/Linux 本地实验、Bun 测试/打包、workspaces 应用；后两项在正文只作职责与组织方式说明。

## V2 连续工作区

2026-10-28 · 发行版 2026.10-v2.2：本课在 `labs/inventory/` 持续修改，`npm run lab -- check C19` 检查实际文件。C00→C20 的单目录正文跟做、错误证据与修复见 [R5 验证](../../labs/records/R5.md)。Java 完整源文件在 labs/reference/java，已用 Java 21.0.2 执行；旧例子保留为可选参考。网站使用原 URL 与 F1 课号。
