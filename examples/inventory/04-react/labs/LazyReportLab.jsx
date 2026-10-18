import { lazy } from "react";
import { InventoryProvider } from "../src/InventoryContext.jsx";
import InventorySummary from "../src/InventorySummary.jsx";
import InventoryCounter from "../src/InventoryCounter.jsx";
import ReportPanel from "../src/ReportPanel.jsx";

const mode = new URLSearchParams(location.search).get("case");
const SlowReport = lazy(async () => {
  // 只为观察 fallback 加延时，实际项目的 import 没有这段等待。
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (mode === "chunk-error") throw new Error("模拟报表模块加载失败");
  return mode === "render-error" ? import("./CrashReport.jsx") : import("../src/InventoryReport.jsx");
});

export default function LazyReportLab() {
  return <InventoryProvider>
    <InventorySummary /><InventoryCounter /><ReportPanel Report={SlowReport} />
  </InventoryProvider>;
}
