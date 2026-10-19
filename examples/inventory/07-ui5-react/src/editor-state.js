import { toDraft, validateDraft } from "../../04-react/src/product-form.js";
export { toDraft, validateDraft };

export function saveDraft(products, id, draft) {
  const original = products.find((product) => product.id === id);
  if (!original) throw new Error("商品已不存在，请重新选择。");
  const result = validateDraft(draft, original.tags);
  return {
    ...result,
    products: result.value
      ? products.map((product) => product.id === id ? { ...product, ...result.value } : product)
      : products,
  };
}

export function summarize(products) {
  const stock = products.reduce((sum, product) => sum + product.stock, 0);
  const cents = products.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
  return `总库存 ${stock} · 库存价值 ${(cents / 100).toFixed(2)} 元`;
}
