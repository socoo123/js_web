# 效果截图定义

课文与 Lab 页里的「页面效果」截图都由这里的定义生成：脚本把参考快照真实运行起来，按定义操作页面后拍摄。截图不是示意图，不手工修图。

| 文件 | 内容 |
| --- | --- |
| `labs/previews/<组>.json` | 截图定义；组为 `c03`、`c15`、`c23`、`l1`…`l5`，以后每课一个 `cNN.json` |
| `src/assets/previews/<组>/<名>-<宽>-<主题>.webp` | 拍摄结果（无损 WebP，提交到仓库） |
| `src/assets/previews/manifest.json` | 每个截图的快照、源码校验值、图片尺寸与 SHA-256、拍摄环境 |
| `src/lib/previews.mjs` | 网站读取入口：`getShot('c15/layout')`、`listShots()` |

## 定义格式

```json
{
  "group": "c15",
  "shots": [
    {
      "name": "layout",
      "checkpoint": "C15",
      "entry": "src/vanilla",
      "path": "/",
      "sources": ["src/vanilla", "src/core", "src/services", "data"],
      "actions": [
        { "do": "waitCount", "selector": "#list article", "count": 6 },
        { "do": "assertColumns", "selector": "#list", "columns": { "360": 1, "768": 2, "1280": 4 } }
      ],
      "viewports": [{ "width": 360, "height": 760, "scale": 2 }, { "width": 1280, "height": 800 }],
      "themes": ["light"],
      "target": "main",
      "alt": "画面里实际能看到什么（给读屏用户）",
      "caption": "效果面板下方的一句说明"
    }
  ]
}
```

| 字段 | 规则 |
| --- | --- |
| `name` | 小写字母、数字和连字符；截图 id 为 `<组>/<name>` |
| `checkpoint` | 参考快照 `Cnn`，由 `labs/snapshots.mjs` 的 `materialize` 生成，只读 |
| `entry` | 快照里的界面目录，必须有 `index.html`；Vite 配置沿用工作区 `tools/lab.mjs` 的 `viteConfig(checkpoint)` |
| `path` | 以 `/` 开头的页面地址，可带 `#/products/P004` 这类 hash 路由 |
| `sources` | 影响画面的快照路径（目录或文件），进入校验值 |
| `actions` | 依次执行的操作，见下表；用 `waitText`/`waitCount`/`assertColumns` 确认画面已到目标状态再拍 |
| `viewports` | 宽度只用 360、768、1280；高度 240–2400；`scale` 为 1 或 2（360 宽建议 2，避免高清屏发虚） |
| `themes` | 只拍页面真实支持的主题。当前库存页、React 应用和 UI5 适配都没有暗色样式，只拍 `light` |
| `target` | 可选，元素选择器；只拍这个元素（例如一张卡片），否则拍整个视口 |
| `fullPage` | 可选，`true` 时拍整页 |
| `alt` / `caption` | 不进校验值，改说明不必重拍 |

操作（`do`）只有这些；元素操作用 `role`+`name`、`label`、`placeholder`、`selector` 中的一个定位，`nth` 选第几个：

| do | 参数 | 作用 |
| --- | --- | --- |
| `goto` | `path` | 打开另一个地址 |
| `click` / `check` / `focus` | 定位 | 点击、勾选、聚焦 |
| `fill` / `select` | 定位、`value` | 输入文本、选下拉项 |
| `press` | `key`，可选定位 | 按键 |
| `waitText` | 定位、`text` | 等元素包含这段文字，超时即失败 |
| `waitCount` | 定位、`count` | 等元素数量 |
| `assertColumns` | 定位、`columns` | 按当前视口宽度检查 Grid 列数，如 `{"360":1}` |
| `assertNoOverflow` | — | 页面不能横向滚动 |
| `assertScrollWidth` | `width` | 按视口宽度检查整页滚动宽，如 `{"360":616}`；用于拍故障现象 |
| `addStyle` | `css` | 临时追加一段样式，相当于在 DevTools Styles 里加一条规则；源码文件不变 |
| `scrollTop` / `mouseAway` | — | 回到页顶、把鼠标移开 |

拍摄时页面出现未捕获异常或任何 4xx/5xx 请求都会失败，不会留下错误状态的截图。

## 拍摄与检查

```sh
node scripts/capture-previews.mjs                      # 全部重拍
node scripts/capture-previews.mjs --only c15/layout    # 只拍指定 id，逗号分隔
node scripts/check-previews.mjs                        # 新鲜度检查（构建时运行）
```

- 拍摄在本机运行：需要先在 `labs/inventory` 执行过 `npm ci` 和 `npx playwright install chromium`，并且系统有中文字体。脚本用完整版 Chromium 加 `--lang=zh-CN`，文件选择框等浏览器控件显示中文。
- 依赖链接到 `labs/inventory/node_modules`（同一把锁），开发服务器只用 4341–4349 端口，结束后关闭。
- 校验值 = 定义里影响像素的字段 + `sources` 下每个文件的 SHA-256。参考快照源码或定义改了而截图没重拍、清单里的图片被手工替换、目录里有无主图片，检查都会报错。
- 截图拍摄不进 CI；CI 的 `npm run build` 只跑检查。改了截图依赖的参考源码，就在本机重拍并一起提交。

## 当前截图

| id | 快照 | 宽度 | 用途 |
| --- | --- | --- | --- |
| `c03/before` | C02 | 360/768 | C03 主错误：12 补 3 显示 123 |
| `c03/after` | C03 | 360/768 | C03 完成后：15，空白被拒绝 |
| `c15/layout` | C15 | 360/768/1280 | C15 单列/两列/四列 |
| `c15/narrow` | C15 | 360 | C15 第 2 节：工具栏换行、卡片占满一列 |
| `c15/single` | C15 | 1280 | C15 第 2 节：搜索 P004，四列轨道里只占第一列 |
| `c15/overflow` | C15 | 360 | C15 调试现象：追加 `article { min-width: 600px; }`，scrollWidth 616 |
| `c15/focus` | C15 | 360/768 | C15 第 4 节：键盘保存空白，焦点外框与错误提示 |
| `c23/actions` | C23 | 768（只拍 P001 卡片） | C23 连续补三件 12→15 |
| `l1/goal` | C10 | 1280 | L1 终点：同一张卡片补 3 得 15。L1 的成果主要是 `src/core` 里的规则，页面只有一张卡片，这张图展示规则接到页面后的结果 |
| `l2/goal` | C20 | 1280 | L2 终点：P004 改 8，总库存 57，四列 |
| `l3/goal` | C36 | 360/1280 | L3 终点：初始固定数据 6 种 / 52 件 / 2634800 分 |
| `l4/goal` | C44 | 1280 | L4 终点：UI5 Web Components for React 适配，编辑 P004 |
| `l5/goal` | C48 | 1280 | L5 终点：「仅低库存」得 P004、P006，8 / 539200 分 |
