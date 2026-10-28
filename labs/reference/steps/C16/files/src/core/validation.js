export const categories = ["外设", "显示器", "配件", "音频"];

// region stock-input
export function parseStock(text) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new RangeError("请输入库存，空白无效");
  }
  const stock = Number(text);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new RangeError("库存必须是 0–99999 的整数");
  }
  return stock;
}
// endregion stock-input

export function validateProduct(product) {
  const errors = {};
  if (!product || typeof product !== "object" || Array.isArray(product))
    return { product: "需要商品对象" };
  if (typeof product.id !== "string" || !/^P\d{3}$/.test(product.id))
    errors.id = "编号需要 P 加三位数字";
  if (typeof product.name !== "string"
      || product.name.trim().length < 1
      || product.name.trim().length > 40)
    errors.name = "名称需要 1–40 个字符";
  if (!categories.includes(product.category))
    errors.category = "分类无效";
  if (!Number.isInteger(product.stock) || product.stock < 0 || product.stock > 99999)
    errors.stock = "库存必须是 0–99999 的整数";
  if (!Number.isSafeInteger(product.priceCents) || product.priceCents < 0)
    errors.priceCents = "价格必须是非负安全整数分";
  if (!Array.isArray(product.tags)
      || [...product.tags].some((tag) => typeof tag !== "string"))
    errors.tags = "标签必须是字符串数组";
  return errors;
}
export function validateProducts(products) {
  if (!Array.isArray(products)) throw new TypeError("需要商品数组");
  const ids = new Set();
  for (const product of products) {
    const errors = validateProduct(product);
    if (Object.keys(errors).length) throw new TypeError(JSON.stringify(errors));
    if (ids.has(product.id)) throw new TypeError(`重复编号 ${product.id}`);
    ids.add(product.id);
  }
  return products;
}

// region draft
export function createDraft(product) {
  return { ...product, tags: [...product.tags] };
}
// endregion draft

// region import-products
export function importProducts(text) {
  const products = JSON.parse(text);
  validateProducts(products);
  return products.map((product) => ({
    id: product.id, name: product.name.trim(), category: product.category,
    stock: product.stock, priceCents: product.priceCents, tags: [...product.tags],
  }));
}
// endregion import-products
