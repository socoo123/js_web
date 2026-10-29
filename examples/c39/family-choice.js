const product = { id: "P002", stock: 0 };
const field = { path: "stock", label: "库存数量" };
field.label = "可用库存";
console.log(`${field.label}：${product[field.path]}`);
