import { parseStock, parsePriceCents } from "../inventory/04-react/src/product-form.js";

console.log(parseStock(""));
console.log(parseStock("0"));
console.log(parseStock("3.5"));
console.log(parsePriceCents("0.29"));
