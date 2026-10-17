export const categories = ["外设", "显示器", "配件", "音频"];

export function parseStock(text) {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const stock = Number(trimmed);
  return Number.isInteger(stock) && stock <= 99999 ? stock : null;
}

export function parsePriceCents(text) {
  const trimmed = text.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole + fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function formatPriceCents(cents) {
  return `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

export function toDraft(product) {
  return {
    name: product.name,
    category: product.category,
    stock: String(product.stock),
    price: formatPriceCents(product.priceCents),
    featured: product.tags.includes("热销"),
  };
}

export function validateDraft(draft, originalTags = []) {
  const name = draft.name.trim();
  const stock = parseStock(draft.stock);
  const priceCents = parsePriceCents(draft.price);
  const errors = {};
  if (name.length < 1 || name.length > 40) errors.name = "请输入 1–40 个字符的名称。";
  if (!categories.includes(draft.category)) errors.category = "请选择有效分类。";
  if (stock === null) errors.stock = "请输入 0–99999 的整数库存。";
  if (priceCents === null) errors.price = "请输入非负价格，最多两位小数，并保持整数分在安全范围内。";
  if (Object.keys(errors).length > 0) return { errors, value: null };
  const tags = draft.featured
    ? [...new Set([...originalTags, "热销"])]
    : originalTags.filter((tag) => tag !== "热销");
  return { errors, value: { name, category: draft.category, stock, priceCents, tags } };
}
