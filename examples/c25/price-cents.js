import { parsePriceCents } from "../inventory/04-react/src/product-form.js";

console.log(0.29 * 100); // → 28.999999999999996
console.log(parsePriceCents("0.29")); // → 29
console.log(parsePriceCents("129.9")); // → 12990
console.log(parsePriceCents("129.999")); // → null
console.log(parsePriceCents("3元")); // → null
console.log(parsePriceCents("")); // → null
