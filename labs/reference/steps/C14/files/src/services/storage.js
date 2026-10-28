// region snapshot
import { importProducts, summarize } from "../core/inventory.js";
export const storageKey = "js_web:inventory:vanilla:v2";
export function decodeSnapshot(text) {
  const snapshot = JSON.parse(text);
  if (snapshot?.version !== 1) throw new TypeError("快照版本需要 1");
  const products = importProducts(JSON.stringify(snapshot.products));
  summarize(products);
  return products;
}
export function encodeSnapshot(products) {
  const text = JSON.stringify({ version: 1, products });
  decodeSnapshot(text);
  return text;
}
// endregion snapshot

// region save
export function saveProducts(storage, products) {
  const text = encodeSnapshot(products);
  const previous = storage.getItem(storageKey);
  if (previous !== null) {
    try { decodeSnapshot(previous); storage.setItem(storageKey + ":backup", previous); }
    catch { storage.setItem(storageKey + ":damaged", previous); }
  }
  storage.setItem(storageKey, text);
}
export function readProducts(storage) {
  const text = storage.getItem(storageKey);
  return text === null ? null : decodeSnapshot(text);
}
// endregion save

// region recover
export function recoverProducts(storage) {
  const backup = storage.getItem(storageKey + ":backup");
  if (backup === null) throw new Error("没有有效备份，请导入已导出的快照");
  const products = decodeSnapshot(backup);
  const damaged = storage.getItem(storageKey);
  if (damaged !== null) storage.setItem(storageKey + ":damaged", damaged);
  storage.setItem(storageKey, backup);
  return products;
}
// endregion recover
