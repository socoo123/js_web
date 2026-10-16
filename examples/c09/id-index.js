import { products } from "../shared/products.js";

const byId = new Map(products.map(product => [product.id, product]));
console.log(byId.size); // → 6
console.log(byId.get("P004").name); // → USB-C 扩展坞
console.log(byId.get("P999")); // → undefined
console.log(byId.get("P001") === products[0]); // → true
console.log(JSON.stringify(byId)); // → {}
console.log(JSON.parse(JSON.stringify([...byId])).length); // → 6
