import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RequestControls from "./RequestControls.jsx";
import RaceBroken from "./RaceBroken.jsx";
import AbortOnly from "./AbortOnly.jsx";
import FinallyBroken from "./FinallyBroken.jsx";
import FinallyFixed from "./FinallyFixed.jsx";
import { loadMissingProduct, loadInvalidProduct } from "./request-loaders.js";
import { fetchProduct } from "../src/product-api.js";
import "../src/styles.css";

const cases = {
  race: <RequestControls Details={RaceBroken} />,
  "abort-only": <RequestControls Details={AbortOnly} />,
  finally: <RequestControls Details={FinallyBroken} />,
  "finally-answer": <RequestControls Details={FinallyFixed} />,
  answer: <RequestControls />,
  http: <RequestControls loadProduct={loadMissingProduct} />,
  invalid: <RequestControls loadProduct={loadInvalidProduct} />,
  network: <RequestControls loadProduct={fetchProduct} />,
};
const example = cases[new URLSearchParams(location.search).get("case")] ?? cases.answer;
createRoot(document.getElementById("root")).render(<StrictMode><h1>请求与竞态实验</h1>{example}</StrictMode>);
