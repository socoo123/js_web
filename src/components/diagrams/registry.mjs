// 课程机制图登记表：课文用 <Diagram name="…" /> 引用；check-build 按这里核对每课的构建 HTML 都含 data-diagram。
// description 是图的可访问描述（沿用原图 alt 的含义），title 显示在图的标题条。
export const DIAGRAMS = {
  'c01-ecosystem': {
    lessonId: 'C01',
    title: '语言规则、业务代码、运行环境与工具',
    description: '生态关系图：ECMAScript 定义语言规则；库存业务使用变量、函数和 Array，选定浏览器、Node 或 Bun 运行。每种环境组合引擎与不同 API；npm、Yarn、pnpm 管理 React、UI5 等项目依赖。',
  },
  'c02-page-flow': {
    lessonId: 'C02',
    title: '从加载页面到处理一次提交',
    description: '页面加载：浏览器取得 HTML，建立 DOM，加载 CSS 和模块脚本；脚本查找节点并绑定事件，用户提交后再更新页面。',
  },
  'c03-value-boundary': {
    lessonId: 'C03',
    title: '输入边界：外部文本只在入口处理一次',
    description: '输入边界：文本先经过非空检查、Number 转换和整数范围校验，再参与库存计算，最后转换成显示文字。',
  },
  'c04-scope': {
    lessonId: 'C04',
    title: '读取一个名字时的绑定查找',
    description: '作用域查找流程：从当前作用域寻找 warehouse，找不到就沿外层继续；找到后检查初始化状态，已初始化就读取，未初始化就因 TDZ 抛 ReferenceError。所有外层都没有绑定时，也抛 ReferenceError。',
  },
  'c05-alias-copy': {
    lessonId: 'C05',
    title: '别名、浅复制与按路径复制',
    description: '对象关系图：original 与 alias 指向同一商品对象，draft 指向新商品对象；两个商品的 warehouse 仍指向同一仓库。independent 和它的新仓库分别独立。',
  },
  'c06-closure-environment': {
    lessonId: 'C06',
    title: '两次工厂调用，两份词法环境',
    description: '闭包引用图：nextKeyboard 与 sameCounter 指向第一次工厂调用返回的同一个 next 函数，读写同一份 count；nextMouse 指向另一次调用创建的 next，读写独立的 count。',
  },
  'c07-prototype-lookup': {
    lessonId: 'C07',
    title: '沿原型链查找方法，按接收者确定 this',
    description: '原型链查找图：读取 keyboard.readStock 时先查实例，再找到 ProductStock.prototype 上的函数；后面依次是 Object.prototype 和 null。通过 keyboard 调用方法时，this 仍指向 keyboard，读取它自己的 stock 12。',
  },
  'c10-category-traversal': {
    lessonId: 'C10',
    title: '同一棵分类树的 DFS 与 BFS 访问次序',
    description: '分类树遍历机制：DFS 沿调用栈深入一个分类，BFS 把同层节点放入队列；两者对每个节点访问一次。',
  },
  'c12-browser-event-loop': {
    lessonId: 'C12',
    title: '浏览器主线程的一轮循环（简化）',
    description: '调用栈、任务队列与微任务队列的执行顺序：当前任务的同步函数执行完毕返回后，进入微任务检查点，执行已排队的 Promise 回调直到微任务队列清空；到了渲染时机才布局与绘制，本轮也可能跳过；随后浏览器选择下一个可运行任务，例如到期的定时器回调或用户交互，进入下一轮。',
  },
  'c16-esm-dependencies': {
    lessonId: 'C16',
    title: '模块依赖与包安装是两个层次',
    description: 'ESM 依赖图与包安装布局：模块依赖部分，app.js 静态导入公开入口 inventory.js 和 storage.js，storage.js 复用入口的校验与统计，入口转发 validation、stock、summary 等业务函数。包安装部分，npm ci 检查 package.json 与 package-lock.json，不一致就安装失败；一致则从 registry 或缓存取得锁定内容，安装到 node_modules 并建立命令入口，再由 npm run report 调用 Node 报表。两部分没有时序关系。',
  },
  'c23-state-snapshot': {
    lessonId: 'C23',
    title: '状态快照与更新队列',
    description: 'React 状态快照：本次渲染拿到 12，事件排入更新，函数式队列依次计算 13、14、15；新渲染拿到 15，旧回调仍能读到旧绑定。',
  },
  'c29-effect-lifecycle': {
    lessonId: 'C29',
    title: 'Effect 的 setup 与 cleanup 配对，以及请求竞态',
    description: '左栏展示 setup、StrictMode 的 cleanup 与重新 setup，以及依赖变化和卸载清理；右栏展示请求过期后的响应被拦截。',
  },
  'c39-ui5-family-binding': {
    lessonId: 'C39',
    title: 'UI5 家族关系与经典 UI5 的 MVC 绑定',
    description: 'UI5 家族与经典 MVC 绑定图：Fiori 指导经典 UI5 和 Web Components；React 包装 Web Components；经典 UI5 由 View 事件经 Controller 更新 Model，再由绑定通知控件。',
  },
  'c46-static-build-pages': {
    lessonId: 'C46',
    title: '静态构建、部署与浏览器访问',
    description: '静态交付关系图：Node在构建环境生成文件，Actions上传完整产物，Pages按路径返回HTML与资源；浏览器取得首页后解析React hash路由。',
  },
};

export function diagramInfo(name) {
  const info = DIAGRAMS[name];
  if (!info) throw new Error(`未登记的机制图：${name}`);
  return info;
}
