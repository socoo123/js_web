import { products } from "../shared/products.js";
import { toDraft, saveDraft } from "../inventory/07-ui5-react/src/editor-state.js";

const dock = products.find((product) => product.id === "P004");
const draft = toDraft(dock);
console.log(saveDraft(products, dock.id, { ...draft, stock: "" }).errors.stock);
console.log(saveDraft(products, dock.id, { ...draft, stock: "0" }).value.stock);
console.log(saveDraft(products, dock.id, { ...draft, price: "29.90" }).value.priceCents);
console.log(saveDraft(products, dock.id, { ...draft, featured: false }).value.tags.join("、"));
