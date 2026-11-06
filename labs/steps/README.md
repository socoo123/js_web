# Lab 步骤数据

`lN.json` 把一个 Lab 拆成按课排列的小步骤：每步先读哪几节、改哪些文件、做什么、应该看到什么、怎样验收。Lab 页（`LabGoal` / `LabSteps` / `LabFinish`）、课页顶部 `LabBar`、课末 `LabNext` 和学习进度都从这里取数据。课程、文件和命令仍以 `labs/catalog.json` 为准，这里只补「怎样一步步做」。

| 文件 | 作用 |
| --- | --- |
| `l3.json` | L3（C21–C36）的目标、步骤与收尾清单 |
| `model.mjs` | 校验、补默认值、生成锚点与链接；组件和检查脚本共用，不读文件 |
| `ids.mjs` | 由检查脚本生成的 id 清单，供浏览器端进度校验；不要手改 |

## 顶层

```json
{
  "labId": "L3",
  "goal": { "summary": "…", "outcomes": ["…"], "shot": "l3/goal", "demo": "l3" },
  "steps": [ … ],
  "finish": { "items": [{ "id": "l3-finish-1", "text": "…" }] },
  "retired": []
}
```

- `labId`：必须在 `labs/catalog.json` 的 `labs` 里；文件名为 `l<编号>.json`。
- `goal.summary`：一句话说明完成后的样子。`goal.outcomes`：1–6 条可观察结果。
- `goal.shot`：可选，目标截图 id。`goal.demo`：可选，`labs/demos.json` 里的演示 id，Lab 页据此链接 `/js_web/demos/<id>/`。
- `finish.items`：收尾清单，id 依次为 `l3-finish-1`、`l3-finish-2`……
- `retired`：删掉的步骤或收尾 id 移到这里（见「id 规则」）。

## 每一步

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `stepId` | 是 | `l<Lab>-c<课号>-<本课序号>`，如 `l3-c23-1`；每课从 1 连续编号 |
| `lessonId` | 是 | 这一步属于哪一课，必须属于本 Lab |
| `title` | 是 | ≤ 28 字，显示为「第 N 步 · 标题」 |
| `goal` | 是 | 这一步做完后多了什么 |
| `read` | 是 | 1–3 项 `{ lessonId, anchor, why }`：先读的小节和理由 |
| `files` | 否 | 改动文件，必须是该课 catalog `files` 的子集；省略时用该课全部文件 |
| `actions` | 是 | 1–8 条操作 |
| `preview` | 是 | `output`（终端或界面文字）与 `shot`（截图 id）二选一，可加 `caption` |
| `acceptance` | 是 | 1–4 条验收标准 |
| `check` | 否 | 字符串或数组；省略时用该课 catalog 的 `commands.check` |
| `hint` / `answer` | 否 | 提示与参考答案，页面默认折叠 |

约束：

- 步骤按 catalog 的课程顺序排列；本 Lab 每课 1–3 步。每课至少被一条 `read` 引用。
- 如果一课的每一步都写了 `files`，这些步骤合起来必须覆盖该课全部改动文件。
- 文字里只能用 `` `代码` `` 和 `[文字](/js_web/…)`、`[文字](#锚点)` 两种标记，其余按纯文本输出。
- 文字写给学员：不写内部编号（S01、V03 等）、补丁版本号、验证过程或作者环境；校验会拒绝前两类。

### 先读（read）

- `lessonId` 可以是本课或前面的课，不能指向后面的课。
- `anchor` 是目标页的标题 id（不带 `#`），以构建产物为准，例如 `4-闭包函数返回以后绑定仍然可用`。改课文标题会改变 id，检查脚本会报「锚点不存在」。
- 链接形如 `/js_web/<slug>/?from=<stepId>#<anchor>`。课页读到 `from` 后显示「返回 L3 第 N 步」浮标；链接文字取目标标题，`why` 显示在下方。

### 预览（preview）

- `output`：放终端输出或界面上能读到的文字，原样显示在等宽框里。
- `shot`：截图 id，格式 `cNN/名称` 或 `lN/名称`（小写、短横线）。图片由截图清单提供；还没有截图时显示「效果截图暂缺」占位，并带 `data-missing-preview`，未放行时构建检查会报错。

## id 规则

步骤和收尾 id 会写进学员浏览器的学习记录，**发布后不能改名或复用**。

- 新增步骤：在该课末尾追加下一个序号；需要插在中间时也用新序号，再调整数组顺序。
- 删除步骤：把旧 id 加进 `retired`。旧记录里的这个 id 仍被接受，不会被判为损坏，只是页面上不再显示。
- `retired` 里的 id 必须属于本 Lab，不能和现有 id 重复。

## 改完后

```sh
node scripts/check-lab-steps.mjs --write --source   # 校验数据并重写 ids.mjs
node --test tests/lab-steps.test.mjs                # 数据与检查器单测
JS_WEB_ALLOW_PENDING_ASSETS=1 npm run build         # 完整构建
node scripts/check-lab-steps.mjs                    # 再对 dist 检查锚点与页面钩子
```

不带 `--source` 时，脚本还会检查 `dist`：

- 每个 `read` 锚点是否落在目标页的标题上。
- Lab 页是否有全部 `step-*` 锚点、先读链接、收尾锚点和勾选框。
- 本 Lab 每个课页是否有指向本课第一步的 `LabBar`。

`ids.mjs` 与数据不一致时，不带 `--write` 会报错。

## 页面怎样使用

- `src/lib/lab-steps.mjs` 读取全部 `l*.json` 并补默认值，提供以下函数：
  - `stepsForLesson`：本课的步骤。
  - `nextAfterLesson`：Lab 的下一步或收尾。
  - `returnsForLesson`：哪些步骤链接到本课，供返回浮标使用。
  - `readLabel`：先读链接的文字。
- 每步根元素 `id="step-<stepId>"`；收尾清单 `id="l3-finish"`。
- 勾选框 `data-lab-step-toggle="<id>"` 由 `src/scripts/lab-progress.mjs` 写入进度（`markLabStep`）。勾选只表示学员自己确认，不代表检查命令通过。
