# C08 Array 与业务数据处理 · 示例

配套正文：[C08](../../src/content/docs/02-language-data/c08-arrays-processing.md)。纯 JS 文件使用共享固定数据，没有第三方依赖。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| array-basics.js | `node array-basics.js` | 下标、越界读取、循环统计 |
| pipeline.js | `node pipeline.js` | filter 选商品、map 生成文字 |
| queries.js | `node queries.js` | find/some/every 与空数组 |
| default-sort.js | `node default-sort.js` | 默认字符串顺序、原地排序 |
| sorted-copy.js | `node sorted-copy.js` | 数字比较器与排序副本 |
| stable-sort.js | `node stable-sort.js` | 有货在前、稳定性、共享对象 |
| slice-splice.js | `node slice-splice.js` | 截取与原地删除的区别 |
| update-copy.js | `node update-copy.js` | map 复制目标商品，不改原库存 |
| sparse.js | `node sparse.js` | 空位、显式 undefined、展开 |
| totals.js | `node totals.js` | 带初始值的 reduce 与整数分 |
| labels-broken.js | `node labels-broken.js` | map 回调漏 return，保留错误输出 |
| labels-fixed.js | `node labels-fixed.js` | 显式返回标签，调试参考答案 |
| prediction.js | `node prediction.js` | 练习 1 |
| category-report.js | `node category-report.js` | 练习 3：分类筛选与统计 |
| index.html | 本地网页 | 加载 labels-broken.js，供断点调试 |

## 运行

- Node：在本目录运行上表命令；仓库根目录运行 `npm run examples -- c08` 核对 14 份 `.expected.txt`。
- 本地网页：在**仓库根目录**运行 `python3 -m http.server 8000 --bind 127.0.0.1`，用 Chrome 打开 `http://127.0.0.1:8000/examples/c08/`。服务根目录需包含 `examples/shared`。
- 项目：进入 `../inventory/01-core`，运行 `node demo.js`；输出由该目录的 `demo.expected.txt` 核对。

## 验收输入

| 改动 | 预期 |
| --- | --- |
| 低库存条件去掉 `stock > 0` | 多出 P002：0 件 |
| category-report.js 增加分类「其他」 | 其他：0 种，0 件 |
| 练习 2：修 return 后先按库存排序再生成标签 | 首项 P002、末项 P005，原商品 id 顺序不变 |
| 项目排序改成库存降序 | 首项 P005，原顺序和统计不变 |
| 项目使用空商品数组 | 排序与筛选为空数组，四个统计字段为 0 |
| 修改排序结果的数组结构、修改一次 summary 返回值 | 内部种数仍为 6，下次统计仍为 52 件 |

## 验证记录

- 2026-10-16 · Node 24.19.0 · macOS arm64：`npm run examples -- c08` 14/14；正文 14 个带标题代码块与对应文件逐字一致。
- 同日：上表变体、ES2023 的 toSpliced/toReversed、升降序、对象引用共享、固定数据未修改均实际执行通过。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：14 个模块的输出与预期一致；本地网页在回调内读到 P001 / 机械键盘，回调后 labels 长度为 6、首项为 undefined；加载参考修复内容后首项为 P001：机械键盘。
- 同日：全量示例 96/96；课程 lint 零 error / warning，Astro check 零问题，完整 build 与 `/js_web/` 产物检查通过。
- 同日：[Pages run 38868560351](https://github.com/socoo123/js_web/actions/runs/38868560351) 构建与部署成功；新课及路线页返回 200，两页 HTML 的 SHA-256 均与本地构建一致。
- 未运行：在 DevTools 界面上手动点击、Firefox、Safari、Windows。
