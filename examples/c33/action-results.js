import { products } from "../shared/products.js";
import { createRestockAction, initialRestockResult } from "../inventory/04-react/src/restock-action.js";

const product = products[0];
const formData = new FormData();
formData.set("productId", product.id);
const action = createRestockAction({
  product,
  showOptimistic: (stock) => console.log("预览", stock),
  saveProduct: async () => ({ ...product, stock: 13 }),
});
console.log((await action(initialRestockResult, formData)).message);
const failed = createRestockAction({
  product,
  showOptimistic: (stock) => console.log("预览", stock),
  saveProduct: async () => { throw new Error("模拟保存失败"); },
});
console.log((await failed(initialRestockResult, formData)).message);
console.log("来源库存", product.stock);
