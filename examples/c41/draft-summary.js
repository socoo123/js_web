import { products } from "../shared/products.js";
import { rules } from "./load-rules.js";
const draft = rules.toDraft(products[1]);
draft.stock = "3";
console.log(products[1].stock, draft.stock); // → 0 3
const result = rules.parseDraft(draft);
const saved = products.map((product) => product.id === draft.id
  ? { ...product, ...result.value } : product);
console.log(rules.summarize(products).stock); // → 52
console.log(rules.summarize(saved).stock); // → 55
console.log(rules.summarize(saved).valueCents); // → 2673500
