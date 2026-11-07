// 生成物，只读。来源：labs/reference/core/{validation,summary,filters}.js。
// 改 labs/reference/core 后在仓库根运行 node scripts/build-server-rules.mjs 重新生成。
// 后端只 import 本文件，不 import 工作区 src/core：学员改自己的前端规则不会改变服务器行为。

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

export function summarize(products) {
  validateProducts(products);
  const summary = { count: 0, stock: 0, valueCents: 0, soldOut: 0, lowStock: 0 };
  for (const product of products) {
    summary.count++;
    summary.stock += product.stock;
    summary.valueCents += product.stock * product.priceCents;
    summary.soldOut += Number(product.stock === 0);
    summary.lowStock += Number(product.stock >= 1 && product.stock <= 5);
    if (!Number.isSafeInteger(summary.stock) || !Number.isSafeInteger(summary.valueCents)) {
      throw new RangeError("汇总超出安全整数范围");
    }
  }
  return summary;
}

export function selectProducts(products, { query = "", category = "全部" } = {}) {
  const keyword = query.trim().toLowerCase();
  return products.filter((product) =>
    (category === "全部" || product.category === category) &&
    (product.id.toLowerCase().includes(keyword) || product.name.toLowerCase().includes(keyword)));
}
