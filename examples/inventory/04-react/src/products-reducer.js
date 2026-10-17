import { categories } from "./product-form.js";
import { addSampleProduct, removeProduct, restockProduct, updateProduct } from "./product-state.js";

function checkedChanges(changes) {
  if (!changes || typeof changes.name !== "string" || changes.name.trim().length < 1 || changes.name.trim().length > 40
    || !categories.includes(changes.category) || !Number.isInteger(changes.stock) || changes.stock < 0 || changes.stock > 99999
    || !Number.isSafeInteger(changes.priceCents) || changes.priceCents < 0
    || !Array.isArray(changes.tags) || !changes.tags.every((tag) => typeof tag === "string")) {
    throw new TypeError("保存商品的数据无效");
  }
  return { name: changes.name.trim(), category: changes.category, stock: changes.stock,
    priceCents: changes.priceCents, tags: [...changes.tags] };
}

export function productsReducer(products, action) {
  const type = action?.type;
  if (["restocked", "removed", "saved"].includes(type)
    && (typeof action.id !== "string" || !/^P\d{3}$/.test(action.id))) {
    throw new TypeError("商品编号无效");
  }
  switch (type) {
    case "sampleAdded":
      return addSampleProduct(products);
    case "restocked":
      return restockProduct(products, action.id);
    case "removed":
      return removeProduct(products, action.id);
    case "saved":
      return updateProduct(products, action.id, checkedChanges(action.changes));
    default:
      throw new Error(`未知 action：${type}`);
  }
}
