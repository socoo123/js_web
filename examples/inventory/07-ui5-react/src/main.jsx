import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import "@ui5/webcomponents-react/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/save.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { App } from "./App.jsx";
import "./styles.css";

await setLanguage("zh-CN");
createRoot(document.getElementById("root")).render(
  <StrictMode><ThemeProvider><App /></ThemeProvider></StrictMode>,
);
