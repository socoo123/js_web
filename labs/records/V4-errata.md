# V4 勘误清单

按 [PLAN §5](../../docs/PLAN.md#5-内容边界)：课文正文默认不改，只修知识性错误。已核实并修正的写「已改」，待核实或需要随新发行版一起改的写「待改」。

| 日期 | 位置 | 问题 | 依据 | 处理 |
| --- | --- | --- | --- | --- |
| 2026-11-07 | C43「按钮始终灰着」第 2–3 步 | 写「`getAttribute` 得到字符串 false」。已渲染的 `ui5-button` 执行 `setAttribute("disabled","false")` 后会把值改写成空字符串 | L6 出题时在 Chromium 156 实测，脚本 `scripts/verify-capstone-workspace.mjs` | 已改：正文改读 `hasAttribute`，结论不变；记入 `examples/c43/README.md` |
| 2026-11-07 | C03 输入边界机制图 | 原 D2 图把「判空」画在 `Number` 转换之后，与课文代码和原 alt（判空 → 转换 → 整数/范围）不一致 | 课文代码与 `examples/c03` | 已改：新图按代码顺序 |
| 2026-11-07 | C02 页面加载机制图 | 原 D2 图写「执行 defer 脚本」，工作区实际用 `<script type="module">` | `labs/inventory` 的入口 HTML | 已改：新图写模块脚本，并注明默认按 defer 的时机执行 |
| 2026-11-07 | C39 任务文字（`labs/catalog.json`） | 仍写「阅读现有 D2」，D2 图已换成站内图形组件 | V4 §4.3 | 已改（批次 2）：随新发行版 `2026.11-v4.0` 改为「读懂 UI5 家族图」，`docs/CURRICULUM.md` 同步；旧发行版包字节不变 |
