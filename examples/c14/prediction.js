const original = { id: "P002", stock: 0 };
const text = JSON.stringify({ version: 1, products: [original] });
const restored = JSON.parse(text);
restored.products[0].stock = 3;
console.log(original.stock, restored.products[0].stock);
console.log(restored.products[0] === original);
console.log(JSON.parse('{"version":1,"products":[]}').products.length);
