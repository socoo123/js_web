// region load
import { importProducts } from "../core/inventory.js";
export async function loadProducts({ url = "./products.json", signal } = {}) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return importProducts(text);
}
// endregion load
