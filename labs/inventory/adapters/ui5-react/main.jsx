// region react-adapter-bootstrap
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import "@ui5/webcomponents-base/dist/FontFace.css";
import "@ui5/webcomponents-react/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/save.js";
import App from "./App.jsx";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <StrictMode><ThemeProvider><App /></ThemeProvider></StrictMode>,
);
// endregion react-adapter-bootstrap
