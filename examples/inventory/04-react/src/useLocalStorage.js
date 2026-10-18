import { useState } from "react";
import { readStoredText } from "./storage-text.js";

export function useLocalStorage(key, initialValue) {
  const [record, setRecord] = useState(() => {
    try { return { value: readStoredText(localStorage, key, initialValue), error: "" }; }
    catch { return { value: initialValue, error: "本地记录无法读取，正在使用默认文本。" }; }
  });
  function save(value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setRecord({ value, error: "" });
    } catch {
      setRecord({ value, error: "本地记录保存失败，当前文本只保留在页面中。" });
    }
  }
  return [record.value, save, record.error];
}
