// region reducer
import { createDraft, updateStock, restockProduct, validateProducts, summarize } from "../core/inventory.js";
export function inventoryReducer(products, action) {
  let next;
  switch (action?.type) {
    case "created": next = [...products, createDraft(action.product)]; break;
    case "saved":
      if (!products.some((product) => product.id === action.product.id)) throw new Error("商品不存在");
      next = products.map((product) => product.id === action.product.id ? createDraft(action.product) : product); break;
    case "deleted": next = products.filter((product) => product.id !== action.id); break;
    case "restocked": {
      const product = products.find((item) => item.id === action.id);
      if (!product) throw new Error("商品不存在");
      if (Number.isInteger(action.amount) && action.amount >= 0 && product.stock + action.amount > 99999) return products;
      next = updateStock(products, action.id, restockProduct(product, String(action.amount)).stock); break;
    }
    case "replaced": next = action.products.map(createDraft); break;
    default: throw new Error(`未知 action：${action?.type}`);
  }
  validateProducts(next); summarize(next);
  return next;
}
// endregion reducer
