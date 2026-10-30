# 库存交付排错

这是参考记录的结构；自己的实际值、截图和采样文件保存在自己的工作区。

## 状态

- 复现：App 的 restock 绕开 dispatch，直接修改 products 中的商品；从 P001=12 点击立即补一件。
- 证据：Sources 中字段已变13，页面仍12；repository 与 Query 的正式更新链没有运行。
- 根因与修复：读取结果当成可变 state；恢复 await dispatch({ type: "restocked", id, amount })。
- 复验条件：一次点击13、总库存53；P004仍3；刷新从 repository 已持久化的数据读取。

## 资源、存储、布局

- Network：把 src/react/index.html 的 main.jsx 拼错会产生模块404；改回同一文件名再刷新。
- Application：保存快照，导入含空库存的 JSON；拒绝后业务主键与 backup 原文不变。只在专用本地 origin 操作。
- Elements：360px 给 main 加 min-width:44rem 可复现溢出；删除该声明，不裁切 body。
- 键盘：P004取消仍3/52；保存8且清空搜索后8/57，P001仍12；空白拒绝并聚焦库存。

## 性能与内存

- 同一视口录制首次/再次展开分类报表；记录模块下载、脚本与布局分别占在哪里。
- 快捷键 Hook 清理前后，按相同次数切换筛选；记录 keydown 监听器数与保留链，而非只比较总堆。
- 将自己实际录制的文件、操作次数、观察与限制填在这里。自动行为检查不能代替对采样的解释。
