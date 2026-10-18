export function readStoredText(storage, key, initialValue) {
  const raw = storage.getItem(key);
  if (raw === null) return initialValue;
  const value = JSON.parse(raw);
  if (typeof value !== "string") throw new Error("记录应为文本");
  return value;
}
