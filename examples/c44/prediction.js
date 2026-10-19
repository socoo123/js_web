import { products } from "../shared/products.js";
import { toDraft, saveDraft, summarize } from "../inventory/07-ui5-react/src/editor-state.js";

const mouse = products.find((product) => product.id === "P002");
const draft = { ...toDraft(mouse), stock: "3" };
const result = saveDraft(products, mouse.id, draft);
console.log(typeof draft.stock, typeof result.value.stock);
console.log(mouse.stock, result.products.find((product) => product.id === "P002").stock);
console.log(result.products === products, result.products[0] === products[0]);
console.log(summarize(result.products));
