const original = { id: "P001", stock: 12, warehouse: { city: "上海" } };
const alias = original;
const draft = { ...original, stock: 15 };
console.log(alias === original, draft === original); // → true false
console.log(draft.warehouse === original.warehouse); // → true
alias.stock = 13;
draft.warehouse.city = "杭州";
console.log(original.stock, draft.stock, original.warehouse.city);
// → 13 15 杭州
