import { readProductResponse } from "./read-product.js";

export async function fetchProduct(productId, { signal } = {}) {
  const url = `${import.meta.env.BASE_URL}data/products/${encodeURIComponent(productId)}.json`;
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  return readProductResponse(response, productId);
}
