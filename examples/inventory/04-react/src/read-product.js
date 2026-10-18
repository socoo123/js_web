export async function readProductResponse(response, productId) {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const product = await response.json();
  if (product?.id !== productId || typeof product.name !== "string"
    || product.name.trim().length < 1 || product.name.trim().length > 40
    || !["外设", "显示器", "配件", "音频"].includes(product.category)
    || !Number.isInteger(product.stock) || product.stock < 0 || product.stock > 99999
    || !Number.isSafeInteger(product.priceCents) || product.priceCents < 0
    || !Array.isArray(product.tags) || !product.tags.every((tag) => typeof tag === "string")) {
    throw new Error("商品数据格式不正确");
  }
  return product;
}
