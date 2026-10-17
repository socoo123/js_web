export function validateProducts(rows) {
  if (!Array.isArray(rows)) throw new Error("商品数据应为数组");
  const ids = new Set();
  const categories = ["外设", "显示器", "配件", "音频"];
  return rows.map(row => {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw new Error("每件商品应为对象");
    }
    if (typeof row.id !== "string" || !/^P\d{3}$/.test(row.id) || ids.has(row.id)) {
      throw new Error("商品 id 格式错误或重复");
    }
    ids.add(row.id);
    if (typeof row.name !== "string" || row.name.trim().length < 1 || row.name.trim().length > 40) {
      throw new Error("商品名称应为 1–40 个字符");
    }
    if (!categories.includes(row.category)) throw new Error("商品分类无效");
    if (!Number.isInteger(row.stock) || row.stock < 0 || row.stock > 99999) {
      throw new Error("库存应为 0–99999 的整数");
    }
    if (!Number.isSafeInteger(row.priceCents) || row.priceCents < 0) {
      throw new Error("价格分应为非负安全整数");
    }
    if (!Array.isArray(row.tags) || !row.tags.every(tag => typeof tag === "string")) {
      throw new Error("标签应为字符串数组");
    }
    return { id: row.id, name: row.name.trim(), category: row.category,
      stock: row.stock, priceCents: row.priceCents, tags: [...row.tags] };
  });
}

export function parseStock(text) {
  if (text.trim() === "") return null;
  const stock = Number(text);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) return null;
  return stock;
}
