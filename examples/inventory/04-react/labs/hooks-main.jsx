import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HookCounters from "./HookCounters.jsx";
import StoredNotes from "./StoredNotes.jsx";
import RequestControls from "./RequestControls.jsx";
import StaleHookDetails from "./StaleHookDetails.jsx";
import "../src/styles.css";

const cases = {
  counters: <HookCounters />,
  storage: <StoredNotes />,
  request: <RequestControls />,
  stale: <RequestControls Details={StaleHookDetails} />,
};
const example = cases[new URLSearchParams(location.search).get("case")] ?? cases.counters;
createRoot(document.getElementById("root")).render(<StrictMode><h1>自定义 Hook 实验</h1>{example}</StrictMode>);
