import { fetchProduct } from "../src/product-api.js";

export async function loadDelayedProduct(id, { signal } = {}) {
  const data = await fetchProduct(id, { signal });
  console.log("收到文件，开始处理", id);
  // 模拟不支持 signal 的后续处理；Network 中的文件此时已经接收完。
  await new Promise((resolve) => setTimeout(resolve, id === "P001" ? 1200 : 200));
  console.log("处理完成", id);
  return data;
}

export function loadMissingProduct(_id, { signal } = {}) {
  return fetchProduct("P999", { signal });
}

export async function loadInvalidProduct(id, { signal } = {}) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/invalid-product.txt`, { signal });
  const { readProductResponse } = await import("../src/read-product.js");
  return readProductResponse(response, id);
}
