# C25 表单、校验与可访问性 · 示例

配套正文：[C25](../../src/content/docs/05-react/c25-forms-validation-accessibility.md)。数据来自 shared/products.js，真实 React 表单在[阶段 4](../inventory/04-react/)。

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| value-boundary.js | node value-boundary.js | 空库存与明确输入 0 的区别 |
| price-cents.js | node price-cents.js | 十进制价格转整数分，拒绝三位小数与单位 |
| validate-draft.js | node validate-draft.js | 草稿转业务记录，旧商品保持原值 |
| prediction.js | node prediction.js | FormData 字符串、字段存在与 null |
| invalid-draft.js | node invalid-draft.js | 三项错误全部收集，禁止产出业务值 |
| 阶段 4 src/product-form.js | 由组件/Node 导入 | 解析、精确单价格式化、草稿和字段校验 |
| 阶段 4 src/ProductForm.jsx | dev / 生产首页 | 名称、分类、库存、单价与热销；错误说明和焦点 |
| 阶段 4 tests/forms.test.jsx | npm test | 22 条正常回归：业务边界、输入、提交、取消、错误关联与焦点 |
| 阶段 4 labs/forms-bugs.test.jsx | npm run test:bug -- labs/forms-bugs.test.jsx | 两项故意失败，修改各 Broken 文件后通过 |

## 运行

- 仓库根目录：`npm run examples -- c25`，自动核对 5 个固定输出；在本目录也可执行各 node 命令。
- 阶段 4：`npm ci`、`npm run dev -- --host 127.0.0.1`，打开终端的 /js_web/ 地址。
- 在该地址后加 labs/forms.html?case=下表值。实验页只由 dev 服务提供，不进入生产构建。
- 阶段 4 正常检查：`npm test`、`npm run build`、`npm run preview -- --host 127.0.0.1`。

| case | 操作与预期 |
| --- | --- |
| controlled | 名称改为键盘待盘点，再清空，输入值均保留 |
| locked | 错误起点：输入新名称仍恢复机械键盘；setName 改存 event.target.value 后正常 |
| uncontrolled | 修改名称后提交，结果含 string / true；取消热销再提交为 false |
| native | 空、-1、1.5 阻止提交；0 用 Enter 提交成功 |
| blank / blank-answer | 空库存错误保存为 0 / 正确提示库存无效，明确输入 0 可以保存 |

## 验证记录

- 2026-10-17 · macOS arm64 · Node 24.22.0、npm 11.19.1；沿用 React/react-dom 19.3.1、Vite 8.3.4、Vitest 5.0.5、happy-dom 21.0.3，没有修改任何依赖清单或锁文件。
- 固定输出 5/5；阶段 4 正常回归 42/42。两项 bug 测试先分别报机械键盘未改变、空库存已保存为 0；按正文修改 LockedNameBroken 与 BlankStockBroken 后原测试 2/2 通过，最终恢复教学错误起点。
- 独立后台 Chrome 155.0.8059.82：六个实验、原生缺失/范围/步长校验、真实文本输入、复选框空格切换与 Enter 提交均通过；未操作已有 Chrome 窗口。
- 断点停在 LockedNameBroken 的 setter 前，name=机械键盘、event.target.value=键盘待盘点；记录由调试接口取得，另一个断点记录 stock=空字符串、Number(stock)=0；没有在 DevTools 界面手动逐项点击。
- 首页按正文操作：P002 的纯空格名称/-1/129.999 显示三项错误、聚焦名称、总库存仍 52；改为无线鼠标/3/129.90/热销并 Enter 保存后为 55 件、26737.70 元，焦点在标题。
- 取消不保存草稿，焦点回编辑按钮，再开读取已保存值；鼠标搜索中改名为办公指针，保存后空列表仍提示成功，标题保留焦点，清空搜索可见新名。P004 改分类为音频并取消热销后仍保留新品。
- 刷新后全程用 Tab/Enter 打开 P001，焦点顺序为名称→分类→库存→单价→热销→保存→取消，Enter 保存后到标题。360/1280px 无横向溢出，所有文本与选择控件均有关联 label。
- 边界回归包含 0/99999、空白/负数/小数/指数/越界库存，非法分类、超长名称、三位小数与超安全整数价格；接近安全上限的价格打开草稿再解析仍保持原整数分。
- 阶段 4 npm ci、42 条正常回归、生产构建通过；网站 lint 25 课零 error/warning、check 零诊断、build 固定输出 222/222、30 个 HTML 与 25 课产物检查通过。正文 7704 字符、16 个代码块，全部来自示例源码，5 个具名片段逐字一致。
- 生产预览编辑 P002 库存为 3 得到 55 件、26735.00 元；课程在禁用 JS 的 360/1280px 下可读、六个答案区可展开、16 段代码齐全；路线页为 25/48。
- Pages：[run 39030596833](https://github.com/socoo123/js_web/actions/runs/39030596833) build/deploy 成功；C25 与路线页均 HTTP 200，课程标题、示例和项目结果已上线，路线为 25/48。
- 未运行：屏幕阅读器朗读、Firefox、Safari、Windows。
