const product = { id: "P001", stock: 12 };
const history = [];
history.push({ id: product.id, stock: product.stock });
product.stock += 3;
console.log(product.stock); // → 15

const previous = history.pop();
if (previous !== undefined) product.stock = previous.stock;
console.log(product.stock, history.length); // → 12 0
console.log(history.pop()); // → undefined
