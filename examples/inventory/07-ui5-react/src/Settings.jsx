import { useState } from "react";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

export function Settings() {
  const [theme, setCurrentTheme] = useState("sap_horizon");
  const [language, setCurrentLanguage] = useState("zh-CN");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function configure(kind, value) {
    setBusy(true);
    setError("");
    try {
      if (kind === "theme") { await setTheme(value); setCurrentTheme(value); }
      else { await setLanguage(value); setCurrentLanguage(value); }
    } catch { setError("资源加载失败，请检查 Network 后重试。"); }
    finally { setBusy(false); }
  }
  return (
    <div className="settings">
      <label>组件主题 <select aria-label="组件主题" value={theme} disabled={busy}
        onChange={(event) => configure("theme", event.target.value)}>
        <option value="sap_horizon">Horizon 浅色</option><option value="sap_horizon_dark">Horizon 深色</option>
      </select></label>
      <label>组件语言 <select aria-label="组件语言" value={language} disabled={busy}
        onChange={(event) => configure("language", event.target.value)}>
        <option value="zh-CN">中文</option><option value="en">English</option>
      </select></label>
      <span id="settings">{busy ? "加载设置…" : `${theme} · 组件语言 ${language}`}</span>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
