import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";

const invalid = { ...toDraft(products[1]), name: "   ", stock: "-1", price: "129.999" };
const result = validateDraft(invalid);
console.log(Object.keys(result.errors).join(",")); // → name,stock,price
console.log(result.value); // → null
console.log(products[1].stock, products[1].priceCents); // → 0 12900
