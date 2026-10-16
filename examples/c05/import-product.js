function importProduct(text) {
  const raw = JSON.parse(text);
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new TypeError("商品必须是对象");
  }
  if (typeof raw.id !== "string" || typeof raw.name !== "string") {
    throw new TypeError("编号和名称必须是字符串");
  }
  const id = raw.id.trim().toUpperCase();
  const name = raw.name.trim();
  if (!/^P\d{3}$/.test(id) || name.length < 1 || name.length > 40) {
    throw new RangeError("编号或名称格式错误");
  }
  if (!Number.isInteger(raw.stock) || raw.stock < 0 || raw.stock > 99999) {
    throw new RangeError("库存必须是 0–99999 的整数");
  }
  if (!Number.isSafeInteger(raw.priceCents) || raw.priceCents < 0) {
    throw new RangeError("价格分必须是非负安全整数");
  }
  return { id, name, stock: raw.stock, priceCents: raw.priceCents };
}
const text = '{"id":" p001 ","name":" 机械键盘 ","stock":12,"priceCents":39900,"debug":true}';
const imported = importProduct(text);
console.log(JSON.stringify(imported));
console.log(Object.hasOwn(imported, "debug")); // → false
