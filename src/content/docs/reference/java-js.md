---
title: Java ↔ JS 速查
description: 从 Java 经验查找 JavaScript、浏览器、工具和 React 的常见差异，以及可回去跟做的课程。
sidebar:
  order: 2
---

这张表帮助你在第二周结束时查漏。先说出行为，再回到对应课程运行例子；相似写法只说明入口相近，具体规则仍按 JavaScript 与 React 理解。

## 语言和值

| Java 经验与课程 | JS 规则与易错点 |
| --- | --- |
| 变量有静态类型，final 限制赋值<br>[类型 C03](../../02-language-data/c03-values-types/)、[变量 C04](../../02-language-data/c04-scope-control/) | 值有类型；let 可重赋值，const 限制绑定重赋值。const 对象仍可改字段，React state 又额外约定只读 |
| int/long/double/BigDecimal<br>[数字 C03](../../02-language-data/c03-values-types/) | 普通数字是 Number；大整数可用 BigInt。5/2 为 2.5；金额用整数分，长 ID 用字符串传输 |
| null 与字段检查<br>[值 C03](../../02-language-data/c03-values-types/) | null 表示明确为空，undefined 常见于缺失字段与无返回值。属性拼错可能得到 undefined，没有编译器拦截 |
| equals 比较内容，== 比较对象引用<br>[比较 C03](../../02-language-data/c03-values-types/) | 字符串用 === 比内容；对象用 === 比身份。两个相同字段的对象仍不相等，业务记录比较 id |
| 对象参数传引用的副本<br>[对象 C05](../../02-language-data/c05-objects-json/) | JS 同样按值传参，对象值是引用。改字段影响共享对象，给参数重新赋值不影响调用方绑定 |
| new ArrayList<>(old) 是浅复制<br>[复制 C05](../../02-language-data/c05-objects-json/)、[state C24](../../05-react/c24-arrays-keys-derived/) | [...old] 和对象展开也是浅复制。新容器不代表内部元素都已复制 |
| 方法、函数式接口与 lambda<br>[函数 C06](../../02-language-data/c06-functions-closures/) | 函数本身是值，闭包保留词法环境。回调传函数；加括号会立刻调用 |
| this 属于实例，class 描述类<br>[原型 C07](../../02-language-data/c07-this-prototypes/) | 普通函数 this 由调用方式决定，箭头函数没有自己的 this。把方法取出来当回调可能丢接收者；class 仍基于原型 |
| List、Stream、Comparator<br>[数组 C08](../../02-language-data/c08-arrays-processing/) | Array 的 map/filter/reduce；sort 需比较函数。sort/splice 改原数组，sort 默认按字符串顺序 |
| HashMap 的 equals/hashCode<br>[集合 C09](../../02-language-data/c09-maps-sets/) | Map 的对象键按引用身份区分，Set 同理。同内容对象不会自动合并，WeakMap 不能枚举 |

## 异步、浏览器与工程

| Java 经验与课程 | JS 规则与易错点 |
| --- | --- |
| Future、线程池<br>[执行顺序 C12](../../03-async-modules/c12-callbacks-promises/)、[请求 C13](../../03-async-modules/c13-async-await-fetch/) | Promise 表达异步结果，async/await 组织流程。await 只暂停当前 async 函数；CPU 密集同步工作仍会阻塞所在 JS 线程 |
| HTTP 客户端与异常<br>[Network C13](../../03-async-modules/c13-async-await-fetch/) | fetch 返回 Response，检查 response.ok 后再读 JSON。404 通常仍兑现 Promise；网络失败、HTTP 错误、JSON 错误要分清 |
| 服务端会话或数据库<br>[存储 C14](../../03-async-modules/c14-storage-errors/) | localStorage 是当前浏览器按源保存的字符串。静态 JSON 不会因页面编辑而改写；本地数据要校验和恢复 |
| Swing/JavaFX 布局<br>[Web C02](../../01-history-web/c02-web-debugging/)、[CSS C15](../../03-async-modules/c15-css-layout-responsive/) | DOM 描述结构，CSS 的 Flex/Grid 决定布局。窗口宽度、盒模型和内容尺寸都会参与排版 |
| package、import、JAR<br>[模块 C16](../../03-async-modules/c16-modules-dependencies/) | ESM 模块有自己的作用域，import/export 表达依赖。浏览器按 URL 加载模块；Node 另有包解析规则 |
| JVM 与标准/平台库<br>[运行时 C17](../../04-runtime-tooling/c17-node-browser/) | Node、Bun 是运行时；浏览器也是 JS 宿主。浏览器有 DOM；Node 有 fs；不是同一套环境 API |
| Maven 清单和仓库<br>[npm C18](../../04-runtime-tooling/c18-npm-reproducible-installs/)、[工具 C19](../../04-runtime-tooling/c19-yarn-pnpm-bun/) | npm/Yarn/pnpm 安装依赖、维护锁文件、运行 scripts。npm 不是 JS 运行时；Bun 还提供运行时、测试与构建能力 |
| 编译、类型检查、JUnit<br>[构建与 UT C20](../../04-runtime-tooling/c20-vite-vitest/) | Vite 转译/构建，类型检查另跑；Vitest 运行测试。构建通过不等于类型检查或业务测试通过；锁文件只固定依赖安装的一部分条件 |

## React 的四条转换规则

| Java 中容易套用的想法 | React 规则与自测 |
| --- | --- |
| setter 改字段后立即读新值<br>[C23](../../05-react/c23-state-snapshot-queue/) | 每次渲染拿自己的 state 快照，setter 请求后续更新。为什么三次 setStock(stock + 1) 从 12 只到 13？ |
| 给集合 add、给对象改字段就够了<br>[C24](../../05-react/c24-arrays-keys-derived/) | state 按只读处理；新数组里目标记录也要创建新对象。为什么复制数组后改元素仍会污染旧数据？ |
| 第几行就代表哪件商品<br>[C24](../../05-react/c24-arrays-keys-derived/) | 稳定 key 关联同级组件状态，业务 id 定位数据。删除第一行，第二行草稿为什么会错位？ |
| 把所有结果都保存成字段<br>[C24](../../05-react/c24-arrays-keys-derived/) | 保存来源和用户意图，列表与统计通常直接计算。搜索条件、商品数组、总库存，哪些需要 state？ |

props 单向传入，渲染保持纯粹；子组件用事件回调上报用户意图，父组件决定如何更新自己的数据。组件函数返回 JSX，React 再把结果提交到 DOM。[组件 C21](../../05-react/c21-react-jsx-components/)、[数据流 C22](../../05-react/c22-props-composition-render/)

## 第二周自测

1. 请求 404 为什么没有进入 catch？你要在哪一步把它变成用户可见的错误？
2. package.json、锁文件、Node 各负责什么？换了包管理器为什么不能只改一个命令？
3. 原生库存页刷新后能保留编辑，当前 React 页却恢复初值，数据分别保存在哪里？
4. 从初始数据给无线鼠标补一件，再只筛选鼠标，总库存应该是多少？为什么？
5. 写一个能发现「低库存误算了售罄商品」的测试，说明断言保护的业务规则。

能解释原因，并能在源码里指出对应一行，就可以继续下一周的表单、状态组织和 Effect。

## 官方入口

- [MDN：JavaScript 指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide)
- [Node：与浏览器的差异](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser)
- [npm：package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [React：学习 React](https://react.dev/learn)
