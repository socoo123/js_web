// L6 第一关题库。文字里只支持 `代码` 与 [文字](/js_web/...)；review 指向课文小节（标题 slug 或课文里的显式 <a id>）。
// verify 记录答案的依据：node 表示 scripts/check-capstone.mjs 会用 Node 实际运行 code 并核对正确选项；
// 其余写明依据（课文小节与官方文档），浏览器/React 题的实测记录见 labs/capstone/README.md。

/** @typedef {'lang' | 'web' | 'tooling' | 'react' | 'ui5' | 'delivery'} AreaId */

export const AREAS = [
  {
    id: 'lang', label: '语言与数据', short: '语言', range: 'C03–C10',
    review: [{ text: 'L1 库存规则与数据', href: '/js_web/labs/l1/' }],
  },
  {
    id: 'web', label: '浏览器、DOM、异步与存储', short: '浏览器', range: 'C02、C11–C15',
    review: [{ text: 'L2 可用的原生库存页', href: '/js_web/labs/l2/' }],
  },
  {
    id: 'tooling', label: '模块、Node、包管理、构建与 UT', short: '工具链', range: 'C16–C20',
    review: [{ text: 'L2 可用的原生库存页', href: '/js_web/labs/l2/' }],
  },
  {
    id: 'react', label: 'React', short: 'React', range: 'C21–C36',
    review: [{ text: 'L3 React 库存应用', href: '/js_web/labs/l3/' }],
  },
  {
    id: 'ui5', label: '组件库与 UI5', short: 'UI5', range: 'C37–C44',
    review: [{ text: 'L4 组件库与 UI5 适配', href: '/js_web/labs/l4/' }],
  },
  {
    id: 'delivery', label: '调试、测试、交付与标准', short: '交付', range: 'C01、C45–C48',
    review: [{ text: 'L5 调试与静态交付', href: '/js_web/labs/l5/' }, { text: 'C01 历史与生态', href: '/js_web/01-history-web/c01-story-ecosystem/' }],
  },
];

export const QUESTIONS = [
  // ---------- ① 语言与数据 ----------
  {
    id: 'lang-convert', area: 'lang', type: 'predict', lesson: 'C03', anchor: '3-文本先转换再校验',
    prompt: '输入框读到的值是文本 `"3"`。三行分别打印什么？',
    lang: 'js',
    code: `const text = "3"; // 输入框读到的值
console.log(12 + text);
console.log(12 - text);
console.log(Number("  "));`,
    options: ['123\n9\n0', '15\n9\n0', '123\n9\nNaN', '15\n-9\nNaN'],
    answer: [0],
    explain: '`+` 碰到字符串就拼接，`-` 只做数值运算，所以先得到 `123`、再得到 9。`Number` 遇到只剩空白的文本得到 0，这就是入口要先判空、再转换、最后校验范围的原因。',
    verify: { run: 'node' },
  },
  {
    id: 'lang-tdz', area: 'lang', type: 'predict', lesson: 'C04', anchor: 'let--const初始化前处于暂时性死区',
    prompt: '调用 `readTotals()` 后，终端里会看到什么？',
    lang: 'js',
    code: `function readTotals() {
  console.log(typeof oldTotal);
  console.log(total);
  var oldTotal = 0;
  let total = 52;
}
readTotals();`,
    options: ['undefined\n抛出 ReferenceError', 'undefined\nundefined', 'number\n52', '抛出 ReferenceError'],
    answer: [0],
    explain: '`var` 在函数开头就建立并初始化为 `undefined`。`let` 的绑定也已存在，但执行到声明之前处于暂时性死区（TDZ），读取就抛 ReferenceError。所以第一行正常打印，第二行中断执行。',
    verify: { run: 'node', error: 'ReferenceError' },
  },
  {
    id: 'lang-shallow', area: 'lang', type: 'predict', lesson: 'C05', anchor: '3-别名与浅复制新的外层可能仍共享内层',
    prompt: '用展开语法建草稿，改完后原商品是什么样？',
    lang: 'js',
    code: `const product = { id: "P004", stock: 3, tags: ["热销", "新品"] };
const draft = { ...product };
draft.stock = 8;
draft.tags.push("促销");
console.log(product.stock, product.tags.length);`,
    options: ['3 3', '3 2', '8 3', '8 2'],
    answer: [0],
    explain: '展开只复制外层。`stock` 是原始值，改草稿不影响原商品；`tags` 复制的是同一个数组的引用，`push` 改的就是原商品的标签。修改哪条路径，就重建那条路径，例如 `tags: [...product.tags]`。',
    verify: { run: 'node' },
  },
  {
    id: 'lang-closure', area: 'lang', type: 'predict', lesson: 'C06', anchor: '每次调用工厂创建独立的绑定',
    prompt: '三个名字指向哪些计数器？最后一行打印什么？',
    lang: 'js',
    code: `function createCounter(start) {
  let count = start ?? 0;
  return () => ++count;
}
const keyboard = createCounter();
const same = keyboard;
const display = createCounter(12);
console.log(keyboard(), same(), display());`,
    options: ['1 2 13', '1 1 13', '1 2 1', '0 1 12'],
    answer: [0],
    explain: '`keyboard` 和 `same` 指向同一个返回函数，读写同一份 `count`，所以先 1 后 2。`display` 来自另一次工厂调用，有自己的 `count`，从 12 加到 13。',
    verify: { run: 'node' },
  },
  {
    id: 'lang-this', area: 'lang', type: 'predict', lesson: 'C07', anchor: '2-callapplybind明确给出接收者',
    prompt: '`call` 和 `bind` 分别给了哪个接收者？',
    lang: 'js',
    code: `"use strict";
function stockAfter(amount) {
  return this.stock + amount;
}
const keyboard = { id: "P001", stock: 12 };
const dock = { id: "P004", stock: 3 };
const later = stockAfter.bind(keyboard, 3);
console.log(stockAfter.call(dock, 2), later(), later.call(dock));`,
    options: ['5 15 15', '5 15 6', '14 15 5', '5 15 NaN'],
    answer: [0],
    explain: '`call` 立即用 `dock` 当 this 执行，得到 5。`bind` 返回一个固定了 this 和第一个参数的新函数，之后再用 `call` 也换不掉接收者，所以两次都是 15。',
    verify: { run: 'node' },
  },
  {
    id: 'lang-sort', area: 'lang', type: 'predict', lesson: 'C08', anchor: 'sort-为什么把-12-排在-3-前面',
    prompt: '不传比较器排序，结果和原数组是什么关系？',
    lang: 'js',
    code: `const stocks = [9, 80, 100, 7];
const result = stocks.sort();
console.log(result.join(", "));
console.log(result === stocks);`,
    options: ['100, 7, 80, 9\ntrue', '7, 9, 80, 100\ntrue', '7, 9, 80, 100\nfalse', '100, 7, 80, 9\nfalse'],
    answer: [0],
    explain: '不传比较器时，`sort` 把元素转成字符串比较，`"100"` 的首字符最小。它还原地排序并返回同一个数组。数字排序写 `(a, b) => a - b`，要保留原数组就用 `toSorted`。',
    verify: { run: 'node' },
  },
  {
    id: 'lang-map', area: 'lang', type: 'predict', lesson: 'C09', anchor: '对象键按身份匹配',
    prompt: 'Map 里有几个键？两次查询分别得到什么？',
    lang: 'js',
    code: `const keyboard = { id: "P001" };
const notes = new Map([[keyboard, "待盘点"]]);
notes.set({ id: "P001" }, "复制品");
notes.set("P001", "按编号");
console.log(notes.size, notes.get({ id: "P001" }), notes.get("P001"));`,
    options: ['3 undefined 按编号', '2 复制品 按编号', '1 待盘点 按编号', '3 复制品 按编号'],
    answer: [0],
    explain: '对象键按身份匹配：两个 `{ id: "P001" }` 字面量是不同的对象，所以 Map 有三个键，用新对象查询得到 `undefined`。按「同一件商品」查找，用稳定的字符串 id。',
    verify: { run: 'node' },
  },
  {
    id: 'lang-undo', area: 'lang', type: 'single', lesson: 'C10', anchor: '补了三件撤销后还是-15',
    prompt: '撤销功能先把记录压栈：`history.push(product)`，再执行 `product.stock += 3`。P001 从 12 补到 15 后撤销，库存仍是 15。根本原因是什么？',
    options: [
      '栈里保存的是商品对象的引用，之后改 `product.stock`，「旧记录」也跟着变成 15',
      '`push` 放在了末尾，撤销应该用 `shift` 取最早的记录',
      '数组不适合当栈，应该改用 Map 保存历史',
      '撤销时又压入了一条历史，抵消了这次恢复',
    ],
    answer: [0],
    explain: '栈的用法没有问题，问题是保存了之后仍会变化的别名：`history[0]` 和 `product` 是同一个对象。改为保存旧值 `{ id, stock: product.stock }` 或独立快照，撤销时恢复它。',
    verify: { source: 'C10 常见错误与调试' },
  },

  // ---------- ② 浏览器、DOM、异步与存储 ----------
  {
    id: 'web-network', area: 'web', type: 'single', lesson: 'C02', anchor: '卡片还在按钮却没有响应',
    prompt: '页面的 `<script src="./app.js">` 被误写成 `./ap.js`。刷新后卡片还在，按钮却没反应。最先应该在哪里找证据？',
    options: [
      'Network：勾选 Disable cache 重新加载，看这个脚本请求的状态码',
      'Elements：检查按钮的 CSS 是否挡住了点击',
      '在按钮的处理函数里加一行 `console.log`，看有没有打印',
      '清空浏览器缓存，再多刷新几次',
    ],
    answer: [0],
    explain: '卡片来自 HTML 本身，脚本没加载时它照样出现。Network 里 `ap.js` 返回 404，这就是事件监听没执行的证据。加日志、清缓存都证明不了原因。',
    verify: { source: 'C02 常见错误与调试' },
  },
  {
    id: 'web-textcontent', area: 'web', type: 'single', lesson: 'C11', anchor: '2-显示文字用-textcontent',
    prompt: '导入的商品名是 `<img src=x onerror=alert(1)>`。要在卡片标题里按原样显示这段文字，应该怎么写？',
    options: [
      '`title.textContent = product.name`',
      '`title.innerHTML = product.name`',
      '`title.innerHTML = "<span>" + product.name + "</span>"`',
      '`title.outerHTML = product.name`',
    ],
    answer: [0],
    explain: '`textContent` 只写文本节点，标签和事件属性都按文字显示。`innerHTML` 会把字符串解析成结构和行为，拼接导入的数据就可能执行里面的事件属性。',
    verify: { source: 'C11 第 2 节；MDN Node.textContent' },
  },
  {
    id: 'web-event-loop', area: 'web', type: 'predict', lesson: 'C12', anchor: '2-主线程任务与微任务各在什么时候执行',
    prompt: '四行日志按什么顺序出现？',
    lang: 'js',
    code: `console.log("同步 1");
setTimeout(() => console.log("任务"), 0);
Promise.resolve().then(() => console.log("微任务"));
console.log("同步 2");`,
    options: ['同步 1\n同步 2\n微任务\n任务', '同步 1\n任务\n微任务\n同步 2', '同步 1\n微任务\n同步 2\n任务', '同步 1\n同步 2\n任务\n微任务'],
    answer: [0],
    explain: '当前的同步代码先跑完。调用栈清空后先处理微任务（Promise 回调），再轮到下一个任务（`setTimeout` 回调）。延迟 0 只表示可以排队，插不到同步代码前面。',
    verify: { run: 'node' },
  },
  {
    id: 'web-then-return', area: 'web', type: 'predict', lesson: 'C12', anchor: '3-返回内层-promise等待才能接成链',
    prompt: '第二个 `then` 拿到的是什么？',
    lang: 'js',
    code: `Promise.resolve(12)
  .then((stock) => { stock + 3; })
  .then((stock) => console.log(stock));`,
    options: ['undefined', '15', '12', '抛出 TypeError'],
    answer: [0],
    explain: '花括号函数体里没有 `return`，回调隐式返回 `undefined`，下一步就拿到 `undefined`。`then` 的返回值决定下一步：普通值成为成功值，返回的 Promise 会被继续等待。',
    verify: { run: 'node' },
  },
  {
    id: 'web-foreach', area: 'web', type: 'predict', lesson: 'C13', anchor: '4-等待一组任务顺序由依赖决定',
    prompt: '在模块顶层运行，`await` 等到两次加载了吗？',
    lang: 'js',
    code: `const loaded = [];
await ["P001", "P004"].forEach(async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  loaded.push(id);
});
console.log(loaded.length);`,
    options: ['0', '2', '1', '抛出 TypeError'],
    answer: [0],
    explain: '`forEach` 返回 `undefined`，不收集回调返回的 Promise，`await undefined` 几乎立刻继续。互不依赖的任务先 `map` 成 Promise 数组，再 `await Promise.all(...)`。',
    verify: { run: 'node', module: true },
  },
  {
    id: 'web-storage', area: 'web', type: 'single', lesson: 'C14', anchor: '1-localstorage-保存字符串不保存引用',
    prompt: '执行 `localStorage.setItem("stock", 12)` 后，`localStorage.getItem("stock") + 3` 得到什么？',
    options: ['`"123"`', '`15`', '`NaN`', '`null`'],
    answer: [0],
    explain: 'localStorage 只保存字符串，数字写入时被转成 `"12"`。读回来是文本，`+` 就变成拼接。业务数据用 JSON 编码保存，读回后先解析、再按商品规则校验。',
    verify: { source: 'C14 第 1 节；MDN Storage.setItem' },
  },
  {
    id: 'web-box', area: 'web', type: 'single', lesson: 'C15', anchor: '1-盒模型决定实际占用的空间',
    prompt: '这张卡片的外框实际多宽？把 `box-sizing` 换成 `border-box` 呢？',
    lang: 'css',
    code: `.card {
  box-sizing: content-box;
  width: 200px;
  padding: 12px;
  border: 2px solid;
}`,
    options: ['228px；border-box 下 200px', '200px；border-box 下 228px', '214px；border-box 下 200px', '224px；border-box 下 176px'],
    answer: [0],
    explain: '`content-box` 的 width 只量内容区，padding 和 border 另加：200 + 12 × 2 + 2 × 2 = 228。`border-box` 把它们算进 width，外框就是 200px，内容区缩成 172px。margin 始终在外框之外。',
    verify: { source: 'C15 第 1 节；MDN box-sizing；verify-capstone-workspace 在 Chromium 测量' },
  },

  // ---------- ③ 模块、Node、包管理、构建与 UT ----------
  {
    id: 'tool-live-binding', area: 'tooling', type: 'predict', lesson: 'C16', anchor: '3-活绑定初始化与动态加载',
    prompt: '两个模块文件如下，运行 `node main.js` 打印什么？',
    lang: 'js',
    code: `// counter.js
export let count = 0;
export function next() { count++; }

// main.js
import { count, next } from "./counter.js";
const before = count;
next();
next();
console.log(before, count);`,
    options: ['0 2', '0 0', '2 2', '抛出 TypeError'],
    answer: [0],
    explain: 'ESM 导入的是只读活绑定：导出模块改了 `count`，导入方读到新值。`const before = count` 保存的是当时的值 0。导入方不能给 `count` 重新赋值。',
    verify: {
      run: 'node',
      files: {
        'counter.mjs': 'export let count = 0;\nexport function next() { count++; }\n',
        'main.mjs': 'import { count, next } from "./counter.mjs";\nconst before = count;\nnext();\nnext();\nconsole.log(before, count);\n',
      },
      entry: 'main.mjs',
    },
  },
  {
    id: 'tool-default-import', area: 'tooling', type: 'single', lesson: 'C16', anchor: '常见错误与调试',
    prompt: '`validation.js` 里只有 `export function parseStock(...)`。另一个模块写成 `import parseStock from "./validation.js"`，页面报模块错误，而 Network 里 `validation.js` 是 200。原因是？',
    options: [
      '模块没有默认导出；具名导出要写成 `import { parseStock } from "./validation.js"`',
      '路径不对，浏览器里导入应该去掉 `.js` 扩展名',
      '200 说明模块没问题，是浏览器缓存了旧文件',
      'ESM 只能导入对象，不能直接导入函数',
    ],
    answer: [0],
    explain: '文件已下载成功，失败发生在接口匹配：默认导入要求模块有 `export default`，具名导出要用花括号按名字导入。资源 404 和导出不匹配是两种故障，先看 Network，再读 Console 的第一条错误。',
    verify: {
      run: 'node', error: 'SyntaxError', stderr: "does not provide an export named 'default'",
      files: {
        'validation.mjs': 'export function parseStock(text) { return Number(text); }\n',
        'main.mjs': 'import parseStock from "./validation.mjs";\nconsole.log(parseStock("3"));\n',
      },
      entry: 'main.mjs',
      checkOption: false,
    },
  },
  {
    id: 'tool-cwd', area: 'tooling', type: 'single', lesson: 'C17', anchor: '2-路径先确定基准再读取文件',
    prompt: '报表脚本写 `readFile("data/products.json", "utf8")`。在工作区运行正常，退到上一级目录运行 `node inventory/src/cli/report.js` 就报 ENOENT。正确的修复是？',
    options: [
      '用 `new URL("../../data/products.json", import.meta.url)` 按模块文件定位',
      '改成以斜杠开头的 `/data/products.json`',
      '规定运行前必须先 `cd` 到 src/cli 目录',
      '用 try/catch 包住 readFile，失败时返回空数组',
    ],
    answer: [0],
    explain: '相对路径从 `process.cwd()`（启动进程的目录）开始找，不是从源文件所在的目录。读取模块自带的资源以 `import.meta.url` 为基准，从哪个目录启动都能找到。',
    verify: { source: 'C17 第 2 节；Node 文档 import.meta.url' },
  },
  {
    id: 'tool-npm-ci', area: 'tooling', type: 'single', lesson: 'C18', anchor: '2-版本范围与锁回答不同问题',
    prompt: '你只在 package.json 里把一个依赖改成锁文件不接受的版本范围，然后运行 `npm ci`。会发生什么？',
    options: [
      '`npm ci` 失败，提示清单与锁不同步；有意改依赖要用 `npm install`，再审查两份文件的差异',
      '`npm ci` 自动更新 package-lock.json 后再安装',
      '`npm ci` 忽略 package.json，只按锁安装',
      '应该先删掉 package-lock.json，再运行 `npm ci`',
    ],
    answer: [0],
    explain: '`npm ci` 要求清单与已有的锁一致，然后按锁重建 node_modules，它不是升级命令。有意升级依赖用 `npm install`，审查清单与锁的差异后一起提交。',
    verify: { source: 'C18 第 2 节；npm 文档 npm ci' },
  },
  {
    id: 'tool-runtime', area: 'tooling', type: 'single', lesson: 'C19', anchor: '1-先分清谁安装谁执行',
    prompt: 'package.json 的 scripts 写着 `"report": "node src/cli/report.js"`。用 `pnpm run report` 执行时，是谁在运行这段 JS？',
    options: [
      'Node：pnpm 只负责找到并启动这条脚本命令',
      'pnpm 自带的 JS 引擎',
      '取决于 node_modules 是用哪个包管理器装的',
      'Bun，因为 pnpm 在底层调用 Bun',
    ],
    answer: [0],
    explain: '运行时执行 JS 并提供宿主 API；npm、Yarn、pnpm 是包管理器，负责解析、安装、锁定依赖和启动脚本。脚本里写的是 `node`，运行时就是 Node。',
    verify: { source: 'C19 第 1 节' },
  },
  {
    id: 'tool-assert', area: 'tooling', type: 'multi', lesson: 'C20', anchor: '2-第一批-ut正常空非法与不变性',
    prompt: '下面哪些 Vitest 断言能正确表达意图？（多选）',
    options: [
      '`expect(summarize(products)).toEqual({ count: 6, stock: 52, valueCents: 2634800, soldOut: 1, lowStock: 2 })`',
      '`expect(summarize(products)).toBe({ count: 6, stock: 52, valueCents: 2634800, soldOut: 1, lowStock: 2 })`',
      '`expect(() => parseStock(" ")).toThrow(RangeError)`',
      '`expect(parseStock(" ")).toThrow(RangeError)`',
    ],
    answer: [0, 2],
    explain: '`toBe` 比较数值或身份，两个对象永远不是同一个对象；比较结构用 `toEqual`。`toThrow` 要接一个尚未执行的函数，直接调用会在断言接管之前就抛出异常。',
    verify: { source: 'C20 第 2 节；Vitest 文档 toBe/toEqual/toThrow；verify-capstone-workspace 用 Vitest 运行' },
  },
  {
    id: 'tool-ts', area: 'tooling', type: 'predict', lesson: 'C20', anchor: '5-typescript-短桥接类型会被擦除',
    prompt: '用只转译、不检查类型的方式运行这段 TypeScript（例如 Vite 开发服务，或 Node 24 直接运行 .ts 文件），会打印什么？',
    lang: 'ts',
    code: `const stock: number = "3";
console.log(stock + 1);`,
    options: ['31', '4', '运行前报类型错误，什么都不打印', 'NaN'],
    answer: [0],
    explain: '转译只是删掉类型标注，剩下的 JS 照常运行，字符串 `"3"` 加 1 拼成 `31`。只有 `tsc` 这类类型检查才会报 string 不能赋给 number。类型在运行时被擦除，导入的 JSON 仍要用代码校验。',
    verify: { run: 'node', ext: 'ts' },
  },

  // ---------- ④ React ----------
  {
    id: 'react-lowercase', area: 'react', type: 'single', lesson: 'C21', anchor: '六张商品卡片都没出现',
    prompt: '把 `<ProductCard key={product.id} product={product} />` 误写成 `<productCard … />`。刷新后 Elements 面板里会看到什么？',
    options: [
      '六个 `productcard` 标签，里面没有 article；`ProductCard` 函数根本没执行',
      '六张正常的卡片，JSX 标签名不区分大小写',
      'React 报语法错误，整个页面空白',
      '六个空的 article 元素',
    ],
    answer: [0],
    explain: 'JSX 把小写名字当成 HTML 标签，大写名字才指向作用域里的组件函数。所以 React 创建了未知标签 `productcard`，`ProductCard` 里的断点不会命中；开发模式的 Console 还会提示 `<productCard />` 大小写不对。',
    verify: { source: 'C21 常见错误与调试；verify-capstone-workspace 用 RTL 与 renderToStaticMarkup 运行' },
  },
  {
    id: 'react-and-zero', area: 'react', type: 'predict', lesson: 'C22', anchor: '3-条件渲染先算-js再看哪些值显示',
    prompt: 'P002 没有标签（`tags` 是空数组）。这个 div 渲染成什么 HTML？',
    lang: 'jsx',
    code: '<div>{products[1].tags.length && <p>有标签</p>}</div>',
    options: ['<div>0</div>', '<div></div>', '<div><p>有标签</p></div>', '<div>false</div>'],
    answer: [0],
    explain: '`&&` 返回操作数本身：左边是 0，整个表达式就是 0，而 React 会把数字 0 显示出来。可选内容写明确的布尔条件，例如 `tags.length > 0 && …`。',
    verify: { source: 'C22 第 3 节；react.dev 条件渲染；verify-capstone-workspace 用 renderToStaticMarkup 运行' },
  },
  {
    id: 'react-queue', area: 'react', type: 'predict', lesson: 'C23', anchor: '3-批处理与更新队列',
    prompt: 'P001 本次渲染的 `stock` 是 12。同一次点击里依次执行下面三行，下一次渲染显示几？',
    lang: 'jsx',
    code: `setStock((previous) => previous + 1);
setStock(stock + 5);
setStock((previous) => previous * 2);`,
    options: ['34', '26', '36', '17'],
    answer: [0],
    explain: '队列按顺序处理：updater 把 12 变成 13；传值 `stock + 5` 用的是本次渲染的快照 12，直接替换成 17；最后的 updater 把 17 乘 2。所以是 12 → 13 → 17 → 34。',
    verify: { source: 'C23 第 3 节；react.dev 更新队列；verify-capstone-workspace 用 RTL 运行' },
  },
  {
    id: 'react-mutate', area: 'react', type: 'single', lesson: 'C24', anchor: '数组改了页面仍是旧库存',
    prompt: '补货函数先 `product.stock += amount` 修改 state 里的对象，再 `setProducts(products)` 交回同一个数组。点击后页面会怎样？',
    options: [
      '可能仍显示 12：React 用 `Object.is` 发现是同一个数组，可以跳过更新，而且旧快照也被改了',
      '正常显示 13，React 会深比较数组内容',
      '抛出错误，因为 state 里的对象被冻结了',
      '卡片显示 13，只有统计数字不变',
    ],
    answer: [0],
    explain: 'React 按 `Object.is` 比较新旧 state，同一个引用就当成没变化。正确做法是返回新数组，并替换被修改的那个商品对象，例如 `products.map((p) => p.id === id ? { ...p, stock } : p)`。',
    verify: { source: 'C24 常见错误与调试；react.dev 更新 state 中的数组' },
  },
  {
    id: 'react-key-reset', area: 'react', type: 'single', lesson: 'C26', anchor: '4-用-key-表达这次是另一件商品',
    prompt: '编辑器正打开 P001，你直接点「编辑 P002」：标题变成了鼠标，输入框里却还是键盘的草稿。最小的正确修复是？',
    options: [
      '给编辑器加 `key={selectedId}`，告诉 React 这是另一次编辑会话',
      '在编辑器里用 Effect 监听 product，变化时调用 `setDraft`',
      '把草稿挪到 App 的 state，和商品列表放在一起',
      '给编辑器加 `key={Math.random()}`',
    ],
    answer: [0],
    explain: 'React 按树中的位置、类型和 key 保留 state；同位置、同类型的组件收到新 props 不会重建草稿。用商品 id 作 key，切换商品就是新的组件实例。随机 key 会让每次渲染都清空输入。',
    verify: { source: 'C26 第 4 节；react.dev 保留和重置 state' },
  },
  {
    id: 'react-ref', area: 'react', type: 'single', lesson: 'C28', anchor: '2-要在界面显示的值用-state',
    prompt: '盘点计数用 `countRef.current += 1` 保存，JSX 里显示 `{countRef.current}`。点击「盘点 +1」后会看到什么？',
    options: [
      '数字不变，等别的原因触发重新渲染时才跳到新值',
      '数字立即加 1，ref 和 state 一样会触发渲染',
      '报错：ref 不能在 JSX 里读取',
      '每次点击数字都归零',
    ],
    answer: [0],
    explain: '修改 ref 不会触发渲染，渲染时读 `current` 只能拿到那一刻的值。要显示在页面上的值用 state；ref 适合保存计时器句柄、DOM 节点这类不参与显示的值。',
    verify: { source: 'C28 第 2 节；react.dev useRef' },
  },
  {
    id: 'react-effect', area: 'react', type: 'multi', lesson: 'C29', anchor: '1-每次-setup-都有自己的-cleanup',
    prompt: '用 Effect 给 `window` 注册快捷键 `addEventListener("keydown", onKey)`，处理函数会调用 prop `onRestock`。下面哪些做法是对的？（多选）',
    options: [
      'Effect 返回 cleanup，用同一个 `onKey` 调用 `removeEventListener`',
      '依赖数组写上 Effect 里读取的 `onRestock`',
      '为了只注册一次，把依赖写成 `[]`，并关闭 lint 提示',
      '开发时 setup 跑了两次，就关闭 StrictMode',
    ],
    answer: [0, 1],
    explain: '每次 setup 都要有对应的 cleanup，否则一次按键会触发多个旧监听。依赖反映 Effect 读取了什么，少写就留住了旧回调。StrictMode 的重复执行是在检查能否清理后重新开始，关掉它只是藏起问题。',
    verify: { source: 'C29 第 1–4 节；react.dev useEffect' },
  },
  {
    id: 'react-query-key', area: 'react', type: 'single', lesson: 'C32', anchor: '3-query-key-和缓存先问是不是同一份数据',
    prompt: '详情查询的 key 写成 `["inventory", "detail"]`，漏了商品 id。先看 P001，再切到 P002，会看到什么？',
    options: [
      '地址是 P002，详情仍是键盘：两次是同一个 key，新鲜的缓存让 P002 不再读取',
      '每次切换都会重新请求，只是慢一点',
      'TanStack Query 报错：key 必须包含参数',
      'P002 显示空白，因为缓存被清空了',
    ],
    answer: [0],
    explain: 'queryKey 就是数据的身份，决定读取结果的参数都要放进去，例如 `["inventory", "detail", id]`。少了 id，不同商品就共用一份缓存。',
    verify: { source: 'C32 常见错误与调试；TanStack Query 文档 Query Keys' },
  },
  {
    id: 'react-action', area: 'react', type: 'single', lesson: 'C33', anchor: '1-操作结果的第一个参数不是表单',
    prompt: '用 `useActionState(saveAction, initial)` 接表单，`saveAction` 写成 `async function saveAction(formData) { formData.get("stock"); … }`。提交时会怎样？',
    options: [
      '报 `formData.get is not a function`：第一个参数是上一次的结果，FormData 是第二个',
      '正常工作，React 会按类型自动匹配参数',
      '`formData` 是 undefined，因为输入框没写 name',
      '浏览器按原生表单提交，页面刷新',
    ],
    answer: [0],
    explain: '`useActionState` 调用操作函数时，先传上次的结果（第一次是初始值），再传本次的 FormData。普通的 `<form action={fn}>` 才把 FormData 放在第一个参数。两种签名不要混用。',
    verify: { source: 'C33 第 1 节；react.dev useActionState' },
  },
  {
    id: 'react-rtl', area: 'react', type: 'single', lesson: 'C35', anchor: 'getqueryfind-的等待规则',
    prompt: 'RTL 测试里要断言「此刻页面上没有保存按钮」，应该写哪一句？',
    options: [
      '`expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument()`',
      '`expect(screen.getByRole("button", { name: "保存" })).toBeNull()`',
      '`expect(await screen.findByRole("button", { name: "保存" })).toBeNull()`',
      '`expect(screen.getAllByRole("button")[2]).not.toHaveTextContent("保存")`',
    ],
    answer: [0],
    explain: '`getBy…` 找不到就立即抛错，不会返回 null；`findBy…` 返回 Promise，用来等待异步出现。断言不存在用 `queryBy…`。靠第几个按钮猜身份很脆弱，名称重复时用 `within` 缩小范围。',
    verify: { source: 'C35 第 2 节；Testing Library 文档 Queries' },
  },

  // ---------- ⑤ 组件库与 UI5 ----------
  {
    id: 'ui5-antd-form', area: 'ui5', type: 'single', lesson: 'C38', anchor: '打开鼠标库存却是刚才键盘的草稿',
    prompt: 'Ant Design 的编辑弹窗关闭时只是隐藏，没有卸载。编辑 P001 输入 8 后按 Esc，再打开 P002，库存框仍是 8。为什么？',
    options: [
      'Form 实例还活着，`initialValues` 只是初值，不会覆盖已经修改的草稿',
      'Table 的 `rowKey` 写错了，打开的其实是 P001',
      'P002 的库存 0 是 falsy，被 Form 忽略了',
      'Modal 默认把上一次的输入存进 localStorage',
    ],
    answer: [0],
    explain: '`initialValues` 只在表单初始化时生效。关闭时卸载编辑会话（弹窗销毁、不保留字段、清掉编辑状态），再打开才会按 P002 的正式数据重新初始化。',
    verify: { source: 'C38 常见错误与调试；Ant Design Form 文档' },
  },
  {
    id: 'ui5-family', area: 'ui5', type: 'multi', lesson: 'C39', anchor: '2-先分清交付物再看长得像不像',
    prompt: '关于 UI5 家族的几个名称，下面哪些说法正确？（多选）',
    options: [
      'OpenUI5 以 Apache-2.0 开源交付，和 SAPUI5 共享核心与 `sap.m` 等常用库',
      'UI5 Web Components 是注册自定义元素的 npm 模块，页面里写 `<ui5-button>`',
      'UI5 Web Components for React 是经典 `sap.m` 控件的 React 皮肤',
      '已有工程用到 SAPUI5 的额外库时，把资源地址换成 OpenUI5 就能运行',
    ],
    answer: [0, 1],
    explain: 'SAPUI5 比 OpenUI5 多出额外的库，所以不能只换加载地址。React 包装库连接的是 UI5 Web Components，不是经典 UI5。判断路线看 import 来源和加载入口，不看截图像不像。',
    verify: { source: 'C39 第 2 节；UI5 官方 SAPUI5 vs OpenUI5' },
  },
  {
    id: 'ui5-binding', area: 'ui5', type: 'single', lesson: 'C40', anchor: '为什么行里没有-products1name',
    prompt: 'Table 写 `items="{inventory>/products}"`，行里的名称写成 `{inventory>/name}`。页面会显示什么？',
    options: [
      '六行都在，名称为空：`/name` 从模型根读取，根上没有 name',
      '六行的名称都显示「机械键盘」',
      'Table 一行都不显示',
      '启动时报错：列表里的绑定必须写相对路径',
    ],
    answer: [0],
    explain: 'Table 从根读 `/products`，每一行拿到当前商品的绑定上下文。行内的相对路径 `inventory>name` 才读当前商品；以斜杠开头的路径永远从模型根开始。',
    verify: { source: 'C40 第 4 节；UI5 文档 Binding Path' },
  },
  {
    id: 'ui5-odata', area: 'ui5', type: 'single', lesson: 'C42', anchor: '4-jsonmodel-与-odatamodel相似的绑定不同的取数方式',
    prompt: 'V2 ODataModel 上 `model.getProperty("/Products(\'P999\')/stock")` 返回 `undefined`。能据此判断服务里没有 P999 吗？',
    options: [
      '不能：getProperty 只读已加载的缓存，不发请求；要用 `read`，在 success/error 回调里拿结果',
      '能：getProperty 会同步请求服务',
      '能：undefined 说明服务返回了 404',
      '不能，因为 ODataModel 没有 getProperty 方法',
    ],
    answer: [0],
    explain: 'JSONModel 的路径指向本地已有的对象；V2 ODataModel 的路径描述服务资源，数据要先读进缓存。`read` 返回请求句柄，结果在回调里。V4 是另一套 API，不能把 V2 的 read 原样搬过去。',
    verify: { source: 'C42 第 4 节；UI5 文档 ODataModel V2' },
  },
  {
    id: 'ui5-boolean-attr', area: 'ui5', type: 'predict', lesson: 'C43', anchor: '按钮始终灰着明明写了-false',
    prompt: '`#save` 是页面上的 `<ui5-button>`。在浏览器 Console 执行下面三行，打印什么？',
    lang: 'js',
    code: `const save = document.querySelector("#save");
save.setAttribute("disabled", "false");
console.log(save.hasAttribute("disabled"), save.disabled);`,
    options: ['true true', 'true false', 'false false', 'false true'],
    answer: [0],
    explain: '布尔 attribute 只要存在就为真，内容写 `"false"` 也一样，按钮仍是禁用的。按条件开关就直接设 property：`save.disabled = busy`。',
    verify: { source: 'C43 第 2 节；verify-capstone-workspace 在 Chromium 对真实 ui5-button 运行' },
  },
  {
    id: 'ui5-react-form', area: 'ui5', type: 'single', lesson: 'C44', anchor: '4-一个原生提交入口文本校验后才保存',
    prompt: 'UI5 React 编辑器写成 `<Form onSubmit={submit}> … <Button type="Submit">保存库存</Button></Form>`，其中大写 Form 是布局组件。点保存会怎样？',
    options: [
      '按钮能按，但 submit 不会执行：大写 Form 只负责排版，没有原生表单可提交',
      '正常保存，`type="Submit"` 会调用 onSubmit',
      '保存两次，点击和 Enter 各触发一次',
      '构建时报 JSX 错误',
    ],
    answer: [0],
    explain: '提交事件来自原生 `<form>`。外层保留 `<form onSubmit={submit}>`，内部再用 Form 排版，点击按钮和按 Enter 都汇合到同一个 submit。',
    verify: { source: 'C44 常见错误与调试' },
  },

  // ---------- ⑥ 调试、测试、交付与标准 ----------
  {
    id: 'del-host', area: 'delivery', type: 'predict', lesson: 'C01', anchor: '3-语言引擎与宿主规则相同能力来自哪里',
    prompt: '用 `node host-probe.js` 运行，三行打印什么？',
    lang: 'js',
    code: `console.log("Array：" + typeof Array);
console.log("document：" + typeof document);
console.log("process：" + typeof process);`,
    options: ['Array：function\ndocument：undefined\nprocess：object', 'Array：function\ndocument：object\nprocess：undefined', 'Array：object\ndocument：undefined\nprocess：object', 'Array：function\n抛出 ReferenceError'],
    answer: [0],
    explain: '`Array` 是语言内建的，浏览器和 Node 都有。`document` 是浏览器提供的 DOM 入口，`process` 是 Node 提供的进程对象。`typeof` 对不存在的名字返回 `"undefined"`，不会抛错。',
    verify: { run: 'node' },
  },
  {
    id: 'del-standard', area: 'delivery', type: 'single', lesson: 'C48', anchor: '4-阅读新版本把标准状态与环境支持分开',
    prompt: '你读到一个特性「已经到 Stage 4」。下面哪个判断是对的？',
    options: [
      '提案已完成、准备纳入年度标准；目标浏览器能不能用，还要查 MDN 兼容表并实际运行',
      'Stage 4 表示所有现代浏览器都已经支持',
      'Stage 4 表示还在设计，语法随时会变',
      '构建工具能转换这个语法，就等于浏览器原生支持',
    ],
    answer: [0],
    explain: '标准状态、环境支持和项目采用是三个独立的问题。Stage 4 只回答第一个；第二个看 MDN 兼容表或目标 Node 文档，再实际运行。转译能处理语法，新 API 可能还要 polyfill。',
    verify: { source: 'C01「最新」需要回答三个问题；C48 第 4 节；TC39 流程文档' },
  },
  {
    id: 'del-url', area: 'delivery', type: 'predict', lesson: 'C45', anchor: 'url-从域名根还是应用目录开始',
    prompt: '页面在 `/js_web/demos/inventory/` 下。两个地址分别解析到哪里？',
    lang: 'js',
    code: `const page = "https://socoo123.github.io/js_web/demos/inventory/";
console.log(new URL("/products.json", page).pathname);
console.log(new URL("products.json", page).pathname);`,
    options: ['/products.json\n/js_web/demos/inventory/products.json', '/js_web/demos/inventory/products.json\n/js_web/demos/inventory/products.json', '/js_web/products.json\n/js_web/demos/inventory/products.json', '/products.json\n/products.json'],
    answer: [0],
    explain: '前导斜线从域名根开始解析，跳出了 `/js_web/demos/inventory/`；不带斜线的相对路径从当前目录开始。部署在子路径时，运行时拼接的地址要用相对路径或 `import.meta.env.BASE_URL`。',
    verify: { run: 'node' },
  },
  {
    id: 'del-hash', area: 'delivery', type: 'predict', lesson: 'C46', anchor: '3-真实静态页面与hash路由刷新走两条路',
    prompt: '刷新 hash 详情页时，服务器收到的是哪个路径？',
    lang: 'js',
    code: `const detail = new URL("https://socoo123.github.io/js_web/demos/inventory/#/products/P004");
console.log(detail.pathname);
console.log(new URL("products/P004/", detail).pathname);`,
    options: ['/js_web/demos/inventory/\n/js_web/demos/inventory/products/P004/', '/js_web/demos/inventory/products/P004\n/js_web/demos/inventory/products/P004/', '/\n/products/P004/', '/js_web/demos/inventory/#/products/P004\n/products/P004/'],
    answer: [0],
    explain: 'hash 不随 HTTP 请求发给服务器：刷新 `#/products/P004` 时服务器只收到首页路径，HashRouter 再在浏览器里显示 P004。干净路径 `products/P004/` 要求服务器真有这个文件，严格的静态托管会返回 404。',
    verify: { run: 'node' },
  },
  {
    id: 'del-test-layer', area: 'delivery', type: 'multi', lesson: 'C47', anchor: '1-从失败后果开始写测试计划',
    prompt: '按「失败后果 → 最小合适层级」给风险选测试。下面哪些搭配合理？（多选）',
    options: [
      '空白库存被当成 0：core 纯函数单元测试',
      '保存失败后能重试：RTL 集成测试，只替换 repository 的结果，保留真实表单与校验',
      '子路径资源 404、hash 详情刷新：生产构建 + 严格静态服务器 + Playwright 浏览器冒烟',
      '360px 下页面不出现横向滚动：在 happy-dom 里写 RTL 测试',
    ],
    answer: [0, 1, 2],
    explain: '规则边界放纯函数 UT，最快最稳；用户操作和请求状态用 RTL；资源路径和路由刷新只有真实浏览器加生产产物能证明。happy-dom 不计算真实布局，窄屏要在浏览器里检查。',
    verify: { source: 'C35 第 1 节；C47 第 1 节' },
  },
  {
    id: 'del-shallow', area: 'delivery', type: 'predict', lesson: 'C48', anchor: '数组换了旧库存却跟着变了',
    prompt: '「数组换了，旧库存却跟着变了」。三个值分别是什么？',
    lang: 'js',
    code: `const products = [{ id: "P001", stock: 12 }, { id: "P002", stock: 0 }];
const next = [...products];
next.find((product) => product.id === "P002").stock = 1;
console.log(next === products, next[1] === products[1], products[1].stock);`,
    options: ['false true 1', 'false false 0', 'true true 1', 'false true 0'],
    answer: [0],
    explain: '展开只复制了数组这一层，元素仍是同一批对象，所以改新数组里的 P002 就改了旧快照。只复制被修改的路径：`products.map((p) => p.id === id ? { ...p, stock } : p)`。',
    verify: { run: 'node' },
  },
];
