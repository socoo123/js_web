import { products } from "../shared/products.js";

const ids = ["P001", "P002", "P003", "P004", "P005", "P006"];
console.log(ids.length); // → 6
console.log(ids[0], ids[5]); // → P001 P006
console.log(ids[6]); // → undefined
ids[0] = "待复核";
console.log(ids[0], products[0].id); // → 待复核 P001
let totalStock = 0;
for (const product of products) totalStock += product.stock;
console.log(totalStock); // → 52
