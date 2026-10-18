import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createInventoryQueryClient } from "../src/query-client.js";
import { fetchProduct } from "../src/product-api.js";
import ReportErrorBoundary from "../src/ReportErrorBoundary.jsx";
import ReviewSummaryCase from "./ReviewSummaryCase.jsx";
import ReviewSummaryBroken from "./ReviewSummaryBroken.jsx";
import ReviewSummaryFixed from "./ReviewSummaryFixed.jsx";
import ReviewQueryCase from "./ReviewQueryCase.jsx";
import ReviewQueryBroken from "./ReviewQueryBroken.jsx";
import ReviewQueryFixed from "./ReviewQueryFixed.jsx";
import ReviewStorageBroken from "./ReviewStorageBroken.jsx";
import ReviewStorageFixed from "./ReviewStorageFixed.jsx";
import "../src/styles.css";

const storageKey = "js_web:c36:broken:v1";
function StorageCase({ View }) {
  const [attempt, setAttempt] = useState(0);
  function replace(raw) {
    if (raw === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, raw);
    setAttempt((value) => value + 1);
  }
  return <section aria-label="存储复盘">
    <button onClick={() => replace("{")}>写入损坏副本并重新加载实验</button>{" "}
    <button onClick={() => replace(null)}>清除实验副本</button>
    <ReportErrorBoundary key={attempt} fallback={<p role="alert">实验读取失败，请看 Console 与错误堆栈。</p>}>
      <View storage={localStorage} storageKey={storageKey} />
    </ReportErrorBoundary>
  </section>;
}
function ReviewApp() {
  const [client] = useState(createInventoryQueryClient);
  const mode = new URLSearchParams(location.search).get("case") ?? "summary";
  const cases = {
    summary: <ReviewSummaryCase Summary={ReviewSummaryBroken} />,
    "summary-answer": <ReviewSummaryCase Summary={ReviewSummaryFixed} />,
    query: <ReviewQueryCase Details={ReviewQueryBroken} loadProduct={fetchProduct} />,
    "query-answer": <ReviewQueryCase Details={ReviewQueryFixed} loadProduct={fetchProduct} />,
    storage: <StorageCase View={ReviewStorageBroken} />,
    "storage-answer": <StorageCase View={ReviewStorageFixed} />,
  };
  return <QueryClientProvider client={client}><main>
    <h1>React 项目故障复盘</h1>
    <nav>{Object.keys(cases).map((name) => <a key={name} href={`?case=${name}`}>{name}{" "}</a>)}</nav>
    {cases[mode] ?? cases.summary}
  </main></QueryClientProvider>;
}
createRoot(document.getElementById("root")).render(<StrictMode><ReviewApp /></StrictMode>);
