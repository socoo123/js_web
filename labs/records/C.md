# C · 交付、导航与终验（验收完成，待发布）

2026-10-29–30。范围为 C45–C48 / L5、导航与参考入口、学习包和构建/CI、C15 定点修正及全站视觉/F1。四路及返修全部结束，主验收与正式冻结已完成；提交、Pages 和线上核验待执行。

## 基线与四路

- `main` 基线 `50a2b556a25d276290ea977ba07dc2de77c09205`，启动时工作区干净；`git fetch origin` 后远端无新增提交。保留 A/B 源码、锁和四版历史发行包。
- B 最终 [Pages 40894773433](https://github.com/socoo123/js_web/actions/runs/40894773433) 对应该基线，build/deploy 均成功。
- 启动前实际查询模型：`openai/gpt-6.1-sol` 为 active、包含 `max`。四路连续后台启动，全部 `general` / `openai/gpt-6.1-sol#max` / `background: true`，禁止提交推送或向下委派。
- 隔离根：`/private/var/folders/5k/y6qh6sfd2g30js0v0qrv4mfr0000gn/T/opencode/js-web-C-20261029/`；每路从同一基线复制 1945 个跟踪文件，`baseline-hashes.json` 保留摘要，`dispatch.md` 规定文件归属、接口与端口。

| 路 | 范围 | sessionID | 状态 |
| --- | --- | --- | --- |
| 1 | C45–C48 / L5 课程、步骤与风险回归 | `ses_e77d35f6dffe2l7WKIlnD9oNA0` | 最终补验及个人模板权限返修通过，已结束 |
| 2 | 首页/路线/Lab/四速查/README | `ses_e77d31ed5ffewBxqDT3D3swryK` | 最终补验通过，已结束，无源码返修 |
| 3 | 学习包/恢复/冻结、构建与 CI | `ses_e77d2d49cffe4vz9mqd6H6fq8i` | 最终补验通过，已结束，无源码返修 |
| 4 | C15 定点修正、全站视觉与 F1 | `ses_e77d28afdffe0ca13ePgGDfPFZ` | 最终61页/366组及F1通过，已结束 |

共享 catalog、注册表、package/lock、来源、状态与发行生成物由主 agent 集成；L5 从 C44 保留的 React 主应用继续。发行版为 `2026.10-v2.5`，已正式冻结，尚未发布。全部子任务与自建服务已结束。

## 接管核对

- 保存 238 个历史发行文件（234 包与 4 份清单）的 SHA-256，以及当前 61 个静态页面的 H2/H3 锚点；文件分别为隔离根 `baseline-frozen-hashes.json`、`baseline-anchors.json`。
- 实际下载线上 v2.4/C44.tar.gz，HTTP 200，SHA-256 为 `75d432b7c3c0c3745208eeb98820c3fca38998a96464720967c270077f6778ab`，与冻结清单一致。此为接管基线，不作为新发行版验收。
- C01–C44 主线旧示例引用经定点审阅：C06/C07/C08 的跨目录操作均置于“可选机制实验”折叠区，其余旧示例链接明确为按需参考；必做步骤继续当前 Lab。C45–C48 由第 1 路迁移后另验。

## 主 agent 独立教学验收

- 起点：从候选严格站点公开URL下载 `2026.10-v2.5/C44.tar.gz`，下载时SHA为 `c3893ba05d0eaa7ef4bd22aa1462376009fa982c1cb445940f05fb4101823754`，另存 `reader-C44` 并独立 `npm ci`。当时catalog迁移标记未最终确定，此SHA为抽验候选，不是冻结发行SHA。
- 主 agent 在跟做期间只读起点和四课公开HTML；提取正文时删除全部details，不读教师steps、参考答案或自动装配脚本。代码从Expressive Code行元素提取，保留真实换行。四课检查通过后才审阅教师实现。
- C45：按正文临时修改App/index/CSS并恢复原字节。绕开dispatch时按钮后仍12，恢复后13/53/2674700；mian.jsx真实404；360px溢出704→360；坏导入保留主键/backup原文，恢复留存damaged。CDP监听前后1→1；性能指标单独记录，未冒称GUI heap保留链分析。
- C46：独立增加vite base与交付笔记；base=/时构建成功但严格只读服务器的/assets入口404，恢复嵌套base并重建后200。JSON六件、报表、P004 hash刷新通过；干净详情/缺失JS返回404。
- C47：由公开三段代码新建regression测试。提前setItem的真实故障使旧原文断言红，删除后绿；未加同步路由时9条Vitest绿而生产逐字输入得到P4（期望P004）；按正文加useTransitions=false后完整检查绿。
- C48：不看答案独立实现URL stock=low、筛选交集、checkbox及保存后焦点判断，独立写3条回归；1–5排除0、初始2项8/539200、保存P004=8离开结果并聚焦标题、清除全量57通过。浅复制故障使旧P002=0断言红，按路径复制后绿。
- 实际 `LAB_DELIVERY_PORT=19018 npm run lab -- check C45/C46/C47/C48` 分别通过85条必要core检查及4/5/6/7组浏览器；C47为9条Vitest、C48为12条。四份notes记录实际证据和未做项目。日志 `reader-check-C*.log`、`reader-*-red/green.log`、C45/C46结果JSON保存在隔离根。
- 主在独立C48产物补跑360/768/1280px真实键盘：Tab到搜索/编辑/库存/取消/保存，取消仍3、空白拒绝且聚焦、Enter保存8/全量57/P00112；三档无整页溢出，结果及截图在`reader-keyboard/`，主目视抽查360px。此为自动真实键盘浏览器，不冒称真人手工或真机。
- 最终C44候选包与独立跟做起点逐文件比较，仅`tools/catalog.json`的最终迁移/错误证据元数据变化，业务源码、配置、运行工具均相同；最终C44 tar SHA为`4148661364552b26cccc5f0068ad003e0b32e2b2a10068a2673085ff3606e990`。
- 独立抽验没有缺失的必要源码步骤。C45 GUI Sources/Performance/Memory、C46个人仓库发布按正文保留未运行标注；本次只完成连续交付链，不声称48课都由主agent重新独立跟做。

## 集成与主门禁

首稿68项操作及第2路两文件返修已集成；主合并v2.5 catalog、C15注册表删除、最终scripts，修正C46 D2嵌套路径并重建SVG。C45–C48 implemented/migrated已按独立验收设true；这不是已发布状态。最终1971份源码与主实际dist同步回四个隔离副本后，原会话并行补验全部通过。

- 主 `npm run check`：34文件，0 errors/warnings/hints。
- 主 `npm run build`：16条Lab/片段契约、21张Java双栏及95片段、48课lint零error/warning、310固定输出、18条F1数据测试、14张D2、61页面、5版332包全部通过。构建包含的子命令未另做全量重复执行。
- 主内容审计：48个旧URL/任务卡/catalog一致、旧课程锚点无缺失、五起点C00/C10/C20/C36/C44可下载。锁文件无改动。
- 主walkthrough首次暴露C15删除注册后旧组装器仍引用该卡，已改为正文同用的`snippet('c15-css')`；保留首次失败日志，复跑通过。
- 追加实测C45公开生产命令：默认配置经既有CLI构建的入口确为嵌套base，严格只读服务200；不是把C46配置倒灌到C45。
- 主四条行为门禁全部退出0：walkthrough的C00→C20及C03/C23/C41红绿、React16快照、组件/UI5八快照与静态专项、delivery四课/10组红绿/C35兼容。主独立核对238个历史发行文件SHA与接管基线一致。

## 四路最终候选补验

- 第1路：四课85条必要core、4/5/6/7组浏览器、C47九条/C48十二条Vitest、10组真实故障红绿与C35兼容1/1通过；74个旧锚点保留。最终报告在`agent-1/delivery/final-report.md`。
- 第2路：60入口HTTP200、1125站内链接与205锚点、五起点/24学习日/预算/命令责任一致；v2.5 98包和5927项包内源码SHA通过。Astro preview自动解码gzip的边界已记录，线上仍须验证响应头与浏览器实际另存SHA。报告在`agent-2/delivery/final-report.md`。
- 第3路：332包tar/JSON文件集合与SHA相同；五个实际下载起点恢复、只读/暂停/拒绝覆盖/坏包保护通过；独立副本模拟冻结99文件字节稳定，工具改错拒绝且原冻结不变，历史/当前产物四种故障红绿。正式冻结由主执行，报告在`agent-3/delivery/final-report.md`。
- 第4路：最终61页×三宽度×亮暗=366组、14张D2、键盘/双侧复制/答案/七词搜索、61页360px无JS阅读及完整F1通过；F1包含真实JSON下载、跨标签、坏数据与三类写满保护。453张截图和结果保存在`agent-4/.cache/qa/final-integrated-C/`，报告在`agent-4/delivery/final-report.md`。
- 第1路个人模板后续返修：`examples/c46/deploy-react.yml`的build补`contents:read/pages:read`，主最小合入模板和README，并独立解析YAML核对权限。锁定action源码及官方权限已核对；这是配置验证，个人仓库云端仍未运行。

## 主视觉确认与冻结

- 主目视本次C45手机亮色首屏、C46交付D2、C03桌面暗色双栏、C48手机暗色展开答案、路线页手机48/48进度截图；中文、图线、焦点、阅读与局部代码滚动正常。没有声称逐张审阅全部截图。
- 主核对61页HTML聚合SHA为`30a290e76b1949e3b29d6c3167bc16b9be5e0d415312fa438729e085cdedee57`，与第4路一致；主dist全部524文件与其副本同名文件SHA一致，public全部339文件一致。隔离副本额外残留30个旧D2/Pagefind文件，首次全树严格比较因此报告缺失；主随后在自己的干净dist运行七词搜索及C46图加载，全部通过、无资源404或浏览器错误，证据为隔离根`main-clean-dist-search.json`。旧残留不进入发布。
- 将已验证的`public/downloads/inventory/2026.10-v2.5/`原样冻结至`labs/releases/2026.10-v2.5/`：49快照、98包、1清单。冻结后`npm run build:labs`核对实际参考源码与冻结内容通过；`npm run check:build`通过61页及5版332包，冻结文件与候选逐字一致。
- v2.5清单SHA：`23482b483d8c962b98f76052b9131d72a8b8f206a11c6d5f4a8d811000fa07fb`；C44 tar SHA：`4148661364552b26cccc5f0068ad003e0b32e2b2a10068a2673085ff3606e990`。历史238文件SHA保持接管基线。

## 验证边界

主与子路浏览器验证使用macOS/Chromium；未执行Firefox、Safari/WebKit、Edge、Windows、真机/触摸、屏幕阅读器或真人DevTools GUI分析。个人库存仓库Actions/Pages未发布，课程网站发布不等于Lab演示已上线。C45/C46正文与示例记录保留相应未运行标注；自动装配、独立读者抽验与截图目视证据分别记录。

## 发布

待提交、对应Pages成功及线上课程/清单/332包SHA、五个Lab起点浏览器实际下载核验后填写。
