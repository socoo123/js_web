import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents-icons/dist/add.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

await setLanguage("zh-CN");
await Promise.all(["ui5-button", "ui5-input", "ui5-card", "ui5-card-header"]
  .map((name) => customElements.whenDefined(name)));
