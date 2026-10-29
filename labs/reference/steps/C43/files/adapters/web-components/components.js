// region components-imports
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-base/dist/FontFace.css";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Button.js";
import { setLanguage, getLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { setTheme, getTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

await Promise.all(["ui5-input", "ui5-button"].map((name) => customElements.whenDefined(name)));
// endregion components-imports
// region components-settings
const theme = document.querySelector("#theme");
const language = document.querySelector("#language");
const settings = document.querySelector("#settings");
function describeSettings() {
  settings.textContent = `组件主题 ${getTheme()} · 组件语言 ${getLanguage()}`;
}
async function configure(control, apply) {
  theme.disabled = language.disabled = true;
  try { await apply(control.value); describeSettings(); }
  catch (error) { settings.textContent = `资源切换失败：${error.message}`; }
  finally { theme.disabled = language.disabled = false; }
}
theme.addEventListener("change", () => configure(theme, setTheme));
language.addEventListener("change", () => configure(language, setLanguage));
describeSettings();
// endregion components-settings
