import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Expressions from "./Expressions.jsx";
import StylePreview from "./StylePreview.jsx";
import ProductCardBroken from "./ProductCardBroken.jsx";
import ReturnBroken from "./ReturnBroken.jsx";
import ReturnFixed from "./ReturnFixed.jsx";
import "../src/styles.css";

const choice = new URLSearchParams(location.search).get("case");
const Preview = ({ name: ProductCardBroken, return: ReturnBroken, answer: ReturnFixed })[choice];
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <h1>JSX 实验</h1>
    {Preview ? <Preview /> : <><Expressions /><StylePreview /></>}
  </StrictMode>,
);
