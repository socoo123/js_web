import { Profiler, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import PerfBroken from "./PerfBroken.jsx";
import PerfFixed from "./PerfFixed.jsx";
import SlowList from "./SlowList.jsx";
import TransitionFilter from "./TransitionFilter.jsx";
import StaleMemoBroken from "./StaleMemoBroken.jsx";
import StaleMemoFixed from "./StaleMemoFixed.jsx";
import LazyReportLab from "./LazyReportLab.jsx";
import RequestControls from "./RequestControls.jsx";
import "../src/styles.css";

function recordRender(id, phase, actualDuration, baseDuration) {
  console.log("渲染测量", { id, phase, actualDuration, baseDuration });
}
const mode = new URLSearchParams(location.search).get("case");
const cases = { before: <PerfBroken />, memo: <PerfBroken List={SlowList} />, after: <PerfFixed />,
  transition: <TransitionFilter />, stale: <StaleMemoBroken />, "stale-answer": <StaleMemoFixed />,
  lazy: <LazyReportLab />, "chunk-error": <LazyReportLab />, "render-error": <LazyReportLab />,
  request: <Suspense fallback={<p>Suspense 正在等待…</p>}><RequestControls /></Suspense> };

createRoot(document.getElementById("root")).render(<StrictMode><main>
  <h1>性能、加载与错误实验</h1>
  <p>性能实验重复展示六件固定商品为 1200 行，并人为增加行渲染计算。实验不写入业务库存。</p>
  <Profiler id="InventoryLab" onRender={recordRender}>{cases[mode] ?? cases.before}</Profiler>
</main></StrictMode>);
