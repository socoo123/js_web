import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const actions = [
  { type: "restokced", id: "P002" },
  { type: "restocked" },
  { type: "saved", id: "P002", changes: { ...products[1], stock: "3" } },
];
for (const action of actions) {
  try {
    productsReducer(products, action);
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  }
}
console.log("鼠标仍为", products[1].stock);
