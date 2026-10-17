import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const afterRestock = productsReducer(products, { type: "restocked", id: "P002" });
const afterDelete = productsReducer(afterRestock, { type: "removed", id: "P001" });
console.log("原始鼠标", products[1].stock);
console.log("补货后鼠标", afterRestock[1].stock);
console.log("删除后种类", afterDelete.length);
console.log("删除后总库存", afterDelete.reduce((sum, product) => sum + product.stock, 0));
