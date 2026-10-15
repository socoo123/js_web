---
title: C01 JavaScript 的故事与生态地图
description: 从 Java 经验出发，认识 JavaScript 的历史，分清标准、引擎、浏览器、Node、包管理器和 React，并运行第一段库存代码。
sidebar:
  order: 1
---

> **课号 C01 · 第 1 周 / 第 1 天 · 必修**  
> 前置：能读懂 Java 的变量、方法调用和四则运算；无需 HTML/CSS、Node 或 React 经验。  
> 时间：阅读与跟做约 40 分钟，独立练习约 30–40 分钟。4 周路线当天再学 C02；8 周路线今天只学本课。  
> 资料核查：2026-10-15。代码的操作方式与验证状态分别标注；详细执行记录见课尾。

## 1. 先回答一个真实问题：这些名字为什么一起出现？

假设你想做一个“库存管理”网页：显示商品、点击按钮减少库存、保存输入。搜到的教程可能同时提到 JavaScript、ECMAScript、Chrome、V8、Node.js、npm、React 和 UI5。

你已经会 Java，容易把它们理解成“另一套 JDK + Maven + 框架”。这个类比可以帮助起步，但需要拆开：**JavaScript 是语言；浏览器和 Node 是执行环境；npm 管理依赖；React 帮你组织界面。** 只有先知道某个工具负责哪一层，遇到错误时才知道该查什么。

本课结束后，你应当能够：

1. 解释 JavaScript 为什么名字像 Java，却是另一门语言。
2. 用几个关键转折讲清它如何从浏览器脚本发展到今天。
3. 区分语言标准、执行引擎、宿主环境、包管理器和界面库。
4. 在浏览器 Console 运行库存计算，说明哪些能力来自语言、哪些来自环境。
5. 遇到旧教程中的 `var`、回调和 `require` 时，先判断背景与环境。

这里先给 Web 一个起点：**HTML 描述页面内容与结构，CSS 决定样式和布局，JavaScript 编写计算与交互逻辑，浏览器把这些组合成可使用的页面。** HTML 标签也会形成浏览器中的 DOM（Document Object Model，文档对象模型），让 JS 能查找和修改页面节点。C02 会从必要文件、页面加载、CSS 和调试面板开始展开，而不是假定你已经懂前端。[HTML 标准：Web 应用 API](https://html.spec.whatwg.org/multipage/webappapis.html)

## 2. JavaScript 的故事：每次变化解决了什么问题？

### 1995：让网页能够立即回应用户

早期网页更像互相链接的文档。用户输入表单后，如果每次检查都要交给服务器，页面交互就很笨重。浏览器需要一种可以嵌入网页、响应点击和检查输入的语言。

1995 年，Brendan Eich 在 Netscape 制作了这门语言的最初原型，内部代号是 Mocha，后来使用 LiveScript，最终命名为 JavaScript。常见的“十天写出 JavaScript”说的是**最初原型**；浏览器集成、修正和语言发展持续了很久。名字与当时 Netscape 和 Sun 的合作及 Java 的影响有关，不能据此推断它运行在 JVM 上。[设计者与标准工作者的历史论文，第 2–3 节及第 10 节](https://www.wirfs-brock.com/allen/jshopl.pdf)

### 1997：不同浏览器需要共同的语言规则

当其他厂商实现自己的脚本引擎时，同一段代码可能在不同浏览器表现不同。1997 年第一版 ECMA-262 发布，标准中的语言名称是 **ECMAScript**。标准为语法与行为提供共同依据；浏览器页面 API 与实现进度仍需要另行协调。[Ecma 标准及历史版本](https://ecma-international.org/publications-and-standards/standards/ecma-262/)

因此，日常说“我写 JavaScript”，讨论语言规范时说“这个特性进入了 ECMAScript”。它们不是两门需要分开学的语言。

### 2000 年代：网页变成应用，兼容成本随之增加

页面开始局部更新数据，开发者需要处理更多事件、请求和浏览器差异。以 jQuery 为代表的库把常见操作与兼容处理封装起来，让业务代码不必反复写相同的适配逻辑。今天在老项目中看见这些库，要先理解它们当时解决的需求。[历史论文，第 17 节](https://www.wirfs-brock.com/allen/jshopl.pdf)

### 2009：语言补强，执行环境也走出浏览器

**ES5** 在 2009 年发布，包含严格模式、标准化的 JSON 能力和更多数组方法，为既有语言逐步补强。它不是“从 JavaScript 换成了 ES5”。[ECMA-262 版本档案](https://ecma-international.org/publications-and-standards/standards/ecma-262/)

同年，Ryan Dahl 发布 Node.js：把 V8 引擎与文件、网络等能力组合成浏览器之外的执行环境。随后 npm 生态让发布和复用 JS 包更方便。JS 于是可以用于命令行工具、构建工具和服务端程序；同样会算库存的代码，可以换一个环境执行。[历史论文，第 19.2 节](https://www.wirfs-brock.com/allen/jshopl.pdf)、[Node 简介](https://nodejs.org/learn/getting-started/introduction-to-nodejs)、[npm 的职责](https://docs.npmjs.com/about-npm/)

### 2015：现代 JS 的重要分界点

**ES2015 就是第 6 版，常被叫作 ES6。** `let`/`const`、箭头函数、`class`、标准模块、Promise、Map 和 Set 等能力让组织大型程序更方便。这些名称后面会逐个学习，本课只需要知道它们属于语言演进，不需要现在背语法。[ECMAScript 2015 标准](https://262.ecma-international.org/6.0/)

ES2015 之后采用年度版本命名。今天把所有现代 JS 都称作“ES6”并不精确，例如 `async`/`await` 属于 ES2017。你通常学习的是一组现代特性，而不是安装一个叫“ES6”的独立运行时。[ECMAScript 2017 标准](https://262.ecma-international.org/8.0/)

### 今天：语言、运行时和界面库各自演进

复杂界面带来了组件、状态和数据流的需求。React 用组件组织界面；其他框架也有自己的组织方式。它们使用 JS，并没有替换 JS 的变量、函数和对象规则。[React 入门](https://react.dev/learn)

截至 **2026-10-15**，Ecma 官方已发布的是 **ECMAScript 2026，第 17 版，2026 年 6 月**。我们会从稳定常用特性学起，新增特性放到对应问题里解释；不靠追逐版本号开始入门。[ECMA-262 当前正式版](https://ecma-international.org/publications-and-standards/standards/ecma-262/)

| 转折 | 解决的问题 | 你今天会遇到的痕迹 |
| --- | --- | --- |
| 1995：浏览器脚本 | 页面需要及时回应操作 | 点击、表单、页面事件 |
| 1997：ECMAScript | 实现需要共同语言规则 | ES、ECMA-262、兼容性资料 |
| 2009：ES5 / Node | 补强语言；增加浏览器外用途 | 严格模式、JSON、Node 脚本 |
| 2015：ES2015 / ES6 | 更好地组织程序和数据 | `const`、模块、Promise、Map |
| 后续年度标准与组件生态 | 持续改进语言与复杂界面开发 | `async`/`await`、React 组件、构建工具 |

不必背这张年表。能解释“为什么出现这一层”，比记住全部年份更有用。

## 3. 与 Java 对照：熟悉的外形，独立的规则

两者都有花括号、`if`、循环和方法调用的外形。JavaScript 的函数与原型设计也受到其他语言影响；不能从相似语法直接推出相同语义。[历史论文，第 3 节](https://www.wirfs-brock.com/allen/jshopl.pdf)

| Java 经验 | 本课可以建立的对应 | 类比的边界 |
| --- | --- | --- |
| Java 语言规范 | ECMAScript 语言规范 | 语言规则独立，不能套用 Java 的类型和对象规则 |
| JVM 执行 Java 字节码 | JS 引擎执行 JS 程序 | 常见引擎有解释、即时编译等机制；JS 不要求先走 `javac → .class` 这条路径 |
| JDK 提供开发工具与运行库 | Node 提供一种 JS 运行时及其 API | 浏览器也是另一种宿主；Node 不自带网页 DOM |
| Maven 管理依赖与项目任务 | npm 管理包并运行项目脚本 | npm、Node、ECMAScript 是不同层；npm 不是 JS 编译器 |
| Java 库或应用框架 | React、UI5 等可复用界面能力 | 使用库仍然需要学 HTML/CSS、JS 和浏览器行为 |
| `int stock = 12` | `const stock = 12` | JS 的值有类型，变量绑定不声明 `int`；这里用 Number，精度与转换在 C03 讲 |

后面会遇到三个特别容易误迁移的地方：`class` 不等于 Java 的类机制，`this` 不总像 Java 的 `this`，`await` 不等于开启一个 Java 线程。现在先把这三个问题记在笔记里，C07、C12 和 C13 会用可运行代码回答。

## 4. 生态地图：从标准到你运行的程序

![ECMAScript 标准定义 JavaScript 规则；项目通过 npm、Yarn 或 pnpm 管理 React 等依赖；程序分别在浏览器、Node.js 或 Bun 中执行，各环境由引擎和不同宿主能力组成。](../../../assets/diagrams/c01-ecosystem.svg)

图中箭头表示标注的关系，不是程序执行时间顺序。读图时先问四个问题：

1. **规则在哪里？** ECMAScript 定义语言规则。
2. **谁真正执行？** 引擎实现语言，运行环境组合引擎和宿主能力。
3. **额外能力从哪里来？** 有些由环境提供，有些由项目引入的库提供。
4. **谁准备依赖？** 包管理器在开发阶段安装、记录和更新项目依赖。

图把“程序”画成了一个节点，表示同一个业务概念可在不同环境实现。它不承诺任何一份源码都能原样跨环境运行；下一节会看到原因。

### 4.1 语言与引擎：规则和实现分开

ECMAScript 规定变量、函数、对象和 Array、Map、Set 等内建能力的行为。**数据结构解决“如何组织数据”，运行时解决“代码在哪里执行”，包管理器解决“如何取得与管理依赖”。** 它们不能混为一组“JS 工具”。

引擎读取、解析并执行程序。例如 Chrome 和 Node 使用 V8；Bun 运行时使用 JavaScriptCore。引擎可以生成内部字节码或机器码以执行程序，所以也不要把“脚本语言”理解成“内部永远没有编译”。[V8 官方简介](https://v8.dev/)、[Node 简介](https://nodejs.org/learn/getting-started/introduction-to-nodejs)、[Bun 官方文档](https://bun.com/docs)

### 4.2 宿主环境：你能调用什么 API？

“宿主”就是接纳并运行程序、向程序暴露额外能力的环境。

| 环境 | 引擎与典型宿主能力 | 库存应用中的任务 |
| --- | --- | --- |
| 浏览器主页面 | 引擎 + DOM、事件、网络、页面存储等 Web API | 显示商品、处理按钮点击 |
| Node.js | V8 + 文件、进程、网络等 API | 读取库存文件、生成报告；也能开发服务端 |
| Bun 运行时 | JavaScriptCore + 文件、网络等能力及兼容 API | 运行脚本或服务，兼容程度需按实际 API 验证 |

这里的浏览器指普通网页主页面；Worker 等上下文也能执行 JS，但不直接拥有页面的 `document`。

`console.log` 在浏览器和 Node 中都常见，属于环境提供的日志能力，不能据此说“所有环境的 API 都相同”。反过来，现代 Node 也实现一些 Web API（例如 `fetch`），所以不应仅凭“看到网络请求”就认定代码在浏览器执行。[Node 全局对象文档](https://nodejs.org/api/globals.html)

### 4.3 npm、Yarn、pnpm 与 Bun：分清同一产品的多个角色

| 名称 | 本课只需要知道的定位 |
| --- | --- |
| npm | 这个名称涉及命令行工具、包 registry 和网站；命令行工具安装依赖、记录版本并运行项目脚本 |
| Yarn | 另一种包管理器，有自己的工作流与依赖管理策略 |
| pnpm | 另一种包管理器，采用自己的存储和安装布局 |
| Bun | 包含运行时、包管理器、测试运行器、打包器等；执行 JS 和安装包是它的不同职责 |

例如，`node stock.js` 请求 **Node 执行文件**；`npm install` 请求 **npm 安装项目依赖**；`npm run build` 请求 **npm 调用项目中定义的 build 脚本**，具体构建由脚本里的工具完成。这里是命令职责说明，本课无需安装工具或执行后两个命令。[npm](https://docs.npmjs.com/about-npm/)、[Yarn](https://yarnpkg.com/getting-started)、[pnpm](https://pnpm.io/)、[Bun](https://bun.com/docs)

本网站工程统一使用 npm 与一份根锁文件。C17–C20 再教 Node、项目配置、包管理器比较和测试；其他包管理器的比较会使用隔离练习目录。

### 4.4 React 和 UI5：处在界面开发这一层

React 是构建用户界面的库，组件通常由 JS 函数表达。常见的 JSX 是需要工具转换的语法扩展，不能把含 `<ProductCard />` 的代码当作普通 JS 直接粘进 Console。使用 React 不会让你跳过浏览器、HTML 或 CSS。[React 入门](https://react.dev/learn)

先把 UI5 放在地图上，C39–C44 再学习具体代码：

- **OpenUI5**：开源的经典 UI 框架路线，包含控件、模型和绑定等能力。
- **SAPUI5**：与 OpenUI5 共享核心，并包含额外的 SAP 库与相应交付、许可条件。
- **UI5 Web Components**：基于浏览器 Custom Elements 的组件体系，不能直接当作经典 UI5 控件使用。
- **UI5 Web Components for React**：面向 React 使用这些 Web Components 的包装库。

它们都不是新的 JavaScript 语言或执行引擎。之后我们会用同一个库存业务比较其开发方式。[SAPUI5 与 OpenUI5](https://ui5.github.io/docs/02_Read-Me-First/sapui5-vs-openui5-5982a97.html)、[UI5 Web Components](https://ui5.github.io/webcomponents/docs/)、[React 包装库](https://github.com/UI5/webcomponents-react)

## 5. 自己尝试：用浏览器完成第一段库存计算

**操作方式：自己尝试 · 本地网页 / 浏览器 Console**  
**验证状态：已验证 · 示例 S01；Chrome 155.0.8059.40 执行结果见课尾。**

### 5.1 准备一个自己的实验页

本课不需要安装 Node 或 npm。使用 Chrome 或 Edge 和一个文本编辑器即可。

在你的电脑新建文件夹 `c01-lab`，把下面内容保存为其中的 `index.html`。若你已经下载课程仓库，也可以直接打开仓库的 `examples/c01/index.html`。

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>C01：我的 JavaScript 实验页</title>
  </head>
  <body>
    <h1>C01：我的 JavaScript 实验页</h1>
    <p>打开浏览器开发者工具的 Console，在这里运行本课代码。</p>
  </body>
</html>
```

**文件验证：已验证 · H01；本地打开能显示标题和段落。** 文件中的 `<h1>` 表示主标题，`<p>` 表示段落，`UTF-8` 用来正确解码中文。它还没有加载 JS，后面的代码由你在 Console 手动执行。本例不请求其他文件，双击用 `file:` 打开足够；涉及模块与请求时会明确改用本地服务。

1. 双击 `index.html`，确认页面显示“C01：我的 JavaScript 实验页”。
2. 右键页面，选择“检查 / Inspect”，打开开发者工具。
3. 选择 **Console** 面板。它是在当前页面上下文运行 JS 和查看日志的地方。
4. 输入 `1 + 2` 并按 Enter，预期看到 `3`，确认找到了代码输入区。
5. 输入下面代码。多行可以用 Shift + Enter 换行，最后按 Enter 执行。[Chrome：在 Console 运行 JS](https://developer.chrome.com/docs/devtools/console/javascript)

### 5.2 计算商品剩余库存

文件对应 `examples/c01/stock.js`；在 Console 中一次运行整个代码块：

```js
{
  const productName = "键盘";
  const stock = 12;
  const sold = 3;
  const remaining = stock - sold;

  console.log(productName);
  console.log(remaining);
  console.log("剩余库存：" + remaining);
}
```

预期日志：

```text
键盘
9
剩余库存：9
```

Console 还可能显示最后的求值结果 `undefined`，它不是第四条业务日志，也不代表失败。用 `console.log` 写出日志和表达式返回什么，是两件事。

暂时只读懂这四点：

- `const` 声明绑定，这段代码声明后不再给这些名字重新赋值；它不等于“对象被冻结”。
- `stock - sold` 计算剩余库存。
- `console.log(...)` 请求当前环境显示日志。
- 最外层 `{ ... }` 建立一个块，方便重复执行 `const` 示例，避免向 Console 的顶层反复声明同名绑定。块作用域在 C04 展开。

这里还没有 React，没有外部依赖，也没有修改网页。计算逻辑使用 JS 语言规则，日志交给浏览器显示。

### 5.3 读一遍等价的 Java 代码

**操作方式：讲解示例 · Java 对照**  
**验证状态：已验证 · J01；JDK 21.0.2 的编译与执行输出同 S01。**

文件对应 `examples/c01/Stock.java`：

```java
public class Stock {
    public static void main(String[] args) {
        String productName = "键盘";
        int stock = 12;
        int sold = 3;
        int remaining = stock - sold;

        System.out.println(productName);
        System.out.println(remaining);
        System.out.println("剩余库存：" + remaining);
    }
}
```

JS 版本可以直接作为脚本交给环境执行，不需要先声明这个 Java 类和 `main`。JS 值仍然有类型；省略 Java 式类型声明不表示“没有类型”。本课中的小整数计算结果一样，不代表所有数字运算都一样，C03 会比较 Number 与 Java 数字类型。

### 5.4 可选：已有 Node 的读者在终端复跑

**操作方式：自己尝试 · 本地 Node（选做）**  
**验证状态：已验证 · S01 的 Node 路径；实际环境 Node 23.11.0。**

这只是本次作者验证机器的版本记录，课程后续新建 Node 工程会按计划核对并固定 Node 24 LTS。你没有 Node 就跳过，本课的必做操作全部可在浏览器完成。

把 5.2 的代码保存为 `c01-lab/stock.js`。打开终端，把工作目录切换到自己创建的 `c01-lab`，执行：

```sh
node --version
node stock.js
```

预期输出同 S01。看到 `command not found` 表示当前终端找不到 Node；看到 `Cannot find module` 先检查工作目录与文件名。这些不是库存计算逻辑错误。

## 6. 同一种语言，为什么有的代码只能在某个环境运行？

**操作方式：自己尝试 · 浏览器 Console；本地 Node 对照选做**  
**验证状态：已验证 · S02；Chrome 普通页面与 Node 23.11.0 的结果分别如下。**

在刚才的实验页 Console 执行，代码对应 `examples/c01/host-probe.js`：

```js
console.log("Array：" + typeof Array);
console.log("document：" + typeof document);
console.log("process：" + typeof process);
```

`typeof` 用来观察值的类型。本例中，`typeof` 检查一个尚不存在的名字会得到字符串 `"undefined"`，适合用来观察环境；这与直接访问不存在的变量不同。详细边界在 C03/C04 学习。

| 观察项 | 普通浏览器页面 | 普通 Node 脚本 | 解释 |
| --- | --- | --- | --- |
| `typeof Array` | `function` | `function` | Array 是语言内建构造函数，两边都有 |
| `typeof document` | `object` | `undefined` | 网页 DOM 的入口由浏览器页面提供 |
| `typeof process` | `undefined` | `object` | Node 提供进程信息对象，普通网页不自带 |

若选择 Node 对照，把代码保存为 `c01-lab/host-probe.js`，在该目录执行 `node host-probe.js`。不要在注入了额外全局变量的框架页面中比较这张表；本课实验页没有加载任何库。

**判断结论：两个环境都会执行 JS，不代表它们提供同一组 API。** 想让库存计算复用，就把纯计算与读文件、改页面等环境相关操作分开。后面会把这种做法用于整个库存应用。

### 调试起点：先看错误，再判断它在哪一层

**操作方式：自己尝试 · 浏览器 Console**  
**验证状态：已验证 · E01；错误类型为 ReferenceError。**

在实验页单独运行这个有意写错的例子（`examples/c01/language-error.js`）：

```js
console.log(productNmae);
```

预期看到类似 `ReferenceError: productNmae is not defined`。错误文字可能因环境不同而略有变化。这里名字拼错，而且先前的 `productName` 声明位于单独的块内，不是当前可直接读取的全局变量。**不要只把拼写改对就以为解决了作用域问题**；正确修复是在同一个完整代码块内声明并使用 `productName`，例如重新运行 S01。

观察证据：Console 的红色错误中包含名字和类型，旁边通常有行号链接。点开可以定位触发错误的代码；在 Console 执行的代码可能显示为临时 `VM...` 来源。C02 再教保存到文件后如何设置断点、观察 Scope 和 Call Stack。

**操作方式：讲解示例 · 本地 Node 错误复现（选做）**  
**验证状态：已验证 · E02；Node 23.11.0 下为 ReferenceError。**

另一种错误发生在环境层。把下面保存为 `c01-lab/host-error.js`，在该目录执行 `node host-error.js`（仓库中也有同名示例）：

```js
document.querySelector("h1");
```

预期是类似 `ReferenceError: document is not defined`。这是把浏览器 DOM 代码交给普通 Node 执行了。在本课浏览器实验页运行同一表达式，则会得到那个 `<h1>` 元素。[Node 与浏览器的差异](https://nodejs.org/learn/getting-started/introduction-to-nodejs)

两种错误都可能叫 ReferenceError，但证据指向不同原因：一个需要修正代码中的名称与作用域，另一个需要选择正确环境或替换环境相关 API。安装 React 或换包管理器不会自动修复它们。

## 7. 读旧代码：认识年代，保留判断

现代教程并不是你唯一会读到的代码。旧项目仍可能使用 `var`、回调和 CommonJS，它们不是看见就必须全部重写的标志。

### 7.1 `var` 和回调为什么常一起出现？

**操作方式：讲解示例 · 浏览器 / Node**  
**验证状态：已验证 · S03；两种环境都输出一条日志。**

文件对应 `examples/c01/old-style.js`：

```js
{
  var productName = "键盘";

  function showStock(stock, onReady) {
    onReady(productName + "剩余库存：" + stock);
  }

  showStock(12, function (message) {
    console.log(message);
  });
}
```

预期输出：

```text
键盘剩余库存：12
```

读法是：把一个函数作为 `onReady` 参数传入，`showStock` 再调用它。这里是**同步回调**，在当前调用中立即执行；“回调”描述调用方式，不自动表示异步。C06 学函数是值，C12 再学异步调度。

在 ES2015 之前，没有 `let`/`const`，`var` 因而很常见。`var` 今天仍有效，但作用域与 `let`/`const` 不同；本例外层花括号不会给 `var` 建立块作用域。新课程优先使用 `const`，需要重新赋值时用 `let`，具体迁移不能只做字符串替换。

### 7.2 `module.exports` 属于哪里？

**操作方式：讲解示例 · 本地 Node CommonJS**  
**验证状态：已验证 · S04；Node 23.11.0 加载模块并调用返回 9。**

文件对应 `examples/c01/commonjs.cjs`：

```js
function remainingStock(stock, sold) {
  return stock - sold;
}

module.exports = remainingStock;
```

这是 CommonJS 风格的导出。Node 的早期生态广泛使用它；ES2015 后还有标准的 ESM `import`/`export`。普通网页不自带 CommonJS 的 `module` 和 `require`，因此本段不作为 Console 粘贴练习。[Node：CommonJS 模块](https://nodejs.org/api/modules.html)

已有 Node 时，可以把上述文件保存到 `c01-lab/commonjs.cjs`，在 **`c01-lab` 目录**执行这条验证命令：

```sh
node -e "console.log(require('./commonjs.cjs')(12, 3))"
```

预期输出 `9`。`.cjs` 明确标示本例使用 CommonJS；导出文件本身没有 `console.log`，单独执行它不会打印库存。C16/C17 会教完整多文件模块示例和两种模块的运行条件。

读旧代码时先问：**它在哪个环境运行？使用哪种模块？依赖哪个 API？** `var`、回调、CommonJS 是不同维度，不是一个叫“旧版 JS”的整体开关。

## 8. “最新 JS”要分成三件事检查

### 已发布的年度标准

它是已经正式发布的版本，例如当前 ECMAScript 2026。`https://tc39.es/ecma262/` 展示持续更新的草案；草案可能含有下一年度的内容，不能直接叫作“2026 正式版”。[Ecma 当前版本与草案入口](https://ecma-international.org/publications-and-standards/standards/ecma-262/)

### 提案成熟度

TC39 推进语言提案。目前的流程包含 **0、1、2、2.7、3、4** 这些阶段。对初学者先抓住：早期提案可能改变；Stage 3 主要积累实现经验；**Stage 4 表示完成并准备进入标准**，还需要分清它归属哪一年度。[TC39 流程](https://tc39.es/process-document/)

截至本课核查日，完成提案表把 **Temporal** 列为 Stage 4、预计 2027 年发布；它不能写成“ES2026 已发布特性”。**Decorators** 则仍在进行中的提案列表，所列阶段为 2.7。以后读到 `@...` 的教程，不能直接把它理解成 Java 注解，也不能把某种工具实现当成已发布的 JS 标准。[完成提案表](https://github.com/tc39/proposals/blob/main/finished-proposals.md)、[进行中的提案表](https://github.com/tc39/proposals/blob/main/README.md)

以上都是 **2026-10-15 的状态记录**，本课不要求运行这些提案示例。

### 目标环境支持

即使语言特性已发布，你使用的浏览器或 Node 版本也可能尚未实现它。反过来，某个环境可以提前实现提案。构建工具也可能转换某些语法，但不会自动凭空提供全部 DOM、文件系统或新的运行时 API。

看到“现在能不能用”的说法时，检查顺序是：

1. 在正式标准、完成提案或进行中列表的哪个位置？
2. 目标浏览器 / 运行时的实际版本是否支持？
3. 示例是否依赖转译、额外库或特定宿主 API？
4. 我是否在自己的目标环境运行过，并获得预期结果？

本课使用稳定的基础语法，不要求提前掌握 Temporal、装饰器或构建配置。

## 9. 必做练习：把这张地图变成你的判断能力

### 练习 A：改变输入，预测并验证输出

**操作方式：自己尝试 · 浏览器 Console**  
**验证状态：起始代码 S01 与参考答案 A01 均已验证；你的修改需自行验证。**

目标：把商品改为“鼠标”，初始库存改为 20，售出数量改为 4。

1. 先在纸上写出三条预期日志。
2. 修改 S01 的三个输入，运行完整代码块。
3. 比较实际日志与预测，解释每条日志由哪一行产生。
4. 再把售出数量改成 0，确认剩余库存为 20。

验收：结果来自计算；不能把 `remaining` 直接写成常量 16。日志出现在 Console，网页段落保持原样，因为代码没有调用 DOM API。

<details>
<summary>提示 1：修改哪些变量？</summary>

只修改 `productName`、`stock`、`sold` 的初始值；保留 `stock - sold`，让计算适应输入变化。

</details>

<details>
<summary>提示 2：页面为什么没有出现数字？</summary>

`console.log` 写入日志面板。要改变网页，需要查找 DOM 节点并更新它，C02/C11 会教。

</details>

<details>
<summary>参考答案 A01：先核对预测，再看代码</summary>

文件对应 `examples/c01/stock-answer.js`。操作方式：讲解答案 · 浏览器 / Node；验证状态：已验证。

```js
{
  const productName = "鼠标";
  const stock = 20;
  const sold = 4;
  const remaining = stock - sold;

  console.log(productName);
  console.log(remaining);
  console.log("剩余库存：" + remaining);
}
```

预期日志：

```text
鼠标
16
剩余库存：16
```

把 `sold` 改为 0 后，日志分别为 `鼠标`、`20`、`剩余库存：20`。如果出现同名声明错误，检查是否漏掉了最外层花括号；如果完全没有日志，检查 Console 过滤条件、执行上下文和是否真正执行。

</details>

### 练习 B：用自己的话解释工具职责

**操作方式：自己尝试 · 书面判断**  
**核对状态：已核对本课官方资料；这是概念题，不是运行测试。**

用一两句话分别解释这六项：浏览器、Node、Bun、npm、React、Array。然后改正下面四句话：

1. “Node 就是新版 JavaScript，装它就升级了语言。”
2. “npm 的职责是把 JS 编译成字节码。”
3. “用 React 就不需要 HTML、CSS 和浏览器知识。”
4. “浏览器能执行 `document`，所以 Node 也一定能。”

验收：能够明确说出语言、运行环境、包管理、界面库和数据结构的边界，且把 Bun 的运行时与包管理角色分开。

<details>
<summary>参考答案：六项分别负责什么？</summary>

浏览器是执行和展示网页的环境，组合引擎与 DOM 等 Web 能力。Node 是浏览器外的 JS 运行时，提供文件与进程等 API。Bun 既有 JS 运行时，也有包管理、打包与测试工具，它们承担不同任务。

npm 命令行工具管理项目依赖、调用项目脚本，相关 registry 存放发布的包。React 帮助组织界面组件及其状态。Array 是 JS 语言内建的数据组织能力，可由不同运行环境中的 JS 引擎实现。

四句话应分别改成：Node 的版本与 ECMAScript 年度不是同一套编号；npm 可以调用构建脚本，具体转换由构建工具负责；React 建立在 JS 与 Web 基础之上；DOM 能力取决于宿主环境，普通 Node 不提供 `document`。

</details>

### 练习 C：辨认旧写法与标准状态

**操作方式：自己尝试 · 阅读判断**  
**核对状态：已核对本课来源；S03/S04 的运行结果已分别验证。**

不查答案，回答：

1. S03 的回调是同步还是异步？仅看到一个回调函数能否判断存在异步？
2. S04 能否原样粘贴到普通网页 Console？为什么文件扩展名是 `.cjs`？
3. “ES6 = 所有现代 JS”准确吗？`async`/`await` 属于哪个年度？
4. 某教程称“Temporal 已完成，所以它属于 ES2026，所有浏览器都能运行”。这里混淆了哪几件事？

<details>
<summary>参考答案：沿着环境和状态逐项判断</summary>

S03 是同步回调，因为 `showStock` 在当前调用中直接执行 `onReady`。回调本身不保证异步。

S04 需要 CommonJS 的 `module`，普通网页没有这个对象。`.cjs` 明确告诉 Node 按 CommonJS 处理。

ES6 是 ES2015 的别名，不包含后续所有年度特性；`async`/`await` 属于 ES2017。

Temporal 的句子混淆了提案完成、年度归属和实际支持三个状态。按 2026-10-15 的来源，Temporal 已达 Stage 4，预计归入 2027，目标环境支持还要独立核查。

</details>

## 10. 与库存项目连接：同一业务，不同环境任务

我们接下来会不断完善同一个库存管理小应用：

| 需求 | 负责的层 | 后续课程 |
| --- | --- | --- |
| 计算剩余库存、筛选和统计商品 | JS 函数与 Array / Map / Set | C03–C10 |
| 展示商品、修改样式、响应点击 | HTML / CSS、浏览器 DOM 与事件 | C02、C11 |
| 读取本地库存文件并生成报告 | Node 的文件能力 + JS 数据处理 | C17 |
| 安装所用的库、记录依赖版本 | npm 与项目配置 | C18–C20 |
| 按组件组织界面与状态 | React | C21–C36 |
| 使用现成控件并比较开发模型 | 普通组件库、OpenUI5、UI5 Web Components | C37–C44 |

以后写业务逻辑时，先把库存计算留在纯 JS 函数里，再让浏览器或 Node 的代码负责取得输入与展示输出。这能让你复用逻辑，也便于之后写单元测试。UT 即 Unit Test；具体框架与断言从 C20 开始，不在这节为了几行计算引入工程依赖。

## 11. 离开本课前，独立回答这五问

1. JavaScript 与 Java 的名字相近，能否推出相同类型规则或相同执行环境？
2. ECMAScript、V8 和 Node 分别属于哪一层？
3. 不装 npm，能否在浏览器算出剩余库存？
4. 代码有 `document`，移到普通 Node 后首先该检查什么？
5. 新特性“已发布”“Stage 4”“当前浏览器可用”为什么需要分别核查？

你能运行练习 A，并用自己的话完成 B/C，就达到了本课目标。下一课 **C02 Web 基础与第一个调试现场（尚待编写）**，会把库存数据放进真实 HTML/CSS 页面，观察加载过程、Console 和断点。完整安排见仓库 `docs/CURRICULUM.md`。

## 12. 资料与示例验证记录

本课正文中的链接均是概念附近的直接来源，统一核查日期为 **2026-10-15**。建议按问题回查，不必第一天通读语言规范：

- 历史与命名：[JavaScript: The First 20 Years](https://www.wirfs-brock.com/allen/jshopl.pdf)，由 Allen Wirfs-Brock 和 Brendan Eich 撰写。
- 正式年度：[Ecma ECMA-262](https://ecma-international.org/publications-and-standards/standards/ecma-262/)；阶段与年度归属：[TC39 流程](https://tc39.es/process-document/)、[完成提案](https://github.com/tc39/proposals/blob/main/finished-proposals.md)。
- 引擎与运行时：[V8](https://v8.dev/)、[Node](https://nodejs.org/learn/getting-started/introduction-to-nodejs)、[Bun](https://bun.com/docs)。
- 包管理：[npm](https://docs.npmjs.com/about-npm/)、[Yarn](https://yarnpkg.com/getting-started)、[pnpm](https://pnpm.io/)。
- 界面与调试：[React](https://react.dev/learn)、[Chrome Console](https://developer.chrome.com/docs/devtools/console/javascript)；UI5 家族来源见 4.4 节。

**已验证**指实际执行过所列文件或表达式；**已核对**指根据资料和代码审阅确认，不能等同于运行。Bun、Edge 和 React/UI5 项目没有在本课执行；它们在这里是定位说明，没有提供已运行的项目示例。

| ID | 内容 / 操作 | 本次实际环境与结果 |
| --- | --- | --- |
| H01 | 打开 `examples/c01/index.html` | Chrome 155.0.8059.40；标题、段落存在，`1 + 2` 得到 3 |
| S01 | 库存脚本 `stock.js` | 同一 Chrome 页面与 Node 23.11.0；三条日志为键盘 / 9 / 剩余库存：9 |
| J01 | Java 对照 `Stock.java` | JDK 21.0.2；`javac` 编译及 `java Stock` 输出同 S01 |
| S02 | 环境探针 `host-probe.js` | Chrome：function / object / undefined；Node：function / undefined / object |
| E01 | 故意拼错名字 | Chrome 与 Node 均抛 ReferenceError；修复后的 S01 输出正确 |
| E02 | DOM 代码交给 Node | Node 抛 ReferenceError；Chrome 同一表达式找到页面标题 |
| S03 | `var` 与同步回调 | Chrome 与 Node 均输出键盘剩余库存：12 |
| S04 | `require` 加载 `commonjs.cjs` | Node 23.11.0；调用返回并打印 9；单独执行导出文件没有日志 |
| A01 | 练习 A 参考答案及售出为 0 的变体 | Chrome 与 Node 分别得到 16、20 的剩余库存 |

浏览器代码使用独立 Chrome 页面自动执行核对，不把它冒充手动 DevTools 操作验证。Console 的操作路径已核对官方文档。示例不依赖第三方包，终端工作目录与复现命令另见仓库 `examples/c01/README.md`。
