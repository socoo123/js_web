import { products } from "../shared/products.js";
import { rules, loadModule } from "./load-rules.js";
const visible = products.filter((product) => product.id === "P004");
console.log(visible[0].id, products.indexOf(visible[0])); // → P004 3
console.log(products.length, rules.summarize(visible).stock); // → 6 3
console.log(loadModule("formatter").money(29900)); // → 299.00
console.log(rules.summarize([]).valueCents); // → 0
