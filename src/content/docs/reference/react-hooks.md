---
title: React Hooks 速查
description: 按数据、外部同步、性能与提交选择 Hook，并回到库存课程复现关键行为。
sidebar:
  order: 3
---

先确定谁拥有数据、什么触发变化，再选 Hook。普通派生计算可以直接写在组件中。[React 官方 Hooks 目录](https://react.dev/reference/react/hooks)适合查完整 API，本页连接已学过的库存场景。

跟做入口是 [L3 React 库存应用](../../labs/l3/)：从 C20 开始，在自己的 `src/react/` 逐课增加能力。这里是查阅表，不要求另开旧示例工程；逐课 `examples/cNN/README.md` 保留验证记录。

## 保存数据与共享入口

| API 与课程 | 场景与规则 |
| --- | --- |
| <code style="white-space: nowrap">useState</code><br>[C23](../../05-react/c23-state-snapshot-queue/)、[C24](../../05-react/c24-arrays-keys-derived/) | 编辑开关、字符串草稿、单个计数。每次渲染拿自己的快照；基于旧值累加用函数式更新；对象与数组按只读更新 |
| <code style="white-space: nowrap">useReducer</code><br>[C27](../../05-react/c27-reducer-context/) | 多种库存更新，由纯函数解释 action。reducer 接收待处理状态与 action，返回下一状态；副作用留在事件或同步层 |
| <code style="white-space: nowrap">useContext</code><br>[C27](../../05-react/c27-reducer-context/) | 深层组件读最近 Provider 的值。每个 Provider 是独立实例；消费值改变会更新消费者；并不自动持久化 |
| <code style="white-space: nowrap">useRef</code><br>[C28](../../05-react/c28-refs-external-systems/) | DOM 节点、定时器句柄、跨渲染可变容器。current 改变不触发渲染；可见数字用 state；DOM 操作安排在提交后或事件中 |

业务 id 定位商品；组件 key 决定同级状态的身份；query key 区分查询数据。它们不是 Hook，但决定了许多 Hook 状态何时复用。[C26 保留与重置](../../05-react/c26-state-ownership-reset/)、[C32 查询缓存](../../05-react/c32-tanstack-query-server-state/)

C24–C31 的业务商品由 React/reducer 管理；C32 起 repository 管商品与持久化，Query 管缓存，组件 state 留筛选、选中项与草稿。别把查询结果再塞进另一份可写 state，也别同时让 Effect 与 repository 写同一快照。

## 外部同步与逻辑复用

| API 与课程 | 场景与规则 |
| --- | --- |
| <code style="white-space: nowrap">useEffect</code><br>[C29](../../05-react/c29-effects-cleanup/) | 把提交后的状态同步到外部系统，如订阅、标题、请求。依赖变化先清理旧同步，再建立新同步；依赖包含读取的响应式值。派生列表直接计算，点击保存放事件 |
| <code style="white-space: nowrap">请求清理</code><br>[C30](../../05-react/c30-requests-races/) | 让旧请求结果失效，取消支持 signal 的工作。每次 setup 独立的 ignore 保护异步更新；cleanup 先失效再 abort |
| <code style="white-space: nowrap">自定义 Hook</code><br>[C31](../../05-react/c31-custom-hooks-routing/) | 复用状态逻辑与同步过程。调用两次通常有两份独立状态；Hook 名字以 use 开头，在内部继续遵守依赖规则 |
| <code style="white-space: nowrap">Query Hooks</code><br>[C32](../../05-react/c32-tanstack-query-server-state/) | 管理请求、缓存、重试和失效。useQuery/useMutation 来自 TanStack Query；query key 包含读取变量，客户端跨渲染稳定 |

Effect 与 useMemo 的依赖逐项按 Object.is 比较。更换一个新建的对象会使身份改变；缺少依赖则可能一直使用旧闭包。先修复逻辑和依赖，再讨论减少更新。[Effect 生命周期](https://react.dev/learn/lifecycle-of-reactive-effects)

## 性能与加载

| API 与课程 | 场景与规则 |
| --- | --- |
| <code style="white-space: nowrap">useMemo</code><br>[C34](../../05-react/c34-performance-loading-errors/) | 在依赖不变时复用计算结果。性能缓存可被丢弃，正确性不能依赖它；六件商品筛选通常直接计算 |
| <code style="white-space: nowrap">useCallback</code><br>[C34](../../05-react/c34-performance-loading-errors/) | 在依赖不变时复用函数身份。通常配合依赖身份的消费者；新包一层函数不保证更快 |
| <code style="white-space: nowrap">useTransition</code><br>[C34](../../05-react/c34-performance-loading-errors/) | 标记可中断的较低优先级更新，提供 isPending。受控输入及时更新；不会把同步重计算搬到另一线程 |
| <code style="white-space: nowrap">memo</code><br>[C34](../../05-react/c34-performance-loading-errors/) | 按 props 等条件跳过重复渲染。它是组件包装 API；组件自己的 state 和消费的 Context 仍可触发更新 |
| <code style="white-space: nowrap">lazy / Suspense</code><br>[C34](../../05-react/c34-performance-loading-errors/) | 按需加载组件代码与展示等待区域。普通 Effect fetch 不自动触发 Suspense；渲染异常由错误边界处理 |

在 Profiler 里用同样数据和操作比较前后。看到函数名就包 useCallback，会增加阅读和依赖维护成本。[React DevTools](https://react.dev/learn/react-developer-tools)

## 现代提交与进阶读取

| API 与课程 | 场景与规则 |
| --- | --- |
| <code style="white-space: nowrap">useActionState</code><br>[C33](../../05-react/c33-modern-react-actions/) | action 接收 previousState 和 payload，返回下次结果。处理校验、异步提交与结果；手动 dispatcher 调用需要 Action 上下文 |
| <code style="white-space: nowrap">useFormStatus</code><br>[C33](../../05-react/c33-modern-react-actions/) | 读取最近上层 form 的提交状态。提交按钮放在 form 后代；读不到同一组件自己返回的 form |
| <code style="white-space: nowrap">useOptimistic</code><br>[C33](../../05-react/c33-modern-react-actions/) | Action 期间提供乐观视图，结束后采用来源值。预览绝对预计库存，真正保存和失效仍由 mutation 负责 |
| <code style="white-space: nowrap">use</code><br>[C33](../../05-react/c33-modern-react-actions/) | 读取 Promise 或 Context 等资源。进阶实验只读跨渲染稳定的 Promise；可以在条件与循环中调用，仍须位于组件或 Hook 内 |

这些浏览器提交实验使用本地 mock。Server Functions 与 RSC 需要相应框架或构建支持；普通 Vite 页面不会因函数叫 action 就获得服务器。[React use](https://react.dev/reference/react/use)、[useActionState](https://react.dev/reference/react/useActionState)

## 写代码前的五个问题

1. 能从现有 props/state 直接算出吗？能就直接计算。
2. 变化要显示在页面上吗？要则用 state/reducer；仅保存句柄可用 ref。
3. 谁触发这件事？用户点击交给事件；外部同步考虑 Effect 与清理。
4. 状态要给谁读？先找共同父节点，再决定 props 或 Context；远端缓存考虑 Query。
5. 已经测到性能问题吗？先用 Profiler 留证据，再决定是否需要缓存与 Transition。

普通 Hook 在组件或自定义 Hook 顶层调用，保持调用顺序；use 的条件调用是专门规则。初始化函数、reducer 和渲染保持纯粹，写存储这样的操作放到明确的事件或同步阶段。[Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)

遇到「更新了但看起来没变」，在自己的工作区按 [C36 项目复盘](../../05-react/c36-react-project-debugging/)复现与修复：统计来源、缓存身份、损坏的本地输入分别需要不同证据。[L5](../../labs/l5/)继续保留的 React 主应用做排错和交付；没有必要把所有问题都改写为 Hook 问题。
