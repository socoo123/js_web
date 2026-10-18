import { validateDraft } from "../../04-react/src/product-form.js";

export const emptyProduct = { name: "", category: "配件", stock: 0, priceCents: 0, tags: [] };

export function fieldRule(field, originalTags = []) {
  return {
    validator(_rule, value) {
      const baseline = { name: "新商品", category: "配件", stock: "0", price: "0.00", featured: false };
      const { errors } = validateDraft({ ...baseline, [field]: value ?? "" }, originalTags);
      return errors[field] ? Promise.reject(new Error(errors[field])) : Promise.resolve();
    },
  };
}

export function commitDraft(products, id, draft) {
  const original = id === null ? emptyProduct : products.find((product) => product.id === id);
  if (!original) throw new Error("商品已不存在，请取消后重新选择。");
  return validateDraft(draft, original.tags);
}
