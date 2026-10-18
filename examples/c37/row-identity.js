import { products } from "../shared/products.js";
import { selectProduct } from "./select-product.js";
import { selectProduct as selectBroken } from "./select-product-broken.js";

const visible = products.toSorted((a, b) => a.stock - b.stock);
const row = { id: visible[0].id, index: 0 };
console.log("显示首行", row.id);
console.log("按位置编辑", selectBroken(products, row).id);
console.log("按编号编辑", selectProduct(products, row).id);
console.log("原数组首行", products[0].id);
