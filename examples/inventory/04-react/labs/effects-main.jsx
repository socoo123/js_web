import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { products } from "../../../shared/products.js";
import WatchControls from "./WatchControls.jsx";
import SubscriptionBroken from "./SubscriptionBroken.jsx";
import StaleSubscriptionBroken from "./StaleSubscriptionBroken.jsx";
import GuardedSubscriptionBroken from "./GuardedSubscriptionBroken.jsx";
import IntervalBroken from "./IntervalBroken.jsx";
import IntervalFixed from "./IntervalFixed.jsx";
import LoopBroken from "./LoopBroken.jsx";
import LoopFixed from "./LoopFixed.jsx";
import EffectBoundary from "./EffectBoundary.jsx";
import "../src/styles.css";

const cases = { lifecycle: <WatchControls />, missing: <WatchControls Watch={SubscriptionBroken} />,
  stale: <WatchControls Watch={StaleSubscriptionBroken} />, guard: <WatchControls Watch={GuardedSubscriptionBroken} />,
  interval: <IntervalBroken />,
  "interval-answer": <IntervalFixed />, loop: <LoopBroken products={products} />,
  "loop-answer": <LoopFixed products={products} /> };
const example = cases[new URLSearchParams(location.search).get("case")] ?? cases.lifecycle;
createRoot(document.getElementById("root")).render(<StrictMode><h1>Effect 生命周期实验</h1>
  <EffectBoundary>{example}</EffectBoundary></StrictMode>);
