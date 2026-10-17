import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MutationBroken from "./MutationBroken.jsx";
import MutationFixed from "./MutationFixed.jsx";
import IndexKeysBroken from "./IndexKeysBroken.jsx";
import StableKeys from "./StableKeys.jsx";
import DerivedBroken from "./DerivedBroken.jsx";
import DerivedFixed from "./DerivedFixed.jsx";
import "../src/styles.css";

const cases = {
  mutation: MutationBroken, "mutation-answer": MutationFixed,
  keys: IndexKeysBroken, "keys-answer": StableKeys,
  derived: DerivedBroken, "derived-answer": DerivedFixed,
};
const Example = cases[new URLSearchParams(location.search).get("case")] ?? IndexKeysBroken;
createRoot(document.getElementById("root")).render(<StrictMode><h1>数组与列表身份实验</h1><Example /></StrictMode>);
