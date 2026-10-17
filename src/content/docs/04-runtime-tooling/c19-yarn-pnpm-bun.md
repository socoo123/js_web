---
title: C19 Yarn、pnpm、Bun 的职责与选择
description: 在隔离目录比较 Yarn PnP、pnpm 链接布局与 Bun，修复隐藏依赖，按运行时和安装方式选择工具。
sidebar:
  order: 19
---

> **第 2 周 · 第 10 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟\
> 前置：C16–C18 · 运行：Node 24、Corepack，Bun 为扩展实验 · 示例已运行验证

## 这一课解决什么问题

C18 的库存报表能用 npm 安装和运行。换到同事的项目，README 却写着 yarn install；另一个项目有 pnpm-lock.yaml；还有人建议「换 Bun 就行」。

yarn install 成功后没有 node_modules；旧代码复制到 pnpm 项目却找不到包。是安装坏了，还是漏写了什么？

本课用同一份数据比较依赖安装和程序运行。

学完你能：

- 分清 Yarn Classic、Yarn Modern 的定位，解释 PnP 为什么没有传统的 node_modules
- 顺着 pnpm 的存储与链接找到直接依赖，识别隐藏依赖
- 按命令区分 Bun 的运行时、包管理器、测试运行器和打包器职责
- 用 Corepack 按项目选择工具版本，读懂各自的锁文件和冻结安装命令
- 在两种工具中运行同一项目，依据兼容性和团队约定做选择

例子在 [examples/c19](https://github.com/socoo123/js_web/tree/main/examples/c19)。主实验选 Yarn 和 pnpm，Bun 补充观察运行时。网站和阶段 3 继续用 npm。

## Java 程序员先看这里

| Java 经验 | 这里的对应 | 一句话差异 |
| --- | --- | --- |
| JVM 执行字节码 | Node / Bun 执行 JS | 换安装工具和换运行时是两个决定 |
| Maven 解析依赖 | npm / Yarn / pnpm，或 Bun 的包管理功能 | 可以读取相似的清单，锁文件与安装布局各有规则 |
| Maven Wrapper 选定 Maven 版本 | Corepack 按项目选择 Yarn / pnpm 版本 | 仍要分别准备 Corepack 与 JS 运行时 |
| 多模块 Maven 项目 | workspaces | 都组织多个包；JS 每个包仍要声明自己使用的依赖 |
| 某个 JAR 恰好在 classpath | 未声明的间接依赖碰巧能导入 | 换依赖版本或安装布局后，这条 import 就可能失败 |

## 1. 先分开看：谁安装，谁执行

package.json 里的 packageManager 描述项目选用的包管理工具和版本；scripts 的文本决定接下来启动什么程序。它们各管一层。

**先猜一猜：** 在 `examples/c19` 执行 `node prediction.js`，三行分别打印什么？第一行与第二行为什么不同？

```js title="prediction.js"
const manifest = {
  packageManager: "yarn@4.18.1",
  scripts: { report: "node report.js" },
  dependencies: { "wrap-ansi": "7.0.0" },
};
console.log(manifest.packageManager.split("@")[0]);
console.log(manifest.scripts.report.split(" ")[0]);
console.log(Object.hasOwn(manifest.dependencies, "string-width"));
```

输出依次为 yarn、node、false。Yarn 负责准备依赖和启动 script；script 写的是 node，业务 JS 就由 Node 执行。最后一行只检查本项目有没有直接声明 string-width，稍后会用它定位错误。

### Corepack 管工具版本，锁文件管项目依赖

[Corepack](https://github.com/nodejs/corepack) 是包管理器的版本入口。比如一个项目指定 Yarn，另一个指定 pnpm，Corepack 会读取各自的 packageManager，准备并调用对应版本。首次调用可能联网下载工具。

先在终端运行 `node --version`、`corepack --version`。本课使用 Node 24；Corepack 缺失时按 [Yarn 官方安装页](https://yarnpkg.com/getting-started/install)准备。**从 Node 25 起，Node 官方发行版不再随附 Corepack**，所以安装 Node 后还要单独确认这个命令是否存在。[Node 的说明](https://nodejs.org/download/release/latest-v25.x/docs/api/corepack.html)

下文直接用 corepack yarn / corepack pnpm 调用，省去启用快捷入口的步骤。用 corepack enable 配好入口后，也能简写为 yarn / pnpm。

packageManager 固定工具版本，锁文件固定依赖选择；复现安装要对齐两者及配置。Node 和 Bun 另行准备。

### 准备三份相同的实验材料

在仓库的 `examples/c19` 目录执行：

```sh
node prepare-labs.js
```

它打印三个 cd 命令，进入 yarn、pnpm、bun 副本。每次运行生成新目录；各副本有独立的清单和锁，以及相同的代码和数据。

副本放在仓库外，避免漏声明的包从网站父级 node_modules 被找到，影响实验。

三个清单都直接依赖 wrap-ansi，它用于按终端显示宽度折行。报表源码如下，复制材料后可在各副本找到 report.js：

```js title="common/report.js"
import { readFile } from "node:fs/promises";
import wrapAnsi from "wrap-ansi";

const products = JSON.parse(await readFile(
  new URL("./products.json", import.meta.url), "utf8",
));
console.log("商品", products.length);
console.log("总库存", products.reduce((sum, product) => sum + product.stock, 0));
console.log("总价值（分）", products.reduce(
  (sum, product) => sum + product.stock * product.priceCents, 0,
));
console.log(wrapAnsi(products.slice(0, 2).map((product) => product.name).join(" "), 8));
```

成功运行时输出：

```text
商品 6
总库存 52
总价值（分） 2634800
机械键盘
无线鼠标
```

## 2. Yarn：先认版本，再认安装方式

Yarn 是包管理器。看到 yarn.lock，还要看 packageManager 和配置，确定版本及安装方式。

| Yarn 定位 | 识别线索 | 安装后的主要形态 |
| --- | --- | --- |
| Classic：1.x | 旧项目、Classic 文档、常见 .yarnrc | 传统 node_modules，使用 yarn.lock |
| Modern：2 起的系列，本课用 4 | packageManager、.yarnrc.yml | 默认 PnP，也支持其他 linker；同样使用 yarn.lock |
| PnP 安装方式 | .pnp.cjs，ESM 项目还会有配套加载文件 | 用映射和加载器解析依赖，通常没有传统 node_modules |
| node-modules linker | .yarnrc.yml 的 nodeLinker 选择 | 生成 Node 熟悉的 node_modules 目录 |

[Yarn 的安装方式说明](https://yarnpkg.com/features/linkers)把这些方式称为 linker。**Yarn Modern 不等于必须使用 PnP**；它也能生成 node_modules。Classic 和 Modern 都叫 yarn.lock，文件名本身无法说明格式和行为相同。

:::tip[自己尝试 · Node]
1. 在 examples/c19 运行 prepare-labs.js，复制它打印的 yarn 目录 cd 命令并执行。
2. 在副本中执行下面三条命令。
3. 用编辑器打开这个副本，观察 yarn.lock、.pnp.cjs 和是否存在 node_modules。

预期：报告与第 1 节一致；当前 PnP 副本没有传统 node_modules，仍可运行报表。
:::

在 **yarn 副本**执行：

```sh
corepack yarn --version
corepack yarn install --immutable
corepack yarn run report
```

版本应与 packageManager 一致，report 打印五行结果。模板已有锁，--immutable 要求安装时保持它不变。

[PnP](https://yarnpkg.com/features/pnp) 在 .pnp.cjs 等文件中保存包与依赖关系。yarn run 会给子进程准备需要的解析环境，里面的 node report.js 就能找到 wrap-ansi。此时裸跑 `node report.js`，会因没有加载 PnP 解析环境而提示找不到 wrap-ansi。用 `corepack yarn node report.js` 也可以带上环境运行。

安装结果看命令是否成功、程序是否能在对应环境运行。ESM loader 的实验性提示指 PnP 加载集成；import 本身已是正式语言标准。

这类似 Java 需要正确的 classpath；PnP 的依赖访问规则与 JVM 类加载不同。

### workspaces：一个仓库管理多个包

[Yarn workspaces](https://yarnpkg.com/features/workspaces) 一起管理多个包。例如 packages/core 存算法，packages/web 存网页，各有 package.json；根清单用 workspaces 指定 `packages/*`。

web 使用 core 时，在自己的 dependencies 中声明 core，Modern Yarn 可用 workspace: 协议指向本地包。这样表达的是包之间的依赖，不只是源码文件之间的相对路径。

它类似 Maven 多模块项目；npm、pnpm、Bun 也支持，配置与命令各有规则。

## 3. pnpm：共享存储，按依赖关系建立链接

pnpm 也是包管理器，通常仍生成 node_modules，但里面的布局与传统的平铺安装不同。

| pnpm 定位 | 你会看到什么 | 用途 |
| --- | --- | --- |
| 依赖解析与锁定 | pnpm-lock.yaml | 记录项目要求、具体依赖选择与关系 |
| 内容寻址存储 | 多个项目可复用的 store | 按内容复用包文件，减少重复保存 |
| 项目内虚拟存储 | node_modules/.pnpm | 组织当前安装所需的包与依赖关系 |
| 链接入口 | 例如 node_modules/wrap-ansi | 让 Node 按链接找到项目直接声明的包 |

在 **pnpm 副本**执行：

```sh
corepack pnpm --version
corepack pnpm install --frozen-lockfile
corepack pnpm run report
corepack pnpm why string-width
```

报表成功；why 显示 wrap-ansi 依赖 string-width，但本项目没有直接声明后者。

[pnpm 的链接布局](https://pnpm.io/symlinked-node-modules-structure)中，项目顶层为直接依赖建立入口，包内部也有自己的依赖入口。Node 解析包的真实位置后，可以找到那个包声明的依赖，所以 wrap-ansi 能正常使用 string-width。

文件从 store 导入项目，可能用硬链接、文件系统克隆或复制，由平台和配置决定。符号链接表达依赖路径，文件复用减少存储。修复应改源码，node_modules 中的手工改动会在重装时丢失。[pnpm 存储设置](https://pnpm.io/settings#packageimportmethod)

和 Java 的本地 Maven 仓库相似，store 可以复用下载内容；pnpm 还要为每个 JS 项目建立适合 Node 解析的链接布局。

### 隐藏依赖：磁盘上有，项目却没声明

自己的代码导入了包，却没在自己的清单中声明，只靠别的包间接安装带来它，称为隐藏依赖，也常叫幽灵依赖。

提升后的 node_modules 可能让代码碰巧成功。本例在 pnpm 默认隔离布局和 Yarn PnP 中失败；公开提升等配置会改变可见范围。

**先猜一猜：** why 已显示 string-width 存在，下面代码在 pnpm 副本执行 `node hidden.js` 能打印 8 吗？

```js title="common/hidden.js"
// 有问题的写法：直接使用仅由 wrap-ansi 声明的间接依赖
import stringWidth from "string-width";

console.log(stringWidth("机械键盘"));
```

结果是 ERR_MODULE_NOT_FOUND，程序在 import 时就停止，没有打印 8。**依赖树里有一个包，与当前包有权直接导入它，是两个判断。** 如果业务确实要直接使用 string-width，就应该把它声明成自己的直接依赖。

Java 的间接依赖也可能碰巧出现在 classpath；直接使用的库主动声明，升级和排错更清楚。

## 4. Bun：同一个命令名承担多种职责

Bun 包含 JS 运行时，也提供包管理、测试和打包功能。判断它此刻在做什么，要看子命令。

| Bun 定位 | 命令形式 | 你应观察什么 |
| --- | --- | --- |
| JS 运行时，使用 JavaScriptCore 引擎 | `bun runtime.js` | JS 由 Bun 执行；Node 使用 V8 |
| 包管理器 | `bun install` | 安装依赖并维护 bun.lock |
| scripts 入口 | `bun run report` | 继续看 script 里实际写了什么命令 |
| 测试运行器 | `bun test` | 运行 Bun 的测试体系，兼容范围查对应文档 |
| 打包器 | `bun build` | 生成构建产物，与执行源码是不同任务 |

测试和打包只列职责，本课实验聚焦安装与执行。

准备 Bun 时按[官方安装页](https://bun.com/docs/installation)操作，再用 `bun --version` 确认。这个扩展实验使用 Bun 1；包管理部分的[当前锁文件](https://bun.com/docs/pm/lockfile)叫 bun.lock，是文本格式，旧资料里的 bun.lockb 是旧的二进制格式。

先看副本中的 runtime.js：

```js title="runtime.js"
console.log("执行 JS 的运行时", process.versions.bun ? "Bun" : "Node");
```

**先猜一猜：** 已安装 Node，script 写着 `"runtime": "node runtime.js"`，下面最后三条的运行时分别是谁？

在 **bun 副本**执行：

```sh
bun install --frozen-lockfile
node report.js
bun run report
node runtime.js
bun runtime.js
bun run runtime
```

两次报告都与第 1 节一致；最后三条分别打印「执行 JS 的运行时 Node」「执行 JS 的运行时 Bun」「执行 JS 的运行时 Node」。本例没有配置把 node 替换成 Bun。

bun install 准备的依赖可以交给 Node 使用；bun run runtime 读取 scripts，发现里面写的是 node，于是启动 Node。要显式让这条 script 使用 Bun，可运行 `bun run --bun runtime`，这时结果变为 Bun。[Bun 的运行命令](https://bun.com/docs/runtime)

迁移时可以先换安装工具、保留 Node，再单独试 Bun 运行时，分别检查两层差异。

Bun 持续兼容 Node API，但部分模块与行为仍有差异，使用原生扩展、进程或特定调试工具时要查[兼容表](https://bun.com/docs/runtime/nodejs-compat)。安装时的依赖构建脚本策略也可能不同；Bun 默认按信任规则处理第三方生命周期脚本，涉及二进制准备的包尤其要确认。[生命周期脚本](https://bun.com/docs/pm/lifecycle)

## 5. 选择与锁文件：沿着项目已有约定走

现有项目先读 README、packageManager、锁文件、配置和 CI，沿用同一套约定。

| 工具 | 主要锁文件 | 已有锁时的冻结安装 |
| --- | --- | --- |
| npm | package-lock.json | `npm ci` |
| Yarn Modern | yarn.lock | `corepack yarn install --immutable` |
| pnpm | pnpm-lock.yaml | `corepack pnpm install --frozen-lockfile` |
| Bun | bun.lock | `bun install --frozen-lockfile` |

共同目标是安装时保持锁不变。npm ci 还会重建 node_modules，其他冻结命令的动作各有区别。Classic 常用 --frozen-lockfile，按版本读文档。

对新项目，可按需求作一个简短决定：

| 具体需求 | 可作为起点的选择 | 随后确认 |
| --- | --- | --- |
| 单个学习项目，沿用本课程 | Node + npm | 一套清单、锁和 scripts 跑通 |
| 团队已有 Yarn，重视依赖边界 | Yarn Modern；评估 PnP 或 node-modules linker | 编辑器、框架与 CI 的解析集成 |
| 多包项目，重视文件复用和依赖隔离 | pnpm | 链接、workspace 配置与依赖构建策略 |
| 想使用 Bun 的安装或运行能力 | 分开试它的包管理器与运行时 | 原项目命令、测试和部署环境 |

选择依据是项目需求，适用性通过运行、测试与构建确认。

迁移时在分支或副本生成新锁、运行和构建，再统一 README 与 CI，保留一套明确的安装入口。Bun 支持部分锁文件转换，转换后仍要检查依赖差异。[Bun 锁文件迁移](https://bun.com/docs/pm/lockfile)

## 常见错误与调试

### why 说包已安装，import 却失败

**现象**：pnpm 副本的 report 能运行，node hidden.js 却报 ERR_MODULE_NOT_FOUND；Yarn 副本执行 `corepack yarn node hidden.js`，则提示 string-width 未在依赖中声明。

**工具**：在对应副本用前面的 why 命令查看来源，再打开 package.json 的 dependencies。

**证据**：why 的路径经过 wrap-ansi；自己的 dependencies 只有 wrap-ansi。PnP 错误还指出尝试访问 string-width 的是本项目 hidden.js。

**原因**：hidden.js 直接导入 string-width，自己的清单就要声明它；wrap-ansi 的声明只服务它自己。

**修复**：在当前工具的副本中补直接依赖，再重跑同一文件：

| 副本 | 添加并同步锁 | 确认 |
| --- | --- | --- |
| yarn | `corepack yarn add --exact string-width@4.2.3` | `corepack yarn node hidden.js` |
| pnpm | `corepack pnpm add --save-exact string-width@4.2.3` | `node hidden.js` |

**确认**：清单出现 string-width，锁同步更新，hidden.js 打印 8；report 的 52 件、2634800 分保持一致。这里的 8 是「机械键盘」的终端显示宽度。

### 清单改了，冻结安装失败

**现象**：在任一副本中，只用编辑器把 dependencies 的 wrap-ansi 从 7.0.0 改为 6.2.0，再运行第 5 节对应的冻结安装命令，命令非零退出。

**工具**：读终端错误，对照清单与锁。Yarn 报 YN0028 并展示预期变化；pnpm 指出不同步；Bun 报告锁需要改变。

**证据**：清单要求 6.2.0，锁仍记录 7.0.0；失败后检查锁，原内容保留。

**原因**：只改要求、未同步锁，冻结命令按约定停止。

**修复**：若只是误改，恢复清单的 7.0.0。若确实要练习切换版本，在对应副本执行不带冻结参数的 `corepack yarn install`、`corepack pnpm install` 或 `bun install`，让本工具同步锁。

**确认**：冻结安装与 report 都成功、输出不变。实际项目还要通过测试和构建。

## 练习

### 练习 1：预测谁在执行 JS

保持 runtime script 不变，预测第 4 节三条运行命令及 `bun run --bun runtime` 的结果，再运行核对。验收：解释后两条差别，回答「bun install 后，node report.js 由谁执行」。

<details>
<summary>提示</summary>

先判断参数是文件还是 script，再看实际命令和 --bun。

</details>

<details>
<summary>参考答案</summary>

依次是 Node、Bun、Node、Bun。第三条启动 script 内的 node；第四条显式让它使用 Bun。bun install 只准备依赖，后续 node report.js 仍由 Node 执行，所以「用 Bun 安装」不等于「用 Bun 跑业务」。

</details>

### 练习 2：修复漏声明，保留严格解析

用 prepare-labs.js 生成新副本，选 Yarn 或 pnpm，复现并修复 hidden.js 失败。验收：保留原解析配置，打印 8；冻结安装与报表成功。

<details>
<summary>提示</summary>

用 why 查来源，清单查直接声明；修复自己的声明即可。

</details>

<details>
<summary>参考答案</summary>

在 pnpm 副本安装，运行 node hidden.js 复现失败；用 why 找到来源，再按调试表补声明。Yarn 同理，运行文件经 corepack yarn node 加载环境。

清单与锁一起提交。本实验从这两份文件重建安装；补齐后再冻结安装、运行 report，确认结果正确。

</details>

### 练习 3：写一份工具选择记录

比较 Yarn 和 pnpm，记录工具版本、锁文件、顶层布局、漏声明的结果，再为已有 Node + npm 的库存项目写两句选择理由。验收：报告库存相同，记录能区分安装布局和运行时。

<details>
<summary>提示</summary>

观察 --version、锁文件、安装目录和 runtime 的输出。

</details>

<details>
<summary>参考答案</summary>

Yarn：yarn.lock、PnP 映射文件、漏声明时报告访问错误。pnpm：pnpm-lock.yaml、.pnpm 与链接、漏声明时找不到包。版本各与 packageManager 一致，runtime 都打印 Node，总库存都是 52。

库存项目继续用 Node + npm，沿用现有锁、scripts 和部署；有明确的多包或安装需求时，再用实验与项目测试评估迁移。

</details>

## 小结

- Yarn、pnpm 负责依赖与项目命令；Bun 还提供独立的运行时、测试和打包功能。
- Yarn Modern 默认 PnP，也能使用 node-modules linker；没有 node_modules 时，要用正确的加载环境运行。
- pnpm 用共享存储与链接组织依赖；自己的代码直接使用的包，要在自己的清单声明。
- packageManager 固定工具版本，锁文件固定依赖选择；清单变化后先同步锁，再冻结安装。
- 选择工具要看项目已有约定、兼容性和验证结果；安装成功之后，还要运行程序。

自测：

1. Yarn install 成功却没有 node_modules，下一步怎样确认安装结果？
2. why 能找到 string-width，为什么 hidden.js 仍然失败？
3. Bun 安装依赖后，能继续用 Node 运行程序吗？
4. Corepack、packageManager 和依赖锁文件分别负责什么？

下一课用 Vite 构建库存页，并用 Vitest 写第一批能发现业务错误的单元测试。

## 延伸阅读

- [Yarn：安装方式](https://yarnpkg.com/features/linkers)与 [workspaces](https://yarnpkg.com/features/workspaces)
- [Yarn：Corepack](https://yarnpkg.com/corepack)与 [Node 25 的分发变更](https://nodejs.org/download/release/latest-v25.x/docs/api/corepack.html)
- [pnpm：链接布局](https://pnpm.io/symlinked-node-modules-structure)与[安装命令](https://pnpm.io/cli/install)
- [Bun：运行命令](https://bun.com/docs/runtime)与[锁文件](https://bun.com/docs/pm/lockfile)
- [Bun：Node API 兼容性](https://bun.com/docs/runtime/nodejs-compat)
- [Corepack：项目工具版本与调用方式](https://github.com/nodejs/corepack)
