# C11 DOM、事件、表单与页面调试 · 示例

| 文件 | 运行 | 说明 |
| --- | --- | --- |
| index.html | 本地网页 | 全部浏览器示例入口 |
| dom.html + dom.js | 本地网页 | 查询、静态 NodeList 与节点创建 |
| text.html + text.js + xss.js | 本地网页 | 纯文本显示与本地 XSS 标记，故意产生 missing.png 404 |
| events.html + events.js | 本地网页 | 捕获、目标、冒泡与 target/currentTarget |
| stock-input.js | `node stock-input.js` | 库存文本解析及六个边界输入 |
| prediction.js | `node prediction.js` | 练习 1：函数身份和回调 |
| duplicate.html + duplicate-broken.js | 本地网页 | 重复监听，第二次点击从 13 到 15 |
| duplicate-fixed.html + duplicate-fixed.js | 本地网页 | 修复后两次点击从 12 到 14 |
| removal.html + removal-broken.js | 本地网页 | 删除了列表容器的 bug |
| removal-fixed.html + removal-fixed.js | 本地网页 | 保留容器，替换内容 |
| ../inventory/02-web/ | 本地网页 | 事件委托、组合筛选、原生校验、库存编辑与焦点管理 |

## 运行

- 在本目录运行两个 Node 命令；仓库根目录 `npm run examples -- c11` 比较 `.expected.txt`。
- 在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c11/`。
- 项目页为 `http://127.0.0.1:8000/examples/inventory/02-web/`。
- XSS 演示只设置当前页面的 dataset 标记；替换为 textContent 后应显示原始字符串且不执行。

## 验证记录

- 2026-10-16 · Node 24.22.0 / npm 11.19.1 · macOS arm64：两个固定输出文件 2/2 通过。
- 同日 · Chrome 155.0.8059.82（headless，经 DevTools 协议驱动）：
  - dom.html 输出 1、2、null；textContent 原样显示标签，innerHTML 的图片错误处理执行并显示标记 1。
  - events.html 点击 span，依次输出外层捕获、按钮监听 SPAN BUTTON、外层冒泡。
  - 事件断点：第二次点击在两个回调中先后观察到 stock=13、14，最终 15；修复版两次点击为 14。
  - DOM 节点删除断点：暂停在 list.remove()，此时 isConnected=true；继续后节点脱离页面。修复版空筛选和恢复均保留容器。
  - 项目起始数据与 shared/products.json 一致；6 种、52 件、26348.00 元；P002 改 3 后 55 件、26735.00 元。
  - 组合筛选、空态、分类来回三次、重绘后的 span 委托和全部商品汇总通过。
  - 空值、-1、3.8、100000 被原生校验拒绝且展示错误；0、3、99999 保存通过；刷新恢复独立初始数据。
  - textContent 安全替换未生成图片或执行属性；练习 2 错误版点 span 失效，修复后可编辑。
  - 自定义校验错误能在重新输入后清除；同一函数重复注册只执行一次；CSS display 显隐与 isConnected 区分通过。
  - Enter 提交、Space 激活、Tab 到取消、保存/取消后的焦点恢复和筛选隐藏商品后的搜索框回退通过，无页面脚本异常。
- 同日：正文 10 个完整 JS 代码块与示例逐字一致，3 个项目片段来自 app.js；内容 lint 零 error/warning，astro check 零诊断，build 与全量 125/125 示例通过；本地 /js_web/ 预览返回 200，标题、代码块、折叠答案和路线页通过。
- 同日：[Pages Actions 38913333294](https://github.com/socoo123/js_web/actions/runs/38913333294) 成功；文章与路线页均返回 200，HTML 与本地构建逐字节一致。
- 未运行：在 DevTools 界面上手动点击的路径、Firefox、Safari、真实手机；面板名称依据 Chrome 官方文档。
