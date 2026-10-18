import { lazy, Suspense, useContext, useState } from "react";
import { ProductsContext } from "./InventoryContext.jsx";
import ReportErrorBoundary from "./ReportErrorBoundary.jsx";

const InventoryReport = lazy(() => import("./InventoryReport.jsx"));

export default function ReportPanel({ Report = InventoryReport }) {
  const products = useContext(ProductsContext);
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const fallback = <div role="alert">
    <p>报表暂时无法显示。修正渲染输入后可重试；模块加载失败请恢复网络后刷新页面。</p>
    <button onClick={() => setAttempt((value) => value + 1)}>重试报表渲染</button>
  </div>;
  return <section aria-labelledby="report-heading">
    <h2 id="report-heading">分类报表</h2>
    <button aria-expanded={open} aria-controls="inventory-report" onClick={() => setOpen(!open)}>
      {open ? "收起分类报表" : "查看分类报表"}</button>
    <div id="inventory-report">{open && <ReportErrorBoundary key={attempt} fallback={fallback}>
      <Suspense fallback={<p role="status">正在加载报表代码…</p>}>
        <Report products={products} />
      </Suspense>
    </ReportErrorBoundary>}</div>
  </section>;
}
