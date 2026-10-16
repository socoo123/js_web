const id = "P001";
const product = {
  id,
  name: "机械键盘",
  category: "外设",
  stock: 12,
  priceCents: 39900,
  tags: ["热销"],
};
const field = "stock";
console.log(product.name, product[field]); // → 机械键盘 12
console.log(product.field);               // → undefined
product.note = undefined;
console.log(Object.hasOwn(product, "note"));    // → true
console.log(Object.hasOwn(product, "missing")); // → false
product.stock = 15;
delete product.note;
console.log(product.stock, Object.hasOwn(product, "note")); // → 15 false
