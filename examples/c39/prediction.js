import { products } from "../shared/products.js";

const mouse = structuredClone(products.find((product) => product.id === "P002"));
const path = "stock";
const field = { path, label: "库存数量" };
console.log(mouse[field.path]);
console.log(mouse.label);
field.label = "可用库存";
console.log(mouse.stock);
mouse.stock += 3;
console.log(`${field.label}：${mouse[field.path]}`);
