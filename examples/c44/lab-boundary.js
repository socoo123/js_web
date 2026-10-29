import { products } from "../shared/products.js";
import { toDraft, parseDraft, summarize, updateStock } from "../../labs/reference/core/inventory.js";

const dock = products.find((product) => product.id === "P004");
const draft = { ...toDraft(dock), stock: "8" };
const parsed = parseDraft(draft);
const next = updateStock(products, dock.id, parsed.value.stock);
console.log(typeof draft.stock, typeof parsed.value.stock);
console.log(dock.stock, next.find((product) => product.id === "P004").stock);
console.log(summarize(products).stock, summarize(next).stock);
console.log(parseDraft({ ...draft, stock: "" }).hasErrors, parseDraft({ ...draft, stock: "0" }).value.stock);
