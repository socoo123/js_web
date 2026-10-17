import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RenderProbe from "./RenderProbe.jsx";
import "../src/styles.css";

const root = createRoot(document.getElementById("root"));
let label = "库存清单";
function show() {
  root.render(<StrictMode><RenderProbe label={label} /></StrictMode>);
}
document.getElementById("same").addEventListener("click", show);
document.getElementById("change").addEventListener("click", () => {
  label = label === "库存清单" ? "本次盘点" : "库存清单";
  show();
});
show();
