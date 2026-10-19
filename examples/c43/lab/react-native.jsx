import "./components.js";
import "./style.css";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { parseAmount } from "./restock.js";

function NativeInput() {
  const [text, setText] = useState("3");
  return <>
    <ui5-input accessible-name="补货数量" value={text}
      onui5-input={(event) => setText(event.target.value)}></ui5-input>
    <ui5-button disabled={parseAmount(text) === null}>补货</ui5-button>
    <p role="status">当前输入：{text}</p>
  </>;
}

createRoot(document.querySelector("#root")).render(<NativeInput />);
