const demoKey = "js_web:c14:demo:v1";
localStorage.removeItem(demoKey);
console.log(localStorage.getItem(demoKey)); // → null
localStorage.setItem(demoKey, 0);
const stored = localStorage.getItem(demoKey);
console.log(stored, typeof stored); // → 0 string

localStorage.setItem(demoKey, JSON.stringify({ id: "P002", stock: 0 }));
const product = JSON.parse(localStorage.getItem(demoKey));
product.stock = 3;
console.log(product.stock); // → 3
console.log(JSON.parse(localStorage.getItem(demoKey)).stock); // → 0
localStorage.removeItem(demoKey);
