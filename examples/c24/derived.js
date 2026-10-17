import { products } from "../shared/products.js";
import { restockProduct, selectProducts } from "../inventory/04-react/src/product-state.js";

const after = restockProduct(products, "P002");
const visible = selectProducts(after, { query: "鼠标", order: "stock" });
console.log(visible.map((product) => `${product.id}:${product.stock}`).join()); // → P002:1
console.log(after.reduce((sum, product) => sum + product.stock, 0)); // → 53
console.log(products.map((product) => product.id).join()); // → P001,P002,P003,P004,P005,P006
