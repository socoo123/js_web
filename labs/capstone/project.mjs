// L6 第三关「毕业项目」：补货计划。数字由 scripts/check-capstone.mjs 按 examples/shared/products.json 重新计算核对。
// read 指向课文小节；hint 是折叠的参考思路，不给完整答案代码。

export const START = { lesson: 'C48', summary: '库存 52 / 价值 2634800 分' };

// threshold/target → 预期计划；after 是确认补货后页面汇总（库存 / 价值）
export const CASES = [
  { threshold: 5, target: 10, items: [['P002', 10], ['P004', 7], ['P006', 5]], kinds: 3, quantity: 22, costCents: 787800, after: [74, 3422600] },
  { threshold: 7, target: 12, items: [['P002', 12], ['P003', 5], ['P004', 9], ['P006', 7]], kinds: 4, quantity: 33, costCents: 1852700, after: [85, 4487500] },
  { threshold: 0, target: 1, items: [['P002', 1]], kinds: 1, quantity: 1, costCents: 12900, after: [53, 2647700] },
  { threshold: 5, target: 5, error: '目标库存必须大于阈值' },
];

// 挑战：P002 已补完、P004 失败后重试，只补剩下两项
export const PARTIAL = { done: ['P002'], failed: 'P004', remaining: [['P004', 7], ['P006', 5]], quantity: 12, costCents: 658800, after: [74, 3422600] };

export const LEVELS = [
  {
    id: 'must', label: '必做', title: '一条规则，三个入口',
    intro: '同一条补货规则写一次，交给 UT、命令行和 React 页面三处使用。',
    goals: [
      {
        id: 'core', title: '核心规则：`planRestock` 纯函数',
        files: ['src/core/restock-plan.js', 'src/core/inventory.js'],
        body: [
          '在 `src/core/restock-plan.js` 导出 `planRestock(products, { threshold, target })`，返回 `{ items, totalQuantity, totalCostCents }`。每个计划项至少有 `id`、`name`、`from`、`to`、`quantity`、`costCents`。',
          '在 `src/core/inventory.js` 末尾加一行 `export * from "./restock-plan.js";`，页面和命令行都从这个入口导入。',
        ],
        read: [
          { lesson: 'C08', anchor: '2-筛选变换和查询各自返回什么', label: '筛选、变换和查询各自返回什么' },
          { lesson: 'C08', anchor: '5-reduce让上一步的结果进入下一步', label: 'reduce 求合计' },
          { lesson: 'C03', anchor: '2-number整数分与-bigint', label: '金额用整数分' },
          { lesson: 'C05', anchor: '3-别名与浅复制新的外层可能仍共享内层', label: '别名与浅复制' },
        ],
        checks: [
          { id: 'core-5-10', text: '阈值 5、目标 10：返回 P002、P004、P006，合计 22 件、787800 分' },
          { id: 'core-7-12', text: '阈值 7、目标 12：返回四项，合计 33 件、1852700 分' },
          { id: 'core-invalid', text: '目标不大于阈值、负数、小数、超过 99999 都抛 `RangeError`' },
          { id: 'core-pure', text: '调用前后，传入的数组和商品对象都没有变化' },
        ],
        hint: [
          '先校验参数，失败就抛，不返回半成品。',
          '`filter` 选商品，`map` 生成计划项，`reduce` 求合计；计划项是新对象，不在原商品上加字段。',
          '金额用整数分相乘，最后可以用 `Number.isSafeInteger` 守住范围。',
        ],
      },
      {
        id: 'ut', title: '先写 UT，再写实现',
        files: ['tests/core/restock-plan.test.js'],
        body: [
          '把上面的验收数字写成断言，先看它失败，再写实现。每条测试只说明一个业务结果。',
        ],
        read: [
          { lesson: 'C20', anchor: '2-第一批-ut正常空非法与不变性', label: '第一批 UT：正常、空、非法与不变性' },
          { lesson: 'C20', anchor: '空集合和非法输入是两种契约', label: '空集合和非法输入是两种契约' },
          { lesson: 'C47', anchor: '2-核心规则先在node测断言业务结果', label: '核心规则先在 Node 测' },
        ],
        checks: [
          { id: 'ut-cases', text: '测试覆盖正常、空结果、非法参数和不变性四类' },
          { id: 'ut-pass', text: '`npm test` 全部通过，原有测试一个不少' },
        ],
        hint: [
          '不变性：调用前用 `structuredClone(products)` 留一份，调用后用 `toEqual` 比较。',
          '非法参数用 `it.each` 列一张表，每项断言 `toThrow(RangeError)`；记得传函数，不要直接调用。',
        ],
      },
      {
        id: 'cli', title: '命令行补货报告',
        files: ['src/cli/restock.js'],
        body: [
          '运行 `node src/cli/restock.js 5 10`：第一个参数是阈值，第二个是目标；不传时用 5 和 10。读取数据的方式参照已有的 `src/cli/report.js`。',
          '参数不合法时，把原因写到 stderr，并让进程以状态 1 结束。',
        ],
        read: [
          { lesson: 'C17', anchor: '2-路径先确定基准再读取文件', label: '路径先确定基准' },
          { lesson: 'C17', anchor: '3-参数环境变量与退出状态都是接口', label: '参数与退出状态都是接口' },
        ],
        checks: [
          { id: 'cli-output', text: '`node src/cli/restock.js 5 10` 的输出与下面的终端示例逐行一致' },
          { id: 'cli-error', text: '`node src/cli/restock.js 5 5` 打印错误原因，随后 `echo $?` 得到 1' },
          { id: 'cli-cwd', text: '退到工作区的上一级目录再运行（路径前加工作区目录名），仍能读到数据' },
        ],
        hint: [
          '参数先交给 `parseStock`，空白参数也会被拒绝；数据文件用 `import.meta.url` 定位。',
          '错误分支用 `console.error` 和 `process.exitCode = 1`，不要提前 `process.exit()`。',
        ],
      },
      {
        id: 'page', title: 'React 补货页',
        files: ['src/react/RestockPlanner.jsx', 'src/react/App.jsx'],
        body: [
          '在 App 里加一个「补货计划」区域：阈值、目标库存两个输入框，「生成补货计划」按钮，计划表与合计，以及「确认补货」按钮。',
          '条件放进 URL：生成后地址里出现 `threshold=5&target=10`，刷新或分享这个地址，计划仍在。',
          '确认补货时，对每个计划项调用已有的 `dispatch({ type: "restocked", id, amount })`。等待期间按钮禁用并显示进度；失败时显示原因，按钮变成「重试补货」。',
        ],
        read: [
          { lesson: 'C25', anchor: '2-草稿保存字符串提交时生成业务数字', label: '草稿保存字符串，提交时生成数字' },
          { lesson: 'C31', anchor: '5-筛选放进-url只保留一个来源', label: '筛选放进 URL，只保留一个来源' },
          { lesson: 'C32', anchor: '5-mutation-与失效先写成功再更新读结果', label: 'mutation 与失效' },
          { lesson: 'C33', anchor: '2-草稿等待和失败各有归属', label: '草稿、等待和失败各有归属' },
        ],
        checks: [
          { id: 'page-url', text: '输入 5 和 10 生成计划，地址里出现 `threshold=5&target=10`，刷新后计划仍在' },
          { id: 'page-invalid', text: '阈值留空时显示「请输入库存，空白无效」，地址不变' },
          { id: 'page-save', text: '确认补货期间按钮禁用；完成后页面汇总为「库存 74 / 价值 3422600 分」' },
          { id: 'page-retry', text: '让 `repository.failNext("restock")` 先失败一次：显示原因和「重试补货」，重试后结果与一次成功相同' },
          { id: 'page-check', text: '`npm run lab -- check C48` 仍然通过' },
        ],
        hint: [
          '条件只存在 URL 一个地方。计划在渲染时由 URL 参数和当前商品算出来，不另存一份计划 state。',
          '两个输入框的草稿各用一个字符串 state；提交时用 `parseStock` 转换，成功后再 `setSearchParams`。',
          '保存状态用一个 status（空闲、保存中、完成、失败）表示；循环里逐项 `await` dispatch，失败就停下。',
        ],
      },
      {
        id: 'notes', title: '调试与交付笔记',
        files: ['notes/restock.md'],
        body: [
          '记下运行过的命令和实际输出，以及至少一个真实遇到的问题。问题按课程一直用的六步写：现象 → 工具 → 证据 → 原因 → 修复 → 确认。',
        ],
        read: [
          { lesson: 'C36', anchor: '1-一份业务事实从来源追到显示', label: '一份业务事实，从来源追到显示' },
          { lesson: 'C45', anchor: '练习-3完成一份交付检查记录', label: '完成一份交付检查记录' },
        ],
        checks: [
          { id: 'notes-commands', text: '记录了 UT、命令行和 `check C48` 的命令与实际结果' },
          { id: 'notes-bug', text: '至少一个问题按六步写完，证据来自 DevTools、终端或测试输出' },
        ],
      },
    ],
  },
  {
    id: 'advanced', label: '进阶', title: '用测试和真实浏览器证明它能交付',
    intro: '把必做的行为固定成 RTL 与浏览器测试，再在子路径的生产产物上走一遍。',
    goals: [
      {
        id: 'rtl', title: 'RTL 集成测试',
        files: ['tests/react/restock.test.jsx'],
        body: [
          '用真实的 App 和内存 repository 渲染页面，只按角色和可见名称操作。覆盖一次「失败 → 重试成功」，一次空白输入。',
        ],
        read: [
          { lesson: 'C35', anchor: '2-用角色和-label-操作空库存', label: '用角色和 label 操作' },
          { lesson: 'C35', anchor: '请求失败再由用户重试', label: '请求失败再由用户重试' },
          { lesson: 'C47', anchor: '3-rtl测用户操作保留真实表单与请求校验', label: 'RTL 保留真实表单与请求校验' },
        ],
        checks: [
          { id: 'rtl-roles', text: '只用 `getByRole`、`getByLabelText` 这类面向用户的查询找元素' },
          { id: 'rtl-retry', text: '`failNext("restock")` 后断言失败提示，重试后断言「库存 74 / 价值 3422600 分」' },
          { id: 'rtl-blank', text: '空白阈值：断言错误文字，并断言地址没有变化' },
        ],
        hint: [
          '照着工作区已有的 React 测试创建 repository、渲染 App；每条测试用新的 repository，互不影响。',
          '等待保存结果用 `findBy…`，不要 sleep 固定时间。',
        ],
      },
      {
        id: 'a11y', title: '键盘、读屏与窄屏',
        files: ['src/react/RestockPlanner.jsx'],
        body: [
          '只用键盘走一遍：Tab 到输入框，Enter 生成计划，Tab 到「确认补货」，Enter 确认。错误信息与输入框关联，状态变化用 `role="status"` 播报。',
        ],
        read: [
          { lesson: 'C25', anchor: '4-可访问性名称原因和下一步都要找得到', label: '名称、原因和下一步都要找得到' },
          { lesson: 'C47', anchor: '5-键盘窄屏恢复还要自己走一遍', label: '键盘、窄屏、恢复还要自己走一遍' },
        ],
        checks: [
          { id: 'a11y-keyboard', text: '不用鼠标就能生成计划并确认补货，焦点轮廓始终看得见' },
          { id: 'a11y-error', text: '校验失败时焦点回到出错的输入框，错误用 `aria-describedby` 关联' },
          { id: 'a11y-narrow', text: '360px 宽度下没有横向滚动，计划表能完整读完' },
        ],
      },
      {
        id: 'delivery', title: '生产构建与浏览器冒烟',
        files: ['tests/e2e/restock.spec.js', 'notes/restock.md'],
        body: [
          '先构建，再用严格静态服务器预览：`npm run lab -- build`，然后 `LAB_STATIC_ROOT=dist/src-react node tools/static-react-server.mjs`，打开 `http://127.0.0.1:8068/js_web/demos/inventory/#/?threshold=5&target=10`。预览期间另一个终端保持 `npm run lab -- api` 运行，`/api` 由预览服务器转给它。',
          '再写一条 Playwright 冒烟：打开带条件的地址、刷新、确认补货、断言汇总。用 `node node_modules/@playwright/test/cli.js test --config tools/playwright.config.mjs` 运行。',
        ],
        read: [
          { lesson: 'C46', anchor: '3-真实静态页面与hash路由刷新走两条路', label: '静态页面与 hash 路由' },
          { lesson: 'C35', anchor: '5-一条真实浏览器冒烟贯通静态路由', label: '一条真实浏览器冒烟' },
          { lesson: 'C47', anchor: '1-从失败后果开始写测试计划', label: '从失败后果开始写测试计划' },
        ],
        checks: [
          { id: 'delivery-preview', text: '子路径预览中 Network 没有 404，带条件的地址刷新后计划仍在' },
          { id: 'delivery-e2e', text: '`tests/e2e/restock.spec.js` 和原有的浏览器冒烟一起通过' },
          { id: 'delivery-plan', text: '笔记里有一张测试计划：每个风险对应哪一层、哪个测试文件' },
        ],
        hint: [
          'e2e 里用相对地址 `./#/?threshold=5&target=10` 打开，baseURL 已经带上子路径。',
          '确认补货会写进后端，e2e 开头先 `request.post("/api/_lab/reset")`，和 C47 的 `tests/e2e/api.spec.js` 一样，每次都从固定数据开始。',
          '测试计划按「失败后果 → 最小合适层级」写：规则边界放 UT，保存与重试放 RTL，子路径与刷新放浏览器冒烟。',
        ],
      },
    ],
  },
  {
    id: 'challenge', label: '挑战', title: '失败、换框架、自己制造故障',
    intro: '这一级没有唯一答案，重点是你能拿出证据。',
    goals: [
      {
        id: 'partial', title: '部分失败不重复补货',
        files: ['src/react/RestockPlanner.jsx', 'tests/react/restock.test.jsx'],
        body: [
          '让第二项（P004）失败：此时 P002 已经补到 10。重试应只补 P004 和 P006，共 12 件、658800 分；最终汇总仍是「库存 74 / 价值 3422600 分」，P002 不能变成 20。',
        ],
        read: [
          { lesson: 'C32', anchor: '5-mutation-与失效先写成功再更新读结果', label: '先写成功，再更新读结果' },
          { lesson: 'C48', anchor: '练习-2补货正确也要保住旧状态', label: '补货正确也要保住旧状态' },
        ],
        checks: [
          { id: 'partial-retry', text: '第二项失败后重试，只补剩下的两项，最终仍是 74 / 3422600' },
          { id: 'partial-test', text: '用 RTL 测试把这个场景固定下来' },
        ],
        hint: [
          '想一想计划从哪里来。如果每次渲染都按当前库存重新计算，已经补完的 P002 会自动离开计划；如果把旧计划存成快照再循环，重试就会重复补货。',
          '测试里可以包一层 `repository.restock`，让第二次调用失败。',
        ],
      },
      {
        id: 'ui5', title: 'UI5 Web Components 版本',
        files: ['adapters/web-components/'],
        body: [
          '在 C43 的 Web Components 适配里加一个补货区：两个 `ui5-input` 和一个 `ui5-button`，直接从 `src/core/inventory.js` 导入同一个 `planRestock`。',
          '用 `npm run lab -- start C43` 切换入口、`npm run lab -- dev` 预览；做完用 `npm run lab -- start C48` 回到主线。',
        ],
        read: [
          { lesson: 'C43', anchor: '2-属性传值事件通知业务计算仍在外面', label: '属性传值，事件通知' },
          { lesson: 'C43', anchor: '按钮始终灰着明明写了-false', label: '布尔状态用 property' },
        ],
        checks: [
          { id: 'ui5-same-rule', text: '两个界面对同一组参数得到相同的计划和合计' },
          { id: 'ui5-busy', text: '保存期间用 `button.disabled = true` 禁用按钮，结束后恢复' },
        ],
        hint: [
          '输入事件里读 `event.target.value`（字符串），交给 `parseStock`；业务计算仍在 core，组件只负责显示和通知。',
        ],
      },
      {
        id: 'api', title: '可选：补货计划的数据改由本地后端提供',
        files: ['src/cli/restock.js', 'src/react/RestockPlanner.jsx', 'notes/restock.md'],
        body: [
          '页面在 API 模式下已经经 `/api` 读写。开两个终端运行 `npm run lab -- api` 和 `npm run lab -- dev`，先 `npm run lab -- api reset`，再按 5 和 10 确认补货，把 Network 和 api 终端的记录对上。',
          '命令行目前读的是 `data/products.json`。给它加 `--api`：`node src/cli/restock.js 5 10 --api` 用 `fetch` 读 `http://127.0.0.1:8070/api/products?pageSize=50`，用同一个 `planRestock` 算计划。接口与错误体见 [L5 后端接口](/js_web/labs/api/)。',
          '用[故障注入](/js_web/labs/api/#故障注入)复现部分失败：给 `POST /api/products/P004/restock` 注入一次 500，再确认补货。',
        ],
        read: [
          { lesson: 'C13', anchor: '2-fetch-的响应分两步处理', label: 'fetch 的响应分两步处理' },
          { lesson: 'C17', anchor: '3-参数环境变量与退出状态都是接口', label: '参数与退出状态都是接口' },
          { lesson: 'C45', anchor: '1-先确认失败的是哪一种资源', label: '先确认失败的是哪一种资源' },
        ],
        checks: [
          { id: 'api-page', text: '确认补货后 api 终端有三条 `POST /api/products/…/restock` 200；刷新页面仍是「库存 74 / 价值 3422600 分」' },
          { id: 'api-cli', text: '补货后运行 `--api` 版本，计划里没有商品；不带 `--api` 仍按固定数据列出三项' },
          { id: 'api-offline', text: '停掉后端再运行 `--api` 版本：stderr 说明连不上后端，`echo $?` 得到 1' },
          { id: 'api-partial', text: '注入 P004 的 500 后只有 P002 补上；重试只补 P004 和 P006，最终仍是 74 / 3422600，P002 不变成 20' },
        ],
        hint: [
          'Node 24 自带 `fetch`，命令行和浏览器处理响应的方式相同：先看 `response.ok`，再读 JSON；连不上时 `fetch` 本身会拒绝。',
          '列表响应的商品在 `items` 里，`pageSize` 最大 50；六件商品一页就够，用 `total` 确认没有漏读。',
          '注入故障时 `path` 不带查询串；被影响的那一行在 api 终端行尾带「注入故障」。',
        ],
      },
      {
        id: 'drill', title: '故障演练',
        files: ['notes/restock.md'],
        body: [
          '在自己的实现里故意制造一个故障，例如把 `≤` 写成 `<`，或去掉循环里的 `await`。先让测试变红，再按六步修好。',
        ],
        read: [
          { lesson: 'C20', anchor: '先让测试失败再修业务', label: '先让测试失败，再修业务' },
          { lesson: 'C36', anchor: '读测试失败也按输入到输出追一遍', label: '读测试失败也按输入到输出追' },
        ],
        checks: [
          { id: 'drill-red', text: '故障确实让至少一条测试失败，而不是全部绿着' },
          { id: 'drill-notes', text: '六步记录写进笔记，「确认」一步引用修复后的测试输出' },
        ],
      },
    ],
  },
];

export const RUBRIC_SCALE = [
  { value: 1, label: '照着参考才能写出来' },
  { value: 2, label: '能独立写出，靠试错修正' },
  { value: 3, label: '一次写对，能说清原因' },
  { value: 4, label: '能讲给别人听，并用测试或证据证明' },
];

// 每个领域在毕业项目里看哪些表现
/** @type {Record<string, string>} */
export const RUBRIC = {
  lang: '计划项是新对象，原数组不变；金额全程整数分',
  web: '保存期间的等待、失败和重试状态都说得清；知道 URL 里哪部分会发给服务器',
  tooling: '命令行从任意目录可运行、失败返回状态 1；UT 覆盖正常、空、非法和不变性',
  react: '条件只存在 URL；计划由渲染计算；保存状态与按钮禁用一致',
  ui5: '能把同一条 core 规则接到另一个组件体系，并说清 attribute 与 property',
  delivery: '子路径预览无 404；测试计划按风险分层；笔记里有六步证据',
};
