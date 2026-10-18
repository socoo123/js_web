import { products } from "../../../shared/products.js";
import { categories } from "./product-form.js";

export const INVENTORY_STORAGE_KEY = "js_web:inventory:products:v1";
export const freshProducts = () => structuredClone(products);

export function parseInventorySnapshot(raw) {
  const snapshot = JSON.parse(raw);
  if (snapshot?.version !== 1 || !Array.isArray(snapshot.products)) throw new Error("库存快照格式无效");
  const ids = new Set();
  const valid = snapshot.products.every((product) => {
    if (!product || typeof product.id !== "string" || !/^P\d{3}$/.test(product.id) || ids.has(product.id)) return false;
    ids.add(product.id);
    return typeof product.name === "string" && product.name === product.name.trim()
      && product.name.length >= 1 && product.name.length <= 40 && categories.includes(product.category)
      && Number.isInteger(product.stock) && product.stock >= 0 && product.stock <= 99999
      && Number.isSafeInteger(product.priceCents) && product.priceCents >= 0
      && Array.isArray(product.tags) && product.tags.every((tag) => typeof tag === "string");
  });
  if (!valid) throw new Error("库存商品字段无效");
  return snapshot.products.map(({ id, name, category, stock, priceCents, tags }) =>
    ({ id, name, category, stock, priceCents, tags: [...tags] }));
}

export function readInventorySnapshot(storage, key = INVENTORY_STORAGE_KEY) {
  const raw = storage?.getItem(key) ?? null;
  return raw === null ? freshProducts() : parseInventorySnapshot(raw);
}

export function initializeInventory(read = () => readInventorySnapshot(globalThis.localStorage)) {
  try { return { products: read(), message: "当前为本地库存；需要保留时请保存本地快照。" }; }
  catch { return { products: freshProducts(), message: "本地库存无法读取，已使用初始商品；原记录保留，可清除本地快照。" }; }
}

export function writeInventorySnapshot(storage, products) {
  const raw = JSON.stringify({ version: 1, products });
  parseInventorySnapshot(raw);
  storage.setItem(INVENTORY_STORAGE_KEY, raw);
}
