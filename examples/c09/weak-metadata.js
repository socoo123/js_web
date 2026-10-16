const reasons = new WeakMap();
const checked = new WeakSet();
function checkOnce(product) {
  if (checked.has(product)) return reasons.get(product);
  const reason = product.stock === 0 ? "待补货" : "有货";
  reasons.set(product, reason);
  checked.add(product);
  return reason;
}
const mouse = { id: "P002", stock: 0 };
console.log(checkOnce(mouse)); // → 待补货
console.log(checkOnce(mouse)); // → 待补货
console.log(checked.has({ ...mouse })); // → false
console.log(checked.has(mouse)); // → true
