import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";

const mouse = products[1];
const draft = { ...toDraft(mouse), name: "  无线鼠标  ", stock: "3", price: "129.90", featured: true };
const { value } = validateDraft(draft, mouse.tags);
console.log(value.name, value.stock, value.priceCents, value.tags.join("、"));
console.log(typeof draft.stock, typeof value.stock);
console.log(mouse.stock, mouse.priceCents, mouse.tags.length);
