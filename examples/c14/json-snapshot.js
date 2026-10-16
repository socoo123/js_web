const product = { id: "P002", name: "无线鼠标", stock: 0 };
const text = JSON.stringify({ version: 1, products: [product] });
console.log(typeof text);
const snapshot = JSON.parse(text);
console.log(snapshot.version, snapshot.products[0].stock);
console.log(snapshot.products[0] === product);
snapshot.products[0].stock = 3;
console.log(product.stock, snapshot.products[0].stock);
