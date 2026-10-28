import { validateProducts } from "./validation.js";
// region summary
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
// endregion summary
