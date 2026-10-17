import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";
import { updateProduct } from "../inventory/04-react/src/product-state.js";

const draft = { ...toDraft(products[1]), stock: "3", price: "129.90" };
console.log(products[1].stock, draft.stock); // → 0 3
const { value } = validateDraft(draft, products[1].tags);
const saved = updateProduct(products, "P002", value);
console.log(saved.reduce((sum, product) => sum + product.stock, 0)); // → 55
const cents = saved.reduce((sum, product) => sum + product.stock * product.priceCents, 0);
console.log((cents / 100).toFixed(2)); // → 26737.70
