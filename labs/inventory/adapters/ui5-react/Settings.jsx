import React, { useState } from "react";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

export default function Settings() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function configure(action, value) {
    setBusy(true); setError("");
    try { await action(value); }
    catch (failure) { setError(`资源加载失败：${failure.message}`); }
    finally { setBusy(false); }
  }
  return <aside aria-label="显示设置" className="settings">
    <label>主题 <select aria-label="主题" disabled={busy} defaultValue="sap_horizon"
      onChange={(event) => configure(setTheme, event.target.value)}>
      <option value="sap_horizon">Horizon 浅色</option>
      <option value="sap_horizon_dark">Horizon 深色</option>
    </select></label>
    <label>组件语言 <select aria-label="组件语言" disabled={busy} defaultValue="zh-CN"
      onChange={(event) => configure(setLanguage, event.target.value)}>
      <option value="zh-CN">中文</option><option value="en">English</option>
    </select></label>
    {error && <p role="alert">{error}</p>}
  </aside>;
}
