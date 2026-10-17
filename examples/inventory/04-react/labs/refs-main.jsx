import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import RefProbe from "./RefProbe.jsx";
import RefCountBroken from "./RefCountBroken.jsx";
import RefCountFixed from "./RefCountFixed.jsx";
import FocusForm from "./FocusForm.jsx";
import FocusMountBroken from "./FocusMountBroken.jsx";
import FocusMountFixed from "./FocusMountFixed.jsx";
import LocalTimerBroken from "./LocalTimerBroken.jsx";
import InventoryCounter from "../src/InventoryCounter.jsx";
import "../src/styles.css";

function RemovableTimer() {
  const [visible, setVisible] = useState(true);
  return <><button onClick={() => setVisible((value) => !value)}>显示或隐藏盘点</button>
    {visible && <InventoryCounter />}</>;
}
const cases = { probe: <RefProbe />, count: <RefCountBroken />, "count-answer": <RefCountFixed />,
  focus: <FocusForm />, early: <FocusMountBroken />, "early-answer": <FocusMountFixed />,
  timer: <LocalTimerBroken />, "timer-answer": <RemovableTimer /> };
const example = cases[new URLSearchParams(location.search).get("case")] ?? cases.probe;
createRoot(document.getElementById("root")).render(<StrictMode><h1>Ref 与外部系统实验</h1>{example}</StrictMode>);
