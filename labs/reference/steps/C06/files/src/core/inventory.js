// C00 只提供一张可读的卡片；业务能力在课程中逐步加入。
export function describeProduct(product) {
  return `${product.id} ${product.name} · 库存 ${product.stock} 件`;
}

export function stockValue(product) {
  return product.stock * product.priceCents;
}

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

// region restock
export function initialStock(stock) {
  return stock ?? 12;
}

export function restockProduct(product, text) {
  const amount = parseStock(text);
  const stock = initialStock(product.stock);
  const nextStock = parseStock(String(stock + amount));
  return { ...product, stock: nextStock };
}
// endregion restock

// region total-stock
export function totalStock(products) {
  let total = 0;
  for (const product of products) {
    if (!Number.isInteger(product.stock)) throw new TypeError("库存必须是整数");
    total += product.stock;
  }
  return total;
}
// endregion total-stock

// region draft
export function createDraft(product) {
  return { ...product, tags: [...product.tags] };
}
// endregion draft

// region validate-product
export const categories = ["外设", "显示器", "配件", "音频"];
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
// endregion validate-product
// region validate-list
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
// endregion validate-list

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

// region category-filter
export function createCategoryFilter(category) {
  return (product) => product.category === category;
}
// endregion category-filter
// region counter
export function createCounter() {
  let count = 0;
  return () => ++count;
}
// endregion counter
// region selectors
export function createProductSelectors(products) {
  const selectors = [];
  for (const product of products) {
    selectors.push(() => product.id);
  }
  return selectors;
}
// endregion selectors
