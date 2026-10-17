import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import InventoryCounter from "../src/InventoryCounter.jsx";
import QueueBroken from "./QueueBroken.jsx";
import QueueFixed from "./QueueFixed.jsx";
import SnapshotProbe from "./SnapshotProbe.jsx";
import DelayBroken from "./DelayBroken.jsx";
import DelayFixed from "./DelayFixed.jsx";
import MixedQueue from "./MixedQueue.jsx";
import CountPanel from "./CountPanel.jsx";
import BasicCounter from "./BasicCounter.jsx";
import "../src/styles.css";

function RulesPreview() {
  const [visible, setVisible] = useState(true);
  return <>
    <button type="button" onClick={() => setVisible((v) => !v)}>切换面板</button>
    <CountPanel visible={visible} />
  </>;
}

const cases = {
  basic: BasicCounter,
  queue: QueueBroken,
  "queue-answer": QueueFixed,
  snapshot: SnapshotProbe,
  delay: DelayBroken,
  "delay-answer": DelayFixed,
  mixed: MixedQueue,
  rules: RulesPreview,
  independent: () => <><InventoryCounter /><InventoryCounter /></>,
};
const Preview = cases[new URLSearchParams(location.search).get("case")] ?? SnapshotProbe;
createRoot(document.getElementById("root")).render(
  <StrictMode><h1>状态与更新实验</h1><Preview /></StrictMode>,
);
