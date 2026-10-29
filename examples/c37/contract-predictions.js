import { products } from "../shared/products.js";
import { selectProduct } from "../../labs/reference/steps/C37/files/adapters/antd/select-product.js";
const visible = products.toSorted((a, b) => a.stock - b.stock);
console.log("排序后选择", selectProduct(products, { id: visible[0].id, index: 0 }).id);
console.log("原数组首行", products[0].id);
console.log("文本价格", ["1599.00", "199.00"].toSorted().join(","));
console.log("整数分", [159900, 19900].toSorted((a, b) => a - b).join(","));
