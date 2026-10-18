import { products } from "../shared/products.js";
import { selectProduct } from "./select-product.js";

const row = { id: "P002", index: 0 };
const selected = selectProduct(products, row);
const changed = products.map((product) => product.id === selected.id
  ? { ...product, stock: 3 } : product);
console.log("编辑对象", selected.id, "原库存", selected.stock);
console.log("总库存", changed.reduce((sum, product) => sum + product.stock, 0));
console.log("库存总价值", changed.reduce((sum, product) =>
  sum + product.stock * product.priceCents, 0));
console.log("原数据库存", products.find((product) => product.id === "P002").stock);
console.log("不存在的编号", selectProduct(products, { id: "P999", index: 0 }));
