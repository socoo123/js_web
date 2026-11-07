import { useEffect, useState } from "react";

// 选做：不看参考实现，在这个空白页里从零写出库存前端。
// 接口说明：https://socoo123.github.io/js_web/labs/api/ ；/api 已由 Vite 代理到 http://127.0.0.1:8070。
//
// TODO 1 接列表：GET /api/products，渲染 items，并显示 totals 里的商品数与总库存。
// TODO 2 详情：点一行后 GET /api/products/:id，显示详情并记下响应头 ETag（就是 version）。
// TODO 3 保存与 422：PATCH /api/products/:id 带 If-Match；422 时把 error.fields 显示在对应输入框旁，409 时提示冲突。
// TODO 4 补货：POST /api/products/:id/restock，成功后重新读取列表和详情。
// TODO 5 低库存服务端筛选：勾选「仅低库存」时请求 /api/products?stock=low，汇总用响应里的 summary。

const statusText = {
  checking: "正在检查后端…",
  online: "后端在线：GET /api/health 返回 {\"ok\":true}",
  offline: "后端离线：先在另一个终端运行 npm run lab -- api，再刷新本页",
};

export default function App() {
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => setHealth(body?.ok === true ? "online" : "offline"))
      .catch((error) => {
        if (error.name !== "AbortError") setHealth("offline");
      });
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>从零写库存前端</h1>
      <p className={`health ${health}`} role="status">{statusText[health]}</p>
      <p>打开 <code>shell/App.jsx</code>，按文件顶部的 TODO 1–5 逐个完成。</p>
    </main>
  );
}
