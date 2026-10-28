// region setup
import seed from "../../data/products.json" with { type: "json" };
import { describeProduct, stockValue, restockProduct } from "../core/inventory.js";

import * as inventory from "../core/inventory.js";
const products = structuredClone(seed);
window.inventory = inventory;
window.products = products;
let product = products[0];
// endregion setup
// region render
function render() {
  document.querySelector("#product").textContent = describeProduct(product);
  document.querySelector("#value").textContent = `库存价值 ${stockValue(product)} 分`;
}
// endregion render
// region events
document.querySelector("#restock-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    product = restockProduct(product, document.querySelector("#amount").value);
    products[0] = product;
    render();
    document.querySelector("#feedback").textContent = "已更新当前页面";
  } catch (error) {
    document.querySelector("#feedback").textContent = error.message;
  }
});
render();
// endregion events
