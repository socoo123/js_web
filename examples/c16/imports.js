import money, { currency as unit } from "./format.js";
import { products } from "../shared/products.js";

console.log(unit, money(products[0].priceCents)); // → CNY ¥399.00
console.log(products.length); // → 6
