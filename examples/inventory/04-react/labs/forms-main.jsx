import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ControlledName from "./ControlledName.jsx";
import LockedNameBroken from "./LockedNameBroken.jsx";
import UncontrolledForm from "./UncontrolledForm.jsx";
import NativeForm from "./NativeForm.jsx";
import BlankStockBroken from "./BlankStockBroken.jsx";
import BlankStockFixed from "./BlankStockFixed.jsx";
import "../src/styles.css";

const cases = {
  controlled: ControlledName, locked: LockedNameBroken,
  uncontrolled: UncontrolledForm, native: NativeForm,
  blank: BlankStockBroken, "blank-answer": BlankStockFixed,
};
const Example = cases[new URLSearchParams(location.search).get("case")] ?? ControlledName;
createRoot(document.getElementById("root")).render(<StrictMode><h1>表单与校验实验</h1><Example /></StrictMode>);
