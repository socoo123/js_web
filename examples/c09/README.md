# C09 Object、Map、Set 与弱集合 · 示例

配套正文：[C09](../../src/content/docs/02-language-data/c09-maps-sets.md)。沿用共享固定商品数据，没有第三方依赖。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| object-dictionary.js | `node object-dictionary.js` | 属性键转换、数字键顺序、原型与无原型字典 |
| map-operations.js | `node map-operations.js` | Map 增删查改、缺失与插入顺序 |
| key-identity.js | `node key-identity.js` | 对象键按身份匹配，数字与字符串键不同 |
| id-index.js | `node id-index.js` | 按 id 建索引、共享引用与 JSON 条目数组 |
| grouping.js | `node grouping.js` | 按分类分组并统计件数 |
| tags.js | `node tags.js` | 标签字符串去重与 Set 操作 |
| set-equality.js | `node set-equality.js` | 对象身份、SameValueZero、NaN 与零 |
| iteration.js | `node iteration.js` | next、展开后的进度、Object.entries |
| weak-metadata.js | `node weak-metadata.js` | 一份快照的检查结果与检查标记 |
| index-broken.js | `node index-broken.js` | Map 误写成对象属性，保留错误输出 |
| index-fixed.js | `node index-fixed.js` | 改用 set，调试参考答案 |
| prediction.js | `node prediction.js` | 练习 1：覆盖、顺序与身份 |
| tags-broken.js | `node tags-broken.js` | 练习 2：错误地给标签数组去重 |
| tags-answer.js | `node tags-answer.js` | 练习 2 参考答案：标签与空输入 |
| project-check.js | `node project-check.js` | 练习 3：项目行为与边界验收，仅 Node |
| index.html | 本地网页 | 加载 index-broken.js，供断点调试 |

## 运行

- Node：进入本目录运行上表命令；仓库根目录运行 `npm run examples -- c09` 核对 15 份 `.expected.txt`。
- 本地网页：在**仓库根目录**运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c09/`。
- 项目：进入 `../inventory/01-core`，运行 `node demo.js`；完整输出由该目录的 `demo.expected.txt` 核对。

## 验收输入

| 改动或检查 | 预期 |
| --- | --- |
| 标签仅取配件、仅取外设、空输入 | 热销/新品、热销、空数组；多次调用互不残留 |
| 分组预先加入 `其他 → []` | 其他：0 种，0 件 |
| 再次展开已经耗尽的迭代器 | 空数组 |
| 补货后删除两个弱集合中的标记再检查 | 从待补货更新为有货 |
| 字符串 id 索引转条目数组、JSON 往返、new Map 重建 | P004 名称仍为 USB-C 扩展坞 |
| WeakMap/WeakSet 使用字符串 id、普通对象直接数组展开 | TypeError |
| 项目传入重复 P001、查询 P999、空库存 | 拒绝重复 id、undefined、空分组/标签 |
| 修改返回的组数组、Map、标签数组再查询 | 下一次结果仍完整；商品对象继续共享 |

## 验证记录

- 2026-10-16 · Node 24.19.0 · macOS arm64：`npm run examples -- c09` 15/15；正文 14 个带标题代码块与文件逐字一致。
- 同日：上表变体与弱集合接口缺失检查均实际运行通过；固定统计仍为 52 件、2634800 分、售罄 1 种、低库存 2 种，分类库存依次为 12/7/28/5 件。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：14 个浏览器可用模块的输出全部匹配；project-check.js 使用 Node assert，仅在 Node 运行。
- 同日：本地网页首处日志断点读取到 size=0、has=false、hasOwn=true、属性 P001 的名称为机械键盘；以 index-fixed.js 的内容加载后，断点处 size=6、has=true、hasOwn=false，get 查询成功。
- 同日：全量示例 111/111；课程 lint 零 error / warning，Astro check 零问题，完整 build 与 `/js_web/` 产物检查通过。
- 同日：[Pages run 38871515466](https://github.com/socoo123/js_web/actions/runs/38871515466) 构建与部署成功；新课和路线页返回 200，两页 HTML 的 SHA-256 均与本地构建一致。
- 弱集合仅验证可观察的查询与删除行为，未强制触发或测量垃圾回收。
- 未运行：DevTools 界面手动点击、Firefox、Safari、Windows。
