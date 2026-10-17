import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LocalStockBroken from "./LocalStockBroken.jsx";
import SharedStock from "./SharedStock.jsx";
import SwitchProductBroken from "./SwitchProductBroken.jsx";
import SwitchProductFixed from "./SwitchProductFixed.jsx";
import IdentityProbe from "./IdentityProbe.jsx";
import "../src/styles.css";

const cases = { local: LocalStockBroken, shared: SharedStock, switch: SwitchProductBroken,
  "switch-answer": SwitchProductFixed, identity: IdentityProbe };
const Example = cases[new URLSearchParams(location.search).get("case")] ?? SharedStock;
createRoot(document.getElementById("root")).render(<StrictMode><h1>状态归属与身份实验</h1><Example /></StrictMode>);
