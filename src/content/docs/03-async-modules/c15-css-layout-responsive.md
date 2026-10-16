---
title: C15 CSS 布局与响应式：排版库存页
description: 用 Flex 排工具栏、Grid 排商品卡片，做出手机单列到桌面四列的库存页，并在 DevTools 定位溢出。
sidebar:
  order: 15
---

> **第 2 周 · 第 8 天** · 阅读跟做约 45 分钟 · 练习约 40 分钟<br />
> 前置：C02、C11、C14 · 运行：本地网页、Node 24 · 示例已运行验证

## 这一课解决什么问题

库存页已经能加载商品、修改库存、保存本地副本，但六张卡片从上排到下，搜索框和分类框各占一行。在宽屏上浪费空间；把卡片硬改成 600px，手机上又出现横向滚动。

学完你能：

- 算出内容、内边距和边框各占多宽，避免 `width: 100%` 撑破容器。
- 用 Flex 安排搜索工具栏，让标签和输入框一起换行。
- 用 Grid 排商品卡片，解释 `repeat`、`minmax`、`auto-fill` 和 `gap`。
- 从手机单列开始，在 768px 和 1280px 形成两列和四列。
- 用 Elements、Computed 和布局叠加层找到溢出来源，保留清楚的键盘焦点。

例子在 [examples/c15](https://github.com/socoo123/js_web/tree/main/examples/c15)。在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/examples/c15/`。页面展示的是实际布局，正文里的「输出」包括尺寸、换行和屏幕上的排列。

## Java 程序员先看这里

| Java 经验 | CSS 对应 | 一句话差异 |
| --- | --- | --- |
| Swing / JavaFX 的布局管理器 | 父元素的 `display: flex` / `grid` | 布局规则写在 CSS，浏览器随可用空间重新计算 |
| BoxLayout 沿一个方向排列 | Flex 的主轴与交叉轴 | Flex 还能换行，每一行分别分配空间 |
| GridLayout / GridPane | Grid 的行、列与轨道 | CSS Grid 可以自动放置元素，列宽也能按剩余空间分配 |
| 常量与组件属性 | CSS 变量、继承和层叠 | 同一个变量名可由局部规则覆盖，不是编译期常量 |
| 事件响应与组件绘制 | JS 更新 DOM，CSS 负责布局 | 窗口变窄通常交给 CSS，业务数组仍是同一份 |

## 1. 先算盒子：width 到底包括什么

一个盒子从里到外是内容、padding、border、margin。`padding` 留出内部空白，`margin` 是盒子外的间距。`box-sizing` 决定声明的宽度计算到哪一层。

**先猜一猜：** 在桌面打开 `box-model.html`。两个元素都写 `width: 300px`，算上边框，实际分别多宽？

```css title="box-model.css"
/* 同样的 width，比较边框盒的实际宽度 */
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid #758291;
  margin-block: 1rem;
}
.content-box { box-sizing: content-box; }
.border-box { box-sizing: border-box; }
```

输出：第一个边框盒宽 **344px**，第二个宽 **300px**。

[`content-box`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing) 把 width 当内容宽度，所以外宽是 `300 + 20 × 2 + 2 × 2`。`border-box` 把 padding 和 border 包进这 300px，内容区剩下 256px。两种算法都把 margin 留在盒子外面。

普通 div 写 `width: 100%` 再加 padding，使用 content-box 就会撑破父元素。统一用 border-box 更好计算。与 Java 布局的尺寸类比时，也要先确认算到边框还是内容。

### 容器随屏幕缩放，同时限制阅读宽度

主容器用百分比跟随父元素，用 max-width 限制宽屏尺寸：

```css title="fluid.css"
* { box-sizing: border-box; }
main {
  width: 100%;
  max-width: 75rem;
  margin-inline: auto;
  padding: 1rem;
}
```

输出：默认根字号 16px 时，75rem 为 1200px。360px 视口下 main 的外宽是 360px，左右各留 16px，内容区是 **328px**；1280px 视口下 main 外宽最多 1200px，左右自动居中。

rem 相对根元素字号；px 指 CSS 像素，与硬件像素不同。本课横向页面的 margin-inline 表示左右，margin-block 表示上下。

本课所有页面的 head 都已有 `meta name="viewport" content="width=device-width, initial-scale=1"`。它让移动浏览器按设备的布局视口排版，否则手机可能先按一个较宽的虚拟页面布局，再整体缩小。容器宽度和媒体查询都需要这个前提。

## 2. Flex：让工具栏沿一个方向分配空间

Flex 适合「搜索字段、分类字段、按钮」这样的排列。把规则写在父容器上，它的**直接子元素**才是 flex 项目。先把 label 和控件包成一组，换行时它们就能一起移动。

`toolbar.html` 使用这个结构，片段单独保存在 `filters.html`：

```html title="filters.html"
<div class="toolbar">
  <div class="field">
    <label for="search">商品名称或编号</label>
    <input id="search" type="search">
  </div>
  <div class="field field--category">
    <label for="category">分类</label>
    <select id="category">
      <option value="">全部</option><option>外设</option>
      <option>显示器</option><option>配件</option><option>音频</option>
    </select>
  </div>
</div>
```

配合下面的 CSS；基础样式已让 label 独占一行，input 和 select 使用所在字段的全部宽度。

```css title="flex.css"
/* 布局作用于直接子元素，每个 field 是一个项目 */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 1rem;
}
.field { flex: 1 1 16rem; min-width: 0; }
.field--category { flex: 0 1 12rem; }
```

输出：宽屏时搜索在左、分类在右，控件底部对齐；缩到 360px 时分类组换到下一行，标签紧跟自己的控件。

[`flex: 1 1 16rem`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox) 依次表示：有剩余空间时可增长、空间不足时可收缩、分配前的基准尺寸为 16rem。分类字段的增长系数是 0，因此有多余空间时主要由搜索字段吸收。basis 是分配空间的起点，不是固定宽度。

`flex-wrap: wrap` 允许放不下的项目换到下一行；每行重新分配空间。`min-width: 0` 允许字段收缩到其内容默认最小尺寸以下，里面的 input 也要能跟着缩。只把父容器改成 Flex，里面的固定宽度仍可能造成溢出。

### 主轴、对齐和间距各管一件事

默认 `flex-direction: row`，本课主轴水平，交叉轴竖直。`justify-content` 调整主轴上的剩余空间分布，`align-items` 调整交叉轴上的项目对齐。这里选择 end，让不同高度的字段底部对齐；如果改成 column，两条轴也随之转动。

gap 在相邻项目之间留空，容器外缘的留白由 padding 负责。

用 Java BoxLayout 理解单轴排列，再观察 Flex 换行后的分配。Elements 选中 `.toolbar`，点击 **flex** 徽标可查看项目区域和间距。

## 3. Grid：用列轨道排商品卡片

Grid 适合同时约束行和列的卡片网格。先声明列轨道，浏览器就会按 DOM 顺序把卡片放进格子，填满一行再放下一行。

在 `grid.html` 中，网格最多宽 720px，六张卡片使用固定样例数据：

```css title="grid.css"
#auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
  width: 720px;
  max-width: 100%;
  padding: 0;
  list-style: none;
}
```

输出：默认字号下，720px 容器显示 **3 列、2 行**。缩窄到 360px 视口时，容器跟着变窄，显示单列。

把这条声明从里往外读：

| 部分 | 在这里的含义 |
| --- | --- |
| `minmax(14rem, 1fr)` | 每列至少 224px，最多按份额分享剩余空间 |
| `auto-fill` | 按这个最小宽度和间距，尽量放进更多列 |
| `repeat(...)` | 重复建立前面的列轨道 |
| `1fr` | 一份可分配的剩余空间，等份列会均分扣除 gap 后的宽度 |

三列至少需要 `224 × 3 + 16 × 2 = 704px`，能放进 720px；四列需要 944px，放不下。最终三列各约 229.33px。把百分比直接写成四个 25%，再加 gap，总宽会超过 100%；fr 会把间距先计入预算。

Java 的 GridPane 也能表达行列；这里列数可以由容器宽度自动决定，商品不必逐个声明坐标。

**先猜一猜：** 勾选「只显示 P001」后，唯一的一张卡片会撑满 720px 吗？

输出：仍只占第一列，宽度和筛选前相同。[`auto-fill`](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat) 会保留容器里能容纳的空轨道；改成 auto-fit 后，空轨道会折叠，这个例子的一张卡片就会拉宽。库存筛选后仍希望卡片保持尺寸时，auto-fill 很合适。

固定的 14rem 最小值还有一个边界：容器本身不足 14rem 时，它会撑出去。自动铺列很方便，但布局仍需要最小宽度预算。下一节给库存项目明确设置单列、两列和四列，并让轨道可以继续收缩。

## 4. 移动优先：先保证窄屏成立，再增加列数

移动优先的写法是：基础规则直接服务窄屏，空间足够后用 [`@media`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media) 覆盖少量属性。完整页面仍使用同一份 HTML、同一份商品数据。

```css title="responsive.css"
#products {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  padding: 0;
  list-style: none;
}
@media (min-width: 48rem) {
  #products { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 75rem) {
  #products { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
```

在 `responsive.html` 观察输出，默认字号 16px 时：

| 视口宽度 | main 内容区 | 列数 | 单列宽度 |
| --- | --- | --- | --- |
| 360px | 328px | 1 | 328px |
| 768px | 736px | 2 | 360px |
| 1280px | 1168px | 4 | 280px |

48rem 和 75rem 是这页选择的断点，表示内容有足够空间改变布局。它们不是「所有平板」「所有电脑」的固定分类。选断点的依据是字段、卡片和文字能否舒适地放下。

为什么写 `minmax(0, 1fr)`？单独的 1fr 轨道有自动最小尺寸，长内容可能把它撑宽。把下限写成 0，轨道才能缩到预算内；卡片再用 `min-width: 0` 和 `overflow-wrap: anywhere`，让较长名称在卡片内换行。前者解决轨道尺寸，后者解决内容怎么显示。

### 多条媒体查询会同时生效

当视口为 1280px，两条 min-width 条件都成立。这里的选择器权重相同，后写的四列规则覆盖前面的两列规则。若把两列规则移到最后，桌面就会意外退回两列。

「后写的赢」在这里以同层、同权重为前提；层叠还考虑来源与优先级。Computed 可以查看最终值并展开来源。

JavaFX 里你可能在宽度监听器里切换布局；这个页面只需 CSS 媒体查询，浏览器会在视口变化时重新计算。

:::tip[自己尝试 · 本地网页]
1. 保持仓库根目录的静态服务运行，打开 `examples/c15/responsive.html` 对应的本地地址。
2. 按 F12，点击 DevTools 左上方的设备工具栏按钮，选择 Responsive，依次输入宽度 360、768、1280。
3. 在 Elements 选中 `ul#products`，点击 **grid** 徽标；也可在 Layout 中勾选网格叠加层。
4. 在 Computed 搜索 `grid-template-columns`，展开属性查看正在生效的规则。

预期：分别出现 1、2、4 条列轨道，没有横向滚动。继续拖动宽度，确认断点两侧的变化，而不只是三个截图尺寸成立。
:::

## 5. 变量和焦点：把可读、可操作写进样式

把颜色和间距定义成 [CSS 变量](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)，让不同区域共享命名一致的值。名字以两个连字符开头，用 var 读取。

```css title="appearance.css"
:root {
  --surface: #ffffff;
  --text: #1b2733;
  --muted: #425466;
  --accent: #155cb5;
  --error: #a01717;
  --space: 1rem;
}
.panel { background: var(--surface); color: var(--text); padding: var(--space); }
.hint { color: var(--muted); }
.error { color: var(--error); }
```

输出：`appearance.html` 的面板是白底深字，说明文字用较柔和的深灰，错误提示为深红。把 `--space` 从 1rem 改成 2rem，面板四周的内部空白一起增加。

`:root` 在 HTML 文档里选中 html 元素，这些变量默认向后代继承。局部元素可以重定义同名变量，影响它和后代。因此 CSS 变量更像随元素树传递的配置，而不是 Java 的 static final 常量。

### 看得清提示，也找得到键盘焦点

按钮和焦点使用同一个强调色：

```css title="focus.css"
button {
  color: #ffffff;
  background: var(--accent);
  border: 2px solid var(--accent);
  border-radius: .35rem;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
```

输出：在 `appearance.html` 按 Tab，输入框和按钮获得清楚的蓝色轮廓；轮廓向外偏移 3px，没有把相邻元素推走。[:focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) 根据浏览器对交互方式的判断显示，键盘导航通常会匹配，文本输入框也可能在点击后匹配。

outline 不占布局空间，适合表达焦点。保留原生控件，也就保留了浏览器提供的键盘交互。

对比度要比较一对前景和背景色。普通正文按 [WCAG 的最低对比度要求](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)至少 4.5:1；大号文字最低 3:1。本页深灰提示对白底约 7.80:1，按钮白字对蓝底约 6.50:1。在 DevTools 的 Styles 点击颜色色块，可检查文字与背景的对比度；本课的 `node contrast.js` 也会计算这几对不透明颜色的比值。

错误还写出「库存无效：请输入 0–99999 的整数」，让文字本身说明问题。红色只加强提示。Java 桌面组件的焦点与禁用状态同样属于交互的一部分，网页里也要在改样式时保留它们。

## 常见错误与调试

### 手机页面可以向右拖出一大块空白

**现象**：打开 `overflow-broken.html`，设备模式设为 360px。商品卡片超出屏幕，页面能横向滚动。

**工具**：在 Elements 选中 `article#broken-card`；到 Computed 搜索 width，展开来源。切回 Styles，找到对应文件的规则。

```css title="overflow-broken.css"
/* 有问题的写法：卡片宽度超过手机的可用内容区 */
#broken-card { width: 600px; }
```

**证据**：Computed 中卡片宽 600px，main 的可用内容区只有 328px。布局已经使用 border-box，因此这次问题来自固定宽度。

**原因**：600px 是无条件要求。屏幕变窄不会自动让这个明确的 width 跟着变小。

**修复**：把规则改成跟随父元素的内容区，再设一个宽屏上限：

```css title="overflow-fixed.css"
#broken-card { width: 100%; max-width: 600px; }
```

**确认**：刷新后仍设为 360px，卡片宽变成 328px，页面不再横向滚动；扩大窗口到 1280px，卡片最多 600px。可以先在 Styles 试改，再保存到 CSS 文件，刷新确认文件中的修复生效。

### 明明写了四列，桌面还是两列

**现象**：把 `responsive.css` 的两列媒体查询整段移到四列查询后面，1280px 时只剩两列。

**工具**：Elements 选中 `#products`，在 Computed 搜索 grid-template-columns，展开来源；在 Styles 对照两条媒体查询。

**证据**：两个条件都满足，四列声明被划掉，最后的两列声明生效。

**原因**：选择器权重相同，更晚出现的两列声明覆盖四列声明。

**修复**：恢复从小断点到大断点的顺序。**确认**：重新检查 360、768、1280px，列数依次为 1、2、4。修的是覆盖顺序，不需要不断加更强的选择器。

## 练习

### 练习 1：先算空间，再开浏览器

默认字号 16px，视口 768px，main 左右 padding 各 16px，Grid 两列，gap 为 16px。先写出内容区宽度和每列宽度，再运行 `node layout-budget.js` 核对。

```js title="layout-budget.js"
const viewport = 768;
const padding = 16;
const gap = 16;
const columns = 2;
const content = viewport - padding * 2;
console.log("内容区", content);
console.log("每列", (content - gap * (columns - 1)) / columns);
console.log("25% 四列含间距", content * 0.25 * 4 + gap * 3);
```

验收：解释三行为什么分别得到 736、360、784，并说明四个 25% 的列为何放不进 736px。

<details>
<summary>提示</summary>

先扣两侧 padding，再扣列与列之间的 gap。两列只有一个 gap，四列有三个。

</details>

<details>
<summary>参考答案</summary>

内容区为 `768 − 32 = 736px`。两列分配前扣掉 16px 间距，各得 `(736 − 16) / 2 = 360px`。四个 25% 已经用完 736px，再加 48px 间距，总共 784px，超出 48px。

Grid 的等份 fr 列会在扣掉 gap 后分配空间。用浏览器核对 `responsive.html` 的两列结果，Computed 应显示两列各 360px。

</details>

### 练习 2：修复溢出，并解释一个没生效的改动

从 `overflow-broken.html` 开始，修复 CSS，做到 360px 无横向滚动、1280px 卡片不超过 600px。接着按调试节制造「桌面只有两列」的问题，找到被覆盖的规则再恢复。

验收：你能在 Computed 指出每次故障的实际值和来源文件；修好以后刷新仍成立，窗口在断点附近来回缩放也成立。

<details>
<summary>提示</summary>

一个问题是盒子要求的尺寸超过可用空间，另一个是正确声明被后面的规则覆盖。先看最终值，再回到产生这个值的声明。

</details>

<details>
<summary>参考答案</summary>

卡片改为 `width: 100%; max-width: 600px`，修复版见 `overflow-fixed.html`。它在小屏跟随父容器，在大屏达到上限后停止增长。

媒体查询恢复为 48rem 在前、75rem 在后，见原始 `responsive.css`。两个条件同时成立时，四列声明最后参与同权重覆盖。

overflow-x: hidden 只会裁掉溢出部分。验收要确认卡片真的缩小，内容和按钮仍完整。

</details>

### 练习 3：把布局加回库存页

按下一节更新阶段 2 页面。在三种目标宽度下筛选「配件」，编辑 P004 的库存，再用 Tab 走到导出、搜索、分类和编辑按钮。

验收：360px 单列、768px 两列、1280px 四列；筛选后列宽保持规则；修改后刷新仍保留库存；操作位置有可见焦点，错误提示仍能读清。

<details>
<summary>提示</summary>

布局写在父容器上，字段需要包装，商品卡片可以继续由已有 createRow 创建。保留原有 id，已有事件监听器就仍能找到控件。

</details>

<details>
<summary>参考答案</summary>

阶段 2 目录保存了完成后的参考版本。先对照 index.html 的 toolbar 和 field 包装，再对照 style.css 的容器、Flex、Grid 和媒体查询；保存、筛选、请求等业务逻辑继续使用已有 app.js。

</details>

## 项目进度

从 C14 的 [examples/inventory/02-web](https://github.com/socoo123/js_web/tree/main/examples/inventory/02-web) 开始，目录内现在保存本课完成后的参考状态。

1. **index.html**：备份、筛选、编辑区加上 panel 类；搜索和分类按第 2 节包成字段组，备份控件放进允许换行的 backup-actions。保留 label 的 for、控件 id、状态提示和编辑区 hidden。
2. **style.css**：替换旧的基础排版，采用 border-box、75rem 容器、共享颜色与间距；工具栏和备份区用 Flex；商品列表使用第 4 节的 Grid 与断点。原来的 li 上下 margin 移除，间距统一由 gap 管理。
3. **卡片内部**：列表的直接子 li 再用纵向 Flex，让按钮靠近卡片底部。它是嵌套布局：外层 Grid 管卡片位置，内层 Flex 管卡片里的文字和按钮。

```css
#products > li { display: flex; flex-direction: column; align-items: start; gap: .5rem; overflow-wrap: anywhere; }
#products > li p { margin: 0; }
#products > li button { margin-block-start: auto; }
```

输出：同一行的卡片由 Grid 拉到相同高度，名称换行较多时，其他卡片的按钮仍靠近底边。auto margin 吸收的是卡片内部纵向剩余空间。

继续使用根目录的静态服务，打开 `http://127.0.0.1:8000/examples/inventory/02-web/`。若已有编辑副本，点「恢复初始数据」并确认，再核对初始 **6 种商品、52 件、26348.00 元**。

按三个宽度检查列数、工具栏换行和页面溢出。分类选配件应看到 P004、P005；编辑 P004 后保存并刷新，数据仍保留，布局也成立。导出、导入、加载失败与空列表继续显示原来的提示。最后用键盘检查焦点顺序，它仍跟随 HTML 顺序。

## 小结

- border-box 把 padding 和 border 算进声明宽度，margin 仍在外面。
- Flex 沿主轴分配空间，wrap 负责换行；字段包装让标签和控件一起移动。
- Grid 定义列轨道，fr 分配扣除间距后的空间；auto-fill 会保留空轨道。
- 移动优先先写单列，再按空间增加列数；同时生效的媒体查询仍参与层叠。
- Computed 查最终值与来源，叠加层查布局；颜色、文字提示和可见焦点共同支持操作。

自测：

1. `width: 300px` 加 padding 后，为什么可能得到 344px？
2. 给 toolbar 加 Flex 后，为什么还要把 label 和 input 包在同一字段里？
3. auto-fill 筛选到一张卡片时，空列为什么还在？
4. 1280px 时，两条 min-width 查询为什么会一起成立？
5. 页面溢出时，你会先看 Computed 的哪些值，又如何确认修复？

下一课把库存页拆成 ES 模块，整理页面、存储和业务逻辑之间的依赖。

## 延伸阅读

- [MDN：Flexbox 基本概念](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)
- [MDN：Grid 的基本概念](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout)
- [MDN：响应式设计](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [Chrome DevTools：检查 Grid 布局](https://developer.chrome.com/docs/devtools/css/grid)
- [Chrome DevTools：检查 Flex 布局](https://developer.chrome.com/docs/devtools/css/flexbox)
- [Chrome DevTools：CSS 功能参考](https://developer.chrome.com/docs/devtools/css/reference)
