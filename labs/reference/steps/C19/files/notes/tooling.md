# 工具比较 · 完成参考记录

- Node 24；npm 11；pnpm 12。两个副本都运行 node src/cli/report.js，输出商品数 6、总库存 52、总价值 2634800 分。
- npm 生成 package-lock.json；semver 局部解析到 node_modules/semver/index.js。
- pnpm 生成 pnpm-lock.yaml；真实路径经过 node_modules/.pnpm/semver@7.8.5/node_modules/semver/index.js。
- 删除显式依赖后需同时检查声明和实际解析来源；祖先安装可能掩盖缺失。
- 运行时仍为 Node；Bun 的宿主 API 兼容性要另测。本工作区保持 npm，不增加其他管理器主锁。
