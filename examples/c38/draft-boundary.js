import { products } from "../shared/products.js";
import { toDraft, validateDraft } from "../inventory/04-react/src/product-form.js";
const mouse = products.find((product) => product.id === "P002");
const draft = { ...toDraft(mouse), stock: "3", price: "129.00" };
console.log("表单草稿", draft.stock, typeof draft.stock);
console.log("尚未保存", mouse.stock);
const { value } = validateDraft(draft, mouse.tags);
console.log("保存数据", value.stock, typeof value.stock, value.priceCents);
console.log("原对象", mouse.stock);
