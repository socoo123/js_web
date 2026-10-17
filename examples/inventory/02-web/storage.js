import { validateProducts } from "./validation.js";

export const STORAGE_KEY = "js_web:inventory:v1";

export function encodeSnapshot(rows) {
  return JSON.stringify({ version: 1, products: validateProducts(rows) }, null, 2);
}

export function decodeSnapshot(text) {
  const snapshot = JSON.parse(text);
  if (snapshot?.version !== 1) throw new Error("备份版本应为 1");
  return validateProducts(snapshot.products);
}

export function readSavedProducts(storage = globalThis.localStorage) {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null ? null : decodeSnapshot(raw);
}

export function saveProducts(rows, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, encodeSnapshot(rows));
}
