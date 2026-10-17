# 库存项目 · 阶段 3：Node 与工具

当前参考状态：C20 完成。保留 Node 报表与原 scripts，加入 Vite 构建、Vitest 测试与独立的 TypeScript 短实验；业务模块继续复用阶段 1、2。

## 运行

需要 Node 24 与 npm 11。先按本目录的锁文件安装开发工具；报表本身仍只依赖 Node 内建模块和本仓库业务代码。

在本目录执行：

```sh
npm ci
npm run report
npm run report -- ../../shared/products.json inventory-report.txt
npm run report -- ../../shared/products.json accessories.txt 配件
LOW_STOCK_LIMIT=0 npm run report -- ../../shared/products.json no-alert.txt 配件
npm run versions
```

LOW_STOCK_LIMIT 那条使用 macOS/Linux shell 语法。已有输出文件会返回 EEXIST，换一个新文件名再运行。生成的文件是本地练习结果，无需提交。`node cli.js` 等 C17 直接运行方式仍然可用。

默认读取固定 JSON，打印 6 种商品、52 件、2634800 分（26348.00 元）、售罄 1、低库存 2；分类为外设 2、显示器 1、配件 2、音频 1，标签为热销、新品。配件为 2 种、28 件、587200 分（5872.00 元）。

versions 使用本地 semver 命令按 `^7.0.0` 筛选 6.3.1、7.8.5、8.0.0，打印 7.8.5。semver 是开发依赖，精确锁为 7.8.5；`npm ls --depth=0` 查看直接依赖，`npm explain semver` 查看其来源。清单与锁只属于本目录，不使用网站根目录的锁。

| 文件 | 作用 |
| --- | --- |
| cli.js | 异步读文件、解析 JSON、写报告与进程出口 |
| options.js | 解析三个位置参数和 LOW_STOCK_LIMIT |
| report.js | 校验数据，按分类筛选后复用 Inventory 统计 |
| ../01-core/inventory.js | 原有业务模块，不使用 DOM 或 fs |
| ../02-web/validation.js | 原有纯字段校验函数，不访问浏览器存储 |
| package.json / package-lock.json | 本目录独立的 ESM 项目、scripts、开发工具依赖与锁文件 |

## 输入与输出规则

- 位置参数：`[输入JSON] [输出文本] [分类]`，全部可省略；分类为全部、外设、显示器、配件、音频。
- 未传输入时按 options.js 位置找到 `../../shared/products.json`；传入的输入和输出按当前工作目录解析。
- JSON 是商品数组，与 shared/products.json 一致；空数组合法。网页导出的 `{ version, products }` 快照需先取 products，不能直接当商品数组输入。
- LOW_STOCK_LIMIT 默认为 5，须为 0–99999 整数文本，空白无效；低库存为 `0 < stock <= limit`，0 关闭该计数。所有字段在分类筛选前校验。
- 先解析并校验，再生成报告，最后写新文件；`flag: "wx"` 拒绝覆盖已有文件。读、解析、校验失败时不会创建报告；写入中的系统错误可能留下不完整新文件，排错后换新输出名。
- 成功的报告写 stdout；指定输出时同样打印报告并保存 UTF-8 文本。失败写 stderr，exitCode 为 1，源 JSON 不被修改。
- cli.js 不启动 HTTP 服务，也不读取浏览器 localStorage；GitHub Pages 不执行这个 CLI。

## 验证

仓库根目录执行 `npm run examples -- c17`，会运行 project-report.js 和 cli-cases.js，对真实 CLI 的默认/分类/空数据、跨 cwd、环境变量、错误出口、已有文件保护进行验证。记录见 [examples/c17](../../c17/README.md)。

C18 的 `npm ci`、两个 scripts、参数转发、重复写入的非零退出，以及依赖树/本地命令均已执行；固定输出在根目录用 `npm run examples -- c18` 核对，安装实验明细见 [examples/c18](../../c18/README.md)。

## C20：构建与测试

在本目录安装后执行 `npm test`（4 个文件、38 条）、`npm run build`（输出本目录 dist）、`npm run preview`；开发使用 `npm run dev`。页面入口直接复用 ../02-web/index.html，代码复用 ../01-core/inventory.js，没有复制原生页面。

| 文件或命令 | 作用 |
| --- | --- |
| vite.config.js | 以阶段 2 为 root，base 为 /js_web/；dist 输出到阶段 3，清理专用产物、生成 source maps、小资源输出文件 |
| vitest.config.js / tests/ | Node 环境下运行统计、库存修改、报告入口与异步加载测试 |
| npm run test:watch | 显式 watch；文件变化后重跑，q 退出 |
| vitest.bug.config.js / labs/ | `npm run test:bug` 运行故意带错的低库存统计，预期失败；修复后原用例应通过 |
| type-bridge/ | 独立 TS 错误起点；build:bridge 仅构建，check:bridge 只类型检查，preview:bridge 预览 |

本地 dev/preview 都使用 /js_web/ 路径。预览只读取已有 dist，修改源文件后需重建。课程网站的 Astro 构建与本目录的 Vite 构建各自独立；此库存产物未在 Pages 发布。

test:bug 和 check:bridge 的原始失败是教学实验，不进入正常 npm test、npm run build。修复参考见 [examples/c20](../../c20/README.md)，运行、浏览器与映射断点记录也在该文件中。
