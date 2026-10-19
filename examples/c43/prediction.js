import { products } from "../shared/products.js";
import { parseAmount, restock } from "./lab/restock.js";

const mouse = products.find((product) => product.id === "P002");
console.log(typeof "3", parseAmount("3"));
console.log(mouse.stock, restock(mouse, "3").stock);
console.log(parseAmount(""), parseAmount("3件"));
console.log(Boolean("false"), Boolean(false));
