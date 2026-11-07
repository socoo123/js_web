// L6 第二关「Bug 猎人」。lines 是可以算作找到根源的行（从 1 开始），decoys 给常见误判的行写针对性提示。
// verify.run === 'node' 的题由 scripts/check-capstone.mjs 分别运行 code 与 fixRun，核对 buggy/fixed 输出；
// React 题在 C48 工作区副本里用 RTL 复现，记录见 labs/capstone/README.md。

export const BUGS = [
  {
    id: 'bug-closure-var', area: 'lang', lesson: 'C06', anchor: '六个回调都返回-p006',
    title: '每个选择函数都返回最后一件商品',
    scenario: '期望打印 `P001 P004 P006`，实际打印 `P006 P006 P006`。',
    lang: 'js', file: 'src/core/inventory.js',
    code: `function createProductSelectors(products) {
  const selectors = [];
  for (var product of products) {
    selectors.push(() => product.id);
  }
  return selectors;
}

const products = [{ id: "P001" }, { id: "P004" }, { id: "P006" }];
const selectors = createProductSelectors(products);
console.log(selectors.map((select) => select()).join(" "));`,
    lines: [3],
    decoys: {
      4: '回调本身没问题：它读的是名字 `product`。关键是这个名字属于哪一个作用域。',
      11: '调用方式没问题，`select()` 在循环结束后才执行，这正是暴露问题的时机。',
    },
    hint: '三个箭头函数是在循环结束之后才被调用的。它们读到的 `product` 是同一个绑定，还是每轮各有一个？',
    symptom: '三个函数返回同一个 id。Sources 里在回调内暂停，Scope 面板显示它们共享同一个 `product` 绑定，值已经是 P006。',
    cause: '`var` 属于整个函数作用域，三轮循环共用一个 `product`；回调捕获的是绑定本身，调用时循环早已结束。',
    fixLang: 'js',
    fix: `function createProductSelectors(products) {
  const selectors = [];
  for (const product of products) {
    selectors.push(() => product.id);
  }
  return selectors;
}`,
    fixNote: '`const` / `let` 在 for…of 的每一轮创建新的绑定，每个回调保留自己那一轮的商品。',
    verify: { run: 'node', buggy: 'P006 P006 P006', fixed: 'P001 P004 P006', patch: [['var product', 'const product']] },
  },
  {
    id: 'bug-sort-mutates', area: 'lang', lesson: 'C08', anchor: '4-先分清方法是否修改输入',
    title: '生成报表之后，原商品顺序被打乱',
    scenario: '报表按库存升序没问题，但之后列表页的原顺序也变成了 `P002 P003 P001`。',
    lang: 'js', file: 'src/core/report.js',
    code: `const products = [
  { id: "P001", stock: 12 }, { id: "P002", stock: 0 }, { id: "P003", stock: 7 },
];

function lowestFirst(list) {
  return list.sort((left, right) => left.stock - right.stock);
}

const report = lowestFirst(products);
console.log("报表", report.map((p) => p.id).join(" "));
console.log("原数组", products.map((p) => p.id).join(" "));`,
    lines: [6],
    decoys: {
      9: '调用本身没问题。问题在于函数里面那一步会不会改动传进来的数组。',
      11: '打印只是暴露了结果：原数组确实被改了。找一找是哪一步改的。',
    },
    hint: '比较器写对了。`sort` 返回的是新数组，还是排好序的原数组？',
    symptom: '两行都打印 `P002 P003 P001`。在 `lowestFirst` 返回前比较 `result === list`，得到 true。',
    cause: '`sort` 原地排序并返回同一个数组，「生成报表」顺手改掉了调用方的数据。',
    fixLang: 'js',
    fix: `function lowestFirst(list) {
  return list.toSorted((left, right) => left.stock - right.stock);
}`,
    fixNote: '`toSorted` 用同样的比较规则返回新数组；也可以写 `[...list].sort(...)`。',
    verify: { run: 'node', buggy: '报表 P002 P003 P001\n原数组 P002 P003 P001', fixed: '报表 P002 P003 P001\n原数组 P001 P002 P003', patch: [['list.sort(', 'list.toSorted(']] },
  },
  {
    id: 'bug-fetch-ok', area: 'web', lesson: 'C13', anchor: '404-最后却报-json-解析错误',
    title: '文件不存在，页面却报 JSON 解析错误',
    scenario: '请求 `./missing.json`，期望看到「HTTP 404」，Console 里却是 `SyntaxError`。',
    lang: 'js', file: 'src/vanilla/loader.js',
    code: `export async function loadProducts(url = "./products.json") {
  const response = await fetch(url);
  const text = await response.text();
  return importProducts(text);
}

try {
  await loadProducts("./missing.json");
} catch (error) {
  console.log(error.name + "：" + error.message);
}`,
    lines: [2, 3],
    decoys: {
      4: '`importProducts` 只是忠实地报告「这段文字不是 JSON」。它是症状出现的地方，不是原因。',
      9: 'catch 接住了错误，问题在于它接住的是哪一种错误。',
    },
    hint: 'Network 里这次请求的状态码是多少？`fetch` 遇到 404 时会拒绝吗？',
    symptom: 'Network 里 missing.json 是 404，Response 是一段 HTML；Console 报 `SyntaxError`，说正文不是有效的 JSON。',
    cause: '`fetch` 只在网络失败时拒绝。HTTP 404 照样得到 Response，代码没检查 `response.ok` 就去解析 HTML 正文。',
    fixLang: 'js',
    fix: `export async function loadProducts(url = "./products.json") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  const text = await response.text();
  return importProducts(text);
}`,
    fixNote: '先判断状态，再读取正文。修复后打印 `Error：HTTP 404`。',
    verify: {
      run: 'node', module: true,
      setup: 'globalThis.fetch = async () => new Response("<!doctype html><h1>Not Found</h1>", { status: 404 });\nconst importProducts = (text) => JSON.parse(text);\n',
      buggyIncludes: 'SyntaxError：', fixed: 'Error：HTTP 404',
      patch: [['  const text = await response.text();', '  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n  const text = await response.text();']],
    },
  },
  {
    id: 'bug-stale-timeout', area: 'react', lesson: 'C23', anchor: '4-延迟补货要基于执行时的待更新值',
    title: '延迟补货吞掉了中途的补货',
    scenario: '库存 12。点「延迟补三件」，两秒内再点一次「立即补一件」：先看到 13，两秒后变成 15，而不是 16。',
    lang: 'jsx', file: 'src/react/StockActions.jsx',
    code: `import { useState } from "react";

export function StockActions() {
  const [stock, setStock] = useState(12);
  function restockLater() {
    setTimeout(() => {
      setStock(stock + 3);
    }, 2000);
  }
  return <>
    <p role="status">P001 当前库存 {stock} 件</p>
    <button onClick={() => setStock((previous) => previous + 1)}>立即补一件</button>
    <button onClick={restockLater}>延迟补三件</button>
  </>;
}`,
    lines: [7],
    decoys: {
      6: '延迟本身是需求。问题在于两秒后用哪个值来计算。',
      12: '这一行用了 updater，是正确的写法。对比一下延迟那一行。',
    },
    hint: '定时回调是在哪一次渲染里创建的？它读到的 `stock` 是那次渲染的快照，还是两秒后的最新值？',
    symptom: 'React DevTools 里 state 先变成 13，定时器执行后直接变成 15。在定时回调里暂停，`stock` 仍是 12。',
    cause: '回调捕获的是点击那次渲染的 `stock`（12），两秒后 `setStock(12 + 3)` 把中途补到的 13 替换掉了。',
    fixLang: 'jsx',
    fix: `function restockLater() {
  setTimeout(() => {
    setStock((previous) => previous + 3);
  }, 2000);
}`,
    fixNote: 'updater 拿到的是执行时队列里的待更新值，从 13 算起，得到 16。',
    verify: { source: 'C23 第 4 节；verify-capstone-workspace 用 RTL 假定时器运行：旧写法 15，updater 16' },
  },
  {
    id: 'bug-index-key', area: 'react', lesson: 'C24', anchor: '商品正确备注却属于另一行',
    title: '删除一行后，备注跑到了别的商品上',
    scenario: '键盘行写「键盘待盘点」，鼠标行写「鼠标待盘点」。删除 P001 后，P002 那一行显示「键盘待盘点」。',
    lang: 'jsx', file: 'src/react/ProductList.jsx',
    code: `export default function ProductList({ products }) {
  return <section aria-label="商品列表">
    {products.map((product, index) => <ProductRow key={index} product={product} />)}
  </section>;
}

function ProductRow({ product }) {
  const [note, setNote] = useState("");
  return <article>
    <h3>{product.name}</h3>
    <label>{product.id} 行备注
      <input value={note} onChange={(event) => setNote(event.target.value)} /></label>
  </article>;
}`,
    lines: [3],
    decoys: {
      8: '备注放在行组件的局部 state 里是合理的设计。问题在于 React 把这份 state 交给了哪一行。',
      12: '受控输入写法正确。看看 React 用什么认出「这一行还是原来那一行」。',
    },
    hint: '删除第一项后，原来 key 为 0 的位置现在放的是哪件商品？',
    symptom: 'React DevTools → Components 里，第一行 ProductRow 的 `props.product.id` 已是 P002，Hooks 里的 note 却是「键盘待盘点」。',
    cause: 'key 用的是显示位置。删掉 P001 后 P002 移到位置 0，React 复用了旧位置 0 的组件和它的 state。',
    fixLang: 'jsx',
    fix: `{products.map((product) => <ProductRow key={product.id} product={product} />)}`,
    fixNote: '用稳定的商品 id 作 key，state 跟商品走，不跟第几行走。',
    verify: { source: 'C24 常见错误与调试；verify-capstone-workspace 用 RTL 运行' },
  },
  {
    id: 'bug-effect-race', area: 'react', lesson: 'C30', anchor: '3-后发先到旧结果为什么覆盖新选择',
    title: '切到鼠标后，详情又变回了键盘',
    scenario: '先选 P001（响应慢），马上切到 P002（响应快）。详情先显示无线鼠标，过一会儿又变回机械键盘。',
    lang: 'jsx', file: 'src/react/ProductDetail.jsx',
    code: `function ProductDetail({ productId }) {
  const [request, setRequest] = useState({ status: "loading" });
  useEffect(() => {
    setRequest({ id: productId, status: "loading" });
    async function load() {
      const product = await loadProduct(productId);
      setRequest({ id: productId, status: "success", product });
    }
    load();
  }, [productId]);
  if (request.status !== "success") return <p role="status">加载中…</p>;
  return <h2>{request.product.name}</h2>;
}`,
    lines: [7, 9],
    decoys: {
      6: '请求本身没错，两次请求都正常返回了。问题在于谁有资格把结果写进 state。',
      10: '依赖写对了：productId 变了就该重新加载。少的是另一样东西。',
    },
    hint: '切到 P002 时，P001 那次 Effect 有没有被「作废」？它晚到的结果会不会照样写入？',
    symptom: 'Network 里两次请求都成功，P001 的响应晚到。在第 7 行设条件断点，看到 productId 为 P001 的闭包在 P002 之后执行了写入。',
    cause: '每次 Effect 都无条件写结果，又没有 cleanup。最后完成的请求决定显示什么，而不是最后的选择。',
    fixLang: 'jsx',
    fix: `useEffect(() => {
  let ignore = false;
  setRequest({ id: productId, status: "loading" });
  async function load() {
    const product = await loadProduct(productId);
    if (!ignore) setRequest({ id: productId, status: "success", product });
  }
  load();
  return () => { ignore = true; };
}, [productId]);`,
    fixNote: '每次 setup 有自己的 `ignore`，cleanup 把旧的那份作废。课文里还用 AbortController 释放请求资源。',
    verify: { source: 'C30 第 3 节；react.dev 获取数据时的竞态；verify-capstone-workspace 用 RTL 运行' },
  },
  {
    id: 'bug-ui5-path', area: 'ui5', lesson: 'C41', anchor: '筛选后保存错了商品',
    title: '筛选后保存，改到了另一件商品',
    scenario: '搜索 P004 后只剩一行。编辑它、保存库存 8：P004 仍是 3，P001 的位置却被 P004 的草稿覆盖。',
    lang: 'js', file: 'adapters/openui5/webapp/controller/Inventory.controller.js',
    code: `onEdit(event) {
  const item = event.getSource().getParent();
  const table = this.byId("products");
  const row = table.indexOfItem(item);
  this._editPath = "/products/" + row;
  const context = item.getBindingContext("inventory");
  this.getView().setModel(new JSONModel(rules.toDraft(context.getObject())), "draft");
  this.byId("editDialog").open();
},
onSave() {
  const result = rules.parseDraft(this.getView().getModel("draft").getData());
  const inventory = this.getView().getModel("inventory");
  const current = inventory.getProperty(this._editPath);
  inventory.setProperty(this._editPath, { ...current, ...result.value });
},`,
    lines: [4, 5],
    decoys: {
      7: '草稿用独立的 JSONModel，这一步是对的，所以取消不会改正式数据。',
      14: 'setProperty 是正确的写入入口。问题是写到了哪条路径。',
    },
    hint: '筛选后只剩一行，`indexOfItem` 得到几？这件商品在 `/products` 原数组里排第几？',
    symptom: '在 onEdit 暂停：`row` 是 0，`context.getPath()` 却是 `/products/3`。保存写进了 `/products/0`。',
    cause: '把可见行（筛选后的投影）里的位置当成了原数组的索引。',
    fixLang: 'js',
    fix: `onEdit(event) {
  const context = event.getSource().getBindingContext("inventory");
  this._editPath = context.getPath();
  this.getView().setModel(new JSONModel(rules.toDraft(context.getObject())), "draft");
  this.byId("editDialog").open();
},`,
    fixNote: '绑定上下文知道这一行对应模型里的哪条路径，保存就用它。',
    verify: { source: 'C41 常见错误与调试；UI5 文档 Binding Context；verify-capstone-workspace 注入 C48 副本后 C41 浏览器检查失败、修复后通过' },
  },
  {
    id: 'bug-vite-base', area: 'delivery', lesson: 'C46', anchor: '构建成功线上首页却是空白',
    title: '构建成功，子路径预览却是空白页',
    scenario: '`npm run lab -- build` 成功。用严格静态服务器打开 `http://127.0.0.1:8068/js_web/demos/inventory/`，页面空白。',
    lang: 'js', file: 'vite.config.js',
    code: `import { defineConfig } from "vitest/config";
export default defineConfig({
  base: "/",
  build: { sourcemap: true },
  test: { environment: "node", include: ["tests/**/*.test.{js,jsx}"] },
});`,
    lines: [3],
    decoys: {
      4: 'source map 只影响调试时能否回到源码，不影响资源地址。',
      5: '测试配置只在 Vitest 里生效，和构建出的资源地址无关。',
    },
    hint: '打开 dist/src-react/index.html，看 script 的 src 以什么开头？服务器只在哪个前缀下提供文件？',
    symptom: 'Network 里入口 JS 的 Request URL 是 `/assets/…js`，返回 404。产物 index.html 里引用的也是 `/assets/…`。',
    cause: '构建前缀与部署前缀不一致。build 成功只证明能生成文件，不证明这些文件在子路径下找得到。',
    fixLang: 'js',
    fix: `export default defineConfig({
  base: "/js_web/demos/inventory/",
  build: { sourcemap: true },
  test: { environment: "node", include: ["tests/**/*.test.{js,jsx}"] },
});`,
    fixNote: '改回部署子路径后要重新 build，只刷新旧产物不会变。',
    verify: { source: 'C46 常见错误与调试；Vite 文档 base；verify-capstone-workspace 在 C48 副本构建并探测子路径' },
  },
];
