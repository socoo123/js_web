// region delay
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("已取消", "AbortError")); return; }
    const abort = () => { clearTimeout(timer); reject(new DOMException("已取消", "AbortError")); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
// endregion delay
// region fetch-product
import { importProducts } from "../core/inventory.js";
export async function getProduct(id, { signal, fail = false, delay = id === "P001" ? 300 : 30 } = {}) {
  const response = await fetch(`${import.meta.env.BASE_URL}products.json?product=${encodeURIComponent(id)}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const products = importProducts(await response.text());
  await wait(delay, signal);
  if (fail) throw new Error("模拟读取失败");
  const product = products.find((item) => item.id === id);
  if (!product) throw new Error(`HTTP 404：商品 ${id} 不存在`);
  return product;
}
// endregion fetch-product
