import { parseStock } from "../inventory/04-react/src/product-form.js";

const rawStock = "";
console.log(typeof rawStock, Number(rawStock)); // → string 0
console.log(parseStock(rawStock)); // → null
console.log(parseStock("0")); // → 0
console.log(parseStock("3.5")); // → null
console.log(parseStock("100000")); // → null
