# C07 this、原型与 class · 示例

配套正文：[C07](../../src/content/docs/02-language-data/c07-this-prototypes.md)。纯 JS 文件独立运行，没有第三方依赖。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| method-call.js | `node method-call.js` | 同一函数由不同接收对象调用 |
| plain-call.js | `node plain-call.js` | 严格模式普通调用的 this |
| explicit-this.js | `node explicit-this.js` | call/apply 立即调用，bind 返回回调 |
| arrow-this.js | `node arrow-this.js` | 箭头沿用外层 this，读取当前库存 |
| constructor-stock.js | `node constructor-stock.js` | 构造函数、实例数据与共享方法 |
| prototype-lookup.js | `node prototype-lookup.js` | 自有/继承属性、遮蔽与删除 |
| class-stock.js | `node class-stock.js` | class、私有字段、补货入口 |
| inheritance.js | `node inheritance.js` | extends、super 与原型链接 |
| detached-broken.js | `node detached-broken.js` | 方法作为普通回调丢失接收者，捕获 TypeError |
| detached-fixed.js | `node detached-fixed.js` | 箭头回调与 bind 两种修复 |
| prediction.js | `node prediction.js` | 练习 1，原型查找与 this 分别判断 |
| arrow-method-broken.js | `node arrow-method-broken.js` | 练习 2，箭头错误地沿用工厂的 this |
| arrow-method-fixed.js | `node arrow-method-fixed.js` | 练习 2，改成普通方法 |
| index.html | 本地网页 | 断点练习，默认加载 detached-broken.js |

## 运行

- Node：在本目录执行上表命令。仓库根目录执行 `npm run examples -- c07`，核对 13 份 `.expected.txt`。
- 本地网页：在本目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，用 Chrome 打开 `http://127.0.0.1:8000/`。
- 项目：进入 `../inventory/01-core`，运行 `node demo.js`。完整说明见该目录的 README。

## 验收输入

| 改动 | 预期 |
| --- | --- |
| arrow-this.js 用 `keyboard.createReader.call(dock)` 创建回调 | 三次输出均为 3 |
| class-stock.js 补货 0、-1、3.8、99999、字符串 "3" | RangeError；已补货后的库存保持 15 |
| 把带私有字段的方法借给 `{ stock: 12 }` | TypeError；普通对象没有该私有字段 |
| 项目用绑定回调筛选音频 | 仅 P006；原库存仍有 6 项 |
| 项目构造传入空数组、未知分类 | 条目数为 0、筛选结果为空数组 |
| 向构造时传入的数组或 select 结果增删元素 | Inventory 内部条目数保持 6；商品对象仍共享引用 |

## 验证记录

- 2026-10-16 · Node 24.22.0 · macOS arm64：`npm run examples -- c07` 13/13；全量 82/82；正文 13 个带标题代码块与文件逐字一致，项目片段与参考文件一致。
- 同日：上表输入、类的原型关系、两个库存实例独立、普通/绑定回调、固定商品不变均实际执行通过。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：13 个 JS 文件逐个运行，输出均与预期一致；本地网页暂停在 readStock，修复前 this 为 undefined，上层 runReport 的 callback 为该方法；直接调用仍返回 12。两种修复的断点都读到报告实例与库存 12，输出均为 12。
- 同日：D2 SVG 编译并检查渲染；课程 lint、Astro check、完整 build 通过。
- 同日：[Pages run 38866722105](https://github.com/socoo123/js_web/actions/runs/38866722105) 构建与部署成功；新课、路线页与 D2 返回 200，课程 HTML 与 D2 的 SHA-256 均与本地构建一致。
- 未运行：在 DevTools 界面上手动点击（面板路径按官方文档核对）、Firefox、Safari、Windows。

## V2 连续工作区

2026-10-28 · 发行版 2026.10-v2.2：本课在 `labs/inventory/` 持续修改，`npm run lab -- check C07` 检查实际文件。C00→C20 的单目录正文跟做、错误证据与修复见 [R5 验证](../../labs/records/R5.md)。Java 完整源文件在 labs/reference/java，已用 Java 21.0.2 执行；旧例子保留为可选参考。网站使用原 URL 与 F1 课号。
