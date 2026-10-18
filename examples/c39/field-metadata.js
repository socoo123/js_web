import { products } from "../shared/products.js";

// 本地展示配置，用来说明“描述字段”和“字段的值”是两件事。
const stockField = { path: "stock", label: "库存数量", unit: "件" };
const mouse = products.find((product) => product.id === "P002");
console.log(stockField.label);
console.log(mouse[stockField.path]);
console.log(`${stockField.label}：${mouse[stockField.path]} ${stockField.unit}`);
console.log(typeof mouse[stockField.path]);
