# D2 教学图

当前有 C01 生态关系图、C02 页面加载关系图、C03 输入边界图、C04 作用域查找图、C05 别名与浅复制图、C06 闭包环境图、C07 原型查找图。源码依次为 `c01-ecosystem.d2`、`c02-page-flow.d2`、`c03-value-boundary.d2`、`c04-scope.d2`、`c05-alias-copy.d2`、`c06-closure-environment.d2`、`c07-prototype-lookup.d2`，产物位于 `../src/assets/diagrams/` 的同名 SVG。已接入网站 npm 构建与 Pages Actions；编译失败会阻止发布。C02 的图展示资源与处理阶段的依赖，不是精确请求瀑布时间线。

C03 的图是新规范下的样例写法：文件首行注释说明箭头含义；`**` 统一字号与圆角；一个容器圈出「边界」；红色只用于拒绝分支，绿色只用于正常路径；节点文字最多 3 行。

固定工具：**D2 0.9.0**（根目录 `.d2-version`）、免费 Dagre 布局。字体使用 Noto Sans SC，固定到 Google Fonts 仓库提交 `a85815a42757630ce188fdad368c2dfc444d4773`。字体文件保存在被 Git 忽略的 `.cache/tools/`，脚本核对 SHA-256；SVG 内嵌使用到的字形及完整 OFL 许可，不需要浏览器下载字体。

后续新增 C10 分类遍历、C12 事件循环、C16 ESM 依赖图与 C18 npm 安装布局，源码分别为 `c10-category-traversal.d2`、`c12-browser-event-loop.d2`、`c16-esm-dependencies.d2`、`c18-npm-install-layout.d2`；当前共 11 张。C16 箭头从导入方指向依赖方，虚线表示动态导入，不表示请求的时间顺序。C18 箭头表示安装的信息流，展示单个包及其 .bin 入口，逻辑依赖树另由 npm ls 读取。

C23 的 `c23-state-snapshot.d2` 展示状态快照与更新队列；C29 的 `c29-effect-lifecycle.d2` 展示同一 Effect 的 setup/cleanup 顺序，蓝色容器表示根 StrictMode 的首次开发检查，生产路径跳过该容器。加入这两张后共 13 张；C30 继续复用 Effect 生命周期图。

C39 的 `c39-ui5-family-binding.d2` 上半部展示 Fiori 对两条 UI 技术路线的设计指导与 React 库的包装关系，下半部展示经典 UI5 的 View 事件、Controller 写模型和绑定通知；当前共 14 张。

## 准备与生成

操作方式：维护者构建。验证状态：macOS arm64 的准备/构建路径和 Pages Actions 的 Ubuntu 24.04/Linux x64 路径均于 **2026-10-15** 实际执行通过；macOS x64、Linux arm64 和原生 Windows 路径尚未执行。学习者阅读 C01 不需要安装 D2。

推荐在固定 Node/npm 环境下执行：

```sh
npm run setup:diagrams
npm run diagrams
```

准备脚本支持 macOS/Linux 的 arm64 与 x64，按官方发布资产的固定 SHA-256 校验归档后解压，再核对字体。Windows 可在 WSL 中执行，原生 Windows 路径尚未验证。Linux 的实际 CI 结果见 [STATUS](../docs/STATUS.md)。

以下命令工作目录均为**仓库根目录**。需要 Bash、curl、tar、Python 3 和 `shasum` 或 `sha256sum`。

```sh
mkdir -p .cache/tools
curl -fL --max-time 120 https://github.com/d2lang/d2/releases/download/v0.9.0/d2-v0.9.0-macos-arm64.tar.gz -o .cache/tools/d2-v0.9.0-macos-arm64.tar.gz
tar -xzf .cache/tools/d2-v0.9.0-macos-arm64.tar.gz -C .cache/tools
curl -fL --max-time 120 'https://raw.githubusercontent.com/google/fonts/a85815a42757630ce188fdad368c2dfc444d4773/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf' -o .cache/tools/NotoSansSC.ttf
bash scripts/build-diagrams.sh
```

其他平台从 [D2 固定版本发布页](https://github.com/d2lang/d2/releases/tag/v0.9.0) 选择对应资产，或按官方安装方式安装 **0.9.0**，再准备同一字体。脚本依次选择 `D2_BIN` 指定的可执行文件、仓库本地二进制、PATH 中的 `d2`。例如在仓库根目录执行：

```sh
D2_BIN=/absolute/path/to/d2 bash scripts/build-diagrams.sh
```

字体 SHA-256：

```text
a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da
```

缺少 D2、版本不匹配、缺少字体、字体校验失败或 D2 编译失败，脚本都会以非零状态退出。脚本不会自动下载或更新工具；准备完成后生成 SVG 可离线执行。

## 验证边界

- D2 编译成功；SVG 能解析，包含全部中文标签和文字。
- 在 Chrome 155.0.8059.40 中检查图的中文与连线布局。图采用自带浅色背景，可在深色正文中保持对比。
- 图附近有 alt 与独立的文字解释；环境表格重复列出重要信息，不能只靠图读懂课程。
- 已接入 Astro 资产处理与 `/js_web/` 子路径构建检查；本地生产预览和线上 Pages 在 Chrome 的 1280px/360px、亮暗模式下均正常加载中文 SVG，实际验证结果见 [STATUS](../docs/STATUS.md)。

依据（2026-10-15 核查）：[D2 CLI](https://d2lang.com/tour/man/)、[D2 字体配置](https://d2lang.com/tour/fonts/)、[SVG 导出](https://www.d2lang.com/tour/exports/)、[Noto Sans SC 来源](https://github.com/google/fonts/tree/a85815a42757630ce188fdad368c2dfc444d4773/ofl/notosanssc)。字体许可原文保存在 [NotoSansSC-OFL.txt](NotoSansSC-OFL.txt)。
