import { products } from "../shared/products.js";
import { toDraft } from "../inventory/04-react/src/product-form.js";

const drafts = new Map();
drafts.set("P001", { ...toDraft(products[0]), name: "键盘待盘点" });
console.log(drafts.get("P001").name);
console.log((drafts.get("P002") ?? toDraft(products[1])).name);
drafts.delete("P001");
console.log((drafts.get("P001") ?? toDraft(products[0])).name);
