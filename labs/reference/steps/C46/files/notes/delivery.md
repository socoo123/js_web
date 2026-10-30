# 静态库存交付

## 构建与运行

在当前 inventory 工作区执行 npm run lab -- start C46，再 npm run lab -- build。输出 dist/src-react，公开前缀 /js_web/demos/inventory/。
Node 负责构建；浏览器执行产物。课程网站另由 Astro 构建为仓库根 dist，前缀 /js_web/，不是同一个首页。

## 严格静态预览

运行 LAB_STATIC_ROOT=dist/src-react node tools/static-react-server.mjs，打开 http://127.0.0.1:8068/js_web/demos/inventory/。
服务器只读取已有产物，不重建、不更改 base、不回退到首页。
检查入口与 CSS、懒加载报表、products.json、source map；hash #/products/P004 刷新仍可读，products/P004/ 和 assets/missing.js 应404。
修改源码或 base 后必须重新 build。检查前结束手工预览，避免8068端口冲突。

## 运行与恢复

固定数据6/52/2634800。repository 自动持久化已确认的业务修改；筛选只改URL。首次读取损坏快照时保留原文，可用有效备份或导入自己导出的文件恢复。
不要删除整个同源存储；学习进度和库存是不同的键。

## 个人发布

完整上传本次产物；课程仓库默认只发布教程与学习包，本地库存预览不是线上演示。
个人 Pages 选择 GitHub Actions，按自己的公开URL修改base，记录提交、run、线上首页、hash刷新、资源与404的实际结果。
个人发布结果：自行执行后填写；模板与本地检查不等于已经部署。
